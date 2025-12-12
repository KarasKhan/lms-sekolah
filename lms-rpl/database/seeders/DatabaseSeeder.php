<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'karas@karas.com',
            'password' => Hash::make('karas'),
            'role' => 'super_admin',
            'nisn' => null, // Admin tidak wajib punya NISN
        ]);

        // 2. Seed Data Dummy Siswa (Whitelist) ke master_students
        DB::table('master_students')->insert([
            [
                'nisn' => '13104410055',
                'name' => 'Siswa Percobaan',
                'is_registered' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Tambahkan data array lain di sini jika perlu
        ]);
    }
}