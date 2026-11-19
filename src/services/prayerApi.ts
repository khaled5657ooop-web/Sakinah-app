import {
  DISPLAY_TIMING_KEYS,
  HIJRI_MONTHS_AR,
  ISLAMIC_OCCASIONS,
  OBLIGATORY_PRAYER_KEYS,
  ObligatoryPrayerKey,
  PRAYER_LABELS_AR,
  PrayerKey,
} from '../data/prayerLocations';

export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
} as const;

export interface TuneOffsets {
  Fajr: number;
  Sunrise: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Isha: number;
}

export const DEFAULT_TUNE_OFFSETS: TuneOffsets = {
  Fajr: 0,
  Sunrise: 0,
  Dhuhr: 0,
  Asr: 0,
  Maghrib: 0,
  Isha: 0,
};

export interface AlAdhanTimingsMap {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface HijriDateInfo {
  day: number;
  monthNumber: number;
  monthNameAr: string;
  monthNameEn: string;
  year: number;
  weekdayAr: string;
  formattedAr: string;
  dateStr: string;
  holidays: string[];
}

export interface GregorianDateInfo {
  day: number;
  monthNumber: number;
  monthNameEn: string;
  monthNameAr: string;
  year: number;
  dateStr: string;
  formattedAr: string;
}

export interface PrayerDayData {
  timings: AlAdhanTimingsMap;
  hijri: HijriDateInfo;
  gregorian: GregorianDateInfo;
  timezone: string;
  methodId: number;
  methodName: string;
  school: number;
}

export interface LocationTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateKey: string; // YYYY-MM-DD
  ddmmyyyy: string; // DD-MM-YYYY
}

export interface PrayerScheduleState {
  currentTime24: string;
  currentTimeFormatted: string;
  currentPrayerStatus: string;
  nextPrayer: {
    key: ObligatoryPrayerKey;
    nameAr: string;
    time24: string;
    timeFormatted: string;
    isTomorrow: boolean;
  };
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  passedPrayers: Record<PrayerKey, boolean>;
  progressPercent: number;
}

export interface ConvertedIslamicOccasion {
  id: string;
  titleAr: string;
  descriptionAr: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthNameAr: string;
  hijriYear: number;
  gregorianDateFormattedAr: string;
  gregorianDateStr: string;
  gregorianTimestampMs: number;
}

