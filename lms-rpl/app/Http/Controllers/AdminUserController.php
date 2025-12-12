<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth; // <--- Pastikan Import Ini Ada
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    // 1. GET /api/admin/teachers (List Guru)
    public function indexTeachers()
    {
        $teachers = User::where('role', 'teacher')
            ->orderBy('name', 'asc')
            ->get();
            
        return response()->json($teachers);
    }

    // 2. POST /api/admin/users (Create User Baru)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,teacher,super_admin',
            'nisn' => 'nullable|string|unique:users,nisn',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'nisn' => $validated['nisn'] ?? null,
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'user' => $user
        ], 201);
    }

    // 3. DELETE /api/admin/users/{id} (Hapus User)
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // PERBAIKAN DI SINI:
        // Gunakan Auth::id() untuk mengambil ID admin yang sedang login
        // Gunakan $user->id (tanpa kurung) untuk mengambil ID target
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Tidak bisa menghapus akun sendiri!'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus']);
    }

    // 4. PUT /api/admin/users/{id}/reset-password (Reset Password)
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|string|min:6'
        ]);

        $user = User::findOrFail($id);
        
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password berhasil direset.']);
    }
}