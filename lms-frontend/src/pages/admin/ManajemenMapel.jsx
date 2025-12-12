import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import { BookOpen, Plus, Edit, Trash2, X, Code, Book } from 'lucide-react';

export default function ManajemenMapel() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' atau 'edit'
  const [editId, setEditId] = useState(null);
  
  // State Form
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'general' // Default umum
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data
  const fetchSubjects = async () => {
    try {
      const response = await axiosClient.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // 2. Handle Modal Actions
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', code: '', type: 'general' });
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setModalMode('edit');
    setEditId(subject.id);

    setFormData({
      name: subject.name, // Gunakan subject, bukan student
      code: subject.code,
      type: subject.type
    });
    
    setIsModalOpen(true);
  };

  // 3. Handle Submit (Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalMode === 'create') {
        await axiosClient.post('/subjects', formData);
        alert('Mapel berhasil dibuat!');
      } else {
        await axiosClient.put(`/subjects/${editId}`, formData);
        alert('Mapel berhasil diperbarui!');
      }
      
      setIsModalOpen(false);
      fetchSubjects();

    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin hapus mapel ini?')) return;
    try {
      await axiosClient.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (error) {
      alert('Gagal menghapus mapel.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mata Pelajaran</h1>
          <p className="text-gray-500 text-sm">Kelola kurikulum dan jenis mata pelajaran.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={18} /> Tambah Mapel
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold w-24">Kode</th>
              <th className="px-6 py-4 font-semibold">Nama Mata Pelajaran</th>
              <th className="px-6 py-4 font-semibold">Tipe</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada data.</td></tr>
            ) : (
              subjects.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4">
                    {item.type === 'vocational' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                        <Code size={12} /> Kejuruan (RPL)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        <Book size={12} /> Muatan Umum
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="text-yellow-600 hover:bg-yellow-50 p-2 rounded-full transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
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

      {/* MODAL FORM (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Tambah Mapel Baru' : 'Edit Mapel'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Kode Mapel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Mapel</label>
                <input 
                  type="text" required maxLength="10"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                  placeholder="Contoh: WEB-01"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                />
              </div>

              {/* Nama Mapel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Mata Pelajaran</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Pemrograman Web Dasar"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Tipe Mapel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Muatan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'general'})}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.type === 'general' 
                        ? 'bg-gray-800 text-white border-gray-800 ring-2 ring-offset-2 ring-gray-400' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Muatan Umum
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'vocational'})}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.type === 'vocational' 
                        ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-offset-2 ring-purple-400' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50'
                    }`}
                  >
                    Kejuruan (RPL)
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}