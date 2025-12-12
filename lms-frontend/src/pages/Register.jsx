import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../lib/axios';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nisn: '',
  });

  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Endpoint ke Laravel
      await axiosClient.post('/register', formData);

      setSuccess('Pendaftaran Berhasil! Mengalihkan ke halaman login...');
      
      // Redirect otomatis ke login setelah 2 detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      const response = err.response;
      // Handle Error dari Laravel
      if (response) {
        if (response.status === 404) {
          setErrors('NISN tidak ditemukan di database sekolah.');
        } else if (response.status === 409) {
          setErrors('NISN ini sudah terdaftar. Silakan Login.');
        } else if (response.status === 422) {
          // Ambil pesan error validasi pertama
          const firstError = Object.values(response.data.errors)[0][0];
          setErrors(firstError);
        } else {
          setErrors(response.data.message || 'Terjadi kesalahan.');
        }
      } else {
        setErrors('Gagal koneksi ke server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Daftar Siswa Baru</h2>
          <p className="text-gray-500 text-sm mt-2">Masukkan NISN untuk verifikasi data.</p>
        </div>

        {/* Alert Error */}
        {errors && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {errors}
          </div>
        )}

        {/* Alert Success */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama sesuai absen" value={formData.name} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
            <input type="number" name="nisn" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nomor Induk Siswa Nasional" value={formData.nisn} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@sekolah.sch.id" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Minimal 6 karakter" value={formData.password} onChange={handleChange} />
          </div>

          <button type="submit" disabled={isLoading} className={`w-full py-2.5 mt-2 rounded-lg text-white font-medium transition-all ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}>
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Sudah punya akun? </span>
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login disini
          </Link>
        </div>

      </div>
    </div>
  );
}