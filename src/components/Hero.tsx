import React from 'react';
import { IslamicDivider, IslamicStar } from './IslamicMotifs';
import { BookOpen, Compass, ChevronDown } from 'lucide-react';
import heroArchImg from '../assets/images/islamic_arch_luxury_1794522585649.jpg';

interface HeroProps {
  onStartJourney: () => void;
  onBrowseQuran: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourney, onBrowseQuran }) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Background Architectural Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroArchImg}
          alt="رواق إسلامي فاخر بإطلالة هادئة"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Measured Luxury Contrast Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#021812] via-[#021812]/80 to-[#021812]/70 dark:from-[#021812] dark:via-[#021812]/80 dark:to-[#021812]/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#021812]/60 to-[#021812]" />
      </div>

      {/* Decorative Islamic Geometric Overhead Motif */}
      <div className="absolute top-6 inset-x-0 flex justify-center opacity-40 pointer-events-none z-10">
        <div className="w-96 h-24 border-b border-[#c5a059]/30 rounded-b-[100px] flex items-end justify-center pb-2">
          <IslamicStar size={18} className="text-[#c5a059]" />
        </div>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Bismillah Calligraphy */}
        <div className="animate-fade-in-up duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5a059]/25 bg-[#032018]/60 backdrop-blur-md mb-6">
            <IslamicStar size={14} className="text-[#dfbd69]" />
            <span className="font-['Amiri_Quran',serif] text-base sm:text-lg text-[#dfbd69] tracking-wider">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <IslamicStar size={14} className="text-[#dfbd69]" />
          </div>
        </div>

        {/* Brand Main Title */}
        <div className="my-2 space-y-1">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold font-['Aref_Ruqaa',serif] text-[#fbf9f5] tracking-wide drop-shadow-md">
            سَكِينَة
          </h1>
          <div className="text-sm sm:text-base font-['Cinzel',serif] tracking-[0.35em] uppercase text-[#dfbd69] font-medium">
            SAKINAH
          </div>
        </div>

        {/* Traditional Divider */}
        <IslamicDivider className="my-4" />

        {/* Primary Slogan & Mission */}
        <p className="text-xl sm:text-2xl md:text-3xl font-['Amiri',serif] text-[#f5efe6] font-medium leading-relaxed max-w-2xl text-balance">
          "رفيقك إلى الطمأنينة والقرب من الله."
        </p>

        <p className="mt-3 text-sm sm:text-base text-[#d1c7b7] max-w-xl font-['Amiri',serif] leading-relaxed">
          مساحة يطمئن فيها قلبك، وتأنس فيها روحك.. تتنسم فيها عبير القرآن، وتلهج بذكر الرحمن.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* Primary Action Button */}
          <button
            onClick={onStartJourney}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-['Amiri',serif] text-base font-semibold text-[#021812] bg-gradient-to-r from-[#dfbd69] via-[#f3e5ab] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all duration-300 shadow-lg shadow-[#c5a059]/15 flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.02]"
          >
            <Compass className="w-5 h-5 text-[#021812] group-hover:rotate-45 transition-transform duration-300" />
            <span>ابدأ رحلتك</span>
          </button>

          {/* Secondary Action Button */}
          <button
            onClick={onBrowseQuran}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-['Amiri',serif] text-base font-medium text-[#fbf9f5] border border-[#c5a059]/40 bg-[#032018]/50 hover:bg-[#064e3b]/40 hover:border-[#dfbd69] transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer group"
          >
            <BookOpen className="w-5 h-5 text-[#dfbd69] group-hover:scale-110 transition-transform" />
            <span>تصفح القرآن الكريم</span>
          </button>
        </div>

        {/* Islamic Values Highlights */}
        <div className="mt-14 pt-8 border-t border-[#c5a059]/15 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-xl text-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#c5a059]/80 mb-1 font-['Cinzel',serif]">NOBLE QURAN</div>
            <div className="text-sm sm:text-base font-medium text-[#f5efe6] font-['Amiri',serif]">تلاوة وتدبر</div>
          </div>
          <div className="border-x border-[#c5a059]/15">
            <div className="text-xs uppercase tracking-wider text-[#c5a059]/80 mb-1 font-['Cinzel',serif]">REMEMBRANCE</div>
            <div className="text-sm sm:text-base font-medium text-[#f5efe6] font-['Amiri',serif]">أذكار وأدعية</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-[#c5a059]/80 mb-1 font-['Cinzel',serif]">SERENITY</div>
            <div className="text-sm sm:text-base font-medium text-[#f5efe6] font-['Amiri',serif]">سكينة وطمأنينة</div>
          </div>
        </div>

        {/* Gentle Scroll Indicator */}
        <button
          onClick={onStartJourney}
          aria-label="الانتقال إلى محتوى الصفحة"
          className="mt-12 text-[#c5a059]/60 hover:text-[#dfbd69] transition-colors flex flex-col items-center gap-1 cursor-pointer animate-bounce"
        >
          <span className="text-[11px] font-['Amiri',serif] tracking-wider">استكشف السكينة</span>
          <ChevronDown className="w-4 h-4" />
        </button>

      </div>
    </section>
  );
};
