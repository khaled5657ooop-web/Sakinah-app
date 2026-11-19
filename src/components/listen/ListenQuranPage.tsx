import React, { useMemo, useState } from 'react';
import { QURAN_RECITERS, QuranReciter } from '../../data/recitersData';
import { QURAN_SURAHS } from '../../data/quranMetadata';
import { useQuranAudio } from '../../context/QuranAudioContext';
import { ReciterEmblem } from './ReciterEmblem';
import { IslamicStar } from '../IslamicMotifs';
import {
  ArrowRight,
  BookOpen,
  Heart,
  Headphones,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  RotateCcw,
  RotateCw,
  Search,
  SkipBack,
  SkipForward,
  Star,
  Volume2,
  VolumeX,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

interface ListenQuranPageProps {
  onBackToHome: () => void;
  onOpenSurahInReader?: (surahId: number) => void;
}

const FEATURED_SURAH_IDS = [1, 2, 18, 36, 55, 67, 112];

export const ListenQuranPage: React.FC<ListenQuranPageProps> = ({
  onBackToHome,
  onOpenSurahInReader,
}) => {
  const {
    currentChapter,
    currentReciter,
    preferredReciterId,
    favoriteReciterIds,
    lastListened,
    isPlaying,
    isLoading,
    audioError,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeating,
    playChapter,
    retryCurrentChapter,
    clearAudioError,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    toggleRepeat,
    playNextChapter,
    playPrevChapter,
    toggleFavoriteReciter,
    setPreferredReciter,
    isFavoriteReciter,
  } = useQuranAudio();

  // Selected reciter in browser (defaults cleanly to user's saved preferred reciter without auto-playing)
  const [selectedReciterId, setSelectedReciterId] = useState<number>(preferredReciterId);
  const [reciterFilter, setReciterFilter] = useState<'all' | 'favorites'>('all');
  const [reciterSearch, setReciterSearch] = useState('');
  const [surahSearch, setSurahSearch] = useState('');
  const [surahTypeFilter, setSurahTypeFilter] = useState<'all' | 'مكية' | 'مدنية'>('all');

  const selectedReciter: QuranReciter =
    QURAN_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_RECITERS[0];

  const activePlayerReciter: QuranReciter =
    QURAN_RECITERS.find((r) => r.id === (currentChapter ? currentReciter.id : selectedReciter.id)) ||
    selectedReciter;

  const activeSurahMeta = useMemo(() => {
    const idToShow = currentChapter || lastListened?.chapterNumber || 1;
    return QURAN_SURAHS.find((s) => s.id === idToShow) || QURAN_SURAHS[0];
  }, [currentChapter, lastListened]);

  const filteredReciters = useMemo(() => {
    return QURAN_RECITERS.filter((r) => {
      if (reciterFilter === 'favorites' && !favoriteReciterIds.includes(r.id)) {
        return false;
      }
      if (reciterSearch.trim()) {
        const q = reciterSearch.trim();
        return (
          r.name.includes(q) ||
          r.shortName.includes(q) ||
          r.origin.includes(q) ||
          r.style.includes(q)
        );
      }
      return true;
    });
  }, [reciterFilter, reciterSearch, favoriteReciterIds]);

  const filteredSurahs = useMemo(() => {
    return QURAN_SURAHS.filter((surah) => {
      if (surahTypeFilter !== 'all' && surah.type !== surahTypeFilter) {
        return false;
      }
      if (surahSearch.trim()) {
        const q = surahSearch.trim();
        const num = Number(q);
        if (!Number.isNaN(num) && surah.id === num) return true;
        return surah.name.includes(q) || surah.nameEnglish.toLowerCase().includes(q.toLowerCase());
      }
      return true;
    });
  }, [surahSearch, surahTypeFilter]);

  const formatTime = (secs: number) => {
    if (Number.isNaN(secs) || secs < 0) return '00:00';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = Math.floor(secs % 60);
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleToggleReciterFavorite = (e: React.MouseEvent, reciterId: number) => {
    e.stopPropagation();
    const currentlyFav = isFavoriteReciter(reciterId);
    toggleFavoriteReciter(reciterId);
    if (!currentlyFav) {
      setPreferredReciter(reciterId);
    }
  };

  const handleSetPreferredOnly = (e: React.MouseEvent, reciterId: number) => {
    e.stopPropagation();
    setPreferredReciter(reciterId);
    if (!isFavoriteReciter(reciterId)) {
      toggleFavoriteReciter(reciterId);
    }
  };

  const handlePlaySurahWithSelectedReciter = (surahId: number) => {
    if (currentChapter === surahId && currentReciter.id === selectedReciter.id) {
      togglePlay();
    } else {
      playChapter(surahId, selectedReciter.id);
    }
  };

  const handleMainConsolePlay = () => {
    if (currentChapter) {
      togglePlay();
    } else {
      const targetSurah = lastListened?.chapterNumber || 1;
      playChapter(targetSurah, selectedReciter.id);
    }
  };

  const resumeLastReciter = lastListened
    ? QURAN_RECITERS.find((r) => r.id === lastListened.reciterId)
    : undefined;
  const resumeLastSurah = lastListened
    ? QURAN_SURAHS.find((s) => s.id === lastListened.chapterNumber)
    : undefined;

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation & Header */}
      <div className="mb-10">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-sm font-['Amiri',serif] text-[#064e3b] dark:text-[#dfbd69] hover:text-[#c5a059] transition-colors mb-6 cursor-pointer min-h-[40px]"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى الرئيسية</span>
        </button>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c6b2d] dark:text-[#c5a059] font-['Cinzel',serif] mb-2">
            <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
            <span>SACRED RECITATION SANCTUARY</span>
            <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69] leading-tight">
            استمع إلى القرآن الكريم
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
            تلاوات كاملة ومرتلة للسور بأصوات نخبة من كبار القراء وأئمة الحرمين، بتجربة استماع هادئة ومريحة للقلب.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#6d6253] dark:text-[#b8ad9c] font-['Amiri',serif]">
            <span>١٠ قراء معتمدين</span>
            <span aria-hidden="true">·</span>
            <span>١١٤ سورة كاملة</span>
            <span aria-hidden="true">·</span>
            <span>استمرار التلاوة في الخلفية</span>
          </div>
        </div>
      </div>

      {/* Main Audio Console (Focal Anchor) */}
      <section
        aria-label="المشغل الصوتي للقرآن الكريم"
        className="mb-12 rounded-2xl bg-gradient-to-br from-[#04281f] via-[#021e16] to-[#01140e] border border-[#c5a059]/35 p-6 sm:p-8 text-[#f5efe6] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-10 h-[2px] bg-gradient-to-r from-transparent via-[#dfbd69]/60 to-transparent" />

        {/* Audio Error Alert Banner (Honest unavailable notice, never wrong reciter fallback) */}
        {audioError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-amber-950/75 border border-amber-500/45 text-amber-100 text-sm font-['Amiri',serif] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <span>{audioError}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={retryCurrentChapter}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#dfbd69] text-[#021812] text-xs font-bold cursor-pointer hover:bg-[#f3e5ab] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
              <button
                type="button"
                onClick={clearAudioError}
                className="p-2 text-amber-200 hover:text-white cursor-pointer"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Active Track & Reciter Info */}
          <div className="lg:col-span-5 flex items-start sm:items-center gap-4">
            <ReciterEmblem reciter={activePlayerReciter} size="lg" isActive={isPlaying} />

            <div className="min-w-0 flex-1 space-y-1.5 text-right">
              <div className="flex items-center gap-2 text-xs text-[#c5a059] font-['Amiri',serif]">
                <Headphones className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {currentChapter
                    ? isPlaying
                      ? 'يُتلى الآن'
                      : 'جاهز للاستكمال'
                    : 'جاهز للتلاوة عند اختيارك'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] truncate">
                سورة {activeSurahMeta.name}
              </h2>

              <p className="text-sm font-semibold text-[#dfbd69] font-['Amiri',serif] truncate">
                {activePlayerReciter.name}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#b8ad9c] font-['Amiri',serif]">
                <span>{activeSurahMeta.type}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeSurahMeta.versesCount} آية</span>
                <span aria-hidden="true">·</span>
                <span>{activePlayerReciter.riwayah}</span>
              </div>

              {/* Action row: favorite reciter & open text */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleReciterFavorite(e, activePlayerReciter.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] border transition-colors cursor-pointer whitespace-nowrap ${
                    isFavoriteReciter(activePlayerReciter.id)
                      ? 'bg-[#dfbd69]/20 border-[#dfbd69] text-[#dfbd69]'
                      : 'bg-[#064e3b]/40 border-[#c5a059]/30 text-[#e4ded5] hover:border-[#dfbd69]'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFavoriteReciter(activePlayerReciter.id) ? 'fill-current text-[#dfbd69]' : ''
                    }`}
                  />
                  <span>
                    {isFavoriteReciter(activePlayerReciter.id) ? 'في المفضلة' : 'حفظ القارئ المفضل'}
                  </span>
                </button>

                {onOpenSurahInReader && (
                  <button
                    type="button"
                    onClick={() => onOpenSurahInReader(activeSurahMeta.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] bg-[#064e3b]/40 border border-[#c5a059]/25 text-[#e4ded5] hover:border-[#dfbd69] hover:text-[#dfbd69] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>قراءة السورة</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Controls & Scrubber */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Resume banner if idle and lastListened exists */}
            {!currentChapter && resumeLastReciter && resumeLastSurah && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#064e3b]/35 border border-[#c5a059]/25 text-xs font-['Amiri',serif]">
                <span className="text-[#e4ded5]">
                  آخر استماع محفوظ: <strong className="text-[#dfbd69]">سورة {resumeLastSurah.name}</strong> بصوت{' '}
                  {resumeLastReciter.shortName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReciterId(resumeLastReciter.id);
                    playChapter(resumeLastSurah.id, resumeLastReciter.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfbd69] text-[#021812] font-bold hover:bg-[#f3e5ab] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>استماع الآن</span>
                </button>
              </div>
            )}

            {/* Main Transport Buttons */}
            <div className="flex items-center justify-center sm:justify-between gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
                {/* Repeat */}
                <button
                  type="button"
                  onClick={toggleRepeat}
                  aria-label={isRepeating ? 'إلغاء تكرار السورة' : 'تكرار السورة'}
                  title={isRepeating ? 'إلغاء التكرار' : 'تكرار السورة'}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors cursor-pointer ${
                    isRepeating
                      ? 'bg-[#064e3b]/60 border-[#dfbd69] text-[#dfbd69]'
                      : 'bg-[#032018]/70 border-[#c5a059]/20 text-[#d4ccbf] hover:text-[#dfbd69] hover:border-[#dfbd69]/50'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Previous Surah */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentChapter) {
                      playPrevChapter();
                    } else if (activeSurahMeta.id > 1) {
                      playChapter(activeSurahMeta.id - 1, selectedReciter.id);
                    }
                  }}
                  disabled={activeSurahMeta.id <= 1}
                  aria-label="السورة السابقة"
                  title="السورة السابقة"
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#032018]/70 border border-[#c5a059]/20 text-[#e4ded5] hover:text-[#dfbd69] hover:border-[#dfbd69]/50 disabled:opacity-35 cursor-pointer transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Rewind 10s */}
                <button
                  type="button"
                  onClick={() => seekRelative(-10)}
                  disabled={!currentChapter || duration <= 0}
                  aria-label="تأخير ١٠ ثوانٍ"
                  title="تأخير ١٠ ثوانٍ"
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#032018]/70 border border-[#c5a059]/20 text-[#e4ded5] hover:text-[#dfbd69] hover:border-[#dfbd69]/50 disabled:opacity-35 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Primary Play/Pause */}
                <button
                  type="button"
                  onClick={handleMainConsolePlay}
                  disabled={isLoading}
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] text-[#021812] flex items-center justify-center shadow-lg shadow-[#c5a059]/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-[-1px]" />
                  )}
                </button>

                {/* Forward 10s */}
                <button
                  type="button"
                  onClick={() => seekRelative(10)}
                  disabled={!currentChapter || duration <= 0}
                  aria-label="تقديم ١٠ ثوانٍ"
                  title="تقديم ١٠ ثوانٍ"
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#032018]/70 border border-[#c5a059]/20 text-[#e4ded5] hover:text-[#dfbd69] hover:border-[#dfbd69]/50 disabled:opacity-35 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Next Surah */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentChapter) {
                      playNextChapter();
                    } else if (activeSurahMeta.id < 114) {
                      playChapter(activeSurahMeta.id + 1, selectedReciter.id);
                    }
                  }}
                  disabled={activeSurahMeta.id >= 114}
                  aria-label="السورة التالية"
                  title="السورة التالية"
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#032018]/70 border border-[#c5a059]/20 text-[#e4ded5] hover:text-[#dfbd69] hover:border-[#dfbd69]/50 disabled:opacity-35 cursor-pointer transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Control (Desktop & Mobile accessible) */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#032018]/70 border border-[#c5a059]/20 mx-auto sm:mx-0">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                  className="text-[#e4ded5] hover:text-[#dfbd69] cursor-pointer p-1"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  aria-label="التحكم في مستوى الصوت"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 sm:w-28 h-1.5 bg-[#064e3b] rounded-lg appearance-none cursor-pointer accent-[#dfbd69]"
                />
              </div>
            </div>

            {/* Progress Scrubber Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#dfbd69] tabular-nums shrink-0 min-w-[48px]">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  aria-label="شريط تقدم السورة"
                  min={0}
                  max={duration > 0 ? duration : 100}
                  value={duration > 0 ? currentTime : 0}
                  disabled={!currentChapter || duration <= 0}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-2 bg-[#064e3b]/70 rounded-lg appearance-none cursor-pointer accent-[#dfbd69] disabled:opacity-50"
                />
                <span className="text-xs font-mono text-[#b8ad9c] tabular-nums shrink-0 min-w-[48px] text-left">
                  {formatTime(duration)}
                </span>
              </div>
              <p className="text-xs text-[#a89e8f] font-['Amiri',serif] text-center sm:text-right">
                {currentChapter
                  ? 'يمكنك التنقل في أرجاء المنصة أو قفل شاشة الهاتف مع استمرار التلاوة في الخلفية.'
                  : 'اختر القارئ المفضل ثم اضغط على أي سورة أدناه لبدء الاستماع الكامل.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Reciters List (قائمة القراء) */}
      <section aria-label="قائمة القراء" className="mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
              ١. اختر القارئ
            </h2>
            <p className="text-sm text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif] mt-1">
              اختر قارئك المفضل لتصفح سور القرآن الكريم كاملة بصوته، مع إمكانية الحفظ في المفضلة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* All vs Favorites Filter */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#e9e2d4] dark:bg-[#032018] border border-[#c5a059]/25">
              <button
                type="button"
                onClick={() => setReciterFilter('all')}
                className={`px-3.5 py-2 rounded-lg text-xs font-['Amiri',serif] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  reciterFilter === 'all'
                    ? 'bg-[#064e3b] dark:bg-[#dfbd69] text-[#fbf9f5] dark:text-[#021812]'
                    : 'text-[#3c4a43] dark:text-[#d4ccbf] hover:text-[#064e3b] dark:hover:text-[#dfbd69]'
                }`}
              >
                جميع القراء ({QURAN_RECITERS.length})
              </button>
              <button
                type="button"
                onClick={() => setReciterFilter('favorites')}
                className={`px-3.5 py-2 rounded-lg text-xs font-['Amiri',serif] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  reciterFilter === 'favorites'
                    ? 'bg-[#064e3b] dark:bg-[#dfbd69] text-[#fbf9f5] dark:text-[#021812]'
                    : 'text-[#3c4a43] dark:text-[#d4ccbf] hover:text-[#064e3b] dark:hover:text-[#dfbd69]'
                }`}
              >
                المفضلة ({favoriteReciterIds.length})
              </button>
            </div>

            {/* Reciter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8c6b2d] dark:text-[#c5a059] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={reciterSearch}
                onChange={(e) => setReciterSearch(e.target.value)}
                placeholder="ابحث عن قارئ..."
                aria-label="ابحث عن قارئ"
                className="w-52 sm:w-60 pr-9 pl-3 py-2 rounded-xl bg-[#fbf9f5] dark:bg-[#032018] border border-[#c5a059]/30 text-sm font-['Amiri',serif] text-[#03241b] dark:text-[#f5efe6] placeholder:text-[#7c7161] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>
        </div>

        {filteredReciters.length === 0 ? (
          <div className="rounded-2xl bg-[#fbf9f5] dark:bg-[#032018] border border-[#c5a059]/25 p-10 text-center font-['Amiri',serif]">
            <p className="text-base text-[#064e3b] dark:text-[#dfbd69] font-semibold">
              {reciterFilter === 'favorites'
                ? 'لم تحفظ أي قارئ في المفضلة بعد.'
                : 'لم يتم العثور على قارئ مطابق لبحثك.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setReciterFilter('all');
                setReciterSearch('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#064e3b] dark:bg-[#dfbd69] text-[#fbf9f5] dark:text-[#021812] text-xs font-bold cursor-pointer"
            >
              عرض جميع القراء
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReciters.map((reciter) => {
              const isSelected = selectedReciter.id === reciter.id;
              const isPreferred = preferredReciterId === reciter.id;
              const isFav = isFavoriteReciter(reciter.id);
              const isCurrentlyPlayingThisReciter =
                Boolean(currentChapter) && currentReciter.id === reciter.id && isPlaying;

              return (
                <div
                  key={reciter.id}
                  className={`rounded-2xl bg-gradient-to-b from-[#04281f] via-[#022018] to-[#011610] text-[#f5efe6] border transition-all duration-200 p-5 flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#dfbd69] shadow-lg shadow-[#dfbd69]/15'
                      : 'border-[#c5a059]/25 hover:border-[#dfbd69]/60'
                  }`}
                >
                  <div>
                    {/* Top Row: Geometric Emblem + Identity + Favorite Action */}
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedReciterId(reciter.id)}
                        className="flex items-center gap-3.5 text-right flex-1 min-w-0 cursor-pointer group"
                      >
                        <ReciterEmblem reciter={reciter} size="md" isActive={isSelected} />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors truncate">
                            {reciter.name}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#c5a059] font-['Amiri',serif]">
                            <span>{reciter.style}</span>
                            <span aria-hidden="true">·</span>
                            <span>{reciter.riwayah}</span>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleToggleReciterFavorite(e, reciter.id)}
                        aria-label={isFav ? `إزالة ${reciter.name} من المفضلة` : `إضافة ${reciter.name} إلى المفضلة`}
                        title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors cursor-pointer ${
                          isFav
                            ? 'bg-[#dfbd69]/15 border-[#dfbd69] text-[#dfbd69]'
                            : 'bg-[#032018] border-[#c5a059]/25 text-[#a89e8f] hover:text-[#dfbd69] hover:border-[#dfbd69]/60'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Bio & Origin */}
                    <p className="mt-3 text-xs text-[#c5a059]/85 font-['Amiri',serif]">
                      {reciter.origin}
                    </p>
                    <p className="mt-1.5 text-sm text-[#d4ccbf] font-['Amiri',serif] leading-relaxed line-clamp-2">
                      {reciter.bio}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3.5 border-t border-[#c5a059]/15 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedReciterId(reciter.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-['Amiri',serif] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#dfbd69] text-[#021812]'
                          : 'bg-[#064e3b]/50 text-[#f5efe6] hover:bg-[#064e3b] border border-[#c5a059]/30'
                      }`}
                    >
                      {isSelected ? 'مختار حاليًا' : 'تصفح السور'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleSetPreferredOnly(e, reciter.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-['Amiri',serif] border transition-colors cursor-pointer whitespace-nowrap ${
                          isPreferred
                            ? 'border-[#dfbd69]/70 text-[#dfbd69] bg-[#dfbd69]/10'
                            : 'border-[#c5a059]/20 text-[#b8ad9c] hover:text-[#dfbd69]'
                        }`}
                        title="تعيين كالقارئ المفضل الافتراضي"
                      >
                        <Star className={`w-3.5 h-3.5 ${isPreferred ? 'fill-current' : ''}`} />
                        <span>{isPreferred ? 'القارئ المفضل' : 'تعيين كمفضل'}</span>
                      </button>

                      {currentChapter && currentReciter.id !== reciter.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReciterId(reciter.id);
                            playChapter(currentChapter, reciter.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-['Amiri',serif] bg-[#064e3b]/60 hover:bg-[#dfbd69] text-[#dfbd69] hover:text-[#021812] border border-[#c5a059]/30 transition-colors cursor-pointer whitespace-nowrap"
                          title={`تشغيل سورة ${activeSurahMeta.name} بصوت ${reciter.shortName}`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>استمع الآن</span>
                        </button>
                      )}

                      {isCurrentlyPlayingThisReciter && (
                        <span className="text-xs text-[#dfbd69] font-['Amiri',serif] font-semibold">
                          يتلو الآن
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Full 114 Surahs Selector for Selected Reciter */}
      <section aria-label="قائمة السور الكاملة" className="mb-12">
        <div className="rounded-2xl bg-[#fbf9f5] dark:bg-[#032018]/90 border border-[#c5a059]/30 p-5 sm:p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#c5a059]/20">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                ٢. اختر السورة للاستماع الكامل
              </h2>
              <p className="text-sm text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif] mt-1">
                السور الكاملة بصوت{' '}
                <strong className="text-[#064e3b] dark:text-[#dfbd69]">{selectedReciter.name}</strong> ·{' '}
                <span>{selectedReciter.sourceLabel}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Makki / Madani Tabs */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#efe8da] dark:bg-[#021812] border border-[#c5a059]/25">
                {(['all', 'مكية', 'مدنية'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSurahTypeFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      surahTypeFilter === tab
                        ? 'bg-[#064e3b] dark:bg-[#dfbd69] text-[#fbf9f5] dark:text-[#021812]'
                        : 'text-[#3c4a43] dark:text-[#d4ccbf] hover:text-[#064e3b] dark:hover:text-[#dfbd69]'
                    }`}
                  >
                    {tab === 'all' ? 'الكل (١١٤)' : tab}
                  </button>
                ))}
              </div>

              {/* Surah Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8c6b2d] dark:text-[#c5a059] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  placeholder="اسم السورة أو رقمها..."
                  aria-label="ابحث عن سورة بالاسم أو الرقم"
                  className="w-52 sm:w-64 pr-9 pl-3 py-2 rounded-xl bg-white dark:bg-[#021812] border border-[#c5a059]/30 text-sm font-['Amiri',serif] text-[#03241b] dark:text-[#f5efe6] placeholder:text-[#7c7161] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/* Quick Pick Featured Surahs */}
          <div className="py-4 border-b border-[#c5a059]/15 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#6d6253] dark:text-[#c5a059] font-['Amiri',serif] ml-1">
              مختارات سريعة:
            </span>
            {FEATURED_SURAH_IDS.map((sid) => {
              const s = QURAN_SURAHS.find((item) => item.id === sid);
              if (!s) return null;
              const isPlayingThis =
                currentChapter === s.id && currentReciter.id === selectedReciter.id && isPlaying;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlePlaySurahWithSelectedReciter(s.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Amiri',serif] border transition-colors cursor-pointer whitespace-nowrap ${
                    isPlayingThis
                      ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                      : 'bg-[#efe8da]/70 dark:bg-[#021812] border-[#c5a059]/25 text-[#064e3b] dark:text-[#e4ded5] hover:border-[#dfbd69]'
                  }`}
                >
                  {isPlayingThis ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>سورة {s.name}</span>
                </button>
              );
            })}
          </div>

          {/* 114 Surahs Grid */}
          {filteredSurahs.length === 0 ? (
            <div className="py-12 text-center font-['Amiri',serif] text-[#424d47] dark:text-[#d1c7b7]">
              لا توجد سورة مطابقة لبحثك.
            </div>
          ) : (
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSurahs.map((surah) => {
                const isSelectedTrack =
                  currentChapter === surah.id && currentReciter.id === selectedReciter.id;
                const isTrackPlaying = isSelectedTrack && isPlaying;
                const isTrackLoading = isSelectedTrack && isLoading;

                return (
                  <div
                    key={surah.id}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                      isSelectedTrack
                        ? 'bg-[#04281f] text-[#fbf9f5] border-[#dfbd69] shadow-md'
                        : 'bg-white/90 dark:bg-[#021812]/85 text-[#03241b] dark:text-[#f5efe6] border-[#c5a059]/25 hover:border-[#c5a059]/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold tabular-nums shrink-0 border ${
                          isSelectedTrack
                            ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]'
                            : 'bg-[#f4eee1] dark:bg-[#064e3b]/40 text-[#064e3b] dark:text-[#dfbd69] border-[#c5a059]/30'
                        }`}
                      >
                        {surah.id}
                      </div>

                      <div className="min-w-0">
                        <div
                          className={`text-base font-bold font-['Aref_Ruqaa',serif] truncate ${
                            isSelectedTrack ? 'text-[#dfbd69]' : 'text-[#03241b] dark:text-[#fbf9f5]'
                          }`}
                        >
                          سورة {surah.name}
                        </div>
                        <div
                          className={`flex items-center gap-1.5 text-xs font-['Amiri',serif] ${
                            isSelectedTrack ? 'text-[#d4ccbf]' : 'text-[#5b5347] dark:text-[#b8ad9c]'
                          }`}
                        >
                          <span>{surah.type}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{surah.versesCount} آية</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlaySurahWithSelectedReciter(surah.id)}
                      disabled={isTrackLoading}
                      aria-label={
                        isTrackPlaying
                          ? `إيقاف تلاوة سورة ${surah.name}`
                          : `تشغيل سورة ${surah.name} بصوت ${selectedReciter.shortName}`
                      }
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isTrackPlaying
                          ? 'bg-[#dfbd69] text-[#021812]'
                          : 'bg-[#064e3b] hover:bg-[#053b2d] dark:bg-[#064e3b]/70 dark:hover:bg-[#dfbd69] text-[#fbf9f5] dark:hover:text-[#021812]'
                      }`}
                    >
                      {isTrackLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isTrackPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Source & Usage Rights Notice */}
      <section
        aria-label="المصادر الصوتية وحقوق الاستخدام"
        className="rounded-2xl bg-[#fbf9f5] dark:bg-[#032018]/70 border border-[#c5a059]/25 p-5 sm:p-6 flex items-start gap-3.5"
      >
        <Info className="w-5 h-5 text-[#8c6b2d] dark:text-[#dfbd69] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm font-['Amiri',serif] text-[#424d47] dark:text-[#d1c7b7] leading-relaxed space-y-1">
          <p className="font-bold text-[#064e3b] dark:text-[#dfbd69]">
            توثيق المصادر الصوتية وحقوق الاستماع
          </p>
          <p>
            تُبث جميع التلاوات الكاملة مباشرة من المصادر القرآنية العامة الموثوقة (شبكة MP3Quran ومشروع Quran.com) المخصصة للاستماع الدعوي والشخصي المجاني دون أي إعلانات أو استغلال تجاري، مع التزام كل تسجيل باسم القارئ والسورة الصحيحين دون استبدال آلي بأصوات أخرى.
          </p>
        </div>
      </section>
    </div>
  );
};
