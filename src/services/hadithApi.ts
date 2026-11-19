import { 
  AUTHENTIC_HADITHS, 
  HADITH_COLLECTIONS, 
  HADITH_CATEGORIES, 
  HadithRecord, 
  HadithCollection, 
  HadithCategory 
} from '../data/hadithData';

export interface HadithSearchParams {
  query?: string;
  collectionId?: string;
  category?: string;
  grade?: string;
}

/**
 * Helper to strip diacritics and normalize Arabic letters for robust search
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel / harakat
    .replace(/[إأآا]/g, 'ا') // Normalize Alef
    .replace(/ة/g, 'ه') // Normalize Teh Marbuta
    .replace(/[يى]/g, 'ي') // Normalize Yeh / Alef Maqsura
    .trim()
    .toLowerCase();
}

/**
 * Search the authentic Hadith database with flexible filters
 */
export function searchHadiths(params: HadithSearchParams): HadithRecord[] {
  const { query, collectionId, category, grade } = params;

  return AUTHENTIC_HADITHS.filter((hadith) => {
    // 1. Collection filter
    if (collectionId && collectionId !== 'all' && hadith.collectionId !== collectionId) {
      return false;
    }

    // 2. Category filter
    if (category && category !== 'all' && hadith.category !== category) {
      return false;
    }

    // 3. Grade filter
    if (grade && grade !== 'all' && hadith.grade !== grade) {
      return false;
    }

    // 4. Query text / number search
    if (query && query.trim()) {
      const rawQ = query.trim().toLowerCase();
      // Match number if numeric
      if (!isNaN(Number(rawQ))) {
        if (hadith.hadithNumber === Number(rawQ)) return true;
      }

      const normQ = normalizeArabic(rawQ);

      const normMatn = normalizeArabic(hadith.matn);
      const normNarrator = normalizeArabic(hadith.narrator);
      const normCollection = normalizeArabic(hadith.collectionName);
      const normBook = hadith.bookName ? normalizeArabic(hadith.bookName) : '';
      const normChapter = hadith.chapterName ? normalizeArabic(hadith.chapterName) : '';
      const normCategory = normalizeArabic(hadith.categoryName);
      const normExplanation = hadith.explanation ? normalizeArabic(hadith.explanation) : '';

      return (
        normMatn.includes(normQ) ||
        normNarrator.includes(normQ) ||
        normCollection.includes(normQ) ||
        normBook.includes(normQ) ||
        normChapter.includes(normQ) ||
        normCategory.includes(normQ) ||
        normExplanation.includes(normQ)
      );
    }

    return true;
  });
}

/**
 * Get daily verified Hadith deterministically based on date
 */
export function getDailyHadith(): HadithRecord {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % AUTHENTIC_HADITHS.length;
  return AUTHENTIC_HADITHS[index] || AUTHENTIC_HADITHS[0];
}

/**
 * Get Hadith by ID
 */
export function getHadithById(id: string): HadithRecord | undefined {
  return AUTHENTIC_HADITHS.find(h => h.id === id);
}

/**
 * Get related Hadiths based on category or collection
 */
export function getRelatedHadiths(currentHadithId: string, limit: number = 3): HadithRecord[] {
  const current = getHadithById(currentHadithId);
  if (!current) return [];

  return AUTHENTIC_HADITHS.filter(
    h => h.id !== currentHadithId && (h.category === current.category || h.collectionId === current.collectionId)
  ).slice(0, limit);
}
