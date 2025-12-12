<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'graded_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function lessonContent() {
        return $this->belongsTo(LessonContent::class);
    }
}