import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, ClipboardList
} from 'lucide-react';

// PERBAIKAN IMPORT: Cukup naik 1 level (../) karena file ini ada di src/layouts
import axiosClient from '../lib/axios'; 
import { useAuth } from '../context/AuthContext';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Style Menu Atas
  const navLinkClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
    ${isActive(path) 
      ? 'bg-blue-50 text-blue-600' 
      : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* 1. LOGO & MENU KIRI */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  L
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">LMS Siswa</span>
              </div>

              {/* Desktop Menu (Dashboard & Absensi) */}
              <nav className="hidden md:flex items-center gap-2">
                <Link to="/student" className={navLinkClass('/student')}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link to="/student/attendance" className={navLinkClass('/student/attendance')}>
                  <ClipboardList size={18} />
                  Absensi
                </Link>
              </nav>
            </div>

            {/* 2. PROFIL KANAN (Nama + NISN + Logout) */}
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {user?.name || 'Siswa'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">
                    NISN: {user?.nisn || '-'}
                  </p>
               </div>
               
               <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

               <button 
                  onClick={logout} 
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors tooltip-left"
                  title="Keluar Aplikasi"
               >
                  <LogOut size={20} />
               </button>
            </div>

          </div>
        </div>
      </header>

      {/* --- MOBILE MENU (Bottom Bar style for mobile if needed) --- */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex justify-around shadow-sm">
          <Link to="/student" className={navLinkClass('/student')}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/student/attendance" className={navLinkClass('/student/attendance')}>
            <ClipboardList size={18} /> Absensi
          </Link>
      </div>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

    </div>
  );
}