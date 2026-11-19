import React from 'react';
import { HadithRecord } from '../../data/hadithData';
import { Bookmark, Copy, Share2, ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';

interface HadithCardProps {
  hadith: HadithRecord;
  onOpenDetail: (hadith: HadithRecord) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onCopy?: (hadith: HadithRecord) => void;
  onShare?: (hadith: HadithRecord) => void;
}

export const HadithCard: React.FC<HadithCardProps> = ({
  hadith,
  onOpenDetail,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onShare,
}) => {
  const getGradeStyle = (grade: string) => {
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
    <div className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/60 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10">
      <div>
        {/* Top Header: Collection & Reference Number + Grade Badge */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#c5a059]/15 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#064e3b]/60 border border-[#c5a059]/30 text-xs font-bold font-mono text-[#dfbd69] flex items-center justify-center">
              {hadith.hadithNumber}
            </span>
            <div>
              <span className="text-xs font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                {hadith.collectionName}
              </span>
              <span className="text-[11px] text-[#a89e8f] block -mt-0.5 font-['Amiri',serif]">
                حديث رقم {hadith.hadithNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-['Amiri',serif] font-bold ${getGradeStyle(hadith.grade)}`}>
              {hadith.grade}
            </span>

            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(hadith.id)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]'
                  : 'border-[#c5a059]/20 text-slate-400 hover:text-[#dfbd69]'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Narrator */}
        <div className="text-xs text-[#c5a059] font-['Amiri',serif] mb-2 font-medium">
          عن {hadith.narrator} رضي الله عنه:
        </div>

        {/* Hadith Matn */}
        <p className="text-lg sm:text-xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-[2.3] select-text my-2 line-clamp-4 group-hover:line-clamp-none transition-all">
          « {hadith.matn} »
        </p>

        {/* Category tag */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#064e3b]/30 border border-[#c5a059]/15 text-[#d4ccbf] font-['Amiri',serif]">
            {hadith.categoryName}
          </span>
          <span className="text-[11px] text-[#8f8576] font-['Amiri',serif]">
            {hadith.gradeScholar}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-[#c5a059]/15 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetail(hadith)}
          className="py-2 px-4 rounded-xl font-['Amiri',serif] text-xs font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#c5a059]/15"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>عرض الشرح والفوائد</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {onCopy && (
            <button
              onClick={() => onCopy(hadith)}
              className="p-2 rounded-lg border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] hover:border-[#dfbd69] transition-colors cursor-pointer"
              title="نسخ الحديث"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {onShare && (
            <button
              onClick={() => onShare(hadith)}
              className="p-2 rounded-lg border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] hover:border-[#dfbd69] transition-colors cursor-pointer"
              title="مشاركة الحديث"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
