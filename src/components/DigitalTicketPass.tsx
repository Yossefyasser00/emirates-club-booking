import React from 'react';
import { X, Printer, Share2, MapPin, Calendar, Clock, User, Phone, CheckCircle, Trophy } from 'lucide-react';
import { Booking } from '../types';

interface DigitalTicketPassProps {
  booking: Booking | null;
  onClose: () => void;
}

export const DigitalTicketPass: React.FC<DigitalTicketPassProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = booking.status === 'CONFIRMED';
  const remainingAmount = Math.max(0, booking.totalAmount - booking.depositAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0b1610] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Actions Bar (Top) */}
        <div className="px-5 py-3 border-b border-emerald-950 flex items-center justify-between bg-[#060e0a]">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Trophy className="w-4 h-4 text-volt-400" />
            <span>تذكرة الدخول الرسمية للملعب (Match Pass)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة التذكرة</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Digital Match Ticket (Stylized Pass) */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          
          <div className="w-full bg-gradient-to-b from-[#0f281b] via-[#091b12] to-[#08150e] rounded-3xl border-2 border-emerald-500/50 shadow-glow-emerald overflow-hidden relative">
            
            {/* Header stadium graphic */}
            <div className="p-5 border-b border-dashed border-emerald-700/60 relative bg-emerald-950/40 text-center">
              <div className="text-xs uppercase tracking-widest font-bold text-emerald-400 mb-1">
                cLub STADIUMS • تذكرة مباراة
              </div>
              <h3 className="text-xl font-black text-white font-display">
                {booking.court?.name || 'ملعب كرة القدم'}
              </h3>
              <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-black/60 border border-emerald-500/40 text-xs font-bold text-volt-400">
                {booking.court?.type === 'FIVE_A_SIDE' ? 'ملعب خماسي (5v5)' : 'ملعب سباعي (7v7)'}
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="p-5 space-y-4">
              
              {/* Date & Time Big Card */}
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-2xl border border-emerald-950">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">تاريخ المباراة</span>
                  <span className="text-sm font-black text-white">{booking.date}</span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block font-medium">وقت الانطلاق</span>
                  <span className="text-sm font-black text-volt-400">{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>

              {/* Captain & Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">كابتن الفريق:</span>
                  <span className="font-bold text-white text-sm">{booking.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">رقم الهاتف:</span>
                  <span className="font-bold text-white text-sm font-mono">{booking.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">العربون المدفوع:</span>
                  <span className="font-bold text-emerald-400 text-sm">{booking.depositAmount} ج.م</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">المتبقي بالملعب:</span>
                  <span className="font-bold text-amber-400 text-sm">{remainingAmount} ج.م</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-2.5 rounded-xl text-center text-xs font-bold border ${
                isConfirmed
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-500 text-amber-300'
              }`}>
                {isConfirmed ? '✓ تم تأكيد الحجز وجاهز للعب' : '⏳ الحجز قيد مراجعة الدفع من الإدارة'}
              </div>

              {/* Location & Instructions */}
              <div className="text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-xl border border-emerald-950 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>مجمع ملاعب cLub — يرجى التواجد قبل الموعد بـ 15 دقيقة والتسجيل عند مسؤول الملعب.</span>
              </div>

            </div>

            {/* Stub / Barcode Footer */}
            <div className="p-4 bg-black/80 border-t border-dashed border-emerald-700/60 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                BOOKING PASS CODE
              </span>
              <div className="text-2xl font-mono font-black text-volt-400 tracking-widest">
                {booking.bookingCode}
              </div>
              
              {/* Simulated barcode lines */}
              <div className="flex items-center justify-center gap-1 mt-2 opacity-60 h-6">
                {Array.from({ length: 36 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full"
                    style={{
                      width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '2px',
                      height: '100%',
                    }}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};