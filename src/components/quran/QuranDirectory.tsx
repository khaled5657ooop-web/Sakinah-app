import React, { useState, useMemo } from 'react';
import { QURAN_SURAHS, SurahMeta } from '../../data/quranMetadata';
import { IslamicStar, IslamicDivider } from '../IslamicMotifs';
import { QuranContinueSection, LastReadProgress, QuranBookmark } from './QuranContinueSection';
import { useQuranAudio } from '../../context/QuranAudioContext';
import { 
  Search, 
  BookOpen, 
  Headphones, 
  Sparkles, 
  Compass, 
  Layers, 
  Bookmark,
  Volume2,
  SlidersHorizontal
} from 'lucide-react';

interface QuranDirectoryProps {
  onOpenSurah: (surahId: number, startAyah?: number) => void;
  onOpenSearchModal: () => void;
  lastRead: LastReadProgress | null;
  bookmarks: QuranBookmark[];
  onRemoveBookmark: (id: string) => void;
  onBackToHome?: () => void;
}

export const QuranDirectory: React.FC<QuranDirectoryProps> = ({
  onOpenSurah,
  onOpenSearchModal,
  lastRead,
  bookmarks,
  onRemoveBookmark,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'مكية' | 'مدنية'>('all');
  const { playChapter, currentChapter, isPlaying } = useQuranAudio();

  // Filter surahs based on search query and type
  const filteredSurahs = useMemo(() => {
    return QURAN_SURAHS.filter((surah) => {
      // Type filter
      if (filterType !== 'all' && surah.type !== filterType) {
        return false;
      }
      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      const matchName = surah.name.includes(q) || surah.nameEnglish.toLowerCase().includes(q);
      const matchNum = String(surah.id) === q;
      return matchName || matchNum;
    });
  }, [searchQuery, filterType]);

  const makkiCount = QURAN_SURAHS.filter(s => s.type === 'مكية').length;
  const madaniCount = QURAN_SURAHS.filter(s => s.type === 'مدنية').length;

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Quran Portal Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#032018]/80 text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#dfbd69] mb-4">
          <IslamicStar size={12} className="text-[#dfbd69]" />
          <span>THE NOBLE QURAN SANCTUARY</span>
          <IslamicStar size={12} className="text-[#dfbd69]" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-['Aref_Ruqaa',serif] text-[#03241b] dark:text-[#fbf9f5] drop-shadow-md">
          القرآن الكريم
        </h1>

        <IslamicDivider className="my-3 opacity-70" />

        <p className="text-2xl sm:text-3xl font-['Amiri',serif] text-[#8c6b2d] dark:text-[#dfbd69] font-medium">
          "اقرأ، وتدبر، واستمع."
        </p>

        <p className="mt-2 text-sm sm:text-base text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
          المصحف الإلكتروني المتكامل بالرسم العثماني برواية حفص عن عاصم، مع التلاوات العطرة والتفاسير المعتمدة
        </p>

        {/* 4 Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#c5a059]/20">
          <div className="p-3.5 rounded-2xl bg-[#032018]/80 border border-[#c5a059]/20">
            <span className="text-[11px] font-['Cinzel',serif] uppercase tracking-wider text-[#c5a059] block">SURAHS</span>
            <span className="text-2xl font-bold font-mono text-[#fbf9f5] block mt-0.5">114</span>
            <span className="text-xs font-['Amiri',serif] text-[#dfbd69]">سورة مباركة</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#032018]/80 border border-[#c5a059]/20">
            <span className="text-[11px] font-['Cinzel',serif] uppercase tracking-wider text-[#c5a059] block">JUZ'</span>
            <span className="text-2xl font-bold font-mono text-[#fbf9f5] block mt-0.5">30</span>
            <span className="text-xs font-['Amiri',serif] text-[#dfbd69]">جزءًا كاملًا</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#032018]/80 border border-[#c5a059]/20">
            <span className="text-[11px] font-['Cinzel',serif] uppercase tracking-wider text-[#c5a059] block">HIZB</span>
            <span className="text-2xl font-bold font-mono text-[#fbf9f5] block mt-0.5">60</span>
            <span className="text-xs font-['Amiri',serif] text-[#dfbd69]">حزبًا مرتلاً</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#032018]/80 border border-[#c5a059]/20">
            <span className="text-[11px] font-['Cinzel',serif] uppercase tracking-wider text-[#c5a059] block">VERSES</span>
            <span className="text-2xl font-bold font-mono text-[#fbf9f5] block mt-0.5">6,236</span>
            <span className="text-xs font-['Amiri',serif] text-[#dfbd69]">آية كريمة</span>
          </div>
        </div>
      </div>

      {/* Continue Reading & Bookmarks Section */}
      <QuranContinueSection
        lastRead={lastRead}
        bookmarks={bookmarks}
        onResumeReading={(ch, v) => onOpenSurah(ch, v)}
        onRemoveBookmark={onRemoveBookmark}
      />

      {/* Search & Filter Toolbar */}
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#032018]/90 border border-[#c5a059]/25 shadow-lg">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن سورة بالاسم أو بالرقم (مثال: الكهف، 18)..."
            className="w-full bg-[#021812] border border-[#c5a059]/30 rounded-xl py-2.5 pr-10 pl-4 text-sm font-['Amiri',serif] text-[#fbf9f5] placeholder:text-slate-500 focus:outline-none focus:border-[#dfbd69]"
          />
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-[#c5a059]" />
        </div>

        {/* Global Quran Word Search Trigger */}
        <button
          onClick={onOpenSearchModal}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#c5a059]/30 hover:border-[#dfbd69] bg-[#064e3b]/30 hover:bg-[#064e3b]/60 text-xs font-['Amiri',serif] text-[#dfbd69] flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>البحث عن آية أو كلمة داخل المصحف</span>
        </button>

        {/* Filter Tabs (Interactive Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-[#021812] rounded-xl border border-[#c5a059]/20 self-stretch md:self-auto justify-center">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] font-medium transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            الكل (114)
          </button>

          <button
            onClick={() => setFilterType('مكية')}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] font-medium transition-all cursor-pointer ${
              filterType === 'مكية'
                ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            مكية ({makkiCount})
          </button>

          <button
            onClick={() => setFilterType('مدنية')}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] font-medium transition-all cursor-pointer ${
              filterType === 'مدنية'
                ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            مدنية ({madaniCount})
          </button>
        </div>
      </div>

      {/* Surah Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSurahs.map((surah: SurahMeta) => {
          const isThisSurahPlaying = currentChapter === surah.id && isPlaying;

          return (
            <div
              key={surah.id}
              className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/70 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 hover:-translate-y-0.5"
            >
              <div>
                {/* Card Top: Surah Number Badge & Classification */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Islamic Number Emblem */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#064e3b] to-[#022018] border border-[#c5a059]/40 flex items-center justify-center font-bold font-mono text-[#dfbd69] shadow-sm text-sm">
                      {surah.id}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                        سورة {surah.name}
                      </h3>
                      <span className="text-[11px] font-['Cinzel',serif] uppercase tracking-wider text-[#c5a059]/80 block">
                        {surah.nameEnglish}
                      </span>
                    </div>
                  </div>

                  {/* Makki / Madani Tag (Clean unboxed style) */}
                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#064e3b]/30 border border-[#c5a059]/20 text-[#e4ded5] font-['Amiri',serif]">
                      {surah.type}
                    </span>
                  </div>
                </div>

                {/* Surah Metadata details */}
                <div className="flex items-center justify-between py-3 my-2 border-y border-[#c5a059]/15 text-xs text-[#d1c7b7] font-['Amiri',serif]">
                  <div>
                    <span className="text-[#c5a059]">الآيات:</span> {surah.versesCount} آية
                  </div>
                  <div>
                    <span className="text-[#c5a059]">الجزء:</span> {surah.juz}
                  </div>
                  <div>
                    <span className="text-[#c5a059]">الصفحة:</span> {surah.startPage}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                {/* Read Surah Button */}
                <button
                  onClick={() => onOpenSurah(surah.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl font-['Amiri',serif] text-xs sm:text-sm font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#c5a059]/15"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>قراءة السورة</span>
                </button>

                {/* Listen to Surah Audio Button */}
                <button
                  onClick={() => playChapter(surah.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    isThisSurahPlaying
                      ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]'
                      : 'bg-[#064e3b]/40 text-[#dfbd69] border-[#c5a059]/30 hover:bg-[#064e3b]/70 hover:border-[#dfbd69]'
                  }`}
                  title={isThisSurahPlaying ? 'جارٍ الاستماع' : 'استماع للتلاوة الكاملة'}
                >
                  {isThisSurahPlaying ? (
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Headphones className="w-4 h-4" />
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <BookOpen className="w-12 h-12 text-[#c5a059]/40 mx-auto mb-3" />
          <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
            لم نجد سورة تطابق بحثك
          </h3>
          <p className="text-xs font-['Amiri',serif] text-slate-400 mt-1">
            جرب البحث برقم السورة (من 1 إلى 114) أو اسم السورة باللغة العربية.
          </p>
        </div>
      )}

    </div>
  );
};
