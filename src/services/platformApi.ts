export interface DailyAyahPayload {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  text: string;
  theme: string;
  reflection: string;
  audioUrl?: string;
  sourceName?: string;
}

export interface DailyHadithPayload {
  id: string;
  matn: string;
  narrator: string;
  collectionId: string;
  collectionName: string;
  hadithNumber: number;
  bookName?: string;
  chapterName?: string;
  grade: 'صحيح' | 'حسن' | 'ضعيف' | 'غير محدد';
  gradeScholar: string;
  category: string;
  categoryName: string;
  explanation?: string;
  sourceName?: string;
}

export interface DailyAdhkarPayload {
  id: string;
  text: string;
  source: string;
  count: number;
  virtue?: string;
  categoryId: string;
  categoryTitle: string;
}

export interface DailyDuaPayload {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  type: 'quran' | 'sunnah';
  text: string;
  source: string;
  merit?: string;
}

export interface DailySnapshotEnvelope<T> {
  payload: T;
  fetchedAt: string;
  dateKey: string;
  sourceId: string;
}

export interface DailyPlatformBundle {
  lastSuccessfulUpdate: string | null;
  ayah: DailySnapshotEnvelope<DailyAyahPayload> | null;
  hadith: DailySnapshotEnvelope<DailyHadithPayload> | null;
  adhkar: DailySnapshotEnvelope<DailyAdhkarPayload> | null;
  dua: DailySnapshotEnvelope<DailyDuaPayload> | null;
  prayer: DailySnapshotEnvelope<{
    city: string;
    method: string;
    hijri: { formattedAr: string };
  }> | null;
  reciters: {
    fetchedAt: string;
    totalApprovedReciters: number;
    upstreamVerifiedCount: number;
  } | null;
  fromOfflineBackup?: boolean;
}

export interface SiteRuntimeConfigResponse {
  versionTag: string;
  activatedAt: string;
  config: {
    showLastUpdatedBadge: boolean;
    calmNightReadingHint: boolean;
    weeklySunnahBanner: boolean;
    khatmahReminderCard: boolean;
    strictSecurityHeaders: boolean;
    announcementText: string | null;
  };
}

const DAILY_CACHE_KEY = 'sakinah_last_valid_daily_bundle_v1';
const CONFIG_CACHE_KEY = 'sakinah_last_valid_site_config_v1';

let inFlightDailyPromise: Promise<DailyPlatformBundle | null> | null = null;

export function readCachedDailyBundle(): DailyPlatformBundle | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DAILY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyPlatformBundle;
    return { ...parsed, fromOfflineBackup: true };
  } catch {
    return null;
  }
}

export async function fetchDailyPlatformBundle(): Promise<DailyPlatformBundle | null> {
  if (inFlightDailyPromise) return inFlightDailyPromise;

  inFlightDailyPromise = (async () => {
    try {
      const res = await fetch('/api/content/daily', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as DailyPlatformBundle;
      try {
        localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify(data));
      } catch {
        // ignore storage quota errors
      }
      return { ...data, fromOfflineBackup: false };
    } catch {
      return readCachedDailyBundle();
    } finally {
      inFlightDailyPromise = null;
    }
  })();

  return inFlightDailyPromise;
}

export async function fetchSiteRuntimeConfig(): Promise<SiteRuntimeConfigResponse | null> {
  try {
    const res = await fetch('/api/site/config', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as SiteRuntimeConfigResponse;
    try {
      localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
    return data;
  } catch {
    try {
      const cached = localStorage.getItem(CONFIG_CACHE_KEY);
      return cached ? (JSON.parse(cached) as SiteRuntimeConfigResponse) : null;
    } catch {
      return null;
    }
  }
}

export function formatArabicUpdateTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return 'محفوظ محليًا';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function sendTelemetryEvent(params: {
  eventType: 'pageview' | 'performance' | 'error' | 'broken_asset' | 'interaction';
  route: string;
  durationMs?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const viewportType = window.innerWidth < 768 ? 'mobile' : 'desktop';
    const payload = JSON.stringify({
      ...params,
      viewportType,
    });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry', blob);
    } else {
      void fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // never interrupt UX on telemetry failures
  }
}
