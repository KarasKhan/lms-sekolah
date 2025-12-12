<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonContent extends Model
{
    use HasFactory;

    // Kita gunakan guarded juga biar konsisten dan aman
    protected $guarded = ['id'];

    protected $casts = [
        'content' => 'array', // PENTING: Mengubah JSON Database jadi Array PHP
        'is_required' => 'boolean',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}