import React, { useState } from 'react';
import { DHIKR_ITEMS, DhikrItem } from '../data/islamicContent';
import { IslamicStar } from './IslamicMotifs';
import { playSoftBeadClick } from '../utils/audioBead';
import { RotateCcw, Volume2, VolumeX, BookOpen, ArrowLeft } from 'lucide-react';

interface DhikrSanctuaryProps {
  onOpenAdhkar: () => void;
}

export const DhikrSanctuary: React.FC<DhikrSanctuaryProps> = ({ onOpenAdhkar }) => {
  const [selectedDhikrId, setSelectedDhikrId] = useState<string>(DHIKR_ITEMS[0].id);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeDhikr: DhikrItem = DHIKR_ITEMS.find(d => d.id === selectedDhikrId) || DHIKR_ITEMS[0];
  const currentCount = counts[activeDhikr.id] || 0;

  // Gentle audio click synthesis using shared AudioContext singleton
  const playBeadClick = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    playSoftBeadClick(440);
  };

  const handleIncrement = () => {
    playBeadClick();
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    setCounts(prev => ({
      ...prev,
      [activeDhikr.id]: (prev[activeDhikr.id] || 0) + 1
    }));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCounts(prev => ({
      ...prev,
      [activeDhikr.id]: 0
    }));
  };

  const progressPercentage = Math.min(100, Math.round((currentCount / activeDhikr.targetCount) * 100));

  return (
    <section id="dhikr-sanctuary" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c6b2d] dark:text-[#c5a059] font-['Cinzel',serif] mb-2">
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
          <span>REMEMBRANCE SANCTUARY</span>
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
        </div>
        
        {/* Requested Section Title */}
        <h2 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
          ألا بذكر الله تطمئن القلوب
        </h2>
        
        <p className="mt-3 text-base sm:text-lg text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
          خلوة مع النفس ومسبحة إلكترونية فخمة تعينك على ذكر الله في كل آن
        </p>
      </div>

      {/* Main Sanctuary Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-[#c5a059]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#064e3b]/20 blur-3xl pointer-events-none" />

        {/* Dhikr Selector (Segmented controls with click handlers) */}
        <div className="mb-10">
          <div className="text-xs text-[#c5a059] font-['Amiri',serif] mb-3 text-center">
            اختر الذكر المفضل:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {DHIKR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedDhikrId(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer ${
                  selectedDhikrId === item.id
                    ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-md shadow-[#c5a059]/20'
                    : 'bg-[#064e3b]/30 text-[#d4ccbf] border border-[#c5a059]/20 hover:border-[#dfbd69]/50 hover:bg-[#064e3b]/50'
                }`}
              >
                {item.text.length > 28 ? item.text.slice(0, 26) + '...' : item.text}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Luxury Misbaha Counter Centerpiece */}
        <div className="flex flex-col items-center justify-center my-6">
          {/* Active Dhikr Display */}
          <div className="text-center max-w-xl mx-auto mb-8 min-h-[90px] flex flex-col justify-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-relaxed">
              « {activeDhikr.text} »
            </p>
            <p className="text-xs sm:text-sm text-[#dfbd69]/80 font-['Amiri',serif] mt-2 italic">
              {activeDhikr.merit}
            </p>
          </div>

          {/* Luxury Circular Interactive Bead Ring */}
          <button
            type="button"
            className="relative group cursor-pointer my-2 rounded-full"
            onClick={handleIncrement}
            aria-label={`تسبيح ${activeDhikr.text}، العدد الحالي ${currentCount}`}
          >
            {/* Outer Decorative Ring with Progress */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-[#c5a059]/25 flex items-center justify-center p-3 relative transition-transform duration-200 active:scale-95 group-hover:border-[#dfbd69]/60">
              
              {/* Progress Ring Indicator (SVG) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  className="stroke-[#064e3b]/40"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  className="stroke-[#dfbd69] transition-all duration-300"
                  strokeWidth="4"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * progressPercentage) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Inner Circle Touch Surface */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#064e3b]/80 via-[#032018] to-[#021812] border border-[#c5a059]/40 flex flex-col items-center justify-center shadow-inner group-hover:bg-[#064e3b]/90 transition-all select-none">
                <span className="text-[11px] uppercase tracking-widest text-[#c5a059]/80 font-['Cinzel',serif]">
                  COUNT
                </span>
                <span className="text-5xl sm:text-6xl font-bold font-mono text-[#fbf9f5] my-1 tabular-nums">
                  {currentCount}
                </span>
                <span className="text-xs text-[#dfbd69] font-['Amiri',serif]">
                  الهدف: {activeDhikr.targetCount}
                </span>
                <span className="text-[10px] text-[#b8ad9c]/70 mt-1 font-['Amiri',serif]">
                  انقر للتسبيح
                </span>
              </div>
            </div>
          </button>

          {/* Controls Bar: Sound Toggle & Reset */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c5a059]/20 text-xs text-[#d1c7b7] hover:text-[#dfbd69] hover:border-[#dfbd69]/50 transition-colors cursor-pointer"
              title="تصفير العداد الحالي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="font-['Amiri',serif]">إعادة ضبط</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c5a059]/20 text-xs text-[#d1c7b7] hover:text-[#dfbd69] hover:border-[#dfbd69]/50 transition-colors cursor-pointer"
              title="صوت نقرة التسبيح الهادئة"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#dfbd69]" />
                  <span className="font-['Amiri',serif]">صوت التسبيح: مفعل</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-['Amiri',serif]">صوت التسبيح: صامت</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Action: Button to open full Adhkar section */}
        <div className="pt-8 mt-6 border-t border-[#c5a059]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <div className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
              هل ترغب في قراءة أذكار الصباح والمساء وحصن المسلم؟
            </div>
            <div className="text-xs text-[#b8ad9c] font-['Amiri',serif]">
              مكتبة شاملة وموثقة للأذكار مع الشروح والفضائل
            </div>
          </div>

          <button
            onClick={onOpenAdhkar}
            className="px-6 py-3 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#c5a059]/10"
          >
            <BookOpen className="w-4 h-4" />
            <span>الانتقال إلى قسم الأذكار</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
