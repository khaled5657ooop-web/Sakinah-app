import React, { useEffect, useState } from 'react';
import { IslamicStar } from './IslamicMotifs';

/**
 * Lightweight, non-blocking branded Splash Screen rendered briefly on cold app start.
 * Matches manifest theme_color/background_color (#021812) and respects prefers-reduced-motion.
 */
export const AppSplashScreen: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return !sessionStorage.getItem('sakinah_splash_shown');
    } catch {
      return false;
    }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem('sakinah_splash_shown', '1');
    } catch {
      // Ignore restricted sessionStorage
    }

    const fadeTimer = window.setTimeout(() => setFading(true), 420);
    const removeTimer = window.setTimeout(() => setVisible(false), 700);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#021812] text-[#fbf9f5] px-6 transition-opacity duration-300 pointer-events-none ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#011610] border border-[#dfbd69]/50 flex items-center justify-center shadow-2xl shadow-[#dfbd69]/15">
          <IslamicStar size={40} className="text-[#dfbd69]" />
        </div>
        <div className="space-y-1">
          <div className="text-4xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
            سَكِينَة
          </div>
          <div className="text-xs uppercase font-['Cinzel',serif] tracking-[0.35em] text-[#c5a059]/80">
            SAKINAH
          </div>
        </div>
        <p className="text-sm font-['Amiri',serif] text-[#d4ccbf]/90 mt-1">
          مساحة يطمئن فيها قلبك، وتأنس فيها روحك
        </p>
      </div>
    </div>
  );
};
