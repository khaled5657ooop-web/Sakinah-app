import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ALL_PRAYER_CITIES,
  DEFAULT_CITY,
  OBLIGATORY_PRAYER_KEYS,
  ObligatoryPrayerKey,
  PRAYER_CALCULATION_METHODS,
  PRAYER_LABELS_AR,
  PrayerCity,
} from '../data/prayerLocations';
import {
  ConvertedIslamicOccasion,
  DEFAULT_TUNE_OFFSETS,
  PrayerDayData,
  PrayerScheduleState,
  TuneOffsets,
  calculateDistanceToKaabaKm,
  calculateQiblaBearing,
  computePrayerScheduleState,
  fetchIslamicOccasionsForHijriYear,
  fetchTodayAndTomorrowTimings,
  getArabicCardinalDirection,
  getLocationTimeParts,
} from '../services/prayerApi';

export interface ActiveLocation {
  cityId: string | null;
  cityNameAr: string;
  countryAr: string;
  latitude: number;
  longitude: number;
  isGeolocation: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderMinutesBefore: number;
  prayers: Record<ObligatoryPrayerKey, boolean>;
}

interface PrayerContextValue {
  location: ActiveLocation;
  methodId: number;
  school: 0 | 1;
  tuneOffsets: TuneOffsets;
  use12Hour: boolean;
  todayData: PrayerDayData | null;
  tomorrowData: PrayerDayData | null;
  scheduleState: PrayerScheduleState | null;
  loading: boolean;
  error: string | null;
  geoLoading: boolean;
  geoError: string | null;
  occasions: ConvertedIslamicOccasion[];
  occasionsLoading: boolean;
  qiblaBearing: number;
  qiblaDirectionAr: string;
  distanceToKaabaKm: number;
  methodNameAr: string;
  notificationSettings: NotificationSettings;
  notificationPermission: NotificationPermission | 'unsupported';
  selectCity: (city: PrayerCity, alsoUseDefaultMethod?: boolean) => void;
  setMethodId: (id: number) => void;
  setSchool: (school: 0 | 1) => void;
  setTuneOffset: (key: keyof TuneOffsets, minutes: number) => void;
  resetTuneOffsets: () => void;
  setUse12Hour: (val: boolean) => void;
  requestGeolocation: () => void;
  refreshTimings: () => void;
  updateNotificationSettings: (partial: Partial<NotificationSettings>) => void;
  toggleNotificationPrayer: (prayer: ObligatoryPrayerKey) => void;
  requestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
  sendTestNotification: () => boolean;
}

const STORAGE_KEYS = {
  LOCATION: 'sakinah_prayer_location_v1',
  METHOD: 'sakinah_prayer_method_v1',
  SCHOOL: 'sakinah_prayer_school_v1',
  TUNE: 'sakinah_prayer_tune_v1',
  FORMAT_12H: 'sakinah_prayer_12h_v1',
  NOTIFICATIONS: 'sakinah_prayer_notifications_v1',
} as const;

