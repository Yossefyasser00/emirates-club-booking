import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, Users, DollarSign, ShieldAlert, Tag,
  MessageSquare, Settings as SettingsIcon, CheckCircle2, XCircle,
  Plus, Edit, Trash2, Lock, Unlock, Eye, RefreshCw, AlertCircle,
  ArrowRight, Filter, Search, Check, X, ShieldCheck, LogOut, Clock,
  BarChart3, Home, Bell, Menu
} from 'lucide-react';
import { Court, Booking, PromoCode, Complaint, Settings, AnalyticsSummary } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  onBackToHome: () => void;
  onRefreshCourts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome, onRefreshCourts }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'BOOKINGS' | 'COURTS' | 'PROMOS' | 'COMPLAINTS' | 'SETTINGS'>('OVERVIEW');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Timeline Date & State
  const todayStr = new Date().toISOString().split('T')[0];
  const [timelineDate, setTimelineDate] = useState<string>(todayStr);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  // Booking filters
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('ALL');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  // Modals for Admin
  const [courtModalOpen, setCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [courtForm, setCourtForm] = useState({
    name: '', type: 'FIVE_A_SIDE', pricePerHour: 250, peakPricePerHour: 300,
    description: '', image: '', features: '', isActive: true
  });

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '', discountPercent: 15, discountAmount: 0, minBookingHours: 1, maxUses: 100, isActive: true
  });

  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [replyComplaintId, setReplyComplaintId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Block Slot Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({ courtId: '', date: todayStr, startTime: '18:00', blockReason: 'صيانة الملعب' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [anData, courtsData, bkData, prData, cmpData, settsData] = await Promise.all([
        api.getAnalytics().catch(() => null),
        api.getCourts(true).catch(() => []),
        api.getAllBookings().catch(() => []),
        api.getPromos().catch(() => []),
        api.getAllComplaints().catch(() => []),
        api.getSettings().catch(() => null),
      ]);
      if (anData) setAnalytics(anData);
      if (courtsData) setCourts(courtsData);
      if (bkData) setBookings(Array.isArray(bkData) ? bkData : (bkData as any).bookings || []);
      if (prData) setPromos(prData);
      if (cmpData) setComplaints(cmpData);
      if (settsData) setSettings(settsData);
      loadTimeline(timelineDate);
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'حدث خطأ أثناء تحميل بعض البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async (date: string) => {
    try {
      const tl = await api.getTimeline(date);
      setTimelineData(Array.isArray(tl) ? tl : []);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await api.updateBookingStatus(id, status);
      showNotification('success', `تم تحديث حالة الحجز إلى ${status}`);
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل التحديث');
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.verifyPayment(paymentId, status);
      showNotification('success', status === 'VERIFIED' ? 'تم تأكيد الدفع وقبول الحجز' : 'تم رفض الإيصال');
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل معالجة الدفع');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الحجز نهائياً؟')) return;
    try {
      await api.deleteBooking(id);
      showNotification('success', 'تم حذف الحجز');
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل الحذف');
    }
  };

  const handleSaveCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourt) {
        await api.updateCourt(editingCourt.id, courtForm as any);
        showNotification('success', 'تم تعديل بيانات الملعب بنجاح');
      } else {
        await api.createCourt(courtForm as any);
        showNotification('success', 'تمت إضافة الملعب الجديد بنجاح');
      }
      setCourtModalOpen(false);
      setEditingCourt(null);
      loadAllData();
      onRefreshCourts();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل حفظ الملعب');
    }
  };

  const handleToggleCourt = async (id: string) => {
    try {
      await api.toggleCourt(id);
      showNotification('success', 'تم تغيير حالة الملعب');
      loadAllData();
      onRefreshCourts();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل تبديل الحالة');
    }
  };

  const handleDeleteCourt = async (id: string) => {
    if (!confirm('تحذير: سيتم حذف الملعب وسجلاته! متابعة؟')) return;
    try {
      await api.deleteCourt(id);
      showNotification('success', 'تم حذف الملعب');
      loadAllData();
      onRefreshCourts();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل الحذف');
    }
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.blockSlot(blockForm.courtId, blockForm.date, blockForm.startTime, blockForm.blockReason);
      showNotification('success', 'تم حظر الموعد بنجاح');
      setBlockModalOpen(false);
      loadTimeline(timelineDate);
    } catch (err: any) {
      showNotification('error', err.message || 'فشل حظر الموعد');
    }
  };

  const handleUnblockSlot = async (courtId: string, startTime: string) => {
    try {
      await api.unblockSlot(courtId, timelineDate, startTime);
      showNotification('success', 'تم فك حظر الموعد وإتاحته للحجز');
      loadTimeline(timelineDate);
    } catch (err: any) {
      showNotification('error', err.message || 'فشل فك الحظر');
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPromo(promoForm as any);
      showNotification('success', 'تم إنشاء كوبون الخصم');
      setPromoModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل إنشاء الكوبون');
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await api.deletePromo(id);
      showNotification('success', 'تم حذف الكوبون');
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل حذف الكوبون');
    }
  };

  const handleReplyComplaint = async (id: string) => {
    try {
      await api.updateComplaint(id, { status: 'RESOLVED', adminReply: replyText });
      showNotification('success', 'تم حفظ رد الإدارة');
      setReplyComplaintId(null);
      setReplyText('');
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل الرد');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      showNotification('success', 'تم حفظ الإعدادات بنجاح');
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'فشل حفظ الإعدادات');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('club_admin_token');
    onBackToHome();
  };
  const MENU_ITEMS = [
    { id: 'OVERVIEW', label: 'نظرة عامة والإحصائيات', icon: '📊', desc: 'مؤشرات الأداء والإيرادات' },
    { id: 'TIMELINE', label: 'جدول الملاعب اليومي', icon: '🗓️', desc: 'عرض المواعيد وحظر الساعات' },
    { id: 'BOOKINGS', label: 'إدارة الحجوزات', icon: '📋', desc: 'مراجعة وتأكيد الطلبات', badge: bookings.filter(b => b.status === 'PENDING').length },
    { id: 'COURTS', label: 'إدارة الملاعب', icon: '🏟️', desc: 'تعديل وإضافة ملاعب النادي' },
    { id: 'PROMOS', label: 'كوبونات الخصم', icon: '🏷️', desc: 'إنشاء عروض وخصومات' },
    { id: 'COMPLAINTS', label: 'صندوق الشكاوى', icon: '💬', desc: 'رسائل ومقترحات العملاء', badge: complaints.filter(c => c.status === 'NEW').length },
    { id: 'SETTINGS', label: 'إعدادات المنصة', icon: '⚙️', desc: 'طرق الدفع ومواعيد العمل' },
  ];

  const filteredBookings = bookings.filter(b => {
    if (bookingFilterStatus !== 'ALL' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (b.customerName || '').toLowerCase().includes(q) || (b.customerPhone || '').includes(q) || (b.bookingCode || '').toLowerCase().includes(q);
    }
    return true;
  });

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
    PENDING: 'bg-amber-950/80 text-amber-300 border-amber-700',
    CANCELLED: 'bg-rose-950/80 text-rose-400 border-rose-700',
    COMPLETED: 'bg-blue-950/80 text-blue-300 border-blue-700',
    REJECTED: 'bg-slate-800 text-slate-400 border-slate-600',
  };

  const statusLabels: Record<string, string> = {
    CONFIRMED: 'مؤكد ✓',
    PENDING: 'قيد المراجعة ⏳',
    CANCELLED: 'ملغي ❌',
    COMPLETED: 'مكتمل 🏁',
    REJECTED: 'مرفوض ✗',
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-sky-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-glow-volt bg-[#0a1532] p-0.5 border border-sky-500/40 shrink-0">
              <img src="/club-logo.jpg" alt="Emirates Club Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="text-base font-black text-white font-display">
                Emirates <span className="text-sky-400">Club</span>
              </div>
              <div className="text-[11px] text-sky-300/80 font-medium">لوحة تحكم الإدارة</div>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3.5 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">القائمة الرئيسية</div>
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id === 'TIMELINE') loadTimeline(timelineDate);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/20 via-blue-600/20 to-sky-500/10 text-sky-300 border border-sky-500/40 shadow-glow-volt'
                    : 'text-slate-300 hover:bg-[#0a1738] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Actions */}
      <div className="p-4 border-t border-sky-950/80 space-y-2">
        <button
          onClick={loadAllData}
          disabled={loading}
          className="w-full py-2.5 px-3 rounded-xl bg-[#0a1738] hover:bg-sky-900/40 text-sky-300 border border-sky-900/60 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>

        <button
          onClick={onBackToHome}
          className="w-full py-2.5 px-3 rounded-xl bg-[#070e24] hover:bg-sky-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>عرض موقع النادي</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#04091a] text-slate-100 flex flex-col lg:flex-row font-sans" dir="rtl">
      
      {/* Toast Notification */}
      {msg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl border transition-all ${
          msg.type === 'success'
            ? 'bg-sky-950 border-sky-400 text-sky-300 shadow-glow-volt'
            : 'bg-rose-950 border-rose-500 text-rose-300'
        }`}>
          {msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#050b1d] border-l border-sky-950/80 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {renderSidebarContent()}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#050b1d] border-l border-sky-950/80 flex-col shrink-0 shadow-2xl min-h-screen sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Header Bar with Mobile Hamburger */}
        <header className="sticky top-0 z-30 bg-[#060e22]/90 backdrop-blur-md border-b border-sky-950/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#0a1738] border border-sky-900/60 text-sky-300 hover:text-white flex items-center justify-center shadow-sm"
              title="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black text-white font-display">
                {MENU_ITEMS.find(m => m.id === activeTab)?.label}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {MENU_ITEMS.find(m => m.id === activeTab)?.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={loadAllData}
              className="lg:hidden p-2 rounded-xl bg-[#0a1738] text-sky-300 border border-sky-900/60"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="hidden sm:inline px-3 py-1 rounded-full bg-sky-950 border border-sky-800/60 text-sky-300 font-mono text-[11px]">
              Admin Session Active 🔒
            </span>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {loading && !analytics ? (
            <div className="space-y-4 py-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 bg-[#0a1532]/60 rounded-3xl animate-pulse border border-sky-950" />
                ))}
              </div>
              <div className="h-48 bg-[#0a1532]/40 rounded-3xl animate-pulse border border-sky-950" />
              <div className="h-48 bg-[#0a1532]/40 rounded-3xl animate-pulse border border-sky-950" />
            </div>
          ) : (
            <>
          {/* ============ OVERVIEW TAB ============ */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'إجمالي الحجوزات', value: analytics?.totalBookings ?? bookings.length, icon: '📋', color: 'sky' },
                  { label: 'حجوزات اليوم', value: analytics?.todayBookingsCount ?? 0, icon: '📅', color: 'sky' },
                  { label: 'بانتظار المراجعة', value: analytics?.pendingBookings ?? bookings.filter(b => b.status === 'PENDING').length, icon: '⏳', color: 'amber' },
                  { label: 'شكاوى جديدة', value: analytics?.activeComplaintsCount ?? complaints.filter(c => c.status === 'NEW').length, icon: '💬', color: 'sky' },
                ].map((kpi) => (
                  <div key={kpi.label} className="glass-card p-4 sm:p-5 rounded-3xl border-sky-950/70 bg-[#0a1532]/70 shadow-glow-card">
                    <div className="text-xl sm:text-2xl mb-1.5">{kpi.icon}</div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-display">{kpi.value}</div>
                    <div className="text-[11px] sm:text-xs text-slate-300 font-medium mt-1">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Revenue Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="glass-card p-5 rounded-3xl border-sky-900/40 bg-[#071330] shadow-glow-volt">
                  <div className="text-xs text-sky-300 font-bold mb-1">💰 إجمالي الإيرادات المتوقعة</div>
                  <div className="text-2xl sm:text-3xl font-black text-sky-400 font-display">{(analytics?.totalRevenue ?? 0).toLocaleString()} ج.م</div>
                </div>
                <div className="glass-card p-5 rounded-3xl border-sky-900/40 bg-[#071330] shadow-glow-volt">
                  <div className="text-xs text-sky-300 font-bold mb-1">🏧 عربون محصّل</div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-display">{(analytics?.totalDepositsCollected ?? 0).toLocaleString()} ج.م</div>
                </div>
                <div className="glass-card p-5 rounded-3xl border-amber-900/40 bg-[#161208] shadow-glow-gold">
                  <div className="text-xs text-amber-300 font-bold mb-1">🏟️ متبقي للدفع بالملعب</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">{(analytics?.totalRemainingAtField ?? 0).toLocaleString()} ج.م</div>
                </div>
              </div>

              {/* Courts Performance */}
              <div className="glass-card p-5 sm:p-6 rounded-3xl border-sky-950/70 bg-[#0a1532]/60">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span>📊</span> أداء وإيرادات ملاعب النادي
                </h3>
                <div className="space-y-4">
                  {(analytics?.courtsStats || courts.map(c => ({ id: c.id, name: c.name, revenue: 0, totalBookings: 0, isActive: c.isActive }))).map(c => (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-2 border-b border-sky-950 sm:border-0">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-white">{c.name}</span>
                          <span className="text-sky-300">{c.revenue.toLocaleString()} ج.م</span>
                        </div>
                        <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-sky-950">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"
                            style={{ width: `${Math.min(100, (c.totalBookings / (analytics?.totalBookings || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-300">
                        <span className="font-semibold">{c.totalBookings} حجز</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${c.isActive ? 'bg-sky-950 text-sky-300 border border-sky-700' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                          {c.isActive ? 'نشط' : 'مغلق'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today Bookings */}
              <div className="glass-card p-5 sm:p-6 rounded-3xl border-sky-950/70 bg-[#0a1532]/60">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span>📅</span> جدول حجوزات اليوم ({analytics?.todayBookingsCount || 0})
                </h3>
                {!analytics?.todayBookings || analytics.todayBookings.length === 0 ? (
                  <p className="text-xs sm:text-sm text-slate-400 text-center py-4">لا توجد حجوزات مسجلة لهذا اليوم حتى الآن.</p>
                ) : (
                  <div className="space-y-2.5">
                    {analytics.todayBookings.map(b => (
                      <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#070e24] border border-sky-950 text-xs gap-2">
                        <div>
                          <span className="font-bold text-white text-sm">{b.customerName}</span>
                          <span className="text-slate-500 mx-2 hidden sm:inline">|</span>
                          <span className="text-slate-300 block sm:inline">{b.court?.name}</span>
                          <span className="text-slate-500 mx-2 hidden sm:inline">|</span>
                          <span className="text-sky-300 font-mono font-bold block sm:inline">{b.startTime} - {b.endTime}</span>
                        </div>
                        <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[b.status] || 'text-slate-400'}`}>
                          {statusLabels[b.status] || b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ TIMELINE TAB ============ */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap bg-[#070e24] p-4 rounded-3xl border border-sky-950">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">التاريخ:</span>
                  <input
                    type="date"
                    value={timelineDate}
                    onChange={(e) => { setTimelineDate(e.target.value); loadTimeline(e.target.value); }}
                    className="bg-[#0a1532] border border-sky-900 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <button
                  onClick={() => setBlockModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950 border border-rose-700 text-rose-300 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-900 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> حظر موعد (Block Slot)
                </button>
              </div>

              {/* Court Timelines */}
              {timelineData.map(({ court, slots }) => (
                <div key={court.id} className="glass-card p-4 sm:p-5 rounded-3xl border-sky-950/70 bg-[#0a1532]/70 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-white text-sm sm:text-base">{court.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                      {court.type === 'PADEL' ? 'بادل تنس' : court.type === 'FIVE_A_SIDE' ? 'خماسي 5v5' : 'سباعي 7v7'}
                    </span>
                    {!court.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 font-bold">مغلق</span>}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {slots.map((slot: any) => {
                      const isBooked = ['CONFIRMED', 'PENDING', 'COMPLETED'].includes(slot.status);
                      const isBlocked = slot.status === 'BLOCKED';
                      return (
                        <div
                          key={slot.startTime}
                          className={`flex-shrink-0 w-16 p-2 rounded-2xl text-center text-[10px] border relative ${
                            isBlocked
                              ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                              : slot.status === 'CONFIRMED'
                              ? 'bg-sky-950/80 border-sky-500 text-sky-200 font-bold'
                              : slot.status === 'PENDING'
                              ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                              : 'bg-[#070e24]/80 border-sky-950 text-slate-400'
                          }`}
                        >
                          <span className="font-bold block">{slot.startTime}</span>
                          <span className="text-[9px] block mt-0.5">{isBlocked ? '🔒 محظور' : isBooked ? slot.booking?.customerName?.split(' ')[0] || 'حجز' : '✅ متاح'}</span>
                          {isBlocked && (
                            <button
                              onClick={() => handleUnblockSlot(court.id, slot.startTime)}
                              className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center hover:bg-rose-400"
                              title="فك الحظر"
                            >✕</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============ BOOKINGS TAB ============ */}
          {activeTab === 'BOOKINGS' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap bg-[#070e24] p-3.5 rounded-3xl border border-sky-950">
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الهاتف أو كود الحجز..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="flex-1 min-w-[180px] bg-[#0a1532] border border-sky-900 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="bg-[#0a1532] border border-sky-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">جميع الحالات</option>
                  <option value="PENDING">قيد المراجعة</option>
                  <option value="CONFIRMED">مؤكد</option>
                  <option value="CANCELLED">ملغي</option>
                  <option value="COMPLETED">مكتمل</option>
                </select>
                <span className="text-xs text-sky-300 font-bold">{filteredBookings.length} حجز</span>
              </div>

              <div className="space-y-3">
                {filteredBookings.map(b => (
                  <div key={b.id} className="p-4 rounded-3xl bg-[#0a1532]/70 border border-sky-950 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-sky-400 font-mono">{b.bookingCode}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[b.status] || ''}`}>
                            {statusLabels[b.status] || b.status}
                          </span>
                          {b.isRecurring && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">دوري 🔁</span>}
                        </div>
                        <div className="text-xs text-slate-200 mt-1 font-semibold">
                          <span>{b.customerName}</span> · <span className="font-mono text-sky-300">{b.customerPhone}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {b.court?.name} | {b.date} | {b.startTime} - {b.endTime} ({b.durationHours}h)
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="text-sm sm:text-base font-black text-white">{b.totalAmount} ج.م</div>
                        <div className="text-[11px] text-sky-400 font-bold">عربون: {b.depositAmount} ج.م</div>
                      </div>
                    </div>

                    {/* Receipt image trigger */}
                    {b.payment && b.payment.receiptImage && (
                      <button
                        onClick={() => setReceiptPreviewUrl(b.payment?.receiptImage || null)}
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> عرض إيصال الدفع المرفوع
                      </button>
                    )}

                    {/* Admin Actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-sky-950/80">
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-colors shadow-glow-volt"
                          >
                            ✓ قبول الحجز
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs"
                          >
                            ✗ رفض
                          </button>
                          {b.payment && b.payment.id && b.payment.status === 'PENDING_VERIFICATION' && (
                            <>
                              <button
                                onClick={() => handleVerifyPayment(b.payment!.id, 'VERIFIED')}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                              >
                                ✓ اعتماد الإيصال
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(b.payment!.id, 'REJECTED')}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                              >
                                رفض الإيصال
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-300 font-bold text-xs hover:bg-blue-900"
                        >
                          🏁 تحديد كمكتمل
                        </button>
                      )}
                      {!['CANCELLED', 'COMPLETED', 'REJECTED'].includes(b.status) && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs"
                        >
                          إلغاء
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#070e24] hover:bg-rose-950 border border-slate-800 text-slate-400 hover:text-rose-300 font-bold text-xs"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ============ COURTS TAB ============ */}
          {activeTab === 'COURTS' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEditingCourt(null);
                  setCourtForm({ name: '', type: 'FIVE_A_SIDE', pricePerHour: 250, peakPricePerHour: 300, description: '', image: '', features: '', isActive: true });
                  setCourtModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-glow-volt hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> إضافة ملعب جديد
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courts.map(court => (
                  <div key={court.id} className="p-5 rounded-3xl bg-[#0a1532]/70 border border-sky-950 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-base">{court.name}</div>
                        <div className="text-xs text-sky-300 mt-0.5">
                          {court.type === 'PADEL' ? 'بادل تنس' : court.type === 'FIVE_A_SIDE' ? 'خماسي 5v5' : 'سباعي 7v7'} — {court.pricePerHour} ج.م / ذروة: {court.peakPricePerHour} ج.م
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${court.isActive ? 'bg-sky-950 text-sky-300 border-sky-700' : 'bg-rose-950 text-rose-400 border-rose-700'}`}>
                        {court.isActive ? 'نشط' : 'مغلق'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-sky-950">
                      <button
                        onClick={() => {
                          setEditingCourt(court);
                          setCourtForm({ name: court.name, type: court.type, pricePerHour: court.pricePerHour, peakPricePerHour: court.peakPricePerHour, description: court.description, image: court.image, features: court.features, isActive: court.isActive });
                          setCourtModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#070e24] hover:bg-sky-950 text-sky-300 font-bold text-xs flex items-center gap-1 border border-sky-900/60"
                      >
                        <Edit className="w-3.5 h-3.5" /> تعديل
                      </button>
                      <button
                        onClick={() => handleToggleCourt(court.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#070e24] hover:bg-amber-950 text-amber-300 font-bold text-xs flex items-center gap-1 border border-slate-800"
                      >
                        {court.isActive ? <><Lock className="w-3.5 h-3.5" /> تعطيل</> : <><Unlock className="w-3.5 h-3.5" /> تفعيل</>}
                      </button>
                      <button
                        onClick={() => handleDeleteCourt(court.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ PROMOS TAB ============ */}
          {activeTab === 'PROMOS' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setPromoForm({ code: '', discountPercent: 15, discountAmount: 0, minBookingHours: 1, maxUses: 100, isActive: true });
                  setPromoModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-glow-gold hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> إضافة كوبون خصم جديد
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promos.map(p => (
                  <div key={p.id} className="p-5 rounded-3xl bg-[#0a1532]/70 border border-amber-900/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 font-mono text-lg tracking-widest">{p.code}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${p.isActive ? 'bg-sky-950 text-sky-300 border-sky-700' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {p.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      {p.discountPercent > 0 ? `خصم ${p.discountPercent}%` : `خصم ثابت ${p.discountAmount} ج.م`} · 
                      <span className="text-slate-400 ms-1 font-mono">مستخدم: {p.usedCount}/{p.maxUses}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-sky-950">
                      <button
                        onClick={() => handleDeletePromo(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1 hover:bg-rose-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> حذف الكوبون
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ COMPLAINTS TAB ============ */}
          {activeTab === 'COMPLAINTS' && (
            <div className="space-y-4">
              {complaints.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-400 bg-[#0a1532]/40 rounded-3xl border border-sky-950">
                  لا توجد شكاوى أو مقترحات جديدة حتى الآن. 🎉
                </div>
              ) : (
                complaints.map(c => (
                  <div key={c.id} className="p-5 rounded-3xl bg-[#0a1532]/70 border border-sky-950 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">{c.ticketNumber}</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${c.status === 'NEW' ? 'bg-sky-950 text-sky-300 border-sky-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'}`}>
                            {c.status === 'NEW' ? 'جديد 🔵' : 'تم الرد ✅'}
                          </span>
                        </div>
                        <div className="font-bold text-white text-base mt-1">{c.subject}</div>
                        <div className="text-xs text-slate-300 mt-0.5">{c.customerName} · {c.customerPhone}</div>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="text-xs text-slate-200 bg-[#070e24] p-3 rounded-2xl border border-sky-950 leading-relaxed">{c.message}</div>
                    {c.adminReply && (
                      <div className="text-xs text-sky-300 bg-sky-950/40 p-3 rounded-2xl border border-sky-800">
                        <span className="font-bold">رد الإدارة: </span>{c.adminReply}
                      </div>
                    )}
                    {replyComplaintId === c.id ? (
                      <div className="space-y-2 pt-2">
                        <textarea rows={2} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="اكتب ردك على الشكوى هنا..." className="w-full bg-[#070e24] border border-sky-950 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-sky-400" />
                        <div className="flex gap-2">
                          <button onClick={() => handleReplyComplaint(c.id)} className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs">إرسال الرد وإغلاق</button>
                          <button onClick={() => setReplyComplaintId(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setReplyComplaintId(c.id); setReplyText(c.adminReply || ''); }} className="px-3.5 py-1.5 rounded-xl bg-[#070e24] border border-sky-800 text-sky-300 text-xs font-bold hover:bg-sky-950">
                        {c.adminReply ? '✏️ تعديل الرد' : '💬 الرد على الشكوى'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ============ SETTINGS TAB ============ */}
          {activeTab === 'SETTINGS' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              <div className="glass-card p-5 sm:p-6 rounded-3xl border-sky-950/70 bg-[#0a1532]/70 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">🏟️ بيانات النادي والإعلان</h3>
                <div>
                  <label className="text-xs text-slate-300 mb-1.5 block font-semibold">اسم النادي / المجمع</label>
                  <input type="text" value={settings?.clubName || 'Emirates Club'} onChange={(e) => setSettings(s => s ? { ...s, clubName: e.target.value } : s)} className="w-full bg-[#070e24] border border-sky-950 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1.5 block font-semibold">إعلان شريط الهيدر (اختياري)</label>
                  <input type="text" value={settings?.announcement || ''} onChange={(e) => setSettings(s => s ? { ...s, announcement: e.target.value } : s)} className="w-full bg-[#070e24] border border-sky-950 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400" />
                </div>
              </div>

              <div className="glass-card p-5 sm:p-6 rounded-3xl border-sky-950/70 bg-[#0a1532]/70 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">💳 طرق الدفع والعربون</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 mb-1.5 block font-semibold">رقم فودافون كاش</label>
                    <input type="text" value={settings?.vodafoneCashNumber || '01099887766'} onChange={(e) => setSettings(s => s ? { ...s, vodafoneCashNumber: e.target.value } : s)} className="w-full bg-[#070e24] border border-sky-950 rounded-2xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-400" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 mb-1.5 block font-semibold">معرّف InstaPay (IPA)</label>
                    <input type="text" value={settings?.instaPayHandle || 'emirates.club@instapay'} onChange={(e) => setSettings(s => s ? { ...s, instaPayHandle: e.target.value } : s)} className="w-full bg-[#070e24] border border-sky-950 rounded-2xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 mb-1.5 block font-semibold">قيمة العربون الثابت (ج.م)</label>
                    <input type="number" value={settings?.fixedDepositAmount || 100} onChange={(e) => setSettings(s => s ? { ...s, fixedDepositAmount: Number(e.target.value) } : s)} className="w-full bg-[#070e24] border border-sky-950 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 mb-1.5 block font-semibold">ساعات إلغاء الحجز المسموحة</label>
                    <input type="number" value={settings?.cancellationHoursLimit || 6} onChange={(e) => setSettings(s => s ? { ...s, cancellationHoursLimit: Number(e.target.value) } : s)} className="w-full bg-[#070e24] border border-sky-950 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 text-slate-950 font-black text-sm shadow-glow-volt hover:scale-105 transition-all"
              >
                💾 حفظ جميع الإعدادات
              </button>
            </form>
          )}

            </>
          )}

        </div>
      </main>

      {/* Modals: Court, Promo, Block, Receipt */}
      {receiptPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative max-w-lg w-full bg-[#070e24] rounded-3xl border border-sky-500/40 overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-sky-950">
              <span className="text-xs font-bold text-sky-300">صورة الإيصال المرفوعة</span>
              <button onClick={() => setReceiptPreviewUrl(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <img src={receiptPreviewUrl} alt="Receipt" className="w-full max-h-[65vh] object-contain p-2" />
          </div>
        </div>
      )}

      {/* Court Modal */}
      {courtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#070e24] border border-sky-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto text-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-950">
              <h3 className="text-sm font-bold text-white">{editingCourt ? 'تعديل بيانات الملعب' : 'إضافة ملعب جديد'}</h3>
              <button onClick={() => setCourtModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCourt} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-300 mb-1 block">اسم الملعب *</label><input type="text" required value={courtForm.name} onChange={(e) => setCourtForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
                <div><label className="text-xs text-slate-300 mb-1 block">نوع الملعب *</label><select value={courtForm.type} onChange={(e) => setCourtForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white"><option value="FIVE_A_SIDE">خماسي (5v5)</option><option value="SEVEN_A_SIDE">سباعي (7v7)</option><option value="PADEL">بادل تنس (Padel)</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-300 mb-1 block">سعر الساعة (عادي) *</label><input type="number" required value={courtForm.pricePerHour} onChange={(e) => setCourtForm(f => ({ ...f, pricePerHour: Number(e.target.value) }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
                <div><label className="text-xs text-slate-300 mb-1 block">سعر ساعة الذروة *</label><input type="number" required value={courtForm.peakPricePerHour} onChange={(e) => setCourtForm(f => ({ ...f, peakPricePerHour: Number(e.target.value) }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              </div>
              <div><label className="text-xs text-slate-300 mb-1 block">الوصف</label><textarea rows={2} value={courtForm.description} onChange={(e) => setCourtForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              <div><label className="text-xs text-slate-300 mb-1 block">رابط الصورة</label><input type="url" value={courtForm.image} onChange={(e) => setCourtForm(f => ({ ...f, image: e.target.value }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              <div><label className="text-xs text-slate-300 mb-1 block">المميزات</label><input type="text" placeholder="نجيل تركي, إضاءة ليلية..." value={courtForm.features} onChange={(e) => setCourtForm(f => ({ ...f, features: e.target.value }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="ca" checked={courtForm.isActive} onChange={(e) => setCourtForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded text-sky-500" /><label htmlFor="ca" className="text-xs text-slate-200 font-semibold">الملعب نشط ومتاح للحجز</label></div>
              <div className="flex gap-2 pt-3">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-slate-950 font-black text-xs shadow-glow-volt">حفظ الملعب</button>
                <button type="button" onClick={() => setCourtModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Slot Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#070e24] border border-rose-800/60 rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-950">
              <h3 className="text-sm font-bold text-white">🔒 حظر موعد محدد (Block Slot)</h3>
              <button onClick={() => setBlockModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleBlockSlot} className="space-y-3">
              <div><label className="text-xs text-slate-300 mb-1 block">الملعب</label><select value={blockForm.courtId} onChange={(e) => setBlockForm(f => ({ ...f, courtId: e.target.value }))} required className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white"><option value="">اختر ملعب...</option>{courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="text-xs text-slate-300 mb-1 block">التاريخ</label><input type="date" value={blockForm.date} onChange={(e) => setBlockForm(f => ({ ...f, date: e.target.value }))} required className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              <div><label className="text-xs text-slate-300 mb-1 block">وقت البداية</label><input type="time" value={blockForm.startTime} onChange={(e) => setBlockForm(f => ({ ...f, startTime: e.target.value }))} required className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              <div><label className="text-xs text-slate-300 mb-1 block">سبب الإغلاق</label><input type="text" value={blockForm.blockReason} onChange={(e) => setBlockForm(f => ({ ...f, blockReason: e.target.value }))} placeholder="صيانة، فعالية..." className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">تأكيد الحظر</button>
                <button type="button" onClick={() => setBlockModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#070e24] border border-amber-800/60 rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-950">
              <h3 className="text-sm font-bold text-white">🏷️ إنشاء كوبون خصم جديد</h3>
              <button onClick={() => setPromoModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSavePromo} className="space-y-3">
              <div><label className="text-xs text-slate-300 mb-1 block">كود الخصم *</label><input type="text" required placeholder="SUMMER25" value={promoForm.code} onChange={(e) => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-300 mb-1 block">نسبة خصم %</label><input type="number" min="0" max="100" value={promoForm.discountPercent} onChange={(e) => setPromoForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
                <div><label className="text-xs text-slate-300 mb-1 block">خصم ثابت ج.م</label><input type="number" min="0" value={promoForm.discountAmount} onChange={(e) => setPromoForm(f => ({ ...f, discountAmount: Number(e.target.value) }))} className="w-full bg-[#0a1532] border border-sky-950 rounded-xl px-3 py-2 text-xs text-white" /></div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" id="pa" checked={promoForm.isActive} onChange={(e) => setPromoForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded" /><label htmlFor="pa" className="text-xs text-slate-300">تفعيل الكوبون مباشرة</label></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs">حفظ الكوبون</button>
                <button type="button" onClick={() => setPromoModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};