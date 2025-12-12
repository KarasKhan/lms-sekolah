<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'check_in_at' => 'datetime',
    ];

    public function session() {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}