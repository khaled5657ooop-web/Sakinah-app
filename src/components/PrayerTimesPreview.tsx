import React from 'react';
import { usePrayer } from '../context/PrayerContext';
import {
  ALL_PRAYER_CITIES,
  DISPLAY_TIMING_KEYS,
  PRAYER_LABELS_AR,
} from '../data/prayerLocations';
import { formatTimeDisplay } from '../services/prayerApi';
import { Clock, MapPin, Compass, Bell, RefreshCw, ArrowLeft } from 'lucide-react';

interface PrayerTimesPreviewProps {
  onOpenPrayerPage?: () => void;
  onOpenQibla?: () => void;
}

export const PrayerTimesPreview: React.FC<PrayerTimesPreviewProps> = ({
  onOpenPrayerPage,
  onOpenQibla,
}) => {
  const {
    location,
    use12Hour,
    todayData,
    scheduleState,
    loading,
    error,
    selectCity,
    refreshTimings,
  } = usePrayer();

  const pad2 = (n: number) => String(n).padStart(2, '0');

  const handleCitySelect = (cityId: string) => {
    const city = ALL_PRAYER_CITIES.find(c => c.id === cityId);
    if (city) {
      selectCity(city, true);
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-gradient-to-r from-[#032018] via-[#021812] to-[#032018] border border-[#c5a059]/25 p-6 sm:p-8 shadow-xl">
        {/* Header Ribbon */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#c5a059]/15 gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                  مواقيت الصلاة اليوم
                </h3>
                {scheduleState && (
                  <span className="text-xs font-['Amiri',serif] text-[#dfbd69]">
                    · {scheduleState.currentPrayerStatus}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#c5a059] font-['Amiri',serif] mt-0.5">
                {todayData
                  ? `${todayData.hijri.formattedAr} · ${todayData.gregorian.formattedAr}`
                  : loading
                  ? 'جاري جلب التاريخ الهجري والمواقيت...'
                  : 'مواقيت الصلاة المعتمدة'}
              </p>
            </div>
          </div>

          {/* City Selector + Live Countdown + Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {scheduleState && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#064e3b]/40 border border-[#dfbd69]/35 text-xs">
                <span className="font-['Amiri',serif] text-[#d4ccbf]">
                  المتبقي لـ {scheduleState.nextPrayer.nameAr}:
                </span>
                <span className="font-mono tabular-nums font-bold text-[#dfbd69]" dir="ltr">
                  {pad2(scheduleState.countdown.hours)}:{pad2(scheduleState.countdown.minutes)}:
                  {pad2(scheduleState.countdown.seconds)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#dfbd69]" />
              <select
                value={location.cityId || ''}
                onChange={e => handleCitySelect(e.target.value)}
                aria-label="اختيار المدينة لمواقيت الصلاة"
                className="bg-[#064e3b]/40 border border-[#c5a059]/30 rounded-lg px-3 py-1.5 text-xs font-['Amiri',serif] text-[#fbf9f5] focus:outline-none focus:border-[#dfbd69] cursor-pointer"
              >
                {location.isGeolocation && (
                  <option value="" className="bg-[#021812] text-[#fbf9f5]">
                    {location.cityNameAr} ({location.countryAr})
                  </option>
                )}
                {ALL_PRAYER_CITIES.map(city => (
                  <option key={city.id} value={city.id} className="bg-[#021812] text-[#fbf9f5]">
                    {city.nameAr} ({city.countryAr})
                  </option>
                ))}
              </select>
            </div>

            {onOpenQibla && (
              <button
                onClick={onOpenQibla}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c5a059]/25 text-xs text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer"
                title="تحديد اتجاه القبلة"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="font-['Amiri',serif]">اتجاه القبلة</span>
              </button>
            )}

            {onOpenPrayerPage && (
              <button
                onClick={onOpenPrayerPage}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] text-xs font-bold text-[#021812] transition-all cursor-pointer font-['Amiri',serif]"
              >
                <span>الصلاة والقبلة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Prayer Times Strip (Real API data, loading skeleton, or retry error) */}
        {error && !todayData ? (
          <div className="mt-6 p-5 rounded-xl bg-[#021812]/70 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm font-['Amiri',serif] text-amber-200">{error}</span>
            <button
              onClick={refreshTimings}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#dfbd69] text-[#021812] text-xs font-bold font-['Amiri',serif] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : loading && !todayData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-24 rounded-xl bg-[#032018]/60 border border-[#c5a059]/15 animate-pulse"
              />
            ))}
          </div>
        ) : todayData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
            {DISPLAY_TIMING_KEYS.map(key => {
              const isNext =
                scheduleState?.nextPrayer.key === key && !scheduleState.nextPrayer.isTomorrow;
              const label = PRAYER_LABELS_AR[key].nameAr;
              const timeStr = formatTimeDisplay(todayData.timings[key], use12Hour);

              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl text-center border transition-all duration-300 ${
                    isNext
                      ? 'bg-gradient-to-b from-[#064e3b]/65 to-[#022018] border-[#dfbd69] shadow-lg shadow-[#c5a059]/10 scale-[1.02]'
                      : 'bg-[#032018]/50 border-[#c5a059]/15 hover:border-[#c5a059]/40'
                  }`}
                >
                  {isNext && (
                    <div className="inline-flex items-center gap-1 text-[10px] text-[#dfbd69] font-['Amiri',serif] mb-1">
                      <Bell className="w-3 h-3" />
                      <span>الصلاة القادمة</span>
                    </div>
                  )}
                  <div className="text-sm font-['Amiri',serif] text-[#d4ccbf]">{label}</div>
                  <div
                    className="text-lg sm:text-xl font-bold font-mono text-[#fbf9f5] mt-1 tabular-nums"
                    dir="ltr"
                  >
                    {timeStr}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};
