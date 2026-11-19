import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Bookmark,
  ArrowLeft,
  Check,
} from 'lucide-react';
import {
  fetchDailyPlatformBundle,
  formatArabicUpdateTimestamp,
  type DailyAdhkarPayload,
  type DailyDuaPayload,
} from '../services/platformApi';

interface DailyWirdCardProps {
  onNavigateToAdhkar: (tab?: 'directory' | 'tasbeeh' | 'duas' | 'morning' | 'evening') => void;
}

export const DailyWirdCard: React.FC<DailyWirdCardProps> = ({ onNavigateToAdhkar }) => {
  const [completedMorning, setCompletedMorning] = useState(false);
  const [completedEvening, setCompletedEvening] = useState(false);
  const [dailyDhikr, setDailyDhikr] = useState<DailyAdhkarPayload | null>(null);
  const [dailyDua, setDailyDua] = useState<DailyDuaPayload | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  // Read local progress & daily curated dhikr/dua gently
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const morningSaved = localStorage.getItem(`sakinah_wird_morning_${today}`);
      const eveningSaved = localStorage.getItem(`sakinah_wird_evening_${today}`);
      if (morningSaved === 'true') setCompletedMorning(true);
      if (eveningSaved === 'true') setCompletedEvening(true);
    } catch {
      // Storage access
    }

    let active = true;
    fetchDailyPlatformBundle().then((bundle) => {
      if (!active || !bundle) return;
      if (bundle.adhkar?.payload) setDailyDhikr(bundle.adhkar.payload);
      if (bundle.dua?.payload) setDailyDua(bundle.dua.payload);
      setLastUpdatedAt(bundle.adhkar?.fetchedAt || bundle.lastSuccessfulUpdate);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-r from-[#03241b] via-[#021c15] to-[#03241b] border border-[#c5a059]/30 p-6 sm:p-10 shadow-xl overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-[#dfbd69] to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#c5a059]/15 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022018] border border-[#c5a059]/40 flex items-center justify-center text-[#dfbd69] shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                  وردك اليوم
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#064e3b]/40 text-[#dfbd69] border border-[#c5a059]/25 font-['Amiri',serif]">
                  زاد القلوب
                </span>
              </div>
              <p className="text-xs text-[#c5a059] font-['Amiri',serif] mt-0.5">
                خطوات يسيرة تعينك على ذكر الله في غدوك ورواحك بسكينة واطمئنان
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToAdhkar('directory')}
            className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-['Amiri',serif] font-bold text-[#dfbd69] hover:text-[#f3e5ab] border border-[#c5a059]/30 hover:border-[#dfbd69] bg-[#064e3b]/30 hover:bg-[#064e3b]/50 transition-all cursor-pointer group"
          >
            <span>عرض كافة الأذكار والأدعية</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* Card 1: Morning Adhkar */}
          <button
            type="button"
            onClick={() => onNavigateToAdhkar('morning')}
            className="p-5 rounded-2xl bg-[#021812] border border-[#c5a059]/20 hover:border-[#dfbd69]/70 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-0.5 text-right w-full"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b]/40 flex items-center justify-center text-[#dfbd69] group-hover:scale-110 transition-transform">
                  <Sun className="w-5 h-5" />
                </div>
                {completedMorning && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-['Amiri',serif]">
                    <Check className="w-3.5 h-3.5" />
                    <span>مكتمل</span>
                  </span>
                )}
              </div>
              <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                أذكار الصباح
              </h4>
              <p className="text-xs text-[#d1c7b7] font-['Amiri',serif] mt-1 line-clamp-2">
                بركة البكور وحفظ النفس إلى المساء
              </p>
            </div>
            <div className="w-full mt-4 pt-3 border-t border-[#c5a059]/10 flex items-center justify-between text-xs text-[#dfbd69] font-['Amiri',serif]">
              <span>بدء الورد</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Evening Adhkar */}
          <button
            type="button"
            onClick={() => onNavigateToAdhkar('evening')}
            className="p-5 rounded-2xl bg-[#021812] border border-[#c5a059]/20 hover:border-[#dfbd69]/70 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-0.5 text-right w-full"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b]/40 flex items-center justify-center text-[#dfbd69] group-hover:scale-110 transition-transform">
                  <Moon className="w-5 h-5" />
                </div>
                {completedEvening && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-['Amiri',serif]">
                    <Check className="w-3.5 h-3.5" />
                    <span>مكتمل</span>
                  </span>
                )}
              </div>
              <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                أذكار المساء
              </h4>
              <p className="text-xs text-[#d1c7b7] font-['Amiri',serif] mt-1 line-clamp-2">
                سكينة الغروب وحفظ الليلة من كل سوء
              </p>
            </div>
            <div className="w-full mt-4 pt-3 border-t border-[#c5a059]/10 flex items-center justify-between text-xs text-[#dfbd69] font-['Amiri',serif]">
              <span>بدء الورد</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Daily Digital Tasbeeh */}
          <button
            type="button"
            onClick={() => onNavigateToAdhkar('tasbeeh')}
            className="p-5 rounded-2xl bg-[#021812] border border-[#c5a059]/20 hover:border-[#dfbd69]/70 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-0.5 text-right w-full"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b]/40 flex items-center justify-center text-[#dfbd69] group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-[#c5a059] font-['Amiri',serif]">
                  بيد واحدة
                </span>
              </div>
              <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                المسبحة الرقمية
              </h4>
              <p className="text-xs text-[#d1c7b7] font-['Amiri',serif] mt-1 line-clamp-2">
                تسبيح واستغفار مريح بعداد تفاعلي هادئ
              </p>
            </div>
            <div className="w-full mt-4 pt-3 border-t border-[#c5a059]/10 flex items-center justify-between text-xs text-[#dfbd69] font-['Amiri',serif]">
              <span>فتح المسبحة</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Favorite Duas */}
          <button
            type="button"
            onClick={() => onNavigateToAdhkar('duas')}
            className="p-5 rounded-2xl bg-[#021812] border border-[#c5a059]/20 hover:border-[#dfbd69]/70 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-0.5 text-right w-full"
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#064e3b]/40 flex items-center justify-center text-[#dfbd69] group-hover:scale-110 transition-transform">
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-[#c5a059] font-['Amiri',serif]">
                  كتاب وسنة
                </span>
              </div>
              <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                مكتبة الأدعية
              </h4>
              <p className="text-xs text-[#d1c7b7] font-['Amiri',serif] mt-1 line-clamp-2">
                جوامع الدعاء المستجاب في شتى الأحوال
              </p>
            </div>
            <div className="w-full mt-4 pt-3 border-t border-[#c5a059]/10 flex items-center justify-between text-xs text-[#dfbd69] font-['Amiri',serif]">
              <span>تصفح الأدعية</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        {(dailyDhikr || dailyDua) && (
          <div className="mt-6 pt-5 border-t border-[#c5a059]/15 grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
            {dailyDhikr && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#c5a059] font-['Amiri',serif]">
                  <span>مختار اليوم من الأذكار</span>
                  <span aria-hidden="true">·</span>
                  <span>{dailyDhikr.categoryTitle}</span>
                </div>
                <p className="text-sm font-['Amiri',serif] text-[#fbf9f5] leading-relaxed">
                  «{dailyDhikr.text}»
                </p>
                <p className="text-[11px] text-[#a89e8f] font-['Amiri',serif]">
                  المصدر: {dailyDhikr.source}
                </p>
              </div>
            )}

            {dailyDua && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#c5a059] font-['Amiri',serif]">
                  <span>مختار اليوم من الأدعية</span>
                  <span aria-hidden="true">·</span>
                  <span>{dailyDua.title}</span>
                </div>
                <p className="text-sm font-['Amiri',serif] text-[#fbf9f5] leading-relaxed">
                  «{dailyDua.text}»
                </p>
                <p className="text-[11px] text-[#a89e8f] font-['Amiri',serif]">
                  المصدر: {dailyDua.source}
                  {lastUpdatedAt ? ` · آخر تحديث ناجح: ${formatArabicUpdateTimestamp(lastUpdatedAt)}` : ''}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
