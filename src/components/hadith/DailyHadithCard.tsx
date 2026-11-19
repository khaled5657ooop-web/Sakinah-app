import React, { useState, useEffect } from 'react';
import { HadithRecord } from '../../data/hadithData';
import { getDailyHadith } from '../../services/hadithApi';
import { IslamicStar, IslamicDivider } from '../IslamicMotifs';
import { BookOpen, Share2, Copy, Check, ArrowLeft } from 'lucide-react';
import {
  fetchDailyPlatformBundle,
  formatArabicUpdateTimestamp,
} from '../../services/platformApi';

interface DailyHadithCardProps {
  onOpenHadith: (hadithId: string) => void;
  onExploreHadithLibrary: () => void;
}

export const DailyHadithCard: React.FC<DailyHadithCardProps> = ({
  onOpenHadith,
  onExploreHadithLibrary,
}) => {
  const [dailyHadith, setDailyHadith] = useState<HadithRecord>(() => getDailyHadith());
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetchDailyPlatformBundle().then((bundle) => {
      if (!active || !bundle?.hadith?.payload) return;
      setDailyHadith(bundle.hadith.payload);
      setLastUpdatedAt(bundle.hadith.fetchedAt || bundle.lastSuccessfulUpdate);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = () => {
    const textToCopy = `عن ${dailyHadith.narrator}:\n« ${dailyHadith.matn} »\n\nالمصدر: ${dailyHadith.collectionName} [رقم ${dailyHadith.hadithNumber}] - ${dailyHadith.gradeScholar}\n- منصة سَكِينَة`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const textToShare = `عن ${dailyHadith.narrator}:\n« ${dailyHadith.matn} »\n\n${dailyHadith.collectionName} [رقم ${dailyHadith.hadithNumber}] - ${dailyHadith.gradeScholar}\n- منصة سَكِينَة`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `حديث اليوم من منصة سَكِينَة`,
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

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c6b2d] dark:text-[#c5a059] font-['Cinzel',serif] mb-2">
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
          <span>DAILY PROPHETIC HADITH</span>
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
          حديث اليوم
        </h2>
        <p className="mt-1 text-sm text-[#424d47] dark:text-[#c7beaf] font-['Amiri',serif]">
          قبس من مشكاة النبوة يضيء يومك بالحكمة ومكارم الأخلاق
        </p>
        {lastUpdatedAt && (
          <p className="mt-1 text-xs text-[#8c6b2d] dark:text-[#c5a059]/85 font-['Amiri',serif] tabular-nums">
            آخر تحديث ناجح: {formatArabicUpdateTimestamp(lastUpdatedAt)}
          </p>
        )}
      </div>

      {/* Main Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#dfbd69] to-transparent" />

        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-[#c5a059]/15 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center font-bold font-mono text-xs text-[#dfbd69]">
              {dailyHadith.hadithNumber}
            </span>
            <div>
              <span className="text-base font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                {dailyHadith.collectionName}
              </span>
              <span className="text-xs text-[#c5a059] block -mt-1 font-['Amiri',serif]">
                الحديث رقم {dailyHadith.hadithNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-['Amiri',serif] font-bold">
              درجة الحديث: {dailyHadith.grade}
            </span>
          </div>
        </div>

        {/* Hadith Content */}
        <div className="py-8 text-center px-2 sm:px-6">
          <div className="text-xs text-[#c5a059] font-['Amiri',serif] mb-3">
            عن {dailyHadith.narrator} رضي الله عنه قال: قال رسول الله ﷺ:
          </div>

          <div className="text-2xl sm:text-3xl lg:text-4xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-[2.3] select-text">
            « {dailyHadith.matn} »
          </div>

          <IslamicDivider className="my-5 opacity-50" />

          {dailyHadith.explanation && (
            <p className="text-xs sm:text-sm text-[#d4ccbf] font-['Amiri',serif] italic max-w-xl mx-auto leading-relaxed">
              <span className="text-[#dfbd69] font-bold not-italic ml-1">الفائدة:</span>
              {dailyHadith.explanation}
            </p>
          )}

          <div className="text-[11px] text-[#8f8576] font-['Amiri',serif] mt-3">
            {dailyHadith.gradeScholar}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="pt-4 border-t border-[#c5a059]/15 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenHadith(dailyHadith.id)}
              className="py-2.5 px-4 rounded-xl font-['Amiri',serif] text-xs font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#c5a059]/15"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>عرض الشرح والفوائد والتفاصيل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] hover:border-[#dfbd69] transition-colors cursor-pointer"
              title="نسخ الحديث"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] hover:border-[#dfbd69] transition-colors cursor-pointer"
              title="مشاركة الحديث"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onExploreHadithLibrary}
            className="text-xs font-['Amiri',serif] text-[#dfbd69] hover:text-[#f3e5ab] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>استكشف مكتبة السنة النبوية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
