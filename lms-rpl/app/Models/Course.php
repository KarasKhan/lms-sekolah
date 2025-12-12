<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // --- JEMBATAN RELASI (INI YANG MEMBUAT NAMA MAPEL MUNCUL) ---

    // 1. Relasi ke Subject (Mapel)
    public function subject()
    {
        // Pastikan Anda punya model App\Models\Subject
        return $this->belongsTo(\App\Models\Subject::class, 'subject_id');
    }

    // 2. Relasi ke Teacher (Guru)
    public function teacher()
    {
        return $this->belongsTo(\App\Models\User::class, 'teacher_id');
    }

    // 3. Relasi ke Classroom (Kelas)
    public function classroom()
    {
        return $this->belongsTo(\App\Models\Classroom::class, 'classroom_id');
    }

    // 4. Relasi ke Chapters
    public function chapters()
    {
        return $this->hasMany(\App\Models\Chapter::class);
    }
}