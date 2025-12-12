import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../../lib/axios';
import { 
  ArrowLeft, Users, Trophy, TrendingDown, 
  CheckCircle, XCircle, RefreshCcw 
} from 'lucide-react';

export default function DetailNilaiKuis() {
  const { id } = useParams(); // Quiz ID
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`/teacher/grades/quizzes/${id}`);
      setData(response.data);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat data nilai.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 2. Handle Reset
  const handleReset = async (userId, studentName) => {
    if (!window.confirm(`Yakin ingin mereset nilai ${studentName}? Siswa harus mengerjakan ulang dari awal.`)) return;

    try {
      await axiosClient.delete(`/teacher/grades/quizzes/${id}/reset/${userId}`);
      alert("Berhasil direset.");
      fetchData(); // Refresh table
    } catch (error) {
      alert("Gagal mereset.");
    }
  };

  if (isLoading) return <div className="p-10 text-center">Memuat Nilai...</div>;
  if (!data) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

  const { quiz, students, stats, classroom, subject } = data;

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <Link to="/teacher/grades/quizzes" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-4 transition">
            <ArrowLeft size={18} /> Kembali ke Daftar Kuis
        </Link>
        <div className="flex justify-between items-end">
            <div>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {subject} • {classroom}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-1 text-gray-500 text-sm font-medium">
                <Users size={18} /> Partisipasi
            </div>
            <p className="text-2xl font-bold text-gray-800">
                {stats.total_submitted} <span className="text-gray-400 text-base font-normal">/ {stats.total_students}</span>
            </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-1 text-gray-500 text-sm font-medium">
                <Trophy size={18} className="text-yellow-500"/> Tertinggi
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.highest}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-1 text-gray-500 text-sm font-medium">
                <TrendingDown size={18} className="text-red-500"/> Terendah
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.lowest}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-indigo-200 bg-indigo-50 shadow-sm">
            <div className="flex items-center gap-3 mb-1 text-indigo-600 text-sm font-bold">
                Rata-rata Kelas
            </div>
            <p className="text-3xl font-black text-indigo-700">{stats.average}</p>
        </div>
      </div>

      {/* TABEL SISWA */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                <tr>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Waktu Submit</th>
                    <th className="px-6 py-4 text-center">Nilai</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                    <tr key={student.user_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.nisn || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                            {student.has_attempted ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <CheckCircle size={12} /> Selesai
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                    <XCircle size={12} /> Belum
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            {student.submitted_at}
                        </td>
                        <td className="px-6 py-4 text-center">
                            {student.has_attempted ? (
                                <span className={`text-lg font-bold ${
                                    student.score >= quiz.passing_grade ? 'text-green-600' : 'text-red-500'
                                }`}>
                                    {student.score}
                                </span>
                            ) : (
                                <span className="text-gray-300">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                            {student.has_attempted && (
                                <button 
                                    onClick={() => handleReset(student.user_id, student.name)}
                                    className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
                                    title="Reset Ujian Siswa Ini"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
}