const GREGORIAN_MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function stripTimeZoneSuffix(rawTime: string): string {
  // AlAdhan sometimes appends " (AST)" or " (+03)"
  const match = rawTime.match(/(\d{1,2}:\d{2})/);
  if (!match) return rawTime.trim();
  const [h, m] = match[1].split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Great-circle initial bearing from (lat, lng) to Kaaba in degrees clockwise from true North [0, 360).
 */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const lat1 = toRadians(latitude);
  const lon1 = toRadians(longitude);
  const lat2 = toRadians(KAABA_COORDS.latitude);
  const lon2 = toRadians(KAABA_COORDS.longitude);

  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

/**
 * Haversine distance to Makkah / Kaaba in kilometers.
 */
export function calculateDistanceToKaabaKm(latitude: number, longitude: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(KAABA_COORDS.latitude - latitude);
  const dLon = toRadians(KAABA_COORDS.longitude - longitude);
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA_COORDS.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getArabicCardinalDirection(bearing: number): string {
  const normalized = ((bearing % 360) + 360) % 360;
  const directions = [
    'شمال',
    'شمال شرق',
    'شرق',
    'جنوب شرق',
    'جنوب',
    'جنوب غرب',
    'غرب',
    'شمال غرب',
  ];
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

export function formatTimeDisplay(time24: string, use12Hour: boolean): string {
  const clean = stripTimeZoneSuffix(time24);
  const [hStr, mStr] = clean.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return clean;

  if (!use12Hour) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const period = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatClockDisplay(hour: number, minute: number, second: number, use12Hour: boolean): string {
  const mm = String(minute).padStart(2, '0');
  const ss = String(second).padStart(2, '0');
  if (!use12Hour) {
    return `${String(hour).padStart(2, '0')}:${mm}:${ss}`;
  }
  const period = hour >= 12 ? 'م' : 'ص';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, '0')}:${mm}:${ss} ${period}`;
}

export function getLocationTimeParts(timezone: string, date: Date = new Date()): LocationTimeParts {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(date);
    const getNum = (type: Intl.DateTimeFormatPartTypes) => {
      const val = parts.find(p => p.type === type)?.value || '0';
      return Number(val);
    };

    const year = getNum('year');
    const month = getNum('month');
    const day = getNum('day');
    const hour = getNum('hour') % 24;
    const minute = getNum('minute');
    const second = getNum('second');

    const yyyy = String(year).padStart(4, '0');
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      dateKey: `${yyyy}-${mm}-${dd}`,
      ddmmyyyy: `${dd}-${mm}-${yyyy}`,
    };
  } catch {
    // Fallback to UTC if an invalid IANA timezone string is ever passed
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();

    const yyyy = String(year).padStart(4, '0');
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      dateKey: `${yyyy}-${mm}-${dd}`,
      ddmmyyyy: `${dd}-${mm}-${yyyy}`,
    };
  }
}

export function addDaysToCalendarDate(year: number, month: number, day: number, deltaDays: number): {
  year: number;
  month: number;
  day: number;
  ddmmyyyy: string;
} {
  const utc = new Date(Date.UTC(year, month - 1, day + deltaDays));
  const y = utc.getUTCFullYear();
  const m = utc.getUTCMonth() + 1;
  const d = utc.getUTCDate();
  return {
    year: y,
    month: m,
    day: d,
    ddmmyyyy: `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${String(y).padStart(4, '0')}`,
  };
}

function parseAlAdhanDayPayload(data: any): PrayerDayData {
  const t = data.timings;
  const h = data.date.hijri;
  const g = data.date.gregorian;
  const meta = data.meta;

  const hijriDay = Number(h.day);
  const hijriMonthNum = Number(h.month.number);
  const hijriYear = Number(h.year);
  const hijriMonthAr = h.month.ar || HIJRI_MONTHS_AR[hijriMonthNum - 1] || '';
  const weekdayAr = h.weekday?.ar || '';

  const gregDay = Number(g.day);
  const gregMonthNum = Number(g.month.number);
  const gregYear = Number(g.year);
  const gregMonthAr = GREGORIAN_MONTHS_AR[gregMonthNum - 1] || g.month.en;

  return {
    timings: {
      Fajr: stripTimeZoneSuffix(t.Fajr),
      Sunrise: stripTimeZoneSuffix(t.Sunrise),
      Dhuhr: stripTimeZoneSuffix(t.Dhuhr),
      Asr: stripTimeZoneSuffix(t.Asr),
      Maghrib: stripTimeZoneSuffix(t.Maghrib),
      Isha: stripTimeZoneSuffix(t.Isha),
      Imsak: stripTimeZoneSuffix(t.Imsak),
      Midnight: stripTimeZoneSuffix(t.Midnight),
      Firstthird: stripTimeZoneSuffix(t.Firstthird),
      Lastthird: stripTimeZoneSuffix(t.Lastthird),
    },
    hijri: {
      day: hijriDay,
      monthNumber: hijriMonthNum,
      monthNameAr: hijriMonthAr,
      monthNameEn: h.month.en,
      year: hijriYear,
      weekdayAr,
      formattedAr: `${weekdayAr ? weekdayAr + '، ' : ''}${hijriDay} ${hijriMonthAr} ${hijriYear} هـ`,
      dateStr: h.date,
      holidays: Array.isArray(h.holidays) ? h.holidays : [],
    },
    gregorian: {
      day: gregDay,
      monthNumber: gregMonthNum,
      monthNameEn: g.month.en,
      monthNameAr: gregMonthAr,
      year: gregYear,
      dateStr: g.date,
      formattedAr: `${gregDay} ${gregMonthAr} ${gregYear} م`,
    },
    timezone: meta.timezone,
    methodId: meta.method?.id ?? 4,
    methodName: meta.method?.name ?? '',
    school: meta.school === 'HANAFI' ? 1 : 0,
  };
}

function buildTuneParam(tune: TuneOffsets): string {
  // AlAdhan tune order: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight
  return `0,${tune.Fajr},${tune.Sunrise},${tune.Dhuhr},${tune.Asr},${tune.Maghrib},0,${tune.Isha},0`;
}

export async function fetchPrayerTimingsForDate(params: {
  ddmmyyyy: string;
  latitude: number;
  longitude: number;
  methodId: number;
  school: 0 | 1;
  tune: TuneOffsets;
  signal?: AbortSignal;
}): Promise<PrayerDayData> {
  const { ddmmyyyy, latitude, longitude, methodId, school, tune, signal } = params;
  const search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    method: String(methodId),
    school: String(school),
    tune: buildTuneParam(tune),
  });

  const url = `https://api.aladhan.com/v1/timings/${ddmmyyyy}?${search.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.code !== 200 || !json.data) {
    throw new Error(json.status || 'Invalid AlAdhan API response');
  }
  return parseAlAdhanDayPayload(json.data);
}

/**
 * Fetches accurate today + tomorrow timings strictly aligned with the target location's IANA timezone.
 */
export async function fetchTodayAndTomorrowTimings(params: {
  latitude: number;
  longitude: number;
  methodId: number;
  school: 0 | 1;
  tune: TuneOffsets;
  knownTimezone?: string;
  now?: Date;
  signal?: AbortSignal;
}): Promise<{ today: PrayerDayData; tomorrow: PrayerDayData }> {
  const now = params.now || new Date();

  let todayData: PrayerDayData;
  if (params.knownTimezone) {
    const locNow = getLocationTimeParts(params.knownTimezone, now);
    todayData = await fetchPrayerTimingsForDate({
      ddmmyyyy: locNow.ddmmyyyy,
      latitude: params.latitude,
      longitude: params.longitude,
      methodId: params.methodId,
      school: params.school,
      tune: params.tune,
      signal: params.signal,
    });
  } else {
    // Initial probe using UTC date, then check if location timezone is on a different calendar day
    const utcNow = getLocationTimeParts('UTC', now);
    const probe = await fetchPrayerTimingsForDate({
      ddmmyyyy: utcNow.ddmmyyyy,
      latitude: params.latitude,
      longitude: params.longitude,
      methodId: params.methodId,
      school: params.school,
      tune: params.tune,
      signal: params.signal,
    });
    const locNow = getLocationTimeParts(probe.timezone, now);
    if (locNow.ddmmyyyy === utcNow.ddmmyyyy) {
      todayData = probe;
    } else {
      todayData = await fetchPrayerTimingsForDate({
        ddmmyyyy: locNow.ddmmyyyy,
        latitude: params.latitude,
        longitude: params.longitude,
        methodId: params.methodId,
        school: params.school,
        tune: params.tune,
        signal: params.signal,
      });
    }
  }

  const locParts = getLocationTimeParts(todayData.timezone, now);
  const tomorrowCal = addDaysToCalendarDate(locParts.year, locParts.month, locParts.day, 1);

  const tomorrowData = await fetchPrayerTimingsForDate({
    ddmmyyyy: tomorrowCal.ddmmyyyy,
    latitude: params.latitude,
    longitude: params.longitude,
    methodId: params.methodId,
    school: params.school,
    tune: params.tune,
    signal: params.signal,
  });

  return { today: todayData, tomorrow: tomorrowData };
}

function time24ToSecondsOfDay(time24: string): number {
  const clean = stripTimeZoneSuffix(time24);
  const [h, m] = clean.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60;
}

/**
 * Computes real-time countdown, current prayer status, and passed status strictly in the selected location's timezone.
 */
export function computePrayerScheduleState(params: {
  today: PrayerDayData;
  tomorrow: PrayerDayData;
  use12Hour: boolean;
  now?: Date;
}): PrayerScheduleState {
  const { today, tomorrow, use12Hour, now = new Date() } = params;
  const locNow = getLocationTimeParts(today.timezone, now);
  const nowSec = locNow.hour * 3600 + locNow.minute * 60 + locNow.second;

  const fajrSec = time24ToSecondsOfDay(today.timings.Fajr);
  const sunriseSec = time24ToSecondsOfDay(today.timings.Sunrise);
  const dhuhrSec = time24ToSecondsOfDay(today.timings.Dhuhr);
  const asrSec = time24ToSecondsOfDay(today.timings.Asr);
  const maghribSec = time24ToSecondsOfDay(today.timings.Maghrib);
  const ishaSec = time24ToSecondsOfDay(today.timings.Isha);

  const passedPrayers: Record<PrayerKey, boolean> = {
    Fajr: nowSec >= fajrSec,
    Sunrise: nowSec >= sunriseSec,
    Dhuhr: nowSec >= dhuhrSec,
    Asr: nowSec >= asrSec,
    Maghrib: nowSec >= maghribSec,
    Isha: nowSec >= ishaSec,
  };

  // Determine current prayer status window
  let currentPrayerStatus = 'وقت قيام الليل وثلثه الأخير';
  if (nowSec >= ishaSec) {
    currentPrayerStatus = 'الآن وقت صلاة العشاء';
  } else if (nowSec >= maghribSec) {
    currentPrayerStatus = 'الآن وقت صلاة المغرب';
  } else if (nowSec >= asrSec) {
    currentPrayerStatus = 'الآن وقت صلاة العصر';
  } else if (nowSec >= dhuhrSec) {
    currentPrayerStatus = 'الآن وقت صلاة الظهر';
  } else if (nowSec >= sunriseSec) {
    currentPrayerStatus = 'وقت الضحى — بعد الشروق';
  } else if (nowSec >= fajrSec) {
    currentPrayerStatus = 'الآن وقت صلاة الفجر';
  }

  // Determine next obligatory prayer + countdown seconds + progress since previous event
  let nextKey: ObligatoryPrayerKey = 'Fajr';
  let nextTime24 = today.timings.Fajr;
  let isTomorrow = false;
  let remainingSeconds = 0;
  let windowDurationSeconds = 1;
  let elapsedSeconds = 0;

  const prayerCheckpoints: { key: ObligatoryPrayerKey; sec: number; time24: string }[] = [
    { key: 'Fajr', sec: fajrSec, time24: today.timings.Fajr },
    { key: 'Dhuhr', sec: dhuhrSec, time24: today.timings.Dhuhr },
    { key: 'Asr', sec: asrSec, time24: today.timings.Asr },
    { key: 'Maghrib', sec: maghribSec, time24: today.timings.Maghrib },
    { key: 'Isha', sec: ishaSec, time24: today.timings.Isha },
  ];

  const foundIdx = prayerCheckpoints.findIndex(p => nowSec < p.sec);

  if (foundIdx !== -1) {
    const nextItem = prayerCheckpoints[foundIdx];
    nextKey = nextItem.key;
    nextTime24 = nextItem.time24;
    remainingSeconds = nextItem.sec - nowSec;

    if (foundIdx === 0) {
      // Before today's Fajr (after midnight): window from 00:00 (approx 5h prior) or previous Isha (~20:00 -> Fajr)
      // Use a clean 6-hour pre-Fajr span if unknown yesterday Isha
      const prevApproxSec = -5 * 3600;
      windowDurationSeconds = nextItem.sec - prevApproxSec;
      elapsedSeconds = nowSec - prevApproxSec;
    } else {
      const prevSec = prayerCheckpoints[foundIdx - 1].sec;
      windowDurationSeconds = Math.max(1, nextItem.sec - prevSec);
      elapsedSeconds = nowSec - prevSec;
    }
  } else {
    // After today's Isha -> countdown to tomorrow's Fajr
    isTomorrow = true;
    nextKey = 'Fajr';
    nextTime24 = tomorrow.timings.Fajr;
    const tomorrowFajrSec = time24ToSecondsOfDay(tomorrow.timings.Fajr);
    remainingSeconds = 86400 - nowSec + tomorrowFajrSec;
    windowDurationSeconds = Math.max(1, 86400 - ishaSec + tomorrowFajrSec);
    elapsedSeconds = nowSec - ishaSec;
  }

  remainingSeconds = Math.max(0, remainingSeconds);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSeconds / windowDurationSeconds) * 100)));

  return {
    currentTime24: `${String(locNow.hour).padStart(2, '0')}:${String(locNow.minute).padStart(2, '0')}:${String(locNow.second).padStart(2, '0')}`,
    currentTimeFormatted: formatClockDisplay(locNow.hour, locNow.minute, locNow.second, use12Hour),
    currentPrayerStatus,
    nextPrayer: {
      key: nextKey,
      nameAr: PRAYER_LABELS_AR[nextKey].nameAr,
      time24: nextTime24,
      timeFormatted: formatTimeDisplay(nextTime24, use12Hour),
      isTomorrow,
    },
    countdown: {
      hours,
      minutes,
      seconds,
      totalSeconds: remainingSeconds,
    },
    passedPrayers,
    progressPercent,
  };
}

