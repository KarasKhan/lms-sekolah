import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../lib/axios'; // Sesuaikan path import ini jika file dipindah
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, ArrowRight, LogOut, Clock, GraduationCap } from 'lucide-react';

export default function DashboardSiswa() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosClient.get('/student/my-courses');
        // Handle jika responnya array langsung atau object wrapper
        const data = Array.isArray(response.data) ? response.data : response.data.courses;
        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- NAVBAR SEDERHANA --- */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="text-xl font-bold text-gray-800">LMS Siswa</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">
                NISN: {user?.nisn || '-'}
              </p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto p-6">
        
        {/* Header Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">
            Siap untuk belajar hari ini? Berikut adalah daftar kelasmu.
          </p>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* EMPTY STATE */}
            {courses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <GraduationCap className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900">Belum ada kelas</h3>
                <p className="text-gray-500 mt-1 max-w-md mx-auto">
                  Kamu belum dimasukkan ke dalam kelas manapun. Silakan hubungi Guru atau Admin sekolah.
                </p>
              </div>
            ) : (
              
              /* --- COURSE GRID --- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Badge Tipe Mapel */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${course.subject_type === 'vocational' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                        <BookOpen size={24} />
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        {course.subject_code}
                      </span>
                    </div>

                    {/* Judul & Info */}
                    <div className="mb-4 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                        {course.subject_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <User size={14} />
                        <span>{course.teacher_name}</span>
                      </div>
                    </div>

                    {/* Progress Bar Dummy */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 font-medium">Progress Belajar</span>
                        <span className="text-blue-600 font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <Link 
                      to={`/student/courses/${course.id}`} // Kita akan buat halaman ini nanti
                      className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                    >
                      Lanjut Belajar <ArrowRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}