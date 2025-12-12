import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../../lib/axios';
import { BookOpen, ChevronRight, AlertCircle, FileText, Layout, CheckSquare } from 'lucide-react';

export default function HasilKuis() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quizzesGrouped, setQuizzesGrouped] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axiosClient.get('/teacher/grades/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setQuizzesGrouped(null);

    if (courseId) {
      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/teacher/grades/courses/${courseId}/quizzes`);
        setQuizzesGrouped(res.data);
      } catch (error) {
        alert("Gagal memuat data kuis");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper Grouping
  const groupQuizzesByLesson = (quizList) => {
    return quizList.reduce((groups, item) => {
      const lesson = item.lesson;
      if (!groups[lesson]) groups[lesson] = [];
      groups[lesson].push(item);
      return groups;
    }, {});
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hasil Penilaian Kuis</h1>
        <p className="text-gray-500">Pilih kelas untuk melihat rekapitulasi nilai.</p>
      </div>

      {/* FILTER KELAS */}
      <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-8 flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <BookOpen size={24} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Kelas</label>
          <select 
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedCourseId}
            onChange={handleCourseChange}
          >
            <option value="">-- Pilih Kelas --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <div className="text-center py-10 text-gray-500">Memuat data kuis...</div>}

      {selectedCourseId && quizzesGrouped && (
        <div className="space-y-10 animate-fade-in">
          
          {Object.keys(quizzesGrouped).length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900">Belum Ada Kuis</h3>
                <p className="text-gray-500">Guru belum membuat kuis apapun di kelas ini.</p>
            </div>
          ) : (
            // LEVEL 1: BAB (CHAPTER)
            Object.keys(quizzesGrouped).map((chapterTitle, idx) => {
                const quizzesInChapter = quizzesGrouped[chapterTitle];
                const lessonsGrouped = groupQuizzesByLesson(quizzesInChapter);

                return (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    
                    {/* --- UPDATE: HEADER BAB DENGAN PREFIX "BAB" --- */}
                    <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                      <Layout size={20} className="text-gray-600" />
                      <span className="font-bold text-gray-800 uppercase text-sm tracking-wide">
                        BAB: {chapterTitle}
                      </span>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* LEVEL 2: SUB-BAB (LESSON) */}
                        {Object.keys(lessonsGrouped).map((lessonTitle, lIdx) => (
                            <div key={lIdx} className="border-l-4 border-indigo-100 pl-6 ml-2">
                                
                                {/* --- UPDATE: JUDUL SUB-BAB DENGAN PREFIX "Materi" --- */}
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText size={18} className="text-indigo-500" />
                                    <h4 className="font-bold text-gray-700 text-lg">
                                        Materi: {lessonTitle}
                                    </h4>
                                </div>

                                {/* LEVEL 3: LIST KUIS */}
                                <div className="grid grid-cols-1 gap-4">
                                    {lessonsGrouped[lessonTitle].map((quiz, qIdx) => (
                                        <div key={qIdx} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-300 hover:shadow-md transition group gap-4">
                                            
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-green-100 text-green-600 rounded-lg shrink-0">
                                                    <CheckSquare size={24} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition">{quiz.quiz_title}</h5>
                                                    <div className="flex gap-3 mt-1">
                                                        <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 font-medium">Pilihan Ganda</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 ml-14 md:ml-0">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-indigo-600">{quiz.total_attempts}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Siswa Submit</p>
                                                </div>
                                                <div className="text-center border-l pl-6 border-gray-200">
                                                    <p className={`text-2xl font-black ${quiz.average_score >= 75 ? 'text-green-600' : 'text-orange-500'}`}>
                                                        {quiz.average_score}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Rata-rata</p>
                                                </div>
                                                
                                                <Link 
                                                    to={`/teacher/grades/quizzes/${quiz.quiz_id}`}
                                                    className="ml-4 px-5 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white font-bold text-sm flex items-center gap-2 transition shadow-sm"
                                                >
                                                    Rincian <ChevronRight size={16} />
                                                </Link>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                            </div>
                        ))}
                    </div>
                  </div>
                );
            })
          )}
        </div>
      )}

    </div>
  );
}