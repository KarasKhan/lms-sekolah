import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import { Briefcase, Plus, Trash2, Key, X, Lock } from 'lucide-react';

export default function ManajemenGuru() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal (Create & Reset Password)
  const [modalType, setModalType] = useState(null); // 'create' | 'reset_password'
  const [targetUser, setTargetUser] = useState(null); // User yang sedang diedit/reset
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');

  // 1. Fetch Data Guru
  const fetchTeachers = async () => {
    try {
      const response = await axiosClient.get('/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 2. Handle Create Teacher
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Kirim data ke endpoint generic /admin/users dengan role 'teacher'
      await axiosClient.post('/admin/users', {
        ...formData,
        role: 'teacher' 
      });
      alert('Guru berhasil ditambahkan!');
      setModalType(null);
      setFormData({ name: '', email: '', password: '' });
      fetchTeachers();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambah guru');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosClient.put(`/admin/users/${targetUser.id}/reset-password`, {
        new_password: newPassword
      });
      alert(`Password untuk ${targetUser.name} berhasil direset.`);
      setModalType(null);
      setNewPassword('');
    } catch (error) {
      alert('Gagal mereset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data Guru ini?')) return;
    try {
      await axiosClient.delete(`/admin/users/${id}`);
      fetchTeachers();
    } catch (error) {
      alert('Gagal menghapus user.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Guru</h1>
          <p className="text-gray-500 text-sm">Kelola akun pengajar dan staf.</p>
        </div>
        <button 
          onClick={() => setModalType('create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={18} /> Tambah Guru
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">No</th>
              <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada data guru.</td></tr>
            ) : (
              teachers.map((teacher, index) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {teacher.name.charAt(0)}
                      </div>
                      {teacher.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{teacher.email}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {/* Tombol Reset Password */}
                    <button 
                      onClick={() => { setTargetUser(teacher); setModalType('reset_password'); }}
                      className="text-orange-500 hover:bg-orange-50 p-2 rounded-full transition"
                      title="Reset Password"
                    >
                      <Lock size={18} />
                    </button>
                    {/* Tombol Hapus */}
                    <button 
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                      title="Hapus Akun"
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

      {/* MODAL CREATE GURU */}
      {modalType === 'create' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Tambah Guru Baru</h3>
              <button onClick={() => setModalType(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input type="text" required className="w-full border rounded px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Login</label>
                <input type="email" required className="w-full border rounded px-3 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password Default</label>
                <input type="text" required className="w-full border rounded px-3 py-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min. 6 karakter" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 font-medium hover:bg-blue-700">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Guru'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD */}
      {modalType === 'reset_password' && targetUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-6">
              Masukkan password baru untuk <strong>{targetUser.name}</strong>.
            </p>
            <form onSubmit={handleResetPassword} className="text-left">
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password Baru</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-orange-500 outline-none" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="******"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModalType(null)} className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium">Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}