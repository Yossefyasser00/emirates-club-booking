import React from 'react';
import { Court, Settings } from '../types';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

interface SportsCategoriesSectionProps {
  courts: Court[];
  settings?: Settings | null;
  onOpenFootballModal: () => void;
  onBookCourt: (court: Court) => void;
}

export const SportsCategoriesSection: React.FC<SportsCategoriesSectionProps> = ({
  courts,
  settings,
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
    image: '/padel-blue.jpg',
    features: 'زجاج بانورامي كامل, أرضية Mondo إيطالية, مضارب وكرات مجاناً, إضاءة ليلية LED, كافيه ومشروبات VIP',
    isActive: true,
  } as Court;

  const footballCourts = courts.filter(c => c.type === 'FIVE_A_SIDE' || c.type === 'SEVEN_A_SIDE');
  const footballCount = footballCourts.length || 4;
  const lowestFootballPrice = footballCourts.length > 0
    ? Math.min(...footballCourts.map(c => c.pricePerHour))
    : 230;

  const footballTitle = settings?.footballCategoryTitle || 'ملاعب كرة القدم (خماسي وسباعي)';
  const footballDesc = settings?.footballCategoryDesc || '4 ملاعب متطورة (سانتياغو، ويمبلي، كامب نو، الأنفيلد) مجهزة بنجيل تركي معتمد FIFA، إضاءة ليلية LED، غرف تبديل وتكييف.';
  const footballImg = settings?.footballCategoryImage || '/football-pitch.jpg';

  const padelTitle = settings?.padelCategoryTitle || 'ملعب بادل تنس بانوراما (Padel Court)';
  const padelDesc = settings?.padelCategoryDesc || 'ملعب بادل زجاجي بانورامي كامل بمواصفات إيطالية عالمية، مع أرضيات Mondo معتمدة، مضارب وكرات مجانية وكافيه ومشروبات VIP.';
  const padelImg = settings?.padelCategoryImage || '/padel-blue.jpg';

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
        <div className="glass-card rounded-3xl overflow-hidden glass-card-hover border-sky-900/60 bg-[#070e24]/80 flex flex-col group shadow-xl">
          {/* Image & Badges */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
            <img
              src={footballImg}
              alt="ملاعب كرة القدم"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/football-pitch.jpg';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070e24] via-[#070e24]/30 to-transparent" />

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
                  <span className="text-3xl font-black text-sky-300 font-display">{lowestFootballPrice}</span>
                  <span className="text-xs text-slate-300 font-bold">ج.م / ساعة</span>
                </div>
              </div>
              <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-500/40 text-left">
                <span className="text-[10px] text-sky-400 block font-bold">ملاعب معتمدة</span>
                <span className="text-xs font-bold text-slate-200">خماسي 5v5 وسباعي 7v7</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                {footballTitle}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {footballDesc}
              </p>

              {/* Features list */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['نجيل صناعي معتمد FIFA', 'خماسي 5v5 وسباعي 7v7', 'كرات وفستات مجاناً', 'إضاءة ليلية LED'].map((f, i) => (
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
        <div className="glass-card rounded-3xl overflow-hidden glass-card-hover border-sky-900/60 bg-[#070e24]/80 flex flex-col group shadow-xl">
          {/* Image & Badges */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
            <img
              src={padelImg}
              alt="ملعب بادل تنس"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/padel-blue.jpg';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070e24] via-[#070e24]/30 to-transparent" />

            {/* Category Tag */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-sky-400/40 text-xs font-bold text-white shadow-md">
              <span className="text-base">🎾</span>
              <span>ملعب بادل تنس بانوراما</span>
              <span className="bg-sky-400 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black">VIP</span>
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium block">سعر حجز الساعة</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-sky-300 font-display">{padelCourt.pricePerHour || 300}</span>
                  <span className="text-xs text-slate-300 font-bold">ج.م / ساعة</span>
                </div>
              </div>
              <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-500/40 text-left">
                <span className="text-[10px] text-sky-300 block font-bold">ملعب بانوراما VIP</span>
                <span className="text-xs font-bold text-slate-200">شامل المضارب والكرات</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                {padelTitle}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {padelDesc}
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