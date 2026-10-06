import React from 'react';
import { Users, Flame, Check, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Court } from '../types';

interface CourtCardProps {
  court: Court;
  onBookNow: (court: Court) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({ court, onBookNow }) => {
  const isFive = court.type === 'FIVE_A_SIDE';
  const featuresList = court.features ? court.features.split(',').map((f) => f.trim()) : [];

  return (
    <div className="glass-card rounded-3xl overflow-hidden glass-card-hover border-sky-950/70 flex flex-col group bg-[#070e24]/80">
      {/* Court Image Banner with overlays */}
      <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={court.image}
          alt={court.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070e24] via-[#070e24]/40 to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-sky-500/30 text-xs font-bold text-white shadow-md">
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>{isFive ? 'ملعب خماسي (5v5)' : 'ملعب سباعي (7v7)'}</span>
        </div>

        {/* Maintenance / Inactive Badge */}
        {!court.isActive && (
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/80 backdrop-blur-md border border-rose-600/50 text-xs font-bold text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>مغلق للصيانة</span>
          </div>
        )}

        {/* Hourly Price Tag */}
        <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between">
          <div>
            <span className="text-xs text-slate-300 font-semibold block">سعر الساعة العادي</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-sky-300 font-display">{court.pricePerHour}</span>
              <span className="text-xs text-slate-300 font-bold">ج.م / ساعة</span>
            </div>
          </div>

          <div className="text-left bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-amber-500/40">
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>وقت الذروة</span>
            </div>
            <span className="text-sm font-bold text-amber-300">{court.peakPricePerHour} ج.م</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
            {court.name}
          </h3>
          <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {court.description}
          </p>

          {/* Features Pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {featuresList.slice(0, 4).map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/80 text-[11px] font-medium text-sky-200 border border-sky-800/50"
              >
                <Check className="w-3 h-3 text-sky-400" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={() => onBookNow(court)}
          disabled={!court.isActive}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            court.isActive
              ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 hover:from-sky-300 hover:to-blue-400 text-slate-950 shadow-glow-volt hover:scale-[1.02]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>{court.isActive ? 'اختيار الموعد والحجز' : 'الملعب غير متاح حالياً'}</span>
          {court.isActive && <ArrowLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};