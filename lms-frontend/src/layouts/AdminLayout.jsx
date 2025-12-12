import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Main Content Wrapper (Geser kanan di desktop sejauh width sidebar) */}
      <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Header / Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-4 shadow-sm">
          
          {/* Hamburger Menu (Mobile Only) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu size={24} />
          </button>

          {/* User Info di kanan atas */}
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {/* <Outlet /> akan diganti dengan DashboardGuru, UserManagement, dll sesuai URL */}
          <Outlet /> 
        </main>
        
        {/* Footer Sederhana */}
        <footer className="text-center py-4 text-xs text-gray-400">
          &copy; 2025 LMS SMKN 6 Balikpapan
        </footer>

      </div>
    </div>
  );
}