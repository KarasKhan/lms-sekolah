<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = ['course_id', 'title', 'order'];

    // HAPUS BARIS INI (Biar Controller yang atur load-nya)
    // protected $with = ['lessons']; 

    public function lessons() {
        return $this->hasMany(Lesson::class)->orderBy('order', 'asc');
    }

    public function course() {
        return $this->belongsTo(Course::class);
    }
}