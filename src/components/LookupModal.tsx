import React, { useState } from 'react';
import { X, Search, Calendar, Clock, AlertTriangle, CheckCircle, Ticket, XCircle } from 'lucide-react';
import { Booking } from '../types';
import { api } from '../services/api';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewTicket: (booking: Booking) => void;
}

export const LookupModal: React.FC<LookupModalProps> = ({ isOpen, onClose, onViewTicket }) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Booking[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setCancelSuccessMsg('');
      const data = await api.lookupBookings(searchQuery.trim());
      setResults(data);
      if (data.length === 0) {
        setErrorMsg('لم يتم العثور على أي حجوزات بهذا الرقم أو الكود');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل البحث عن الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟ سيتم تطبيق سياسة الإلغاء.')) return;
    try {
      setCancellingId(booking.id);
      setErrorMsg('');
      setCancelSuccessMsg('');
      const res = await api.cancelBooking(booking.id, booking.customerPhone, cancelReason || 'إلغاء بواسطة العميل');
      setCancelSuccessMsg(res.message);
      // Refresh results
      const updated = results?.map(b => b.id === booking.id ? res.booking : b) || [];
      setResults(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل إلغاء الحجز');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#09140e] border border-emerald-900/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-950/80 flex items-center justify-between bg-[#060e0a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30">
              🔍
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">استعلام عن حجوزاتي السابقة</h2>
              <p className="text-xs text-slate-400">ابحث برقم هاتفك أو كود الحجز لمتابعة حالته أو إلغائه</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="أدخل رقم الهاتف (مثل: 01012345678) أو كود الحجز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#07110c] border border-emerald-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'جاري البحث...' : 'بحث'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs sm:text-sm">
              {errorMsg}
            </div>
          )}

          {cancelSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* Results List */}
          {results && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                نتائج الحجوزات ({results.length})
              </h3>

              {results.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-emerald-950">
                  <p className="text-sm text-slate-400">لا توجد حجوزات مسجلة بهذا الرقم حتى الآن.</p>
                </div>
              ) : (
                results.map((booking) => {
                  const isCancelled = booking.status === 'CANCELLED';
                  const isConfirmed = booking.status === 'CONFIRMED';
                  const isPending = booking.status === 'PENDING';
                  const remainingAmount = Math.max(0, booking.totalAmount - booking.depositAmount);

                  return (
                    <div
                      key={booking.id}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-950 hover:border-emerald-800 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white font-mono">{booking.bookingCode}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isConfirmed
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : isPending
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-rose-950 text-rose-300 border border-rose-700'
                            }`}
                          >
                            {isConfirmed ? 'مؤكد ✓' : isPending ? 'قيد المراجعة ⏳' : 'ملغي ❌'}
                          </span>
                        </div>

                        <span className="text-xs text-slate-400 font-medium">
                          {booking.court?.name || 'الملعب'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[10px]">التاريخ:</span>
                          <span className="font-semibold text-white">{booking.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">التوقيت:</span>
                          <span className="font-semibold text-white">{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">العربون:</span>
                          <span className="font-semibold text-emerald-400">{booking.depositAmount} ج.م</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">المتبقي بالملعب:</span>
                          <span className="font-semibold text-amber-300">{remainingAmount} ج.م</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-emerald-950/60">
                        <button
                          onClick={() => onViewTicket(booking)}
                          className="text-xs font-bold text-volt-400 hover:underline flex items-center gap-1"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>عرض التذكرة الرقمية</span>
                        </button>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            disabled={cancellingId === booking.id}
                            className="px-3 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? 'جاري الإلغاء...' : 'طلب إلغاء الحجز'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};