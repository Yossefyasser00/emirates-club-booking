import React, { useState, useEffect } from 'react';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
      localStorage.setItem('club_admin_token', data.token);
      onLoginSuccess(data.token);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ - تحقق من كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04091a] flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #0284c7 1px, transparent 1px),
            linear-gradient(to bottom, #0284c7 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Corner decoration */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <img src="/club-logo.jpg" alt="Emirates Club" className="w-10 h-10 rounded-xl object-contain shadow-lg bg-[#0a1532] p-0.5 border border-sky-500/30" />
        <div>
          <div className="text-xs font-black text-white font-display">Emirates <span className="text-sky-400">Club</span></div>
          <div className="text-[10px] text-slate-400">Management Portal</div>
        </div>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Shield decoration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-700/20 border border-sky-400/40 flex items-center justify-center shadow-glow-volt backdrop-blur-sm p-2">
              <img src="/club-logo.jpg" alt="logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sky-500 border-2 border-[#04091a] flex items-center justify-center">
              <span className="text-[8px]">🔐</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white font-display mb-1">
            بوابة <span className="text-sky-400">الإدارة</span>
          </h1>
          <p className="text-xs text-slate-300">
            هذه المنطقة محمية — الدخول للمدراء فقط
          </p>
          <div className="mt-2 text-[10px] text-sky-400 font-mono">
            {'/management' + '.'.repeat(dots)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card p-6 rounded-3xl border-sky-900/40 space-y-4 bg-[#0a1532]/85">
            <div>
              <label className="text-xs font-bold text-slate-200 mb-2 block flex items-center gap-1.5">
                <span>🔑</span> كلمة مرور المدير
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="أدخل كلمة المرور..."
                  className="w-full bg-[#070e24] border border-sky-900 rounded-2xl px-4 py-3 text-sm text-white pr-10 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <span>❌</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 text-slate-950 font-black text-sm shadow-glow-volt hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  جارٍ التحقق...
                </>
              ) : (
                <>🚀 دخول لوحة التحكم</>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 space-y-2">
          <a href="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-sky-300 transition-colors">
            ← العودة للموقع الرئيسي
          </a>
          <div className="text-[10px] text-slate-500">
            🔒 اتصال محمي · JWT Authentication · Session 8h
          </div>
        </div>
      </div>
    </div>
  );
};