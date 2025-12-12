import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/axios';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Loader2, Save } from 'lucide-react';

export default function KerjakanKuis() {
  const { id } = useParams(); // Quiz ID
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null); // Jika sudah mengerjakan
  const [isLoading, setIsLoading] = useState(true);
  
  // State Ujian
  const [currentIdx, setCurrentIdx] = useState(0); // Nomor soal aktif
  const [answers, setAnswers] = useState({}); // { question_id: answer_index }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axiosClient.get(`/student/quizzes/${id}`);
        setQuiz(response.data.quiz);
        setAttempt(response.data.last_attempt); // Cek history
      } catch (error) {
        alert("Gagal memuat kuis.");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // 2. Handle Pilih Jawaban
  const handleSelectAnswer = (questionId, optionIndex) => {
    if (attempt) return; // Read only jika sudah selesai
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // 3. Submit Jawaban
  const handleSubmit = async () => {
    if(!window.confirm("Yakin ingin mengumpulkan jawaban?")) return;
    
    setIsSubmitting(true);
    try {
      const response = await axiosClient.post(`/student/quizzes/${id}/submit`, {
        answers: answers
      });
      
      // Update state dengan hasil terbaru
      setAttempt(response.data.attempt);
      alert(`Ujian Selesai! Nilai Anda: ${response.data.score}`);
      // Scroll ke atas untuk lihat hasil
      window.scrollTo(0,0);

    } catch (error) {
      alert("Gagal mengirim jawaban.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center">Memuat Soal...</div>;
  
  // TAMPILAN HASIL (JIKA SUDAH MENGERJAKAN)
  if (attempt) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl text-center">
          <div className="mb-6">
            {attempt.score >= 75 ? (
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} />
                </div>
            ) : (
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle size={40} />
                </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800">Hasil Ujian</h2>
            <p className="text-gray-500">{quiz.title}</p>
          </div>
          
          <div className="text-6xl font-black text-indigo-600 mb-2">
            {attempt.score}
          </div>
          <p className="text-sm font-medium text-gray-400 mb-8 uppercase tracking-widest">Nilai Akhir</p>

          <button 
            onClick={() => navigate(-1)} 
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Kembali ke Materi
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN PENGERJAAN SOAL
  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentIdx + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header Progress */}
      <div className="h-16 border-b flex items-center justify-between px-6 sticky top-0 bg-white z-10">
        <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase">Kuis</span>
            <span className="font-bold text-gray-800">{quiz.title}</span>
        </div>
        <div className="text-sm font-bold text-indigo-600">
            {currentIdx + 1} <span className="text-gray-400">/ {totalQuestions}</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1">
        <div className="bg-indigo-600 h-1 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Soal Area */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 flex flex-col justify-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
            {currentQuestion.question_text}
        </h2>

        <div className="space-y-3">
            {currentQuestion.options.map((opt, index) => (
                <button
                    key={index}
                    onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3
                        ${answers[currentQuestion.id] === index 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }
                    `}
                >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                        ${answers[currentQuestion.id] === index ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}
                    `}>
                        {answers[currentQuestion.id] === index && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium">{opt}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="h-20 border-t flex items-center justify-between px-6 md:px-20 bg-gray-50">
        <button 
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
            <ArrowLeft size={18} /> Sebelumnya
        </button>

        {currentIdx === totalQuestions - 1 ? (
            <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition font-bold"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />} 
                Selesai & Kumpulkan
            </button>
        ) : (
            <button 
                onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition font-bold"
            >
                Selanjutnya <ArrowRight size={18} />
            </button>
        )}
      </div>

    </div>
  );
}