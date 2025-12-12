<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'level', 'major'];

    // Relasi: Satu kelas punya banyak siswa (enrollment)
    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }
}