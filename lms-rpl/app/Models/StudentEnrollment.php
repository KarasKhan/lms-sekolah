<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentEnrollment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Relasi ke Kelas
    public function classroom() {
        return $this->belongsTo(Classroom::class);
    }

    // --- TAMBAHKAN INI (YANG HILANG) ---
    // Relasi ke User (Siswa)
    public function user() {
        return $this->belongsTo(User::class);
    }
}