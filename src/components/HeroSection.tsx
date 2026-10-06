import React from 'react';
import { CourtType } from '../types';
import { Calendar, ShieldCheck, Zap, ArrowLeft, PhoneCall } from 'lucide-react';

interface HeroSectionProps {
  onScrollToCourts: () => void;
  selectedFilter: 'ALL' | CourtType;
  onSelectFilter: (f: 'ALL' | CourtType) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToCourts }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-[#04091a] text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* RIGHT SIDE: Text & CTAs (as in the reference image, but in modern Blue) */}
        <div className="lg:col-span-7 text-right space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>نادي الإمارات الرياضي · Emirates Club</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight font-display tracking-tight">
            احجز ملعبك <span className="text-sky-400">بسهولة</span>،
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-l from-sky-400 via-blue-400 to-sky-200">
              وابدأ المباراة بدون انتظار
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            حدد اليوم والوقت المناسب لك، وتأكد من المواعيد المتاحة لحظياً، واحجز الآن مع دفع العربون بسهولة عبر فودافون كاش أو انستاباي بخطوات واضحة وسريعة.
          </p>

          {/* Features Bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">✓</div>
              <span>ملاعب نجيل تركي دولي معتمد</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">✓</div>
              <span>حجز فوري بدون تسجيل حساب</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">✓</div>
              <span>إضاءة ليلية LED فائقة الوضوح</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">✓</div>
              <span>تأكيد فوري وتذكرة رقمية للحجز</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 flex-wrap">
            <button
              onClick={onScrollToCourts}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base shadow-glow-volt hover:scale-105 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5 text-slate-950" />
              <span>احجز الآن</span>
              <ArrowLeft className="w-4 h-4 text-slate-950 mr-1" />
            </button>

            <button
              onClick={onScrollToCourts}
              className="px-6 py-4 rounded-2xl bg-[#0a1738] border border-sky-500/40 text-sky-200 hover:text-white hover:border-sky-400 text-sm sm:text-base font-bold transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>عرض المواعيد المتاحة</span>
            </button>
          </div>

        </div>

        {/* LEFT SIDE: Clean Logo Showcase (Replacing mobile mockup) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative group">
            
            {/* Glowing Backdrop Ring */}
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/30 via-blue-600/20 to-sky-400/30 rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-80" />

            {/* Logo Card Showcase */}
            <div className="relative w-72 sm:w-84 md:w-96 rounded-3xl bg-gradient-to-b from-[#0a1738] to-[#060e24] p-8 border border-sky-400/30 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
              
              {/* Official Shield Logo Image */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl p-2 bg-[#050b1d] border border-sky-500/40 shadow-glow-volt flex items-center justify-center mb-6">
                <img
                  src="/club-logo.jpg"
                  alt="Emirates Club Logo"
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>

              {/* Club Identity */}
              <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                نادي <span className="text-sky-400">الإمارات</span> الرياضي
              </h3>
              <p className="text-xs text-sky-300/80 mt-1 font-medium tracking-wide">
                EMIRATES CLUB · SINCE 2018
              </p>

              {/* Status Badge */}
              <div className="mt-4 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/40 flex items-center gap-2 text-xs text-sky-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>الملاعب جاهزة ومفتوحة للحجز اليوم</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};