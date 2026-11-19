import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AYAHS_OF_DAY, type Ayah } from '../data/islamicContent';
import { IslamicStar, IslamicDivider } from './IslamicMotifs';
import { Volume2, VolumeX, Copy, Check, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import {
  fetchDailyPlatformBundle,
  formatArabicUpdateTimestamp,
} from '../services/platformApi';

export const AyahOfTheDay: React.FC<{ onExploreQuran?: () => void }> = ({ onExploreQuran }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [isOfflineBackup, setIsOfflineBackup] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;
    fetchDailyPlatformBundle().then((bundle) => {
      if (!active || !bundle?.ayah?.payload) return;
      const p = bundle.ayah.payload;
      setDailyAyah({
        id: 0,
        surahName: p.surahName,
        surahNumber: p.surahNumber,
        ayahNumber: p.ayahNumber,
        text: p.text,
        theme: p.theme,
        audioUrl: p.audioUrl,
        reflection: p.reflection,
      });
      setLastUpdatedAt(bundle.ayah.fetchedAt || bundle.lastSuccessfulUpdate);
      setIsOfflineBackup(Boolean(bundle.fromOfflineBackup));
    });
    return () => {
      active = false;
    };
  }, []);

  const ayahsList = useMemo(() => {
    if (!dailyAyah) return AYAHS_OF_DAY;
    const filtered = AYAHS_OF_DAY.filter(
      (a) => !(a.surahNumber === dailyAyah.surahNumber && a.ayahNumber === dailyAyah.ayahNumber)
    );
    return [dailyAyah, ...filtered];
  }, [dailyAyah]);

  const currentAyah = ayahsList[currentIndex] || AYAHS_OF_DAY[0];

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio play error:', e);
        setIsPlaying(false);
      });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleCopy = () => {
    const textToCopy = `﴿ ${currentAyah.text} ﴾ [${currentAyah.surahName}: ${currentAyah.ayahNumber}] - منصة سَكِينَة`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNext = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentIndex((prev) => (prev + 1) % ayahsList.length);
  };

  const handlePrev = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentIndex((prev) => (prev - 1 + ayahsList.length) % ayahsList.length);
  };

  return (
    <section id="ayah-section" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hidden audio element for verified recitation */}
      {currentAyah.audioUrl && (
        <audio
          ref={audioRef}
          src={currentAyah.audioUrl}
          onEnded={handleAudioEnded}
          preload="none"
        />
      )}

      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c6b2d] dark:text-[#c5a059] font-['Cinzel',serif] mb-2">
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
          <span>DAILY NOBLE AYAH</span>
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
          آية اليوم
        </h2>
        <p className="mt-2 text-sm text-[#424d47] dark:text-[#c7beaf] font-['Amiri',serif]">
          قبس قرآني كريم يضيء يومك بالسكينة والاطمئنان
        </p>
        {lastUpdatedAt && (
          <p className="mt-1 text-xs text-[#8c6b2d] dark:text-[#c5a059]/85 font-['Amiri',serif] tabular-nums">
            آخر تحديث ناجح: {formatArabicUpdateTimestamp(lastUpdatedAt)}
            {isOfflineBackup ? ' · نسخة محفوظة لوضع عدم الاتصال' : ''}
          </p>
        )}
      </div>

      {/* Main Luxury Manuscript Plaque */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#04281f] via-[#022018] to-[#011812] border border-[#c5a059]/30 p-6 sm:p-10 shadow-2xl overflow-hidden transition-all duration-300">
        {/* Subtle Arch Top Glow & Watermark Frame */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#dfbd69] to-transparent" />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#c5a059]/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#064e3b]/20 blur-3xl pointer-events-none" />

        {/* Top Plaque Meta Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-[#c5a059]/15 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-xs font-bold text-[#dfbd69]">
              {currentAyah.ayahNumber}
            </span>
            <div>
              <span className="text-base font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                {currentAyah.surahName}
              </span>
              <span className="text-xs text-[#c5a059] block -mt-1 font-['Amiri',serif]">
                الآية {currentAyah.ayahNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-[#064e3b]/30 border border-[#c5a059]/20 text-[#e4ded5] font-['Amiri',serif]">
              {currentAyah.theme}
            </span>
          </div>
        </div>

        {/* The Noble Quranic Text */}
        <div className="py-10 sm:py-14 text-center px-2 sm:px-6">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Amiri_Quran','Amiri',serif] leading-[2.2] sm:leading-[2.4] text-[#fbf9f5] select-text">
            ﴿ {currentAyah.text} ﴾
          </div>

          <IslamicDivider className="my-6 opacity-60" />

          {/* Reflection commentary note */}
          <div className="max-w-xl mx-auto text-sm sm:text-base text-[#d6cdbf] font-['Amiri',serif] italic leading-relaxed">
            <span className="text-[#dfbd69] font-bold not-italic ml-1">تدبر:</span>
            {currentAyah.reflection}
          </div>
        </div>

        {/* Bottom Interactive Controls */}
        <div className="pt-6 border-t border-[#c5a059]/15 flex items-center justify-between flex-wrap gap-4">
          {/* Audio Recitation & Copy Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                  : 'bg-[#032018]/80 text-[#dfbd69] border-[#c5a059]/30 hover:border-[#dfbd69] hover:bg-[#064e3b]/30'
              }`}
              title="الاستماع لتلاوة مباركة بصوت الشيخ مشاري العفاسي"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 animate-pulse" />
                  <span>إيقاف التلاوة</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>استمع للتلاوة</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] bg-[#032018]/80 text-[#d1c7b7] border border-[#c5a059]/20 hover:text-[#dfbd69] hover:border-[#c5a059]/40 transition-colors cursor-pointer"
              title="نسخ نص الآية مع المصدر"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الآية</span>
                </>
              )}
            </button>
          </div>

          {/* Ayah Navigation Slider Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg border border-[#c5a059]/25 text-[#dfbd69] hover:bg-[#064e3b]/40 hover:border-[#c5a059] transition-colors cursor-pointer"
              aria-label="الآية السابقة"
              title="الآية السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-[#c5a059] px-2 tabular-nums">
              {currentIndex + 1} / {ayahsList.length}
            </span>

            <button
              onClick={handleNext}
              className="p-2 rounded-lg border border-[#c5a059]/25 text-[#dfbd69] hover:bg-[#064e3b]/40 hover:border-[#c5a059] transition-colors cursor-pointer"
              aria-label="الآية التالية"
              title="الآية التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {onExploreQuran && (
              <button
                onClick={onExploreQuran}
                className="mr-2 hidden sm:flex items-center gap-1.5 text-xs text-[#dfbd69] hover:text-[#f3e5ab] font-['Amiri',serif] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>المصحف الشريف</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
