import React, { useState, useRef, useEffect } from 'react';
import { 
  SAMPLE_SURAHS, 
  SAMPLE_HADITHS, 
  SAMPLE_DUAS, 
  DHIKR_ITEMS,
  SurahPreview
} from '../data/islamicContent';
import { IslamicStar, IslamicDivider } from './IslamicMotifs';
import { 
  X, 
  Play, 
  Pause, 
  Check, 
  Copy, 
  Compass, 
  BookOpen, 
  HeartHandshake, 
  ScrollText, 
  Clock, 
  Navigation,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface SectionModalProps {
  sectionId: string | null;
  onClose: () => void;
}

export const SectionModal: React.FC<SectionModalProps> = ({ sectionId, onClose }) => {
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [adhkarCounts, setAdhkarCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!sectionId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sectionId, onClose]);

  if (!sectionId) return null;

  const handlePlaySurah = (surah: SurahPreview) => {
    if (playingSurah === surah.number) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSurah(null);
    } else {
      setPlayingSurah(surah.number);
      if (audioRef.current) {
        audioRef.current.src = surah.audioUrl;
        audioRef.current.play().catch(e => console.error(e));
      }
    }
  };

  const handleIncrementAdhkar = (id: string) => {
    setAdhkarCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleResetAdhkar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAdhkarCounts(prev => ({
      ...prev,
      [id]: 0
    }));
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderContent = () => {
    switch (sectionId) {
      case 'quran':
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#064e3b]/30 border border-[#c5a059]/20 text-center">
              <span className="text-xs uppercase tracking-widest text-[#dfbd69] font-['Cinzel',serif] block mb-1">
                HOLY QURAN AUDIOTHEQUE
              </span>
              <p className="text-sm font-['Amiri',serif] text-[#fbf9f5]">
                نماذج من السور المباركة برواية حفص عن عاصم بصوت الشيخ مشاري راشد العفاسي
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_SURAHS.map((surah) => {
                const isPlaying = playingSurah === surah.number;
                return (
                  <div
                    key={surah.number}
                    className="p-5 rounded-2xl bg-[#032018] border border-[#c5a059]/25 hover:border-[#dfbd69] transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center font-bold text-sm text-[#dfbd69]">
                        {surah.number}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                          سورة {surah.name}
                        </h4>
                        <div className="text-xs text-[#c5a059] font-['Amiri',serif] flex items-center gap-2">
                          <span>{surah.revelationType}</span>
                          <span>•</span>
                          <span>{surah.ayahCount} آية</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlaySurah(surah)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]'
                          : 'bg-[#064e3b]/40 text-[#dfbd69] border-[#c5a059]/30 hover:bg-[#dfbd69] hover:text-[#021812]'
                      }`}
                      aria-label={`تلاوة سورة ${surah.name}`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'adhkar':
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#064e3b]/30 border border-[#c5a059]/20 text-center">
              <span className="text-xs uppercase tracking-widest text-[#dfbd69] font-['Cinzel',serif] block mb-1">
                FORTRESS OF THE BELIEVER
              </span>
              <p className="text-sm font-['Amiri',serif] text-[#fbf9f5]">
                الأذكار اليومية المأثورة مع عداد تفاعلي لحفظ الأوراد والأجر
              </p>
            </div>

            <div className="space-y-4">
              {DHIKR_ITEMS.map((item) => {
                const count = adhkarCounts[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleIncrementAdhkar(item.id)}
                    className="p-5 rounded-2xl bg-[#032018] border border-[#c5a059]/25 hover:border-[#dfbd69] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none"
                  >
                    <div className="flex-1">
                      <div className="text-lg font-['Amiri_Quran',serif] text-[#fbf9f5] leading-relaxed">
                        {item.text}
                      </div>
                      <div className="text-xs text-[#dfbd69] font-['Amiri',serif] mt-1">
                        {item.merit}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        onClick={(e) => handleResetAdhkar(item.id, e)}
                        className="p-2 rounded-lg text-slate-400 hover:text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors"
                        title="إعادة ضبط العداد"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <div className="px-4 py-2 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 text-center min-w-[70px]">
                        <span className="text-lg font-mono font-bold text-[#dfbd69] tabular-nums block">
                          {count}
                        </span>
                        <span className="text-[10px] text-[#b8ad9c] font-['Amiri',serif]">
                          / {item.targetCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'duas':
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#064e3b]/30 border border-[#c5a059]/20 text-center">
              <span className="text-xs uppercase tracking-widest text-[#dfbd69] font-['Cinzel',serif] block mb-1">
                COMPREHENSIVE SUPPLICATIONS
              </span>
              <p className="text-sm font-['Amiri',serif] text-[#fbf9f5]">
                أدعية مأثورة من القرآن الكريم والسنة النبوية الصحيحة
              </p>
            </div>

            <div className="space-y-4">
              {SAMPLE_DUAS.map((dua) => (
                <div
                  key={dua.id}
                  className="p-6 rounded-2xl bg-[#032018] border border-[#c5a059]/25 hover:border-[#dfbd69]/60 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#064e3b]/40 border border-[#c5a059]/30 text-[#dfbd69] font-['Amiri',serif]">
                      {dua.category}
                    </span>
                    <button
                      onClick={() => handleCopyText(`dua-${dua.id}`, dua.text)}
                      className="flex items-center gap-1.5 text-xs text-[#c5a059] hover:text-[#dfbd69] transition-colors"
                    >
                      {copiedId === `dua-${dua.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-['Amiri',serif]">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="font-['Amiri',serif]">نسخ الدعاء</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h4 className="text-base font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69] mb-2">
                    {dua.title}
                  </h4>
                  <p className="text-base font-['Amiri',serif] text-[#fbf9f5] leading-relaxed mb-3">
                    « {dua.text} »
                  </p>
                  <div className="text-xs text-[#b8ad9c] font-['Amiri',serif] pt-2 border-t border-[#c5a059]/15">
                    المصدر: {dua.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'hadith':
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#064e3b]/30 border border-[#c5a059]/20 text-center">
              <span className="text-xs uppercase tracking-widest text-[#dfbd69] font-['Cinzel',serif] block mb-1">
                PROPHETIC TRADITIONS
              </span>
              <p className="text-sm font-['Amiri',serif] text-[#fbf9f5]">
                أحاديث صحيحة من مشكاة النبوة الشريفة تفيض بالحكمة والسكينة
              </p>
            </div>

            <div className="space-y-4">
              {SAMPLE_HADITHS.map((hadith) => (
                <div
                  key={hadith.id}
                  className="p-6 rounded-2xl bg-[#032018] border border-[#c5a059]/25 hover:border-[#dfbd69]/60 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#064e3b]/40 border border-[#c5a059]/30 text-[#dfbd69] font-['Amiri',serif]">
                      {hadith.topic}
                    </span>
                    <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
                      درجة الحديث: {hadith.grade}
                    </span>
                  </div>

                  <p className="text-base font-['Amiri',serif] text-[#fbf9f5] leading-relaxed mb-4">
                    « {hadith.matn} »
                  </p>

                  <div className="pt-3 border-t border-[#c5a059]/15 flex items-center justify-between text-xs text-[#b8ad9c] font-['Amiri',serif]">
                    <span>الراوي: {hadith.narrator}</span>
                    <span className="text-[#dfbd69]">{hadith.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'prayer':
      case 'qibla':
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#064e3b]/30 border border-[#c5a059]/20 text-center">
              <span className="text-xs uppercase tracking-widest text-[#dfbd69] font-['Cinzel',serif] block mb-1">
                QIBLA & PRAYER DIRECTION
              </span>
              <p className="text-sm font-['Amiri',serif] text-[#fbf9f5]">
                بوصلة إرشادية وتوجيه دقيق نحو الكعبة المشرفة في مكة المكرمة
              </p>
            </div>

            {/* Interactive Qibla Compass Dial */}
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#032018] border border-[#c5a059]/25">
              <div className="relative w-64 h-64 rounded-full border-4 border-[#c5a059]/30 flex items-center justify-center p-4 bg-gradient-to-b from-[#064e3b]/40 to-[#021812] shadow-2xl">
                
                {/* Compass Dial markings */}
                <div className="absolute top-2 text-xs font-bold text-[#dfbd69]">الشمال (N)</div>
                <div className="absolute bottom-2 text-xs font-bold text-[#c5a059]/60">الجنوب (S)</div>
                <div className="absolute left-2 text-xs font-bold text-[#c5a059]/60">الغرب (W)</div>
                <div className="absolute right-2 text-xs font-bold text-[#c5a059]/60">الشرق (E)</div>

                {/* Compass Needle pointing to Kaaba angle (~136 deg example) */}
                <div 
                  className="w-1.5 h-44 bg-gradient-to-t from-transparent via-[#dfbd69] to-[#fbf9f5] rounded-full shadow-lg transition-transform duration-700"
                  style={{ transform: 'rotate(136deg)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-[#dfbd69] -mt-1 -ml-1.5 border-2 border-[#021812]" />
                </div>

                {/* Kaaba Center Marker */}
                <div className="absolute w-12 h-12 rounded-xl bg-[#021812] border-2 border-[#dfbd69] flex items-center justify-center shadow-lg">
                  <IslamicStar size={20} className="text-[#dfbd69]" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                  زاوية القبلة المقدرة: ١٣٦° جنوب شرق
                </div>
                <p className="text-xs text-[#b8ad9c] font-['Amiri',serif] mt-1">
                  إحداثيات الكعبة المشرفة: 21.4225° N, 39.8262° E
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    switch (sectionId) {
      case 'quran': return 'القرآن الكريم';
      case 'adhkar': return 'الأذكار اليومية';
      case 'duas': return 'الأدعية المأثورة';
      case 'hadith': return 'الأحاديث النبوية';
      case 'prayer': return 'مواقيت الصلاة';
      case 'qibla': return 'اتجاه القبلة';
      default: return 'سَكِينَة';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={getSectionTitle()}
    >
      {/* Hidden audio element for Surah preview playback */}
      <audio ref={audioRef} onEnded={() => setPlayingSurah(null)} preload="none" />

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-[#04281f] via-[#022018] to-[#01140e] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#c5a059]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
              <IslamicStar size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                {getSectionTitle()}
              </h3>
              <span className="text-xs text-[#c5a059]/80 font-['Cinzel',serif] uppercase tracking-wider">
                SAKINAH SANCTUARY
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#e4ded5] hover:text-[#dfbd69] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto py-6 pr-1 pl-1 space-y-4 max-h-[calc(90vh-160px)]">
          {renderContent()}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-4 border-t border-[#c5a059]/15 flex items-center justify-between text-xs text-[#c5a059]/75 font-['Amiri',serif]">
          <span>منصة سَكِينَة • محتوى موثق ومراجع</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#c5a059]/30 text-[#fbf9f5] hover:bg-[#064e3b]/40 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
