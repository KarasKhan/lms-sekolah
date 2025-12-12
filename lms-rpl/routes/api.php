<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Grouped Imports untuk kerapian
use App\Http\Controllers\{
    AuthController,
    AdminUserController,
    ClassroomController,
    CourseController,
    CurriculumController,
    DashboardController,
    LessonContentController,
    StudentController,
    SubjectController,
    StudentAreaController,
    StudentCourseController,
    StudentQuizController,
    TeacherGradeController,
    AttendanceController,
    RecapController,
    StudentAttendanceController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =========================================================================
// 1. PUBLIC ROUTES (Tanpa Login)
// =========================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// =========================================================================
// 2. PROTECTED ROUTES (Wajib Login / Token Bearer)
// =========================================================================
Route::middleware(['auth:sanctum'])->group(function () {
    
    // --- AUTH & PROFILE ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- DASHBOARD STATS (ADMIN) ---
    Route::get('/admin/stats', [DashboardController::class, 'stats']);


    // =====================================================================
    // MODULE: ADMINISTRASI SEKOLAH (Tata Usaha)
    // =====================================================================

    // A. MANAJEMEN KELAS (Classrooms)
    Route::prefix('classrooms')->group(function () {
        Route::get('/', [ClassroomController::class, 'index']);          // List
        Route::post('/', [ClassroomController::class, 'store']);         // Create
        Route::get('/{id}', [ClassroomController::class, 'show']);       // Detail
        Route::delete('/{id}', [ClassroomController::class, 'destroy']); // Delete
        
        // Fitur Spesifik Kelas
        Route::delete('/{id}/reset', [ClassroomController::class, 'reset']); // Kosongkan Kelas
        Route::delete('/{id}/students/{studentId}', [ClassroomController::class, 'removeStudent']); // Kick Siswa
    });

    // B. MANAJEMEN MATA PELAJARAN (Subjects)
    Route::apiResource('subjects', SubjectController::class);

    // C. MANAJEMEN SISWA (Students)
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);            // List & Search
        Route::put('/{id}', [StudentController::class, 'update']);       // Edit Biodata/Pass
        Route::delete('/{id}', [StudentController::class, 'destroy']);   // Hapus Permanen
        
        // Fitur Plotting Kelas
        Route::post('/enroll', [StudentController::class, 'enroll']);         // Single Enroll
        Route::post('/bulk-enroll', [StudentController::class, 'bulkEnroll']); // Mass Enroll
    });

    // D. MANAJEMEN USER & GURU (Admin Access)
    Route::prefix('admin')->group(function () {
        Route::get('/teachers', [AdminUserController::class, 'indexTeachers']);
        Route::post('/users', [AdminUserController::class, 'store']);           // Create Any User
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);  // Delete User
        Route::put('/users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);
    });


    // =====================================================================
    // MODULE: AKADEMIK GURU (Teacher Side)
    // =====================================================================

    // A. MANAJEMEN COURSE (Kelas Mengajar)
    Route::prefix('teacher/courses')->group(function () {
        Route::get('/', [CourseController::class, 'index']);
        Route::post('/', [CourseController::class, 'store']);
        
        // --- TAMBAHAN BARU ---
        Route::put('/{id}', [CourseController::class, 'update']); // <-- Route Update
        // ---------------------
        
        Route::delete('/{id}', [CourseController::class, 'destroy']);
        
        // Ambil Kurikulum Lengkap (Chapters + Lessons)
        Route::get('/{id}/curriculum', [CurriculumController::class, 'index']);
    });

    // B. MANAJEMEN BAB (Chapters)
    Route::prefix('teacher/chapters')->group(function () {
        Route::post('/', [CurriculumController::class, 'storeChapter']);
        Route::delete('/{id}', [CurriculumController::class, 'destroyChapter']);
    });

    // C. MANAJEMEN JUDUL MATERI (Lessons)
    Route::prefix('teacher/lessons')->group(function () {
        Route::post('/', [CurriculumController::class, 'storeLesson']);
        Route::delete('/{id}', [CurriculumController::class, 'destroyLesson']);
        
        // UPDATE SETTING LESSON (Waktu Baca Minimal) - BARU
        Route::put('/{id}/settings', [LessonContentController::class, 'updateLessonSettings']);
        
        // Ambil Isi Konten (Blocks) dari Lesson tertentu
        Route::get('/{lessonId}/contents', [LessonContentController::class, 'index']);
    });

    // D. MANAJEMEN ISI KONTEN (Modular Blocks)
    Route::prefix('teacher/contents')->group(function () {
        Route::post('/', [LessonContentController::class, 'store']);
        Route::put('/{id}', [LessonContentController::class, 'update']); // Update Konten
        Route::delete('/{id}', [LessonContentController::class, 'destroy']);
        Route::put('/reorder', [LessonContentController::class, 'reorder']); // Drag & Drop support
    });
    
    // E. MANAJEMEN NILAI & MONITORING (Teacher Grades)
    Route::prefix('teacher/grades')->group(function () {
        // 1. List Kelas Guru untuk Filter
        Route::get('/courses', [TeacherGradeController::class, 'getCourses']);
        
        // 2. Rekap Daftar Kuis per Kelas
        Route::get('/courses/{id}/quizzes', [TeacherGradeController::class, 'getCourseQuizzes']);
        
        // 3. Detail Nilai Siswa per Kuis (Full Report)
        Route::get('/quizzes/{id}', [TeacherGradeController::class, 'showQuizDetails']);
        
        // 4. Reset Ujian Siswa (Remedial)
        Route::delete('/quizzes/{id}/reset/{userId}', [TeacherGradeController::class, 'resetAttempt']);

        // --- ROUTE BARU UNTUK TUGAS ---
        Route::get('/courses/{id}/assignments', [TeacherGradeController::class, 'getCourseAssignments']);
        Route::get('/assignments/{contentId}', [TeacherGradeController::class, 'showAssignmentDetails']);
        Route::post('/assignments/grade/{submissionId}', [TeacherGradeController::class, 'gradeAssignment']);
    });

    // F. MANAJEMEN ABSENSI (Teacher Attendance)
    Route::prefix('teacher/attendance')->group(function () {
        // 1. List Sesi per Kelas
        Route::get('/courses/{courseId}', [AttendanceController::class, 'index']);
        
        // 2. Buat Sesi Baru (Generate Token)
        Route::post('/sessions', [AttendanceController::class, 'store']);
        
        // 3. Detail Sesi (Lihat Siapa yang Hadir/Alpha)
        Route::get('/sessions/{sessionId}', [AttendanceController::class, 'show']);
        
        // 4. Update Status Manual (Ubah A jadi S/I)
        Route::put('/attendances/{attendanceId}', [AttendanceController::class, 'updateStatus']);
        
        // 5. Tutup & Hapus Sesi
        Route::put('/sessions/{sessionId}/close', [AttendanceController::class, 'close']);
        Route::delete('/sessions/{sessionId}', [AttendanceController::class, 'destroy']);
    });

    // G. REKAPITULASI & LAPORAN (Recap)
    Route::prefix('teacher/recap')->group(function () {
        Route::get('/courses/{courseId}', [RecapController::class, 'index']); // Data JSON Matrix
        Route::get('/courses/{courseId}/export', [RecapController::class, 'export']); // Download CSV
    });


    // =====================================================================
    // MODULE: STUDENT AREA (Siswa)
    // =====================================================================
    
    Route::prefix('student')->group(function () {
        // 1. Dashboard Siswa
        Route::get('/my-courses', [StudentAreaController::class, 'myCourses']);
        
        // 2. Ruang Belajar (Course Player)
        Route::get('/courses/{id}/learn', [StudentCourseController::class, 'learn']);
        Route::post('/lessons/{id}/complete', [StudentCourseController::class, 'completeLesson']);

        // 3. Ujian / Kuis (Exam Mode)
        Route::get('/quizzes/{id}', [StudentQuizController::class, 'show']);
        Route::post('/quizzes/{id}/submit', [StudentQuizController::class, 'submit']);

        // 4. Upload Tugas
        Route::post('/assignments/{contentId}/submit', [StudentCourseController::class, 'uploadAssignment']);

        // 5. FITUR ABSENSI SISWA (BARU)
        Route::get('/attendance/history', [StudentAttendanceController::class, 'index']); // Riwayat
        Route::post('/attendance/check-in', [StudentAttendanceController::class, 'submit']); // Input Token
    });

    // Route Tes Koneksi (Tanpa Login, Tanpa DB)
    Route::get('/cek', function () {
        return response()->json([
            'status' => 'ok',
            'message' => 'Koneksi Railway Berhasil!',
            'waktu' => now()->toDateTimeString()
        ]);
    });

});