import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { ArrowLeft, Trash2, UserX, RefreshCcw } from 'lucide-react';

export default function DetailKelas() {
  const { id } = useParams(); // Ambil ID dari URL
  const [classroom, setClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data Detail Kelas
  const fetchClassroom = async () => {
    try {
      const response = await axiosClient.get(`/classrooms/${id}`);
      setClassroom(response.data);
    } catch (error) {
      alert("Gagal mengambil data kelas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroom();
  }, [id]);

  // Aksi 1: Keluarkan 1 Siswa
  const handleKickStudent = async (studentId, studentName) => {
    if (!window.confirm(`Yakin ingin mengeluarkan ${studentName} dari kelas ini?`)) return;

    try {
      await axiosClient.delete(`/classrooms/${id}/students/${studentId}`);
      fetchClassroom(); // Refresh data
    } catch (error) {
      alert("Gagal mengeluarkan siswa.");
    }
  };

  // Aksi 2: Reset Kelas (Kosongkan Semua)
  const handleResetClass = async () => {
    const confirmText = prompt(`KETIK "RESET" untuk mengosongkan kelas ${classroom.name} secara permanen:`);
    if (confirmText !== "RESET") return;

    try {
      await axiosClient.delete(`/classrooms/${id}/reset`);
      alert("Kelas berhasil dikosongkan!");
      fetchClassroom();
    } catch (error) {
      alert("Gagal mereset kelas.");
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading Detail Kelas...</div>;
  if (!classroom) return <div className="p-10 text-center">Kelas tidak ditemukan.</div>;

  return (
    <div className="p-6">
      {/* Header & Navigasi */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/classrooms" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{classroom.name}</h1>
            <p className="text-gray-500">
                Tingkat {classroom.level} • Jurusan {classroom.major} • 
                <span className="font-bold text-blue-600 ml-1">
                  {classroom.enrollments.length} Siswa
                </span>
            </p>
          </div>
        </div>

        {/* Tombol Bahaya: Reset Kelas */}
        {classroom.enrollments.length > 0 && (
            <button 
              onClick={handleResetClass}
              className="bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-200 transition font-medium"
            >
              <RefreshCcw size={18} /> Reset Kelas
            </button>
        )}
      </div>

      {/* Tabel Daftar Siswa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">Nama Siswa</th>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classroom.enrollments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                  Kelas ini masih kosong. Silakan lakukan plotting di menu Manajemen Siswa.
                </td>
              </tr>
            ) : (
              classroom.enrollments.map((enrollment, index) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {enrollment.user ? enrollment.user.name : <span className="text-red-400">User Terhapus</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {enrollment.user?.nisn || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {enrollment.user && (
                        <button 
                        onClick={() => handleKickStudent(enrollment.user.id, enrollment.user.name)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                        title="Keluarkan Siswa dari Kelas"
                        >
                        <UserX size={18} />
                        </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}