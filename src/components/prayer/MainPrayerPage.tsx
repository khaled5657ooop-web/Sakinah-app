import React, { useEffect, useState } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import {
  DISPLAY_TIMING_KEYS,
  PRAYER_LABELS_AR,
  PrayerKey,
} from '../../data/prayerLocations';
import { formatTimeDisplay } from '../../services/prayerApi';
import { QiblaCompass } from './QiblaCompass';
import { IslamicCalendarCard } from './IslamicCalendarCard';
import { LocationSettingsPanel } from './LocationSettingsPanel';
import { IslamicDivider, IslamicStar } from '../IslamicMotifs';
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Clock,
  Compass,
  Crosshair,
  MapPin,
  Moon,
  RefreshCw,
  Settings,
  Sun,
  Sunrise,
  Sunset,
  AlertTriangle,
} from 'lucide-react';

export type PrayerPageTab = 'times' | 'qibla' | 'calendar' | 'settings';

interface MainPrayerPageProps {
  onBackToHome: () => void;
  initialTab?: PrayerPageTab;
}

export const MainPrayerPage: React.FC<MainPrayerPageProps> = ({
  onBackToHome,
  initialTab = 'times',
}) => {
  const [activeTab, setActiveTab] = useState<PrayerPageTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const {
    location,
    use12Hour,
    todayData,
    scheduleState,
    loading,
    error,
    geoLoading,
    methodNameAr,
    qiblaBearing,
    qiblaDirectionAr,
    requestGeolocation,
    refreshTimings,
  } = usePrayer();

  const getPrayerIcon = (key: PrayerKey, isNext: boolean) => {
    const cls = `w-5 h-5 ${isNext ? 'text-[#021812]' : 'text-[#dfbd69]'}`;
    switch (key) {
      case 'Fajr':
        return <Moon className={cls} />;
      case 'Sunrise':
        return <Sunrise className={cls} />;
      case 'Dhuhr':
        return <Sun className={cls} />;
      case 'Asr':
        return <Sun className={cls} />;
      case 'Maghrib':
        return <Sunset className={cls} />;
      case 'Isha':
        return <Moon className={cls} />;
    }
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Bar: Back to Home + Quick Location Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#c5a059]/30 hover:border-[#dfbd69] bg-[#032018]/80 hover:bg-[#064e3b]/40 text-sm font-['Amiri',serif] text-[#dfbd69] transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى الرئيسية</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-['Amiri',serif] text-[#424d47] dark:text-[#d1c7b7]">
          <MapPin className="w-3.5 h-3.5 text-[#8c6b2d] dark:text-[#dfbd69]" />
          <span>
            {location.cityNameAr} · {location.countryAr}
          </span>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-[#8c6b2d] dark:text-[#dfbd69] hover:underline mr-1 cursor-pointer"
          >
            (تغيير)
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#8c6b2d] dark:text-[#c5a059] mb-3">
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
          <span>PRAYER TIMES · QIBLA · HIJRI CALENDAR</span>
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-['Aref_Ruqaa',serif] text-[#03241b] dark:text-[#fbf9f5] drop-shadow-md">
          الصلاة والقبلة
        </h1>

        <IslamicDivider className="my-3 opacity-70" />

        <p className="text-2xl sm:text-3xl font-['Amiri',serif] text-[#8c6b2d] dark:text-[#dfbd69] font-medium">
          "الصلاة نور وطمأنينة للقلب."
        </p>

        <p className="mt-2 text-sm sm:text-base text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
          مواقيت دقيقة وفق الهيئات الفلكية المعتمدة، وبوصلة القبلة، والتقويم الهجري
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
        {[
          { id: 'times' as const, label: 'مواقيت الصلاة', icon: <Clock className="w-4 h-4" /> },
          { id: 'qibla' as const, label: 'اتجاه القبلة', icon: <Compass className="w-4 h-4" /> },
          { id: 'calendar' as const, label: 'التقويم الهجري', icon: <Calendar className="w-4 h-4" /> },
          { id: 'settings' as const, label: 'الموقع والتنبيهات', icon: <Settings className="w-4 h-4" /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-['Amiri',serif] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#dfbd69] to-[#c5a059] text-[#021812] border-[#dfbd69] shadow-lg shadow-[#c5a059]/15'
                  : 'bg-[#032018]/80 text-[#e4ded5] border-[#c5a059]/25 hover:border-[#dfbd69]/60 hover:text-[#dfbd69]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'times' && (
        <div className="space-y-8">
          {/* Error Banner (never falls back to fake prayer times) */}
          {error && (
            <div className="rounded-2xl bg-amber-950/40 border border-amber-500/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-right">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold font-['Amiri',serif] text-[#fbf9f5]">
                    تعذر عرض مواقيت الصلاة حاليًا
                  </h3>
                  <p className="text-sm font-['Amiri',serif] text-amber-200">{error}</p>
                </div>
              </div>
              <button
                onClick={refreshTimings}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfbd69] text-[#021812] font-bold font-['Amiri',serif] text-sm hover:bg-[#f3e5ab] transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}

          {/* Hero Next Prayer & Countdown Dashboard Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#04281f] via-[#022018] to-[#01140e] border border-[#c5a059]/35 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#dfbd69]/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#064e3b]/30 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left/Right Metadata & Current Prayer Status */}
              <div className="lg:col-span-7 space-y-5 text-right">
                <div className="flex flex-wrap items-center gap-3 text-xs font-['Amiri',serif] text-[#c5a059]">
                  <span className="inline-flex items-center gap-1.5 text-[#dfbd69]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {location.cityNameAr} ({location.countryAr})
                    </span>
                  </span>
                  <span>·</span>
                  <span>{todayData ? todayData.hijri.formattedAr : 'جاري تحميل التاريخ الهجري...'}</span>
                  <span>·</span>
                  <span>{todayData ? todayData.gregorian.formattedAr : ''}</span>
                </div>

                {loading && !scheduleState ? (
                  <div className="space-y-3 py-4">
                    <div className="h-10 w-64 rounded-xl bg-[#064e3b]/30 animate-pulse" />
                    <div className="h-6 w-48 rounded-lg bg-[#064e3b]/20 animate-pulse" />
                  </div>
                ) : scheduleState ? (
                  <>
                    <div>
                      <div className="text-sm font-['Amiri',serif] text-[#dfbd69] mb-1">
                        {scheduleState.currentPrayerStatus}
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                        الصلاة القادمة: صلاة {scheduleState.nextPrayer.nameAr}
                        {scheduleState.nextPrayer.isTomorrow && (
                          <span className="text-xl sm:text-2xl text-[#c5a059] mr-2 font-['Amiri',serif]">
                            (غدًا)
                          </span>
                        )}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-1 text-sm font-['Amiri',serif] text-[#d4ccbf]">
                      <div>
                        <span className="text-[#a89e8f]">موعد الأذان: </span>
                        <span className="text-lg font-bold text-[#dfbd69] font-mono tabular-nums" dir="ltr">
                          {scheduleState.nextPrayer.timeFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#a89e8f]">الوقت الحالي في المدينة: </span>
                        <span className="text-base font-mono tabular-nums text-[#fbf9f5]" dir="ltr">
                          {scheduleState.currentTimeFormatted}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}

                {/* Quick Controls Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={requestGeolocation}
                    disabled={geoLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#064e3b]/50 hover:bg-[#064e3b]/80 border border-[#c5a059]/30 text-xs font-['Amiri',serif] text-[#dfbd69] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{geoLoading ? 'جاري التحديد...' : 'تحديث بموقعي (GPS)'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#c5a059]/25 hover:border-[#dfbd69] text-xs font-['Amiri',serif] text-[#e4ded5] hover:text-[#dfbd69] transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>تغيير المدينة أو طريقة الحساب</span>
                  </button>
                </div>
              </div>

              {/* Countdown Panel */}
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-7 rounded-2xl bg-[#021812]/90 border border-[#dfbd69]/40 shadow-inner text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-xs font-['Amiri',serif] text-[#dfbd69]">
                    <Bell className="w-4 h-4" />
                    <span>
                      {scheduleState
                        ? `الوقت المتبقي لصلاة ${scheduleState.nextPrayer.nameAr}`
                        : 'العد التنازلي للصلاة القادمة'}
                    </span>
                  </div>

                  {scheduleState ? (
                    <>
                      <div
                        className="flex items-center justify-center gap-2 sm:gap-3 font-mono tabular-nums"
                        dir="ltr"
                      >
                        <div className="px-3 py-2 rounded-xl bg-[#032018] border border-[#c5a059]/25 min-w-[68px]">
                          <span className="text-3xl sm:text-4xl font-bold text-[#fbf9f5] block">
                            {pad2(scheduleState.countdown.hours)}
                          </span>
                          <span className="text-[11px] font-['Amiri',serif] text-[#c5a059]">ساعة</span>
                        </div>
                        <span className="text-2xl font-bold text-[#dfbd69]">:</span>
                        <div className="px-3 py-2 rounded-xl bg-[#032018] border border-[#c5a059]/25 min-w-[68px]">
                          <span className="text-3xl sm:text-4xl font-bold text-[#fbf9f5] block">
                            {pad2(scheduleState.countdown.minutes)}
                          </span>
                          <span className="text-[11px] font-['Amiri',serif] text-[#c5a059]">دقيقة</span>
                        </div>
                        <span className="text-2xl font-bold text-[#dfbd69]">:</span>
                        <div className="px-3 py-2 rounded-xl bg-[#032018] border border-[#c5a059]/25 min-w-[68px]">
                          <span className="text-3xl sm:text-4xl font-bold text-[#dfbd69] block">
                            {pad2(scheduleState.countdown.seconds)}
                          </span>
                          <span className="text-[11px] font-['Amiri',serif] text-[#c5a059]">ثانية</span>
                        </div>
                      </div>

                      {/* Window Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="w-full h-1.5 rounded-full bg-[#064e3b]/40 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#c5a059] to-[#dfbd69] transition-all duration-500"
                            style={{ width: `${scheduleState.progressPercent}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-[#a89e8f] font-['Amiri',serif]">
                          طريقة الحساب: {methodNameAr}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-sm font-['Amiri',serif] text-[#b8ad9c]">
                      {loading ? 'جاري احتساب المواقيت بدقة...' : 'غير متوفر حاليًا'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Five Daily Prayers + Sunrise Cards Grid */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                الصلوات الخمس اليومية
              </h3>
              {todayData && (
                <span className="text-xs font-['Amiri',serif] text-[#c5a059]">
                  المنطقة الزمنية: <span className="font-mono" dir="ltr">{todayData.timezone}</span>
                </span>
              )}
            </div>

            {loading && !todayData ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl bg-[#032018]/70 border border-[#c5a059]/15 animate-pulse"
                  />
                ))}
              </div>
            ) : todayData ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {DISPLAY_TIMING_KEYS.map(key => {
                  const meta = PRAYER_LABELS_AR[key];
                  const isNext =
                    scheduleState?.nextPrayer.key === key && !scheduleState.nextPrayer.isTomorrow;
                  const isPassed = scheduleState?.passedPrayers[key] ?? false;
                  const timeFormatted = formatTimeDisplay(todayData.timings[key], use12Hour);

                  return (
                    <div
                      key={key}
                      className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between text-center ${
                        isNext
                          ? 'bg-gradient-to-b from-[#dfbd69] to-[#c5a059] border-[#f3e5ab] text-[#021812] shadow-xl shadow-[#c5a059]/20 scale-[1.02]'
                          : isPassed
                          ? 'bg-[#021812]/70 border-[#c5a059]/15 text-[#9c9284]'
                          : 'bg-[#032018]/90 border-[#c5a059]/30 hover:border-[#dfbd69]/60 text-[#fbf9f5]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isNext
                              ? 'bg-[#021812]/15'
                              : 'bg-[#064e3b]/40 border border-[#c5a059]/20'
                          }`}
                        >
                          {getPrayerIcon(key, isNext)}
                        </div>

                        {isNext ? (
                          <span className="text-[11px] font-bold font-['Amiri',serif] text-[#021812]">
                            القادمة
                          </span>
                        ) : isPassed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-['Amiri',serif] text-[#c5a059]/75">
                            <Check className="w-3 h-3" />
                            <span>مضت</span>
                          </span>
                        ) : !meta.isObligatory ? (
                          <span className="text-[11px] font-['Amiri',serif] text-[#c5a059]">
                            شروق
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <div
                          className={`text-lg font-bold font-['Aref_Ruqaa',serif] ${
                            isNext ? 'text-[#021812]' : 'text-[#fbf9f5]'
                          }`}
                        >
                          {meta.nameAr}
                        </div>
                        <div
                          className={`text-[11px] font-['Amiri',serif] ${
                            isNext ? 'text-[#021812]/80' : 'text-[#a89e8f]'
                          }`}
                        >
                          {meta.subtitleAr}
                        </div>
                      </div>

                      <div
                        className={`mt-3 text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                          isNext ? 'text-[#021812]' : 'text-[#dfbd69]'
                        }`}
                        dir="ltr"
                      >
                        {timeFormatted}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Night & Voluntary Worship Markers + Quick Cross-Links */}
          {todayData && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Night Markers */}
              <div className="lg:col-span-6 rounded-2xl bg-[#032018]/80 border border-[#c5a059]/20 p-6 space-y-4">
                <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                  مواقيت السَّحَر وقيام الليل
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'الإمساك', time: todayData.timings.Imsak },
                    { label: 'منتصف الليل', time: todayData.timings.Midnight },
                    { label: 'الثلث الأخير', time: todayData.timings.Lastthird },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-xl bg-[#021812]/80 border border-[#c5a059]/15 text-center"
                    >
                      <span className="text-xs font-['Amiri',serif] text-[#c5a059] block">
                        {item.label}
                      </span>
                      <span
                        className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#fbf9f5] mt-1 block"
                        dir="ltr"
                      >
                        {formatTimeDisplay(item.time, use12Hour)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access Cards to Qibla & Islamic Calendar */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('qibla')}
                  className="p-6 rounded-2xl bg-[#032018]/80 hover:bg-[#064e3b]/40 border border-[#c5a059]/25 hover:border-[#dfbd69] text-right transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Compass className="w-6 h-6 text-[#dfbd69]" />
                    <span className="text-xs font-mono tabular-nums text-[#c5a059]" dir="ltr">
                      {qiblaBearing.toFixed(1)}°
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69]">
                      بوصلة القبلة الشريفة
                    </h4>
                    <p className="text-xs font-['Amiri',serif] text-[#b8ad9c] mt-1">
                      الاتجاه المحسوب: {qiblaDirectionAr} · اضغط لفتح البوصلة
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="p-6 rounded-2xl bg-[#032018]/80 hover:bg-[#064e3b]/40 border border-[#c5a059]/25 hover:border-[#dfbd69] text-right transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Calendar className="w-6 h-6 text-[#dfbd69]" />
                    <span className="text-xs font-['Amiri',serif] text-[#c5a059]">
                      {todayData.hijri.monthNameAr}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69]">
                      التقويم الهجري والمناسبات
                    </h4>
                    <p className="text-xs font-['Amiri',serif] text-[#b8ad9c] mt-1">
                      {todayData.hijri.formattedAr} · عرض المواسم الإسلامية
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'qibla' && <QiblaCompass />}
      {activeTab === 'calendar' && <IslamicCalendarCard />}
      {activeTab === 'settings' && <LocationSettingsPanel />}
    </div>
  );
};
