import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../../lib/axios';
import { 
  ArrowLeft, Download, CheckCircle, XCircle, Save, Loader2, FileText, 
  RefreshCcw, AlertCircle, Clock, Info
} from 'lucide-react';

export default function DetailTugas() {
  const { id } = useParams(); // contentId
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Lokal untuk Input Nilai
  const [gradesInput, setGradesInput] = useState({});
  const [savingId, setSavingId] = useState(null);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const res = await axiosClient.get(`/teacher/grades/assignments/${id}`);
      setData(res.data);
      
      const initialGrades = {};
      res.data.students.forEach(s => {
        if (s.submission) {
            initialGrades[s.submission.id] = {
                score: s.submission.score || '',
                feedback: s.submission.feedback || ''
            };
        }
      });
      setGradesInput(initialGrades);

    } catch (error) {
      console.error(error);
      alert("Gagal memuat detail tugas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 2. Handle Input Change
  const handleInputChange = (submissionId, field, value) => {
    setGradesInput(prev => ({
        ...prev,
        [submissionId]: {
            ...prev[submissionId],
            [field]: value
        }
    }));
  };

  const handleSaveGrade = async (submissionId, status) => {
    const input = gradesInput[submissionId];
    
    if (status === 'accepted' && (!input || input.score === '')) {
        alert("Berikan nilai (0-100) sebelum menerima tugas.");
        return;
    }
    
    if (status === 'rejected' && (!input || !input.feedback)) {
        alert("Berikan feedback/alasan penolakan agar siswa mengerti.");
        return;
    }

    setSavingId(submissionId);
    try {
        await axiosClient.post(`/teacher/grades/assignments/grade/${submissionId}`, {
            score: status === 'accepted' ? input.score : 0, 
            feedback: input?.feedback || '',
            status: status
        });

        // --- PERBAIKAN: UPDATE STATE LOKAL AGAR UI BERUBAH INSTAN (OPTIMISTIC UPDATE) ---
        setData(prev => ({
            ...prev,
            students: prev.students.map(s => {
                if (s.submission && s.submission.id === submissionId) {
                    return {
                        ...s,
                        submission: {
                            ...s.submission,
                            status: status, // Update status langsung
                            score: status === 'accepted' ? input.score : 0,
                            feedback: input?.feedback || '',
                            // Kita pertahankan tanggal submission asli
                            submitted_at: s.submission.submitted_at 
                        }
                    };
                }
                return s;
            })
        }));

        alert(status === 'accepted' ? "Status berubah: Nilai Tersimpan ✅" : "Status berubah: Menunggu Revisi ⚠️");
        // Kita tidak panggil fetchData() lagi agar urutan tidak lompat tiba-tiba dan UI tidak loading
        
    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan.");
    } finally {
        setSavingId(null);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Memuat Tugas...</div>;
  if (!data) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

  const { assignment_info, students, classroom, subject } = data;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="mb-8">
        <Link to="/teacher/grades/assignments" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-4 transition">
            <ArrowLeft size={18} /> Kembali ke Daftar Tugas
        </Link>

        <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                {subject} • {classroom}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Penilaian Tugas</h1>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 text-sm">
                <strong className="block text-gray-900 mb-1">Instruksi Soal:</strong>
                {assignment_info.instruction}
            </div>
            {assignment_info.deadline && (
                <p className="mt-3 text-xs text-red-500 font-bold">
                    Deadline: {new Date(assignment_info.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
            )}
        </div>
      </div>

      {/* TABEL PENILAIAN */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                <tr>
                    <th className="px-6 py-4">Siswa</th>
                    <th className="px-6 py-4">Status & File</th>
                    <th className="px-6 py-4 w-32">Nilai (0-100)</th>
                    <th className="px-6 py-4">Feedback Guru</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                    const sub = student.submission;
                    const input = sub ? gradesInput[sub.id] : null;

                    // Logic deteksi revisi (Pending + ada feedback lama = Revisi baru masuk)
                    const isRevision = sub?.status === 'pending' && sub?.feedback;

                    return (
                        <tr key={student.user_id} className={`transition ${isRevision ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                            
                            {/* KOLOM 1: NAMA */}
                            <td className="px-6 py-4 align-top">
                                <p className="font-bold text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.nisn || '-'}</p>
                                {isRevision && (
                                    <span className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-orange-100 text-orange-700 animate-pulse border border-orange-200">
                                        <RefreshCcw size={10} /> REVISI BARU MASUK
                                    </span>
                                )}
                            </td>

                            {/* KOLOM 2: STATUS & FILE */}
                            <td className="px-6 py-4 align-top">
                                {sub ? (
                                    <div>
                                        {/* Badge Status - Posisi Paling Atas */}
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {isRevision ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                                    <Info size={12} /> Menunggu Review
                                                </span>
                                            ) : sub.status === 'accepted' ? (
                                                // LABEL DIGANTI SESUAI REQUEST
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle size={12} /> Nilai Tersimpan
                                                </span>
                                            ) : sub.status === 'rejected' ? (
                                                // LABEL DIGANTI SESUAI REQUEST
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600">
                                                    <XCircle size={12} /> Menunggu Revisi
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                                                    <Clock size={12} /> Baru Masuk
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
                                            <Clock size={10}/> {sub.submitted_at}
                                        </p>
                                         
                                        <a 
                                            href={sub.file_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition border border-blue-100 w-full justify-center"
                                        >
                                            <Download size={14} /> 
                                            {isRevision ? 'Lihat File Revisi' : 'Download File'}
                                        </a>
                                        
                                        <p className="text-[10px] text-gray-400 mt-2 truncate max-w-[150px]" title={sub.original_filename}>
                                            {sub.original_filename}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-400">
                                        <XCircle size={12} /> Belum Kumpul
                                    </span>
                                )}
                            </td>

                            {/* KOLOM 3: NILAI */}
                            <td className="px-6 py-4 align-top">
                                {sub ? (
                                    <input 
                                        type="number" 
                                        min="0" max="100"
                                        className={`w-full border rounded-lg px-3 py-2 text-center font-bold outline-none focus:ring-2 focus:ring-purple-500 ${isRevision ? 'bg-white border-orange-300' : 'border-gray-300'}`}
                                        placeholder="0"
                                        value={input?.score || ''}
                                        onChange={(e) => handleInputChange(sub.id, 'score', e.target.value)}
                                    />
                                ) : (
                                    <span className="text-gray-300 text-sm italic">N/A</span>
                                )}
                            </td>

                            {/* KOLOM 4: FEEDBACK */}
                            <td className="px-6 py-4 align-top">
                                {sub ? (
                                    <div className="relative">
                                        {/* Jika revisi, tampilkan label kecil agar guru ingat feedback lama */}
                                        {isRevision && (
                                            <p className="text-[10px] text-orange-600 font-bold mb-1 flex items-center gap-1">
                                                <Info size={10} /> Feedback sebelumnya:
                                            </p>
                                        )}
                                        <textarea 
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                                            placeholder="Tulis komentar/alasan penolakan..."
                                            value={input?.feedback || ''}
                                            onChange={(e) => handleInputChange(sub.id, 'feedback', e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-300 text-sm italic">Menunggu pengumpulan...</span>
                                )}
                            </td>

                            {/* KOLOM 5: AKSI */}
                            <td className="px-6 py-4 align-top">
                                {sub && (
                                    <div className="flex flex-col gap-2">
                                        {/* TOMBOL TERIMA (HIJAU) */}
                                        <button 
                                            onClick={() => handleSaveGrade(sub.id, 'accepted')}
                                            disabled={savingId === sub.id}
                                            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm disabled:bg-gray-300 text-xs font-bold flex items-center justify-center gap-1"
                                        >
                                            {savingId === sub.id ? <Loader2 className="animate-spin" size={14}/> : <CheckCircle size={14} />}
                                            Simpan Nilai
                                        </button>

                                        {/* TOMBOL TOLAK (MERAH) */}
                                        <button 
                                            onClick={() => handleSaveGrade(sub.id, 'rejected')}
                                            disabled={savingId === sub.id}
                                            className="bg-white border border-red-200 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition shadow-sm disabled:bg-gray-100 text-xs font-bold flex items-center justify-center gap-1"
                                        >
                                            <XCircle size={14} />
                                            Minta Revisi
                                        </button>
                                    </div>
                                )}
                            </td>

                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

    </div>
  );
}