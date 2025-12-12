<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop tabel lama jika ada agar bersih
        Schema::dropIfExists('lesson_contents');

        Schema::create('lesson_contents', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke Lesson (Induk Materi)
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            
            // Jenis Blok Konten
            $table->enum('type', [
                'rich_text',  // Editor teks biasa (HTML)
                'media',      // Embed Video/Audio
                'document',   // Upload PDF
                'assignment', // Instruksi Tugas
                'quiz',       // Data soal quiz
                'coding'      // Editor koding
            ]);

            // Kolom Sakti (JSON) untuk menyimpan config blok
            // Contoh isi: { "url": "youtube.com...", "caption": "..." }
            $table->json('content')->nullable();

            // Khusus untuk path file jika type='document'
            $table->string('file_path')->nullable();

            // Urutan blok dalam satu lesson
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_contents');
    }
};