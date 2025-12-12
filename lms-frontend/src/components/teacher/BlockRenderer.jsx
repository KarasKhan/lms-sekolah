import { FileText, Code, File, Trash2, CheckSquare, UploadCloud, Video, Edit, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';

export default function BlockRenderer({ block, onDelete, onEdit }) {
  const { type, content, file_path } = block;
  const [quizDetails, setQuizDetails] = useState(null);

  // Helper untuk fetch detail soal kuis (Karena di block cuma ada ID)
  useEffect(() => {
    if (type === 'quiz' && content.quiz_id) {
      axiosClient.get(`/student/quizzes/${content.quiz_id}`)
        .then(res => setQuizDetails(res.data.quiz))
        .catch(err => console.error(err));
    }
  }, [type, content]);

  // Wrapper Tombol Aksi (Edit & Delete)
  const ActionButtons = () => (
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10 bg-white/90 backdrop-blur rounded-lg p-1 border shadow-sm">
      <button onClick={() => onEdit(block)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Edit">
        <Edit size={16} />
      </button>
      <button onClick={() => onDelete(block.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Hapus">
        <Trash2 size={16} />
      </button>
    </div>
  );

  // 1. RENDER RICH TEXT (HTML)
  if (type === 'rich_text') {
    const htmlContent = (typeof content === 'object' && content?.html) ? content.html : content;
    return (
      <div className="group relative mb-4 p-4 border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded-lg transition-all">
        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        <ActionButtons />
      </div>
    );
  }

  // 2. RENDER VIDEO
  if (type === 'media') {
    const url = content?.url || content;
    const getYoutubeId = (url) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };
    return (
      <div className="group relative mb-6">
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-sm">
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYoutubeId(url)}`} frameBorder="0" allowFullScreen></iframe>
        </div>
        <ActionButtons />
      </div>
    );
  }

  // 3. RENDER QUIZ (UPDATE: PREVIEW COMPACT)
  if (type === 'quiz') {
    // Prioritaskan data detail dari DB, kalau loading pakai data content sementara
    const questionsList = quizDetails?.questions || content.questions || [];
    const totalQ = questionsList.length;
    const firstQ = questionsList[0];

    return (
        <div className="group relative mb-6 border border-green-200 bg-green-50/50 rounded-xl p-6">
            
            {/* Header: Judul & Badge Count */}
            <div className="flex items-center justify-between mb-4 border-b border-green-200 pb-2">
                <div className="flex items-center gap-2 text-green-800 font-bold">
                    <CheckSquare size={20} /> 
                    <span>{content.quiz_title || quizDetails?.title || 'Kuis Pilihan Ganda'}</span>
                </div>
                
                {/* Badge Jumlah Soal (Pojok Kanan) */}
                <div className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm mr-8">
                    {totalQ} Soal
                </div>
            </div>
            
            {/* Body: Preview 1 Soal Saja */}
            <div className="space-y-4">
                {firstQ ? (
                    <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm opacity-90">
                        <div className="flex gap-2 font-medium text-gray-800 mb-2">
                            <span className="text-green-600">1.</span>
                            <span className="line-clamp-1">{firstQ.question_text || firstQ.question}</span>
                        </div>
                        <div className="ml-5 grid grid-cols-1 gap-2">
                            {/* Tampilkan max 2 opsi saja biar ringkas */}
                            {(firstQ.options || []).slice(0, 2).map((opt, i) => (
                                <div key={i} className={`text-xs px-3 py-1.5 rounded border border-gray-100 text-gray-500`}>
                                    <span className="mr-2 uppercase">{String.fromCharCode(65 + i)}.</span>
                                    {opt}
                                </div>
                            ))}
                            {(firstQ.options || []).length > 2 && <div className="text-xs text-gray-400 italic pl-1">... opsi lainnya</div>}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">Belum ada soal.</p>
                )}

                {/* Footer: Tombol Lihat Semua (Jika > 1 soal) */}
                {totalQ > 1 && (
                    <button 
                        onClick={() => onEdit(block)}
                        className="w-full py-2 flex items-center justify-center gap-1 text-sm text-green-700 font-medium hover:bg-green-100 rounded-lg transition border border-dashed border-green-300"
                    >
                        Lihat {totalQ - 1} soal lainnya & Edit Kuis <ChevronRight size={14} />
                    </button>
                )}
            </div>

            <ActionButtons />
        </div>
    );
  }

  // 4. RENDER ASSIGNMENT
  if (type === 'assignment') {
    return (
        <div className="group relative mb-6 border border-purple-200 bg-purple-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold">
                <UploadCloud size={20} /> <span>Tugas / Upload File</span>
            </div>
            <div className="bg-white p-4 rounded-lg text-sm text-gray-700 shadow-sm">
                <strong className="block text-purple-800 mb-1">Instruksi:</strong> 
                {content.instruction}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-red-500 font-bold flex items-center gap-1">
                    ⏰ Deadline: {content.deadline ? new Date(content.deadline).toLocaleString() : '-'}
                </div>
            </div>
            <ActionButtons />
        </div>
    );
  }

  // 5. RENDER CODING
  if (type === 'coding') {
    return (
      <div className="group relative mb-6 border border-gray-800 bg-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3 text-gray-300 font-bold border-b border-gray-700 pb-2">
          <Code size={20} /> <span>Coding Challenge</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">{content.instruction}</p>
        <div className="bg-black p-4 rounded font-mono text-xs text-green-400 overflow-x-auto border border-gray-800">
            <pre>{content.starter_code}</pre>
        </div>
        <ActionButtons />
      </div>
    );
  }

  // 6. RENDER DOCUMENT
  if (type === 'document') {
    const fileUrl = `http://127.0.0.1:8000/storage/${file_path}`;
    return (
      <div className="group relative mb-4 p-4 border border-gray-200 rounded-xl flex items-center gap-4 bg-white hover:shadow-md transition">
        <div className="p-3 bg-red-50 text-red-600 rounded-lg"><File size={24} /></div>
        <div className="flex-1">
          <p className="font-medium text-gray-800 truncate">{content.original_name || 'Dokumen PDF'}</p>
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Download / Lihat</a>
        </div>
        <ActionButtons />
      </div>
    );
  }

  return null;
}