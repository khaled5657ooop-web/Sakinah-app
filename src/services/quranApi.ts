import { QURAN_RECITERS, QuranReciter, buildReciterSurahUrl } from '../data/recitersData';
import { QURAN_SURAHS } from '../data/quranMetadata';

export interface Verse {
  id: number;
  verse_key: string; // e.g. "1:1"
  text_uthmani: string;
  verse_number: number;
  juz_number?: number;
  hizb_number?: number;
}

export interface TafsirInfo {
  id: number;
  name: string;
  author: string;
}

export const AVAILABLE_TAFSIRS: TafsirInfo[] = [
  { id: 16, name: 'التفسير الميسر', author: 'نخبة من العلماء - مجمع الملك فهد لطباعة المصحف الشريف' },
  { id: 91, name: 'تفسير السعدي', author: 'تيسير الكريم الرحمن في تفسير كلام المنان - الشيخ عبد الرحمن السعدي' },
  { id: 14, name: 'تفسير ابن كثير', author: 'تفسير القرآن العظيم - الإمام الحافظ ابن كثير' },
  { id: 90, name: 'تفسير القرطبي', author: 'الجامع لأحكام القرآن - الإمام القرطبي' },
  { id: 94, name: 'تفسير البغوي', author: 'معالم التنزيل - الإمام البغوي' }
];

export interface ReciterInfo {
  id: number;
  name: string;
  style: string;
  shortName?: string;
  riwayah?: string;
  sourceLabel?: string;
}

export const AVAILABLE_RECITERS: ReciterInfo[] = QURAN_RECITERS.map((r: QuranReciter) => ({
  id: r.id,
  name: r.name,
  style: `${r.style} · ${r.riwayah}`,
  shortName: r.shortName,
  riwayah: r.riwayah,
  sourceLabel: r.sourceLabel,
}));

// In-memory cache for loaded chapters to avoid redundant network calls
const versesCache: Record<number, Verse[]> = {};
const tafsirCache: Record<string, string> = {};

/**
 * Fetch complete Uthmani text of a Surah from Quran.com API v4
 */
export async function fetchSurahVerses(chapterNumber: number): Promise<Verse[]> {
  if (versesCache[chapterNumber]) {
    return versesCache[chapterNumber];
  }

  const url = `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterNumber}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`تعذر تحميل آيات السورة رقم ${chapterNumber} من المصدر المعتمد.`);
  }

  const data = await response.json();
  const verses: Verse[] = (data.verses || []).map((v: { id: number; verse_key: string; text_uthmani: string }, idx: number) => {
    const parts = v.verse_key.split(':');
    const verseNum = parts.length > 1 ? parseInt(parts[1], 10) : idx + 1;
    return {
      id: v.id,
      verse_key: v.verse_key,
      text_uthmani: v.text_uthmani,
      verse_number: verseNum,
    };
  });

  versesCache[chapterNumber] = verses;
  return verses;
}

/**
 * Fetch verified Tafsir text for a specific Ayah (e.g. "1:1")
 */
export async function fetchTafsir(verseKey: string, tafsirId: number = 16): Promise<{ text: string; source: string; tafsirName: string }> {
  const cacheKey = `${tafsirId}:${verseKey}`;
  if (tafsirCache[cacheKey]) {
    const tafsirMeta = AVAILABLE_TAFSIRS.find(t => t.id === tafsirId) || AVAILABLE_TAFSIRS[0];
    return {
      text: tafsirCache[cacheKey],
      source: tafsirMeta.author,
      tafsirName: tafsirMeta.name
    };
  }

  const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`تعذر جلب التفسير للآية [${verseKey}].`);
  }

  const data = await response.json();
  const rawText = data?.tafsir?.text || '';
  // Clean basic HTML spans or keep clean Arabic text
  const cleanText = rawText
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  tafsirCache[cacheKey] = cleanText;

  const tafsirMeta = AVAILABLE_TAFSIRS.find(t => t.id === tafsirId) || AVAILABLE_TAFSIRS[0];
  return {
    text: cleanText,
    source: tafsirMeta.author,
    tafsirName: tafsirMeta.name
  };
}

export interface SearchResult {
  verseKey: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
}

/**
 * Search the Quran for words, partial verses, or terms via Quran.com search API
 */
export async function searchQuran(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const encoded = encodeURIComponent(trimmed);
  const url = `https://api.quran.com/api/v4/search?q=${encoded}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('تعذر تنفيذ عملية البحث القرآني حاليًا.');
  }

  const data = await response.json();
  const rawResults = data?.search?.results || [];

  return rawResults.map((r: { verse_key: string; text: string }) => {
    const parts = (r.verse_key || '1:1').split(':');
    const ch = parseInt(parts[0], 10) || 1;
    const v = parseInt(parts[1], 10) || 1;
    return {
      verseKey: r.verse_key,
      chapterNumber: ch,
      verseNumber: v,
      text: r.text.replace(/<[^>]+>/g, '').trim()
    };
  });
}

/**
 * Fetch verified full-Surah audio recitation URL strictly for the chosen reciter.
 * Never falls back to another reciter if a specific Surah recording is unavailable.
 */
export async function fetchChapterAudioUrl(chapterNumber: number, reciterId: number): Promise<string> {
  const reciter = QURAN_RECITERS.find((r) => r.id === reciterId || r.quranComId === reciterId);
  const surahMeta = QURAN_SURAHS.find((s) => s.id === chapterNumber);
  const surahLabel = surahMeta ? `سورة ${surahMeta.name}` : `السورة رقم ${chapterNumber}`;

  if (!reciter) {
    throw new Error('لم يتم العثور على القارئ المطلوب في قائمة القراء المعتمدين.');
  }

  if (reciter.unavailableSurahs?.includes(chapterNumber)) {
    throw new Error(`تسجيل ${surahLabel} غير متوفر حاليًا بصوت ${reciter.name}. لم يتم استبداله بقارئ آخر حفاظًا على دقة العزو.`);
  }

  const cdnUrl = buildReciterSurahUrl(reciter, chapterNumber);

  // Check primary MP3Quran CDN availability via lightweight HEAD request
  try {
    const headRes = await fetch(cdnUrl, { method: 'HEAD' });
    if (headRes.ok) {
      return cdnUrl;
    }
  } catch {
    // Proceed to same-reciter official Quran.com lookup if HEAD is blocked or offline
  }

  // Secondary check ONLY for the exact same reciter on Quran.com v4 API
  if (reciter.quranComId) {
    try {
      const apiUrl = `https://api.quran.com/api/v4/chapter_recitations/${reciter.quranComId}/${chapterNumber}`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data?.audio_file?.audio_url) {
          return data.audio_file.audio_url;
        }
      }
    } catch {
      // Handled below
    }
  }

  // If offline or HEAD timed out on CORS-restricted proxy, don't swap reciters —
  // throw explicit error so user sees honest attribution message
  throw new Error(
    `تعذر الوصول إلى تسجيل ${surahLabel} بصوت ${reciter.name} حاليًا. تأكد من الاتصال بالإنترنت أو اختر سورة أو قارئًا آخر.`
  );
}

