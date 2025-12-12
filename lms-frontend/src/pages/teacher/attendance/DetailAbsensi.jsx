import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../../lib/axios';
import QRCode from "react-qr-code";
import html2canvas from 'html2canvas'; // <--- LIBRARY BARU WAJIB DIINSTALL
import {
  ArrowLeft, Clock, Users, XCircle, CheckCircle,
  StopCircle, RefreshCw, ScanLine, Download
} from 'lucide-react';

export default function DetailAbsensi() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false); // State untuk loading download

  const fetchData = async () => {
    try {
      const res = await axiosClient.get(`/teacher/attendance/sessions/${sessionId}`);
      setData(res.data);
    } catch (error) {
      // Silent error or alert
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleUpdateStatus = async (attendanceId, newStatus) => {
    setIsUpdating(attendanceId);
    try {
      await axiosClient.put(`/teacher/attendance/attendances/${attendanceId}`, { status: newStatus });
      setData(prev => ({
        ...prev,
        students: prev.students.map(s => s.id === attendanceId ? { ...s, status: newStatus } : s)
      }));
    } catch (error) {
      alert("Gagal update status.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCloseSession = async () => {
    if (!window.confirm("Yakin ingin menutup sesi ini? Siswa tidak akan bisa absen lagi.")) return;
    try {
      await axiosClient.put(`/teacher/attendance/sessions/${sessionId}/close`);
      fetchData();
      alert("Sesi ditutup.");
    } catch (e) { alert("Gagal menutup sesi"); }
  };

  // --- LOGIC DOWNLOAD QR CODE BARU (PAKAI HTML2CANVAS) ---
  const handleDownloadQR = async () => {
    const element = document.getElementById('printable-qr-card'); // Ambil elemen tersembunyi
    if (!element) return;

    setIsDownloading(true);

    try {
      // Tunggu sebentar agar QR code benar-benar ter-render di hidden element
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2, // Resolusi 2x biar tajam (Retina quality)
        backgroundColor: null, // Transparan background luarnya
        logging: false,
        useCORS: true
      });

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Absen-${session.token}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    } catch (error) {
      console.error("Gagal membuat gambar:", error);
      alert("Gagal mendownload gambar QR.");
    } finally {
      setIsDownloading(false);
    }
  };
  // -------------------------------------------------------

  if (isLoading || !data) return <div className="text-center py-20">Memuat Detail Absensi...</div>;

  const { session, students } = data;

  const getStatusColor = (status) => {
    switch (status) {
      case 'H': return 'bg-green-100 text-green-700 border-green-200';
      case 'S': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'I': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'A': return 'bg-red-100 text-red-700 border-red-200';
      case 'T': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100';
    }
  };

  const stats = {
    H: students.filter(s => s.status === 'H').length,
    S: students.filter(s => s.status === 'S').length,
    I: students.filter(s => s.status === 'I').length,
    A: students.filter(s => s.status === 'A').length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20 relative">
      <Link to="/teacher/attendance" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft size={18} /> Kembali ke Daftar Sesi
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* KOLOM KIRI: INFO SESI & QR CODE (TAMPILAN DI WEB) */}
        <div className="lg:col-span-1 space-y-6">

          {/* KARTU TOKEN & QR */}
          <div className={`p-6 rounded-2xl text-center shadow-lg border-2 flex flex-col items-center ${session.is_active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
            <p className="text-sm font-medium uppercase tracking-wider mb-4 opacity-80 flex items-center gap-2">
              <ScanLine size={16} /> Scan QR / Input Kode
            </p>

            {/* --- AREA QR CODE --- */}
            <div className="bg-white p-3 rounded-xl mb-4 shadow-inner">
              <QRCode
                value={session.token}
                size={160}
                viewBox={`0 0 256 256`}
              />
            </div>

            {/* TOMBOL DOWNLOAD QR */}
            {session.is_active && (
              <button
                onClick={handleDownloadQR}
                disabled={isDownloading}
                className="mb-6 px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-bold flex items-center gap-2 transition border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} /> {isDownloading ? 'Memproses...' : 'Simpan QR ke Galeri'}
              </button>
            )}
            {/* -------------------- */}

            <h1 className="text-5xl font-black tracking-widest font-mono select-all bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              {session.token}
            </h1>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium opacity-90">
              {session.is_active ? (
                <><Clock size={16} className="animate-pulse" /> Sesi Aktif</>
              ) : (
                <><XCircle size={16} /> Sesi Ditutup</>
              )}
            </div>
          </div>

          {/* INFO DETAIL & STATISTIK (Sama seperti sebelumnya...) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase">Judul</label>
              <p className="font-bold text-gray-800 text-lg">{session.title}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase">Dibuka</label>
                <p className="text-gray-700 text-sm font-mono">{new Date(session.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="text-right">
                <label className="text-xs text-gray-400 font-bold uppercase">Tutup</label>
                <p className="text-red-500 text-sm font-mono font-bold">{new Date(session.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {session.is_active && (
              <button
                onClick={handleCloseSession}
                className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 flex items-center justify-center gap-2 mt-4 transition"
              >
                <StopCircle size={20} /> Tutup Sesi Sekarang
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <p className="text-2xl font-black text-green-600">{stats.H}</p>
              <p className="text-xs text-green-800 font-bold uppercase">Hadir</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <p className="text-2xl font-black text-red-600">{stats.A}</p>
              <p className="text-xs text-red-800 font-bold uppercase">Alpha</p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: TABEL SISWA (Sama seperti sebelumnya...) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Users size={18} /> Kehadiran ({students.length} Siswa)
              </h3>
              <button onClick={fetchData} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition" title="Refresh Data">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar" style={{ maxHeight: '600px' }}>
              <table className="w-full text-left border-collapse">
                <thead className="bg-white text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 bg-gray-50/90 backdrop-blur">Nama Siswa</th>
                    <th className="px-6 py-4 bg-gray-50/90 backdrop-blur">Waktu</th>
                    <th className="px-6 py-4 bg-gray-50/90 backdrop-blur text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {students.map((student) => (
                    <tr key={student.id} className={`transition ${student.status === 'H' ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-3">
                        <p className="font-bold text-gray-800">{student.student_name}</p>
                        <p className="text-xs text-gray-400">{student.student_nisn}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-500 font-mono">
                        {student.check_in_at !== '-' ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold">
                            <CheckCircle size={12} /> {student.check_in_at}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <select
                          className={`px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer appearance-none text-center w-24 transition shadow-sm hover:shadow ${getStatusColor(student.status)}`}
                          value={student.status}
                          onChange={(e) => handleUpdateStatus(student.id, e.target.value)}
                          disabled={isUpdating === student.id}
                        >
                          <option value="H">Hadir</option>
                          <option value="I">Izin</option>
                          <option value="S">Sakit</option>
                          <option value="A">Alpha</option>
                          <option value="T">Telat</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================================
          AREA TERSEMBUNYI UNTUK DICETAK/DIDOWNLOAD (MENGGUNAKAN TAILWIND AGAR SESUAI DESAIN)
          Posisi di-fixed keluar layar agar tidak terlihat user.
         ================================================================================== */}
      <div
        id="printable-qr-card"
        className="fixed left-[-9999px] top-0 bg-indigo-600 p-10 rounded-[40px] flex flex-col items-center text-white font-sans antialiased shadow-2xl"
        style={{ width: '480px' }} // Lebar fix agar hasil download konsisten
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 opacity-90 font-bold text-lg uppercase tracking-widest">
          <ScanLine size={28} strokeWidth={2.5} /> SCAN QR / INPUT KODE
        </div>

        {/* White QR Box with Extra Padding & Rounded corners */}
        <div className="bg-white p-6 rounded-[30px] mb-10 shadow-xl">
          <QRCode value={session.token} size={280} />
        </div>

        {/* Token Box (Darker Purple Effect) */}
        <div className="bg-indigo-800/40 backdrop-blur-sm p-6 rounded-2xl w-full text-center mb-8 border border-indigo-500/30">
          <h1 className="text-7xl font-black font-mono tracking-[0.15em] drop-shadow-sm">
            {session.token}
          </h1>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 font-bold text-lg opacity-95 bg-indigo-700/30 px-6 py-2 rounded-full">
          {session.is_active ? (
            <><Clock size={24} className="" /> Sesi Aktif</>
          ) : (
            <><XCircle size={24} /> Sesi Ditutup</>
          )}
        </div>
      </div>
      {/* ================================================================================== */}

    </div>
  );
}