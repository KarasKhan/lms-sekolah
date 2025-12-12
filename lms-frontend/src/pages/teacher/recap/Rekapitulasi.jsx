import { useState, useEffect } from 'react';
import axiosClient from '../../../lib/axios';
import { 
  BookOpen, Download, Table, FileSpreadsheet, Users, 
  ChevronRight, AlertCircle 
} from 'lucide-react';

export default function Rekapitulasi() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [data, setData] = useState(null); // Data Matrix Lengkap
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'grades'

  // 1. Fetch Kelas Guru
  useEffect(() => {
    axiosClient.get('/teacher/grades/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  // 2. Fetch Data Rekap
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setData(null);

    if (courseId) {
      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/teacher/recap/courses/${courseId}`);
        setData(res.data);
      } catch (error) {
        alert("Gagal memuat data rekapitulasi.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 3. Handle Export CSV
  const handleExport = async () => {
    if (!selectedCourseId) return;
    try {
        // Trigger download via browser logic
        const response = await axiosClient.get(`/teacher/recap/courses/${selectedCourseId}/export`, {
            responseType: 'blob', // Penting untuk file binary
        });
        
        // Buat link virtual untuk download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Rekap_${data?.subject}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        alert("Gagal mengunduh file Excel.");
    }
  };

  // Helper Warna Absensi
  const getAttColor = (status) => {
    switch(status) {
        case 'H': return 'bg-green-100 text-green-700 font-bold';
        case 'A': return 'bg-red-100 text-red-700 font-bold';
        case 'S': case 'I': return 'bg-yellow-100 text-yellow-700 font-bold';
        case 'T': return 'bg-orange-100 text-orange-700 font-bold';
        default: return 'text-gray-300'; // '-'
    }
  };

  // Helper Warna Nilai
  const getScoreColor = (score) => {
    if (score === null) return 'text-gray-300 font-bold'; // Belum
    if (score < 70) return 'text-red-600 font-bold bg-red-50';
    if (score >= 85) return 'text-green-600 font-bold';
    return 'text-gray-700 font-bold';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="text-indigo-600" /> Rekapitulasi & Raport
            </h1>
            <p className="text-gray-500 mt-1">Pantau kehadiran dan nilai siswa dalam satu tampilan matriks.</p>
        </div>
        
        {data && (
            <button 
                onClick={handleExport}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 shadow-sm transition"
            >
                <Download size={18} /> Export Excel (CSV)
            </button>
        )}
      </div>

      {/* FILTER & STATS BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full md:w-auto">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <BookOpen size={20} className="text-gray-500" />
                <select 
                    className="bg-transparent outline-none w-full font-medium text-gray-700"
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                >
                    <option value="">-- Pilih Kelas --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>
        
        {/* Ringkasan Cepat (Jika data ada) */}
        {data && (
            <div className="flex items-center gap-6 text-sm px-4">
                <div className="text-center">
                    <p className="text-gray-400 font-bold uppercase text-[10px]">Total Siswa</p>
                    <p className="font-bold text-lg text-gray-800">{data.students.length}</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                    <p className="text-gray-400 font-bold uppercase text-[10px]">Jml Pertemuan</p>
                    <p className="font-bold text-lg text-gray-800">{data.sessions_header.length}</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                    <p className="text-gray-400 font-bold uppercase text-[10px]">Item Nilai</p>
                    <p className="font-bold text-lg text-gray-800">{data.grades_header.length}</p>
                </div>
            </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      {isLoading ? <div className="text-center py-20 text-gray-500">Memuat matriks data...</div> : 
       !data ? <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">Pilih kelas untuk melihat data.</div> : 
       (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
            
            {/* TABS */}
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('attendance')}
                    className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition hover:bg-gray-50 ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500'}`}
                >
                    DATA ABSENSI (KEHADIRAN)
                </button>
                <div className="w-px bg-gray-200"></div>
                <button 
                    onClick={() => setActiveTab('grades')}
                    className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition hover:bg-gray-50 ${activeTab === 'grades' ? 'border-purple-600 text-purple-600 bg-purple-50/50' : 'border-transparent text-gray-500'}`}
                >
                    DATA NILAI (TUGAS & KUIS)
                </button>
            </div>

            {/* TABEL MATRIX (Scrollable) */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    
                    {/* --- HEADER TABEL --- */}
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            {/* Sticky Column: NAMA */}
                            <th className="sticky left-0 bg-gray-50 z-10 px-6 py-4 border-b border-r border-gray-200 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Nama Siswa</th>
                            
                            {/* Dynamic Columns */}
                            {activeTab === 'attendance' ? (
                                data.sessions_header.map((sess, idx) => (
                                    <th key={sess.id} className="px-4 py-4 border-b border-gray-200 text-center min-w-[80px]" title={sess.title}>
                                        P{idx + 1}
                                        <div className="text-[9px] text-gray-400 font-normal mt-1">
                                            {new Date(sess.opened_at).toLocaleDateString('id-ID', {day:'numeric', month:'numeric'})}
                                        </div>
                                    </th>
                                ))
                            ) : (
                                data.grades_header.map((item, idx) => (
                                    <th key={item.id} className="px-4 py-4 border-b border-gray-200 text-center min-w-[120px]" title={item.title}>
                                        {item.type === 'quiz' ? 'Kuis' : 'Tugas'} {idx + 1}
                                        <div className="text-[9px] text-gray-400 font-normal mt-1 truncate max-w-[100px] mx-auto">{item.title}</div>
                                    </th>
                                ))
                            )}

                            {/* Summary Column */}
                            <th className="px-6 py-4 border-b border-l border-gray-200 text-center bg-gray-50 w-24">
                                {activeTab === 'attendance' ? '% Hadir' : 'Rata-rata'}
                            </th>
                        </tr>
                    </thead>

                    {/* --- BODY TABEL --- */}
                    <tbody className="text-sm divide-y divide-gray-100">
                        {data.students.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition">
                                
                                {/* Sticky Column: NAMA */}
                                <td className="sticky left-0 bg-white z-10 px-6 py-3 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <p className="font-bold text-gray-800">{student.name}</p>
                                    <p className="text-xs text-gray-400">{student.nisn}</p>
                                </td>

                                {/* Dynamic Cells */}
                                {activeTab === 'attendance' ? (
                                    student.attendance_row.map((status, i) => (
                                        <td key={i} className="px-4 py-3 text-center border-r border-gray-50 last:border-r-0">
                                            <span className={`inline-block w-8 h-8 leading-8 rounded-full text-xs ${getAttColor(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                    ))
                                ) : (
                                    student.grades_row.map((score, i) => (
                                        <td key={i} className="px-4 py-3 text-center border-r border-gray-50 last:border-r-0">
                                            <span className={`inline-block px-2 py-1 rounded ${getScoreColor(score)}`}>
                                                {score ?? '-'}
                                            </span>
                                        </td>
                                    ))
                                )}

                                {/* Summary Cell */}
                                <td className="px-6 py-3 border-l border-gray-200 text-center font-bold bg-gray-50/30">
                                    {activeTab === 'attendance' ? (
                                        <span className={student.attendance_percent < 75 ? 'text-red-600' : 'text-green-600'}>
                                            {student.attendance_percent}%
                                        </span>
                                    ) : (
                                        <span className={student.average_score < 75 ? 'text-orange-600' : 'text-indigo-600'}>
                                            {student.average_score}
                                        </span>
                                    )}
                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
            
            {/* Footer Legend */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 text-xs text-gray-500 flex flex-wrap gap-6 justify-center">
                {activeTab === 'attendance' ? (
                    <>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded-full"></span> H: Hadir</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded-full"></span> A: Alpha</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 rounded-full"></span> S/I: Sakit/Izin</span>
                    </>
                ) : (
                    <>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded-full"></span> - : Belum Dinilai</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded-full"></span> Merah: Di bawah KKM (75)</span>
                    </>
                )}
            </div>

        </div>
       )
      }
    </div>
  );
}