import React, { useState, useMemo } from 'react';
import { DUAS_COLLECTION, DUA_CATEGORIES, DuaRecord } from '../../data/duasData';
import { IslamicStar, IslamicDivider } from '../IslamicMotifs';
import { 
  Search, 
  Bookmark, 
  Copy, 
  Share2, 
  Check, 
  Sparkles, 
  BookOpen, 
  Compass,
  Filter
} from 'lucide-react';

interface DuasLibraryProps {
  favoriteIds: string[];
  onToggleFavorite: (id: string, text: string, title: string) => void;
}

export const DuasLibrary: React.FC<DuasLibraryProps> = ({
  favoriteIds,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'quran' | 'sunnah' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyDua = (dua: DuaRecord) => {
    const textToCopy = `« ${dua.text} »\n${dua.title}\nالمصدر: ${dua.source}\n- منصة سَكِينَة`;
    navigator.clipboard.writeText(textToCopy);
    showToast('تم نسخ الدعاء مع المصدر المعتمد');
  };

  const handleShareDua = async (dua: DuaRecord) => {
    const textToShare = `« ${dua.text} »\n\n${dua.title}\nالمصدر: ${dua.source}\n- منصة سَكِينَة`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: dua.title,
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        handleCopyDua(dua);
      }
    } else {
      handleCopyDua(dua);
    }
  };

  // Filtered Duas
  const filteredDuas = useMemo(() => {
    return DUAS_COLLECTION.filter((dua) => {
      // Favorites filter
      if (typeFilter === 'favorites') {
        if (!favoriteIds.includes(dua.id)) return false;
      } else if (typeFilter !== 'all' && dua.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (activeCategory !== 'all' && dua.category !== activeCategory) {
        return false;
      }

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        dua.title.toLowerCase().includes(q) ||
        dua.text.includes(q) ||
        dua.source.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, typeFilter, searchQuery, favoriteIds]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#064e3b] text-[#dfbd69] px-5 py-2.5 rounded-full border border-[#dfbd69]/40 shadow-xl text-xs sm:text-sm font-['Amiri',serif] flex items-center gap-2 animate-fade-in-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#032018]/80 text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#dfbd69] mb-3">
          <IslamicStar size={12} className="text-[#dfbd69]" />
          <span>AUTHENTIC SUPPLICATIONS</span>
          <IslamicStar size={12} className="text-[#dfbd69]" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5]">
          مكتبة الأدعية المأثورة
        </h2>

        <IslamicDivider className="my-3 opacity-60" />

        <p className="text-sm sm:text-base text-[#d1c7b7] font-['Amiri',serif]">
          جوامع الدعاء المستجاب من كتاب الله المبين وصحيح سنة النبي الأمين ﷺ مبوبة وموثقة بالكامل
        </p>
      </div>

      {/* Search & Top Type Filter Toolbar */}
      <div className="mb-8 p-4 rounded-2xl bg-[#032018]/90 border border-[#c5a059]/25 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن دعاء بكلمة أو موضوع (مثال: الشفاء، الوالدين، الكرب)..."
            className="w-full bg-[#021812] border border-[#c5a059]/30 rounded-xl py-2.5 pr-10 pl-4 text-sm font-['Amiri',serif] text-[#fbf9f5] placeholder:text-slate-500 focus:outline-none focus:border-[#dfbd69]"
          />
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-[#c5a059]" />
        </div>

        {/* Source Type / Favorites Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#021812] rounded-xl border border-[#c5a059]/20 self-stretch md:self-auto justify-center flex-wrap">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] transition-all cursor-pointer ${
              typeFilter === 'all' ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setTypeFilter('quran')}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] transition-all cursor-pointer ${
              typeFilter === 'quran' ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            قرآنية
          </button>
          <button
            onClick={() => setTypeFilter('sunnah')}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] transition-all cursor-pointer ${
              typeFilter === 'sunnah' ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            نبوية صحيحة
          </button>
          <button
            onClick={() => setTypeFilter('favorites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Amiri',serif] transition-all cursor-pointer flex items-center gap-1 ${
              typeFilter === 'favorites' ? 'bg-[#dfbd69] text-[#021812] font-bold shadow-sm' : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            <Bookmark className="w-3 h-3 fill-current" />
            <span>المفضلة ({favoriteIds.length})</span>
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DUA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-['Amiri',serif] whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#064e3b] text-[#dfbd69] border border-[#dfbd69] font-bold shadow-sm'
                : 'bg-[#032018]/60 text-[#c7beaf] border border-[#c5a059]/20 hover:border-[#dfbd69]/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Duas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDuas.map((dua) => {
          const isFav = favoriteIds.includes(dua.id);

          return (
            <div
              key={dua.id}
              className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/60 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10"
            >
              <div>
                {/* Card Header: Category & Type Badge */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#c5a059]/15">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-['Amiri',serif] border ${
                      dua.type === 'quran'
                        ? 'bg-[#064e3b]/50 text-[#dfbd69] border-[#dfbd69]/30'
                        : 'bg-[#022018] text-[#c5a059] border-[#c5a059]/20'
                    }`}>
                      {dua.type === 'quran' ? 'دعاء قرآني مبارك' : 'دعاء نبوي صحيح'}
                    </span>
                    <span className="text-xs text-[#a89e8f] font-['Amiri',serif]">
                      • {dua.categoryName}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => {
                      onToggleFavorite(dua.id, dua.text, dua.title);
                      showToast(isFav ? 'تمت إزالة الدعاء من المفضلة' : 'تمت إضافة الدعاء إلى المفضلة');
                    }}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isFav
                        ? 'bg-[#dfbd69] text-[#021812] border-[#dfbd69]'
                        : 'border-[#c5a059]/20 text-slate-400 hover:text-[#dfbd69]'
                    }`}
                    title={isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69] mb-3 group-hover:text-[#f3e5ab] transition-colors">
                  {dua.title}
                </h3>

                {/* Dua Arabic Text */}
                <p className="text-xl sm:text-2xl font-['Amiri_Quran',serif] text-[#fbf9f5] leading-[2.3] select-text my-2">
                  ﴿ {dua.text} ﴾
                </p>

                {/* Virtue / Reflection */}
                {dua.merit && (
                  <p className="text-xs text-[#c7beaf] font-['Amiri',serif] italic mt-3 pt-2 border-t border-[#c5a059]/10">
                    <span className="text-[#dfbd69] font-bold not-italic ml-1">الفضل:</span>
                    {dua.merit}
                  </p>
                )}
              </div>

              {/* Bottom Actions & Source */}
              <div className="pt-4 mt-4 border-t border-[#c5a059]/15 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[11px] text-[#a89e8f] font-['Amiri',serif]">
                  المصدر: <strong className="text-[#d4ccbf] font-normal">{dua.source}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyDua(dua)}
                    className="p-1.5 rounded-lg border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] hover:border-[#dfbd69] transition-colors cursor-pointer"
                    title="نسخ الدعاء"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleShareDua(dua)}
                    className="p-1.5 rounded-lg border border-[#c5a059]/20 text-slate-300 hover:text-[#dfbd69] hover:border-[#dfbd69] transition-colors cursor-pointer"
                    title="مشاركة الدعاء"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDuas.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <BookOpen className="w-12 h-12 text-[#c5a059]/40 mx-auto mb-3" />
          <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
            لم نجد أدعية مطابقة لبحثك
          </h3>
          <p className="text-xs font-['Amiri',serif] text-slate-400 mt-1">
            جرب البحث بكلمة عامة أو تصفح كافة التصنيفات المباركة.
          </p>
        </div>
      )}

    </div>
  );
};
