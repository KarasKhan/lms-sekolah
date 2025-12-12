<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Sesi Absensi (Dibuat Guru)
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade'); // Relasi ke Kelas
            $table->string('title'); // Contoh: "Pertemuan 1: Pengenalan"
            $table->string('token', 6)->nullable(); // Kode Unik (misal: A1B2C3)
            $table->dateTime('opened_at'); // Waktu dibuka
            $table->dateTime('closed_at')->nullable(); // Waktu ditutup (Deadline)
            $table->boolean('is_active')->default(true); // Status sesi aktif/tidak
            $table->timestamps();
        });

        // 2. Tabel Log Kehadiran Siswa
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Siswa
            
            // Status: H=Hadir, I=Izin, S=Sakit, A=Alpha, T=Terlambat
            $table->enum('status', ['H', 'I', 'S', 'A', 'T'])->default('A'); 
            $table->timestamp('check_in_at')->nullable(); // Waktu siswa klik absen
            $table->string('ip_address')->nullable(); // Opsional: Catat IP untuk keamanan
            $table->text('notes')->nullable(); // Catatan (misal: Alasan izin)
            
            $table->timestamps();
            
            // Mencegah duplikasi absen siswa di sesi yang sama
            $table->unique(['attendance_session_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('attendance_sessions');
    }
};