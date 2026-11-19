import React from 'react';
import { usePrayer } from '../../context/PrayerContext';
import { HIJRI_MONTHS_AR } from '../../data/prayerLocations';
import { IslamicStar } from '../IslamicMotifs';
import { Calendar, Moon, Info } from 'lucide-react';

export const IslamicCalendarCard: React.FC = () => {
  const { todayData, occasions, occasionsLoading, loading } = usePrayer();

  const currentHijriMonth = todayData?.hijri.monthNumber ?? 0;
  const currentHijriDay = todayData?.hijri.day ?? 0;
  const currentHijriYear = todayData?.hijri.year;

  return (
    <div className="space-y-6">
      {/* Today's Hijri & Gregorian Date Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#04281f] via-[#022018] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#c5a059]/20">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#c5a059]">
              <Moon className="w-3.5 h-3.5 text-[#dfbd69]" />
              <span>ISLAMIC HIJRI CALENDAR</span>
            </div>

            {loading || !todayData ? (
              <div className="h-10 w-64 rounded-xl bg-[#064e3b]/30 animate-pulse" />
            ) : (
              <>
                <h3 className="text-2xl sm:text-4xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                  {todayData.hijri.formattedAr}
                </h3>
                <p className="text-sm sm:text-base font-['Amiri',serif] text-[#dfbd69]">
                  الموافق للتاريخ الميلادي: {todayData.gregorian.formattedAr}
                </p>
              </>
            )}
          </div>

          {todayData && (
            <div className="flex items-center gap-4 self-start md:self-center">
              <div className="p-4 rounded-2xl bg-[#064e3b]/40 border border-[#c5a059]/30 text-center min-w-[110px]">
                <span className="text-xs text-[#c5a059] font-['Amiri',serif] block">الشهر الهجري</span>
                <span className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                  {todayData.hijri.monthNameAr}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-[#dfbd69]/80 block mt-0.5">
                  ({todayData.hijri.monthNumber} / 12)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 12 Hijri Months Strip */}
        <div className="pt-6">
          <div className="text-xs text-[#c5a059] font-['Amiri',serif] mb-3">
            أشهر السنة الهجرية القمرية:
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {HIJRI_MONTHS_AR.map((monthName, idx) => {
              const monthNum = idx + 1;
              const isCurrent = monthNum === currentHijriMonth;
              return (
                <div
                  key={monthName}
                  className={`px-3 py-2.5 rounded-xl border text-center transition-colors ${
                    isCurrent
                      ? 'bg-[#064e3b]/70 border-[#dfbd69] text-[#fbf9f5] shadow-md'
                      : 'bg-[#032018]/60 border-[#c5a059]/15 text-[#b8ad9c]'
                  }`}
                >
                  <span className="text-[10px] font-mono tabular-nums text-[#c5a059] block">
                    {String(monthNum).padStart(2, '0')}
                  </span>
                  <span className="text-xs sm:text-sm font-['Amiri',serif] font-semibold">
                    {monthName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Islamic Dates for Current Hijri Year */}
      <div className="rounded-3xl bg-[#032018]/90 border border-[#c5a059]/25 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#c5a059]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                المناسبات الإسلامية لعام {currentHijriYear ? `${currentHijriYear} هـ` : 'الحالي'}
              </h4>
              <p className="text-xs text-[#c5a059] font-['Amiri',serif]">
                تواريخ محوّلة فلكيًا عبر تقويم أم القرى / AlAdhan
              </p>
            </div>
          </div>
        </div>

        {occasionsLoading && occasions.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-[#021812]/60 border border-[#c5a059]/10 animate-pulse" />
            ))}
          </div>
        ) : occasions.length === 0 ? (
          <div className="mt-6 p-6 rounded-2xl bg-[#021812]/60 border border-[#c5a059]/15 text-center text-sm font-['Amiri',serif] text-[#b8ad9c]">
            تعذر تحميل جدول المناسبات لهذا العام حاليًا.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {occasions.map(occ => {
              const isToday =
                occ.hijriMonth === currentHijriMonth && occ.hijriDay === currentHijriDay;
              const isPassed =
                occ.hijriMonth < currentHijriMonth ||
                (occ.hijriMonth === currentHijriMonth && occ.hijriDay < currentHijriDay);

              return (
                <div
                  key={occ.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-gradient-to-b from-[#064e3b]/80 to-[#022018] border-[#dfbd69] shadow-lg'
                      : isPassed
                      ? 'bg-[#021812]/50 border-[#c5a059]/15 opacity-75'
                      : 'bg-[#021812]/80 border-[#c5a059]/25 hover:border-[#dfbd69]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-['Amiri',serif] text-[#dfbd69] flex items-center gap-1.5">
                        <IslamicStar size={11} className="text-[#dfbd69]" />
                        <span>
                          {occ.hijriDay} {occ.hijriMonthNameAr} {occ.hijriYear} هـ
                        </span>
                      </span>
                      <span className="text-[11px] font-['Amiri',serif] text-[#c5a059]">
                        {isToday ? 'اليوم' : isPassed ? 'انقضت' : 'قادمة'}
                      </span>
                    </div>

                    <h5 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                      {occ.titleAr}
                    </h5>
                    <p className="text-xs text-[#b8ad9c] font-['Amiri',serif] mt-1 leading-relaxed">
                      {occ.descriptionAr}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#c5a059]/15 flex items-center justify-between text-xs font-['Amiri',serif] text-[#d4ccbf]">
                    <span>التاريخ الميلادي التقريبي:</span>
                    <span className="text-[#dfbd69] font-semibold">
                      {occ.gregorianDateFormattedAr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Moon Sighting Disclaimer */}
        <div className="mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-[#021812]/80 border border-[#c5a059]/20 text-xs text-[#b8ad9c] font-['Amiri',serif] leading-relaxed">
          <Info className="w-4 h-4 text-[#dfbd69] shrink-0 mt-0.5" />
          <span>
            تنبيه فلكي وشرعي: تعتمد التواريخ الهجرية المذكورة على الحساب الفلكي التقريبي (تقويم أم القرى)، بينما يثبت دخول الأشهر القمرية والأعياد شرعًا برؤية الهلال، وقد يتقدم التاريخ أو يتأخر بيوم واحد حسب الرؤية المحلية في كل بلد.
          </span>
        </div>
      </div>
    </div>
  );
};
