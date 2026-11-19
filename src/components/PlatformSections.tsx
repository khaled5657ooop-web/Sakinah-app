import React from 'react';
import { PLATFORM_SECTIONS, SectionInfo } from '../data/islamicContent';
import { IslamicStar } from './IslamicMotifs';
import { 
  BookOpen, 
  HeartHandshake, 
  Compass, 
  ScrollText, 
  Clock, 
  Navigation,
  Headphones,
  ArrowLeft
} from 'lucide-react';

interface PlatformSectionsProps {
  onSelectSection: (sectionId: string) => void;
}

export const PlatformSections: React.FC<PlatformSectionsProps> = ({ onSelectSection }) => {
  // Map icon name to Lucide component
  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-[#dfbd69]" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-[#dfbd69]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-[#dfbd69]" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-[#dfbd69]" />;
      case 'ScrollText':
        return <ScrollText className="w-6 h-6 text-[#dfbd69]" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-[#dfbd69]" />;
      case 'Navigation':
        return <Navigation className="w-6 h-6 text-[#dfbd69]" />;
      default:
        return <IslamicStar size={24} className="text-[#dfbd69]" />;
    }
  };

  return (
    <section id="sections" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c6b2d] dark:text-[#c5a059] font-['Cinzel',serif] mb-2">
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
          <span>PLATFORM SANCTUARIES</span>
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69] drop-shadow-sm">
          أقسام المنصة
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
          أبواب مباركة صُممت بعناية لترافقك في رحلتك الروحية واليومية مع كتاب الله وسنة رسوله ﷺ
        </p>
      </div>

      {/* Featured Listen Sanctuary Card + Symmetric 6-Card Grid (Zero orphan grid slots) */}
      {(() => {
        const listenSection = PLATFORM_SECTIONS.find((s) => s.id === 'listen');
        const otherSections = PLATFORM_SECTIONS.filter((s) => s.id !== 'listen');
        return (
          <div className="space-y-8">
            {listenSection && (
              <div className="group relative rounded-2xl bg-gradient-to-l from-[#04281f]/95 via-[#022018] to-[#011610] border border-[#c5a059]/35 hover:border-[#dfbd69]/70 p-7 sm:p-9 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10">
                <div className="absolute top-0 inset-x-10 h-[2px] bg-gradient-to-r from-transparent via-[#dfbd69]/60 to-transparent" />
                <div className="flex items-start sm:items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#064e3b]/50 border border-[#dfbd69]/40 flex items-center justify-center shrink-0">
                    {getSectionIcon(listenSection.iconName)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#c5a059] font-['Amiri',serif]">
                      <span>{listenSection.featuresCount}</span>
                      <span aria-hidden="true">·</span>
                      <span>{listenSection.subtitle}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                      {listenSection.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#d4ccbf] font-['Amiri',serif] max-w-2xl leading-relaxed">
                      {listenSection.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectSection(listenSection.id)}
                  className="py-3.5 px-7 rounded-xl font-['Amiri',serif] text-sm font-bold text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md whitespace-nowrap"
                  aria-label={`دخول قسم ${listenSection.title}`}
                >
                  <span>دخول القسم</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {otherSections.map((section: SectionInfo) => (
                <div
                  key={section.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#04281f]/90 via-[#022018]/95 to-[#011610] border border-[#c5a059]/25 hover:border-[#dfbd69]/60 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 hover:-translate-y-1"
                >
                  {/* Top Arch Accent Line */}
                  <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent group-hover:via-[#dfbd69] transition-all" />

                  <div>
                    {/* Card Header: Icon & Category Indicator */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/40 border border-[#c5a059]/30 flex items-center justify-center group-hover:bg-[#064e3b]/70 group-hover:border-[#dfbd69] transition-all duration-300">
                        {getSectionIcon(section.iconName)}
                      </div>

                      {/* Clean unboxed metadata separator (Zero-Pill discipline) */}
                      <div className="flex items-center gap-1.5 text-xs text-[#c5a059] font-['Amiri',serif]">
                        <span>{section.featuresCount}</span>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] group-hover:text-[#dfbd69] transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-xs text-[#dfbd69]/80 font-['Amiri',serif] mt-0.5 mb-3 italic">
                      {section.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-[#d4ccbf] font-['Amiri',serif] leading-relaxed mb-6">
                      {section.description}
                    </p>

                    {/* Highlight points */}
                    <div className="space-y-1.5 pt-4 border-t border-[#c5a059]/15 mb-6 text-xs text-[#b8ad9c] font-['Amiri',serif]">
                      {section.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#dfbd69]/60" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Entry Button */}
                  <button
                    onClick={() => onSelectSection(section.id)}
                    className="w-full py-3 px-4 rounded-xl font-['Amiri',serif] text-sm font-semibold text-[#f5efe6] bg-[#064e3b]/40 hover:bg-[#dfbd69] hover:text-[#021812] border border-[#c5a059]/30 hover:border-[#dfbd69] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group/btn shadow-sm"
                    aria-label={`دخول قسم ${section.title}`}
                  >
                    <span>دخول القسم</span>
                    <ArrowLeft className="w-4 h-4 text-[#dfbd69] group-hover/btn:text-[#021812] group-hover/btn:-translate-x-1 transition-all" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </section>
  );
};
