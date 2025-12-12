<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * REGISTER LOGIC (Khusus Siswa)
     */
    public function register(Request $request)
    {
        // 1. Validasi Input Standar
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'nisn' => 'required|string',
        ]);

        // 2. Cek Whitelist di tabel master_students
        $masterStudent = DB::table('master_students')
            ->where('nisn', $request->nisn)
            ->first();

        // Logic: Error 404 jika NISN tidak ditemukan di whitelist
        if (!$masterStudent) {
            return response()->json([
                'message' => 'NISN tidak terdaftar di database sekolah.'
            ], 404);
        }

        // Logic: Error 409 jika Siswa sudah pernah register
        if ($masterStudent->is_registered) {
            return response()->json([
                'message' => 'Akun dengan NISN ini sudah diaktifkan sebelumnya.'
            ], 409);
        }

        // 3. Proses Registrasi (Gunakan Transaction agar atomik)
        try {
            DB::beginTransaction();

            // A. Buat User Baru
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nisn' => $request->nisn,
                'role' => 'student', // Default role siswa
            ]);

            // B. Update status di master_students
            DB::table('master_students')
                ->where('id', $masterStudent->id)
                ->update(['is_registered' => true]);

            DB::commit();

            // C. Return response sukses
            return response()->json([
                'message' => 'Registrasi berhasil',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * LOGIN LOGIC
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek Password & User
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau Password salah'
            ], 401);
        }

        // Generate Token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * LOGOUT LOGIC
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}