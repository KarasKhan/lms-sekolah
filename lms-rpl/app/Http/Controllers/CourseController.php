<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\StudentEnrollment; // Pastikan Model ini di-import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::where('teacher_id', Auth::id())
            ->with(['subject', 'classroom'])
            ->latest()
            ->get()
            ->map(function ($course) {
                // --- PERBAIKAN DI SINI ---
                // Kita hitung manual jumlah siswa aktif di kelas (classroom) ini
                // dan menyuntikkannya ke properti 'students_count'
                $count = StudentEnrollment::where('classroom_id', $course->classroom_id)
                    ->where('is_active', true)
                    ->count();
                
                $course->setAttribute('students_count', $count);
                // -------------------------
                
                return $course;
            });

        return response()->json($courses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048'
        ]);

        $course = Course::create([
            'teacher_id' => Auth::id(),
            'subject_id' => $request->subject_id,
            'classroom_id' => $request->classroom_id,
            'description' => $request->description,
            'is_active' => true
        ]);

        return response()->json(['message' => 'Kelas berhasil dibuat', 'data' => $course]);
    }

    // Update Kelas
    public function update(Request $request, $id)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'description' => 'nullable|string',
        ]);

        $course = Course::where('id', $id)->where('teacher_id', Auth::id())->firstOrFail();

        $course->update([
            'subject_id' => $request->subject_id,
            'classroom_id' => $request->classroom_id,
            'description' => $request->description,
        ]);

        return response()->json(['message' => 'Info kelas berhasil diperbarui', 'data' => $course]);
    }

    public function destroy($id)
    {
        $course = Course::where('id', $id)->where('teacher_id', Auth::id())->firstOrFail();
        $course->delete();

        return response()->json(['message' => 'Kelas dihapus']);
    }
}