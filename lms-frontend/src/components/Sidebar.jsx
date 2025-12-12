import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  BookOpen, 
  LogOut, 
  X 
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { logout } = useAuth();

  // Helper untuk menentukan menu aktif
  const isActive = (path) => location.pathname.startsWith(path);

  // Style untuk Link Menu
  const menuClass = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
    ${isActive(path) 
      ? 'bg-blue-600 text-white shadow-md font-medium' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
    }
  `;

  // Style untuk Judul Group (Pembatas)
  const groupTitleClass = "px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 flex flex-col
        `}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="text-xl font-bold text-gray-800">LMS Admin</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Menu Area */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          
          {/* GROUP 1: UTAMA */}
          <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Menu Utama
          </div>
          <Link to="/admin/dashboard" className={menuClass('/admin/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          {/* GROUP 2: ADMINISTRASI (Area Tata Usaha) */}
          <div className={groupTitleClass}>
            Administrasi Sekolah
          </div>
          
          <Link to="/admin/users" className={menuClass('/admin/users')}>
            <Users size={20} />
            <span>Manajemen Siswa</span>
          </Link>

          <Link to="/admin/teachers" className={menuClass('/admin/teachers')}>
            <Briefcase size={20} />
            <span>Manajemen Guru</span>
          </Link>

          <Link to="/admin/classrooms" className={menuClass('/admin/classrooms')}>
            <School size={20} />
            <span>Manajemen Kelas</span>
          </Link>

          {/* GROUP 3: AKADEMIK (Area Guru) */}
          <div className={groupTitleClass}>
            Akademik & Kurikulum
          </div>

          <Link to="/admin/subjects" className={menuClass('/admin/subjects')}>
            <BookOpen size={20} />
            <span>Mata Pelajaran</span>
          </Link>
          
          {/* Nanti bisa tambah: Jadwal Pelajaran, Materi, Tugas, Nilai */}

        </nav>

        {/* Footer Sidebar (Logout) */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
}