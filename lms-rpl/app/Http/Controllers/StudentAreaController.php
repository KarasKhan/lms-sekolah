<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentAreaController extends Controller
{
    // GET /api/student/my-courses
    public function myCourses(Request $request)
    {
        $user = Auth::user();

        // 1. Cek Siswa ini ada di kelas mana (Ambil enrollment aktif terakhir)
        // Kita gunakan relasi 'studentEnrollment' yang sudah dibuat di User.php
        $enrollment = $user->studentEnrollment;

        if (!$enrollment) {
            return response()->json([
                'message' => 'Anda belum terdaftar di kelas manapun. Hubungi Admin.',
                'courses' => []
            ]);
        }

        // 2. Ambil semua Course yang classroom_id-nya sama dengan kelas siswa
        $courses = Course::where('classroom_id', $enrollment->classroom_id)
            ->where('is_active', true) // Hanya ambil course aktif
            ->with(['subject', 'teacher']) // Ambil nama Mapel & Guru
            ->latest()
            ->get();

        // 3. Format Data (Opsional: Tambahkan progress dummy)
        $mappedCourses = $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'subject_name' => $course->subject->name,
                'subject_code' => $course->subject->code,
                'subject_type' => $course->subject->type, // general/vocational
                'teacher_name' => $course->teacher->name,
                'description' => $course->description,
                'classroom_name' => $course->classroom->name,
                'progress' => 0, // Dummy progress (Nanti kita hitung real)
            ];
        });

        return response()->json($mappedCourses);
    }
}