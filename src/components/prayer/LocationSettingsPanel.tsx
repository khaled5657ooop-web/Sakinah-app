import React, { useMemo, useState, useEffect } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import {
  DISPLAY_TIMING_KEYS,
  OBLIGATORY_PRAYER_KEYS,
  PRAYER_CALCULATION_METHODS,
  PRAYER_COUNTRIES,
  PRAYER_LABELS_AR,
} from '../../data/prayerLocations';
import {
  MapPin,
  Crosshair,
  SlidersHorizontal,
  Bell,
  BellOff,
  RotateCcw,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';

export const LocationSettingsPanel: React.FC = () => {
  const {
    location,
    methodId,
    school,
    tuneOffsets,
    use12Hour,
    todayData,
    geoLoading,
    geoError,
    methodNameAr,
    notificationSettings,
    notificationPermission,
    selectCity,
    setMethodId,
    setSchool,
    setTuneOffset,
    resetTuneOffsets,
    setUse12Hour,
    requestGeolocation,
    updateNotificationSettings,
    toggleNotificationPrayer,
    requestNotificationPermission,
    sendTestNotification,
  } = usePrayer();

  const [selectedCountryEn, setSelectedCountryEn] = useState<string>(() => {
    const found = PRAYER_COUNTRIES.find(g => g.countryAr === location.countryAr);
    return found ? found.countryEn : PRAYER_COUNTRIES[0].countryEn;
  });

  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  useEffect(() => {
    const found = PRAYER_COUNTRIES.find(g => g.countryAr === location.countryAr);
    if (found) {
      setSelectedCountryEn(found.countryEn);
    }
  }, [location.countryAr]);

  const activeCountryGroup = useMemo(() => {
    return PRAYER_COUNTRIES.find(g => g.countryEn === selectedCountryEn) || PRAYER_COUNTRIES[0];
  }, [selectedCountryEn]);

  const activeMethodObj = useMemo(() => {
    return PRAYER_CALCULATION_METHODS.find(m => m.id === methodId);
  }, [methodId]);

  const hasAnyTuneOffset = useMemo(() => {
    return Object.values(tuneOffsets).some(v => v !== 0);
  }, [tuneOffsets]);

  const handleCountryChange = (countryEn: string) => {
    setSelectedCountryEn(countryEn);
    const group = PRAYER_COUNTRIES.find(g => g.countryEn === countryEn);
    if (group && group.cities.length > 0) {
      selectCity(group.cities[0], true);
    }
  };

  const handleCityChange = (cityId: string) => {
    const city = activeCountryGroup.cities.find(c => c.id === cityId);
    if (city) {
      selectCity(city, true);
    }
  };

  const handleEnableNotifications = async () => {
    if (notificationPermission === 'granted') {
      updateNotificationSettings({ enabled: !notificationSettings.enabled });
      return;
    }
    await requestNotificationPermission();
  };

  const handleTestNotification = () => {
    const ok = sendTestNotification();
    setTestSentMessage(
      ok
        ? 'تم إرسال إشعار تجريبي عبر المتصفح.'
        : 'تعذر إرسال الإشعار؛ تأكد من منح الإذن في إعدادات المتصفح.'
    );
    window.setTimeout(() => setTestSentMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Location Settings Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#04281f]/95 via-[#022018] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#c5a059]/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                إعدادات الموقع الجغرافي
              </h3>
              <p className="text-xs text-[#c5a059] font-['Amiri',serif]">
                اختر دولتك ومدينتك أو استخدم الموقع التلقائي لحساب المواقيت واتجاه القبلة
              </p>
            </div>
          </div>

          <button
            onClick={requestGeolocation}
            disabled={geoLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dfbd69] to-[#c5a059] text-[#021812] font-bold font-['Amiri',serif] text-sm hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-md"
          >
            <Crosshair className="w-4 h-4" />
            <span>{geoLoading ? 'جاري تحديد موقعك...' : 'استخدام موقعي الحالي (GPS)'}</span>
          </button>
        </div>

        {/* Explanation before geolocation / Error feedback */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#032018] border border-[#c5a059]/15 text-xs text-[#b8ad9c] font-['Amiri',serif] leading-relaxed">
          <Info className="w-4 h-4 text-[#dfbd69] shrink-0 mt-0.5" />
          <span>
            يُستخدم إذن الموقع الجغرافي حصريًا لحساب مواقيت الصلاة وزاوية القبلة الدقيقة في جهازك دون تخزين أي بيانات شخصية في خوادم خارجية. يمكنك دائمًا اختيار المدينة يدويًا أدناه دون الحاجة لتفعيل GPS.
          </span>
        </div>

        {geoError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 font-['Amiri',serif]">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{geoError}</span>
          </div>
        )}

        {/* Country & City Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs text-[#dfbd69] font-['Amiri',serif]">
              الدولة
            </label>
            <select
              value={selectedCountryEn}
              onChange={e => handleCountryChange(e.target.value)}
              className="w-full bg-[#021812] border border-[#c5a059]/30 rounded-xl px-4 py-3 text-sm font-['Amiri',serif] text-[#fbf9f5] focus:outline-none focus:border-[#dfbd69] cursor-pointer"
            >
              {PRAYER_COUNTRIES.map(group => (
                <option key={group.countryEn} value={group.countryEn} className="bg-[#021812]">
                  {group.countryAr}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-[#dfbd69] font-['Amiri',serif]">
              المدينة
            </label>
            <select
              value={location.cityId || ''}
              onChange={e => handleCityChange(e.target.value)}
              className="w-full bg-[#021812] border border-[#c5a059]/30 rounded-xl px-4 py-3 text-sm font-['Amiri',serif] text-[#fbf9f5] focus:outline-none focus:border-[#dfbd69] cursor-pointer"
            >
              {location.isGeolocation && (
                <option value="" className="bg-[#021812]">
                  {location.cityNameAr} ({location.countryAr})
                </option>
              )}
              {activeCountryGroup.cities.map(city => (
                <option key={city.id} value={city.id} className="bg-[#021812]">
                  {city.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Location Metadata Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#021812]/80 border border-[#c5a059]/15">
            <span className="text-[11px] text-[#c5a059] font-['Amiri',serif] block">الموقع المعتمد حاليًا</span>
            <span className="text-sm font-bold font-['Amiri',serif] text-[#fbf9f5]">
              {location.cityNameAr}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#021812]/80 border border-[#c5a059]/15">
            <span className="text-[11px] text-[#c5a059] font-['Amiri',serif] block">المنطقة الزمنية</span>
            <span className="text-sm font-mono tabular-nums text-[#fbf9f5]" dir="ltr">
              {todayData?.timezone || 'جاري التحقق...'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#021812]/80 border border-[#c5a059]/15">
            <span className="text-[11px] text-[#c5a059] font-['Amiri',serif] block">الإحداثيات الجغرافية</span>
            <span className="text-sm font-mono tabular-nums text-[#fbf9f5]" dir="ltr">
              {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      </div>

      {/* 2. Calculation Method & Display Preferences */}
      <div className="rounded-3xl bg-[#032018]/90 border border-[#c5a059]/25 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-5 border-b border-[#c5a059]/15">
          <div className="w-11 h-11 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
              طريقة الحساب الفلكي والضبط
            </h3>
            <p className="text-xs text-[#c5a059] font-['Amiri',serif]">
              اختر الهيئة العلمية المعتمدة في بلدك مع إمكانية التعديل اليدوي بالدقائق
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-2">
            <label className="block text-xs text-[#dfbd69] font-['Amiri',serif]">
              جهة الحساب المعتمدة
            </label>
            <select
              value={methodId}
              onChange={e => setMethodId(Number(e.target.value))}
              className="w-full bg-[#021812] border border-[#c5a059]/30 rounded-xl px-4 py-3 text-sm font-['Amiri',serif] text-[#fbf9f5] focus:outline-none focus:border-[#dfbd69] cursor-pointer"
            >
              {PRAYER_CALCULATION_METHODS.map(m => (
                <option key={m.id} value={m.id} className="bg-[#021812]">
                  {m.nameAr}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#b8ad9c] font-['Amiri',serif]">
              {activeMethodObj?.descriptionAr || methodNameAr}
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-xs text-[#dfbd69] font-['Amiri',serif]">
                مذهب وقت صلاة العصر
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSchool(0)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                    school === 0
                      ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                      : 'bg-[#021812] text-[#d4ccbf] border-[#c5a059]/25 hover:border-[#dfbd69]/50'
                  }`}
                >
                  الجمهور (الشافعي والمالكي والحنبلي)
                </button>
                <button
                  onClick={() => setSchool(1)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                    school === 1
                      ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                      : 'bg-[#021812] text-[#d4ccbf] border-[#c5a059]/25 hover:border-[#dfbd69]/50'
                  }`}
                >
                  المذهب الحنفي
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-[#dfbd69] font-['Amiri',serif]">
                تنسيق عرض الساعات
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setUse12Hour(true)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                    use12Hour
                      ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                      : 'bg-[#021812] text-[#d4ccbf] border-[#c5a059]/25 hover:border-[#dfbd69]/50'
                  }`}
                >
                  12 ساعة (ص / م)
                </button>
                <button
                  onClick={() => setUse12Hour(false)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-['Amiri',serif] transition-all cursor-pointer ${
                    !use12Hour
                      ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                      : 'bg-[#021812] text-[#d4ccbf] border-[#c5a059]/25 hover:border-[#dfbd69]/50'
                  }`}
                >
                  24 ساعة (قياسي)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Minute Adjustments */}
        <div className="pt-4 border-t border-[#c5a059]/15 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold font-['Amiri',serif] text-[#fbf9f5]">
                تعديل الدقائق يدويًا (اختياري)
              </h4>
              <p className="text-xs text-[#b8ad9c] font-['Amiri',serif]">
                لمطابقة التقويم المحلي لمسجدك بالدقيقة (±30 دقيقة)
              </p>
            </div>
            {hasAnyTuneOffset && (
              <button
                onClick={resetTuneOffsets}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c5a059]/30 text-xs text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer font-['Amiri',serif]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تصفير التعديلات</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DISPLAY_TIMING_KEYS.map(key => {
              const offset = tuneOffsets[key];
              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-[#021812]/80 border border-[#c5a059]/20 flex flex-col items-center gap-2"
                >
                  <span className="text-xs font-['Amiri',serif] text-[#d4ccbf]">
                    {PRAYER_LABELS_AR[key].nameAr}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTuneOffset(key, offset - 1)}
                      className="w-7 h-7 rounded-lg bg-[#064e3b]/40 border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#dfbd69] flex items-center justify-center cursor-pointer"
                      aria-label={`إنقاص دقيقة لـ ${PRAYER_LABELS_AR[key].nameAr}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className="w-10 text-center text-sm font-mono tabular-nums font-bold text-[#fbf9f5]"
                      dir="ltr"
                    >
                      {offset > 0 ? `+${offset}` : offset}
                    </span>
                    <button
                      onClick={() => setTuneOffset(key, offset + 1)}
                      className="w-7 h-7 rounded-lg bg-[#064e3b]/40 border border-[#c5a059]/25 hover:border-[#dfbd69] text-[#dfbd69] flex items-center justify-center cursor-pointer"
                      aria-label={`زيادة دقيقة لـ ${PRAYER_LABELS_AR[key].nameAr}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Optional Browser Prayer Notifications */}
      <div className="rounded-3xl bg-[#032018]/90 border border-[#c5a059]/25 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#c5a059]/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center text-[#dfbd69]">
              {notificationSettings.enabled && notificationPermission === 'granted' ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                تنبيهات أوقات الصلاة (اختياري)
              </h3>
              <p className="text-xs text-[#c5a059] font-['Amiri',serif]">
                إشعارات متصفح لطيفة تذكّرك عند دخول وقت الصلاة أو قبله بدقائق
              </p>
            </div>
          </div>

          {notificationPermission === 'unsupported' ? (
            <span className="text-xs text-[#b8ad9c] font-['Amiri',serif]">
              المتصفح الحالي لا يدعم واجهة الإشعارات
            </span>
          ) : notificationPermission === 'denied' ? (
            <span className="text-xs text-amber-300 font-['Amiri',serif]">
              الإشعارات محجوبة من إعدادات المتصفح
            </span>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className={`px-5 py-2.5 rounded-xl border text-sm font-['Amiri',serif] font-bold transition-all cursor-pointer shrink-0 ${
                notificationSettings.enabled && notificationPermission === 'granted'
                  ? 'bg-[#064e3b] border-[#dfbd69] text-[#dfbd69]'
                  : 'bg-gradient-to-r from-[#dfbd69] to-[#c5a059] border-[#dfbd69] text-[#021812]'
              }`}
            >
              {notificationPermission !== 'granted'
                ? 'تفعيل إشعارات المتصفح'
                : notificationSettings.enabled
                ? 'التنبيهات مفعّلة (إيقاف)'
                : 'تشغيل التنبيهات'}
            </button>
          )}
        </div>

        {/* Prayer selection & pre-reminder lead time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="block text-xs text-[#dfbd69] font-['Amiri',serif]">
              الصلوات المطلوب التنبيه لها:
            </label>
            <div className="flex flex-wrap gap-2">
              {OBLIGATORY_PRAYER_KEYS.map(key => {
                const active = notificationSettings.prayers[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggleNotificationPrayer(key)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-['Amiri',serif] transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#064e3b]/70 border-[#dfbd69] text-[#fbf9f5]'
                        : 'bg-[#021812] border-[#c5a059]/20 text-[#9c9284]'
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#dfbd69]" />}
                    <span>{PRAYER_LABELS_AR[key].nameAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs text-[#dfbd69] font-['Amiri',serif]">
              توقيت التنبيه:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 0, label: 'وقت الأذان' },
                { val: 5, label: 'قبل 5 د' },
                { val: 10, label: 'قبل 10 د' },
                { val: 15, label: 'قبل 15 د' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() =>
                    updateNotificationSettings({ reminderMinutesBefore: opt.val })
                  }
                  className={`py-2 px-2.5 rounded-xl border text-xs font-['Amiri',serif] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    notificationSettings.reminderMinutesBefore === opt.val
                      ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69] font-bold'
                      : 'bg-[#021812] text-[#d4ccbf] border-[#c5a059]/25 hover:border-[#dfbd69]/50'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Notification + Honest Browser Limitation Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-start gap-2 text-xs text-[#b8ad9c] font-['Amiri',serif] leading-relaxed">
            <Info className="w-4 h-4 text-[#dfbd69] shrink-0 mt-0.5" />
            <span>
              توضيح تقني: تعمل إشعارات المتصفح المحلية ما دامت صفحة «سَكِينَة» مفتوحة في أحد التبويبات؛ ولا تعمل تلقائيًا عند إغلاق المتصفح بالكامل لعدم وجود خادم إشعارات خلفي (Push Server).
            </span>
          </div>

          {notificationPermission === 'granted' && (
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 rounded-xl border border-[#c5a059]/30 hover:border-[#dfbd69] text-xs font-['Amiri',serif] text-[#dfbd69] hover:bg-[#064e3b]/30 transition-colors cursor-pointer shrink-0"
            >
              إرسال تنبيه تجريبي
            </button>
          )}
        </div>

        {testSentMessage && (
          <div className="text-xs text-emerald-300 font-['Amiri',serif]">{testSentMessage}</div>
        )}
      </div>
    </div>
  );
};
