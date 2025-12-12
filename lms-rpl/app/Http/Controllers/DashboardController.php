<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Classroom;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_students' => User::where('role', 'student')->count(),
            // Hitung teacher & super_admin sebagai Staff Pengajar/Admin
            'total_teachers' => User::whereIn('role', ['teacher', 'super_admin'])->count(),
            'total_classes'  => Classroom::count(),
        ]);
    }
}