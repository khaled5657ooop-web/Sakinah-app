import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'drawer' | 'footer';
  onOpenInstallGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  onOpenInstallGuide,
}) => {
  const { isInstalled, canPromptInstall, isIOSInstallable, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (!showIOSModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowIOSModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showIOSModal]);

  // If already running inside standalone installed PWA, hide install actions
  if (isInstalled) {
    return null;
  }

  // In navbar, show install CTA specifically when installation/iOS add-to-home-screen is available
  if (variant === 'navbar' && !canPromptInstall && !isIOSInstallable) {
    return null;
  }

  // In drawer/footer, allow opening dedicated install guide even on browsers without beforeinstallprompt
  if (variant !== 'navbar' && !canPromptInstall && !isIOSInstallable && !onOpenInstallGuide) {
    return null;
  }

  const handleClick = async () => {
    if (canPromptInstall) {
      await promptInstall();
    } else if (isIOSInstallable) {
      setShowIOSModal(true);
    } else if (onOpenInstallGuide) {
      onOpenInstallGuide();
    }
  };

  const buttonClasses =
    variant === 'drawer'
      ? "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#dfbd69]/40 bg-[#064e3b]/40 hover:bg-[#064e3b]/70 text-xs font-bold font-['Amiri',serif] text-[#dfbd69] transition-colors cursor-pointer min-h-[44px]"
      : variant === 'footer'
      ? "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#c5a059]/35 hover:border-[#dfbd69] bg-[#064e3b]/30 hover:bg-[#064e3b]/60 text-xs font-['Amiri',serif] text-[#dfbd69] transition-all cursor-pointer min-h-[44px]"
      : "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#c5a059]/40 hover:border-[#dfbd69] bg-[#064e3b]/25 hover:bg-[#064e3b]/50 text-xs font-['Amiri',serif] text-[#064e3b] dark:text-[#dfbd69] transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px]";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={buttonClasses}
        title="تثبيت تطبيق سَكِينَة على جهازك"
        aria-label="تثبيت التطبيق"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>تثبيت التطبيق</span>
      </button>

      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
        >
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-[#03241b] to-[#021812] border border-[#c5a059]/40 p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#c5a059]/20">
              <div className="flex items-center gap-2.5 text-[#dfbd69]">
                <Smartphone className="w-5 h-5" />
                <h3 id="ios-install-title" className="text-xl font-bold font-['Aref_Ruqaa',serif]">
                  تثبيت سَكِينَة على آيفون وآيباد
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-2 rounded-lg border border-[#c5a059]/25 text-[#e4ded5] hover:text-[#dfbd69] cursor-pointer"
                aria-label="إغلاق تعليمات التثبيت"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-sm font-['Amiri',serif] text-[#f5efe6] leading-relaxed">
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#021812]/80 border border-[#c5a059]/15">
                <Share className="w-4 h-4 text-[#dfbd69] shrink-0 mt-1" />
                <span>
                  ١. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح سفاري بالأسفل.
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#021812]/80 border border-[#c5a059]/15">
                <PlusSquare className="w-4 h-4 text-[#dfbd69] shrink-0 mt-1" />
                <span>
                  ٢. مرّر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> ثم اضغط إضافة.
                </span>
              </li>
            </ol>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#dfbd69] text-[#021812] font-bold font-['Amiri',serif] text-sm hover:bg-[#f3e5ab] transition-colors cursor-pointer"
              >
                فهمت، حسنًا
              </button>
              {onOpenInstallGuide && (
                <button
                  type="button"
                  onClick={() => {
                    setShowIOSModal(false);
                    onOpenInstallGuide();
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[#c5a059]/35 text-[#dfbd69] font-['Amiri',serif] text-sm hover:bg-[#064e3b]/40 transition-colors cursor-pointer"
                >
                  دليل التثبيت الكامل
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
