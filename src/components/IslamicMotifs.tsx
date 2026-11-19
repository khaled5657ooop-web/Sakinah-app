import React from 'react';

/**
 * Islamic Geometric Eight-Pointed Star (خاتم سليمان / النجمة الثمانية المعمارية)
 */
export const IslamicStar: React.FC<{ className?: string; size?: number }> = ({ 
  className = "text-[#c5a059]", 
  size = 24 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer subtle ring */}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 3" />
      {/* Rotated overlapping squares forming the 8-pointed star */}
      <rect x="10" y="10" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
      <rect x="10" y="10" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" transform="rotate(45 24 24)" />
      {/* Inner central gem */}
      <circle cx="24" cy="24" r="3" fill="currentColor" fillOpacity="0.9" />
    </svg>
  );
};

/**
 * Traditional Islamic Calligraphic Divider Motif
 */
export const IslamicDivider: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center gap-3 my-6 ${className}`}>
      <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-[#c5a059]/40 to-[#c5a059]/80" />
      <IslamicStar size={20} className="text-[#c5a059]" />
      <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent via-[#c5a059]/40 to-[#c5a059]/80" />
    </div>
  );
};

/**
 * Authentic Bismillah Calligraphic Vector Representation
 */
export const BismillahText: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`text-center select-none ${className}`}>
      <span className="font-['Amiri_Quran',serif] text-xl sm:text-2xl md:text-3xl text-[#dfbd69] tracking-wider drop-shadow-sm">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </span>
    </div>
  );
};

/**
 * Islamic Arch Silhouette SVG frame
 */
export const IslamicArchFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-t-[100px] sm:rounded-t-[140px] border border-[#c5a059]/25 ${className}`}>
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059]/60 to-transparent z-10" />
      {children}
    </div>
  );
};
