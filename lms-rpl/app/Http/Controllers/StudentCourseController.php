<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\LessonCompletion;
use App\Models\LessonContent;
use App\Models\AssignmentSubmission;
use App\Models\QuizAttempt; // Tambahkan ini
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StudentCourseController extends Controller
{
    // GET /api/student/courses/{id}/learn
    public function learn($id)
    {
        $user = Auth::user();

        // 1. SECURITY CHECK: Pastikan Siswa terdaftar di kelas ini
        $enrollment = $user->studentEnrollment;
        
        if (!$enrollment) {
            return response()->json(['message' => 'Anda tidak terdaftar.'], 403);
        }

        // Ambil Course
        $course = Course::where('id', $id)
            ->where('classroom_id', $enrollment->classroom_id)
            ->firstOrFail();

        // 2. FETCH CURRICULUM
        $curriculum = $course->load([
            'subject',
            'chapters' => function($q) { $q->orderBy('order', 'asc'); },
            'chapters.lessons' => function($q) { $q->orderBy('order', 'asc'); },
            'chapters.lessons.contents' => function($q) { $q->orderBy('sort_order', 'asc'); }
        ]);

        // 3. DATA STATUS SELESAI (LESSON COMPLETION)
        $completedLessonIds = LessonCompletion::where('user_id', $user->id)
            ->whereIn('lesson_id', $course->chapters->pluck('lessons')->flatten()->pluck('id'))
            ->pluck('lesson_id')
            ->toArray();

        // 4. INJECT PROGRESS USER KE DALAM STRUKTUR DATA
        $curriculum->chapters->each(function($chapter) use ($completedLessonIds, $user) {
            $chapter->lessons->each(function($lesson) use ($completedLessonIds, $user) {
                
                // A. Status Lesson Selesai?
                $lesson->is_completed = in_array($lesson->id, $completedLessonIds);

                // B. Loop setiap Konten untuk cek Kuis/Tugas
                $lesson->contents->each(function($content) use ($user) {
                    $progress = null;

                    // --- JIKA TIPE KUIS ---
                    if ($content->type === 'quiz') {
                        $quizId = $content->content['quiz_id'] ?? null;
                        if ($quizId) {
                            // Ambil attempt terakhir yang sudah selesai
                            $attempt = QuizAttempt::where('quiz_id', $quizId)
                                ->where('user_id', $user->id)
                                ->whereNotNull('finished_at') 
                                ->latest()
                                ->first();

                            if ($attempt) {
                                $progress = [
                                    'status' => 'completed', // Frontend butuh status ini
                                    'score' => $attempt->score,
                                    'submitted_at' => $attempt->finished_at->translatedFormat('d M Y H:i'),
                                ];
                            }
                        }
                    }
                    
                    // --- JIKA TIPE TUGAS ---
                    elseif ($content->type === 'assignment') {
                        $submission = AssignmentSubmission::where('lesson_content_id', $content->id)
                            ->where('user_id', $user->id)
                            ->first();

                        if ($submission) {
                            $progress = [
                                'status' => $submission->status, // pending, accepted, rejected
                                'score' => $submission->score,
                                'feedback' => $submission->feedback,
                                'file_url' => asset('storage/' . $submission->file_path),
                                'original_filename' => $submission->original_filename,
                                'submitted_at' => $submission->created_at->translatedFormat('d M Y H:i'),
                            ];
                        }
                    }

                    // Tempelkan data progress ke object content agar dibaca Frontend
                    $content->setAttribute('user_progress', $progress);
                });
            });
        });

        return response()->json($curriculum);
    }

    // POST /api/student/lessons/{id}/complete
    public function completeLesson($id)
    {
        LessonCompletion::firstOrCreate([
            'user_id' => Auth::id(),
            'lesson_id' => $id
        ], [
            'completed_at' => now()
        ]);

        return response()->json(['message' => 'Materi diselesaikan']);
    }

    // POST /api/student/assignments/{contentId}/submit
    public function uploadAssignment(Request $request, $contentId)
    {
        // 1. Validasi File (Max 5MB)
        $request->validate([
            'file' => 'required|mimes:pdf,doc,docx,zip|max:5120', 
        ], [
            'file.max' => 'Ukuran file maksimal adalah 5MB.',
            'file.mimes' => 'Format file harus PDF, Word, atau ZIP.'
        ]);

        $contentBlock = LessonContent::findOrFail($contentId);
        
        // 2. CEK DEADLINE
        $contentData = $contentBlock->content;
        if (isset($contentData['deadline']) && !empty($contentData['deadline'])) {
            $deadline = Carbon::parse($contentData['deadline']);
            $now = Carbon::now();

            if ($now->greaterThan($deadline)) {
                return response()->json([
                    'message' => 'Maaf, batas waktu pengumpulan tugas sudah berakhir.'
                ], 403);
            }
        }

        // 3. UPLOAD & SIMPAN
        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('assignments', $filename, 'public');

        $submission = AssignmentSubmission::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'lesson_content_id' => $contentId
            ],
            [
                'file_path' => $path,
                'original_filename' => $file->getClientOriginalName(),
                'status' => 'pending',
                'graded_at' => null,
                'score' => null
            ]
        );

        return response()->json([
            'message' => 'Tugas berhasil dikumpulkan!',
            'data' => $submission
        ]);
    }
}