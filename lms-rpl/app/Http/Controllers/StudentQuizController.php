<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentQuizController extends Controller
{
    // GET /api/student/quizzes/{id}
    public function show($id)
    {
        // Ambil Quiz beserta Soal-soalnya
        // PENTING: Kita gunakan `makeHidden` nanti di collection untuk menyembunyikan kunci jawaban
        $quiz = Quiz::with(['questions' => function($q) {
            $q->select('id', 'quiz_id', 'question_text', 'options', 'points'); 
            // Perhatikan: Kita TIDAK select 'correct_answer_index' agar tidak dikirim ke frontend (Anti-Cheat)
        }])->findOrFail($id);

        // Cek apakah siswa sudah pernah mengerjakan?
        $existingAttempt = QuizAttempt::where('quiz_id', $id)
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'quiz' => $quiz,
            'last_attempt' => $existingAttempt
        ]);
    }

    // POST /api/student/quizzes/{id}/submit
    public function submit(Request $request, $id)
    {
        $request->validate([
            'answers' => 'required|array', // Format: { question_id: answer_index, ... }
        ]);

        $quiz = Quiz::with('questions')->findOrFail($id);
        $userAnswers = $request->answers;
        
        $totalScore = 0;
        $earnedScore = 0;
        $detailAnswers = [];

        // Logic Hitung Nilai (Server Side Calculation)
        foreach ($quiz->questions as $question) {
            $totalScore += $question->points;
            
            // Jawaban siswa untuk soal ini
            $studentAnswer = $userAnswers[$question->id] ?? null; 
            
            // Cek Benar/Salah
            $isCorrect = false;
            if ($studentAnswer !== null && (int)$studentAnswer === (int)$question->correct_answer_index) {
                $earnedScore += $question->points;
                $isCorrect = true;
            }

            // Simpan snapshot jawaban
            $detailAnswers[$question->id] = [
                'answer' => $studentAnswer,
                'is_correct' => $isCorrect
            ];
        }

        // Hitung Nilai Akhir (Skala 100)
        // Jika total poin 0 (error case), nilai 0
        $finalGrade = $totalScore > 0 ? round(($earnedScore / $totalScore) * 100) : 0;

        // Simpan ke Database
        $attempt = QuizAttempt::create([
            'quiz_id' => $id,
            'user_id' => Auth::id(),
            'score' => $finalGrade,
            'started_at' => now(), // Idealnya dikirim dari frontend, tapi now() cukup untuk simpel
            'finished_at' => now(),
            'answers_snapshot' => $detailAnswers
        ]);

        return response()->json([
            'message' => 'Ujian selesai!',
            'score' => $finalGrade,
            'attempt' => $attempt
        ]);
    }
}