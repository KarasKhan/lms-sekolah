<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = ['chapter_id', 'title', 'type', 'is_published', 'order', 'min_read_time'];

    // Relasi ke Chapter (Induk)
    public function chapter() {
        return $this->belongsTo(Chapter::class);
    }

    // --- TAMBAHKAN INI (YANG HILANG) ---
    // Relasi ke LessonContent (Isi Materi Modular)
    public function contents() {
        return $this->hasMany(LessonContent::class)->orderBy('sort_order', 'asc');
    }
}