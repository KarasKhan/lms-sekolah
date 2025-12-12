<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens; 
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'nisn', 'role',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function studentEnrollment()
    {
        return $this->hasOne(StudentEnrollment::class)->where('is_active', true)->latest();
    }

    // --- RELASI GURU (JANGAN DIHAPUS) ---
    // User (Guru) mengajar banyak Course
    public function courses()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    // --- RELASI SISWA (TAMBAHKAN INI) ---
    // User (Siswa) mendaftar di banyak Course
    // Relasi Many-to-Many membutuhkan tabel pivot 'course_user'
    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'course_user', 'user_id', 'course_id')
                ->withPivot('grade', 'status', 'progress') // <--- INI KUNCINYA
                ->withTimestamps();
    }
}