const occasionsCache = new Map<number, ConvertedIslamicOccasion[]>();

export async function fetchIslamicOccasionsForHijriYear(
  hijriYear: number,
  signal?: AbortSignal
): Promise<ConvertedIslamicOccasion[]> {
  const cached = occasionsCache.get(hijriYear);
  if (cached) return cached;

  const results = await Promise.allSettled(
    ISLAMIC_OCCASIONS.map(async (occ): Promise<ConvertedIslamicOccasion> => {
      const dd = String(occ.hijriDay).padStart(2, '0');
      const mm = String(occ.hijriMonth).padStart(2, '0');
      const url = `https://api.aladhan.com/v1/hToG/${dd}-${mm}-${hijriYear}`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 200 || !json.data?.gregorian) {
        throw new Error('Failed hToG conversion');
      }

      const g = json.data.gregorian;
      const gDay = Number(g.day);
      const gMonth = Number(g.month.number);
      const gYear = Number(g.year);
      const gMonthAr = GREGORIAN_MONTHS_AR[gMonth - 1] || g.month.en;

      return {
        id: occ.id,
        titleAr: occ.titleAr,
        descriptionAr: occ.descriptionAr,
        hijriDay: occ.hijriDay,
        hijriMonth: occ.hijriMonth,
        hijriMonthNameAr: HIJRI_MONTHS_AR[occ.hijriMonth - 1] || '',
        hijriYear,
        gregorianDateFormattedAr: `${gDay} ${gMonthAr} ${gYear} م`,
        gregorianDateStr: g.date,
        gregorianTimestampMs: Date.UTC(gYear, gMonth - 1, gDay),
      };
    })
  );

  const fulfilled = results
    .filter((r): r is PromiseFulfilledResult<ConvertedIslamicOccasion> => r.status === 'fulfilled')
    .map(r => r.value)
    .sort((a, b) => a.hijriMonth - b.hijriMonth || a.hijriDay - b.hijriDay);

  if (fulfilled.length > 0) {
    occasionsCache.set(hijriYear, fulfilled);
  }
  return fulfilled;
}

export { DISPLAY_TIMING_KEYS, OBLIGATORY_PRAYER_KEYS };
