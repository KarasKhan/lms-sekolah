<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use App\Models\QuizAttempt;

class StudentController extends Controller
{
    // 1. GET /api/students (With Search)
    public function index(Request $request)
    {
        $query = User::where('role', 'student')
            ->with('studentEnrollment.classroom');

        // Logic Search: Nama ATAU NISN
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        // Pagination opsional, tapi untuk tutorial kita pakai get() dulu biar simple
        $students = $query->latest()->get();

        return response()->json($students);
    }

    // 2. UPDATE METHOD update() MENJADI SEPERTI INI:
    public function update(Request $request, $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($student->id)],
            'nisn' => ['required', Rule::unique('users')->ignore($student->id)],
            'password' => 'nullable|string|min:6', // Password boleh kosong (nullable)
        ]);

        // Siapkan data yang mau diupdate
        $dataToUpdate = [
            'name' => $request->name,
            'email' => $request->email,
            'nisn' => $request->nisn,
        ];

        // LOGIC KHUSUS: Hanya update password jika input tidak kosong
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        $student->update($dataToUpdate);
        
        return response()->json(['message' => 'Data siswa berhasil diperbarui']);
    }

    // 3. DELETE /api/students/{id} (Hapus Siswa & Reset NISN)
    public function destroy($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        // [PERBAIKAN] Langkah 1: Ambil NISN siswa ini
        $nisn = $student->nisn;

        // [PERBAIKAN] Langkah 2: Reset status di master_students jadi "belum daftar" (false)
        // Agar NISN ini bisa dipakai registrasi ulang
        if ($nisn) {
            DB::table('master_students')
                ->where('nisn', $nisn)
                ->update(['is_registered' => false]);
        }

        // Langkah 3: Hapus akun user
        $student->delete();

        return response()->json(['message' => 'Siswa berhasil dihapus dan NISN dapat didaftarkan kembali.']);
    }

    // 4. POST /api/students/enroll (Single Enroll - Logic Lama)
    public function enroll(Request $request)
    {
        // ... (Kode lama, boleh tetap dipakai atau diganti bulk)
        // Kita skip karena akan pakai Bulk Enroll
    }

    // 5. POST /api/students/bulk-enroll (Mass Assignment)
    public function bulkEnroll(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'classroom_id' => 'required|exists:classrooms,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->user_ids as $userId) {
                StudentEnrollment::updateOrCreate(
                    ['user_id' => $userId],
                    [
                        'classroom_id' => $request->classroom_id,
                        'academic_year' => '2025/2026',
                        'is_active' => true
                    ]
                );
            }
        });

        return response()->json([
            'message' => count($request->user_ids) . ' siswa berhasil dimasukkan ke kelas.'
        ]);
    }
}