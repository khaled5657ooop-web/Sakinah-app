import React, { useState, useEffect } from 'react';
import { AVAILABLE_TAFSIRS, TafsirInfo, fetchTafsir } from '../../services/quranApi';
import { IslamicStar } from '../IslamicMotifs';
import { X, BookOpen, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

interface TafsirModalProps {
  verseKey: string | null; // e.g. "2:255"
  surahName: string;
  verseText: string;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  verseKey,
  surahName,
  verseText,
  onClose,
}) => {
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(16); // Default: Tafsir Muyassar
  const [retryNonce, setRetryNonce] = useState(0);
  const [tafsirData, setTafsirData] = useState<{ text: string; source: string; tafsirName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!verseKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [verseKey, onClose]);

  useEffect(() => {
    if (!verseKey) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchTafsir(verseKey, selectedTafsirId)
      .then((res) => {
        if (isMounted) {
          setTafsirData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'تعذر تحميل التفسير في الوقت الحالي.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [verseKey, selectedTafsirId, retryNonce]);

  if (!verseKey) return null;

  const parts = verseKey.split(':');
  const ayahNumber = parts[1] || '';

  const handleCopy = () => {
    if (!tafsirData) return;
    const fullText = `تفسير الآية: ﴿${verseText}﴾ [${surahName}: ${ayahNumber}]\n\nكتاب التفسير: ${tafsirData.tafsirName}\nالمصدر: ${tafsirData.source}\n\nنص التفسير:\n${tafsirData.text}\n\n- منصة سَكِينَة`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="نافذة تفسير الآية"
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                تفسير وتدبر الآية الكريمة
              </h3>
              <p className="text-xs text-[#c5a059]/80 font-['Amiri',serif]">
                {surahName} • الآية {ayahNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#e4ded5] hover:text-[#dfbd69] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق التفسير"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verse Highlight Card */}
        <div className="mt-4 p-5 rounded-2xl bg-[#021812] border border-[#c5a059]/20 text-center">
          <div className="text-xl sm:text-2xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-relaxed">
            ﴿ {verseText} ﴾
          </div>
          <div className="text-xs text-[#c5a059] font-['Amiri',serif] mt-2">
            [{surahName}: الآية {ayahNumber}]
          </div>
        </div>

        {/* Tafsir Source Selector */}
        <div className="mt-5">
          <label className="block text-xs font-['Amiri',serif] text-[#dfbd69] mb-2 font-medium">
            اختر كتاب التفسير المعتمد:
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAFSIRS.map((t: TafsirInfo) => (
              <button
                key={t.id}
                onClick={() => setSelectedTafsirId(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                  selectedTafsirId === t.id
                    ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-md shadow-[#c5a059]/20'
                    : 'bg-[#064e3b]/30 text-[#d4ccbf] border border-[#c5a059]/20 hover:border-[#dfbd69]/40'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tafsir Body Content */}
        <div className="overflow-y-auto my-5 p-4 sm:p-6 rounded-2xl bg-[#032018]/60 border border-[#c5a059]/15 flex-grow min-h-[160px] max-h-[320px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#dfbd69]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-['Amiri',serif]">جارٍ تحميل التفسير الموثق من المصدر...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-rose-300 text-center">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <span className="text-sm font-['Amiri',serif]">{error}</span>
              <button
                onClick={() => setRetryNonce(n => n + 1)}
                className="mt-2 px-3 py-1 text-xs rounded border border-rose-400/40 text-rose-200 hover:bg-rose-950/30 cursor-pointer"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : tafsirData ? (
            <div className="space-y-4">
              <div className="text-xs text-[#c5a059] font-['Amiri',serif] pb-2 border-b border-[#c5a059]/15 flex items-center justify-between">
                <span>الكتاب: <strong className="text-[#fbf9f5]">{tafsirData.tafsirName}</strong></span>
                <span className="text-[11px] text-[#b8ad9c]">{tafsirData.source}</span>
              </div>
              <p className="text-base sm:text-lg font-['Amiri',serif] text-[#fbf9f5] leading-relaxed select-text whitespace-pre-line">
                {tafsirData.text}
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#c5a059]/20 flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={!tafsirData || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-['Amiri',serif] bg-[#064e3b]/40 border border-[#c5a059]/30 hover:border-[#dfbd69] text-[#dfbd69] hover:bg-[#064e3b]/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">تم نسخ التفسير</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ التفسير والمصدر</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-['Amiri',serif] bg-[#dfbd69] text-[#021812] font-bold hover:bg-[#f3e5ab] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
