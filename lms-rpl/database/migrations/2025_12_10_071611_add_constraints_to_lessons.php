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
        // 1. Setting Waktu Minimal di Level SUB-BAB (Lesson)
        Schema::table('lessons', function (Blueprint $table) {
            $table->integer('min_read_time')->default(0); // Dalam Menit
        });

        // 2. Setting Wajib di Level KONTEN (Kuis/Tugas)
        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->boolean('is_required')->default(false); // Wajib dikerjakan?
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn('min_read_time');
        });
        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->dropColumn('is_required');
        });
    }
};
