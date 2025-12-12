import { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import { Scanner } from '@yudiel/react-qr-scanner'; 
import { 
  QrCode, History, CheckCircle, XCircle, Clock, Calendar, 
  ArrowRight, Loader2, StopCircle
} from 'lucide-react';

export default function AbsensiSiswa() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null); 
  const [isScanning, setIsScanning] = useState(false); 

  // 1. Fetch History
  const fetchHistory = async () => {
    try {
      const res = await axiosClient.get('/student/attendance/history');
      setHistory(res.data);
    } catch (error) {
      // Silent error log jika gagal load history
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. Logic Submit
  const submitAbsen = async (tokenData) => {
    if (!tokenData || tokenData.length < 6) return;

    // Cegah submit ganda jika sedang loading
    if (isLoading) return;

    setIsLoading(true);
    setStatusMsg(null);
    setIsScanning(false); // Tutup kamera segera

    try {
      const res = await axiosClient.post('/student/attendance/check-in', { token: tokenData });
      setStatusMsg({ type: 'success', text: res.data.message });
      setToken('');
      fetchHistory(); 
    } catch (error) {
      setStatusMsg({ 
        type: 'error', 
        text: error.response?.data?.message || 'Token salah atau sesi berakhir.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Submit Manual
  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitAbsen(token);
  };

  // 4. Handle Scan Result (Versi Bersih)
  const handleScan = (result) => {
      if (result && result.length > 0) {
          const rawValue = result[0]?.rawValue;
          if (rawValue) {
              setToken(rawValue); // Tampilkan token di input agar user tau
              submitAbsen(rawValue); // Auto submit
          }
      }
  };

  return (
    <div className="max-w-md mx-auto p-6 pb-20">
      
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Absensi Kelas</h1>
        <p className="text-gray-500 text-sm">Masukkan token atau scan QR code.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8 overflow-hidden relative">
        
        {/* Status Message */}
        {statusMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-fade-in ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {statusMsg.type === 'success' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                {statusMsg.text}
            </div>
        )}

        {isScanning ? (
            <div className="flex flex-col items-center animate-fade-in">
                <div className="w-full aspect-square bg-black rounded-xl overflow-hidden mb-4 relative">
                    <Scanner 
                        onScan={handleScan}
                        scanDelay={2000}
                        allowMultiple={true}
                        components={{
                            audio: false,
                            finder: true 
                        }}
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded z-10">
                        Pastikan cahaya cukup
                    </div>
                </div>
                <button 
                    onClick={() => setIsScanning(false)}
                    className="w-full py-2 bg-red-100 text-red-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition"
                >
                    <StopCircle size={18} /> Batalkan Scan
                </button>
            </div>
        ) : (
            <>
                <form onSubmit={handleManualSubmit}>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 text-center">Kode Token (6 Digit)</label>
                        <input 
                            type="text" 
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            placeholder="X7B9A1"
                            className="w-full text-center text-3xl font-black tracking-widest border-2 border-gray-200 rounded-xl py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none uppercase placeholder-gray-200 transition"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || token.length < 6}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition shadow-lg shadow-indigo-200 mb-3"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                        {isLoading ? 'Memproses...' : 'Check-In Sekarang'}
                    </button>
                </form>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">ATAU</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button 
                    onClick={() => { setStatusMsg(null); setIsScanning(true); }}
                    className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-400 flex justify-center items-center gap-2 transition"
                >
                    <QrCode size={20} /> Scan QR Code
                </button>
            </>
        )}
      </div>

      {/* RIWAYAT */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History size={18} /> Riwayat Kehadiran
        </h3>
        <div className="space-y-3">
            {history.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">Belum ada riwayat absensi.</p>
            ) : (
                history.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">{item.subject}</h4>
                            <p className="text-xs text-gray-500">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                <Calendar size={10} /> {item.date}
                                <Clock size={10} /> {item.check_in_time}
                            </div>
                        </div>
                        <div>
                            {item.status === 'H' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hadir</span>}
                            {item.status === 'A' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Alpha</span>}
                            {item.status === 'S' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Sakit</span>}
                            {item.status === 'I' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Izin</span>}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

    </div>
  );
}