import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
// [PERBAIKAN] Tambahkan ChevronDown ke import
import { Trash2, Plus, X, Eye, ChevronDown } from 'lucide-react'; 
import { Link } from 'react-router-dom';

export default function ManajemenKelas() {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', level: '', major: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... (BAGIAN FETCH DATA & HANDLER SAMA SEPERTI SEBELUMNYA, TIDAK PERLU DIUBAH) ...
  // Langsung ke bagian return -> MODAL FORM

  const fetchClassrooms = async () => {
    try {
      const response = await axiosClient.get('/classrooms');
      setClassrooms(response.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosClient.post('/classrooms', formData);
      alert('Kelas berhasil ditambahkan!');
      setFormData({ name: '', level: '', major: '' });
      setIsModalOpen(false);
      fetchClassrooms();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat kelas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kelas ini?')) return;
    try {
      await axiosClient.delete(`/classrooms/${id}`);
      fetchClassrooms();
    } catch (error) {
      alert('Gagal menghapus kelas');
    }
  };

  // --- STYLE UNTUK INPUT AGAR KONSISTEN ---
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white text-gray-800 placeholder-gray-400";

  return (
    <div className="p-6">
      {/* ... (BAGIAN HEADER & TABEL TETAP SAMA, TIDAK PERLU DIUBAH) ... */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={18} /> Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">No</th>
              <th className="px-6 py-4 font-semibold">Nama Kelas</th>
              <th className="px-6 py-4 font-semibold">Tingkat</th>
              <th className="px-6 py-4 font-semibold">Jurusan</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading data...</td></tr>
            ) : classrooms.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Belum ada data kelas.</td></tr>
            ) : (
              classrooms.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600">{item.level}</td>
                  <td className="px-6 py-4 text-gray-600">{item.major}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Link to={`/admin/classrooms/${item.id}`} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition">
                       <Eye size={18} />
                    </Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FORM ADD (YANG DIPERBAIKI) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative transform transition-all scale-100">
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tambah Kelas Baru</h3>
                <p className="text-sm text-gray-500 mt-1">Isi detail kelas yang ingin ditambahkan.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              
              {/* NAMA KELAS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kelas</label>
                <input 
                  type="text" required 
                  className={inputClass}
                  placeholder="Contoh: X PPLG 1"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* GRID 2 KOLOM (TINGKAT & JURUSAN) */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* DROPDOWN TINGKAT (CUSTOM STYLE) */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat</label>
                  <div className="relative">
                    <select 
                      className={`${inputClass} appearance-none cursor-pointer`} // appearance-none menghapus style bawaan browser
                      value={formData.level} required
                      onChange={e => setFormData({...formData, level: e.target.value})}
                    >
                      <option value="">Pilih Tingkat...</option>
                      <option value="10">Kelas 10</option>
                      <option value="11">Kelas 11</option>
                      <option value="12">Kelas 12</option>
                    </select>
                    {/* Icon Custom Chevron */}
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* INPUT JURUSAN */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jurusan</label>
                  <input 
                    type="text" required 
                    className={inputClass}
                    placeholder="Contoh: PPLG"
                    value={formData.major}
                    onChange={e => setFormData({...formData, major: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md disabled:bg-blue-300 disabled:shadow-none"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}