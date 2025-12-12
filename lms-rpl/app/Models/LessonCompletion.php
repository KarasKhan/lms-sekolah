<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class LessonCompletion extends Model {
    public $timestamps = false; // Karena kita cuma butuh completed_at manual
    protected $fillable = ['user_id', 'lesson_id', 'completed_at'];
}