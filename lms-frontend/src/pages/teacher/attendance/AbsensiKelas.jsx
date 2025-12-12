import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../../lib/axios';
import { 
  BookOpen, Plus, Calendar, Clock, Users, ChevronRight, 
  CheckCircle, XCircle, Loader2, X, Trash2
} from 'lucide-react';

export default function AbsensiKelas() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionData, setNewSessionData] = useState({ title: '', duration_minutes: 60 });
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch Kelas Guru
  useEffect(() => {
    axiosClient.get('/teacher/grades/courses') 
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  // 2. Fetch Sessions
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    if (!courseId) { setSessions([]); return; }

    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/teacher/attendance/courses/${courseId}`);
      setSessions(res.data);
    } catch (error) {
      alert("Gagal memuat data absensi");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Create Session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await axiosClient.post('/teacher/attendance/sessions', {
        course_id: selectedCourseId,
        ...newSessionData
      });
      alert("Sesi Absensi Dibuka! Token telah dibuat.");
      setIsModalOpen(false);
      setNewSessionData({ title: '', duration_minutes: 60 });
      // Refresh Data
      const res = await axiosClient.get(`/teacher/attendance/courses/${selectedCourseId}`);
      setSessions(res.data);
    } catch (error) {
      alert("Gagal membuat sesi.");
    } finally {
      setIsCreating(false);
    }
  };

  // 4. Hapus Sesi (FITUR BARU)
  const handleDeleteSession = async (sessionId) => {
    if(!window.confirm("⚠️ PERINGATAN: Menghapus sesi ini akan menghapus seluruh data kehadiran siswa di dalamnya secara permanen. Lanjutkan?")) return;

    try {
        await axiosClient.delete(`/teacher/attendance/sessions/${sessionId}`);
        // Refresh Data tanpa loading full
        const res = await axiosClient.get(`/teacher/attendance/courses/${selectedCourseId}`);
        setSessions(res.data);
        alert("Sesi berhasil dihapus.");
    } catch (error) {
        console.error(error);
        alert("Gagal menghapus sesi.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Absensi</h1>
            <p className="text-gray-500">Buat kode absen dan pantau kehadiran siswa.</p>
        </div>
      </div>

      {/* FILTER KELAS */}
      <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Kelas</label>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0"><BookOpen size={24} /></div>
            <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={selectedCourseId}
                onChange={handleCourseChange}
            >
                <option value="">-- Pilih Kelas --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        {selectedCourseId && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition"
            >
                <Plus size={20} /> Buka Sesi Baru
            </button>
        )}
      </div>

      {/* LIST SESI */}
      {isLoading ? <div className="text-center py-10">Memuat data...</div> : (
        <div className="space-y-4">
            {sessions.length === 0 && selectedCourseId && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                    Belum ada riwayat absensi di kelas ini.
                </div>
            )}

            {sessions.map((session) => (
                <div key={session.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${session.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 text-lg">{session.title}</h3>
                                {session.is_active ? (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                                        <Clock size={10} /> SEDANG AKTIF
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">SELESAI</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(session.opened_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-center mr-4">
                            <p className="text-2xl font-black text-indigo-600">{session.hadir_count} <span className="text-sm font-normal text-gray-400">/ {session.total_students}</span></p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Hadir</p>
                        </div>
                        
                        {/* TOMBOL AKSI GROUP */}
                        <div className="flex items-center gap-2">
                            <Link 
                                to={`/teacher/attendance/${session.id}`}
                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition"
                            >
                                Detail & Token <ChevronRight size={16} />
                            </Link>

                            {/* TOMBOL HAPUS */}
                            <button 
                                onClick={() => handleDeleteSession(session.id)}
                                className="p-2.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-300 transition"
                                title="Hapus Sesi Ini"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* MODAL CREATE SESSION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Buka Absensi Baru</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-red-500"/></button>
                </div>
                <form onSubmit={handleCreateSession} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Judul Pertemuan</label>
                        <input 
                            type="text" required
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Contoh: Pertemuan 3 - CSS Layout"
                            value={newSessionData.title}
                            onChange={e => setNewSessionData({...newSessionData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Durasi Absen Dibuka (Menit)</label>
                        <input 
                            type="number" required min="5"
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newSessionData.duration_minutes}
                            onChange={e => setNewSessionData({...newSessionData, duration_minutes: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Siswa tidak bisa absen setelah waktu habis.</p>
                    </div>
                    <button 
                        type="submit" disabled={isCreating}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 mt-4"
                    >
                        {isCreating && <Loader2 className="animate-spin" />} Buka Sesi & Generate Token
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}