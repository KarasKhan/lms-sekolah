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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->text('question_text'); // Pertanyaan
            
            // Opsi Jawaban (Disimpan sebagai JSON Array untuk fleksibilitas)
            // Contoh: ["Ayam", "Bebek", "Sapi", "Kambing"]
            $table->json('options'); 
            
            // Kunci Jawaban (Index array opsi, misal: 2 berarti "Sapi")
            $table->integer('correct_answer_index'); 
            
            $table->integer('points')->default(10); // Bobot nilai
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
