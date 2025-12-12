import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
// [PERBAIKAN] Menambahkan ChevronDown dan X ke import
import { Search, Edit, Trash2, Users, CheckSquare, Square, X, ChevronDown } from 'lucide-react';

export default function ManajemenUser() {
  // --- STATE DATA ---
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE FEATURES ---
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); // Array ID siswa yang dicentang

  // --- STATE MODALS ---
  const [modalType, setModalType] = useState(null); // 'edit' | 'bulk_enroll' | null
  const [targetStudent, setTargetStudent] = useState(null); // Data siswa yang sedang diedit
  const [targetClassId, setTargetClassId] = useState(''); // ID Kelas untuk Bulk Action
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. FETCH DATA
  const fetchStudents = async (keyword = '') => {
    setIsLoading(true);
    try {
      const url = keyword ? `/students?search=${keyword}` : '/students';
      const response = await axiosClient.get(url);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const res = await axiosClient.get('/classrooms');
      setClassrooms(res.data);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClassrooms();
  }, []);

  // Handle Search Input
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchStudents(search);
    }
  };

  // 2. CHECKBOX LOGIC
  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id)); 
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 3. ACTION HANDLERS
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin hapus siswa ini? Data nilai & kelas akan hilang permanen.')) return;
    try {
      await axiosClient.delete(`/students/${id}`);
      fetchStudents(search); 
      alert('Siswa dihapus.');
    } catch (error) {
      alert('Gagal menghapus.');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosClient.put(`/students/${targetStudent.id}`, targetStudent);
      alert('Data siswa diperbarui');
      setModalType(null);
      fetchStudents(search);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal update data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkEnroll = async (e) => {
    e.preventDefault();
    if (!targetClassId) {
      alert('Mohon pilih kelas tujuan terlebih dahulu!');
      return;
    }
    if (selectedIds.length === 0) {
      alert('Tidak ada siswa yang dipilih!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosClient.post('/students/bulk-enroll', {
        user_ids: selectedIds,
        classroom_id: targetClassId
      });
      alert(response.data.message);
      
      setModalType(null);
      setSelectedIds([]); 
      fetchStudents(search);
      
    } catch (error) {
      console.error("Error Bulk Enroll:", error);
      if (error.response) {
        alert(`Gagal! Server Error: ${error.response.status} - ${error.response.data.message}`);
      } else {
        alert('Terjadi kesalahan sistem.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CONSTANT STYLE UNTUK INPUT YANG KONSISTEN ---
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white text-gray-800";

  return (
    <div className="p-6 relative min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h1>
        <div className="relative w-full md:w-64">
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Cari Nama / NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-4 py-4 w-10 text-center">
                <button onClick={handleSelectAll} className="text-gray-500 hover:text-blue-600">
                  {students.length > 0 && selectedIds.length === students.length 
                    ? <CheckSquare size={20} /> 
                    : <Square size={20} />
                  }
                </button>
              </th>
              <th className="px-6 py-4">Nama Siswa</th>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">Data tidak ditemukan.</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className={`hover:bg-gray-50 ${selectedIds.includes(student.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-4 text-center">
                     <button onClick={() => handleSelectOne(student.id)} className="text-gray-400 hover:text-blue-600">
                      {selectedIds.includes(student.id) 
                        ? <CheckSquare size={20} className="text-blue-600" /> 
                        : <Square size={20} />
                     }
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.nisn}</td>
                  <td className="px-6 py-4">
                    {student.student_enrollment?.classroom ? (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                        {student.student_enrollment.classroom.name}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => { setTargetStudent(student); setModalType('edit'); }}
                      className="text-yellow-600 hover:bg-yellow-50 p-2 rounded-full transition"
                      title="Edit Siswa"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                      title="Hapus Siswa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Action Button */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-40 animate-bounce-in">
          <span className="font-medium text-sm">{selectedIds.length} Siswa Dipilih</span>
          <div className="h-4 w-px bg-gray-600"></div>
          <button 
            onClick={() => setModalType('bulk_enroll')}
            className="flex items-center gap-2 hover:text-blue-300 transition font-bold text-sm"
          >
            <Users size={18} /> Masukkan ke Kelas
          </button>
        </div>
      )}

      {/* === MODAL EDIT SISWA === */}
      {modalType === 'edit' && targetStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Edit Data Siswa</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input 
                  type="text" required 
                  className="w-full border rounded px-3 py-2"
                  value={targetStudent.name}
                  onChange={e => setTargetStudent({...targetStudent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NISN</label>
                <input 
                  type="text" required 
                  className="w-full border rounded px-3 py-2"
                  value={targetStudent.nisn}
                  onChange={e => setTargetStudent({...targetStudent, nisn: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" required 
                  className="w-full border rounded px-3 py-2"
                  value={targetStudent.email}
                  onChange={e => setTargetStudent({...targetStudent, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password Baru <span className="text-xs text-gray-400">(Opsional)</span>
                </label>
                <input 
                  type="password"
                  className="w-full border rounded px-3 py-2 bg-gray-50"
                  placeholder="Kosongkan jika tidak reset"
                  value={targetStudent.password || ''}
                  onChange={e => setTargetStudent({...targetStudent, password: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border rounded">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {isSubmitting ? 'Simpan' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL BULK ENROLL (YANG DIPERBAIKI) === */}
      {modalType === 'bulk_enroll' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative transform transition-all scale-100">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Plotting Masal</h3>
                    <p className="text-sm text-gray-500 mt-1">
                    Memasukkan <strong>{selectedIds.length} siswa</strong> terpilih ke dalam kelas:
                    </p>
                </div>
                <button 
                    onClick={() => setModalType(null)} 
                    className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleBulkEnroll}> 
              
              {/* DROPDOWN KELAS TUJUAN (DIPERBAIKI) */}
              <div className="relative mb-8">
                  <select 
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={targetClassId}
                    onChange={e => setTargetClassId(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Kelas Tujuan --</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.major})</option>
                    ))}
                  </select>
                  {/* Custom Chevron */}
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                      <ChevronDown size={20} />
                  </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)} 
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi Plotting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}