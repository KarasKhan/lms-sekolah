<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\StudentEnrollment; // Pastikan ini di-import
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    // 1. GET /api/classrooms (List Semua Kelas)
    public function index()
    {
        $classrooms = Classroom::latest()->get();
        return response()->json($classrooms);
    }

    // 2. POST /api/classrooms (Buat Kelas Baru)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:classrooms,name',
            'level' => 'required|string',
            'major' => 'required|string',
        ]);

        $classroom = Classroom::create($validated);

        return response()->json([
            'message' => 'Kelas berhasil dibuat',
            'data' => $classroom
        ], 201);
    }

    // 3. GET /api/classrooms/{id} (Detail Kelas & Siswa) -> FITUR BARU
    public function show($id)
    {
        $classroom = Classroom::with(['enrollments.user' => function($q) {
            $q->select('id', 'name', 'nisn', 'email'); 
        }])->findOrFail($id);

        return response()->json($classroom);
    }

    // 4. DELETE /api/classrooms/{id} (Hapus Kelas)
    public function destroy($id)
    {
        $classroom = Classroom::find($id);

        if (!$classroom) {
            return response()->json(['message' => 'Kelas tidak ditemukan'], 404);
        }

        $classroom->delete();

        return response()->json(['message' => 'Kelas berhasil dihapus']);
    }

    // 5. DELETE /api/classrooms/{id}/reset (Kosongkan Kelas) -> FITUR BARU
    public function reset($id)
    {
        $classroom = Classroom::findOrFail($id);
        $classroom->enrollments()->delete();

        return response()->json(['message' => "Kelas {$classroom->name} berhasil dikosongkan."]);
    }
    
    // 6. DELETE (Kick Siswa) -> FITUR BARU
    public function removeStudent($id, $studentId)
    {
        StudentEnrollment::where('classroom_id', $id)
            ->where('user_id', $studentId)
            ->delete();
            
        return response()->json(['message' => 'Siswa berhasil dikeluarkan dari kelas.']);
    }
}