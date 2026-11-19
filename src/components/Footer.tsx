import React from 'react';
import { IslamicStar, IslamicDivider } from './IslamicMotifs';
import { PWAInstallButton } from './PWAInstallButton';
import { ArrowUp, BookOpen, Headphones, HeartHandshake, Compass, ScrollText, Clock } from 'lucide-react';

interface FooterProps {
  onSelectSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectSection }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#01140e] text-[#f5efe6] border-t border-[#c5a059]/20 pt-16 pb-12 overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#021812] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#c5a059]/15">
          
          {/* Brand & Sincere Supplication */}
          <div className="md:col-span-6 space-y-4 text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#064e3b]/50 border border-[#c5a059]/40 flex items-center justify-center">
                <IslamicStar size={20} className="text-[#dfbd69]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                  سَكِينَة | SAKINAH
                </h3>
                <p className="text-xs font-['Amiri',serif] text-[#c5a059]/80">
                  منصة إسلامية مجانية للجميع.
                </p>
              </div>
            </div>

            {/* Requested Sincere Supplication */}
            <div className="p-4 rounded-xl bg-[#032018] border border-[#c5a059]/20 max-w-lg">
              <p className="text-sm font-['Amiri',serif] text-[#fbf9f5] leading-relaxed">
                "اللهم اجعل هذا العمل خالصًا لوجهك الكريم، وانفع به عبادك، واجعله صدقة جارية ونوراً في القلوب."
              </p>
            </div>

            <p className="text-xs text-[#a89e8f] font-['Amiri',serif] leading-relaxed max-w-md">
              منصة تهدف إلى تقريب الناس من كتاب الله وسنة رسوله، وتقديم تجربة استخدام إسلامية استثنائية دون أي إعلانات أو مقابل مادي.
            </p>
          </div>

          {/* Quick Links to Sections */}
          <div className="md:col-span-3 space-y-3 text-right">
            <h4 className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69] uppercase tracking-wider mb-4">
              أبواب المنصة
            </h4>
            <ul className="space-y-2.5 text-sm font-['Amiri',serif] text-[#d4ccbf]">
              <li>
                <button
                  onClick={() => onSelectSection('quran')}
                  className="hover:text-[#dfbd69] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>القرآن الكريم</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSection('listen')}
                  className="hover:text-[#dfbd69] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>استمع إلى القرآن الكريم</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSection('adhkar')}
                  className="hover:text-[#dfbd69] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>الأذكار اليومية</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSection('duas')}
                  className="hover:text-[#dfbd69] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>الأدعية المأثورة</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSection('hadith')}
                  className="hover:text-[#dfbd69] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ScrollText className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>الأحاديث النبوية</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSection('prayer')}
                  className="hover:text-[#dfbd69] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>مواقيت الصلاة والقبلة</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Vision & Back to Top */}
          <div className="md:col-span-3 space-y-4 text-right flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69] uppercase tracking-wider mb-3">
                الهوية والرسالة
              </h4>
              <p className="text-xs text-[#a89e8f] font-['Amiri',serif] leading-relaxed">
                "مساحة يطمئن فيها قلبك، وتأنس فيها روحك."
              </p>
              <div className="mt-3 text-xs text-[#c5a059]/75 font-['Amiri',serif] leading-relaxed">
                منصة إسلامية متكاملة مجانية للقرآن الكريم، الأذكار والأدعية، الحديث النبوي، ومواقيت الصلاة والقبلة.
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5">
              <PWAInstallButton
                variant="footer"
                onOpenInstallGuide={() => onSelectSection('install')}
              />

              {/* Back To Top Button */}
              <button
                onClick={scrollToTop}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#c5a059]/30 hover:border-[#dfbd69] bg-[#032018] hover:bg-[#064e3b]/30 text-xs font-['Amiri',serif] text-[#dfbd69] transition-all cursor-pointer self-start"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>العودة إلى أعلى الصفحة</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8f8576] font-['Amiri',serif] gap-4">
          <div>
            جميع الحقوق محفوظة لمنصة <span className="text-[#c5a059]">سَكِينَة | SAKINAH</span> © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-4 text-[#a89e8f] flex-wrap justify-center">
            <span>مبادرة وقفية لوجه الله</span>
            <span>•</span>
            <span>تصميم إسلامي فاخر</span>
            <span>•</span>
            <span>بدون إعلانات</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => onSelectSection('admin')}
              className="text-[#c5a059] hover:text-[#dfbd69] underline-offset-4 hover:underline transition-colors cursor-pointer"
            >
              لوحة التطوير
            </button>
          </div>
        </div>

        {/* Simple Islamic Decorative Divider */}
        <IslamicDivider className="mt-8 mb-6" />

        {/* Platform Dedication & Creator Signature */}
        <div className="max-w-xl mx-auto rounded-2xl bg-gradient-to-b from-[#03221a]/80 to-[#021812]/90 border border-[#c5a059]/20 px-6 py-5 text-center space-y-2.5">
          <p className="text-base sm:text-lg font-['Amiri',serif] text-[#fbf9f5] leading-relaxed">
            «نسأل الله أن يجعله علمًا نافعًا وصدقةً جارية ❤️»
          </p>

          <div className="pt-1 space-y-1">
            <p className="text-xs font-['Amiri',serif] text-[#c5a059]/85 tracking-wide">
              تنفيذ وتصميم
            </p>
            <p className="text-base sm:text-lg font-['Amiri',serif] font-bold text-[#dfbd69] tracking-wide flex flex-wrap items-center justify-center gap-2">
              <span>خالد أحمد</span>
              <span className="text-[#c5a059]/50 font-normal">|</span>
              <span className="font-['Cinzel',serif] text-sm sm:text-base font-semibold tracking-wider text-[#f5efe6]">
                Khaled Ahmed
              </span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
