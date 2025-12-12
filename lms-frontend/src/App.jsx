import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages & Layouts (Public)
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import AdminLayout from './layouts/AdminLayout'; 
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout'; // <--- IMPORT BARU

// Components
import PublicOnlyRoute from './components/PublicOnlyRoute';
import PrivateRoute from './components/PrivateRoute';

// --- HALAMAN ADMIN ---
import DashboardAdmin from './pages/DashboardAdmin'; 
import ManajemenKelas from './pages/admin/ManajemenKelas';
import ManajemenUser from './pages/admin/ManajemenUser';
import ManajemenGuru from './pages/admin/ManajemenGuru';
import DetailKelasAdmin from './pages/admin/DetailKelas';
import ManajemenMapel from './pages/admin/ManajemenMapel';

// --- HALAMAN GURU ---
import DashboardTeacher from './pages/teacher/DashboardGuru'; 
import DetailKelasTeacher from './pages/teacher/DetailKelas';

// Penilaian (Grades)
import HasilKuis from './pages/teacher/grades/HasilKuis';
import DetailNilaiKuis from './pages/teacher/grades/DetailNilaiKuis';
import HasilTugas from './pages/teacher/grades/HasilTugas';
import DetailTugas from './pages/teacher/grades/DetailTugas';

// Absensi & Rekap (Teacher)
import AbsensiKelas from './pages/teacher/attendance/AbsensiKelas';
import DetailAbsensi from './pages/teacher/attendance/DetailAbsensi';
import Rekapitulasi from './pages/teacher/recap/Rekapitulasi';

// --- HALAMAN SISWA ---
import DashboardSiswa from './pages/student/DashboardSiswa'; 
import BelajarKelas from './pages/student/BelajarKelas';
import KerjakanKuis from './pages/student/KerjakanKuis';
import AbsensiSiswa from './pages/student/AbsensiSiswa'; // <--- IMPORT WAJIB (INI YG BIKIN ERROR)

// Fungsi Routing
function AppRoutes() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

      {/* --- ADMIN ROUTES --- */}
      <Route 
        path="/admin" 
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="users" element={<ManajemenUser />} />
        <Route path="teachers" element={<ManajemenGuru />} />
        <Route path="classrooms" element={<ManajemenKelas />} />
        <Route path="classrooms/:id" element={<DetailKelasAdmin />} />
        <Route path="subjects" element={<ManajemenMapel />} />
      </Route>


      {/* --- TEACHER ROUTES --- */}
      <Route 
        path="/teacher" 
        element={
          <PrivateRoute>
            <TeacherLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardTeacher />} />
        <Route path="courses/:id" element={<DetailKelasTeacher />} />
        <Route path="schedule" element={<div className="p-6">Jadwal (Coming Soon)</div>} />
        
        {/* Route Kuis & Tugas */}
        <Route path="grades/quizzes" element={<HasilKuis />} />
        <Route path="grades/quizzes/:id" element={<DetailNilaiKuis />} />
        <Route path="grades/assignments" element={<HasilTugas />} />
        <Route path="grades/assignments/:id" element={<DetailTugas />} />

        {/* Route Absensi & Rekap */}
        <Route path="attendance" element={<AbsensiKelas />} />
        <Route path="attendance/:sessionId" element={<DetailAbsensi />} />
        <Route path="recap" element={<Rekapitulasi />} />
      </Route>


      {/* --- STUDENT ROUTES --- */}
      
      {/* GROUP A: Pake Sidebar Menu Utama (Dashboard & Absen) */}
      <Route path="/student" element={<PrivateRoute><StudentLayout /></PrivateRoute>}>
          <Route index element={<DashboardSiswa />} />
          <Route path="attendance" element={<AbsensiSiswa />} />
      </Route>

      {/* GROUP B: Full Screen / Mode Fokus (Tanpa Sidebar Utama) */}
      <Route
        path="/student/courses/:id"
        element={<PrivateRoute><BelajarKelas /></PrivateRoute>}
      />
      <Route
        path="/student/quiz/:id"
        element={<PrivateRoute><KerjakanKuis /></PrivateRoute>}
      />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}