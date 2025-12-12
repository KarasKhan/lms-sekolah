<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentCourseController;

Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/courses', [StudentCourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{slug}', [StudentCourseController::class, 'show'])->name('courses.show');
    
    // Route untuk enroll (bisa POST atau GET tergantung form di view)
    Route::post('/courses/{course}/enroll', [StudentCourseController::class, 'enroll'])->name('courses.enroll');
    
    // Route halaman belajar
    Route::get('/learning/{slug}', [StudentCourseController::class, 'learn'])->name('courses.learn');
});
