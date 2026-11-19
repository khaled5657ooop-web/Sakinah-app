import React, { useState, useEffect, useMemo } from 'react';
import { 
  AUTHENTIC_HADITHS, 
  HADITH_COLLECTIONS, 
  HADITH_CATEGORIES, 
  HadithRecord 
} from '../../data/hadithData';
import { searchHadiths, getDailyHadith } from '../../services/hadithApi';
import { HadithCard } from './HadithCard';
import { HadithDetailModal } from './HadithDetailModal';
import { HadithCollectionsView } from './HadithCollectionsView';
import { IslamicStar, IslamicDivider } from '../IslamicMotifs';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  Clock, 
  Sparkles, 
  Filter, 
  ArrowLeft, 
  Copy, 
  Share2, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  Info
} from 'lucide-react';

interface MainHadithPageProps {
  onBackToHome: () => void;
  initialHadithId?: string;
}

export const MainHadithPage: React.FC<MainHadithPageProps> = ({
  onBackToHome,
  initialHadithId,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'collections' | 'categories' | 'favorites' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Active detail modal
  const [activeDetailHadith, setActiveDetailHadith] = useState<HadithRecord | null>(() => {
    if (initialHadithId) {
      return AUTHENTIC_HADITHS.find(h => h.id === initialHadithId) || null;
    }
    return null;
  });

  // Favorites (persisted in localStorage)
  const [favoriteHadithIds, setFavoriteHadithIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakinah_hadith_favorites');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Recently Viewed History (persisted in localStorage)
  const [viewHistoryIds, setViewHistoryIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakinah_hadith_history');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sakinah_hadith_favorites', JSON.stringify(favoriteHadithIds));
    } catch {
      // Storage restriction
    }
  }, [favoriteHadithIds]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sakinah_hadith_history', JSON.stringify(viewHistoryIds));
    } catch {
      // Storage restriction
    }
  }, [viewHistoryIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleFavorite = (id: string) => {
    setFavoriteHadithIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenDetail = (hadith: HadithRecord) => {
    setActiveDetailHadith(hadith);
    // Add to history
    setViewHistoryIds(prev => {
      const filtered = prev.filter(item => item !== hadith.id);
      return [hadith.id, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const handleCopy = (hadith: HadithRecord) => {
    const textToCopy = `عن ${hadith.narrator}:\n« ${hadith.matn} »\nالمصدر: ${hadith.collectionName} [رقم ${hadith.hadithNumber}] - ${hadith.gradeScholar}\n- منصة سَكِينَة`;
    navigator.clipboard.writeText(textToCopy);
    showToast('تم نسخ الحديث بنجاح');
  };

  const handleShare = async (hadith: HadithRecord) => {
    const textToShare = `عن ${hadith.narrator}:\n« ${hadith.matn} »\n\n${hadith.collectionName} [رقم ${hadith.hadithNumber}] - ${hadith.gradeScholar}\n- منصة سَكِينَة`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `حديث شريف من ${hadith.collectionName}`,
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        handleCopy(hadith);
      }
    } else {
      handleCopy(hadith);
    }
  };

  const dailyHadith = useMemo(() => getDailyHadith(), []);
  const featuredHadith = useMemo(() => AUTHENTIC_HADITHS.find(h => h.isFeatured) || AUTHENTIC_HADITHS[0], []);

  // Filtered Hadiths
  const displayedHadiths = useMemo(() => {
    if (activeTab === 'favorites') {
      return AUTHENTIC_HADITHS.filter(h => favoriteHadithIds.includes(h.id));
    }
    if (activeTab === 'history') {
      return viewHistoryIds
        .map(id => AUTHENTIC_HADITHS.find(h => h.id === id))
        .filter((h): h is HadithRecord => h !== undefined);
    }

    return searchHadiths({
      query: searchQuery,
      collectionId: selectedCollection,
      category: selectedCategory,
      grade: selectedGrade,
    });
  }, [activeTab, searchQuery, selectedCollection, selectedCategory, selectedGrade, favoriteHadithIds, viewHistoryIds]);

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#064e3b] text-[#dfbd69] px-5 py-2.5 rounded-full border border-[#dfbd69]/40 shadow-xl text-xs sm:text-sm font-['Amiri',serif] flex items-center gap-2 animate-fade-in-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#032018]/80 text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#dfbd69] mb-4">
          <IslamicStar size={12} className="text-[#dfbd69]" />
          <span>THE NOBLE PROPHETIC TRADITIONS</span>
          <IslamicStar size={12} className="text-[#dfbd69]" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-['Aref_Ruqaa',serif] text-[#03241b] dark:text-[#fbf9f5] drop-shadow-md">
          السنة النبوية
        </h1>

        <IslamicDivider className="my-3 opacity-70" />

        <p className="text-2xl sm:text-3xl font-['Amiri',serif] text-[#8c6b2d] dark:text-[#dfbd69] font-medium">
          "من هدي النبوة"
        </p>

        <p className="mt-2 text-sm sm:text-base text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
          تعرف على أحاديث رسول الله ﷺ من مصادرها الموثوقة وصحاحها المعتمدة، مع التحقيق العلمي والدرجة المعتمدة
        </p>

        {/* Local storage note */}
        <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-[#a89e8f] bg-[#021812]/80 px-3.5 py-1.5 rounded-full border border-[#c5a059]/20">
          <Info className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>يتم حفظ المفضلة وسجل القراءة محلياً في هذا المتصفح دون الحاجة لتسجيل حساب</span>
        </div>
      </div>

      {/* Featured Hadith Spotlight Banner */}
      {activeTab === 'all' && !searchQuery && (
        <div className="mb-12 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/35 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#c5a059]/15 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-['Cinzel',serif] uppercase tracking-wider text-[#dfbd69]">
              <Sparkles className="w-4 h-4 text-[#dfbd69]" />
              <span>FEATURED NOBLE HADITH • حديث نبوي مختار</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-['Amiri',serif]">
              {featuredHadith.grade} ({featuredHadith.gradeScholar})
            </span>
          </div>

          <div className="py-6 text-center max-w-4xl mx-auto">
            <span className="text-xs text-[#c5a059] font-['Amiri',serif] block mb-2 font-medium">
              عن {featuredHadith.narrator} رضي الله عنه:
            </span>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-[2.3]">
              « {featuredHadith.matn} »
            </p>
            {featuredHadith.explanation && (
              <p className="text-xs sm:text-sm text-[#d4ccbf] font-['Amiri',serif] mt-3 italic max-w-2xl mx-auto">
                {featuredHadith.explanation}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[#c5a059]/15 flex items-center justify-between flex-wrap gap-2 text-xs text-[#a89e8f] font-['Amiri',serif]">
            <span>{featuredHadith.collectionName} • الحديث رقم {featuredHadith.hadithNumber}</span>
            <button
              onClick={() => handleOpenDetail(featuredHadith)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dfbd69] to-[#c5a059] text-[#021812] font-bold hover:from-[#f3e5ab] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>عرض تفاصيل الحديث</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1.5 bg-[#032018] rounded-2xl border border-[#c5a059]/30 shadow-xl flex-wrap justify-center">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer font-bold ${
              activeTab === 'all'
                ? 'bg-[#dfbd69] text-[#021812] shadow-md shadow-[#c5a059]/20'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            جميع الأحاديث
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer font-bold ${
              activeTab === 'collections'
                ? 'bg-[#dfbd69] text-[#021812] shadow-md shadow-[#c5a059]/20'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            دواوين السنة الستة
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-[#dfbd69] text-[#021812] shadow-md shadow-[#c5a059]/20'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>المفضلة ({favoriteHadithIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#dfbd69] text-[#021812] shadow-md shadow-[#c5a059]/20'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>سجل القراءة ({viewHistoryIds.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Collections View */}
      {activeTab === 'collections' ? (
        <HadithCollectionsView
          onSelectCollection={(colId) => {
            setSelectedCollection(colId);
            setActiveTab('all');
          }}
        />
      ) : (
        <>
          {/* Search & Filters Toolbar */}
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#032018]/90 border border-[#c5a059]/25 shadow-lg space-y-4">
            {/* Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بكلمة، أو رقم الحديث، أو اسم الراوي (مثال: النية، الجنة، الصبر، 1)..."
                className="w-full bg-[#021812] border border-[#c5a059]/30 rounded-xl py-3 pr-11 pl-4 text-sm font-['Amiri',serif] text-[#fbf9f5] placeholder:text-slate-500 focus:outline-none focus:border-[#dfbd69]"
              />
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-[#c5a059]" />
            </div>

            {/* Filter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Collection Filter */}
              <div>
                <label className="text-[11px] text-[#c5a059] font-['Amiri',serif] block mb-1">
                  الكتاب / المصدر:
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full bg-[#021812] border border-[#c5a059]/25 rounded-lg px-3 py-1.5 text-xs font-['Amiri',serif] text-[#fbf9f5] focus:outline-none focus:border-[#dfbd69]"
                >
                  <option value="all">كافة كتب السنة</option>
                  {HADITH_COLLECTIONS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Thematic Category Filter */}
              <div>
                <label className="text-[11px] text-[#c5a059] font-['Amiri',serif] block mb-1">
                  الموضوع / الباب:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#021812] border border-[#c5a059]/25 rounded-lg px-3 py-1.5 text-xs font-['Amiri',serif] text-[#fbf9f5] focus:outline-none focus:border-[#dfbd69]"
                >
                  {HADITH_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="text-[11px] text-[#c5a059] font-['Amiri',serif] block mb-1">
                  درجة الصحة والتوثيق:
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-[#021812] border border-[#c5a059]/25 rounded-lg px-3 py-1.5 text-xs font-['Amiri',serif] text-[#fbf9f5] focus:outline-none focus:border-[#dfbd69]"
                >
                  <option value="all">كافة الدرجات العلمية</option>
                  <option value="صحيح">صحيح فقط</option>
                  <option value="حسن">حسن فقط</option>
                </select>
              </div>
            </div>

            {/* Active Filters Clear Button if any filter is set */}
            {(selectedCollection !== 'all' || selectedCategory !== 'all' || selectedGrade !== 'all' || searchQuery) && (
              <div className="flex items-center justify-between pt-2 border-t border-[#c5a059]/10 text-xs text-[#c5a059] font-['Amiri',serif]">
                <span>عُثر على {displayedHadiths.length} حديثاً مطابقاً</span>
                <button
                  onClick={() => {
                    setSelectedCollection('all');
                    setSelectedCategory('all');
                    setSelectedGrade('all');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 text-[#dfbd69] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط التصفية</span>
                </button>
              </div>
            )}
          </div>

          {/* Hadith Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedHadiths.map((hadith) => (
              <HadithCard
                key={hadith.id}
                hadith={hadith}
                onOpenDetail={handleOpenDetail}
                isFavorite={favoriteHadithIds.includes(hadith.id)}
                onToggleFavorite={handleToggleFavorite}
                onCopy={handleCopy}
                onShare={handleShare}
              />
            ))}
          </div>

          {/* Empty State */}
          {displayedHadiths.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <BookOpen className="w-12 h-12 text-[#c5a059]/40 mx-auto mb-3" />
              <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                {activeTab === 'favorites' 
                  ? 'لم تقم بحفظ أي أحاديث في المفضلة بعد'
                  : activeTab === 'history'
                  ? 'سجل القراءة فارغ حالياً'
                  : 'لم نجد أحاديث تطابق معايير البحث'}
              </h3>
              <p className="text-xs font-['Amiri',serif] text-slate-400 mt-1">
                {activeTab === 'favorites'
                  ? 'يمكنك حفظ أي حديث بالضغط على أيقونة الإشارة المرجعية أثناء التصفح.'
                  : 'جرب البحث بكلمة عامة أو إزالة بعض معايير التصفية.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {activeDetailHadith && (
        <HadithDetailModal
          hadith={activeDetailHadith}
          onClose={() => setActiveDetailHadith(null)}
          onSelectHadith={handleOpenDetail}
          isFavorite={favoriteHadithIds.includes(activeDetailHadith.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

    </div>
  );
};
