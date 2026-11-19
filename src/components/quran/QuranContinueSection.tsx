import React from 'react';
import { IslamicStar } from '../IslamicMotifs';
import { Bookmark, ArrowLeft, Trash2, Clock, BookOpen, Info } from 'lucide-react';

export interface LastReadProgress {
  chapterId: number;
  chapterName: string;
  verseNumber: number;
  verseExcerpt?: string;
  timestamp: number;
}

export interface QuranBookmark {
  id: string; // e.g. "2:255"
  chapterId: number;
  chapterName: string;
  verseNumber: number;
  verseText: string;
  timestamp: number;
}

interface QuranContinueSectionProps {
  lastRead: LastReadProgress | null;
  bookmarks: QuranBookmark[];
  onResumeReading: (chapterId: number, verseNumber: number) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
}

export const QuranContinueSection: React.FC<QuranContinueSectionProps> = ({
  lastRead,
  bookmarks,
  onResumeReading,
  onRemoveBookmark,
}) => {
  // If no last read and no bookmarks yet, we can render a quiet welcoming card
  if (!lastRead && bookmarks.length === 0) {
    return (
      <div className="mb-10 p-6 rounded-2xl bg-[#032018]/60 border border-[#c5a059]/20 text-center">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-[#dfbd69] font-['Cinzel',serif] mb-1">
          <IslamicStar size={12} />
          <span>START YOUR SACRED JOURNEY</span>
          <IslamicStar size={12} />
        </div>
        <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
          واصل رحلتك مع القرآن
        </h3>
        <p className="text-sm font-['Amiri',serif] text-[#c7beaf] max-w-lg mx-auto mt-2">
          اختر أي سورة لتبدأ القراءة، وسيتم حفظ موضع قراءتك وعلاماتك المرجعية تلقائيًا على هذا المتصفح لتستأنف في أي وقت.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/30 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#c5a059]/15 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#064e3b]/60 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
              واصل رحلتك مع القرآن
            </h3>
            <span className="text-xs text-[#c5a059]/80 font-['Amiri',serif]">
              سجل قراءتك وعلاماتك المرجعية المحفوظة
            </span>
          </div>
        </div>

        {/* Local Storage Disclaimer Note */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#a89e8f] bg-[#021812]/70 px-3 py-1.5 rounded-xl border border-[#c5a059]/15">
          <Info className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
          <span>الموضع محفوظ محليًا في هذا المتصفح (لا ينتقل تلقائيًا بين الأجهزة)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left/Main Column: Last Read Card */}
        {lastRead && (
          <div className="lg:col-span-6 p-6 rounded-2xl bg-[#021812] border border-[#c5a059]/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-['Amiri',serif] text-[#c5a059] font-medium">
                  آخر موضع توقفت عنده:
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {new Date(lastRead.timestamp).toLocaleDateString('ar-EG')}
                </span>
              </div>

              <h4 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                {lastRead.chapterName} • الآية {lastRead.verseNumber}
              </h4>

              {lastRead.verseExcerpt && (
                <p className="mt-2 text-sm font-['Amiri_Quran',serif] text-[#d4ccbf] line-clamp-2 leading-relaxed">
                  ﴿ {lastRead.verseExcerpt} ﴾
                </p>
              )}
            </div>

            <button
              onClick={() => onResumeReading(lastRead.chapterId, lastRead.verseNumber)}
              className="mt-6 w-full py-3 px-4 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#c5a059]/15 group"
            >
              <BookOpen className="w-4 h-4 text-[#021812]" />
              <span>متابعة القراءة</span>
              <ArrowLeft className="w-4 h-4 text-[#021812] group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Right Column: Bookmarks List */}
        <div className={`${lastRead ? 'lg:col-span-6' : 'lg:col-span-12'} p-6 rounded-2xl bg-[#021812] border border-[#c5a059]/25 flex flex-col`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
              <Bookmark className="w-4 h-4 fill-current text-[#dfbd69]" />
              <span>العلامات المرجعية ({bookmarks.length})</span>
            </div>
            {bookmarks.length > 0 && (
              <span className="text-[11px] text-slate-400 font-['Amiri',serif]">
                اضغط على أي علامة للانتقال إليها
              </span>
            )}
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center flex-grow">
              <Bookmark className="w-7 h-7 text-[#c5a059]/30 mb-2" />
              <p className="text-xs font-['Amiri',serif]">
                لم تضف أي علامة مرجعية بعد. يمكنك حفظ أي آية أثناء القراءة بالضغط على أيقونة الإشارة المرجعية.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[190px] pr-1 flex-grow">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 rounded-xl bg-[#032018] border border-[#c5a059]/20 hover:border-[#dfbd69] flex items-center justify-between gap-3 transition-colors group"
                >
                  <button
                    onClick={() => onResumeReading(bm.chapterId, bm.verseNumber)}
                    className="flex-1 text-right cursor-pointer"
                  >
                    <div className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                      {bm.chapterName} • الآية {bm.verseNumber}
                    </div>
                    <div className="text-xs font-['Amiri_Quran',serif] text-[#c7beaf] truncate max-w-xs mt-0.5">
                      ﴿ {bm.verseText} ﴾
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(bm.id);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                    title="حذف هذه العلامة المرجعية"
                    aria-label="حذف العلامة المرجعية"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
