<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            // Relasi ke User (Siswa)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Relasi ke Blok Materi (LessonContent) tempat tugas dibuat
            // Kita relasikan ke 'lesson_contents' karena tugas itu bagian dari konten
            $table->foreignId('lesson_content_id')->constrained()->onDelete('cascade');
            
            // File Tugas
            $table->string('file_path'); // Path penyimpanan di storage
            $table->string('original_filename'); // Nama asli file (misal: Tugas_Budi.pdf)
            
            // Penilaian Guru (Nullable karena awal submit belum dinilai)
            $table->integer('score')->nullable(); // Nilai 0-100
            $table->text('feedback')->nullable(); // Komentar Guru
            $table->timestamp('graded_at')->nullable(); // Kapan dinilai
            
            $table->timestamps(); // created_at = waktu submit siswa
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
    }
};
