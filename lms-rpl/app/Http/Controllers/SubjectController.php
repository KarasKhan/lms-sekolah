<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    // GET /api/subjects
    public function index()
    {
        $subjects = Subject::orderBy('name', 'asc')->get();
        return response()->json($subjects);
    }

    // POST /api/subjects
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:subjects,code',
            'type' => 'required|in:general,vocational',
        ]);

        // Auto uppercase kode mapel biar rapi
        $validated['code'] = strtoupper($validated['code']);

        Subject::create($validated);

        return response()->json(['message' => 'Mata pelajaran berhasil ditambahkan']);
    }

    // PUT /api/subjects/{id}
    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            // Unique tapi ignore ID diri sendiri
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects')->ignore($subject->id)],
            'type' => 'required|in:general,vocational',
        ]);

        $validated['code'] = strtoupper($validated['code']);
        
        $subject->update($validated);

        return response()->json(['message' => 'Mata pelajaran diperbarui']);
    }

    // DELETE /api/subjects/{id}
    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();
        return response()->json(['message' => 'Mata pelajaran dihapus']);
    }
}