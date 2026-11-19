import React, { useMemo, useState, useEffect } from 'react';
import { DUAS_COLLECTION } from '../data/duasData';
import { LastReadProgress, QuranBookmark } from './quran/QuranContinueSection';
import { BookOpen, ArrowLeft, Bookmark, HeartHandshake, Copy, Check } from 'lucide-react';

interface HomeQuickJournalProps {
  onResumeQuran: (surahId?: number) => void;
  onOpenDuas: () => void;
}

export const HomeQuickJournal: React.FC<HomeQuickJournalProps> = ({
  onResumeQuran,
  onOpenDuas,
}) => {
  const [lastRead, setLastRead] = useState<LastReadProgress | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [copiedDua, setCopiedDua] = useState(false);

  useEffect(() => {
    try {
      const savedLast = localStorage.getItem('sakinah_quran_lastread');
      if (savedLast) {
        setLastRead(JSON.parse(savedLast));
      }
      const savedBookmarks = localStorage.getItem('sakinah_quran_bookmarks');
      if (savedBookmarks) {
        const parsed: QuranBookmark[] = JSON.parse(savedBookmarks);
        if (Array.isArray(parsed)) setBookmarkCount(parsed.length);
      }
    } catch {
      // Safe fallback when storage is unavailable
    }
  }, []);

  const dailyDua = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return DUAS_COLLECTION[dayOfYear % DUAS_COLLECTION.length];
  }, []);

  const handleCopyDua = () => {
    const text = `« ${dailyDua.text} »\n[${dailyDua.source}] - منصة سَكِينَة`;
    navigator.clipboard.writeText(text);
    setCopiedDua(true);
    setTimeout(() => setCopiedDua(false), 2000);
  };

  return (
    <section
      aria-label="متابعة القراءة ودعاء اليوم"
      className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Quran Reading Progress */}
        <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-8 shadow-xl flex flex-col justify-between text-right">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#c5a059]/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b]/60 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                    متابعة قراءة القرآن
                  </h3>
                  <span className="text-xs font-['Amiri',serif] text-[#c5a059]">
                    تقدمك الشخصي في المصحف الشريف
                  </span>
                </div>
              </div>

              {bookmarkCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-['Amiri',serif] text-[#dfbd69]">
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>{bookmarkCount} علامة</span>
                </span>
              )}
            </div>

            {lastRead ? (
              <div className="mt-5 space-y-2">
                <div className="text-xs font-['Amiri',serif] text-[#c5a059]">
                  آخر موضع توقفت عنده:
                </div>
                <div className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                  {lastRead.chapterName} • الآية {lastRead.verseNumber}
                </div>
                {lastRead.verseExcerpt && (
                  <p className="text-base font-['Amiri_Quran',serif] text-[#f5efe6] line-clamp-2 leading-loose">
                    ﴿ {lastRead.verseExcerpt} ﴾
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                <div className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                  ابدأ وردك اليومي من القرآن الكريم
                </div>
                <p className="text-sm font-['Amiri',serif] text-[#d1c7b7] leading-relaxed">
                  تصفح ١١٤ سورة بالرسم العثماني مع التفسير الموثق والتلاوة الصوتية، ويُحفظ موضع قراءتك تلقائيًا في متصفحك.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#c5a059]/15 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => onResumeQuran(lastRead?.chapterId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all cursor-pointer group"
            >
              <span>{lastRead ? 'واصل القراءة من حيث توقفت' : 'افتح المصحف الشريف'}</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onResumeQuran(18)}
              className="text-xs font-['Amiri',serif] text-[#c5a059] hover:text-[#dfbd69] transition-colors cursor-pointer"
            >
              قراءة سورة الكهف
            </button>
          </div>
        </div>

        {/* Card 2: Daily Dua */}
        <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-8 shadow-xl flex flex-col justify-between text-right">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#c5a059]/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b]/60 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                    دعاء اليوم
                  </h3>
                  <span className="text-xs font-['Amiri',serif] text-[#c5a059]">
                    {dailyDua.title}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyDua}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c5a059]/25 hover:border-[#dfbd69] text-xs font-['Amiri',serif] text-[#dfbd69] transition-colors cursor-pointer"
                aria-label="نسخ دعاء اليوم"
              >
                {copiedDua ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>

            <blockquote className="mt-5 text-lg sm:text-xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-[2.1]">
              « {dailyDua.text} »
            </blockquote>
            <p className="mt-2 text-xs font-['Amiri',serif] text-[#c5a059]">
              المصدر: {dailyDua.source}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c5a059]/15 flex items-center justify-between gap-3">
            <span className="text-xs font-['Amiri',serif] text-[#b8ad9c]">
              التصنيف: {dailyDua.categoryName}
            </span>
            <button
              type="button"
              onClick={onOpenDuas}
              className="inline-flex items-center gap-1.5 text-sm font-bold font-['Amiri',serif] text-[#dfbd69] hover:text-[#f3e5ab] transition-colors cursor-pointer group"
            >
              <span>تصفح مكتبة الأدعية</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
