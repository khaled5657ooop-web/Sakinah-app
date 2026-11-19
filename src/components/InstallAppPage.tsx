import React from 'react';
import { IslamicStar } from './IslamicMotifs';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Globe,
  PlusSquare,
  Share,
  Smartphone,
  Wifi,
} from 'lucide-react';

interface InstallAppPageProps {
  onBackToHome: () => void;
}

export const InstallAppPage: React.FC<InstallAppPageProps> = ({ onBackToHome }) => {
  const { isInstalled, canPromptInstall, isIOSInstallable, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <button
        type="button"
        onClick={onBackToHome}
        className="inline-flex items-center gap-2 text-sm font-['Amiri',serif] text-[#064e3b] dark:text-[#dfbd69] hover:text-[#c5a059] transition-colors mb-6 cursor-pointer min-h-[44px]"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة إلى الرئيسية</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c6b2d] dark:text-[#c5a059] font-['Cinzel',serif] mb-2">
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
          <span>INSTALL SAKINAH APP</span>
          <IslamicStar size={12} className="text-[#a0792b] dark:text-[#dfbd69]" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
          تثبيت تطبيق سَكِينَة
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#424d47] dark:text-[#d1c7b7] font-['Amiri',serif]">
          ثبّت منصة سَكِينَة على هاتفك أو حاسوبك كتطبيق مستقل بواجهة هادئة خالية من شريط المتصفح وسرعة وصول فورية.
        </p>
      </div>

      {/* Live Installation Status Card */}
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-[#04281f] via-[#022018] to-[#01140e] border border-[#c5a059]/35 p-6 sm:p-8 text-[#f5efe6] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/60 border border-[#dfbd69]/40 flex items-center justify-center shrink-0">
              {isInstalled ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              ) : (
                <Smartphone className="w-7 h-7 text-[#dfbd69]" />
              )}
            </div>
            <div className="space-y-1.5 text-right">
              <h2 className="text-xl sm:text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
                {isInstalled
                  ? 'تطبيق سَكِينَة مثبّت ويعمل الآن في الوضع المستقل'
                  : canPromptInstall
                  ? 'متصفحك جاهز للتثبيت المباشر بضغطة واحدة'
                  : isIOSInstallable
                  ? 'التثبيت عبر سفاري على آيفون وآيباد'
                  : 'طريقة التثبيت اليدوي على متصفحك الحالي'}
              </h2>
              <p className="text-sm font-['Amiri',serif] text-[#d4ccbf] leading-relaxed">
                {isInstalled
                  ? 'أنت تستخدم المنصة الآن كتطبيق مثبت على جهازك مع حفظ الأذكار والأدعية وتفضيلاتك محليًا.'
                  : canPromptInstall
                  ? 'اضغط على زر «تثبيت التطبيق» أدناه لإضافة سَكِينَة مباشرة إلى شاشتك الرئيسية.'
                  : 'إذا لم يدعم متصفحك الحالي نافذة التثبيت التلقائية، اتبع الخطوات الموضحة لكل نظام أدناه.'}
              </p>
            </div>
          </div>

          {!isInstalled && canPromptInstall && (
            <button
              type="button"
              onClick={() => promptInstall()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#dfbd69] to-[#c5a059] hover:from-[#f3e5ab] hover:to-[#dfbd69] text-[#021812] font-bold font-['Amiri',serif] text-sm shadow-lg cursor-pointer shrink-0 min-h-[48px] whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق</span>
            </button>
          )}
        </div>
      </section>

      {/* Platform Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Android Guide */}
        <section className="rounded-2xl bg-[#fbf9f5] dark:bg-[#032018] border border-[#c5a059]/30 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#c5a059]/20">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b]/15 dark:bg-[#064e3b]/50 flex items-center justify-center text-[#064e3b] dark:text-[#dfbd69]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                على هواتف Android
              </h3>
              <p className="text-xs font-['Amiri',serif] text-[#6a5f50] dark:text-[#b8ad9c]">
                متصفح Chrome أو Edge أو Samsung Internet
              </p>
            </div>
          </div>

          <ol className="space-y-2.5 text-sm font-['Amiri',serif] text-[#03241b] dark:text-[#e4ded5] leading-relaxed">
            <li>١. افتح المنصة في متصفح <strong>Google Chrome</strong> أو <strong>Edge</strong>.</li>
            <li>٢. إذا ظهر زر <strong>«تثبيت التطبيق»</strong> في الأعلى أو الأسفل، اضغط عليه مباشرة.</li>
            <li>٣. أو اضغط على قائمة المتصفح (النقاط الثلاث أعلى الشاشة) واختر <strong>«تثبيت التطبيق»</strong> أو <strong>«الإضافة إلى الشاشة الرئيسية»</strong>.</li>
            <li>٤. ستظهر أيقونة سَكِينَة على الشاشة الرئيسية وتفتح بوضع تطبيق مستقل.</li>
          </ol>
        </section>

        {/* iPhone / iPad Safari Guide */}
        <section className="rounded-2xl bg-[#fbf9f5] dark:bg-[#032018] border border-[#c5a059]/30 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#c5a059]/20">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b]/15 dark:bg-[#064e3b]/50 flex items-center justify-center text-[#064e3b] dark:text-[#dfbd69]">
              <Share className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Aref_Ruqaa',serif] text-[#064e3b] dark:text-[#dfbd69]">
                على أجهزة iPhone و iPad
              </h3>
              <p className="text-xs font-['Amiri',serif] text-[#6a5f50] dark:text-[#b8ad9c]">
                عبر متصفح Safari (سفاري)
              </p>
            </div>
          </div>

          <ol className="space-y-2.5 text-sm font-['Amiri',serif] text-[#03241b] dark:text-[#e4ded5] leading-relaxed">
            <li className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-[#8c6b2d] dark:text-[#dfbd69] shrink-0 mt-1" />
              <span>١. تأكد من فتح الموقع داخل متصفح <strong>Safari</strong> الرسمي (وليس داخل متصفح واتساب أو تيليجرام).</span>
            </li>
            <li className="flex items-start gap-2">
              <Share className="w-4 h-4 text-[#8c6b2d] dark:text-[#dfbd69] shrink-0 mt-1" />
              <span>٢. اضغط على أيقونة <strong>المشاركة (Share)</strong> أسفل الشاشة.</span>
            </li>
            <li className="flex items-start gap-2">
              <PlusSquare className="w-4 h-4 text-[#8c6b2d] dark:text-[#dfbd69] shrink-0 mt-1" />
              <span>٣. مرّر للأسفل واختر <strong>«إضافة إلى الصفحة الرئيسية» (Add to Home Screen)</strong> ثم اضغط «إضافة».</span>
            </li>
          </ol>
        </section>
      </div>

      {/* Unsupported Browsers & In-App WebViews Clarification */}
      <section className="rounded-2xl bg-[#fbf9f5] dark:bg-[#032018]/80 border border-[#c5a059]/25 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-[#064e3b] dark:text-[#dfbd69]">
          <ExternalLink className="w-5 h-5" />
          <h3 className="text-lg font-bold font-['Aref_Ruqaa',serif]">
            إذا كان المتصفح لا يدعم التثبيت المباشر
          </h3>
        </div>
        <ul className="space-y-2 text-sm font-['Amiri',serif] text-[#424d47] dark:text-[#d1c7b7] leading-relaxed">
          <li>
            • <strong>المتصفحات الداخلية للتطبيقات</strong> (مثل فتح الرابط داخل فيسبوك أو تيليجرام أو إنستغرام): لا تدعم التثبيت مباشرة؛ اختر «الفتح في المتصفح» (Chrome على أندرويد أو Safari على آيفون) أولًا.
          </li>
          <li>
            • <strong>متصفحات الحاسوب الداعمة</strong> (Chrome / Edge): يظهر زر التثبيت في شريط العنوان أو داخل القائمة الرئيسية للموقع.
          </li>
          <li className="flex items-start gap-2 pt-1 text-[#064e3b] dark:text-[#dfbd69]">
            <Wifi className="w-4 h-4 shrink-0 mt-1" />
            <span>
              يعمل التطبيق بأفضل صورة عند استضافته على رابط <strong>HTTPS</strong> آمن وتصفح الأقسام الأساسية مرة واحدة ليتم حفظها للعمل السريع دون إنترنت.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
};
