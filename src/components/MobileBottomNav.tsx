import React from 'react';
import { Home, BookOpen, Headphones, HeartHandshake, Clock } from 'lucide-react';

export type MobileNavView = 'home' | 'quran' | 'listen' | 'adhkar' | 'prayer' | 'hadith' | 'install';

interface MobileBottomNavProps {
  currentView: MobileNavView;
  onSelectView: (view: 'home' | 'quran' | 'listen' | 'adhkar' | 'prayer') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
}) => {
  const tabs: {
    id: 'home' | 'quran' | 'listen' | 'adhkar' | 'prayer';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quran', label: 'القرآن', icon: BookOpen },
    { id: 'listen', label: 'استمع', icon: Headphones },
    { id: 'adhkar', label: 'الأذكار', icon: HeartHandshake },
    { id: 'prayer', label: 'الصلاة', icon: Clock },
  ];

  return (
    <nav
      aria-label="التنقل السريع على الهاتف"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#fbf9f5]/95 dark:bg-[#021812]/95 backdrop-blur-md border-t border-[#c5a059]/30 shadow-[0_-6px_24px_rgba(0,0,0,0.18)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectView(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] px-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#064e3b] dark:text-[#dfbd69] font-bold'
                  : 'text-[#6a5f50] dark:text-[#b8ad9c] hover:text-[#064e3b] dark:hover:text-[#dfbd69]'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 inset-x-3 h-[2px] rounded-full bg-[#064e3b] dark:bg-[#dfbd69]"
                />
              )}
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[11px] font-['Amiri',serif] leading-none whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
