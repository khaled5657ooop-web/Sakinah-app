import React, { useState, useEffect, useRef } from 'react';
import { QURAN_SURAHS, SurahMeta } from '../../data/quranMetadata';
import { fetchSurahVerses, Verse } from '../../services/quranApi';
import { IslamicStar, IslamicDivider, BismillahText } from '../IslamicMotifs';
import { TafsirModal } from './TafsirModal';
import { useQuranAudio } from '../../context/QuranAudioContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Bookmark, 
  Copy, 
  Share2, 
  Check, 
  Headphones, 
  Search, 
  Settings, 
  Sliders, 
  Sun, 
  Moon, 
  Loader2, 
  AlertCircle,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface QuranReaderProps {
  surahId: number;
  initialAyah?: number;
  onBackToDirectory: () => void;
  onSelectSurah: (id: number, initialAyah?: number) => void;
  onOpenSearchModal: () => void;
  bookmarks: { id: string }[];
  onToggleBookmark: (chapterId: number, chapterName: string, verseNumber: number, verseText: string) => void;
  onSaveLastRead: (chapterId: number, chapterName: string, verseNumber: number, verseExcerpt: string) => void;
}

type ReaderTheme = 'emerald' | 'parchment' | 'black' | 'sepia';
type ViewMode = 'mushaf' | 'list';

