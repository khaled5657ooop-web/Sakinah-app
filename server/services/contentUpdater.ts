import { db } from '../db.ts';
import { recordSystemAlert } from './alerts.ts';
import { AYAHS_OF_DAY } from '../../src/data/islamicContent.ts';
import { AUTHENTIC_HADITHS } from '../../src/data/hadithData.ts';
import { ADHKAR_CATEGORIES } from '../../src/data/adhkarData.ts';
import { DUAS_COLLECTION } from '../../src/data/duasData.ts';
import { QURAN_RECITERS } from '../../src/data/recitersData.ts';

interface CuratedAyahCandidate {
  key: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  theme: string;
  reflection: string;
  audioUrl: string;
  fallbackText: string;
}

const VERIFIED_AYAH_POOL: CuratedAyahCandidate[] = [
  {
    key: '13:28',
    surahNumber: 13,
    ayahNumber: 28,
    surahName: 'سورة الرعد',
    theme: 'الطمأنينة وسكينة الروح',
    reflection: 'إن ذكر الله هو الملاذ الأعظم الذي تسكن إليه النفوس الحائرة وتهدأ به القلوب المضطربة.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/013028.mp3',
    fallbackText: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  },
  {
    key: '2:186',
    surahNumber: 2,
    ayahNumber: 186,
    surahName: 'سورة البقرة',
    theme: 'القرب من الله والإجابة',
    reflection: 'نداء الرحمة الإلهية؛ فالله أقرب إلى العبد من حبل الوريد، يسمع النجوى ويجيب الدعاء.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002186.mp3',
    fallbackText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
  },
  {
    key: '94:5',
    surahNumber: 94,
    ayahNumber: 5,
    surahName: 'سورة الشرح',
    theme: 'اليقين بالفرج واليسر',
    reflection: 'بشرى ربانية محكمة بأن مع الشدة والضيق يسرًا وفرجًا قريبًا.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/094005.mp3',
    fallbackText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
  },
  {
    key: '2:152',
    surahNumber: 2,
    ayahNumber: 152,
    surahName: 'سورة البقرة',
    theme: 'ذكر الله والشكر',
    reflection: 'شرف عظيم أن يذكرك الخالق جل وعلا في الملأ الأعلى حين تذكره في نفسك.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002152.mp3',
    fallbackText: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
  },
  {
    key: '39:53',
    surahNumber: 39,
    ayahNumber: 53,
    surahName: 'سورة الزمر',
    theme: 'سعة رحمة الله والأمل',
    reflection: 'أرجى آية في كتاب الله تفتح باب الرجاء والتوبة لكل عبد أقبل على ربه.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/039053.mp3',
    fallbackText: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
  },
  {
    key: '65:3',
    surahNumber: 65,
    ayahNumber: 3,
    surahName: 'سورة الطلاق',
    theme: 'التوكل وكفاية الله',
    reflection: 'من صدق توكله على الله وفوّض إليه أمره كفاه الله ما أهمّه ويسّر له أسبابه.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/065003.mp3',
    fallbackText: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ',
  },
  {
    key: '2:286',
    surahNumber: 2,
    ayahNumber: 286,
    surahName: 'سورة البقرة',
    theme: 'رحمة التكليف واللطف',
    reflection: 'لطف الله بعباده في التكليف، فما كلّف نفسًا فوق طاقتها ووسعها.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002286.mp3',
    fallbackText: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
  },
  {
    key: '3:139',
    surahNumber: 3,
    ayahNumber: 139,
    surahName: 'سورة آل عمران',
    theme: 'العزيمة وعدم الحزن',
    reflection: 'تثبيت رباني لقلوب المؤمنين ألا تضعف أمام التحديات ما دامت متصلة بالله.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/003139.mp3',
    fallbackText: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
  },
  {
    key: '9:51',
    surahNumber: 9,
    ayahNumber: 51,
    surahName: 'سورة التوبة',
    theme: 'الرضا بالقضاء والتوكل',
    reflection: 'مفتاح السكينة أن يوقن القلب أن تدبير الله كله خير ولطف.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/009051.mp3',
    fallbackText: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ',
  },
  {
    key: '14:7',
    surahNumber: 14,
    ayahNumber: 7,
    surahName: 'سورة إبراهيم',
    theme: 'الشكر ودوام النعم',
    reflection: 'وعد صريح بأن شكر النعم بالقلب واللسان والعمل سبب لزيادتها وبركتها.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/014007.mp3',
    fallbackText: 'وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
  },
  {
    key: '20:46',
    surahNumber: 20,
    ayahNumber: 46,
    surahName: 'سورة طه',
    theme: 'المعية الإلهية',
    reflection: 'أعظم أسباب الأمان أن يستحضر العبد معية الله له سمعًا وبصرًا وتأييدًا.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/020046.mp3',
    fallbackText: 'قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ',
  },
  {
    key: '93:5',
    surahNumber: 93,
    ayahNumber: 5,
    surahName: 'سورة الضحى',
    theme: 'الرجاء والعطاء الرباني',
    reflection: 'وعد كريم يغمر الروح طمأنينة بأن القادم أجمل بإذن الله وعطائه.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/093005.mp3',
    fallbackText: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
  },
  {
    key: '24:35',
    surahNumber: 24,
    ayahNumber: 35,
    surahName: 'سورة النور',
    theme: 'نور الهداية في القلوب',
    reflection: 'إذا استنار القلب بنور الوحي والإيمان انقشعت عنه ظلمات الحيرة والضيق.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/024035.mp3',
    fallbackText: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
  },
  {
    key: '16:97',
    surahNumber: 16,
    ayahNumber: 97,
    surahName: 'سورة النحل',
    theme: 'الحياة الطيبة بالعمل الصالح',
    reflection: 'الحياة الطيبة ثمرة الإيمان الصادق والعمل الصالح، ولو قلّت أسباب الدنيا.',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/016097.mp3',
    fallbackText: 'مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً',
  },
];

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isSourceEnabled(sourceId: string): boolean {
  const row = db
    .prepare('SELECT enabled FROM content_sources WHERE id = ?')
    .get(sourceId) as { enabled: number } | undefined;
  return Boolean(row?.enabled);
}

