import React, { useState, useEffect } from 'react';
import { searchQuran, SearchResult } from '../../services/quranApi';
import { QURAN_SURAHS } from '../../data/quranMetadata';
import { IslamicStar } from '../IslamicMotifs';
import { Search, X, Loader2, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';

interface QuranSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerse: (chapterNumber: number, verseNumber: number) => void;
}

export const QuranSearchModal: React.FC<QuranSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVerse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [matchedSurahs, setMatchedSurahs] = useState<typeof QURAN_SURAHS>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick suggestions
  const suggestedKeywords = ['السكينة', 'القلوب', 'الرحمن', 'الصبر', 'الجنة', 'الرحمة'];

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const executeSearch = async (termToSearch: string) => {
    const trimmed = termToSearch.trim();
    if (!trimmed) {
      setResults([]);
      setMatchedSurahs([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // 1. Check local Surahs match by name or number
      const isNum = !isNaN(Number(trimmed));
      const filteredSurahs = QURAN_SURAHS.filter(s => {
        if (isNum) {
          return s.id === Number(trimmed);
        }
        return s.name.includes(trimmed) || s.nameEnglish.toLowerCase().includes(trimmed.toLowerCase());
      });
      setMatchedSurahs(filteredSurahs);

      // 2. Query Quran text search
      const searchRes = await searchQuran(trimmed);
      setResults(searchRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إتمام البحث';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch(searchTerm);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="البحث في القرآن الكريم"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col overflow-hidden text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#c5a059]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                البحث الموثق في القرآن الكريم
              </h3>
              <p className="text-xs text-[#c5a059]/80 font-['Amiri',serif]">
                ابحث عن كلمة، جزء من آية، اسم سورة أو رقمها
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#e4ded5] hover:text-[#dfbd69] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق البحث"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="mt-5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب كلمة قرآنية أو اسم سورة (مثال: السكينة، الفاتحة، 18)..."
              autoFocus
              className="w-full bg-[#021812] border border-[#c5a059]/30 rounded-2xl py-3.5 pr-11 pl-24 text-base font-['Amiri',serif] text-[#fbf9f5] placeholder:text-slate-500 focus:outline-none focus:border-[#dfbd69] focus:ring-1 focus:ring-[#dfbd69]/30"
            />
            <Search className="absolute right-4 w-5 h-5 text-[#c5a059]" />

            <button
              onClick={() => executeSearch(searchTerm)}
              className="absolute left-2 px-4 py-2 rounded-xl text-xs font-['Amiri',serif] font-bold bg-[#dfbd69] text-[#021812] hover:bg-[#f3e5ab] transition-colors cursor-pointer"
            >
              بحث
            </button>
          </div>

          {/* Quick Keywords Suggestions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] text-[#c5a059] font-['Amiri',serif]">اقتراحات:</span>
            {suggestedKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setSearchTerm(kw);
                  executeSearch(kw);
                }}
                className="px-2.5 py-1 rounded-lg text-xs bg-[#064e3b]/30 border border-[#c5a059]/15 text-[#d4ccbf] hover:text-[#dfbd69] hover:border-[#dfbd69]/40 transition-colors cursor-pointer font-['Amiri',serif]"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto my-5 flex-grow pr-1 space-y-4 max-h-[420px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#dfbd69]">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-['Amiri',serif]">جارٍ البحث في المصحف الشريف بدقة...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-rose-300 text-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <span className="text-sm font-['Amiri',serif]">{error}</span>
            </div>
          ) : hasSearched && results.length === 0 && matchedSurahs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
              <BookOpen className="w-10 h-10 text-[#c5a059]/40 mb-3" />
              <p className="text-base font-['Amiri',serif] text-[#dfbd69]">
                لم نجد نتائج مطابقة لـ «{searchTerm}»
              </p>
              <p className="text-xs text-slate-400 font-['Amiri',serif] mt-1">
                تأكد من كتابة الكلمة بالرسم المعتمد دون أخطاء إملائية.
              </p>
            </div>
          ) : (
            <>
              {/* Matched Surahs by name or number */}
              {matchedSurahs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#dfbd69] font-['Amiri',serif]">
                    السور المطابقة ({matchedSurahs.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedSurahs.map((surah) => (
                      <div
                        key={surah.id}
                        onClick={() => {
                          onSelectVerse(surah.id, 1);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl bg-[#032018] border border-[#c5a059]/25 hover:border-[#dfbd69] flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#064e3b] text-xs font-bold text-[#dfbd69] flex items-center justify-center">
                            {surah.id}
                          </span>
                          <div>
                            <span className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                              سورة {surah.name}
                            </span>
                            <span className="text-[11px] text-[#c5a059] block">
                              {surah.type} • {surah.versesCount} آية
                            </span>
                          </div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-[#dfbd69]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Verses */}
              {results.length > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="text-xs font-bold text-[#dfbd69] font-['Amiri',serif]">
                    الآيات القرآنية المطابقة ({results.length} نتيجة):
                  </div>
                  {results.map((r, idx) => {
                    const surahMeta = QURAN_SURAHS.find(s => s.id === r.chapterNumber);
                    const surahTitle = surahMeta ? `سورة ${surahMeta.name}` : `السورة ${r.chapterNumber}`;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          onSelectVerse(r.chapterNumber, r.verseNumber);
                          onClose();
                        }}
                        className="p-5 rounded-2xl bg-[#021812] border border-[#c5a059]/20 hover:border-[#dfbd69] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#c5a059]/10">
                          <span className="text-xs font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69] group-hover:text-[#f3e5ab]">
                            {surahTitle} • الآية {r.verseNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 group-hover:text-[#dfbd69] flex items-center gap-1 font-['Amiri',serif]">
                            <span>قراءة الآية في المصحف</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <p className="text-lg font-['Amiri_Quran',serif] text-[#fbf9f5] leading-relaxed">
                          ﴿ {r.text} ﴾
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#c5a059]/20 flex items-center justify-between text-xs text-[#c5a059]/75 font-['Amiri',serif]">
          <span>بحث نصي دقيق من مصدر موثوق</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#c5a059]/30 text-[#fbf9f5] hover:bg-[#064e3b]/40 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
