import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import axiosClient from '../../lib/axios';
// [PERBAIKAN] Tambahkan ChevronDown
import { Plus, Users, Book, X, ArrowRight, Trash2, Edit, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardGuru() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' atau 'edit'
  const [editCourseId, setEditCourseId] = useState(null);
  const [formData, setFormData] = useState({ subject_id: '', classroom_id: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data
  const fetchAllData = async () => {
    try {
      const [resCourses, resSubjects, resClasses] = await Promise.all([
        axiosClient.get('/teacher/courses'),
        axiosClient.get('/subjects'),
        axiosClient.get('/classrooms')
      ]);
      setCourses(resCourses.data);
      setSubjects(resSubjects.data);
      setClassrooms(resClasses.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- HANDLER BUKA MODAL ---
  const openCreateModal = () => {
    setModalMode('create');
    setEditCourseId(null);
    setFormData({ subject_id: '', classroom_id: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setModalMode('edit');
    setEditCourseId(course.id);
    setFormData({
      subject_id: course.subject_id,
      classroom_id: course.classroom_id,
      description: course.description || ''
    });
    setIsModalOpen(true);
  };

  // --- HANDLER SUBMIT (CREATE / UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        await axiosClient.post('/teacher/courses', formData);
        alert('Kelas baru berhasil dibuat!');
      } else {
        await axiosClient.put(`/teacher/courses/${editCourseId}`, formData);
        alert('Data kelas berhasil diperbarui!');
      }

      setIsModalOpen(false);
      setFormData({ subject_id: '', classroom_id: '', description: '' }); 
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER DELETE ---
  const handleDeleteCourse = async (id) => {
    if(!window.confirm("PERINGATAN: Menghapus Kelas ini akan menghapus SEMUA BAB, MATERI, KUIS dan NILAI SISWA di dalamnya secara PERMANEN. Lanjutkan?")) return;
    try {
      await axiosClient.delete(`/teacher/courses/${id}`);
      alert("Kelas berhasil dihapus.");
      fetchAllData();
    } catch (error) {
      alert("Gagal menghapus kelas.");
    }
  };

  // [PERBAIKAN] Style Input yang Konsisten
  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition text-gray-800 placeholder-gray-400";

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang, {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">Kelola kegiatan belajar mengajar Anda di sini.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} /> Buat Kelas Baru
        </button>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Book className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">Belum ada kelas aktif</h3>
          <p className="text-gray-500 mt-1">Silakan buat kelas baru untuk mulai mengajar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group relative">
              
              {/* --- ACTION BUTTONS (EDIT & DELETE) --- */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(course)}
                  className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 rounded-lg shadow-sm transition"
                  title="Edit Info Kelas"
                >
                  <Edit size={16} />
                </button>

                <button 
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 rounded-lg shadow-sm transition"
                  title="Hapus Kelas"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Book size={24} />
                </div>
              </div>
              
              {/* Badge Kelas */}
              <div className="mb-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                  {course.classroom.name}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 pr-10" title={course.subject.name}>
                {course.subject.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                {course.description || 'Tidak ada deskripsi.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Users size={16} />
                  <span>{course.students_count || 0} Siswa</span>
                </div>
                
                <Link 
                  to={`/teacher/courses/${course.id}`} 
                  className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Masuk Kelas <ArrowRight size={16} />
                </Link>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form (Create/Edit) - YANG DIPERBAIKI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === 'create' ? 'Buat Kelas Baru' : 'Edit Info Kelas'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Isi detail kelas yang ingin ditambahkan.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Dropdown Mata Pelajaran */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1">Mata Pelajaran</label>
                <div className="relative">
                  <select 
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={formData.subject_id}
                    onChange={e => setFormData({...formData, subject_id: e.target.value})}
                    required
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                  {/* Custom Chevron */}
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {/* Dropdown Kelas (Rombel) */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1">Kelas (Rombel)</label>
                <div className="relative">
                  <select 
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={formData.classroom_id}
                    onChange={e => setFormData({...formData, classroom_id: e.target.value})}
                    required
                  >
                    <option value="">-- Pilih Target Kelas --</option>
                    {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} ({c.major})</option>)}
                  </select>
                  {/* Custom Chevron */}
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              {/* Deskripsi (Textarea) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <textarea 
                  className={inputClass}
                  placeholder="Contoh: Fokus pada algoritma dasar..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200">
                  {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                  {isSubmitting ? 'Menyimpan...' : (modalMode === 'create' ? 'Buat Kelas' : 'Simpan Perubahan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}