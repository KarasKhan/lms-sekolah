<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StudentAttendanceController extends Controller
{
    // 1. RIWAYAT ABSENSI SISWA (Dashboard Absen)
    public function index()
    {
        $userId = Auth::id();

        // Ambil data absensi user ini, urutkan dari yang terbaru
        $history = Attendance::where('user_id', $userId)
            ->with(['session.course.subject']) // Load relasi Session -> Course -> Subject
            ->whereHas('session', function($q) {
                $q->whereNotNull('closed_at'); // Ambil sesi yang sudah selesai/ada historynya
            })
            ->orderBy('created_at', 'desc')
            ->take(20) // Batasi 20 terakhir
            ->get()
            ->map(function($att) {
                return [
                    'id' => $att->id,
                    'subject' => $att->session->course->subject->name ?? '-',
                    'title' => $att->session->title,
                    'date' => $att->session->opened_at->format('d M Y'),
                    'status' => $att->status, // H, A, S, I
                    'check_in_time' => $att->check_in_at ? $att->check_in_at->format('H:i') : '-',
                ];
            });

        return response()->json($history);
    }

    // 2. SUBMIT TOKEN (CHECK-IN)
    public function submit(Request $request)
    {
        $request->validate([
            'token' => 'required|string|size:6'
        ]);

        $token = strtoupper($request->token);
        $user = Auth::user();

        // A. Cari Sesi Berdasarkan Token
        $session = AttendanceSession::where('token', $token)->first();

        if (!$session) {
            return response()->json(['message' => 'Token tidak valid.'], 404);
        }

        // B. Validasi Waktu
        $now = Carbon::now();
        if (!$session->is_active || $session->closed_at < $now) {
            return response()->json(['message' => 'Sesi absensi sudah ditutup atau berakhir.'], 400);
        }

        // C. Cari Record Absensi Siswa Ini
        // (Ingat: Record sudah dibuat otomatis status 'A' saat guru buka sesi)
        $attendance = Attendance::where('attendance_session_id', $session->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'Anda tidak terdaftar di sesi kelas ini.'], 403);
        }

        // D. Cek apakah sudah absen duluan?
        if ($attendance->status === 'H') {
            return response()->json(['message' => 'Anda sudah melakukan absensi sebelumnya.'], 200);
        }

        // E. Update Jadi HADIR
        $attendance->update([
            'status' => 'H',
            'check_in_at' => $now,
            'ip_address' => $request->ip() // Catat IP untuk keamanan
        ]);

        return response()->json([
            'message' => 'Berhasil! Absensi tercatat.',
            'detail' => [
                'subject' => $session->course->subject->name ?? 'Kelas',
                'title' => $session->title,
                'time' => $now->format('H:i')
            ]
        ]);
    }
}