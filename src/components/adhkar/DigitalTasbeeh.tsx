import React, { useState, useEffect } from 'react';
import { IslamicStar, IslamicDivider } from '../IslamicMotifs';
import { playSoftBeadClick } from '../../utils/audioBead';
import { 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Vibrate, 
  Sliders, 
  AlertTriangle,
  Award,
  ChevronDown
} from 'lucide-react';

interface DhikrChoice {
  id: string;
  arabic: string;
  virtue?: string;
}

const VERIFIED_DHIKR_OPTIONS: DhikrChoice[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', virtue: 'تنزيه لله تعالى عن كل نقص' },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', virtue: 'شكر لله على سابغ نعمه وهي تملأ الميزان' },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', virtue: 'تعظيم لجلال الله وكبريائه' },
  { id: 'lailahaillallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', virtue: 'أفضل الذكر وكلمة الإخلاص' },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', virtue: 'موجب لمغفرة الذنوب وتفريج الكروب' },
  { id: 'lahawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', virtue: 'كنز من كنوز الجنة' },
  { id: 'subhanallah_bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ', virtue: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان' },
  { id: 'salawat', arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', virtue: 'من صلى عليّ صلاة صلى الله عليه بها عشراً' }
];

export const DigitalTasbeeh: React.FC = () => {
  const [selectedDhikrId, setSelectedDhikrId] = useState<string>('subhanallah');
  const [targetMode, setTargetMode] = useState<number | 'free'>(33); // 33, 100, 1000, or 'free'
  
  // Local storage loaded counts
  const [sessionCount, setSessionCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakinah_tasbeeh_session');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });

  const [totalLifetimeCount, setTotalLifetimeCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakinah_tasbeeh_total');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Save counts in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sakinah_tasbeeh_session', String(sessionCount));
      localStorage.setItem('sakinah_tasbeeh_total', String(totalLifetimeCount));
    } catch {
      // Storage restriction
    }
  }, [sessionCount, totalLifetimeCount]);

  const activeDhikr = VERIFIED_DHIKR_OPTIONS.find(d => d.id === selectedDhikrId) || VERIFIED_DHIKR_OPTIONS[0];

  // Gentle wooden bead click using shared AudioContext singleton
  const playBeadClick = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    playSoftBeadClick(480);
  };

  useEffect(() => {
    if (!showResetConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowResetConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showResetConfirm]);

  const handleIncrement = () => {
    playBeadClick();
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(25);
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 120);

    const nextCount = sessionCount + 1;
    setSessionCount(nextCount);
    setTotalLifetimeCount(prev => prev + 1);

    // If target reached
    if (targetMode !== 'free' && nextCount === targetMode) {
      if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
    }
  };

  const handleResetRequest = () => {
    if (sessionCount > 10) {
      setShowResetConfirm(true);
    } else {
      setSessionCount(0);
    }
  };

  const handleConfirmReset = () => {
    setSessionCount(0);
    setShowResetConfirm(false);
  };

  const progressPercent = targetMode === 'free' ? 100 : Math.min(100, Math.round((sessionCount / targetMode) * 100));

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#032018]/80 text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#dfbd69] mb-3">
          <IslamicStar size={12} className="text-[#dfbd69]" />
          <span>DIGITAL TASBEEH SANCTUARY</span>
          <IslamicStar size={12} className="text-[#dfbd69]" />
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
          المسبحة الإلكترونية الرقمية
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#d1c7b7] font-['Amiri',serif]">
          مساحة وقورة تعينك على ذكر الله وتسبيحه في كل لحظة، بتصميم سهل الاستخدام باليد الواحدة
        </p>
      </div>

      {/* Main Tasbeeh Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-12 shadow-2xl overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-[#c5a059]/5 blur-3xl pointer-events-none" />

        {/* Dhikr Selector Ribbon */}
        <div className="mb-8">
          <label className="text-xs text-[#c5a059] font-['Amiri',serif] block mb-3 font-medium">
            اختر الصيغة المأثورة:
          </label>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {VERIFIED_DHIKR_OPTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedDhikrId(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer ${
                  selectedDhikrId === item.id
                    ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-md shadow-[#c5a059]/20'
                    : 'bg-[#064e3b]/30 text-[#d4ccbf] border border-[#c5a059]/20 hover:border-[#dfbd69]/40 hover:bg-[#064e3b]/50'
                }`}
              >
                {item.arabic}
              </button>
            ))}
          </div>
        </div>

        {/* Active Dhikr Display */}
        <div className="my-6 min-h-[90px] flex flex-col justify-center items-center">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-['Amiri_Quran',serif] text-[#fbf9f5] leading-relaxed">
            « {activeDhikr.arabic} »
          </h3>
          {activeDhikr.virtue && (
            <p className="text-xs sm:text-sm text-[#dfbd69]/85 font-['Amiri',serif] mt-2 italic max-w-lg">
              {activeDhikr.virtue}
            </p>
          )}
        </div>

        {/* Target Mode Segmented Controller */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="inline-flex items-center gap-1.5 p-1 bg-[#021812] rounded-2xl border border-[#c5a059]/20">
            <button
              onClick={() => setTargetMode(33)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                targetMode === 33 ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
              }`}
            >
              ٣٣ تسبيحة
            </button>
            <button
              onClick={() => setTargetMode(100)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                targetMode === 100 ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
              }`}
            >
              ١٠٠ تسبيحة
            </button>
            <button
              onClick={() => setTargetMode(1000)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                targetMode === 1000 ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
              }`}
            >
              ١٠٠٠ تسبيحة
            </button>
            <button
              onClick={() => setTargetMode('free')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                targetMode === 'free' ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
              }`}
            >
              عدّ حر (بدون هدف)
            </button>
          </div>

          <span className="text-[11px] text-[#a89e8f] font-['Amiri',serif] mt-2">
            * تحديد الهدف هو اختيار تنظيمي للمتابعة الشخصية وليس سنة توقيفية خاصة.
          </span>
        </div>

        {/* Large Central Interactive Tap Pad (Easy 1-hand mobile operation) */}
        <div className="my-8 flex justify-center">
          <button
            type="button"
            onClick={handleIncrement}
            aria-label={`تسبيح ${activeDhikr.arabic}، العدد الحالي ${sessionCount}`}
            className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-[#c5a059]/40 hover:border-[#dfbd69] flex flex-col items-center justify-center p-4 cursor-pointer select-none transition-all duration-150 shadow-2xl relative ${
              isAnimating ? 'scale-95 border-[#dfbd69]' : 'scale-100'
            }`}
          >
            {/* Circular Progress Stroke (SVG) */}
            {targetMode !== 'free' && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  className="stroke-[#064e3b]/30"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  className="stroke-[#dfbd69] transition-all duration-200"
                  strokeWidth="4"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            )}

            {/* Inner Center Dial */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#064e3b]/90 via-[#032018] to-[#021812] border border-[#c5a059]/30 flex flex-col items-center justify-center shadow-inner group">
              <span className="text-[11px] font-['Cinzel',serif] uppercase tracking-widest text-[#c5a059] mb-1">
                TASBEEH
              </span>
              <span className="text-6xl sm:text-7xl font-bold font-mono text-[#fbf9f5] tabular-nums my-1">
                {sessionCount}
              </span>
              {targetMode !== 'free' ? (
                <span className="text-xs text-[#dfbd69] font-['Amiri',serif]">
                  من أصل {targetMode}
                </span>
              ) : (
                <span className="text-xs text-[#dfbd69] font-['Amiri',serif]">
                  عدّ مفتوح
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-['Amiri',serif] mt-2">
                المس في أي مكان للتسبيح
              </span>
            </div>
          </button>
        </div>

        {/* Controls Toolbar: Sound, Vibration, Reset, Total Lifetime */}
        <div className="pt-6 border-t border-[#c5a059]/20 flex items-center justify-between flex-wrap gap-4 max-w-xl mx-auto">
          {/* Sound & Haptics Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer"
              title={soundEnabled ? 'صوت التسبيح مفعّل' : 'صوت التسبيح صامت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className="p-2.5 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer"
              title={vibrationEnabled ? 'الاهتزاز مفعّل' : 'الاهتزاز متوقف'}
            >
              <Vibrate className={`w-4 h-4 ${vibrationEnabled ? 'text-[#dfbd69]' : 'text-slate-400'}`} />
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetRequest}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#c5a059]/25 text-xs text-[#d1c7b7] hover:text-rose-400 hover:border-rose-400/40 transition-colors font-['Amiri',serif] cursor-pointer"
            title="تصفير عداد الجلسة الحالية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير العداد</span>
          </button>

          {/* Total Accumulated Counter */}
          <div className="text-right">
            <span className="text-[11px] text-[#c5a059] font-['Amiri',serif] block">
              إجمالي تسبيحاتك المحفوظة:
            </span>
            <span className="text-sm font-bold font-mono text-[#fbf9f5] tabular-nums">
              {totalLifetimeCount} تسبيحة
            </span>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد تصفير عداد التسبيح"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-[#021c15] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center z-10 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] mb-2">
              تصفير عداد التسبيح؟
            </h3>
            <p className="text-xs text-[#d1c7b7] font-['Amiri',serif] mb-6 leading-relaxed">
              لقد أنجزت {sessionCount} تسبيحة في هذه الجلسة. هل تود البدء من الصفر؟
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-['Amiri',serif] text-xs font-bold transition-colors cursor-pointer"
              >
                نعم، تصفير
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2.5 rounded-xl border border-[#c5a059]/30 text-[#fbf9f5] hover:bg-[#064e3b]/30 font-['Amiri',serif] text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