const DEFAULT_LOCATION: ActiveLocation = {
  cityId: DEFAULT_CITY.id,
  cityNameAr: DEFAULT_CITY.nameAr,
  countryAr: DEFAULT_CITY.countryAr,
  latitude: DEFAULT_CITY.latitude,
  longitude: DEFAULT_CITY.longitude,
  isGeolocation: false,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: false,
  reminderMinutesBefore: 0,
  prayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const PrayerContext = createContext<PrayerContextValue | null>(null);

export const PrayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<ActiveLocation>(() =>
    readStorage<ActiveLocation>(STORAGE_KEYS.LOCATION, DEFAULT_LOCATION)
  );
  const [methodId, setMethodIdState] = useState<number>(() =>
    readStorage<number>(STORAGE_KEYS.METHOD, DEFAULT_CITY.defaultMethodId)
  );
  const [school, setSchoolState] = useState<0 | 1>(() =>
    readStorage<0 | 1>(STORAGE_KEYS.SCHOOL, 0)
  );
  const [tuneOffsets, setTuneOffsets] = useState<TuneOffsets>(() =>
    readStorage<TuneOffsets>(STORAGE_KEYS.TUNE, DEFAULT_TUNE_OFFSETS)
  );
  const [use12Hour, setUse12HourState] = useState<boolean>(() =>
    readStorage<boolean>(STORAGE_KEYS.FORMAT_12H, true)
  );
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    readStorage<NotificationSettings>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS)
  );
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const [todayData, setTodayData] = useState<PrayerDayData | null>(null);
  const [tomorrowData, setTomorrowData] = useState<PrayerDayData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [occasions, setOccasions] = useState<ConvertedIslamicOccasion[]>([]);
  const [occasionsLoading, setOccasionsLoading] = useState<boolean>(false);

  const [now, setNow] = useState<Date>(() => new Date());
  const [fetchNonce, setFetchNonce] = useState<number>(0);
  const knownTimezoneRef = useRef<string | undefined>(undefined);
  const activeDateKeyRef = useRef<string | null>(null);
  const sentNotificationsRef = useRef<Set<string>>(new Set());

  // Persist user preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
    } catch {
      // ignore
    }
  }, [location]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.METHOD, JSON.stringify(methodId));
    } catch {
      // ignore
    }
  }, [methodId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
    } catch {
      // ignore
    }
  }, [school]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TUNE, JSON.stringify(tuneOffsets));
    } catch {
      // ignore
    }
  }, [tuneOffsets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORMAT_12H, JSON.stringify(use12Hour));
    } catch {
      // ignore
    }
  }, [use12Hour]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationSettings));
    } catch {
      // ignore
    }
  }, [notificationSettings]);

  // Fetch prayer timings from AlAdhan API
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchTodayAndTomorrowTimings({
      latitude: location.latitude,
      longitude: location.longitude,
      methodId,
      school,
      tune: tuneOffsets,
      knownTimezone: knownTimezoneRef.current,
      signal: controller.signal,
    })
      .then(({ today, tomorrow }) => {
        knownTimezoneRef.current = today.timezone;
        const locParts = getLocationTimeParts(today.timezone, new Date());
        activeDateKeyRef.current = locParts.dateKey;
        setTodayData(today);
        setTomorrowData(tomorrow);
        setLoading(false);
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch prayer times:', err);
        setError('تعذر جلب مواقيت الصلاة حاليًا من الخادم المعتمد. يرجى التحقق من الاتصال ثم إعادة المحاولة.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [
    location.latitude,
    location.longitude,
    methodId,
    school,
    tuneOffsets,
    fetchNonce,
  ]);

  // Fetch Islamic occasions for the current Hijri year from AlAdhan hToG endpoint
  const hijriYear = todayData?.hijri.year;
  useEffect(() => {
    if (!hijriYear) return;
    const controller = new AbortController();
    setOccasionsLoading(true);

    fetchIslamicOccasionsForHijriYear(hijriYear, controller.signal)
      .then(items => {
        setOccasions(items);
        setOccasionsLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOccasionsLoading(false);
        }
      });

    return () => controller.abort();
  }, [hijriYear]);

  // Real-time 1-second tick + automatic midnight rollover detection in target location's timezone
  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = new Date();
      setNow(current);

      if (todayData?.timezone) {
        const currentLocDateKey = getLocationTimeParts(todayData.timezone, current).dateKey;
        if (activeDateKeyRef.current && activeDateKeyRef.current !== currentLocDateKey) {
          activeDateKeyRef.current = currentLocDateKey;
          setFetchNonce(n => n + 1);
        }
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [todayData?.timezone]);

  const scheduleState = useMemo<PrayerScheduleState | null>(() => {
    if (!todayData || !tomorrowData) return null;
    return computePrayerScheduleState({
      today: todayData,
      tomorrow: tomorrowData,
      use12Hour,
      now,
    });
  }, [todayData, tomorrowData, use12Hour, now]);

  // Optional browser notification dispatcher while tab remains open
  useEffect(() => {
    if (
      !notificationSettings.enabled ||
      notificationPermission !== 'granted' ||
      !todayData ||
      typeof window === 'undefined' ||
      !('Notification' in window)
    ) {
      return;
    }

    const locParts = getLocationTimeParts(todayData.timezone, now);
    const nowMinutes = locParts.hour * 60 + locParts.minute;
    const offset = notificationSettings.reminderMinutesBefore;

    for (const key of OBLIGATORY_PRAYER_KEYS) {
      if (!notificationSettings.prayers[key]) continue;
      const [h, m] = todayData.timings[key].split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) continue;

      const prayerMinutes = h * 60 + m;
      const triggerMinutes = prayerMinutes - offset;
      const dedupeKey = `${locParts.dateKey}:${key}:${offset}`;

      if (nowMinutes === triggerMinutes && !sentNotificationsRef.current.has(dedupeKey)) {
        sentNotificationsRef.current.add(dedupeKey);
        const prayerLabel = PRAYER_LABELS_AR[key].nameAr;
        const body =
          offset > 0
            ? `اقترب موعد صلاة ${prayerLabel} بعد ${offset} دقائق في ${location.cityNameAr}.`
            : `حان الآن موعد أذان ${prayerLabel} في ${location.cityNameAr}.`;

        try {
          new Notification(`سَكِينَة — صلاة ${prayerLabel}`, {
            body,
            tag: dedupeKey,
          });
        } catch {
          // Ignore environments blocking direct Notification constructor
        }
      }
    }
  }, [now, notificationSettings, notificationPermission, todayData, location.cityNameAr]);

  const selectCity = useCallback((city: PrayerCity, alsoUseDefaultMethod = true) => {
    knownTimezoneRef.current = undefined;
    setGeoError(null);
    setLocation({
      cityId: city.id,
      cityNameAr: city.nameAr,
      countryAr: city.countryAr,
      latitude: city.latitude,
      longitude: city.longitude,
      isGeolocation: false,
    });
    if (alsoUseDefaultMethod) {
      setMethodIdState(city.defaultMethodId);
    }
  }, []);

  const setMethodId = useCallback((id: number) => {
    setMethodIdState(id);
  }, []);

  const setSchool = useCallback((nextSchool: 0 | 1) => {
    setSchoolState(nextSchool);
  }, []);

  const setTuneOffset = useCallback((key: keyof TuneOffsets, minutes: number) => {
    const clamped = Math.max(-30, Math.min(30, minutes));
    setTuneOffsets(prev => ({ ...prev, [key]: clamped }));
  }, []);

  const resetTuneOffsets = useCallback(() => {
    setTuneOffsets(DEFAULT_TUNE_OFFSETS);
  }, []);

  const setUse12Hour = useCallback((val: boolean) => {
    setUse12HourState(val);
  }, []);

  const refreshTimings = useCallback(() => {
    setFetchNonce(n => n + 1);
  }, []);

  const requestGeolocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('المتصفح الحالي لا يدعم خدمة تحديد الموقع الجغرافي. يمكنك اختيار مدينتك يدويًا.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        knownTimezoneRef.current = undefined;

        // Find nearest known city if within ~35km for friendly Arabic label, otherwise show coordinate label
        let matchedCity: PrayerCity | null = null;
        let minDiff = Infinity;
        for (const c of ALL_PRAYER_CITIES) {
          const d = Math.hypot(c.latitude - lat, c.longitude - lng);
          if (d < minDiff) {
            minDiff = d;
            matchedCity = c;
          }
        }

        const isNearKnownCity = matchedCity && minDiff < 0.35;

        setLocation({
          cityId: null,
          cityNameAr: isNearKnownCity ? `${matchedCity!.nameAr} (موقعي)` : 'موقعي الجغرافي الحالي',
          countryAr: isNearKnownCity
            ? matchedCity!.countryAr
            : `${lat.toFixed(2)}°، ${lng.toFixed(2)}°`,
          latitude: lat,
          longitude: lng,
          isGeolocation: true,
        });
        setGeoLoading(false);
      },
      err => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('لم يتم منح إذن الموقع الجغرافي. يمكنك المتابعة باختيار الدولة والمدينة يدويًا.');
        } else if (err.code === err.TIMEOUT) {
          setGeoError('انتهت مهلة تحديد الموقع. يمكنك المحاولة مجددًا أو اختيار المدينة يدويًا.');
        } else {
          setGeoError('تعذر تحديد موقعك تلقائيًا. يرجى اختيار الدولة والمدينة يدويًا.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const updateNotificationSettings = useCallback((partial: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const toggleNotificationPrayer = useCallback((prayer: ObligatoryPrayerKey) => {
    setNotificationSettings(prev => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [prayer]: !prev.prayers[prayer],
      },
    }));
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      if (result === 'granted') {
        setNotificationSettings(prev => ({ ...prev, enabled: true }));
      } else {
        setNotificationSettings(prev => ({ ...prev, enabled: false }));
      }
      return result;
    } catch {
      return Notification.permission;
    }
  }, []);

  const sendTestNotification = useCallback((): boolean => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }
    try {
      new Notification('سَكِينَة — تجربة تنبيه الصلاة', {
        body: `التنبيهات مفعّلة بنجاح لمدينة ${location.cityNameAr} ما دامت هذه الصفحة مفتوحة.`,
      });
      return true;
    } catch {
      return false;
    }
  }, [location.cityNameAr]);

  const qiblaBearing = useMemo(
    () => calculateQiblaBearing(location.latitude, location.longitude),
    [location.latitude, location.longitude]
  );

  const qiblaDirectionAr = useMemo(
    () => getArabicCardinalDirection(qiblaBearing),
    [qiblaBearing]
  );

  const distanceToKaabaKm = useMemo(
    () => calculateDistanceToKaabaKm(location.latitude, location.longitude),
    [location.latitude, location.longitude]
  );

  const methodNameAr = useMemo(() => {
    const found = PRAYER_CALCULATION_METHODS.find(m => m.id === methodId);
    return found ? found.nameAr : todayData?.methodName || 'طريقة حساب معتمدة';
  }, [methodId, todayData?.methodName]);

  const value: PrayerContextValue = {
    location,
    methodId,
    school,
    tuneOffsets,
    use12Hour,
    todayData,
    tomorrowData,
    scheduleState,
    loading,
    error,
    geoLoading,
    geoError,
    occasions,
    occasionsLoading,
    qiblaBearing,
    qiblaDirectionAr,
    distanceToKaabaKm,
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
    refreshTimings,
    updateNotificationSettings,
    toggleNotificationPrayer,
    requestNotificationPermission,
    sendTestNotification,
  };

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
};

export function usePrayer(): PrayerContextValue {
  const ctx = useContext(PrayerContext);
  if (!ctx) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return ctx;
}
