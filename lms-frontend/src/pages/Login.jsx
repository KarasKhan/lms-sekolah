import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/login', formData);
      const { access_token, user } = response.data;

      login(access_token, user);

      // --- UPDATE LOGIKA REDIRECT DI SINI ---
      if (user.role === 'student') {
        navigate('/student');
      } 
      else if (user.role === 'teacher') {
        navigate('/teacher/dashboard'); // <--- Guru ke sini
      } 
      else {
        navigate('/admin/dashboard'); // Admin ke sini
      }
      // --------------------------------------

    } catch (err) {
      const message = err.response?.data?.message || 'Login gagal. Periksa koneksi Anda.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">LMS Sekolah</h2>
          <p className="text-gray-500 text-sm mt-2">Masuk untuk mengakses materi pembelajaran</p>
        </div>

        {/* Alert Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="nama@sekolah.sch.id"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-white font-medium transition-all ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? 'Memproses...' : 'Masuk Akun'}
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
                Belum punya akun siswa?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Daftar disini
          </Link>
        </div>

        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; 2025 SMKN 6 Balikpapan RPL
        </div>
      </div>
    </div>
  );
}