function updateSourceStatus(sourceId: string, status: 'ok' | 'error' | 'disabled', errorMsg?: string): void {
  db.prepare(`
    UPDATE content_sources
    SET last_checked_at = ?, last_status = ?, last_error = ?
    WHERE id = ?
  `).run(new Date().toISOString(), status, errorMsg || null, sourceId);
}

function pickNonRepeating<T>(
  contentType: string,
  items: T[],
  getKey: (item: T) => string,
  windowSize: number
): T {
  const recentRows = db
    .prepare(
      'SELECT item_key FROM content_history WHERE content_type = ? ORDER BY id DESC LIMIT ?'
    )
    .all(contentType, windowSize) as { item_key: string }[];

  const recentSet = new Set(recentRows.map((r) => r.item_key));
  const unseen = items.filter((item) => !recentSet.has(getKey(item)));
  const pool = unseen.length > 0 ? unseen : items;

  const dateSeed = Number(getTodayDateKey().replace(/-/g, ''));
  return pool[dateSeed % pool.length] || items[0];
}

function upsertDailySnapshot(params: {
  contentType: string;
  dateKey: string;
  itemKey: string;
  sourceId: string;
  payload: unknown;
  recordHistory?: boolean;
}): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO daily_content (content_type, date_key, item_key, source_id, payload_json, is_verified, fetched_at)
    VALUES (?, ?, ?, ?, ?, 1, ?)
    ON CONFLICT(content_type, date_key) DO UPDATE SET
      item_key = excluded.item_key,
      source_id = excluded.source_id,
      payload_json = excluded.payload_json,
      fetched_at = excluded.fetched_at
  `).run(
    params.contentType,
    params.dateKey,
    params.itemKey,
    params.sourceId,
    JSON.stringify(params.payload),
    now
  );

  if (params.recordHistory) {
    const existingForDate = db
      .prepare('SELECT id FROM content_history WHERE content_type = ? AND date_key = ? LIMIT 1')
      .get(params.contentType, params.dateKey);
    if (!existingForDate) {
      db.prepare(`
        INSERT INTO content_history (content_type, item_key, date_key, created_at)
        VALUES (?, ?, ?, ?)
      `).run(params.contentType, params.itemKey, params.dateKey, now);
    }
  }
}

function getLatestSnapshot<T>(contentType: string): {
  payload: T;
  fetchedAt: string;
  dateKey: string;
  sourceId: string;
} | null {
  const row = db
    .prepare(`
      SELECT payload_json, fetched_at, date_key, source_id
      FROM daily_content
      WHERE content_type = ?
      ORDER BY date_key DESC, id DESC
      LIMIT 1
    `)
    .get(contentType) as
    | { payload_json: string; fetched_at: string; date_key: string; source_id: string }
    | undefined;

  if (!row) return null;
  try {
    return {
      payload: JSON.parse(row.payload_json) as T,
      fetchedAt: row.fetched_at,
      dateKey: row.date_key,
      sourceId: row.source_id,
    };
  } catch {
    return null;
  }
}

export async function refreshDailyAyah(forceNew = false): Promise<{ ok: boolean; usedFallback: boolean; error?: string }> {
  const dateKey = getTodayDateKey();
  if (!isSourceEnabled('quran_api')) {
    updateSourceStatus('quran_api', 'disabled', 'تم تعطيل المصدر من قِبل الإدارة');
    return { ok: false, usedFallback: true, error: 'المصدر معطل إداريًا' };
  }

  const candidate = forceNew
    ? pickNonRepeating('ayah', VERIFIED_AYAH_POOL, (a) => a.key, VERIFIED_AYAH_POOL.length - 1)
    : pickNonRepeating('ayah', VERIFIED_AYAH_POOL, (a) => a.key, VERIFIED_AYAH_POOL.length - 1);

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?verse_key=${encodeURIComponent(candidate.key)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      verses?: Array<{ text_uthmani?: string; verse_key?: string }>;
    };
    const uthmaniText = json.verses?.[0]?.text_uthmani?.trim();
    if (!uthmaniText) {
      throw new Error('استجابة غير مكتملة للنص العثماني من api.quran.com');
    }

    upsertDailySnapshot({
      contentType: 'ayah',
      dateKey,
      itemKey: candidate.key,
      sourceId: 'quran_api',
      payload: {
        surahName: candidate.surahName,
        surahNumber: candidate.surahNumber,
        ayahNumber: candidate.ayahNumber,
        text: uthmaniText,
        theme: candidate.theme,
        reflection: candidate.reflection,
        audioUrl: candidate.audioUrl,
        sourceName: 'Quran.com API v4 (النص العثماني المعتمد)',
      },
      recordHistory: true,
    });

    updateSourceStatus('quran_api', 'ok');
    return { ok: true, usedFallback: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
    updateSourceStatus('quran_api', 'error', msg);
    await recordSystemAlert({
      severity: 'warning',
      serviceName: 'تحديث آية اليوم',
      messageAr: 'تعذر الاتصال بمصدر القرآن الكريم الموثوق (api.quran.com)، تم الإبقاء على آخر نسخة صحيحة محفوظة.',
      details: msg,
    });

    const latest = getLatestSnapshot('ayah');
    if (!latest) {
      const seed = AYAHS_OF_DAY[0];
      upsertDailySnapshot({
        contentType: 'ayah',
        dateKey,
        itemKey: `${seed.surahNumber}:${seed.ayahNumber}`,
        sourceId: 'quran_api',
        payload: {
          surahName: seed.surahName,
          surahNumber: seed.surahNumber,
          ayahNumber: seed.ayahNumber,
          text: seed.text,
          theme: seed.theme,
          reflection: seed.reflection,
          audioUrl: seed.audioUrl,
          sourceName: 'النسخة الموثقة المحفوظة محليًا',
        },
        recordHistory: true,
      });
    }
    return { ok: false, usedFallback: true, error: msg };
  }
}

export async function refreshDailyHadith(): Promise<{ ok: boolean }> {
  const dateKey = getTodayDateKey();
  if (!isSourceEnabled('hadith_verified')) {
    updateSourceStatus('hadith_verified', 'disabled', 'تم تعطيل المصدر من قِبل الإدارة');
    return { ok: false };
  }

  const chosen = pickNonRepeating(
    'hadith',
    AUTHENTIC_HADITHS,
    (h) => h.id,
    Math.max(1, AUTHENTIC_HADITHS.length - 2)
  );

  upsertDailySnapshot({
    contentType: 'hadith',
    dateKey,
    itemKey: chosen.id,
    sourceId: 'hadith_verified',
    payload: {
      ...chosen,
      sourceName: `${chosen.collectionName} — ${chosen.gradeScholar}`,
    },
    recordHistory: true,
  });

  updateSourceStatus('hadith_verified', 'ok');
  return { ok: true };
}

export async function refreshDailyAdhkarAndDua(): Promise<{ ok: boolean }> {
  const dateKey = getTodayDateKey();
  if (!isSourceEnabled('adhkar_duas_verified')) {
    updateSourceStatus('adhkar_duas_verified', 'disabled', 'تم تعطيل المصدر من قِبل الإدارة');
    return { ok: false };
  }

  const allAdhkar = ADHKAR_CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categoryId: cat.id,
      categoryTitle: cat.title,
    }))
  );

  const dailyDhikr = pickNonRepeating('adhkar', allAdhkar, (d) => d.id, Math.max(1, allAdhkar.length - 3));
  const dailyDua = pickNonRepeating('dua', DUAS_COLLECTION, (d) => d.id, Math.max(1, DUAS_COLLECTION.length - 3));

  upsertDailySnapshot({
    contentType: 'adhkar',
    dateKey,
    itemKey: dailyDhikr.id,
    sourceId: 'adhkar_duas_verified',
    payload: dailyDhikr,
    recordHistory: true,
  });

  upsertDailySnapshot({
    contentType: 'dua',
    dateKey,
    itemKey: dailyDua.id,
    sourceId: 'adhkar_duas_verified',
    payload: dailyDua,
    recordHistory: true,
  });

  updateSourceStatus('adhkar_duas_verified', 'ok');
  return { ok: true };
}

export async function refreshPrayerAndHijriSnapshot(): Promise<{ ok: boolean; error?: string }> {
  const dateKey = getTodayDateKey();
  if (!isSourceEnabled('aladhan_api')) {
    updateSourceStatus('aladhan_api', 'disabled', 'تم تعطيل المصدر من قِبل الإدارة');
    return { ok: false, error: 'المصدر معطل إداريًا' };
  }

  try {
    const url = 'https://api.aladhan.com/v1/timingsByCity?city=Makkah&country=Saudi%20Arabia&method=4';
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = (await res.json()) as {
      code?: number;
      data?: {
        timings?: Record<string, string>;
        date?: {
          hijri?: {
            date?: string;
            day?: string;
            month?: { number?: number; ar?: string };
            year?: string;
            weekday?: { ar?: string };
          };
          gregorian?: { date?: string };
        };
      };
    };

    if (json.code !== 200 || !json.data?.timings || !json.data?.date?.hijri) {
      throw new Error('استجابة غير صالحة من خدمة AlAdhan');
    }

    const h = json.data.date.hijri;
    upsertDailySnapshot({
      contentType: 'prayer_snapshot',
      dateKey,
      itemKey: h.date || dateKey,
      sourceId: 'aladhan_api',
      payload: {
        city: 'مكة المكرمة',
        method: 'أم القرى',
        hijri: {
          day: h.day,
          monthAr: h.month?.ar,
          year: h.year,
          weekdayAr: h.weekday?.ar,
          formattedAr: `${h.weekday?.ar || ''} ${h.day || ''} ${h.month?.ar || ''} ${h.year || ''} هـ`.trim(),
        },
        timings: {
          Fajr: json.data.timings.Fajr,
          Sunrise: json.data.timings.Sunrise,
          Dhuhr: json.data.timings.Dhuhr,
          Asr: json.data.timings.Asr,
          Maghrib: json.data.timings.Maghrib,
          Isha: json.data.timings.Isha,
        },
      },
      recordHistory: false,
    });

    updateSourceStatus('aladhan_api', 'ok');
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'خطأ في الاتصال';
    updateSourceStatus('aladhan_api', 'error', msg);
    await recordSystemAlert({
      severity: 'warning',
      serviceName: 'تحديث مواقيت الصلاة والتاريخ الهجري',
      messageAr: 'تعذر تحديث لقطة المواقيت من AlAdhan API؛ يستمر الاعتماد على آخر نسخة محفوظة.',
      details: msg,
    });
    return { ok: false, error: msg };
  }
}

export async function refreshRecitersSync(): Promise<{ ok: boolean; verifiedCount: number; error?: string }> {
  const dateKey = getTodayDateKey();
  if (!isSourceEnabled('mp3quran_api')) {
    updateSourceStatus('mp3quran_api', 'disabled', 'تم تعطيل المصدر من قِبل الإدارة');
    return { ok: false, verifiedCount: 0, error: 'المصدر معطل إداريًا' };
  }

  try {
    const res = await fetch('https://mp3quran.net/api/v3/reciters?language=ar', {
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = (await res.json()) as {
      reciters?: Array<{
        id: number;
        name: string;
        moshaf?: Array<{ id: number; name: string; server: string; surah_total: number }>;
      }>;
    };

    const apiMap = new Map((json.reciters || []).map((r) => [r.id, r]));
    const statuses = QURAN_RECITERS.map((reciter) => {
      const upstream = apiMap.get(reciter.id);
      return {
        id: reciter.id,
        name: reciter.name,
        upstreamFound: Boolean(upstream),
        upstreamName: upstream?.name || reciter.name,
        moshafCount: upstream?.moshaf?.length || 1,
      };
    });

    const verifiedCount = statuses.filter((s) => s.upstreamFound).length;
    upsertDailySnapshot({
      contentType: 'reciters_sync',
      dateKey,
      itemKey: `sync-${dateKey}`,
      sourceId: 'mp3quran_api',
      payload: {
        totalApprovedReciters: QURAN_RECITERS.length,
        upstreamVerifiedCount: verifiedCount,
        totalCatalogRecitersAvailable: json.reciters?.length || 0,
        reciters: statuses,
      },
      recordHistory: false,
    });

    updateSourceStatus('mp3quran_api', 'ok');
    return { ok: true, verifiedCount };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'خطأ في الاتصال';
    updateSourceStatus('mp3quran_api', 'error', msg);
    await recordSystemAlert({
      severity: 'warning',
      serviceName: 'مزامنة بيانات القراء والتلاوات',
      messageAr: 'تعذر التحقق الدوري من سجل القراء عبر mp3quran.net؛ روابط القراء المعتمدة المخزنة ما زالت فعالة.',
      details: msg,
    });
    return { ok: false, verifiedCount: 0, error: msg };
  }
}

export async function runAllContentRefreshes(force = false): Promise<{
  dateKey: string;
  ayah: { ok: boolean; usedFallback: boolean };
  hadith: { ok: boolean };
  adhkarAndDua: { ok: boolean };
  prayer: { ok: boolean };
  reciters: { ok: boolean; verifiedCount: number };
}> {
  const dateKey = getTodayDateKey();

  const existingAyah = db
    .prepare("SELECT id FROM daily_content WHERE content_type = 'ayah' AND date_key = ?")
    .get(dateKey);

  const [ayah, hadith, adhkarAndDua, prayer, reciters] = await Promise.all([
    !existingAyah || force ? refreshDailyAyah(force) : Promise.resolve({ ok: true, usedFallback: false }),
    refreshDailyHadith(),
    refreshDailyAdhkarAndDua(),
    refreshPrayerAndHijriSnapshot(),
    refreshRecitersSync(),
  ]);

  return {
    dateKey,
    ayah: { ok: ayah.ok, usedFallback: ayah.usedFallback },
    hadith,
    adhkarAndDua,
    prayer,
    reciters,
  };
}

export function getPublicDailyBundle() {
  const ayah = getLatestSnapshot('ayah');
  const hadith = getLatestSnapshot('hadith');
  const adhkar = getLatestSnapshot('adhkar');
  const dua = getLatestSnapshot('dua');
  const prayer = getLatestSnapshot('prayer_snapshot');
  const reciters = getLatestSnapshot('reciters_sync');

  const timestamps = [ayah?.fetchedAt, hadith?.fetchedAt, adhkar?.fetchedAt, prayer?.fetchedAt]
    .filter((t): t is string => Boolean(t))
    .sort()
    .reverse();

  return {
    lastSuccessfulUpdate: timestamps[0] || null,
    ayah,
    hadith,
    adhkar,
    dua,
    prayer,
    reciters: reciters
      ? {
          fetchedAt: reciters.fetchedAt,
          totalApprovedReciters: (reciters.payload as { totalApprovedReciters?: number }).totalApprovedReciters ?? QURAN_RECITERS.length,
          upstreamVerifiedCount: (reciters.payload as { upstreamVerifiedCount?: number }).upstreamVerifiedCount ?? QURAN_RECITERS.length,
        }
      : null,
  };
}
