import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import { X, Loader2 } from 'lucide-react';

export default function ModalAddMateri({ isOpen, onClose, chapterId, onSuccess }) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Kita kirim 'text' sebagai default sementara, 
      // karena konten sebenarnya nanti diisi via Block Editor
      const payload = {
        chapter_id: chapterId,
        title: title,
        type: 'text', // Default dummy type
        content: ''   // Kosongkan awal
      };

      await axiosClient.post('/teacher/lessons', payload);
      
      onSuccess(); // Refresh data
      onClose();   // Tutup modal

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Gagal membuat materi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Materi Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Hanya Input Judul */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Materi / Sub-bab</label>
            <input 
              type="text" required autoFocus
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Contoh: Pengenalan Tag HTML"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md disabled:bg-indigo-300 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />} Buat
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}