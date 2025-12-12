// src/components/PublicOnlyRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { token, user } = useAuth();

  if (token) {
    // 1. Cek Siswa
    if (user?.role === 'student') {
      return <Navigate to="/student" replace />;
    }
    
    // 2. CEK GURU (TAMBAHKAN INI)
    if (user?.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    
    // 3. Default Admin
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}