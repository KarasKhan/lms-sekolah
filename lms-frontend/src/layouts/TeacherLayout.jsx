import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, LogOut, Menu, X, BookOpen, 
  GraduationCap, ChevronDown, ChevronRight, FileText, CheckSquare, ClipboardList,
  FileSpreadsheet // <--- INI WAJIB ADA
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TeacherLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGradesOpen, setIsGradesOpen] = useState(false); 
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const menuClass = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 select-none cursor-pointer
    ${isActive(path) 
      ? 'bg-indigo-600 text-white shadow-md font-medium' 
      : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
    }
  `;

  const subMenuClass = (path) => `
    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors mb-1 text-sm pl-12
    ${isActive(path)
      ? 'text-indigo-600 font-bold bg-indigo-50'
      : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
    }
  `;

  const groupTitleClass = "px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
            <span className="text-xl font-bold text-gray-800">Ruang Guru</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><X size={24} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          
          <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu Utama</div>
          <Link to="/teacher/dashboard" className={menuClass('/teacher/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <div className={groupTitleClass}>Kegiatan Mengajar</div>
          <Link to="/teacher/schedule" className={menuClass('/teacher/schedule')}>
            <Calendar size={20} />
            <span>Jadwal Mengajar</span>
          </Link>

          {/* --- MENU DROPDOWN PENILAIAN --- */}
          <div>
            <div 
              onClick={() => setIsGradesOpen(!isGradesOpen)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors mb-1 cursor-pointer
                ${location.pathname.includes('/teacher/grades') || location.pathname.includes('/teacher/attendance') || location.pathname.includes('/teacher/recap') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <GraduationCap size={20} />
                <span>Penilaian Siswa</span>
              </div>
              {isGradesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {isGradesOpen && (
              <div className="mt-1 space-y-1 animate-fade-in-down">
                <Link to="/teacher/grades/quizzes" className={subMenuClass('/teacher/grades/quizzes')}>
                  <CheckSquare size={16} />
                  <span>Hasil Pre & Post Test</span>
                </Link>
                
                <Link to="/teacher/grades/assignments" className={subMenuClass('/teacher/grades/assignments')}>
                  <FileText size={16} />
                  <span>Hasil Tugas Harian</span>
                </Link>
                
                <Link to="/teacher/attendance" className={subMenuClass('/teacher/attendance')}>
                    <ClipboardList size={16} />
                    <span>Absensi Kelas</span>
                </Link>

                <Link to="/teacher/recap" className={subMenuClass('/teacher/recap')}>
                    <FileSpreadsheet size={16} />
                    <span>Rekapitulasi Nilai</span>
                </Link>
              </div>
            )}
          </div>

        </nav>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut size={20} />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600"><Menu size={24} /></button>
          <div className="ml-auto flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full inline-block">Guru Mata Pelajaran</p>
             </div>
             <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold border border-indigo-200">{user?.name?.charAt(0)}</div>
          </div>
        </header>
        <main className="p-6 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}