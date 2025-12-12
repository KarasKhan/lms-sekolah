<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\LessonContent;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\AssignmentSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class TeacherGradeController extends Controller
{
    // ==========================================
    // 1. GLOBAL (Untuk Dropdown Filter)
    // ==========================================
    public function getCourses()
    {
        $courses = Course::where('teacher_id', Auth::id())
            ->with(['classroom', 'subject'])
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->subject->name . ' - ' . $c->classroom->name
                ];
            });
        return response()->json($courses);
    }

    // ==========================================
    // 2. FITUR KUIS (PRE/POST TEST)
    // ==========================================
    public function getCourseQuizzes($courseId)
    {
        $course = Course::where('id', $courseId)->where('teacher_id', Auth::id())->firstOrFail();
        $quizzes = LessonContent::query()
            ->join('lessons', 'lesson_contents.lesson_id', '=', 'lessons.id')
            ->join('chapters', 'lessons.chapter_id', '=', 'chapters.id')
            ->where('chapters.course_id', $courseId)
            ->where('lesson_contents.type', 'quiz')
            ->select(
                'chapters.title as chapter_title',
                'lessons.title as lesson_title',
                'lesson_contents.id as content_id',
                'lesson_contents.content'
            )
            ->orderBy('chapters.order', 'asc')
            ->orderBy('lessons.order', 'asc')
            ->get();

        $result = $quizzes->map(function ($item) {
            $content = $item->content;
            $quizId = $content['quiz_id'] ?? null;
            
            $attemptsCount = 0;
            $avgScore = 0;

            if ($quizId) {
                $attemptsCount = QuizAttempt::where('quiz_id', $quizId)->count();
                $avgScore = QuizAttempt::where('quiz_id', $quizId)->avg('score');
            }

            return [
                'chapter' => $item->chapter_title,
                'lesson' => $item->lesson_title,
                'quiz_title' => $content['quiz_title'] ?? 'Kuis Tanpa Judul',
                'quiz_id' => $quizId,
                'total_attempts' => $attemptsCount,
                'average_score' => round($avgScore, 1)
            ];
        });

        return response()->json($result->groupBy('chapter'));
    }

    public function showQuizDetails($quizId)
    {
        $lessonContent = LessonContent::where('type', 'quiz')
            ->where('content->quiz_id', (int)$quizId)
            ->with(['lesson.chapter.course.classroom', 'lesson.chapter.course.subject'])
            ->first();

        if (!$lessonContent) return response()->json(['message' => 'Data tidak ditemukan.'], 404);

        $course = $lessonContent->lesson->chapter->course;
        $classroom = $course->classroom;
        $quiz = Quiz::findOrFail($quizId);

        $students = User::whereHas('studentEnrollment', function($q) use ($classroom) {
            $q->where('classroom_id', $classroom->id)->where('is_active', true);
        })->orderBy('name', 'asc')->get();

        $attempts = QuizAttempt::where('quiz_id', $quizId)->get()->keyBy('user_id');

        $studentData = $students->map(function($student) use ($attempts, $quiz) {
            $attempt = $attempts->get($student->id);
            return [
                'user_id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'has_attempted' => (bool)$attempt,
                'score' => $attempt ? $attempt->score : null,
                'submitted_at' => $attempt ? $attempt->created_at->format('d M Y H:i') : '-',
                'passing_grade' => $quiz->passing_grade
            ];
        });

        $scores = $attempts->pluck('score');
        $stats = [
            'average' => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
            'highest' => $scores->max() ?? 0,
            'lowest' => $scores->min() ?? 0,
            'total_students' => $students->count(),
            'total_submitted' => $attempts->count()
        ];

        return response()->json([
            'quiz' => $quiz,
            'classroom' => $classroom->name,
            'subject' => $course->subject->name,
            'students' => $studentData,
            'stats' => $stats
        ]);
    }

    public function resetAttempt($quizId, $userId)
    {
        QuizAttempt::where('quiz_id', $quizId)->where('user_id', $userId)->delete();
        return response()->json(['message' => 'Riwayat reset.']);
    }

    // ==========================================
    // 3. FITUR TUGAS / ASSIGNMENT (BARU)
    // ==========================================

    public function getCourseAssignments($courseId)
    {
        $course = Course::where('id', $courseId)->where('teacher_id', Auth::id())->firstOrFail();

        $assignments = LessonContent::query()
            ->join('lessons', 'lesson_contents.lesson_id', '=', 'lessons.id')
            ->join('chapters', 'lessons.chapter_id', '=', 'chapters.id')
            ->where('chapters.course_id', $courseId)
            ->where('lesson_contents.type', 'assignment')
            ->select(
                'chapters.title as chapter_title',
                'lessons.title as lesson_title',
                'lesson_contents.id as content_id',
                'lesson_contents.content'
            )
            ->orderBy('chapters.order', 'asc')
            ->orderBy('lessons.order', 'asc')
            ->get();

        $result = $assignments->map(function ($item) {
            $content = $item->content;
            
            $submissionCount = AssignmentSubmission::where('lesson_content_id', $item->content_id)->count();
            $gradedCount = AssignmentSubmission::where('lesson_content_id', $item->content_id)
                ->whereNotNull('score')->count();

            return [
                'chapter' => $item->chapter_title,
                'lesson' => $item->lesson_title,
                'content_id' => $item->content_id,
                'title' => Str::limit($content['instruction'] ?? 'Tugas Upload', 40),
                'deadline' => isset($content['deadline']) ? date('d M Y H:i', strtotime($content['deadline'])) : '-',
                'submitted_count' => $submissionCount,
                'graded_count' => $gradedCount
            ];
        });

        return response()->json($result->groupBy('chapter'));
    }

    // Detail Tugas + List Siswa (Untuk Halaman Grading)
    // [PERBAIKAN] Menambahkan sorting manual di sini
    public function showAssignmentDetails($contentId)
    {
        $contentBlock = LessonContent::with(['lesson.chapter.course.classroom', 'lesson.chapter.course.subject'])
            ->findOrFail($contentId);
        $classroom = $contentBlock->lesson->chapter->course->classroom;
        
        $students = User::whereHas('studentEnrollment', function($q) use ($classroom) {
            $q->where('classroom_id', $classroom->id)->where('is_active', true);
        })->orderBy('name', 'asc')->get();

        $submissions = AssignmentSubmission::where('lesson_content_id', $contentId)
            ->get()
            ->keyBy('user_id');

        $studentData = $students->map(function($student) use ($submissions) {
            $sub = $submissions->get($student->id);
            return [
                'user_id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'has_submitted' => (bool)$sub,
                'submission' => $sub ? [
                    'id' => $sub->id,
                    'file_url' => asset('storage/' . $sub->file_path),
                    'original_filename' => $sub->original_filename,
                    'score' => $sub->score,
                    'feedback' => $sub->feedback,
                    'status' => $sub->status,
                    'submitted_at' => $sub->created_at->format('d M Y H:i'),
                    'graded_at' => $sub->graded_at ? $sub->graded_at->format('d M Y H:i') : null,
                ] : null
            ];
        });

        // --- LOGIC SORTING BARU (Baru Masuk -> Paling Atas) ---
        // Priority: 
        // 0 = Pending (Baru Masuk)
        // 1 = Rejected (Menunggu Revisi)
        // 2 = Accepted (Nilai Tersimpan)
        // 3 = Belum Kumpul
        
        $sortedStudents = $studentData->sortBy(function ($student) {
            if (!$student['submission']) return 3; 
            
            $status = $student['submission']['status'];
            if ($status === 'pending') return 0;
            if ($status === 'rejected') return 1;
            if ($status === 'accepted') return 2;
            
            return 3;
        })->values();

        return response()->json([
            'assignment_info' => $contentBlock->content,
            'classroom' => $classroom->name,
            'subject' => $contentBlock->lesson->chapter->course->subject->name,
            'students' => $sortedStudents
        ]);
    }

    public function gradeAssignment(Request $request, $submissionId)
    {
        $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
            'status' => 'required|in:accepted,rejected'
        ]);

        $sub = AssignmentSubmission::findOrFail($submissionId);
        
        $sub->update([
            'score' => $request->score,
            'feedback' => $request->feedback,
            'status' => $request->status,
            'graded_at' => now()
        ]);

        $msg = $request->status === 'rejected' ? 'Tugas ditolak. Siswa diminta revisi.' : 'Nilai berhasil disimpan.';

        return response()->json(['message' => $msg]);
    }
}