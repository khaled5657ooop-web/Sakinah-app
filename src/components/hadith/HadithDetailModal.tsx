import React, { useState, useEffect } from 'react';
import { HadithRecord } from '../../data/hadithData';
import { getRelatedHadiths } from '../../services/hadithApi';
import { IslamicStar, IslamicDivider } from '../IslamicMotifs';
import { 
  X, 
  Copy, 
  Share2, 
  Bookmark, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';

interface HadithDetailModalProps {
  hadith: HadithRecord | null;
  onClose: () => void;
  onSelectHadith: (h: HadithRecord) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const HadithDetailModal: React.FC<HadithDetailModalProps> = ({
  hadith,
  onClose,
  onSelectHadith,
  isFavorite,
  onToggleFavorite,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hadith) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hadith, onClose]);

  if (!hadith) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopy = () => {
    const textToCopy = `عن ${hadith.narrator} قال: قال رسول الله ﷺ:\n« ${hadith.matn} »\n\nالمصدر: ${hadith.collectionName} (الحديث رقم ${hadith.hadithNumber})\nدرجة الحديث: ${hadith.grade} (${hadith.gradeScholar})\n- منصة سَكِينَة`;
    navigator.clipboard.writeText(textToCopy);
    showToast('تم نسخ الحديث مع العزو الكامل بنجاح');
  };

  const handleShare = async () => {
    const textToShare = `عن ${hadith.narrator}:\n« ${hadith.matn} »\n\n${hadith.collectionName} [رقم ${hadith.hadithNumber}] - ${hadith.gradeScholar}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `حديث شريف من ${hadith.collectionName}`,
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const relatedHadiths = getRelatedHadiths(hadith.id, 2);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'صحيح':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      case 'حسن':
        return 'bg-[#c5a059]/20 text-[#dfbd69] border-[#dfbd69]/40';
      case 'ضعيف':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-900/60 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="تفاصيل الحديث النبوي الشريف"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#064e3b] text-[#dfbd69] px-5 py-2.5 rounded-full border border-[#dfbd69]/40 shadow-xl text-xs sm:text-sm font-['Amiri',serif] flex items-center gap-2 animate-fade-in-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col overflow-hidden text-right">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#c5a059]/20 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                {hadith.collectionName}
              </h3>
              <p className="text-xs text-[#c5a059]/80 font-['Amiri',serif]">
                الحديث رقم <span className="font-mono">{hadith.hadithNumber}</span>
                {hadith.bookName && ` • ${hadith.bookName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Authenticity Grade Badge */}
            <span className={`text-xs px-3 py-1 rounded-full border font-['Amiri',serif] font-bold ${getGradeBadge(hadith.grade)}`}>
              درجة الحديث: {hadith.grade}
            </span>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#e4ded5] hover:text-[#dfbd69] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="إغلاق نافذة الحديث"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto my-5 pr-1 space-y-6 max-h-[60vh]">
          
          {/* Narrator Ribbon */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#021812] border border-[#c5a059]/15">
            <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
              الراوي: <strong className="text-[#fbf9f5] font-normal">{hadith.narrator}</strong>
            </span>
            <span className="text-xs text-[#dfbd69] font-['Amiri',serif]">
              التصنيف: {hadith.categoryName}
            </span>
          </div>

          {/* Matn Centerpiece */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#021812]/90 border border-[#c5a059]/25 text-center">
            <div className="text-2xl sm:text-3xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-[2.4] select-text">
              « {hadith.matn} »
            </div>

            <IslamicDivider className="my-5 opacity-40" />

            {/* Chapter info */}
            {hadith.chapterName && (
              <p className="text-xs text-[#c5a059] font-['Amiri',serif]">
                {hadith.chapterName}
              </p>
            )}
          </div>

          {/* Authenticity Details & Scholarly Source */}
          <div className="p-4 rounded-xl bg-[#064e3b]/20 border border-[#c5a059]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#dfbd69] font-['Amiri',serif] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>التحقيق والدرجة العلمية:</span>
            </div>
            <p className="text-xs text-[#d1c7b7] font-['Amiri',serif] leading-relaxed">
              {hadith.gradeScholar ? (
                <span>حكم الحديث: <strong className="text-[#fbf9f5] font-normal">{hadith.gradeScholar}</strong>. أخرجه {hadith.collectionName}.</span>
              ) : (
                <span>درجة الحديث غير متوفرة في المصدر.</span>
              )}
            </p>
          </div>

          {/* Explanation / Fawa'id */}
          {hadith.explanation && (
            <div className="p-5 rounded-xl bg-[#032018] border border-[#c5a059]/20 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#dfbd69] font-['Amiri',serif] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>المقاصد النبوية والفوائد:</span>
              </div>
              <p className="text-sm font-['Amiri',serif] text-[#d4ccbf] leading-relaxed select-text">
                {hadith.explanation}
              </p>
            </div>
          )}

          {/* Related Hadiths in the same category */}
          {relatedHadiths.length > 0 && (
            <div className="pt-4 border-t border-[#c5a059]/15">
              <div className="text-xs font-bold text-[#dfbd69] font-['Amiri',serif] mb-3">
                أحاديث نبوية ذات صلة بالموضوع:
              </div>
              <div className="space-y-2.5">
                {relatedHadiths.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectHadith(rel)}
                    className="p-3.5 rounded-xl bg-[#021812] border border-[#c5a059]/15 hover:border-[#dfbd69] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                        {rel.collectionName} • رقم {rel.hadithNumber}
                      </span>
                      <p className="text-xs font-['Amiri',serif] text-[#c7beaf] line-clamp-1 mt-0.5">
                        « {rel.matn} »
                      </p>
                    </div>
                    <span className="text-xs text-[#dfbd69] font-['Amiri',serif] shrink-0 mr-2">
                      عرض
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-[#c5a059]/20 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {/* Favorite toggle */}
            <button
              onClick={() => {
                onToggleFavorite(hadith.id);
                showToast(isFavorite ? 'تمت إزالة الحديث من المفضلة' : 'تم حفظ الحديث في المفضلة');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-['Amiri',serif] transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                  : 'border-[#c5a059]/25 text-[#d1c7b7] hover:text-[#dfbd69]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{isFavorite ? 'محفوظ بالمفضلة' : 'حفظ بالمفضلة'}</span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c5a059]/25 text-xs text-[#d1c7b7] hover:text-[#dfbd69] transition-colors cursor-pointer font-['Amiri',serif]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ الحديث</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c5a059]/25 text-xs text-[#d1c7b7] hover:text-[#dfbd69] transition-colors cursor-pointer font-['Amiri',serif]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-['Amiri',serif] bg-[#dfbd69] text-[#021812] font-bold hover:bg-[#f3e5ab] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
