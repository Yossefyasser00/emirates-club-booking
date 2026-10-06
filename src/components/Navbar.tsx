import React from 'react';
import { Search, MessageSquare, Flame, PhoneCall, Calendar } from 'lucide-react';
import { Settings } from '../types';

interface NavbarProps {
  settings: Settings | null;
  onOpenLookup: () => void;
  onOpenComplaints: () => void;
  onOpenAdmin: () => void;
  onScrollToCourts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenLookup,
  onOpenComplaints,
  onOpenAdmin,
  onScrollToCourts,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement Bar */}
      {settings?.announcement && (
        <div className="bg-gradient-to-r from-blue-900 via-sky-800 to-blue-900 text-white text-xs md:text-sm py-1.5 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2 border-b border-sky-500/30">
          <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="glass-card border-b border-sky-950/70 bg-[#070e24]/90 backdrop-blur-md px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-glow-volt group-hover:scale-105 transition-transform border border-sky-400/40 bg-[#0a1532] p-0.5">
              <img src="/club-logo.jpg" alt="Emirates Club Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-wide text-white">
                  Emirates <span className="text-sky-400">Club</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 font-bold border border-sky-700/50">
                  SINCE 2018
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">مجمع الملاعب الرياضية والنادي الاجتماعي</p>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={onScrollToCourts}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-sky-300 hover:bg-sky-900/30 transition-all border border-transparent hover:border-sky-500/30"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>الملاعب والمواعيد</span>
            </button>

            <button
              onClick={onOpenLookup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-amber-300 hover:bg-amber-950/30 transition-all border border-transparent hover:border-amber-500/30"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>استعلام عن حجز</span>
            </button>

            <button
              onClick={onOpenComplaints}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-sky-300 hover:bg-sky-900/30 transition-all border border-transparent hover:border-sky-500/30"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>الشكاوى والمقترحات</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Contact Hotline */}
            <a
              href={`https://wa.me/2${settings?.vodafoneCashNumber || '01099887766'}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 hover:from-sky-300 hover:to-blue-400 text-slate-950 shadow-glow-volt hover:scale-105 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-black" />
              <span className="hidden xs:inline">واتساب النادي</span>
            </a>
          </div>

        </div>

        {/* Mobile Quick Bar */}
        <div className="flex md:hidden items-center justify-around pt-2.5 mt-2 border-t border-sky-950/60 text-xs">
          <button onClick={onScrollToCourts} className="flex items-center gap-1.5 text-slate-300 font-semibold py-1">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>الملاعب</span>
          </button>
          <button onClick={onOpenLookup} className="flex items-center gap-1.5 text-slate-300 font-semibold py-1">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>حجوزاتي</span>
          </button>
          <button onClick={onOpenComplaints} className="flex items-center gap-1.5 text-slate-300 font-semibold py-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>الشكاوى</span>
          </button>
        </div>
      </nav>
    </header>
  );
};