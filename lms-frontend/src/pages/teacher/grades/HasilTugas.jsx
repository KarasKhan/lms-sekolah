import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../../lib/axios';
import { BookOpen, ChevronRight, AlertCircle, Layout, UploadCloud, Calendar } from 'lucide-react';

export default function HasilTugas() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignmentsGrouped, setAssignmentsGrouped] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Kelas Guru
  useEffect(() => {
    axiosClient.get('/teacher/grades/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  // 2. Fetch Tugas saat kelas dipilih
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setAssignmentsGrouped(null);

    if (courseId) {
      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/teacher/grades/courses/${courseId}/assignments`);
        setAssignmentsGrouped(res.data);
      } catch (error) {
        alert("Gagal memuat data tugas");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hasil Tugas Harian</h1>
        <p className="text-gray-500">Pilih kelas untuk memeriksa & menilai tugas upload siswa.</p>
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

      {/* LOADING */}
      {isLoading && <div className="text-center py-10 text-gray-500">Memuat daftar tugas...</div>}

      {/* DATA AREA */}
      {selectedCourseId && assignmentsGrouped && (
        <div className="space-y-10 animate-fade-in">
          
          {Object.keys(assignmentsGrouped).length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900">Belum Ada Tugas</h3>
                <p className="text-gray-500">Guru belum membuat tugas upload file di kelas ini.</p>
            </div>
          ) : (
            // LEVEL 1: BAB (CHAPTER)
            Object.keys(assignmentsGrouped).map((chapterTitle, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                
                {/* HEADER BAB */}
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                  <Layout size={20} className="text-gray-600" />
                  <span className="font-bold text-gray-800 uppercase text-sm tracking-wide">
                    BAB: {chapterTitle}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                    {/* LEVEL 2: LIST TUGAS */}
                    {assignmentsGrouped[chapterTitle].map((task, tIdx) => (
                        <div key={tIdx} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition group gap-4">
                            
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                                    <UploadCloud size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase">
                                            Materi: {task.lesson}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-lg group-hover:text-purple-600 transition line-clamp-2">
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs text-red-500 font-medium mt-2">
                                        <Calendar size={12} /> Deadline: {task.deadline}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 ml-14 md:ml-0">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-purple-600">{task.submitted_count}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Dikumpulkan</p>
                                </div>
                                <div className="text-center border-l pl-6 border-gray-200">
                                    <p className="text-xl font-bold text-green-600">{task.graded_count}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Dinilai</p>
                                </div>
                                
                                <Link 
                                    to={`/teacher/grades/assignments/${task.content_id}`}
                                    className="ml-4 px-5 py-2.5 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 font-bold text-sm flex items-center gap-2 transition shadow-sm"
                                >
                                    Periksa <ChevronRight size={16} />
                                </Link>
                            </div>

                        </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}