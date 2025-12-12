<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonContent;
use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LessonContentController extends Controller
{
    // GET: Ambil konten + Detail Lesson
    public function index($lessonId)
    {
        $lesson = \App\Models\Lesson::findOrFail($lessonId);
        
        $contents = LessonContent::where('lesson_id', $lessonId)
            ->orderBy('sort_order', 'asc')
            ->get();

        // Kembalikan Object: { lesson: ..., contents: ... }
        return response()->json([
            'lesson' => $lesson,
            'contents' => $contents
        ]);
    }

    // POST: Tambah Blok Baru
    public function store(Request $request)
    {
        $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'type'      => 'required|in:rich_text,media,document,assignment,quiz,coding',
            'file'      => 'required_if:type,document|mimes:pdf,doc,docx|max:10240', // Max 10MB
        ]);

        return DB::transaction(function () use ($request) {
            
            // 1. Tentukan Urutan (Taruh di paling bawah)
            $maxOrder = LessonContent::where('lesson_id', $request->lesson_id)->max('sort_order');
            $nextOrder = $maxOrder ? $maxOrder + 1 : 1;

            $contentDataToSave = null; 
            $filePath = null;

            // --- KASUS 1: KUIS (AUTO CREATE) ---
            if ($request->type === 'quiz') {
                $quizInput = json_decode($request->input('content'), true); 
                
                // Buat Header Quiz
                $quiz = Quiz::create([
                    'title' => $quizInput['title'] ?? 'Kuis Latihan',
                    'description' => 'Dibuat dari editor materi',
                    'type' => 'practice',
                    'is_published' => true
                ]);

                // Buat Soal
                if (isset($quizInput['questions']) && is_array($quizInput['questions'])) {
                    foreach ($quizInput['questions'] as $q) {
                        if (!empty($q['question'])) {
                            Question::create([
                                'quiz_id' => $quiz->id,
                                'question_text' => $q['question'],
                                'options' => $q['options'],
                                'correct_answer_index' => (int)$q['answer'],
                                'points' => 10
                            ]);
                        }
                    }
                }

                // Simpan Referensi ID di JSON Content
                $contentDataToSave = [
                    'quiz_id' => $quiz->id,
                    'quiz_title' => $quiz->title,
                    'total_questions' => count($quizInput['questions'] ?? [])
                ];
            }
            
            // --- KASUS 2: DOKUMEN (UPLOAD) ---
            else if ($request->type === 'document' && $request->hasFile('file')) {
                $path = $request->file('file')->store('materials', 'public');
                
                $contentDataToSave = [
                    'original_name' => $request->file('file')->getClientOriginalName(),
                    'size' => $request->file('file')->getSize(),
                    'mime_type' => $request->file('file')->getMimeType()
                ];
                $filePath = $path;
            } 
            
            // --- KASUS 3: TEXT/VIDEO/CODING/ASSIGNMENT ---
            else {
                $input = $request->input('content');
                $contentDataToSave = is_string($input) ? json_decode($input, true) : $input;
            }

            // Simpan Blok Utama
            // filter_var digunakan untuk menangani string "true"/"false" dari FormData
            $contentBlock = LessonContent::create([
                'lesson_id'  => $request->lesson_id,
                'type'       => $request->type,
                'sort_order' => $nextOrder,
                'content'    => $contentDataToSave,
                'file_path'  => $filePath,
                'is_required' => filter_var($request->is_required, FILTER_VALIDATE_BOOLEAN) 
            ]);

            return response()->json([
                'message' => 'Konten berhasil ditambahkan',
                'data'    => $contentBlock
            ], 201);
        });
    }

    // PUT: Update Blok (Fitur Edit)
    public function update(Request $request, $id)
    {
        $contentBlock = LessonContent::findOrFail($id);

        return DB::transaction(function () use ($request, $contentBlock) {
            
            $dataToUpdate = [];
            
            // Update status Wajib (Required)
            if ($request->has('is_required')) {
                $dataToUpdate['is_required'] = filter_var($request->is_required, FILTER_VALIDATE_BOOLEAN);
            }

            // --- UPDATE KUIS ---
            if ($contentBlock->type === 'quiz') {
                $quizInput = json_decode($request->input('content'), true);
                $quizId = $contentBlock->content['quiz_id'] ?? null;
                
                if ($quizId) {
                    $quiz = Quiz::findOrFail($quizId);
                    $quiz->update(['title' => $quizInput['title'] ?? $quiz->title]);

                    // Reset Soal (Hapus lama, buat baru - cara paling aman sinkronisasi)
                    $quiz->questions()->delete();

                    if (isset($quizInput['questions']) && is_array($quizInput['questions'])) {
                        foreach ($quizInput['questions'] as $q) {
                            if (!empty($q['question'])) {
                                Question::create([
                                    'quiz_id' => $quiz->id,
                                    'question_text' => $q['question'],
                                    'options' => $q['options'],
                                    'correct_answer_index' => (int)$q['answer'],
                                    'points' => 10
                                ]);
                            }
                        }
                    }

                    // Update metadata
                    $dataToUpdate['content'] = [
                        'quiz_id' => $quiz->id,
                        'quiz_title' => $quiz->title,
                        'total_questions' => count($quizInput['questions'] ?? [])
                    ];
                }
            }
            // --- UPDATE DOKUMEN (Ganti File) ---
            else if ($contentBlock->type === 'document' && $request->hasFile('file')) {
                // Hapus file lama
                if ($contentBlock->file_path) {
                    Storage::disk('public')->delete($contentBlock->file_path);
                }
                
                // Upload baru
                $path = $request->file('file')->store('materials', 'public');
                $dataToUpdate['file_path'] = $path;
                $dataToUpdate['content'] = [
                    'original_name' => $request->file('file')->getClientOriginalName(),
                    'size' => $request->file('file')->getSize(),
                    'mime_type' => $request->file('file')->getMimeType()
                ];
            }
            // --- UPDATE TEXT/VIDEO/CODING/ASSIGNMENT ---
            else if ($contentBlock->type !== 'document') {
                $input = $request->input('content');
                // Pastikan decode jika string, atau pakai array langsung
                $contentPayload = is_string($input) ? json_decode($input, true) : $input;
                
                // Jika Assignment/Coding, contentPayload akan berisi instruction, dll
                if ($contentPayload) {
                    $dataToUpdate['content'] = $contentPayload;
                }
            }

            // Lakukan Update
            if (!empty($dataToUpdate)) {
                $contentBlock->update($dataToUpdate);
            }

            return response()->json(['message' => 'Konten berhasil diperbarui']);
        });
    }

    // PUT: Update Setting Lesson (Waktu Baca Minimal)
    // Route: /teacher/lessons/{id}/settings
    public function updateLessonSettings(Request $request, $id)
    {
        $request->validate([
            'min_read_time' => 'required|integer|min:0'
        ]);
        
        $lesson = Lesson::findOrFail($id);
        $lesson->update(['min_read_time' => $request->min_read_time]);
        
        return response()->json(['message' => 'Pengaturan pelajaran diperbarui']);
    }

    // DELETE: Hapus Blok
    public function destroy($id)
    {
        $content = LessonContent::findOrFail($id);

        // Hapus file fisik jika ada
        if ($content->type === 'document' && $content->file_path) {
            Storage::disk('public')->delete($content->file_path);
        }

        $content->delete();

        return response()->json(['message' => 'Blok materi dihapus']);
    }
    
    // PUT: Reorder (Drag & Drop)
    public function reorder(Request $request)
    {
        $request->validate(['items' => 'required|array']);

        foreach ($request->items as $item) {
            LessonContent::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Urutan diperbarui']);
    }
}