import React, { useState, useEffect } from 'react';
import { ADHKAR_CATEGORIES, AdhkarCategory } from '../../data/adhkarData';
import { AdhkarSessionReader } from './AdhkarSessionReader';
import { DigitalTasbeeh } from './DigitalTasbeeh';
import { DuasLibrary } from './DuasLibrary';
import { IslamicStar, IslamicDivider } from '../IslamicMotifs';
import { 
  Sun, 
  Moon, 
  Compass, 
  BedDouble, 
  Sunrise, 
  Home, 
  Utensils, 
  BookOpen, 
  HeartHandshake, 
  Sparkles, 
  ArrowLeft,
  Bookmark,
  Info
} from 'lucide-react';

interface MainAdhkarPageProps {
  onBackToHome: () => void;
  initialTab?: 'directory' | 'tasbeeh' | 'duas' | 'morning' | 'evening';
}

export const MainAdhkarPage: React.FC<MainAdhkarPageProps> = ({
  onBackToHome,
  initialTab = 'directory',
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'tasbeeh' | 'duas' | 'favorites'>(
    initialTab === 'tasbeeh' || initialTab === 'duas' ? initialTab : 'directory'
  );
  const [activeCategorySession, setActiveCategorySession] = useState<AdhkarCategory | null>(() => {
    if (initialTab === 'morning') {
      return ADHKAR_CATEGORIES.find(c => c.id === 'morning') || null;
    }
    if (initialTab === 'evening') {
      return ADHKAR_CATEGORIES.find(c => c.id === 'evening') || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialTab === 'morning') {
      setActiveCategorySession(ADHKAR_CATEGORIES.find(c => c.id === 'morning') || null);
      setActiveTab('directory');
    } else if (initialTab === 'evening') {
      setActiveCategorySession(ADHKAR_CATEGORIES.find(c => c.id === 'evening') || null);
      setActiveTab('directory');
    } else {
      setActiveCategorySession(null);
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Favorites state persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakinah_favorites_ids');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sakinah_favorites_ids', JSON.stringify(favoriteIds));
    } catch {
      // Storage restriction
    }
  }, [favoriteIds]);

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-6 h-6 text-[#dfbd69]" />;
      case 'Moon': return <Moon className="w-6 h-6 text-[#dfbd69]" />;
      case 'Compass': return <Compass className="w-6 h-6 text-[#dfbd69]" />;
      case 'BedDouble': return <BedDouble className="w-6 h-6 text-[#dfbd69]" />;
      case 'Sunrise': return <Sunrise className="w-6 h-6 text-[#dfbd69]" />;
      case 'Home': return <Home className="w-6 h-6 text-[#dfbd69]" />;
      case 'Utensils': return <Utensils className="w-6 h-6 text-[#dfbd69]" />;
      default: return <IslamicStar size={24} className="text-[#dfbd69]" />;
    }
  };

  const handleCompleteCategory = (categoryId: string) => {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(`sakinah_wird_${categoryId}_${today}`, 'true');
    } catch {
      // Ignore storage quota/privacy restrictions
    }
  };

  // If inside an active Adhkar session
  if (activeCategorySession) {
    return (
      <AdhkarSessionReader
        category={activeCategorySession}
        onBack={() => setActiveCategorySession(null)}
        favorites={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        onCompleteCategory={handleCompleteCategory}
      />
    );
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#032018]/80 text-xs font-['Cinzel',serif] uppercase tracking-widest text-[#dfbd69] mb-4">
          <IslamicStar size={12} className="text-[#dfbd69]" />
          <span>REMEMBRANCE & SUPPLICATIONS</span>
          <IslamicStar size={12} className="text-[#dfbd69]" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-['Aref_Ruqaa',serif] text-[#03241b] dark:text-[#fbf9f5] drop-shadow-md">
          الأذكار والأدعية
        </h1>

        <IslamicDivider className="my-3 opacity-70" />

        <p className="text-2xl sm:text-3xl font-['Amiri',serif] text-[#8c6b2d] dark:text-[#dfbd69] font-medium">
          "بذكر الله تحيا القلوب وتطمئن النفوس."
        </p>

        <p className="mt-2 text-sm sm:text-base text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
          أوراد اليوم والليلة وحصن المسلم مع مسبحة إلكترونية فخمة ومكتبة الأدعية الجامعة
        </p>

        {/* Local storage note */}
        <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-[#a89e8f] bg-[#021812]/80 px-3.5 py-1.5 rounded-full border border-[#c5a059]/20">
          <Info className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>يتم حفظ تقدمك والمفضلة محلياً في هذا المتصفح دون الحاجة لتسجيل حساب</span>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (Segmented controls with click handlers) */}
      <div className="flex items-center justify-center mb-12">
        <div className="inline-flex items-center gap-1 p-1.5 bg-[#032018] rounded-2xl border border-[#c5a059]/30 shadow-xl flex-wrap justify-center">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer font-bold ${
              activeTab === 'directory'
                ? 'bg-[#dfbd69] text-[#021812] shadow-md shadow-[#c5a059]/20'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            أبواب الأذكار
          </button>

          <button
            onClick={() => setActiveTab('tasbeeh')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer font-bold ${
              activeTab === 'tasbeeh'
                ? 'bg-[#dfbd69] text-[#021812] shadow-md shadow-[#c5a059]/20'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            المسبحة الإلكترونية
          </button>

          <button
            onClick={() => setActiveTab('duas')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-['Amiri',serif] transition-all cursor-pointer font-bold ${
              activeTab === 'duas'
                ? 'bg-[#dfbd69] text-[#021812] shadow-md shadow-[#c5a059]/20'
                : 'text-[#d4ccbf] hover:text-[#dfbd69]'
            }`}
          >
            مكتبة الأدعية
          </button>
        </div>
      </div>

      {/* Tab 1: Adhkar Directory Cards */}
      {activeTab === 'directory' && (
        <div className="space-y-12">
          {/* Grid of 10 Specific Requested Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* 1 to 7: Predefined Categories from ADHKAR_CATEGORIES */}
            {ADHKAR_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/70 p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center group-hover:bg-[#064e3b] group-hover:border-[#dfbd69] transition-all duration-300">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
                      {cat.items.length} أذكار موثقة
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#dfbd69]/85 font-['Amiri',serif] mt-0.5 mb-3 italic">
                    {cat.subtitle}
                  </p>

                  <p className="text-sm text-[#d1c7b7] font-['Amiri',serif] leading-relaxed mb-6">
                    {cat.description}
                  </p>

                  {cat.timeContext && (
                    <div className="p-2.5 rounded-xl bg-[#064e3b]/20 border border-[#c5a059]/15 text-[11px] text-[#c5a059] font-['Amiri',serif] mb-6">
                      <strong>الوقت المستحب:</strong> {cat.timeContext}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveCategorySession(cat)}
                  className="w-full py-3 px-4 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#f5efe6] bg-[#064e3b]/40 hover:bg-[#dfbd69] hover:text-[#021812] border border-[#c5a059]/30 hover:border-[#dfbd69] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group/btn"
                >
                  <span>بدء الورد والتسبيح</span>
                  <ArrowLeft className="w-4 h-4 text-[#dfbd69] group-hover/btn:text-[#021812] group-hover/btn:-translate-x-1 transition-all" />
                </button>
              </div>
            ))}

            {/* 8: أدعية من القرآن الكريم Card */}
            <div className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/70 p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center group-hover:bg-[#064e3b] transition-all">
                    <BookOpen className="w-6 h-6 text-[#dfbd69]" />
                  </div>
                  <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
                    آيات مستجابة
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                  أدعية من القرآن الكريم
                </h3>
                <p className="text-xs text-[#dfbd69]/85 font-['Amiri',serif] mt-0.5 mb-3 italic">
                  كلام رب العالمين
                </p>

                <p className="text-sm text-[#d1c7b7] font-['Amiri',serif] leading-relaxed mb-6">
                  الأدعية القرآنية المباركة التي ناجى بها الأنبياء والصالحون ربهم جل وعلا باللفظ الشريف المعجز.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('duas')}
                className="w-full py-3 px-4 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#f5efe6] bg-[#064e3b]/40 hover:bg-[#dfbd69] hover:text-[#021812] border border-[#c5a059]/30 hover:border-[#dfbd69] transition-all flex items-center justify-center gap-2 cursor-pointer group/btn"
              >
                <span>تصفح الأدعية القرآنية</span>
                <ArrowLeft className="w-4 h-4 text-[#dfbd69] group-hover/btn:text-[#021812] group-hover/btn:-translate-x-1 transition-all" />
              </button>
            </div>

            {/* 9: أدعية من السنة النبوية Card */}
            <div className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/70 p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center group-hover:bg-[#064e3b] transition-all">
                    <HeartHandshake className="w-6 h-6 text-[#dfbd69]" />
                  </div>
                  <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
                    صحيح السنة
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                  أدعية من السنة النبوية
                </h3>
                <p className="text-xs text-[#dfbd69]/85 font-['Amiri',serif] mt-0.5 mb-3 italic">
                  جوامع الكلم النبوي
                </p>

                <p className="text-sm text-[#d1c7b7] font-['Amiri',serif] leading-relaxed mb-6">
                  مختارات من صحاح الأدعية النبوية في تفريج الكروب، وسؤال العافية، وجلب الرزق، والبر بالوالدين.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('duas')}
                className="w-full py-3 px-4 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#f5efe6] bg-[#064e3b]/40 hover:bg-[#dfbd69] hover:text-[#021812] border border-[#c5a059]/30 hover:border-[#dfbd69] transition-all flex items-center justify-center gap-2 cursor-pointer group/btn"
              >
                <span>تصفح الأدعية النبوية</span>
                <ArrowLeft className="w-4 h-4 text-[#dfbd69] group-hover/btn:text-[#021812] group-hover/btn:-translate-x-1 transition-all" />
              </button>
            </div>

            {/* 10: التسبيح الإلكتروني Card */}
            <div className="group relative rounded-2xl bg-gradient-to-b from-[#03241b] via-[#021c15] to-[#01140e] border border-[#c5a059]/25 hover:border-[#dfbd69]/70 p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/50 border border-[#c5a059]/30 flex items-center justify-center group-hover:bg-[#064e3b] transition-all">
                    <Sparkles className="w-6 h-6 text-[#dfbd69]" />
                  </div>
                  <span className="text-xs text-[#c5a059] font-['Amiri',serif]">
                    عداد تفاعلي
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                  التسبيح الإلكتروني
                </h3>
                <p className="text-xs text-[#dfbd69]/85 font-['Amiri',serif] mt-0.5 mb-3 italic">
                  مسبحة رقمية هادئة
                </p>

                <p className="text-sm text-[#d1c7b7] font-['Amiri',serif] leading-relaxed mb-6">
                  مسبحة إلكترونية فخمة بعداد كبير مريح لليد الواحدة، تدعم الاهتزاز والصوت وأهداف التسبيح.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('tasbeeh')}
                className="w-full py-3 px-4 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#c5a059]/15"
              >
                <span>فتح المسبحة الإلكترونية</span>
                <ArrowLeft className="w-4 h-4 text-[#021812]" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Standalone Digital Tasbeeh */}
      {activeTab === 'tasbeeh' && <DigitalTasbeeh />}

      {/* Tab 3: Duas Library */}
      {activeTab === 'duas' && (
        <DuasLibrary
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

    </div>
  );
};
