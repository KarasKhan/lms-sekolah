import { useEffect, useState } from 'react';
import axiosClient from '../lib/axios'; // Pastikan path import benar
import { useAuth } from '../context/AuthContext';

export default function DashboardAdmin() {
  const { user } = useAuth();
  
  // State untuk statistik
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0
  });

  // Fetch Stats dari API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosClient.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Gagal load statistik", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Overview Dashboard</h1>
        <p className="text-gray-500">Selamat datang kembali, <strong>{user?.name}</strong>.</p>
      </div>

      {/* KARTU STATISTIK REAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Siswa</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_students}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Guru/Admin</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.total_teachers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Kelas Aktif</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.total_classes}</p>
        </div>
      </div>
      
      {/* Area bawah bisa untuk chart atau list terbaru (Next Feature) */}
    </div>
  );
}