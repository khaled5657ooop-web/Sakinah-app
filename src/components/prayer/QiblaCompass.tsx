import React, { useEffect, useState, useCallback } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import { KAABA_COORDS } from '../../services/prayerApi';
import { IslamicStar } from '../IslamicMotifs';
import { Compass, MapPin, Navigation, AlertTriangle, Smartphone, CheckCircle2 } from 'lucide-react';

type SensorStatus =
  | 'idle'
  | 'needs-permission'
  | 'listening'
  | 'active'
  | 'denied'
  | 'unsupported';

interface ExtendedDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

export const QiblaCompass: React.FC = () => {
  const { location, qiblaBearing, qiblaDirectionAr, distanceToKaabaKm, requestGeolocation, geoLoading } =
    usePrayer();

  const [sensorStatus, setSensorStatus] = useState<SensorStatus>(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      return 'unsupported';
    }
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DOE.requestPermission === 'function') {
      return 'needs-permission';
    }
    return 'idle';
  });

  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  const handleOrientationEvent = useCallback((event: Event) => {
    const e = event as ExtendedDeviceOrientationEvent;
    let heading: number | null = null;

    if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
      // iOS Safari reports clockwise heading from magnetic North directly
      heading = e.webkitCompassHeading;
    } else if (e.absolute === true && typeof e.alpha === 'number' && !Number.isNaN(e.alpha)) {
      // W3C absolute orientation: alpha is counter-clockwise from North
      heading = (360 - e.alpha) % 360;
    }

    if (heading !== null) {
      setDeviceHeading(((heading % 360) + 360) % 360);
      setSensorStatus('active');
    }
  }, []);

  const attachSensorListeners = useCallback(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setSensorStatus('unsupported');
      return () => {};
    }

    setSensorStatus('listening');
    window.addEventListener('deviceorientationabsolute', handleOrientationEvent, true);
    window.addEventListener('deviceorientation', handleOrientationEvent, true);

    // If no valid absolute heading arrives within 1.8s (e.g., desktop without magnetometer), show clear static mode
    const fallbackTimer = window.setTimeout(() => {
      setDeviceHeading(prev => {
        if (prev === null) {
          setSensorStatus('unsupported');
        }
        return prev;
      });
    }, 1800);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('deviceorientationabsolute', handleOrientationEvent, true);
      window.removeEventListener('deviceorientation', handleOrientationEvent, true);
    };
  }, [handleOrientationEvent]);

  // On non-iOS browsers that don't require explicit permission, probe sensor passively
  useEffect(() => {
    if (sensorStatus === 'idle') {
      return attachSensorListeners();
    }
    return undefined;
  }, [sensorStatus, attachSensorListeners]);

  const handleRequestSensorPermission = async () => {
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DOE?.requestPermission !== 'function') {
      attachSensorListeners();
      return;
    }

    try {
      const result = await DOE.requestPermission();
      if (result === 'granted') {
        attachSensorListeners();
      } else {
        setSensorStatus('denied');
      }
    } catch {
      setSensorStatus('denied');
    }
  };

  const isLiveCompass = sensorStatus === 'active' && deviceHeading !== null;

  // When live compass is active, rotate dial so North aligns with real North,
  // and needle points directly to (qiblaBearing - deviceHeading).
  // When static (desktop / unsupported), North stays at top (0 deg) and needle points to qiblaBearing.
  const dialRotationDeg = isLiveCompass ? -deviceHeading! : 0;
  const needleRotationDeg = isLiveCompass ? qiblaBearing - deviceHeading! : qiblaBearing;

  // Shortest signed angular difference for live alignment indicator
  const normalizedDiff = isLiveCompass
    ? ((((qiblaBearing - deviceHeading!) % 360) + 540) % 360) - 180
    : null;
  const isAligned = normalizedDiff !== null && Math.abs(normalizedDiff) <= 6;

  const isAtMakkahCenter = distanceToKaabaKm <= 2;

  return (
    <div className="space-y-6">
      {/* Main Compass Container */}
      <div className="rounded-3xl bg-gradient-to-b from-[#04281f]/95 via-[#022018] to-[#01140e] border border-[#c5a059]/30 p-6 sm:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Compass Dial Column */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer Ambient Ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${
                  isAligned
                    ? 'border-emerald-400 shadow-[0_0_45px_-5px_rgba(52,211,153,0.45)]'
                    : 'border-[#c5a059]/35 shadow-[0_0_40px_-10px_rgba(197,160,89,0.2)]'
                }`}
              />

              {/* Top Device Reference Notch (for live compass mode) */}
              {isLiveCompass && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[11px] border-l-transparent border-r-transparent border-t-[#dfbd69]" />
                </div>
              )}

              {/* Rotating Cardinal Rose */}
              <div
                className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#c5a059]/25 bg-gradient-to-b from-[#064e3b]/35 to-[#021812] flex items-center justify-center transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${dialRotationDeg}deg)` }}
              >
                {/* Degree Ticks */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const deg = i * 15;
                  const isMajor = deg % 90 === 0;
                  return (
                    <div
                      key={deg}
                      className="absolute inset-2 pointer-events-none"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <div
                        className={`mx-auto ${
                          isMajor ? 'w-0.5 h-3 bg-[#dfbd69]' : 'w-px h-1.5 bg-[#c5a059]/35'
                        }`}
                      />
                    </div>
                  );
                })}

                {/* Cardinal Direction Labels */}
                <span className="absolute top-4 text-xs font-bold text-[#dfbd69] font-['Amiri',serif]">
                  شمال N
                </span>
                <span className="absolute bottom-4 text-xs font-bold text-[#c5a059]/70 font-['Amiri',serif]">
                  جنوب S
                </span>
                <span className="absolute right-4 text-xs font-bold text-[#c5a059]/70 font-['Amiri',serif]">
                  شرق E
                </span>
                <span className="absolute left-4 text-xs font-bold text-[#c5a059]/70 font-['Amiri',serif]">
                  غرب W
                </span>

                {/* Inner Geometric Circle */}
                <div className="w-40 h-40 rounded-full border border-[#c5a059]/15 flex items-center justify-center" />
              </div>

              {/* Qibla Bearing Pointer Overlay */}
              {!isAtMakkahCenter && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-150 ease-out z-20"
                  style={{ transform: `rotate(${needleRotationDeg}deg)` }}
                >
                  <div className="relative h-56 sm:h-64 w-6 flex flex-col items-center justify-between">
                    {/* Kaaba Pointer Tip */}
                    <div className="flex flex-col items-center -mt-1">
                      <div
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shadow-lg transition-colors ${
                          isAligned
                            ? 'bg-emerald-500 border-[#fbf9f5] text-[#021812]'
                            : 'bg-[#dfbd69] border-[#021812] text-[#021812]'
                        }`}
                      >
                        <Navigation className="w-4 h-4 fill-current" />
                      </div>
                      <div
                        className={`w-1 h-20 rounded-full ${
                          isAligned
                            ? 'bg-gradient-to-b from-emerald-400 to-emerald-500/20'
                            : 'bg-gradient-to-b from-[#dfbd69] to-[#c5a059]/20'
                        }`}
                      />
                    </div>
                    <div className="w-1 h-16 rounded-full bg-gradient-to-t from-[#c5a059]/30 to-transparent" />
                  </div>
                </div>
              )}

              {/* Center Kaaba Emblem */}
              <div className="absolute w-14 h-14 rounded-2xl bg-[#021812] border-2 border-[#dfbd69]/80 flex items-center justify-center shadow-xl z-20">
                <IslamicStar size={22} className="text-[#dfbd69]" />
              </div>
            </div>

            {/* Live Sensor Status / Action */}
            <div className="mt-6 text-center space-y-3">
              {isLiveCompass ? (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-['Amiri',serif] ${
                    isAligned
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-[#064e3b]/40 border-[#c5a059]/30 text-[#dfbd69]'
                  }`}
                >
                  {isAligned ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>أنت متجه نحو القبلة الشريفة الآن</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4" />
                      <span>
                        البوصلة الحية مفعّلة · أدر الجهاز{' '}
                        {normalizedDiff && normalizedDiff > 0 ? 'يمينًا' : 'يسارًا'} بمقدار{' '}
                        <span className="font-mono tabular-nums">
                          {Math.abs(Math.round(normalizedDiff || 0))}°
                        </span>
                      </span>
                    </>
                  )}
                </div>
              ) : sensorStatus === 'needs-permission' ? (
                <button
                  onClick={handleRequestSensorPermission}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfbd69] to-[#c5a059] text-[#021812] font-bold font-['Amiri',serif] text-sm hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all cursor-pointer shadow-md"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>تفعيل مستشعر البوصلة الحية</span>
                </button>
              ) : sensorStatus === 'denied' ? (
                <p className="text-xs text-[#d1c7b7] font-['Amiri',serif]">
                  تم رفض إذن مستشعر الاتجاه. يعرض القرص الزاوية الحسابية الدقيقة نسبةً إلى الشمال الجغرافي.
                </p>
              ) : (
                <p className="text-xs text-[#c5a059] font-['Amiri',serif]">
                  وضع التوجيه الجغرافي الثابت · يشير السهم إلى زاوية القبلة من الشمال الحقيقي (N)
                </p>
              )}
            </div>
          </div>

          {/* Calculations & Guidance Column */}
          <div className="lg:col-span-6 space-y-5 text-right">
            <div>
              <div className="text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#c5a059] mb-1">
                QIBLA AZIMUTH & GUIDANCE
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
                اتجاه القبلة الشريفة
              </h3>
              <p className="text-sm text-[#d1c7b7] font-['Amiri',serif] mt-1">
                حساب فلكي دقيق لأقصر مسار دائري عظمى نحو الكعبة المشرفة بالمسجد الحرام
              </p>
            </div>

            {/* Primary Numerical Readout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#032018] border border-[#c5a059]/25">
                <div className="text-xs text-[#c5a059] font-['Amiri',serif]">زاوية القبلة من الشمال</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono tabular-nums text-[#dfbd69]" dir="ltr">
                    {qiblaBearing.toFixed(1)}°
                  </span>
                  <span className="text-base font-['Amiri',serif] text-[#fbf9f5]">
                    ({qiblaDirectionAr})
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#032018] border border-[#c5a059]/25">
                <div className="text-xs text-[#c5a059] font-['Amiri',serif]">المسافة إلى الكعبة المشرفة</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono tabular-nums text-[#fbf9f5]" dir="ltr">
                    {distanceToKaabaKm.toLocaleString('en-US')}
                  </span>
                  <span className="text-sm font-['Amiri',serif] text-[#d1c7b7]">كم تقريبًا</span>
                </div>
              </div>
            </div>

            {/* Practical Directional Explanation */}
            <div className="p-4 rounded-2xl bg-[#064e3b]/25 border border-[#c5a059]/20 space-y-2">
              <div className="text-sm font-bold font-['Amiri',serif] text-[#dfbd69]">
                {isAtMakkahCenter
                  ? 'أنت في رحاب مكة المكرمة'
                  : `توجيه عملي لمدينة ${location.cityNameAr}:`}
              </div>
              <p className="text-sm font-['Amiri',serif] text-[#f5efe6] leading-relaxed">
                {isAtMakkahCenter
                  ? 'أنت داخل نطاق مكة المكرمة بالقرب من المسجد الحرام، حيث تكون القبلة باتجاه الكعبة المشرفة مباشرة.'
                  : `انظر باتجاه الشمال الجغرافي الحقيقي ثم استدر مع عقارب الساعة بزاوية ${qiblaBearing.toFixed(
                      1
                    )}° نحو اتجاه (${qiblaDirectionAr}).`}
              </p>
            </div>

            {/* Active Coordinates & Quick GPS */}
            <div className="p-4 rounded-2xl bg-[#021812]/80 border border-[#c5a059]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 text-xs font-['Amiri',serif] text-[#b8ad9c]">
                <div className="flex items-center gap-1.5 text-[#fbf9f5] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#dfbd69]" />
                  <span>
                    {location.cityNameAr} — {location.countryAr}
                  </span>
                </div>
                <div className="font-mono tabular-nums text-[11px] text-[#c5a059]/80" dir="ltr">
                  Site: {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° · Kaaba:{' '}
                  {KAABA_COORDS.latitude.toFixed(4)}°, {KAABA_COORDS.longitude.toFixed(4)}°
                </div>
              </div>

              <button
                onClick={requestGeolocation}
                disabled={geoLoading}
                className="px-3.5 py-2 rounded-xl border border-[#c5a059]/30 hover:border-[#dfbd69] bg-[#064e3b]/30 hover:bg-[#064e3b]/60 text-xs font-['Amiri',serif] text-[#dfbd69] transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {geoLoading ? 'جاري تحديد الموقع...' : 'تحديث بإحداثيات موقعي (GPS)'}
              </button>
            </div>

            {/* Honest Calibration / Magnetic Interference Notice */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#032018]/60 border border-[#c5a059]/15 text-xs text-[#b8ad9c] font-['Amiri',serif] leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-[#dfbd69] shrink-0 mt-0.5" />
              <span>
                ملاحظة للدقة: قد تتأثر البوصلة المغناطيسية في الهواتف بالمعادن القريبة أو الأغطية المغناطيسية أو الأجهزة الإلكترونية. يُنصح بحمل الهاتف أفقيًا بعيدًا عن المعادن أو معايرته بتحريكه على شكل رقم (8).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
