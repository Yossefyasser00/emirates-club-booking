import React, { useState, useEffect } from 'react';
import {
  X, Calendar as CalendarIcon, Clock, ShieldCheck, CheckCircle, AlertCircle,
  Copy, Upload, Check, Tag, Repeat, Share2, Ticket, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Court, Slot, Booking, Settings } from '../types';
import { api } from '../services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourt: Court | null;
  courts: Court[];
  settings: Settings | null;
  onBookingSuccess: (booking: Booking) => void;
  onViewTicket: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedCourt,
  courts,
  settings,
  onBookingSuccess,
  onViewTicket,
}) => {
  if (!isOpen) return null;

  const [activeCourt, setActiveCourt] = useState<Court | null>(selectedCourt || courts[0] || null);
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [durationHours, setDurationHours] = useState<number>(1);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringWeeks, setRecurringWeeks] = useState<number>(4);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string>('');
  const [promoErrorMsg, setPromoErrorMsg] = useState<string>('');
  const [validatingPromo, setValidatingPromo] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<'VODAFONE_CASH' | 'INSTAPAY' | 'CASH_ON_ARRIVAL'>('VODAFONE_CASH');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [step, setStep] = useState<'SELECTION' | 'SUCCESS'>('SELECTION');
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (selectedCourt) {
      setActiveCourt(selectedCourt);
    } else if (courts.length > 0 && !activeCourt) {
      setActiveCourt(courts[0]);
    }
  }, [selectedCourt, courts]);

  useEffect(() => {
    if (activeCourt && selectedDate) {
      fetchCourtSlots(activeCourt.id, selectedDate);
    }
  }, [activeCourt, selectedDate]);

  const fetchCourtSlots = async (courtId: string, date: string) => {
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const data = await api.getSlots(courtId, date);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
    const dayNumber = d.getDate();
    return { dateStr, dayName, dayNumber, isToday: i === 0 };
  });

  const calculatePrice = () => {
    if (!activeCourt || !selectedSlot) return { subtotal: 0, finalTotal: 0, deposit: 0 };
    const startH = parseInt(selectedSlot.startTime.split(':')[0], 10);
    let total = 0;
    for (let i = 0; i < durationHours; i++) {
      const h = startH + i;
      const isPeak = h >= 17 && h < 24;
      total += isPeak ? activeCourt.peakPricePerHour : activeCourt.pricePerHour;
    }
    if (isRecurring) total = total * recurringWeeks;
    const finalTotal = Math.max(0, total - promoDiscount);

    let deposit = 0;
    if (settings?.useFixedDeposit) {
      deposit = Math.min(finalTotal, (settings.fixedDepositAmount || 100) * (isRecurring ? recurringWeeks : 1));
    } else {
      const pct = settings?.depositPercentage || 30;
      deposit = Math.round((finalTotal * pct) / 100);
    }
    return { subtotal: total, finalTotal, deposit };
  };

  const { subtotal, finalTotal, deposit } = calculatePrice();

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim() || !selectedSlot) {
      setPromoErrorMsg('يرجى اختيار الموعد أولاً لتطبيق الخصم');
      return;
    }
    try {
      setValidatingPromo(true);
      setPromoErrorMsg('');
      setPromoSuccessMsg('');
      const res = await api.validatePromo(promoCodeInput.trim().toUpperCase(), durationHours, subtotal);
      if (res.valid) {
        setPromoDiscount(res.discountAmount);
        setPromoSuccessMsg(`تم تطبيق الكوبون! خصم ${res.discountAmount} ج.م`);
      } else {
        setPromoDiscount(0);
        setPromoErrorMsg(res.message || 'كوبون الخصم غير صالح أو منتهي');
      }
    } catch {
      setPromoDiscount(0);
      setPromoErrorMsg('فشل التحقق من الكوبون');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourt || !selectedSlot) {
      setErrorMsg('يرجى اختيار موعد الحجز من الجدول');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى كتابة الاسم ورقم الهاتف');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        courtId: activeCourt.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        durationHours,
        promoCode: promoSuccessMsg ? promoCodeInput.trim().toUpperCase() : null,
        notes: notes.trim() || null,
        paymentMethod,
        transactionReference: transactionRef.trim() || null,
        isRecurring,
        recurringWeeks: isRecurring ? recurringWeeks : 1,
      };

      const res = await api.createBooking(payload);

      if (receiptFile && res.booking?.id) {
        const formData = new FormData();
        formData.append('bookingId', res.booking.id);
        formData.append('receipt', receiptFile);
        formData.append('method', paymentMethod);
        if (transactionRef) formData.append('transactionReference', transactionRef);
        await api.uploadReceipt(formData);
      }

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setCompletedBooking(res.booking);
      setStep('SUCCESS');
      onBookingSuccess(res.booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تنفيذ الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppShareUrl = (booking: Booking) => {
    const text = `⚽ موعد حجز في Emirates Club 🏆\n` +
      `🏟️ الملعب: ${booking.court?.name || activeCourt?.name}\n` +
      `📅 التاريخ: ${booking.date}\n` +
      `⏰ التوقيت: ${booking.startTime} - ${booking.endTime}\n` +
      `🎫 كود الحجز: ${booking.bookingCode}\n` +
      `📍 نرجو الحضور قبل الموعد بـ 15 دقيقة!`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#070e24] border border-sky-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-sky-900/60 flex items-center justify-between bg-[#050b1d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl font-bold border border-sky-400/40 shadow-glow-volt">
              ⚽
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                {step === 'SELECTION' ? 'حجز موعد جديد في Emirates Club' : 'تم تسجيل الحجز بنجاح! 🎉'}
              </h2>
              <p className="text-xs text-slate-300">
                {step === 'SELECTION' ? 'اختر الملعب والموعد وادفع العربون بكل سهولة' : 'بيانات التذكرة والحجز المباشر'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#0a1738] hover:bg-sky-900/50 border border-sky-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {step === 'SELECTION' ? (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Court Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  1. اختر الملعب
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {courts.map((court) => {
                    const isSelected = activeCourt?.id === court.id;
                    const isPadel = court.type === 'PADEL';
                    const isFive = court.type === 'FIVE_A_SIDE';
                    return (
                      <button
                        type="button"
                        key={court.id}
                        onClick={() => { setActiveCourt(court); setSelectedSlot(null); }}
                        disabled={!court.isActive}
                        className={`p-3 rounded-2xl text-right transition-all border ${
                          isSelected
                            ? 'bg-[#0b1d47] border-sky-400 shadow-glow-volt text-white ring-1 ring-sky-400'
                            : 'bg-[#0a1532]/70 border-sky-950/80 text-slate-300 hover:border-sky-500/50'
                        } ${!court.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPadel ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-black/40 text-sky-300'}`}>
                            {isPadel ? 'بادل تنس 🎾' : isFive ? 'خماسي 5v5' : 'سباعي 7v7'}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white truncate">{court.name}</div>
                        <div className="text-[11px] text-sky-300 font-semibold mt-1">{court.pricePerHour} ج.م / ساعة</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2 & 3. Date & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    2. اختر التاريخ
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {nextDays.map((d) => (
                      <button
                        type="button"
                        key={d.dateStr}
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={`flex-1 min-w-[65px] py-2.5 px-2 rounded-2xl text-center transition-all border ${
                          selectedDate === d.dateStr
                            ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-slate-950 font-bold border-sky-300 shadow-glow-volt'
                            : 'bg-[#0a1532]/80 text-slate-300 border-sky-950 hover:border-sky-500/50'
                        }`}
                      >
                        <span className="text-[11px] block">{d.dayName}</span>
                        <span className="text-lg font-black">{d.dayNumber}</span>
                        {d.isToday && <span className="text-[9px] block text-amber-300 font-bold">اليوم</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    3. مدة الحجز
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationHours(1)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all ${
                        durationHours === 1
                          ? 'bg-[#0b1d47] border-sky-400 text-sky-200 shadow-glow-volt ring-1 ring-sky-400'
                          : 'bg-[#0a1532]/60 border-sky-950 text-slate-400 hover:border-sky-800'
                      }`}
                    >
                      ⏱️ ساعة واحدة
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationHours(2)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all ${
                        durationHours === 2
                          ? 'bg-[#0b1d47] border-sky-400 text-sky-200 shadow-glow-volt ring-1 ring-sky-400'
                          : 'bg-[#0a1532]/60 border-sky-950 text-slate-400 hover:border-sky-800'
                      }`}
                    >
                      🔥 ساعتان متتاليتان
                    </button>
                  </div>

                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#0a1532]/60 border border-sky-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-sky-400" />
                      <div>
                        <span className="text-xs font-bold text-slate-200">حجز أسبوعي دوري</span>
                        <p className="text-[10px] text-slate-400">تثبيت الموعد كل أسبوع لنفس الفريق</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Slot Selector */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    4. المواعيد المتاحة
                  </label>
                  <span className="text-[11px] text-slate-400">اختر موعد بدء المباراة</span>
                </div>

                {loadingSlots ? (
                  <div className="p-6 text-center text-xs text-slate-400">جاري تحميل المواعيد...</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      const isAvail = slot.status === 'AVAILABLE';
                      return (
                        <button
                          type="button"
                          key={slot.startTime}
                          disabled={!isAvail}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-2xl text-center border relative transition-all ${
                            isSelected
                              ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-slate-950 font-extrabold border-sky-300 shadow-glow-volt scale-105'
                              : isAvail
                              ? 'bg-[#091738]/80 border-sky-800/40 text-sky-200 hover:border-sky-400'
                              : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-bold block">{slot.startTime}</span>
                          <span className="text-[10px] block opacity-80 mt-0.5">{isAvail ? `${slot.price} ج.م` : 'محجوز'}</span>
                          {slot.isPeak && isAvail && (
                            <span className="absolute -top-1.5 -right-1 text-[9px] px-1 rounded bg-amber-500 text-black font-bold">
                              ذروة
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Customer Info */}
              <div className="p-4 rounded-2xl bg-[#0a1532]/60 border border-sky-950 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>5. بيانات الحجز</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم الحاجز / كابتن الفريق *</label>
                    <input
                      type="text"
                      required
                      placeholder="كابتن أحمد"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#070e24] border border-sky-950 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الهاتف / الواتساب *</label>
                    <input
                      type="tel"
                      required
                      placeholder="01012345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#070e24] border border-sky-950 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">البريد الإلكتروني (اختياري)</label>
                    <input
                      type="email"
                      placeholder="captain@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-[#070e24] border border-sky-950 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">ملاحظات خاصة</label>
                    <input
                      type="text"
                      placeholder="كرات إضافية، فستات..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#070e24] border border-sky-950 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="p-4 rounded-2xl bg-[#0a1532]/60 border border-sky-950">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <Tag className="w-4 h-4" />
                  <span>كود الخصم (Promo Code)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="أدخل كود الخصم مثل: CLUB2026"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#070e24] border border-sky-950 rounded-xl px-3.5 py-2 text-sm text-white uppercase font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={validatingPromo || !promoCodeInput.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                  >
                    {validatingPromo ? 'جاري الفحص...' : 'تطبيق الخصم'}
                  </button>
                </div>
                {promoSuccessMsg && <p className="mt-1.5 text-xs text-sky-400 font-semibold">{promoSuccessMsg}</p>}
                {promoErrorMsg && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{promoErrorMsg}</p>}
              </div>

              {/* 6. Payment & Deposit */}
              <div className="p-4 rounded-2xl bg-[#0a1532]/60 border border-sky-950 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">6. طريقة دفع العربون</span>
                  <span className="text-xs font-bold text-white bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-700/60">
                    العربون: {deposit} ج.م
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('VODAFONE_CASH')}
                    className={`p-2.5 rounded-xl text-right border transition-all ${
                      paymentMethod === 'VODAFONE_CASH'
                        ? 'bg-rose-950/60 border-rose-500 text-white'
                        : 'bg-[#070e24] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-rose-400">🔴 فودافون كاش</div>
                    <div className="text-[10px] text-slate-300">تحويل للمحفظة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('INSTAPAY')}
                    className={`p-2.5 rounded-xl text-right border transition-all ${
                      paymentMethod === 'INSTAPAY'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-[#070e24] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-400">🟣 انستاباي (InstaPay)</div>
                    <div className="text-[10px] text-slate-300">تحويل بالـ IPA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH_ON_ARRIVAL')}
                    className={`p-2.5 rounded-xl text-right border transition-all ${
                      paymentMethod === 'CASH_ON_ARRIVAL'
                        ? 'bg-sky-950/80 border-sky-400 text-white'
                        : 'bg-[#070e24] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-sky-400">🔵 كاش بالنادي</div>
                    <div className="text-[10px] text-slate-300">عند الحضور</div>
                  </button>
                </div>

                {paymentMethod === 'VODAFONE_CASH' && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-rose-300 block">حول العربون ({deposit} ج.م) لرقم:</span>
                      <span className="text-sm font-black text-white font-mono">{settings?.vodafoneCashNumber || '01099887766'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings?.vodafoneCashNumber || '01099887766', 'voda')}
                      className="px-3 py-1 rounded bg-rose-600 text-white font-bold"
                    >
                      {copiedField === 'voda' ? 'تم النسخ' : 'نسخ الرقم'}
                    </button>
                  </div>
                )}

                {paymentMethod === 'INSTAPAY' && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-purple-300 block">حول العربون ({deposit} ج.م) لحساب:</span>
                      <span className="text-sm font-black text-white font-mono">{settings?.instaPayHandle || 'emirates.club@instapay'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings?.instaPayHandle || 'emirates.club@instapay', 'insta')}
                      className="px-3 py-1 rounded bg-purple-600 text-white font-bold"
                    >
                      {copiedField === 'insta' ? 'تم النسخ' : 'نسخ المعرف'}
                    </button>
                  </div>
                )}

                {paymentMethod !== 'CASH_ON_ARRIVAL' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">رقم التحويل (إن وجد)</label>
                      <input
                        type="text"
                        placeholder="TXN-123456"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full bg-[#070e24] border border-sky-950 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">صورة الإيصال (Screenshot)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setReceiptFile(e.target.files[0])}
                        className="w-full text-xs text-slate-400 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-sky-900 file:text-white file:text-xs file:cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Total & Submit Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0a1738] via-[#070e24] to-[#0a1738] border border-sky-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-300">
                    إجمالي الحساب: {durationHours} ساعة {isRecurring ? `(أسبوعي ${recurringWeeks} أسابيع)` : ''}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white font-display">{finalTotal} ج.م</span>
                    {promoDiscount > 0 && <span className="text-xs text-amber-400 line-through">{subtotal} ج.م</span>}
                    <span className="text-xs text-sky-400 font-bold">(العربون: {deposit} ج.م)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedSlot}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm transition-all ${
                    submitting || !selectedSlot
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 hover:from-sky-300 hover:to-blue-400 text-slate-950 shadow-glow-volt hover:scale-105'
                  }`}
                >
                  {submitting ? 'جاري التأكيد...' : 'تأكيد الحجز الآن ⚽'}
                </button>
              </div>

            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-slate-950 text-3xl mx-auto shadow-glow-volt">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-black text-white font-display">تم تسجيل الحجز بنجاح!</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  احتفظ بكود الحجز للاستعلام والإلغاء والمراجعة بالنادي.
                </p>
              </div>

              {completedBooking && (
                <div className="max-w-md mx-auto p-5 rounded-3xl bg-[#0a1532]/90 border border-sky-500/40 text-right space-y-3 shadow-glow-card">
                  <div className="flex items-center justify-between border-b border-sky-950 pb-2.5">
                    <span className="text-xs text-slate-400">كود الحجز الرقمي</span>
                    <span className="text-xl font-black text-sky-400 tracking-widest font-mono">
                      {completedBooking.bookingCode}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">الملعب:</span>
                      <span className="font-bold text-white">{completedBooking.court?.name || activeCourt?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">الموعد:</span>
                      <span className="font-bold text-white">{completedBooking.date} ({completedBooking.startTime} - {completedBooking.endTime})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">الكابتن:</span>
                      <span className="font-bold text-white">{completedBooking.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">العربون المدفوع:</span>
                      <span className="font-bold text-sky-400">{completedBooking.depositAmount} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {completedBooking && (
                  <>
                    <a
                      href={getWhatsAppShareUrl(completedBooking)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>مشاركة على واتساب مع الفريق</span>
                    </a>
                    <button
                      onClick={() => { onViewTicket(completedBooking); onClose(); }}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>عرض بطاقة التذكرة الرقمية 🎫</span>
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0a1738] border border-sky-900 text-slate-300 font-bold text-xs sm:text-sm"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};