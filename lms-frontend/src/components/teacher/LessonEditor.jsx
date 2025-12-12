import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import BlockRenderer from './BlockRenderer';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { 
  Plus, Type, Video, FileText, Code, Loader2, 
  CheckSquare, UploadCloud, Trash2, X, Save, Clock, Calendar 
} from 'lucide-react';

export default function LessonEditor({ lessonId }) {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Mode Input & Edit
  const [addMode, setAddMode] = useState(null); 
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE KONTEN ---
  const [editorContent, setEditorContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState(''); 
  const [fileUpload, setFileUpload] = useState(null); 
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([{ question: '', options: ['',''], answer: 0 }]);
  
  const [assignmentData, setAssignmentData] = useState({ instruction: '', deadline: '' });
  const [codingData, setCodingData] = useState({ instruction: '', starter_code: '' });

  // --- STATE SETTING ---
  const [minReadTime, setMinReadTime] = useState(0); 
  const [isRequired, setIsRequired] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Style Konsisten (Sama seperti Admin/Guru Dashboard)
  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2";

  // Config Toolbar Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const fetchBlocks = async () => {
    try {
      const response = await axiosClient.get(`/teacher/lessons/${lessonId}/contents`);
      if (Array.isArray(response.data)) {
          setBlocks(response.data);
      } else {
          setBlocks(response.data.contents);
          setMinReadTime(response.data.lesson.min_read_time || 0);
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if(lessonId) {
      resetForm();
      fetchBlocks();
    }
  }, [lessonId]);

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus blok konten ini?")) return;
    try {
      await axiosClient.delete(`/teacher/contents/${id}`);
      fetchBlocks();
    } catch (error) { alert("Gagal menghapus"); }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
        await axiosClient.put(`/teacher/lessons/${lessonId}/settings`, { min_read_time: minReadTime });
        alert("Pengaturan waktu berhasil disimpan! ✅");
    } catch (error) {
        alert("Gagal menyimpan pengaturan.");
    } finally {
        setIsSavingSettings(false);
    }
  };

  const resetForm = () => {
    setAddMode(null);
    setEditingBlockId(null);
    setEditorContent('');
    setMediaUrl('');
    setFileUpload(null);
    setQuizTitle('');
    setQuizQuestions([{ question: '', options: ['',''], answer: 0 }]);
    setAssignmentData({ instruction: '', deadline: '' });
    setCodingData({ instruction: '', starter_code: '' });
    setIsRequired(false);
  };

  const handleEdit = async (block) => {
    setEditingBlockId(block.id);
    const modeMap = {
        'rich_text': 'text', 'media': 'video', 'document': 'document',
        'quiz': 'quiz', 'assignment': 'assignment', 'coding': 'coding'
    };
    setAddMode(modeMap[block.type] || block.type);
    setIsRequired(block.is_required || false); 

    if (block.type === 'rich_text') {
        const html = typeof block.content === 'object' ? block.content.html : block.content;
        setEditorContent(html || '');
    }
    else if (block.type === 'media') {
        setMediaUrl(block.content?.url || '');
    }
    else if (block.type === 'coding') {
        setCodingData({
            instruction: block.content.instruction || '',
            starter_code: block.content.starter_code || ''
        });
    }
    else if (block.type === 'assignment') {
        setAssignmentData({
            instruction: block.content.instruction || '',
            deadline: block.content.deadline || ''
        });
    }
    else if (block.type === 'quiz') {
        if (block.content.quiz_id) {
            try {
                const res = await axiosClient.get(`/student/quizzes/${block.content.quiz_id}`);
                const quiz = res.data.quiz;
                setQuizTitle(quiz.title);
                const mappedQuestions = quiz.questions.map(q => ({
                    question: q.question_text,
                    options: q.options,
                    answer: 0 
                }));
                setQuizQuestions(mappedQuestions.length > 0 ? mappedQuestions : [{ question: '', options: ['',''], answer: 0 }]);
            } catch(e) { console.error("Gagal load quiz", e); }
        }
    }
    
    setTimeout(() => {
        const modal = document.getElementById('editor-modal');
        if(modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSaveBlock = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('lesson_id', lessonId);
      formData.append('is_required', isRequired ? 1 : 0);

      let typeToSend = addMode === 'text' ? 'rich_text' : addMode;
      if (addMode === 'video') typeToSend = 'media';

      let contentToSend = {};

      if (addMode === 'text') {
        contentToSend = { html: editorContent };
        formData.append('content', JSON.stringify(contentToSend));
      } 
      else if (addMode === 'video') {
        contentToSend = { url: mediaUrl };
        formData.append('content', JSON.stringify(contentToSend));
      }
      else if (addMode === 'document') {
        if (fileUpload) formData.append('file', fileUpload);
      }
      else if (addMode === 'quiz') {
        contentToSend = { 
            title: quizTitle || 'Kuis Latihan',
            questions: quizQuestions,
            quiz_id: editingBlockId ? blocks.find(b => b.id === editingBlockId)?.content?.quiz_id : null
        };
        formData.append('content', JSON.stringify(contentToSend));
      }
      else if (addMode === 'assignment') {
        contentToSend = assignmentData;
        formData.append('content', JSON.stringify(contentToSend));
      }
      else if (addMode === 'coding') {
        contentToSend = { ...codingData, language: 'html' };
        formData.append('content', JSON.stringify(contentToSend));
      }

      formData.append('type', typeToSend);

      if (editingBlockId) {
        await axiosClient.post(`/teacher/contents/${editingBlockId}?_method=PUT`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axiosClient.post('/teacher/contents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      resetForm();
      fetchBlocks();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => setQuizQuestions([...quizQuestions, { question: '', options: ['',''], answer: 0 }]);
  const removeQuestion = (idx) => setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  const updateQuestionText = (idx, text) => { const newQ = [...quizQuestions]; newQ[idx].question = text; setQuizQuestions(newQ); };
  const addOption = (qIdx) => { const newQ = [...quizQuestions]; newQ[qIdx].options.push(''); setQuizQuestions(newQ); };
  const removeOption = (qIdx, oIdx) => { const newQ = [...quizQuestions]; newQ[qIdx].options = newQ[qIdx].options.filter((_, i) => i !== oIdx); setQuizQuestions(newQ); };
  const updateOptionText = (qIdx, oIdx, text) => { const newQ = [...quizQuestions]; newQ[qIdx].options[oIdx] = text; setQuizQuestions(newQ); };
  const setCorrectAnswer = (qIdx, oIdx) => { const newQ = [...quizQuestions]; newQ[qIdx].answer = oIdx; setQuizQuestions(newQ); };

  if (!lessonId) return <div className="text-center text-gray-400 mt-20">Pilih materi di sidebar kiri.</div>;
  if (isLoading) return <div className="text-center mt-10">Memuat konten...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-40">
      
      {/* SETTING WAKTU BACA */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Clock size={20} />
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm">Syarat Waktu Baca</h4>
                <p className="text-xs text-gray-500">Siswa wajib diam di halaman ini selama:</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <input 
                type="number" 
                min="0"
                className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                value={minReadTime}
                onChange={(e) => setMinReadTime(e.target.value)}
            />
            <span className="text-sm font-medium text-gray-600 mr-2">Menit</span>
            
            <button 
                onClick={handleSaveSettings} 
                disabled={isSavingSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1 disabled:bg-gray-400"
            >
                {isSavingSettings ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                Simpan
            </button>
        </div>
      </div>

      {/* LIST BLOCKS */}
      <div className="space-y-6 min-h-[100px]">
        {blocks.length === 0 && !addMode && (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Materi ini masih kosong.</p>
            <p className="text-sm text-gray-400">Silakan pilih jenis konten di bawah untuk mulai mengisi.</p>
          </div>
        )}
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>

      {/* --- MODAL INPUT AREA --- */}
      {addMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div id="editor-modal" className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl my-10 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                <h3 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
                {editingBlockId ? <Edit2Icon /> : <Plus />}
                {editingBlockId ? 'Edit Konten' : `Tambah ${addMode}`}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-red-500 bg-gray-100 p-2 rounded-full transition"><X size={20}/></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
                
                {/* FORM COMPONENTS */}
                {addMode === 'text' && <ReactQuill theme="snow" value={editorContent} onChange={setEditorContent} modules={quillModules} className="h-80 mb-12" placeholder="Tulis materi..." />}

                {addMode === 'video' && (
                    <div>
                        <label className={labelClass}>Link Youtube</label>
                        <input type="url" className={inputClass} placeholder="https://..." value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} autoFocus />
                    </div>
                )}

                {addMode === 'document' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition">
                        <UploadCloud size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-4">Klik tombol di bawah untuk memilih file PDF</p>
                        <input type="file" accept=".pdf" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={e => setFileUpload(e.target.files[0])} />
                    </div>
                )}

                {addMode === 'quiz' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <input type="checkbox" id="reqCheck" className="w-5 h-5 text-red-600 focus:ring-red-500 rounded cursor-pointer" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
                            <label htmlFor="reqCheck" className="text-sm font-bold text-red-700 cursor-pointer select-none">Wajib Dikerjakan (Syarat Lanjut)</label>
                        </div>
                        <div>
                            <label className={labelClass}>Judul Kuis</label>
                            <input type="text" className={inputClass} placeholder="Contoh: Kuis Harian 1" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
                        </div>
                        
                        {quizQuestions.map((q, qIdx) => (
                            <div key={qIdx} className="p-5 bg-gray-50 rounded-xl border border-gray-200 relative">
                                <button onClick={() => removeQuestion(qIdx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Pertanyaan {qIdx + 1}</label>
                                    <input type="text" className={inputClass} value={q.question} onChange={e => updateQuestionText(qIdx, e.target.value)} placeholder="Tulis pertanyaan..." />
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-3">
                                            <input type="radio" name={`ans-${qIdx}`} checked={q.answer === oIdx} onChange={() => setCorrectAnswer(qIdx, oIdx)} className="w-4 h-4 text-indigo-600 cursor-pointer" />
                                            <input type="text" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition ${q.answer === oIdx ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-300'}`} value={opt} onChange={e => updateOptionText(qIdx, oIdx, e.target.value)} placeholder={`Opsi ${oIdx+1}`} />
                                            <button onClick={() => removeOption(qIdx, oIdx)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addOption(qIdx)} className="text-xs text-indigo-600 font-bold hover:underline mt-2 flex items-center gap-1"><Plus size={14} /> Tambah Opsi</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 flex items-center justify-center gap-2"><Plus size={20} /> Tambah Pertanyaan</button>
                    </div>
                )}

                {/* --- BAGIAN FORM ASSIGNMENT (DIPERBAIKI) --- */}
                {addMode === 'assignment' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <input type="checkbox" id="reqCheckAss" className="w-5 h-5 text-red-600 focus:ring-red-500 rounded cursor-pointer" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
                            <label htmlFor="reqCheckAss" className="text-sm font-bold text-red-700 cursor-pointer select-none">Wajib Dikerjakan (Syarat Lanjut)</label>
                        </div>
                        
                        <div>
                            <label className={labelClass}>Instruksi Tugas</label>
                            <textarea 
                                className={`${inputClass} min-h-[120px] resize-y`} 
                                placeholder="Jelaskan apa yang harus dikerjakan siswa..." 
                                value={assignmentData.instruction} 
                                onChange={e => setAssignmentData({...assignmentData, instruction: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Deadline Pengumpulan</label>
                            {/* INPUT DATE DI-STYLING AGAR KONSISTEN & PROPER */}
                            <div className="relative">
                                <input 
                                    type="datetime-local" 
                                    className={`${inputClass} appearance-none`} // Tambahkan appearance-none
                                    value={assignmentData.deadline} 
                                    onChange={e => setAssignmentData({...assignmentData, deadline: e.target.value})} 
                                    // Set minimal tanggal hari ini
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                {/* Ikon Kalender sebagai pemanis visual */}
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                                    <Calendar size={20} />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock size={12} /> Format: Bulan/Tanggal/Tahun, Jam:Menit
                            </p>
                        </div>
                    </div>
                )}

                {addMode === 'coding' && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Instruksi Soal</label>
                            <textarea className={`${inputClass} min-h-[100px]`} placeholder="Tulis soal koding..." value={codingData.instruction} onChange={e => setCodingData({...codingData, instruction: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Starter Code (Opsional)</label>
                            <textarea className={`${inputClass} font-mono bg-gray-900 text-green-400 border-gray-700 min-h-[150px]`} placeholder="// Kode awal..." value={codingData.starter_code} onChange={e => setCodingData({...codingData, starter_code: e.target.value})} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white rounded-b-2xl">
                <button onClick={resetForm} className="px-5 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition">Batal</button>
                <button onClick={handleSaveBlock} disabled={isSaving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium shadow-md transition">
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                    Simpan Perubahan
                </button>
            </div>

          </div>
        </div>
      )}

      {!addMode && (
        <div className="sticky bottom-6 mt-10 z-10">
            <div className="bg-white/90 backdrop-blur-md border border-indigo-100 shadow-2xl rounded-2xl p-4 max-w-3xl mx-auto transform hover:scale-105 transition duration-300">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 text-center tracking-widest">Tambahkan Komponen</p>
                <div className="grid grid-cols-6 gap-2">
                    <button onClick={() => setAddMode('text')} className="flex flex-col items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg group transition"><div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition"><Type size={20}/></div><span className="text-[10px] font-medium text-gray-600">Teks</span></button>
                    <button onClick={() => setAddMode('video')} className="flex flex-col items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg group transition"><div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition"><Video size={20}/></div><span className="text-[10px] font-medium text-gray-600">Video</span></button>
                    <button onClick={() => setAddMode('document')} className="flex flex-col items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg group transition"><div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition"><FileText size={20}/></div><span className="text-[10px] font-medium text-gray-600">PDF</span></button>
                    <button onClick={() => setAddMode('quiz')} className="flex flex-col items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg group transition"><div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition"><CheckSquare size={20}/></div><span className="text-[10px] font-medium text-gray-600">Kuis</span></button>
                    <button onClick={() => setAddMode('assignment')} className="flex flex-col items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg group transition"><div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition"><UploadCloud size={20}/></div><span className="text-[10px] font-medium text-gray-600">Tugas</span></button>
                    <button onClick={() => setAddMode('coding')} className="flex flex-col items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg group transition"><div className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition"><Code size={20}/></div><span className="text-[10px] font-medium text-gray-600">Coding</span></button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

const Edit2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);