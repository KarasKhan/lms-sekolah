<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // Import Carbon untuk tanggal

class AttendanceController extends Controller
{
    // 1. LIST SESI ABSENSI
    public function index($courseId)
    {
        $sessions = AttendanceSession::where('course_id', $courseId)
            ->withCount(['attendances as hadir_count' => function($q) {
                $q->where('status', 'H');
            }])
            ->withCount(['attendances as total_students'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($sessions);
    }

    // 2. BUAT SESI BARU (OPEN ABSEN) - VERSI PERBAIKAN
    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string',
            'duration_minutes' => 'required|integer|min:5'
        ]);

        return DB::transaction(function () use ($request) {
            $course = Course::findOrFail($request->course_id);

            // Hitung waktu tutup
            $closedAt = Carbon::now()->addMinutes((int)$request->duration_minutes);

            // A. Buat Sesi
            $session = AttendanceSession::create([
                'course_id' => $request->course_id,
                'title' => $request->title,
                'token' => Str::upper(Str::random(6)), 
                'opened_at' => Carbon::now(),
                'closed_at' => $closedAt,
                'is_active' => true
            ]);

            // B. Populate Siswa (Default Alpha)
            $students = User::whereHas('studentEnrollment', function($q) use ($course) {
                $q->where('classroom_id', $course->classroom_id)->where('is_active', true);
            })->get();

            $attendanceData = [];
            $now = Carbon::now();

            foreach ($students as $student) {
                $attendanceData[] = [
                    'attendance_session_id' => $session->id,
                    'user_id' => $student->id,
                    'status' => 'A', // Default Alpha
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Cek jika ada siswa, baru insert
            if (count($attendanceData) > 0) {
                Attendance::insert($attendanceData);
            }

            return response()->json([
                'message' => 'Sesi absensi dibuka!',
                'session' => $session
            ]);
        });
    }

    // 3. DETAIL SESI
    public function show($sessionId)
    {
        $session = AttendanceSession::findOrFail($sessionId);
        
        $attendances = Attendance::where('attendance_session_id', $sessionId)
            ->with('user:id,name,nisn')
            ->get()
            ->map(function($att) {
                return [
                    'id' => $att->id,
                    'student_name' => $att->user->name ?? 'Siswa Terhapus',
                    'student_nisn' => $att->user->nisn ?? '-',
                    'status' => $att->status,
                    'check_in_at' => $att->check_in_at ? Carbon::parse($att->check_in_at)->format('H:i:s') : '-',
                    'notes' => $att->notes
                ];
            });

        return response()->json([
            'session' => $session,
            'students' => $attendances
        ]);
    }

    // 4. UPDATE STATUS MANUAL
    public function updateStatus(Request $request, $attendanceId)
    {
        $request->validate([
            'status' => 'required|in:H,I,S,A,T'
        ]);

        $attendance = Attendance::findOrFail($attendanceId);
        $attendance->update([
            'status' => $request->status,
            'notes' => 'Diubah oleh Guru'
        ]);

        return response()->json(['message' => 'Status berhasil diubah']);
    }

    // 5. TUTUP SESI
    public function close($sessionId)
    {
        $session = AttendanceSession::findOrFail($sessionId);
        $session->update([
            'is_active' => false,
            'closed_at' => Carbon::now()
        ]);

        return response()->json(['message' => 'Sesi absensi ditutup']);
    }
    
    // 6. HAPUS SESI
    public function destroy($sessionId)
    {
        $session = AttendanceSession::findOrFail($sessionId);
        $session->delete();
        
        return response()->json(['message' => 'Sesi dihapus']);
    }
}