export const QuranReader: React.FC<QuranReaderProps> = ({
  surahId,
  initialAyah = 1,
  onBackToDirectory,
  onSelectSurah,
  onOpenSearchModal,
  bookmarks,
  onToggleBookmark,
  onSaveLastRead,
}) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakinah_quran_fontsize');
      return saved ? Number(saved) : 26;
    }
    return 26;
  });

  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakinah_quran_theme') as ReaderTheme | null;
      if (saved) return saved;
    }
    return 'emerald';
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sakinah_quran_viewmode') as ViewMode | null;
      if (saved === 'mushaf' || saved === 'list') return saved;
    }
    return 'mushaf';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  // Tafsir Modal state
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<{ key: string; text: string } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Context
  const { playChapter, currentChapter, isPlaying } = useQuranAudio();

  const currentSurahMeta: SurahMeta = QURAN_SURAHS.find(s => s.id === surahId) || QURAN_SURAHS[0];

  // Save settings on changes
  useEffect(() => {
    localStorage.setItem('sakinah_quran_fontsize', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('sakinah_quran_theme', readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    localStorage.setItem('sakinah_quran_viewmode', viewMode);
  }, [viewMode]);

  // Load verses from Quran.com API v4 (cached by Service Worker after first visit)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchSurahVerses(surahId)
      .then((data) => {
        if (isMounted) {
          setVerses(data);
          setLoading(false);

          // Save last read position
          if (data.length > 0) {
            const verseObj = data.find(v => v.verse_number === initialAyah) || data[0];
            onSaveLastRead(
              surahId,
              currentSurahMeta.name,
              verseObj.verse_number,
              verseObj.text_uthmani.slice(0, 60)
            );
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          const isOfflineNow = typeof navigator !== 'undefined' && !navigator.onLine;
          setError(
            isOfflineNow
              ? 'أنت غير متصل بالإنترنت حاليًا، ولم يتم تحميل هذه السورة مسبقًا على هذا الجهاز. اتصل بالشبكة لتحميلها وحفظها للقراءة لاحقًا.'
              : err.message || 'تعذر تحميل نص السورة الكريمة.'
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [surahId, reloadNonce]);

  // Scroll to initialAyah if provided, otherwise restore saved Surah scroll reading position
  useEffect(() => {
    if (loading || verses.length === 0) return;

    const timer = window.setTimeout(() => {
      if (initialAyah > 1) {
        const el = document.getElementById(`ayah-${initialAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      try {
        const savedScroll = localStorage.getItem(`sakinah_quran_scroll_${surahId}`);
        if (savedScroll) {
          const top = Number(savedScroll);
          if (!Number.isNaN(top) && top > 40) {
            window.scrollTo({ top, behavior: 'auto' });
          }
        }
      } catch {
        // Ignore storage restrictions
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [loading, verses.length, initialAyah, surahId]);

  // Passively save scroll offset while reading so returning preserves exact reading place
  useEffect(() => {
    if (loading || verses.length === 0) return;
    let timeoutId: number | null = null;

    const handleScroll = () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        try {
          localStorage.setItem(`sakinah_quran_scroll_${surahId}`, String(Math.round(window.scrollY)));
        } catch {
          // Ignore storage errors
        }
      }, 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, verses.length, surahId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyVerse = (verse: Verse) => {
    const text = `﴿ ${verse.text_uthmani} ﴾ [سورة ${currentSurahMeta.name}: الآية ${verse.verse_number}] - منصة سَكِينَة`;
    navigator.clipboard.writeText(text);
    showToast(`تم نسخ الآية ${verse.verse_number} بنجاح`);
  };

  const handleShareVerse = async (verse: Verse) => {
    const text = `﴿ ${verse.text_uthmani} ﴾ [سورة ${currentSurahMeta.name}: الآية ${verse.verse_number}] - منصة سَكِينَة`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${currentSurahMeta.name} - الآية ${verse.verse_number}`,
          text: text,
          url: window.location.href,
        });
      } catch {
        handleCopyVerse(verse);
      }
    } else {
      handleCopyVerse(verse);
    }
  };

  const handleToggleBookmarkClick = (verse: Verse) => {
    onToggleBookmark(
      surahId,
      currentSurahMeta.name,
      verse.verse_number,
      verse.text_uthmani.slice(0, 70)
    );
    const key = `${surahId}:${verse.verse_number}`;
    const isBookmarked = bookmarks.some(b => b.id === key);
    showToast(isBookmarked ? 'تمت إزالة العلامة المرجعية' : `تم حفظ الآية ${verse.verse_number} في العلامات المرجعية`);
  };

  // Convert numbers to Arabic Eastern numerals (e.g. 1 -> ١)
  const toArabicNumerals = (num: number) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
  };

  // Theme container classes
  const getThemeClasses = () => {
    switch (readerTheme) {
      case 'parchment':
        return 'bg-[#fbf7ee] text-[#1c1917] border-[#e7dec8]';
      case 'black':
        return 'bg-[#000000] text-[#f5f5f5] border-neutral-800';
      case 'sepia':
        return 'bg-[#1a1510] text-[#f4ece1] border-[#382d22]';
      case 'emerald':
      default:
        return 'bg-[#021812] text-[#fbf9f5] border-[#c5a059]/25';
    }
  };

  const getPageBackground = () => {
    switch (readerTheme) {
      case 'parchment': return 'bg-[#f4efe4]';
      case 'black': return 'bg-[#080808]';
      case 'sepia': return 'bg-[#120e0b]';
      case 'emerald':
      default: return 'bg-[#01140e]';
    }
  };

  const isAudioPlayingThisSurah = currentChapter === surahId && isPlaying;

  return (
    <div className={`min-h-screen ${getPageBackground()} py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-300`}>
      
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#064e3b] text-[#dfbd69] px-5 py-2.5 rounded-full border border-[#dfbd69]/40 shadow-xl text-xs sm:text-sm font-['Amiri',serif] flex items-center gap-2 animate-fade-in-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader Fixed/Sticky Navigation Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 sticky top-16 md:top-20 z-30">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#032018]/90 dark:bg-[#032018]/90 backdrop-blur-md border border-[#c5a059]/30 shadow-xl flex items-center justify-between gap-2 flex-wrap">
          
          {/* Back button & Surah title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDirectory}
              className="p-2 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#dfbd69] hover:bg-[#064e3b]/40 transition-colors flex items-center gap-1.5 text-xs font-['Amiri',serif] cursor-pointer"
              title="العودة لفهرس السور"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">فهرس السور</span>
            </button>

            <div>
              <h2 className="text-lg sm:text-xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                سورة {currentSurahMeta.name}
              </h2>
              <span className="text-[11px] text-[#c5a059] font-['Amiri',serif] block -mt-0.5">
                {currentSurahMeta.type} • {currentSurahMeta.versesCount} آية • الجزء {currentSurahMeta.juz}
              </span>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            {/* Play/Listen Surah Button */}
            <button
              onClick={() => playChapter(surahId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Amiri',serif] border transition-all cursor-pointer ${
                isAudioPlayingThisSurah
                  ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                  : 'bg-[#064e3b]/40 text-[#dfbd69] border-[#c5a059]/30 hover:border-[#dfbd69]'
              }`}
              title="استماع لتلاوة السورة"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isAudioPlayingThisSurah ? 'جارٍ الاستماع' : 'استماع'}</span>
            </button>

            {/* Search within Quran Button */}
            <button
              onClick={onOpenSearchModal}
              className="p-2 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer"
              title="البحث في القرآن"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Reader Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showSettings
                  ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]'
                  : 'border-[#c5a059]/25 text-[#dfbd69] hover:bg-[#064e3b]/30'
              }`}
              title="خيارات وحجم الخط وخلفية القراءة"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Settings Drawer */}
        {showSettings && (
          <div className="mt-2 p-5 rounded-2xl bg-[#021812] border border-[#c5a059]/30 shadow-2xl space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* 1. Font Size Scaler */}
              <div>
                <label className="text-xs text-[#dfbd69] font-['Amiri',serif] block mb-2 font-medium">
                  حجم الخط القرآني ({fontSize}px):
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize(prev => Math.max(18, prev - 2))}
                    className="w-8 h-8 rounded-lg bg-[#064e3b]/40 border border-[#c5a059]/30 text-sm font-bold text-[#fbf9f5] hover:bg-[#064e3b]"
                  >
                    -A
                  </button>
                  <input
                    type="range"
                    min={18}
                    max={42}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#064e3b]/60 rounded-lg appearance-none cursor-pointer accent-[#dfbd69]"
                  />
                  <button
                    onClick={() => setFontSize(prev => Math.min(42, prev + 2))}
                    className="w-8 h-8 rounded-lg bg-[#064e3b]/40 border border-[#c5a059]/30 text-sm font-bold text-[#fbf9f5] hover:bg-[#064e3b]"
                  >
                    +A
                  </button>
                </div>
              </div>

              {/* 2. Reading Theme */}
              <div>
                <label className="text-xs text-[#dfbd69] font-['Amiri',serif] block mb-2 font-medium">
                  خلفية القراءة:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setReaderTheme('emerald')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-['Amiri',serif] border transition-all ${
                      readerTheme === 'emerald'
                        ? 'bg-[#064e3b] text-[#dfbd69] border-[#dfbd69]'
                        : 'bg-[#021812] text-slate-300 border-[#c5a059]/20'
                    }`}
                  >
                    زمردي
                  </button>
                  <button
                    onClick={() => setReaderTheme('parchment')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-['Amiri',serif] border transition-all ${
                      readerTheme === 'parchment'
                        ? 'bg-[#fbf7ee] text-[#1c1917] border-[#dfbd69]'
                        : 'bg-[#f4efe4] text-[#1c1917] border-stone-300'
                    }`}
                  >
                    عاجي
                  </button>
                  <button
                    onClick={() => setReaderTheme('black')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-['Amiri',serif] border transition-all ${
                      readerTheme === 'black'
                        ? 'bg-[#000] text-[#fbf9f5] border-[#dfbd69]'
                        : 'bg-black text-slate-400 border-neutral-800'
                    }`}
                  >
                    أسود
                  </button>
                  <button
                    onClick={() => setReaderTheme('sepia')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-['Amiri',serif] border transition-all ${
                      readerTheme === 'sepia'
                        ? 'bg-[#2a2016] text-[#dfbd69] border-[#dfbd69]'
                        : 'bg-[#1a1510] text-[#d6cdbf] border-[#382d22]'
                    }`}
                  >
                    سيبيا
                  </button>
                </div>
              </div>

              {/* 3. View Mode: Continuous Mushaf vs Verse by Verse */}
              <div>
                <label className="text-xs text-[#dfbd69] font-['Amiri',serif] block mb-2 font-medium">
                  نمط العرض:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewMode('mushaf')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-['Amiri',serif] border transition-all ${
                      viewMode === 'mushaf'
                        ? 'bg-[#dfbd69] text-[#021812] font-bold border-[#dfbd69]'
                        : 'bg-[#064e3b]/30 text-[#d4ccbf] border-[#c5a059]/20'
                    }`}
                  >
                    رسم المصحف
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-['Amiri',serif] border transition-all ${
                      viewMode === 'list'
                        ? 'bg-[#dfbd69] text-[#021812] font-bold border-[#dfbd69]'
                        : 'bg-[#064e3b]/30 text-[#d4ccbf] border-[#c5a059]/20'
                    }`}
                  >
                    آية تلو آية
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Main Mushaf Content Container */}
      <div className={`max-w-4xl mx-auto rounded-3xl p-6 sm:p-12 lg:p-16 shadow-2xl border ${getThemeClasses()} transition-colors duration-300 relative`}>
        
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-4 text-[#dfbd69]">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-lg font-['Amiri',serif]">جارٍ تحميل نص السورة الكريمة بالرسم العثماني...</span>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-amber-200 text-center max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-amber-300" />
            <p className="text-base font-['Amiri',serif] leading-relaxed">{error}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setReloadNonce((n) => n + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#dfbd69] text-[#021812] font-bold font-['Amiri',serif] text-sm cursor-pointer"
              >
                إعادة المحاولة
              </button>
              <button
                type="button"
                onClick={onBackToDirectory}
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] text-[#dfbd69] border border-[#dfbd69]/40 font-['Amiri',serif] text-sm cursor-pointer"
              >
                العودة لفهرس السور
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Ornate Surah Title Plaque */}
            <div className="mb-10 text-center">
              <div className="inline-block p-4 sm:p-6 rounded-2xl border-2 border-[#c5a059]/40 bg-gradient-to-b from-[#064e3b]/20 to-transparent min-w-[280px]">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <IslamicStar size={14} className="text-[#dfbd69]" />
                  <span className="text-xs uppercase font-['Cinzel',serif] tracking-widest text-[#c5a059]">
                    SURAH {currentSurahMeta.nameEnglish}
                  </span>
                  <IslamicStar size={14} className="text-[#dfbd69]" />
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                  سورة {currentSurahMeta.name}
                </h1>

                <div className="flex items-center justify-center gap-3 text-xs text-[#c5a059]/90 font-['Amiri',serif] mt-2">
                  <span>{currentSurahMeta.type}</span>
                  <span>•</span>
                  <span>{currentSurahMeta.versesCount} آية</span>
                  <span>•</span>
                  <span>الجزء {currentSurahMeta.juz}</span>
                </div>
              </div>
            </div>

            {/* Bismillah Calligraphy (Omitted only for Surah 9 At-Tawbah) */}
            {surahId !== 9 && surahId !== 1 && (
              <div className="mb-10 text-center">
                <BismillahText className="py-3" />
                <IslamicDivider className="my-4 opacity-50" />
              </div>
            )}

            {/* MODE 1: Continuous Mushaf Flow (الرسم المصحفي المتصل) */}
            {viewMode === 'mushaf' ? (
              <div 
                className="font-['Amiri_Quran',serif] text-justify leading-[2.6] sm:leading-[2.8] select-text"
                style={{ fontSize: `${fontSize}px` }}
              >
                {verses.map((verse) => {
                  const verseKey = `${surahId}:${verse.verse_number}`;
                  const isBookmarked = bookmarks.some(b => b.id === verseKey);

                  return (
                    <span
                      key={verse.id}
                      id={`ayah-${verse.verse_number}`}
                      className="inline group relative hover:bg-[#c5a059]/10 rounded transition-colors px-1"
                    >
                      {/* Verse Text */}
                      <span>{verse.text_uthmani}</span>

                      {/* Ornate End Ayah Symbol with interactive click */}
                      <span
                        onClick={() => setActiveTafsirVerse({ key: verse.verse_key, text: verse.text_uthmani })}
                        className="inline-flex items-center justify-center mx-1.5 cursor-pointer text-[#dfbd69] hover:text-[#f3e5ab] select-none align-middle font-normal"
                        title={`آية ${verse.verse_number} • اضغط لعرض التفسير`}
                      >
                        <span className="text-base sm:text-lg opacity-80">﴿</span>
                        <span className="font-['Amiri',serif] text-xs sm:text-sm font-bold px-1 tabular-nums">
                          {toArabicNumerals(verse.verse_number)}
                        </span>
                        <span className="text-base sm:text-lg opacity-80">﴾</span>
                      </span>

                      {/* Small Quick Action Hover Bar for each verse */}
                      <span className="hidden group-hover:inline-flex items-center gap-1 bg-[#032018] border border-[#c5a059]/40 rounded-full px-2 py-0.5 shadow-lg align-middle text-xs z-20 mr-1 not-italic font-['Amiri',serif]">
                        <button
                          onClick={() => setActiveTafsirVerse({ key: verse.verse_key, text: verse.text_uthmani })}
                          className="px-1.5 py-0.5 text-[11px] text-[#dfbd69] hover:underline cursor-pointer"
                        >
                          التفسير
                        </button>
                        <span className="text-[#c5a059]/30">|</span>
                        <button
                          onClick={() => handleToggleBookmarkClick(verse)}
                          className="p-1 text-slate-300 hover:text-[#dfbd69]"
                          title={isBookmarked ? 'إزالة العلامة' : 'إضافة علامة'}
                        >
                          <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-[#dfbd69] text-[#dfbd69]' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleCopyVerse(verse)}
                          className="p-1 text-slate-300 hover:text-[#dfbd69]"
                          title="نسخ الآية"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                    </span>
                  );
                })}
              </div>
            ) : (
              /* MODE 2: Verse-by-Verse List (آية تلو آية) */
              <div className="space-y-6">
                {verses.map((verse) => {
                  const verseKey = `${surahId}:${verse.verse_number}`;
                  const isBookmarked = bookmarks.some(b => b.id === verseKey);

                  return (
                    <div
                      key={verse.id}
                      id={`ayah-${verse.verse_number}`}
                      className="p-6 rounded-2xl bg-[#021812]/60 border border-[#c5a059]/20 hover:border-[#dfbd69]/60 transition-all flex flex-col justify-between group"
                    >
                      {/* Verse Header Ribbon */}
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#c5a059]/15">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center font-bold text-xs text-[#dfbd69]">
                            {verse.verse_number}
                          </span>
                          <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
                            الآية {verse.verse_number}
                          </span>
                        </div>

                        {/* Action buttons beside verse */}
                        <div className="flex items-center gap-1.5">
                          {/* Tafsir button */}
                          <button
                            onClick={() => setActiveTafsirVerse({ key: verse.verse_key, text: verse.text_uthmani })}
                            className="px-3 py-1 rounded-lg text-xs font-['Amiri',serif] bg-[#064e3b]/40 border border-[#c5a059]/25 text-[#dfbd69] hover:bg-[#064e3b] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>التفسير</span>
                          </button>

                          {/* Bookmark button */}
                          <button
                            onClick={() => handleToggleBookmarkClick(verse)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked
                                ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]'
                                : 'border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69]'
                            }`}
                            title={isBookmarked ? 'حذف الإشارة' : 'حفظ كعلامة مرجعية'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopyVerse(verse)}
                            className="p-1.5 rounded-lg border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] transition-colors cursor-pointer"
                            title="نسخ الآية"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Share button */}
                          <button
                            onClick={() => handleShareVerse(verse)}
                            className="p-1.5 rounded-lg border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] transition-colors cursor-pointer"
                            title="مشاركة الآية"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Verse Text */}
                      <div 
                        className="font-['Amiri_Quran',serif] text-center leading-[2.6] select-text py-2"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        ﴿ {verse.text_uthmani} ﴾
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Visual Divider at the end of Surah */}
            <div className="mt-16 text-center">
              <IslamicDivider className="my-8" />
              <div className="inline-block px-6 py-2 rounded-xl bg-[#064e3b]/30 border border-[#c5a059]/30 text-xs font-['Amiri',serif] text-[#dfbd69]">
                تمت بحمد الله وتوفيقه سورة {currentSurahMeta.name}
              </div>
            </div>

            {/* Bottom Navigation: Previous & Next Surah Buttons */}
            <div className="mt-10 pt-6 border-t border-[#c5a059]/20 flex items-center justify-between gap-4 flex-wrap">
              {surahId > 1 ? (
                <button
                  onClick={() => onSelectSurah(surahId - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#c5a059]/30 bg-[#032018] hover:bg-[#064e3b]/40 text-[#dfbd69] font-['Amiri',serif] text-sm transition-all cursor-pointer group"
                >
                  <ChevronRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>السورة السابقة: سورة {QURAN_SURAHS[surahId - 2]?.name}</span>
                </button>
              ) : <div />}

              <button
                onClick={onBackToDirectory}
                className="px-4 py-2.5 rounded-xl border border-[#c5a059]/20 hover:border-[#dfbd69] text-xs font-['Amiri',serif] text-[#c5a059]"
              >
                فهرس السور (١١٤ سورة)
              </button>

              {surahId < 114 ? (
                <button
                  onClick={() => onSelectSurah(surahId + 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#c5a059]/30 bg-[#032018] hover:bg-[#064e3b]/40 text-[#dfbd69] font-['Amiri',serif] text-sm transition-all cursor-pointer group"
                >
                  <span>السورة التالية: سورة {QURAN_SURAHS[surahId]?.name}</span>
                  <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : <div />}
            </div>

          </div>
        )}

      </div>

      {/* Tafsir Modal */}
      {activeTafsirVerse && (
        <TafsirModal
          verseKey={activeTafsirVerse.key}
          surahName={`سورة ${currentSurahMeta.name}`}
          verseText={activeTafsirVerse.text}
          onClose={() => setActiveTafsirVerse(null)}
        />
      )}

    </div>
  );
};
