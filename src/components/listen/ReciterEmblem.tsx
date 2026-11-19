import React from 'react';
import { QuranReciter } from '../../data/recitersData';

interface ReciterEmblemProps {
  reciter: QuranReciter;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export const ReciterEmblem: React.FC<ReciterEmblemProps> = ({
  reciter,
  size = 'md',
  isActive = false,
}) => {
  const dimensions =
    size === 'sm'
      ? 'w-11 h-11 text-sm rounded-xl'
      : size === 'lg'
        ? 'w-20 h-20 text-2xl rounded-2xl'
        : 'w-14 h-14 text-lg rounded-2xl';

  return (
    <div
      className={`relative shrink-0 ${dimensions} bg-gradient-to-br ${reciter.emblemAccent.glow} border ${
        isActive ? 'border-[#dfbd69] shadow-lg shadow-[#dfbd69]/20' : 'border-[#c5a059]/35'
      } flex items-center justify-center overflow-hidden select-none transition-all duration-200`}
      aria-hidden="true"
    >
      {/* Subtle 8-point Khatam Geometric Watermark */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full opacity-20"
        fill="none"
      >
        <rect
          x="18"
          y="18"
          width="64"
          height="64"
          stroke={reciter.emblemAccent.ring}
          strokeWidth="1.5"
        />
        <rect
          x="18"
          y="18"
          width="64"
          height="64"
          transform="rotate(45 50 50)"
          stroke={reciter.emblemAccent.ring}
          strokeWidth="1.5"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke={reciter.emblemAccent.ring}
          strokeWidth="0.9"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Gold Inner Frame Accent */}
      <div className="relative z-10 flex flex-col items-center justify-center leading-none">
        <span className="font-['Aref_Ruqaa',serif] font-bold text-[#dfbd69] drop-shadow-sm">
          {reciter.emblemAccent.monogram}
        </span>
      </div>
    </div>
  );
};
