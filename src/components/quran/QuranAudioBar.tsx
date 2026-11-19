import React, { useState } from 'react';
import { useQuranAudio } from '../../context/QuranAudioContext';
import { AVAILABLE_RECITERS } from '../../services/quranApi';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Repeat, 
  X, 
  ChevronUp, 
  ChevronDown,
  Loader2,
  Headphones,
  AlertCircle,
  RefreshCw,
  Heart
} from 'lucide-react';

export const QuranAudioBar: React.FC = () => {
  const {
    currentChapter,
    currentChapterName,
    currentReciter,
    isPlaying,
    isLoading,
    audioError,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeating,
    togglePlay,
    retryCurrentChapter,
    clearAudioError,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    toggleRepeat,
    playNextChapter,
    playPrevChapter,
    changeReciter,
    toggleFavoriteReciter,
    setPreferredReciter,
    isFavoriteReciter,
    closePlayer,
  } = useQuranAudio();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!currentChapter) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 animate-fade-in-up">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#032018]/95 border border-[#dfbd69]/40 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 text-right cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center text-[#dfbd69]">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#fbf9f5] font-['Aref_Ruqaa',serif]">
                {currentChapterName}
              </div>
              <div className="text-[10px] text-[#c5a059] font-['Amiri',serif]">
                {currentReciter.name}
              </div>
            </div>
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-[#dfbd69] text-[#021812] flex items-center justify-center cursor-pointer hover:bg-[#f3e5ab] transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 text-slate-400 hover:text-[#dfbd69]"
            title="تكبير المشغل"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="مشغل التلاوة الصوتية للقرآن الكريم"
      className="fixed bottom-16 md:bottom-0 inset-x-0 z-40 bg-[#021812]/95 dark:bg-[#021812]/95 border-t border-[#c5a059]/30 shadow-2xl backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3 text-right"
    >
      {audioError && (
        <div
          role="alert"
          className="max-w-7xl mx-auto mb-2 px-3.5 py-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-100 text-xs font-['Amiri',serif] flex items-center justify-between gap-3 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{audioError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={retryCurrentChapter}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#dfbd69] text-[#021812] font-bold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة المحاولة</span>
            </button>
            <button
              type="button"
              onClick={clearAudioError}
              className="p-1 text-amber-200 hover:text-white cursor-pointer"
              aria-label="إخفاء رسالة الخطأ"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Left/Start: Chapter & Reciter Info + Reciter Selector */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b]/60 border border-[#c5a059]/40 flex items-center justify-center text-[#dfbd69] shrink-0">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Headphones className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-base font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                {currentChapterName}
              </div>
              {/* Reciter Selector & Quick Favorite Toggle */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  aria-label="اختيار القارئ"
                  value={currentReciter.id}
                  onChange={(e) => changeReciter(Number(e.target.value))}
                  className="bg-[#064e3b]/40 border border-[#c5a059]/30 rounded-lg px-2 py-0.5 text-[11px] font-['Amiri',serif] text-[#dfbd69] focus:outline-none focus:border-[#dfbd69] cursor-pointer max-w-[200px] truncate"
                >
                  {AVAILABLE_RECITERS.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#021812] text-[#fbf9f5]">
                      {r.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const fav = isFavoriteReciter(currentReciter.id);
                    toggleFavoriteReciter(currentReciter.id);
                    if (!fav) setPreferredReciter(currentReciter.id);
                  }}
                  aria-label={isFavoriteReciter(currentReciter.id) ? 'إزالة القارئ من المفضلة' : 'حفظ القارئ المفضل'}
                  title={isFavoriteReciter(currentReciter.id) ? 'قارئ مفضل' : 'حفظ القارئ في المفضلة'}
                  className={`p-1 rounded-md border transition-colors cursor-pointer ${
                    isFavoriteReciter(currentReciter.id)
                      ? 'border-[#dfbd69] text-[#dfbd69] bg-[#dfbd69]/15'
                      : 'border-[#c5a059]/25 text-slate-400 hover:text-[#dfbd69]'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${isFavoriteReciter(currentReciter.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick toggle minimize on mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg border border-[#c5a059]/20 text-[#c5a059] hover:text-[#dfbd69]"
              title="تصغير"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={closePlayer}
              className="p-1.5 rounded-lg border border-[#c5a059]/20 text-slate-400 hover:text-rose-400"
              title="إغلاق المشغل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Playback Controls & Timeline Scrubber */}
        <div className="flex flex-col items-center w-full max-w-xl">
          {/* Main Controls row */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* Repeat button */}
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isRepeating
                  ? 'text-[#dfbd69] bg-[#064e3b]/50 border border-[#dfbd69]/40'
                  : 'text-slate-400 hover:text-[#dfbd69]'
              }`}
              title={isRepeating ? 'إلغاء التكرار' : 'تكرار السورة'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Previous Chapter */}
            <button
              onClick={playPrevChapter}
              disabled={!currentChapter || currentChapter <= 1}
              className="p-2 text-slate-300 hover:text-[#dfbd69] disabled:opacity-30 cursor-pointer"
              title="السورة السابقة"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Rewind 10 seconds */}
            <button
              onClick={() => seekRelative(-10)}
              className="p-2 text-slate-300 hover:text-[#dfbd69] cursor-pointer"
              title="تأخير 10 ثوانٍ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] text-[#021812] flex items-center justify-center shadow-lg shadow-[#c5a059]/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-[-1px]" />
              )}
            </button>

            {/* Forward 10 seconds */}
            <button
              onClick={() => seekRelative(10)}
              className="p-2 text-slate-300 hover:text-[#dfbd69] cursor-pointer"
              title="تقديم 10 ثوانٍ"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Next Chapter */}
            <button
              onClick={playNextChapter}
              disabled={!currentChapter || currentChapter >= 114}
              className="p-2 text-slate-300 hover:text-[#dfbd69] disabled:opacity-30 cursor-pointer"
              title="السورة التالية"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber Timeline */}
          <div className="w-full flex items-center gap-3 mt-1.5">
            <span className="text-[11px] font-mono text-[#c5a059] tabular-nums shrink-0">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              aria-label="تقدم التلاوة"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1.5 bg-[#064e3b]/50 rounded-lg appearance-none cursor-pointer accent-[#dfbd69]"
            />

            <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right/End: Volume & Player Window Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Volume slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-300 hover:text-[#dfbd69] cursor-pointer"
              title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              aria-label="مستوى الصوت"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1 bg-[#064e3b]/60 rounded-lg appearance-none cursor-pointer accent-[#dfbd69]"
              title="مستوى الصوت"
            />
          </div>

          {/* Minimize button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-lg border border-[#c5a059]/20 text-[#c5a059] hover:text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer"
            title="تصغير شريط المشغل"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            onClick={closePlayer}
            className="p-2 rounded-lg border border-[#c5a059]/20 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
            title="إغلاق المشغل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
