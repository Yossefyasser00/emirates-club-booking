import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './index.css';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SportsCategoriesSection } from './components/SportsCategoriesSection';
import { BookingModal } from './components/BookingModal';
import { LookupModal } from './components/LookupModal';
import { ComplaintsModal } from './components/ComplaintsModal';
import { DigitalTicketPass } from './components/DigitalTicketPass';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { Court, Booking, Settings, CourtType } from './types';
import { api } from './services/api';

// ============ CUSTOMER SITE ============
const CustomerSite: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [complaintsModalOpen, setComplaintsModalOpen] = useState(false);
  const [ticketBooking, setTicketBooking] = useState<Booking | null>(null);
  const [selectedCourtForBooking, setSelectedCourtForBooking] = useState<Court | null>(null);
  const [courtFilter, setCourtFilter] = useState<'ALL' | CourtType>('ALL');
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCourts(true);
        const [c, s] = await Promise.all([api.getCourts(), api.getSettings()]);
        setCourts(c); setSettings(s);
      } catch (e) { console.error(e); }
      finally { setLoadingCourts(false); }
    };
    load();
  }, []);

  const handleStartBookingCourt = (court?: Court) => {
    setSelectedCourtForBooking(court || courts[0] || null);
    setBookingModalOpen(true);
  };

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#04091a] text-slate-100" dir="rtl">
      <Navbar
        settings={settings}
        onOpenLookup={() => setLookupModalOpen(true)}
        onOpenComplaints={() => setComplaintsModalOpen(true)}
        onOpenAdmin={() => window.location.href = '/management'}
        onScrollToCourts={scrollToCategories}
      />
      <main>
        {/* Clean Hero */}
        <HeroSection
          onScrollToCourts={() => handleStartBookingCourt()}
          selectedFilter={courtFilter}
          onSelectFilter={setCourtFilter}
        />

        {/* Clean Sports Categories (Football vs Padel) */}
        <div ref={categoriesRef}>
          <SportsCategoriesSection
            courts={courts}
            settings={settings}
            onOpenFootballModal={() => {
              const firstFootball = courts.find(c => c.type === 'FIVE_A_SIDE' || c.type === 'SEVEN_A_SIDE') || courts[0];
              handleStartBookingCourt(firstFootball);
            }}
            onBookCourt={handleStartBookingCourt}
          />
        </div>

        {/* How It Works */}
        <section className="bg-[#070e24]/70 border-y border-sky-950/60 py-12 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-8">⚡ احجز ملعبك في 4 خطوات سهلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { n:'1', icon:'🏟️', t:'اختر الرياضة والملعب', d:'كرة قدم خماسي/سباعي أو بادل تنس' },
                { n:'2', icon:'📅', t:'حدد اليوم والساعة', d:'شاهد المواعيد المتاحة والمحجوزة لحظياً' },
                { n:'3', icon:'📝', t:'ادخل بياناتك', d:'اسمك ورقمك فقط — بدون تسجيل حساب' },
                { n:'4', icon:'💳', t:'ادفع العربون', d:'فودافون كاش أو انستاباي واحصل على التذكرة' },
              ].map(s => (
                <div key={s.n} className="p-4 rounded-2xl bg-[#0a1532]/70 border border-sky-900/40 glass-card-hover">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow-glow-volt">{s.n}</div>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <h3 className="text-sm font-bold text-white mb-1">{s.t}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#030612] border-t border-sky-950/60 py-10 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="/club-logo.jpg" alt="Emirates Club" className="w-11 h-11 rounded-2xl object-cover shadow-glow-volt border border-sky-500/40" />
              <span className="text-xl font-black text-white font-display">Emirates <span className="text-sky-400">Club</span></span>
            </div>
            <p className="text-xs text-slate-400 mb-3">مجمع الملاعب الرياضية والنادي الاجتماعي المتكامل · SINCE 2018</p>
            {settings?.vodafoneCashNumber && (
              <p className="text-xs text-slate-300">📞 للحجز والاستفسار: <span className="font-mono font-bold text-sky-400">{settings.vodafoneCashNumber}</span></p>
            )}
            <p className="text-[10px] text-slate-600 mt-4">&copy; {new Date().getFullYear()} Emirates Club · جميع الحقوق محفوظة</p>
          </div>
        </footer>
      </main>

      {/* Main Direct Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => { setBookingModalOpen(false); setSelectedCourtForBooking(null); }}
        selectedCourt={selectedCourtForBooking}
        courts={courts}
        settings={settings}
        onBookingSuccess={() => {}}
        onViewTicket={(b) => setTicketBooking(b)}
      />

      {/* Lookup & Complaints Modals */}
      <LookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        onViewTicket={(b) => { setTicketBooking(b); setLookupModalOpen(false); }}
      />
      <ComplaintsModal
        isOpen={complaintsModalOpen}
        onClose={() => setComplaintsModalOpen(false)}
      />
      {ticketBooking && <DigitalTicketPass booking={ticketBooking} onClose={() => setTicketBooking(null)} />}
    </div>
  );
};

// ============ ADMIN GUARD (protected route) ============
const ProtectedAdminRoute: React.FC = () => {
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('club_admin_token');
      if (!token) { setAuthState('unauthenticated'); return; }
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setAuthState(data.valid ? 'authenticated' : 'unauthenticated');
        if (!data.valid) localStorage.removeItem('club_admin_token');
      } catch {
        setAuthState('unauthenticated');
        localStorage.removeItem('club_admin_token');
      }
    };
    verifyToken();
  }, [location]);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-[#04091a] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-sm">جارٍ التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <AdminLoginPage onLoginSuccess={() => setAuthState('authenticated')} />;
  }

  return <AdminDashboard onBackToHome={() => navigate('/')} onRefreshCourts={() => {}} />;
};

// ============ MAIN APP ============
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerSite />} />
        <Route path="/management" element={<ProtectedAdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;