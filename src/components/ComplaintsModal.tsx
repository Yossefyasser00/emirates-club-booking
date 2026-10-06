import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle, AlertCircle, Phone, User, FileText } from 'lucide-react';
import { api } from '../services/api';

interface ComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplaintsModal: React.FC<ComplaintsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.submitComplaint({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        bookingCode: bookingCode.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSuccessTicket(res.complaint.ticketNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال الشكوى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#09140e] border border-emerald-900/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-950/80 flex items-center justify-between bg-[#060e0a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl font-bold border border-sky-500/30">
              💬
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">مركز الشكاوى والمقترحات</h2>
              <p className="text-xs text-slate-400">تصل رسالتك مباشرة لمدير المجمع للرد والمتابعة</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {successTicket ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto border border-emerald-500/40 shadow-glow-emerald">
                ✓
              </div>
              <h3 className="text-xl font-bold text-white">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                رقم التذكرة الخاص بك هو: <span className="font-mono font-black text-volt-400">{successTicket}</span>. سنقوم بالتواصل معك عبر الهاتف أو الواتساب في أقرب وقت.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                حسناً، إغلاق
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="كابتن كريم"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#07110c] border border-emerald-950 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#07110c] border border-emerald-950 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-semibold">كود الحجز (إن وجد)</label>
                <input
                  type="text"
                  placeholder="مثال: CLUB-1001"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  className="w-full bg-[#07110c] border border-emerald-950 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-semibold">موضوع الشكوى / المقترح *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طلب صيانة كشافات، كرات جديدة، استفسار..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#07110c] border border-emerald-950 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-semibold">تفاصيل الرسالة *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب تفاصيل ملاحظاتك أو شكواك هنا بكل وضوح..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#07110c] border border-emerald-950 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'جاري الإرسال...' : 'إرسال الشكوى للإدارة'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};