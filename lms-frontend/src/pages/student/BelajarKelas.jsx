import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { 
  ArrowLeft, ChevronDown, ChevronRight, CheckCircle, Circle, 
  ArrowRight as ArrowRightIcon, Menu, X, Clock, Lock
} from 'lucide-react';
import StudentBlockRenderer from '../../components/student/StudentBlockRenderer';

export default function BelajarKelas() {
  const { id } = useParams();
  
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- TIMER & BLOCKING ---
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isTimerCompleted, setIsTimerCompleted] = useState(true);
  const timerRef = useRef(null);

  // 1. Fetch Course Data
  const fetchCourse = async (retainActiveLesson = false) => {
    try {
      // Jika first load, set loading true. Jika refresh data (upload), jangan loading full screen
      if (!retainActiveLesson) setIsLoading(true);

      const response = await axiosClient.get(`/student/courses/${id}/learn`);
      setCourse(response.data);
      
      // Setup Sidebar Expand
      if (!retainActiveLesson) {
          const initialExpand = {};
          response.data.chapters.forEach(ch => initialExpand[ch.id] = true);
          setExpandedChapters(initialExpand);
      }

      // Logic Penentuan Active Lesson
      if (retainActiveLesson && activeLesson) {
        // --- LOGIC PENTING: CARI MATERI YANG SAMA DI DATA BARU ---
        // Agar tidak lompat ke materi awal, kita cari ID materi yang sedang dibuka
        let foundLesson = null;
        response.data.chapters.forEach(ch => {
            const match = ch.lessons.find(l => l.id === activeLesson.id);
            if (match) foundLesson = match;
        });
        
        if (foundLesson) {
            setActiveLesson(foundLesson); // Update state dengan data baru (termasuk user_progress)
        }
      } 
      else if (!activeLesson && response.data.chapters.length > 0) {
        // Default: Buka materi pertama
        const firstLesson = response.data.chapters[0].lessons[0];
        if (firstLesson) handleSelectLesson(firstLesson);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  // --- FUNGSI REFRESH KHUSUS UNTUK CHILD COMPONENT ---
  // Dipanggil setelah upload tugas / submit kuis agar data terupdate tanpa reload page
  const handleRefreshData = () => {
      fetchCourse(true); // true = pertahankan lesson yang sedang aktif
  };

  // --- LOGIC TIMER ---
  useEffect(() => {
    if (activeLesson) {
        const requiredSeconds = (activeLesson.min_read_time || 0) * 60;
        if (activeLesson.is_completed) {
            setTimeLeft(0);
            setIsTimerCompleted(true);
        } else {
            // Hanya reset timer jika berganti lesson ID, bukan saat refresh data
            // (Opsional: logic ini bisa diperhalus lagi jika timer ingin strict)
            setTimeLeft(prev => prev > 0 ? prev : requiredSeconds); 
            setIsTimerCompleted(requiredSeconds === 0);
        }
    }
  }, [activeLesson?.id]); // Dependency hanya ID, biar gak reset pas refresh data

  useEffect(() => {
    if (timeLeft > 0) {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setIsTimerCompleted(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else {
        clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- HELPER: CEK REQUIRED CONTENT ---
  const checkRequiredContents = () => {
    if (!activeLesson?.contents) return true;

    // Cari konten yang WAJIB tapi BELUM LULUS
    const pendingRequired = activeLesson.contents.filter(block => {
        if (!block.is_required) return false; // Kalau gak wajib, skip

        const progress = block.user_progress;
        
        // 1. Belum dikerjakan sama sekali -> BLOCK
        if (!progress) return true; 
        
        // 2. Tipe Kuis: Harus status completed
        if (block.type === 'quiz' && progress.status !== 'completed') return true;
        
        // 3. Tipe Tugas: Harus status 'accepted'
        // Jika status 'pending' (menunggu nilai) atau 'rejected' (revisi) -> BLOCK
        if (block.type === 'assignment' && progress.status !== 'accepted') return true;
        
        return false;
    });

    return pendingRequired.length === 0; // True jika semua syarat terpenuhi
  };

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    setTimeLeft((lesson.min_read_time || 0) * 60); // Reset timer saat ganti materi manual
    setIsSidebarOpen(false);
    window.scrollTo(0,0);
  };

  const handleCompleteNext = async () => {
    if (!activeLesson) return;

    if (!isTimerCompleted) {
        alert(`Ups! Kamu harus membaca materi ini selama ${formatTime(timeLeft)} lagi sebelum lanjut.`);
        return;
    }
    if (!checkRequiredContents()) {
        alert("Ada Kuis atau Tugas WAJIB yang belum kamu kerjakan/kumpulkan!");
        return;
    }

    try {
      await axiosClient.post(`/student/lessons/${activeLesson.id}/complete`);
      
      // Update lokal biar cepet (Optimistic UI)
      setCourse(prev => {
        const newChapters = prev.chapters.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(l => l.id === activeLesson.id ? { ...l, is_completed: true } : l)
        }));
        return { ...prev, chapters: newChapters };
      });

      // Cari Next Lesson
      let allLessons = [];
      course.chapters.forEach(ch => allLessons = [...allLessons, ...ch.lessons]);
      const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
      
      if (currentIndex < allLessons.length - 1) {
        handleSelectLesson(allLessons[currentIndex + 1]);
      } else {
        alert("Selamat! Anda telah menyelesaikan semua materi di kelas ini 🎉");
      }

    } catch (error) {
      console.error("Gagal menyimpan progress", error);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center">Memuat Kelas...</div>;
  if (!course) return <div className="p-10 text-center">Kelas tidak ditemukan.</div>;

  const isNextDisabled = !isTimerCompleted || !checkRequiredContents();

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/student" className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></Link>
            <span className="font-bold text-gray-800 truncate w-40">{course.subject?.name}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <button onClick={() => setExpandedChapters(p => ({...p, [chapter.id]: !p[chapter.id]}))} className="flex items-center gap-2 w-full text-left font-bold text-gray-700 text-sm mb-2 hover:text-indigo-600 transition">
                {expandedChapters[chapter.id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} <span className="truncate">{chapter.title}</span>
              </button>
              {expandedChapters[chapter.id] && (
                <div className="space-y-1 ml-2 border-l-2 border-gray-200 pl-2">
                  {chapter.lessons.map((lesson) => (
                    <button key={lesson.id} onClick={() => handleSelectLesson(lesson)} className={`flex items-start gap-3 w-full text-left p-2 rounded-lg text-sm transition-all ${activeLesson?.id === lesson.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                      {lesson.is_completed ? <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> : <Circle size={16} className="text-gray-300 mt-0.5 shrink-0" />}
                      <span className="leading-snug line-clamp-2">{lesson.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        <div className="md:hidden h-14 border-b flex items-center px-4 bg-white sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600"><Menu size={24} /></button>
          <span className="ml-3 font-bold truncate text-gray-800">{activeLesson?.title}</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto p-6 md:p-12">
            {activeLesson ? (
              <div className="animate-fade-in pb-20">
                <div className="mb-8 pb-6 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs uppercase tracking-wide font-bold mb-2 inline-block">{activeLesson.type}</span>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{activeLesson.title}</h1>
                  </div>
                  {!isTimerCompleted && (
                    <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full border border-orange-200 animate-pulse">
                        <Clock size={18} />
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {activeLesson.contents && activeLesson.contents.length > 0 ? (
                    activeLesson.contents.map((block) => (
                      <div key={block.id} className="relative">
                        {block.is_required && (
                            <div className="absolute -top-3 left-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 z-10 flex items-center gap-1">
                                <Lock size={10} /> WAJIB
                            </div>
                        )}
                        {/* OPER FUNGSI REFRESH KE CHILD */}
                        <StudentBlockRenderer block={block} onRefresh={handleRefreshData} />
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">Belum ada konten.</div>
                  )}
                </div>

                <div className="mt-20 pt-8 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleCompleteNext}
                    disabled={isNextDisabled}
                    className={`
                        px-6 md:px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg
                        ${isNextDisabled 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                            : activeLesson.is_completed 
                                ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-200'
                        }
                    `}
                  >
                    {!isTimerCompleted ? (
                        <> Tunggu {formatTime(timeLeft)} <Clock size={20} /> </>
                    ) : !checkRequiredContents() ? (
                        <> Selesaikan Tugas Wajib <Lock size={20} /> </>
                    ) : activeLesson.is_completed ? (
                        <> Lanjut Berikutnya <ArrowRightIcon size={20} /> </>
                    ) : (
                        <> Tandai Selesai & Lanjut <ArrowRightIcon size={20} /> </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400 py-20">Pilih materi di sidebar.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}