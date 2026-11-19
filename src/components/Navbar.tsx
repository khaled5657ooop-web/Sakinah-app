import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IslamicStar } from './IslamicMotifs';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  BookOpen, 
  HeartHandshake, 
  Compass, 
  ScrollText, 
  Clock, 
  Sparkles,
  Headphones
} from 'lucide-react';

interface NavbarProps {
  onSelectSection: (sectionId: string) => void;
  activeSection?: string;
  currentView?: 'home' | 'quran' | 'listen' | 'adhkar' | 'hadith' | 'prayer' | 'install';
  onNavigateView?: (view: 'home' | 'quran' | 'listen' | 'adhkar' | 'hadith' | 'prayer' | 'install', subTab?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSelectSection, 
  currentView = 'home', 
  onNavigateView 
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'hero', label: 'الرئيسية' },
    { id: 'quran', label: 'القرآن الكريم' },
    { id: 'listen', label: 'استمع للقرآن' },
    { id: 'adhkar', label: 'الأذكار' },
    { id: 'duas', label: 'الأدعية' },
    { id: 'hadith', label: 'الأحاديث' },
    { id: 'prayer', label: 'الصلاة والقبلة' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'hero') {
      if (onNavigateView) {
        onNavigateView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'quran') {
      if (onNavigateView) {
        onNavigateView('quran');
      } else {
        onSelectSection('quran');
      }
    } else if (id === 'listen') {
      if (onNavigateView) {
        onNavigateView('listen');
      } else {
        onSelectSection('listen');
      }
    } else if (id === 'adhkar') {
      if (onNavigateView) {
        onNavigateView('adhkar', 'directory');
      } else {
        onSelectSection('adhkar');
      }
    } else if (id === 'duas') {
      if (onNavigateView) {
        onNavigateView('adhkar', 'duas');
      } else {
        onSelectSection('duas');
      }
    } else if (id === 'hadith') {
      if (onNavigateView) {
        onNavigateView('hadith');
      } else {
        onSelectSection('hadith');
      }
    } else if (id === 'prayer') {
      if (onNavigateView) {
        onNavigateView('prayer', 'times');
      } else {
        onSelectSection('prayer');
      }
    } else {
      onSelectSection(id);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#fbf9f5]/95 dark:bg-[#021812]/90 text-[#03241b] dark:text-[#f5efe6] border-b border-[#c5a059]/25 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-3 lg:gap-8">
          
          {/* Zone 1: Single brand wordmark */}
          <button 
            onClick={() => {
              if (onNavigateView) onNavigateView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-right group cursor-pointer whitespace-nowrap shrink-0 text-inherit"
            aria-label="العودة لأعلى الصفحة الرئيسية سَكِينَة"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#064e3b] to-[#022018] border border-[#c5a059]/40 flex items-center justify-center shadow-sm group-hover:border-[#c5a059] transition-all duration-300">
              <IslamicStar size={20} className="text-[#dfbd69] group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] tracking-wide text-[#064e3b] dark:text-[#dfbd69] group-hover:text-[#c5a059] dark:group-hover:text-[#f3e5ab] transition-colors">
                سَكِينَة
              </span>
              <span className="text-[10px] uppercase font-['Cinzel',serif] tracking-[0.25em] text-[#8c6b2d] dark:text-[#c5a059]/75 -mt-1">
                SAKINAH
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (single line, subtle hover underline) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                (link.id === 'hero' && currentView === 'home') ||
                (link.id === currentView);
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer group ${
                    isActive
                      ? 'text-[#c5a059] dark:text-[#dfbd69] font-semibold'
                      : 'text-slate-700 dark:text-[#e4ded5] hover:text-[#c5a059] dark:hover:text-[#dfbd69]'
                  }`}
                >
                  <span>{link.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 h-[1.5px] bg-[#dfbd69] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Conditional PWA Install Button (hidden if unsupported/installed) */}
            <PWAInstallButton
              variant="navbar"
              onOpenInstallGuide={() => {
                if (onNavigateView) onNavigateView('install');
                else onSelectSection('install');
              }}
            />

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg border border-[#c5a059]/30 hover:border-[#c5a059] flex items-center justify-center text-[#03241b] dark:text-[#dfbd69] hover:bg-[#c5a059]/10 transition-all cursor-pointer"
              title={theme === 'dark' ? 'التحويل للوضع النهاري العاجي' : 'التحويل للوضع الليلي الزمردي'}
              aria-label="تبديل مظهر الموقع"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#dfbd69]" />
              ) : (
                <Moon className="w-4 h-4 text-[#064e3b]" />
              )}
            </button>

            {/* Quick Dhikr CTA */}
            <button
              onClick={() => {
                const el = document.getElementById('dhikr-sanctuary');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else if (onNavigateView) {
                  onNavigateView('adhkar', 'tasbeeh');
                }
              }}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-[#021812] bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 font-['Amiri',serif]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مساحة الذكر</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg border border-[#c5a059]/30 flex items-center justify-center text-[#03241b] dark:text-[#e4ded5] hover:bg-[#c5a059]/10 transition-colors cursor-pointer"
              aria-label="فتح القائمة الرئيسية"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-sm h-full bg-[#032018] text-[#f5efe6] border-r border-[#c5a059]/30 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#c5a059]/20">
                <div className="flex items-center gap-2">
                  <IslamicStar size={18} className="text-[#dfbd69]" />
                  <span className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">سَكِينَة</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="p-1.5 rounded-lg border border-[#c5a059]/20 text-[#e4ded5] hover:text-[#dfbd69]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('hero')}
                  className="flex items-center gap-3 p-3 text-right rounded-lg hover:bg-[#064e3b]/30 text-[#f5efe6] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#dfbd69]" />
                  <span className="text-base font-medium">الرئيسية</span>
                </button>

                <button
                  onClick={() => handleNavClick('quran')}
                  className="flex items-center gap-3 p-3 text-right rounded-lg hover:bg-[#064e3b]/30 text-[#f5efe6] transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#dfbd69]" />
                  <span className="text-base font-medium">القرآن الكريم</span>
                </button>

                <button
                  onClick={() => handleNavClick('listen')}
                  className="flex items-center gap-3 p-3 text-right rounded-lg hover:bg-[#064e3b]/30 text-[#f5efe6] transition-colors cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-[#dfbd69]" />
                  <span className="text-base font-medium">استمع إلى القرآن الكريم</span>
                </button>

                <button
                  onClick={() => handleNavClick('adhkar')}
                  className="flex items-center gap-3 p-3 text-right rounded-lg hover:bg-[#064e3b]/30 text-[#f5efe6] transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4 text-[#dfbd69]" />
                  <span className="text-base font-medium">الأذكار اليومية</span>
                </button>

                <button
                  onClick={() => handleNavClick('duas')}
                  className="flex items-center gap-3 p-3 text-right rounded-lg hover:bg-[#064e3b]/30 text-[#f5efe6] transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#dfbd69]" />
                  <span className="text-base font-medium">الأدعية المأثورة</span>
                </button>

                <button
                  onClick={() => handleNavClick('hadith')}
                  className="flex items-center gap-3 p-3 text-right rounded-lg hover:bg-[#064e3b]/30 text-[#f5efe6] transition-colors cursor-pointer"
                >
                  <ScrollText className="w-4 h-4 text-[#dfbd69]" />
                  <span className="text-base font-medium">الأحاديث النبوية</span>
                </button>

                <button
                  onClick={() => handleNavClick('prayer')}
                  className="flex items-center gap-3 p-3 text-right rounded-lg hover:bg-[#064e3b]/30 text-[#f5efe6] transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-[#dfbd69]" />
                  <span className="text-base font-medium">مواقيت الصلاة والقبلة</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-[#c5a059]/20 flex flex-col gap-3 text-xs text-[#c5a059]/80 text-center">
              <PWAInstallButton
                variant="drawer"
                onOpenInstallGuide={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateView) onNavigateView('install');
                  else onSelectSection('install');
                }}
              />
              <p className="font-['Amiri',serif]">"مساحة يطمئن فيها قلبك، وتأنس فيها روحك"</p>
              <div className="flex justify-center">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#c5a059]/30 text-xs text-[#dfbd69] cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
