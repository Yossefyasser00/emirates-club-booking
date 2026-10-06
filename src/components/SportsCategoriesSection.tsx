import React from 'react';
import { Court } from '../types';
import { Users, Flame, Zap, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface SportsCategoriesSectionProps {
  courts: Court[];
  onOpenFootballModal: () => void;
  onBookCourt: (court: Court) => void;
}

export const SportsCategoriesSection: React.FC<SportsCategoriesSectionProps> = ({
  courts,
  onOpenFootballModal,
  onBookCourt,
}) => {
  const padelCourt = courts.find(c => c.type === 'PADEL') || {
    id: 'padel-default',
    name: 'ملعب البادل بانوراما (Padel VIP)',
    type: 'PADEL',
    pricePerHour: 300,
    peakPricePerHour: 350,
    description: 'ملعب بادل تنس زجاجي بانورامي فخم مجهز بأحدث أرضيات Mondo الإيطالية، مضارب وكرات مجانية، وإضاءة ليلية متطورة.',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
    features: 'زجاج بانورامي كامل, أرضية Mondo إيطالية, مضارب وكرات مجاناً, إضاءة ليلية LED, كافيه ومشروبات VIP',
    isActive: true,
  } as Court;

  const footballCount = courts.filter(c => c.type === 'FIVE_A_SIDE' || c.type === 'SEVEN_A_SIDE').length || 4;

  return (
    <section id="categories-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" dir="rtl">
      
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>اختر نوع الرياضة والملعب المطلوب</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
          ملاعب نادي <span className="text-sky-400">الإمارات</span> الرياضي
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
          اختر رياضتك المفضلة لاستعراض الملاعب المتاحة والحجز الفوري في ثوانٍ.
        </p>
      </div>

      {/* Two Main Category Cards (Football vs Padel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ============ 1. FOOTBALL CATEGORY CARD ============ */}
        <div className="glass-card rounded-3xl overflow-hidden glass-card-hover border-sky-900/60 bg-[#070e24]/80 flex flex-col group">
          {/* Image & Badges */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1529900245534-47fbf82a60e1?auto=format&fit=crop&w=1200&q=80"
              alt="ملاعب كرة القدم"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070e24] via-[#070e24]/40 to-transparent" />

            {/* Category Tag */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-sky-400/40 text-xs font-bold text-white shadow-md">
              <span className="text-base">⚽</span>
              <span>ملاعب كرة القدم</span>
              <span className="bg-sky-500 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black">{footballCount} ملاعب</span>
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium block">الأسعار تبدأ من</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-sky-300 font-display">230</span>
                  <span className="text-xs text-slate-300 font-bold">ج.م / ساعة</span>
                </div>
              </div>
              <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-500/40 text-left">
                <span className="text-[10px] text-amber-400 block font-bold">خماسي وسباعي</span>
                <span className="text-xs font-bold text-slate-200">2 خماسي + 2 سباعي</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                ملاعب كرة القدم (خماسي وسباعي)
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                4 ملاعب متطورة (سانتياغو، ويمبلي، كامب نو، الأنفيلد) مجهزة بنجيل تركي معتمد FIFA، إضاءة ليلية LED، غرف تبديل وتكييف.
              </p>

              {/* Features list */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['نجيل صناعي معتمد', 'خماسي 5v5 وسباعي 7v7', 'كرات وفستات مجاناً', 'إضاءة ليلية متطورة'].map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/80 text-xs font-medium text-sky-200 border border-sky-800/50">
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={() => {
                const firstFootball = courts.find(c => c.type === 'FIVE_A_SIDE' || c.type === 'SEVEN_A_SIDE') || courts[0];
                onBookCourt(firstFootball);
              }}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 hover:from-sky-300 hover:to-blue-400 text-slate-950 shadow-glow-volt hover:scale-[1.02]"
            >
              <span>احجز ملاعب كرة القدم الآن</span>
              <ArrowLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ============ 2. PADEL CATEGORY CARD ============ */}
        <div className="glass-card rounded-3xl overflow-hidden glass-card-hover border-sky-900/60 bg-[#070e24]/80 flex flex-col group">
          {/* Image & Badges */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80"
              alt="ملعب بادل تنس"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070e24] via-[#070e24]/40 to-transparent" />

            {/* Category Tag */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-sky-400/40 text-xs font-bold text-white shadow-md">
              <span className="text-base">🎾</span>
              <span>ملعب بادل تنس</span>
              <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black">VIP</span>
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium block">سعر الساعة العادي</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-sky-300 font-display">300</span>
                  <span className="text-xs text-slate-300 font-bold">ج.م / ساعة</span>
                </div>
              </div>
              <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-500/40 text-left">
                <span className="text-[10px] text-amber-400 block font-bold">وقت الذروة</span>
                <span className="text-xs font-bold text-amber-300">350 ج.م / ساعة</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                ملعب بادل تنس بانوراما (Padel Court)
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                ملعب بادل زجاجي بانورامي كامل بمواصفات إيطالية عالمية، مع أرضيات Mondo معتمدة، مضارب وكرات مجانية وكافيه ومشروبات VIP.
              </p>

              {/* Features list */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['زجاج بانورامي كامل', 'أرضيات Mondo إيطالية', 'مضارب وكرات مجاناً', 'كافيه ومشروبات VIP'].map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/80 text-xs font-medium text-sky-200 border border-sky-800/50">
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={() => onBookCourt(padelCourt)}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 hover:from-sky-300 hover:to-blue-400 text-slate-950 shadow-glow-volt hover:scale-[1.02]"
            >
              <span>احجز ملعب البادل الآن</span>
              <ArrowLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};