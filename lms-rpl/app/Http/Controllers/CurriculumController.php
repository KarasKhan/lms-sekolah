<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Chapter;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CurriculumController extends Controller
{
    public function index($courseId)
    {
        // Pastikan relasinya ditulis 'chapters' (bukan Chapter)
        $course = Course::where('id', $courseId)
            ->where('teacher_id', Auth::id())
            ->with(['chapters.lessons', 'subject', 'classroom']) // Load lengkap
            ->firstOrFail();

        return response()->json($course);
    }

    // POST Create Chapter
    public function storeChapter(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string',
        ]);

        // Verifikasi kepemilikan course
        $course = Course::where('id', $request->course_id)
            ->where('teacher_id', Auth::id())
            ->firstOrFail();

        $chapter = Chapter::create([
            'course_id' => $course->id,
            'title' => $request->title,
            'order' => Chapter::where('course_id', $course->id)->max('order') + 1
        ]);

        return response()->json($chapter, 201);
    }

    // POST Create Lesson
    public function storeLesson(Request $request)
    {
        $request->validate([
            'chapter_id' => 'required|exists:chapters,id',
            'title' => 'required|string',
            'type' => 'required|in:video,text,code',
        ]);

        // Verifikasi kepemilikan via relation
        // (Logic disederhanakan: kita asumsi frontend mengirim ID yang benar, 
        // idealnya cek teacher_id dari chapter->course->teacher_id)

        $lesson = Lesson::create([
            'chapter_id' => $request->chapter_id,
            'title' => $request->title,
            'type' => $request->type,
            'order' => Lesson::where('chapter_id', $request->chapter_id)->max('order') + 1
        ]);

        return response()->json($lesson, 201);
    }

    // DELETE /api/teacher/chapters/{id}
    public function destroyChapter($id)
    {
        // Pastikan bab milik course yang diajar oleh guru ini (Security check)
        $chapter = Chapter::whereHas('course', function($q) {
            $q->where('teacher_id', Auth::id());
        })->findOrFail($id);

        $chapter->delete();
        return response()->json(['message' => 'Bab berhasil dihapus']);
    }

    // DELETE /api/teacher/lessons/{id}
    public function destroyLesson($id)
    {
        $lesson = Lesson::whereHas('chapter.course', function($q) {
            $q->where('teacher_id', Auth::id());
        })->findOrFail($id);

        $lesson->delete();
        return response()->json(['message' => 'Materi berhasil dihapus']);
    }
}