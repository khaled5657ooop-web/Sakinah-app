import React, { useState, useEffect } from 'react';
import { AdhkarCategory, AdhkarItem } from '../../data/adhkarData';
import { IslamicDivider } from '../IslamicMotifs';
import { playSoftBeadClick } from '../../utils/audioBead';
import { 
  ArrowRight, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Copy, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Sparkles,
  AlertTriangle,
  Award
} from 'lucide-react';

interface AdhkarSessionReaderProps {
  category: AdhkarCategory;
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (id: string, text: string, title: string) => void;
  onCompleteCategory?: (categoryId: string) => void;
}

export const AdhkarSessionReader: React.FC<AdhkarSessionReaderProps> = ({
  category,
  onBack,
  favorites,
  onToggleFavorite,
  onCompleteCategory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentItem: AdhkarItem = category.items[currentIndex] || category.items[0];
  const currentCount = counts[currentItem.id] || 0;
  const isItemCompleted = currentCount >= currentItem.count;

  // Sound synthesis using shared AudioContext singleton
  const playClickSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    playSoftBeadClick(520);
  };

  useEffect(() => {
    if (!showResetConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowResetConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showResetConfirm]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleIncrement = () => {
    if (isItemCompleted) return;

    playClickSound();
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }

    const nextCount = currentCount + 1;
    setCounts(prev => ({
      ...prev,
      [currentItem.id]: nextCount
    }));

    // If just completed this item
    if (nextCount >= currentItem.count) {
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }

      // Check if all items in category completed
      const updatedCounts = { ...counts, [currentItem.id]: nextCount };
      const allCompleted = category.items.every(item => (updatedCounts[item.id] || 0) >= item.count);
      if (allCompleted && onCompleteCategory) {
        onCompleteCategory(category.id);
      }

      // Automatically advance to next dhikr after 600ms if not at end
      if (currentIndex < category.items.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 550);
      }
    }
  };

  const handleResetCurrent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCounts(prev => ({
      ...prev,
      [currentItem.id]: 0
    }));
    showToast('تمت إعادة ضبط عداد هذا الذكر');
  };

  const handleConfirmResetAll = () => {
    setCounts({});
    setShowResetConfirm(false);
    setCurrentIndex(0);
    showToast('تمت إعادة ضبط الورد بالكامل');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `« ${currentItem.text} »\nالمصدر: ${currentItem.source} (${currentItem.count} مرة) - منصة سَكِينَة`;
    navigator.clipboard.writeText(textToCopy);
    showToast('تم نسخ الذكر مع المصدر');
  };

  // Calculate session completion
  const completedItemsCount = category.items.filter(item => (counts[item.id] || 0) >= item.count).length;
  const progressPercent = Math.round((completedItemsCount / category.items.length) * 100);
  const isFavorite = favorites.includes(currentItem.id);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#064e3b] text-[#dfbd69] px-5 py-2.5 rounded-full border border-[#dfbd69]/40 shadow-xl text-xs sm:text-sm font-['Amiri',serif] flex items-center gap-2 animate-fade-in-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#c5a059]/20 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-[#c5a059]/30 hover:border-[#dfbd69] text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors flex items-center gap-1.5 text-xs font-['Amiri',serif] cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع للأذكار</span>
          </button>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
              {category.title}
            </h2>
            <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
              {category.subtitle}
            </span>
          </div>
        </div>

        {/* Utilities: Sound & Reset All */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-[#c5a059]/25 text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer"
            title={soundEnabled ? 'صوت التسبيح: مفعّل' : 'صوت التسبيح: صامت'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 rounded-xl border border-[#c5a059]/25 text-xs text-[#d1c7b7] hover:text-rose-400 hover:border-rose-400/40 transition-colors flex items-center gap-1.5 font-['Amiri',serif] cursor-pointer"
            title="إعادة ضبط الجلسة بالكامل"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إعادة ضبط الورد</span>
          </button>
        </div>
      </div>

      {/* Session Progress Bar */}
      <div className="mb-8 p-4 rounded-2xl bg-[#032018]/80 border border-[#c5a059]/20 shadow-md">
        <div className="flex items-center justify-between text-xs text-[#c5a059] font-['Amiri',serif] mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#dfbd69]" />
            <span>تقدم الورد المبارك: {completedItemsCount} من {category.items.length} أذكار</span>
          </div>
          <span className="font-mono tabular-nums font-bold text-[#dfbd69]">{progressPercent}%</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 bg-[#021812] rounded-full overflow-hidden border border-[#c5a059]/15">
          <div 
            className="h-full bg-gradient-to-r from-[#c5a059] to-[#dfbd69] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Session Completion Banner */}
      {progressPercent === 100 && (
        <div
          role="status"
          className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-400/40 text-emerald-100 flex items-center justify-between gap-3 flex-wrap shadow-lg"
        >
          <div className="flex items-center gap-2.5 text-sm font-['Amiri',serif]">
            <Award className="w-5 h-5 text-[#dfbd69] shrink-0" />
            <span>تقبل الله طاعتك! أتممت جميع {category.title} لهذا اليوم بحمد الله.</span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-1.5 rounded-xl bg-[#dfbd69] text-[#021812] text-xs font-bold font-['Amiri',serif] cursor-pointer"
          >
            العودة للأذكار
          </button>
        </div>
      )}

      {/* Main Interactive Dhikr Card */}
      <div 
        onClick={handleIncrement}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleIncrement();
          }
        }}
        aria-label={`احتساب الذكر ${currentIndex + 1} من ${category.items.length}، المتبقي ${Math.max(0, currentItem.count - currentCount)}`}
        className={`relative rounded-3xl p-6 sm:p-10 shadow-2xl border transition-all duration-300 cursor-pointer select-none ${
          isItemCompleted 
            ? 'bg-gradient-to-b from-[#043325] to-[#022018] border-[#dfbd69] shadow-[#dfbd69]/10' 
            : 'bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border-[#c5a059]/30 hover:border-[#dfbd69]/60 active:scale-[0.99]'
        }`}
      >
        {/* Top Card Meta */}
        <div className="flex items-center justify-between pb-4 border-b border-[#c5a059]/15 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#064e3b] text-xs font-bold font-mono text-[#dfbd69] flex items-center justify-center">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
              الذكر {currentIndex + 1} من {category.items.length}
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Favorite toggle */}
            <button
              onClick={() => {
                onToggleFavorite(currentItem.id, currentItem.text, category.title);
                showToast(isFavorite ? 'تمت إزالة الذكر من المفضلة' : 'تمت إضافة الذكر للمفضلة');
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFavorite 
                  ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]' 
                  : 'border-[#c5a059]/20 text-slate-400 hover:text-[#dfbd69]'
              }`}
              title={isFavorite ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border border-[#c5a059]/20 text-slate-400 hover:text-[#dfbd69] transition-colors cursor-pointer"
              title="نسخ الذكر"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Reset single */}
            <button
              onClick={handleResetCurrent}
              className="p-2 rounded-xl border border-[#c5a059]/20 text-slate-400 hover:text-[#dfbd69] transition-colors cursor-pointer"
              title="تصفير هذا الذكر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Remembrance Arabic Text */}
        <div className="py-8 sm:py-12 text-center px-2 sm:px-6">
          <p className="text-2xl sm:text-3xl md:text-4xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-[2.2] sm:leading-[2.5]">
            « {currentItem.text} »
          </p>

          <IslamicDivider className="my-6 opacity-40" />

          {/* Virtue / Reward */}
          {currentItem.virtue && (
            <p className="text-sm font-['Amiri',serif] text-[#dfbd69] italic max-w-xl mx-auto leading-relaxed">
              <span className="font-bold not-italic ml-1">الفضل المأثور:</span>
              {currentItem.virtue}
            </p>
          )}

          <p className="text-xs text-[#a89e8f] font-['Amiri',serif] mt-3">
            المصدر: {currentItem.source}
          </p>
        </div>

        {/* Counter Centerpiece Button */}
        <div className="flex flex-col items-center justify-center pt-4">
          <div className="relative group">
            {/* Interactive Tap Ring */}
            <div className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 shadow-xl ${
              isItemCompleted 
                ? 'bg-[#064e3b] border-emerald-400 text-emerald-300' 
                : 'bg-gradient-to-br from-[#064e3b]/80 to-[#021812] border-[#dfbd69] text-[#fbf9f5] hover:scale-105 active:scale-95'
            }`}>
              {isItemCompleted ? (
                <>
                  <Check className="w-10 h-10 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold font-['Amiri',serif]">اكتمل الورد</span>
                </>
              ) : (
                <>
                  <span className="text-4xl sm:text-5xl font-bold font-mono tabular-nums text-[#dfbd69]">
                    {currentCount}
                  </span>
                  <span className="text-xs font-['Amiri',serif] text-[#c5a059] mt-0.5">
                    العدد المطلوب: {currentItem.count}
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-[#c5a059]/80 font-['Amiri',serif] mt-4">
            {isItemCompleted ? 'تم إتمام هذا الذكر بنجاح ✓' : `المتبقي: ${currentItem.count - currentCount} • اضغط في أي مكان لاحتساب الذكر`}
          </p>
        </div>

      </div>

      {/* Bottom Step Navigation Bar */}
      <div className="flex items-center justify-between mt-8 gap-4">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#c5a059]/30 bg-[#032018] hover:bg-[#064e3b]/40 text-[#dfbd69] font-['Amiri',serif] text-sm transition-all disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الذكر السابق</span>
        </button>

        <span className="text-xs font-mono text-[#c5a059] tabular-nums">
          {currentIndex + 1} / {category.items.length}
        </span>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(category.items.length - 1, prev + 1))}
          disabled={currentIndex === category.items.length - 1}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#c5a059]/30 bg-[#032018] hover:bg-[#064e3b]/40 text-[#dfbd69] font-['Amiri',serif] text-sm transition-all disabled:opacity-30 cursor-pointer"
        >
          <span>الذكر التالي</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Confirmation Modal to Reset All */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد إعادة ضبط الورد"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-[#021c15] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center z-10 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] mb-2">
              إعادة ضبط الورد بالكامل؟
            </h3>
            <p className="text-xs text-[#d1c7b7] font-['Amiri',serif] mb-6 leading-relaxed">
              سيتم تصفير جميع العدادات لـ «{category.title}» والبدء من جديد.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleConfirmResetAll}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-['Amiri',serif] text-xs font-bold transition-colors cursor-pointer"
              >
                نعم، أعد الضبط
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
