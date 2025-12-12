<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use App\Models\LessonContent;
use App\Models\QuizAttempt;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecapController extends Controller
{
    // 1. AMBIL DATA REKAP LENGKAP (Matrix)
    public function index($courseId)
    {
        $course = Course::where('id', $courseId)
            ->where('teacher_id', Auth::id())
            ->with('classroom')
            ->firstOrFail();

        // A. AMBIL SISWA
        $students = User::whereHas('studentEnrollment', function($q) use ($course) {
            $q->where('classroom_id', $course->classroom_id)->where('is_active', true);
        })->orderBy('name', 'asc')->get();

        // B. DATA ABSENSI
        // Ambil semua sesi
        $sessions = AttendanceSession::where('course_id', $courseId)
            ->orderBy('opened_at', 'asc')
            ->get(['id', 'title', 'opened_at']);

        // Ambil log kehadiran
        $attendances = Attendance::whereIn('attendance_session_id', $sessions->pluck('id'))
            ->get()
            ->groupBy('user_id');

        // C. DATA NILAI (Tugas & Kuis)
        // Ambil semua item penilaian
        $gradeItems = LessonContent::query()
            ->join('lessons', 'lesson_contents.lesson_id', '=', 'lessons.id')
            ->join('chapters', 'lessons.chapter_id', '=', 'chapters.id')
            ->where('chapters.course_id', $courseId)
            ->whereIn('lesson_contents.type', ['quiz', 'assignment'])
            ->select(
                'lesson_contents.id', 
                'lesson_contents.type', 
                'lesson_contents.content',
                'lessons.title as lesson_title'
            )
            ->orderBy('chapters.order')
            ->orderBy('lessons.order')
            ->get()
            ->map(function($item) {
                // Beri nama yang jelas
                $title = $item->type === 'quiz' 
                    ? ($item->content['quiz_title'] ?? 'Kuis') 
                    : ($item->lesson_title . ' (Tugas)');
                
                return [
                    'id' => $item->id,
                    'title' => $title,
                    'type' => $item->type,
                    'quiz_id' => $item->content['quiz_id'] ?? null
                ];
            });

        // Ambil Nilai Kuis
        $quizAttempts = QuizAttempt::whereIn('quiz_id', $gradeItems->pluck('quiz_id')->filter())
            ->get()
            ->groupBy('user_id');

        // Ambil Nilai Tugas
        $submissions = AssignmentSubmission::whereIn('lesson_content_id', $gradeItems->pluck('id'))
            ->whereNotNull('score') // Hanya yang sudah dinilai
            ->get()
            ->groupBy('user_id');


        // D. RAKIT MATRIX DATA SISWA
        $studentMatrix = $students->map(function($student) use ($sessions, $attendances, $gradeItems, $quizAttempts, $submissions) {
            
            // 1. Proses Absensi per Siswa
            $studentAtt = $attendances->get($student->id) ?? collect([]);
            $attendanceRow = $sessions->map(function($session) use ($studentAtt) {
                $record = $studentAtt->firstWhere('attendance_session_id', $session->id);
                return $record ? $record->status : '-'; // Default '-' jika belum ada data
            });

            // Hitung Statistik Absen
            $totalSesi = $sessions->count();
            $hadir = $studentAtt->where('status', 'H')->count();
            $attendancePercentage = $totalSesi > 0 ? round(($hadir / $totalSesi) * 100) : 0;


            // 2. Proses Nilai per Siswa
            $gradesRow = $gradeItems->map(function($item) use ($student, $quizAttempts, $submissions) {
                $score = null;
                
                if ($item['type'] === 'quiz' && $item['quiz_id']) {
                    // Ambil nilai tertinggi jika attempt > 1 (opsional logic)
                    $attempts = $quizAttempts->get($student->id);
                    $record = $attempts ? $attempts->where('quiz_id', $item['quiz_id'])->sortByDesc('score')->first() : null;
                    $score = $record ? $record->score : null;
                } 
                elseif ($item['type'] === 'assignment') {
                    $subs = $submissions->get($student->id);
                    $record = $subs ? $subs->firstWhere('lesson_content_id', $item['id']) : null;
                    $score = $record ? $record->score : null;
                }

                return $score;
            });

            // Hitung Rata-rata Nilai
            $collectedScores = $gradesRow->filter(fn($v) => !is_null($v));
            $averageScore = $collectedScores->count() > 0 ? round($collectedScores->avg(), 1) : 0;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'attendance_row' => $attendanceRow, // Array Status [H, H, S, A...]
                'attendance_percent' => $attendancePercentage,
                'grades_row' => $gradesRow, // Array Nilai [80, 90, null, 75...]
                'average_score' => $averageScore
            ];
        });

        return response()->json([
            'classroom' => $course->classroom->name,
            'subject' => $course->subject->name,
            'sessions_header' => $sessions,   // Header Kolom Absen
            'grades_header' => $gradeItems,   // Header Kolom Nilai
            'students' => $studentMatrix      // Baris Data
        ]);
    }

    // 2. EXPORT KE EXCEL (CSV) - VERSI RAPI (TANPA JARAK)
    public function export($courseId)
    {
        $responseData = $this->index($courseId)->getData(true);
        
        $subjectName = preg_replace('/[^A-Za-z0-9\-]/', '_', $responseData['subject']);
        $fileName = 'Rekap_' . $subjectName . '_' . date('Y-m-d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($responseData) {
            $file = fopen('php://output', 'w');
            
            // BOM untuk UTF-8 Excel
            fputs($file, "\xEF\xBB\xBF"); 

            // 1. HEADER DOKUMEN
            fputcsv($file, ['LAPORAN REKAPITULASI KELAS']);
            fputcsv($file, [
                'Kelas: ' . $responseData['classroom'], 
                'Mata Pelajaran: ' . $responseData['subject'],
                'Tanggal Export: ' . date('d M Y')
            ]);
            fputcsv($file, []); // Spasi baris

            // 2. HEADER TABEL
            $headerRow = [
                'No', 
                'Nama Siswa', 
                'NISN',
                'Total Hadir (%)',
            ];

            // Tambah Kolom Sesi (P1, P2...)
            foreach($responseData['sessions_header'] as $sess) {
                $date = date('d/m', strtotime($sess['opened_at']));
                $headerRow[] = $sess['title'] . " ($date)";
            }

            // [PERBAIKAN] Hapus kode pemisah ($headerRow[] = '';) agar menyambung
            
            // Tambah Kolom Nilai
            $headerRow[] = 'Rata-rata Nilai';

            // Tambah Kolom Tugas/Kuis
            foreach($responseData['grades_header'] as $item) {
                $headerRow[] = $item['title'];
            }

            fputcsv($file, $headerRow);

            // 3. BARIS DATA SISWA
            foreach ($responseData['students'] as $idx => $student) {
                $row = [
                    $idx + 1,
                    $student['name'],
                    "'" . $student['nisn'], // Tanda kutip agar format teks
                    $student['attendance_percent'] . '%',
                ];

                // Isi Absen
                foreach ($student['attendance_row'] as $status) {
                    $row[] = $status;
                }

                // [PERBAIKAN] Hapus kode pemisah ($row[] = '';)

                // Isi Rata-rata
                $row[] = $student['average_score'];

                // Isi Rincian Nilai
                foreach ($student['grades_row'] as $score) {
                    $row[] = $score === null ? '-' : $score;
                }

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}