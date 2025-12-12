<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // --- PERBAIKAN UTAMA DI SINI ---
    // Kita wajib memberitahu Laravel bahwa kolom 'answers_snapshot' 
    // harus otomatis diubah jadi JSON saat disimpan, dan jadi Array saat diambil.
    protected $casts = [
        'answers_snapshot' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function quiz() {
        return $this->belongsTo(Quiz::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}