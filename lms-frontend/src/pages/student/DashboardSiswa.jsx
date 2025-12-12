import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, ArrowRight, User, Loader2, GraduationCap
} from 'lucide-react';

// PERBAIKAN IMPORT: Pastikan naik 2 level (../../)
import axiosClient from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

export default function DashboardSiswa() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/student/my-courses')
      .then(res => {
        // Handle struktur data array atau object wrapper
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setCourses(data);
      })
      .catch(err => console.error("Gagal ambil course:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
          Selamat Datang, {user?.name ? user.name.split(' ')[0] : 'Siswa'}!
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Lanjutkan aktivitas belajarmu hari ini.
        </p>
      </div>

      {/* Grid Kelas */}
      {isLoading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="inline-flex p-5 bg-gray-50 rounded-full mb-6">
                <GraduationCap size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Belum Ada Kelas</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Kamu belum terdaftar di kelas manapun. Silakan hubungi admin sekolah.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div 
                key={course.id} 
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative overflow-hidden"
            >
              {/* Efek Hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* 1. HEADER: Ikon & Tag Kelas */}
              <div className="flex justify-between items-start mb-5">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                 </div>
                 
                 {/* TAG KELAS: Support format object (eloquent) atau flat (mapped) */}
                 <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {course.classroom?.name || course.classroom_name || 'KELAS'}
                 </span>
              </div>

              {/* 2. JUDUL MAPEL & GURU */}
              <div className="mb-4">
                 <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                    {/* Support format object atau flat */}
                    {course.subject?.name || course.subject_name || <span className="text-red-500 text-sm">Mapel Error</span>}
                 </h3>
                 
                 <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={12} />
                    </div>
                    <span>
                        {course.teacher?.name || course.teacher_name || 'Guru Pengampu'}
                    </span>
                 </div>
              </div>

              {/* 3. DESKRIPSI */}
              <div className="flex-1 mb-6">
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                    {course.description || 'Tidak ada deskripsi tambahan untuk mata pelajaran ini.'}
                </p>
              </div>

              {/* 4. TOMBOL */}
              {/* Menggunakan ID course untuk link detail */}
              <Link 
                  to={`/student/courses/${course.id}`} 
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black hover:gap-3 transition-all"
              >
                  Lanjut Belajar <ArrowRight size={16} />
              </Link>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}