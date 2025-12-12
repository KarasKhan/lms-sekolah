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
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->integer('score')->nullable(); // Nilai Akhir
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            
            // Menyimpan jawaban siswa per soal (JSON)
            // Contoh: { "soal_1_id": 2, "soal_2_id": 0 }
            $table->json('answers_snapshot')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};
