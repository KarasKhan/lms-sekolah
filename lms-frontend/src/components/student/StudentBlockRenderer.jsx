import { useState } from 'react';
import { FileText, Code, File, CheckSquare, UploadCloud, Loader2, CheckCircle, Clock, Download, XCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../lib/axios';

// Terima prop onRefresh
export default function StudentBlockRenderer({ block, onRefresh }) {
  const { type, content, file_path, user_progress } = block;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  if (!content && type !== 'document') return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validasi Client Side: Max 5MB
    if (file.size > 5 * 1024 * 1024) { alert("Ukuran file maksimal 5MB"); return; }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        await axiosClient.post(`/student/assignments/${block.id}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setUploadStatus('success');
        alert("Tugas berhasil dikumpulkan! 🎉");
        
        // PANGGIL FUNGSI DARI PARENT UNTUK REFRESH DATA TANPA RELOAD PAGE
        if (onRefresh) {
            onRefresh();
        } else {
            window.location.reload();
        }

    } catch (error) {
        console.error(error);
        setUploadStatus('error');
        alert(error.response?.data?.message || "Gagal mengupload tugas.");
    } finally {
        setIsUploading(false);
    }
  };

  // 1. RICH TEXT
  if (type === 'rich_text') {
    const htmlContent = (typeof content === 'object' && content?.html) ? content.html : content;
    return (
      <div className="mb-6 prose max-w-none text-gray-800 font-sans leading-relaxed bg-white p-6 rounded-xl border border-gray-100 shadow-sm" 
           dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />
    );
  }

  // 2. VIDEO
  if (type === 'media') {
    const url = content?.url || content;
    const getYoutubeId = (url) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };
    return (
      <div className="mb-8 aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYoutubeId(url)}`} frameBorder="0" allowFullScreen title="Video"></iframe>
      </div>
    );
  }

  // 3. CODING
  if (type === 'coding') {
    return (
      <div className="mb-8 border border-gray-800 bg-gray-900 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2 text-gray-300 font-bold text-sm"><Code size={18} /> <span>Code Playground</span></div>
          <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-medium transition">Run Code ▶</button>
        </div>
        <div className="p-4 text-gray-300 text-sm border-b border-gray-800 bg-gray-800/50"><strong>Instruksi:</strong> {content.instruction}</div>
        <div className="p-4 font-mono text-sm"><textarea className="w-full bg-transparent text-green-400 outline-none resize-y min-h-[150px] p-2 placeholder-gray-600" defaultValue={content.starter_code} spellCheck="false" placeholder="// Tulis kodemu di sini..." /></div>
      </div>
    );
  }

  // 4. DOCUMENT
  if (type === 'document') {
    const fileUrl = `http://127.0.0.1:8000/storage/${file_path}`;
    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-xl flex items-center gap-4 bg-white hover:shadow-md transition cursor-pointer group" onClick={() => window.open(fileUrl, '_blank')}>
        <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition"><File size={24} /></div>
        <div className="flex-1"><p className="font-medium text-gray-800">{content?.original_name || 'Dokumen PDF'}</p><span className="text-xs text-blue-600 font-medium group-hover:underline">Klik untuk membuka / download</span></div>
      </div>
    );
  }

  // 5. QUIZ
  if (type === 'quiz') {
    if (!content?.quiz_id) return null;
    
    if (user_progress && user_progress.status === 'completed') {
        return (
            <div className="mb-6 p-6 border border-green-200 bg-green-50 rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-800 font-bold">
                        <CheckSquare size={20} /> <span>{content.quiz_title || 'Kuis'}</span>
                    </div>
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">SELESAI</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center mt-4 border border-green-100">
                    <p className="text-sm text-gray-500 mb-1">Nilai Kamu</p>
                    <div className="text-4xl font-black text-green-600 mb-2">{user_progress.score}</div>
                    <p className="text-xs text-gray-400">Disubmit pada: {user_progress.submitted_at}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 p-6 border border-indigo-200 bg-indigo-50 rounded-xl">
            <div className="flex items-center gap-2 mb-4 text-indigo-800 font-bold">
                <CheckSquare size={20} /> <span>{content.quiz_title || 'Kuis'}</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 mb-4">Kuis ini memiliki <strong>{content.total_questions || 0} soal</strong>.</p>
                <Link to={`/student/quiz/${content.quiz_id}`} className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:scale-105 transform">
                    Mulai Kerjakan Kuis
                </Link>
            </div>
        </div>
    );
  }

  // 6. ASSIGNMENT
  if (type === 'assignment') {
    // Helper Status Warna & Icon
    const getStatusUI = (status) => {
        if (status === 'accepted') return { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={18} />, text: 'Diterima & Dinilai' };
        if (status === 'rejected') return { color: 'bg-red-100 text-red-700', icon: <XCircle size={18} />, text: 'Perlu Revisi (Ditolak)' };
        return { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={18} />, text: 'Menunggu Penilaian' };
    };

    const statusUI = user_progress ? getStatusUI(user_progress.status) : null;

    // --- LOGIC DEADLINE CHECKER ---
    const deadlineDate = content.deadline ? new Date(content.deadline) : null;
    const isLate = deadlineDate ? new Date() > deadlineDate : false;
    // ------------------------------

    return (
        <div className="mb-6 p-6 border border-purple-200 bg-purple-50 rounded-xl">
            {/* Header Instruksi */}
            <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold justify-center">
                <UploadCloud size={24} /> <span>Tugas Upload</span>
            </div>
            
            <div className="bg-white p-4 rounded-lg text-sm text-gray-700 shadow-sm border border-purple-100 mb-4">
                <strong className="block text-purple-800 mb-1 text-center">Instruksi:</strong> 
                <p className="text-center whitespace-pre-wrap">{content.instruction}</p>
                
                {/* TAMPILAN INFO DEADLINE & STATUS TELAT */}
                {deadlineDate && (
                    <div className={`mt-3 pt-3 border-t border-gray-100 text-center text-xs font-bold flex flex-col items-center gap-1 ${isLate ? 'text-red-600' : 'text-orange-600'}`}>
                        <div className="flex items-center gap-1">
                            <Clock size={14} /> 
                            Batas Waktu: {deadlineDate.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {isLate && <span className="bg-red-600 text-white px-3 py-1 rounded-full uppercase tracking-wide text-[10px] mt-1 shadow-sm">Waktu Habis (Ditutup)</span>}
                    </div>
                )}
            </div>

            {user_progress ? (
                <div className="bg-white p-5 rounded-xl border border-purple-200">
                    
                    {/* STATUS HEADER */}
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${statusUI.color}`}>
                            {statusUI.icon} <span>{statusUI.text}</span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> {user_progress.submitted_at}
                        </div>
                    </div>

                    {/* File Info */}
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileText size={20} className="text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-600 truncate font-medium max-w-[200px]" title={user_progress.original_filename}>
                                {user_progress.original_filename}
                            </span>
                        </div>
                        <a href={user_progress.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition" title="Download File Kamu">
                            <Download size={16} />
                        </a>
                    </div>

                    {/* LOGIC FEEDBACK & RE-UPLOAD */}
                    {/* Re-upload hanya diperbolehkan jika status Rejected (Revisi) ATAU belum deadline */}
                    
                    {user_progress.status === 'rejected' && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4 animate-pulse">
                            <p className="text-xs font-bold text-red-700 mb-1 uppercase">Catatan Guru (Revisi):</p>
                            <p className="text-sm text-red-800">"{user_progress.feedback}"</p>
                            
                            {/* Tombol Re-upload (Kecuali jika sangat strict deadline, tapi biasanya revisi boleh) */}
                            {!isLate ? (
                                <div className="mt-4 pt-4 border-t border-red-200">
                                    <label className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold cursor-pointer bg-red-600 text-white hover:bg-red-700 transition shadow-sm">
                                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                                        {isUploading ? 'Mengupload Revisi...' : 'Upload File Revisi'}
                                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    </label>
                                </div>
                            ) : (
                                <div className="mt-2 text-center text-xs text-red-600 font-bold border-t border-red-200 pt-2">
                                    Waktu pengumpulan revisi sudah habis.
                                </div>
                            )}
                        </div>
                    )}

                    {/* JIKA MENUNGGU (PENDING) */}
                    {user_progress.status === 'pending' && (
                        <div className="text-center py-4 bg-yellow-50 rounded border border-yellow-100">
                            <p className="text-sm text-yellow-800 font-medium">Tugas sedang diperiksa guru.</p>
                            
                            {/* Opsional: Ganti file jika masih dalam deadline */}
                            {!isLate && (
                                <label className="mt-3 text-xs text-purple-600 font-bold hover:underline cursor-pointer block">
                                    Salah kirim file? Ganti sekarang
                                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                </label>
                            )}
                        </div>
                    )}

                    {/* JIKA DITERIMA (ACCEPTED) */}
                    {user_progress.status === 'accepted' && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-green-700 uppercase">Nilai Akhir</span>
                                <span className="text-3xl font-black text-green-700">{user_progress.score}</span>
                            </div>
                            {user_progress.feedback && <p className="text-sm text-green-800 border-t border-green-200 pt-2">"{user_progress.feedback}"</p>}
                        </div>
                    )}

                </div>
            ) : (
                // FORM UPLOAD AWAL (BELUM PERNAH UPLOAD)
                <div className="text-center">
                    {isLate ? (
                        // TAMPILAN JIKA SUDAH TELAT
                        <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 text-gray-500">
                            <XCircle size={48} className="mx-auto mb-3 text-gray-400" />
                            <p className="font-bold text-gray-700 text-lg">Form Pengumpulan Ditutup</p>
                            <p className="text-sm mt-1">Anda telah melewati batas waktu deadline.</p>
                        </div>
                    ) : (
                        // TAMPILAN NORMAL (TOMBOL UPLOAD)
                        <label className={`
                            inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold cursor-pointer transition shadow-lg shadow-purple-200
                            ${isUploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'}
                        `}>
                            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                            {isUploading ? 'Mengupload...' : 'Pilih File Tugas'}
                            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                    )}
                </div>
            )}
        </div>
    );
  }

  return null;
}