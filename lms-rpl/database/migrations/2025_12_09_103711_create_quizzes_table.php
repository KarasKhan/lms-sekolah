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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Judul Kuis
            $table->text('description')->nullable();
            $table->integer('duration_minutes')->default(0); // 0 = Tidak ada waktu
            $table->enum('type', ['practice', 'exam'])->default('practice'); // Latihan vs Ujian
            $table->integer('passing_grade')->default(75); // KKM
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
