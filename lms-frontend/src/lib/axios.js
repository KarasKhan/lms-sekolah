import axios from 'axios';

const axiosClient = axios.create({
  // Ubah baris ini:
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR (Sisipkan Token)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. RESPONSE INTERCEPTOR (Handle Error 401 Otomatis)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      const { response } = error;
      // Jika Error 401 (Unauthorized), berarti token hangus/salah
      if (response && response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect paksa ke login
        window.location.href = '/login';
      }
    } catch (e) {
      console.error(e);
    }
    throw error;
  }
);

export default axiosClient;