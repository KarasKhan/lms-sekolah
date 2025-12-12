import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { 
  ArrowLeft, Plus, ChevronDown, ChevronRight, 
  PlayCircle, FileText, Code, Trash2, X, Edit2 
} from 'lucide-react';

import ModalAddMateri from '../../components/teacher/ModalAddMateri';
import LessonEditor from '../../components/teacher/LessonEditor'; 

export default function DetailKelas() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Modal Materi
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  // Editor State
  const [activeLessonId, setActiveLessonId] = useState(null);

  // --- 1. FETCH DATA ---
  const fetchCurriculum = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await axiosClient.get(`/teacher/courses/${id}/curriculum`);
      setCourse(response.data);
      if (!course) {
        const initialExpand = {};
        response.data.chapters.forEach(ch => initialExpand[ch.id] = true);
        setExpandedChapters(initialExpand);
      }
    } catch (error) {
      console.error("Error fetching curriculum:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum(true);
  }, [id]);

  // --- 2. HANDLERS UTAMA ---
  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/teacher/chapters', { course_id: id, title: newChapterTitle });
      setIsChapterModalOpen(false);
      setNewChapterTitle('');
      fetchCurriculum();
    } catch (error) {
      alert('Gagal menambah bab.');
    }
  };

  const handleLessonSuccess = () => {
    fetchCurriculum(); 
  };

  // --- 3. HANDLERS HAPUS ---
  const handleDeleteChapter = async (chapterId) => {
    if(!window.confirm("Yakin hapus Bab ini? Semua materi di dalamnya akan ikut terhapus permanen.")) return;
    try {
      await axiosClient.delete(`/teacher/chapters/${chapterId}`);
      fetchCurriculum(); 
    } catch(e) { alert("Gagal menghapus bab."); }
  };

  const handleDeleteLesson = async (lessonId) => {
    if(!window.confirm("Yakin hapus materi ini?")) return;
    try {
      await axiosClient.delete(`/teacher/lessons/${lessonId}`);
      fetchCurriculum(); 
      if(activeLessonId === lessonId) setActiveLessonId(null); 
    } catch(e) { alert("Gagal menghapus materi."); }
  };

  // --- HANDLER TAMBAH MATERI ---
  const openAddLessonModal = (chapterId) => {
    setSelectedChapterId(chapterId);
    setIsLessonModalOpen(true);
  };

  // --- 4. RENDER ---
  if (isLoading) return <div className="p-10 text-center text-gray-500">Memuat Kurikulum...</div>;
  if (!course) return <div className="p-10 text-center text-red-500">Kelas tidak ditemukan.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link to="/teacher/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{course.subject?.name}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">{course.classroom?.name}</span>
            </p>
          </div>
        </div>
        <button onClick={() => setIsChapterModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
          <Plus size={16} /> Tambah Bab
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        
        {/* SIDEBAR LIST */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          
          {course.chapters.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-400">Belum ada materi.</p>
            </div>
          )}

          {course.chapters.map((chapter) => (
            <div key={chapter.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
              
              {/* --- CHAPTER HEADER (BAB) --- */}
              <div 
                className="flex items-start justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition border-b border-gray-100"
                onClick={() => toggleChapter(chapter.id)}
              >
                {/* [PERBAIKAN] items-start agar icon sejajar atas, hapus truncate, tambah wrap */}
                <div className="flex items-start gap-2 font-bold text-gray-800 text-sm flex-1">
                  <div className="mt-0.5 shrink-0">
                    {expandedChapters[chapter.id] ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                  </div>
                  <span className="whitespace-normal break-words leading-snug">
                    BAB: {chapter.title}
                  </span>
                </div>
                
                {/* ACTION BUTTONS BAB */}
                <div className="flex items-center gap-2 ml-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openAddLessonModal(chapter.id); }}
                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition shrink-0" 
                    title="Tambah Materi"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}
                    className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition shrink-0" 
                    title="Hapus Bab"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* --- LESSON LIST (MATERI) --- */}
              {expandedChapters[chapter.id] && (
                <div className="bg-white">
                  {chapter.lessons.length === 0 ? (
                    <p className="text-xs text-gray-400 p-4 italic text-center">Belum ada pelajaran.</p>
                  ) : (
                    chapter.lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`flex items-start justify-between gap-2 p-3 px-4 cursor-pointer border-b border-gray-50 last:border-0 transition-colors
                          ${activeLessonId === lesson.id 
                            ? 'bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600' 
                            : 'hover:bg-gray-50 text-gray-600 border-l-4 border-l-transparent'
                          }
                        `}
                      >
                        {/* [PERBAIKAN] items-start, hapus truncate, tambah wrap, tambah prefix Sub-bab */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5 shrink-0">
                            {lesson.type === 'video' && <PlayCircle size={16} className={activeLessonId === lesson.id ? "text-indigo-600" : "text-red-500"} />}
                            {lesson.type === 'coding' && <Code size={16} className={activeLessonId === lesson.id ? "text-indigo-600" : "text-green-600"} />}
                            {(lesson.type === 'text' || lesson.type === 'rich_text') && <FileText size={16} className={activeLessonId === lesson.id ? "text-indigo-600" : "text-blue-500"} />}
                          </div>
                          
                          <span className="text-sm font-medium whitespace-normal break-words leading-snug">
                            Sub-bab: {lesson.title}
                          </span>
                        </div>

                        {/* TOMBOL HAPUS MATERI */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded transition shrink-0 ml-1 mt-[-2px]"
                            title="Hapus Materi"
                        >
                            <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT (EDITOR) */}
        <div className="flex-1 bg-white overflow-hidden relative">
          {activeLessonId ? (
            <div className="h-full overflow-y-auto custom-scrollbar p-8">
              <LessonEditor key={activeLessonId} lessonId={activeLessonId} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 bg-gray-50/50">
              <FileText size={48} className="text-indigo-200 mb-4" />
              <h2 className="text-lg font-semibold text-gray-600">Mulai Mengajar</h2>
              <p className="text-sm text-gray-400 mt-1">Pilih materi di sidebar kiri untuk mengedit konten.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL ADD BAB */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Tambah Bab Baru</h3>
            <form onSubmit={handleAddChapter}>
              <input 
                type="text" autoFocus required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Judul Bab"
                value={newChapterTitle}
                onChange={e => setNewChapterTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsChapterModalOpen(false)} className="px-4 py-2 text-gray-600 border rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD MATERI */}
      <ModalAddMateri 
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        chapterId={selectedChapterId}
        onSuccess={handleLessonSuccess}
      />

    </div>
  );
}