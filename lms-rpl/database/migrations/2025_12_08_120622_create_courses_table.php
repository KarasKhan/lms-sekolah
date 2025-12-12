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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade'); // Guru
            $table->foreignId('subject_id')->constrained()->onDelete('cascade'); // Mapel
            $table->foreignId('classroom_id')->constrained()->onDelete('cascade'); // Kelas (Rombel)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Mencegah duplikasi: Satu Guru tidak boleh mengajar Mapel yang sama di Kelas yang sama dua kali
            $table->unique(['teacher_id', 'subject_id', 'classroom_id'], 'unique_course_teaching');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
