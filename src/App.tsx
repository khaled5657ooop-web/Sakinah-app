import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { QuranAudioProvider } from './context/QuranAudioContext';
import { PrayerProvider } from './context/PrayerContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AppSplashScreen } from './components/AppSplashScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Hero } from './components/Hero';
import { DailyWirdCard } from './components/DailyWirdCard';
import { HomeQuickJournal } from './components/HomeQuickJournal';
import { DailyHadithCard } from './components/hadith/DailyHadithCard';
import { PrayerTimesPreview } from './components/PrayerTimesPreview';
import { AyahOfTheDay } from './components/AyahOfTheDay';
import { PlatformSections } from './components/PlatformSections';
import { DhikrSanctuary } from './components/DhikrSanctuary';
import { PlatformMessage } from './components/PlatformMessage';
import { SectionModal } from './components/SectionModal';
import { Footer } from './components/Footer';
import { QuranAudioBar } from './components/quran/QuranAudioBar';
import { IslamicStar } from './components/IslamicMotifs';
import type { PrayerPageTab } from './components/prayer/MainPrayerPage';
import {
  fetchSiteRuntimeConfig,
  sendTelemetryEvent,
  type SiteRuntimeConfigResponse,
} from './services/platformApi';

// Route-level code splitting for fast transitions and lightweight offline app shell
const QuranPortal = lazy(() =>
  import('./components/quran/QuranPortal').then(m => ({ default: m.QuranPortal }))
);
const MainAdhkarPage = lazy(() =>
  import('./components/adhkar/MainAdhkarPage').then(m => ({ default: m.MainAdhkarPage }))
);
const MainHadithPage = lazy(() =>
  import('./components/hadith/MainHadithPage').then(m => ({ default: m.MainHadithPage }))
);
const MainPrayerPage = lazy(() =>
  import('./components/prayer/MainPrayerPage').then(m => ({ default: m.MainPrayerPage }))
);
const ListenQuranPage = lazy(() =>
  import('./components/listen/ListenQuranPage').then(m => ({ default: m.ListenQuranPage }))
);
const InstallAppPage = lazy(() =>
  import('./components/InstallAppPage').then(m => ({ default: m.InstallAppPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./components/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage }))
);

type AppView = 'home' | 'quran' | 'listen' | 'adhkar' | 'hadith' | 'prayer' | 'install' | 'admin';
type AdhkarTab = 'directory' | 'tasbeeh' | 'duas' | 'morning' | 'evening';

const VIEW_TITLES: Record<AppView, string> = {
  home: 'سكينة | منصة إسلامية للقرآن الكريم والأذكار والأدعية',
  quran: 'القرآن الكريم — المصحف الإلكتروني والتفسير | سَكِينَة',
  listen: 'استمع إلى القرآن الكريم — تلاوات كاملة بأصوات كبار القراء | سَكِينَة',
  adhkar: 'الأذكار والأدعية والمسبحة الإلكترونية | سَكِينَة',
  hadith: 'السنة النبوية — مكتبة الأحاديث الصحيحة | سَكِينَة',
  prayer: 'الصلاة والقبلة والتقويم الهجري | سَكِينَة',
  install: 'تثبيت تطبيق سَكِينَة على الهاتف والحاسوب | سَكِينَة',
  admin: 'لوحة التطوير والتحديث الذاتي | سَكِينَة',
};

const ViewLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center animate-fade-in-up">
    <div className="relative w-14 h-14 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-[#c5a059]/25 border-t-[#dfbd69] animate-spin" />
      <IslamicStar size={20} className="text-[#064e3b] dark:text-[#dfbd69]" />
    </div>
    <p className="text-base font-['Amiri',serif] text-[#064e3b] dark:text-[#dfbd69]">
      جارٍ تحميل القسم بكل سكينة...
    </p>
  </div>
);

function getRouteFromUrl(): {
  view: AppView;
  adhkarTab: AdhkarTab;
  prayerTab: PrayerPageTab;
} {
  if (typeof window === 'undefined') {
    return { view: 'home', adhkarTab: 'directory', prayerTab: 'times' };
  }
  const section = new URLSearchParams(window.location.search).get('section');
  switch (section) {
    case 'quran':
      return { view: 'quran', adhkarTab: 'directory', prayerTab: 'times' };
    case 'listen':
      return { view: 'listen', adhkarTab: 'directory', prayerTab: 'times' };
    case 'adhkar':
      return { view: 'adhkar', adhkarTab: 'directory', prayerTab: 'times' };
    case 'duas':
      return { view: 'adhkar', adhkarTab: 'duas', prayerTab: 'times' };
    case 'tasbeeh':
      return { view: 'adhkar', adhkarTab: 'tasbeeh', prayerTab: 'times' };
    case 'hadith':
      return { view: 'hadith', adhkarTab: 'directory', prayerTab: 'times' };
    case 'prayer':
      return { view: 'prayer', adhkarTab: 'directory', prayerTab: 'times' };
    case 'qibla':
      return { view: 'prayer', adhkarTab: 'directory', prayerTab: 'qibla' };
    case 'install':
      return { view: 'install', adhkarTab: 'directory', prayerTab: 'times' };
    case 'admin':
      return { view: 'admin', adhkarTab: 'directory', prayerTab: 'times' };
    default:
      return { view: 'home', adhkarTab: 'directory', prayerTab: 'times' };
  }
}

function buildSectionUrl(view: AppView, adhkarTab?: AdhkarTab, prayerTab?: PrayerPageTab): string {
  if (view === 'home') return '/';
  if (view === 'adhkar' && adhkarTab === 'duas') return '/?section=duas';
  if (view === 'adhkar' && adhkarTab === 'tasbeeh') return '/?section=tasbeeh';
  if (view === 'prayer' && prayerTab === 'qibla') return '/?section=qibla';
  return `/?section=${view}`;
}

export default function App() {
  const initialRoute = getRouteFromUrl();
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [adhkarInitialTab, setAdhkarInitialTab] = useState<AdhkarTab>(initialRoute.adhkarTab);
  const [prayerInitialTab, setPrayerInitialTab] = useState<PrayerPageTab>(initialRoute.prayerTab);
  const [targetHadithId, setTargetHadithId] = useState<string | undefined>(undefined);
  const [activeModalSection, setActiveModalSection] = useState<string | null>(null);
  const [targetQuranSurah, setTargetQuranSurah] = useState<number | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    try {
      const saved = localStorage.getItem('sakinah_quran_active_surah');
      const parsed = saved ? Number(saved) : NaN;
      return !Number.isNaN(parsed) && parsed >= 1 && parsed <= 114 ? parsed : undefined;
    } catch {
      return undefined;
    }
  });

  const [siteConfig, setSiteConfig] = useState<SiteRuntimeConfigResponse | null>(null);

  const reloadSiteConfig = () => {
    fetchSiteRuntimeConfig().then((cfg) => {
      if (cfg) setSiteConfig(cfg);
    });
  };

  useEffect(() => {
    reloadSiteConfig();
  }, []);

  // Capture global client runtime errors for the Site Auditor (never interrupts user UX)
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      sendTelemetryEvent({
        eventType: 'error',
        route: window.location.pathname + window.location.search,
        errorMessage: ev.message || 'Uncaught window error',
      });
    };
    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  // Sync page title & record anonymized route visit latency
  useEffect(() => {
    document.title = VIEW_TITLES[currentView] || VIEW_TITLES.home;
    if (currentView !== 'admin') {
      const navEntry = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      sendTelemetryEvent({
        eventType: 'pageview',
        route: currentView === 'home' ? '/' : `/?section=${currentView}`,
        durationMs: navEntry ? Math.round(navEntry.domContentLoadedEventEnd) : undefined,
      });
    }
  }, [currentView]);

  useEffect(() => {
    const handlePopState = () => {
      const next = getRouteFromUrl();
      setAdhkarInitialTab(next.adhkarTab);
      setPrayerInitialTab(next.prayerTab);
      setCurrentView(next.view);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const syncBrowserHistory = (view: AppView, subAdhkar?: AdhkarTab, subPrayer?: PrayerPageTab) => {
    if (typeof window === 'undefined') return;
    const nextUrl = buildSectionUrl(view, subAdhkar, subPrayer);
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== nextUrl) {
      try {
        window.history.pushState({ view }, '', nextUrl);
      } catch {
        // Ignore history restrictions in embedded sandboxes
      }
    }
  };

  const handleActiveSurahChange = (surahId: number | undefined) => {
    setTargetQuranSurah(surahId);
    try {
      if (surahId) {
        localStorage.setItem('sakinah_quran_active_surah', String(surahId));
      } else {
        localStorage.removeItem('sakinah_quran_active_surah');
      }
    } catch {
      // Ignore storage restrictions
    }
  };

  const handleStartJourney = () => {
    const el = document.getElementById('daily-wird-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToPrayer = (tab: PrayerPageTab = 'times') => {
    setPrayerInitialTab(tab);
    setCurrentView('prayer');
    syncBrowserHistory('prayer', undefined, tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToQuran = (surahId?: number) => {
    if (surahId !== undefined) {
      handleActiveSurahChange(surahId);
    }
    setCurrentView('quran');
    syncBrowserHistory('quran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAdhkar = (subTab?: AdhkarTab) => {
    const resolved = subTab || 'directory';
    setAdhkarInitialTab(resolved);
    setCurrentView('adhkar');
    syncBrowserHistory('adhkar', resolved);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToHadith = (hadithId?: string) => {
    setTargetHadithId(hadithId);
    setCurrentView('hadith');
    syncBrowserHistory('hadith');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToListen = () => {
    setCurrentView('listen');
    syncBrowserHistory('listen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToInstall = () => {
    setCurrentView('install');
    syncBrowserHistory('install');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAdmin = () => {
    setCurrentView('admin');
    syncBrowserHistory('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToHome = () => {
    setCurrentView('home');
    syncBrowserHistory('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSectionModal = (sectionId: string) => {
    if (sectionId === 'quran') {
      handleNavigateToQuran();
    } else if (sectionId === 'listen') {
      handleNavigateToListen();
    } else if (sectionId === 'adhkar') {
      handleNavigateToAdhkar('directory');
    } else if (sectionId === 'duas') {
      handleNavigateToAdhkar('duas');
    } else if (sectionId === 'tasbeeh') {
      handleNavigateToAdhkar('tasbeeh');
    } else if (sectionId === 'hadith') {
      setTargetHadithId(undefined);
      handleNavigateToHadith();
    } else if (sectionId === 'prayer') {
      handleNavigateToPrayer('times');
    } else if (sectionId === 'qibla') {
      handleNavigateToPrayer('qibla');
    } else if (sectionId === 'install') {
      handleNavigateToInstall();
    } else if (sectionId === 'admin') {
      handleNavigateToAdmin();
    } else {
      setActiveModalSection(sectionId);
    }
  };

  const handleCloseSectionModal = () => {
    setActiveModalSection(null);
  };

  return (
    <ThemeProvider>
      <PrayerProvider>
        <QuranAudioProvider>
          {/* Branded Cold-Start Emerald & Gold Splash Screen */}
          <AppSplashScreen />

          <div className="min-h-screen bg-[#f6f1e7] dark:bg-[#021812] text-[#03241b] dark:text-[#f5efe6] selection:bg-[#c5a059]/30 selection:text-[#fbf9f5] flex flex-col font-['Amiri',serif] overflow-x-hidden pb-28 md:pb-16 transition-colors duration-300">
            {/* Keyboard Accessibility Skip Link */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#dfbd69] focus:text-[#021812] focus:font-bold focus:shadow-xl"
            >
              التخطي إلى المحتوى الرئيسي
            </a>

            {/* Top Navigation Bar */}
            <Navbar 
              onSelectSection={handleOpenSectionModal}
              currentView={currentView === 'admin' ? 'home' : currentView}
              onNavigateView={(view, subTab) => {
                if (view === 'home') {
                  handleNavigateToHome();
                } else if (view === 'quran') {
                  handleNavigateToQuran();
                } else if (view === 'listen') {
                  handleNavigateToListen();
                } else if (view === 'adhkar') {
                  handleNavigateToAdhkar(subTab as AdhkarTab);
                } else if (view === 'hadith') {
                  handleNavigateToHadith();
                } else if (view === 'prayer') {
                  handleNavigateToPrayer((subTab as PrayerPageTab) || 'times');
                } else if (view === 'install') {
                  handleNavigateToInstall();
                }
              }}
            />

            {/* Honest Offline Connection Banner */}
            <OfflineIndicator />

            <main id="main-content" className="flex-grow">
              <ErrorBoundary onResetToHome={handleNavigateToHome}>
                <Suspense fallback={<ViewLoader />}>
                  {currentView === 'quran' ? (
                    /* Holy Quran Reading Section (preserves open Surah & reading offset) */
                    <QuranPortal
                      initialSurahId={targetQuranSurah}
                      onActiveSurahChange={handleActiveSurahChange}
                      onBackToHome={handleNavigateToHome}
                    />
                  ) : currentView === 'listen' ? (
                    /* Listen to Holy Quran Section */
                    <ListenQuranPage
                      onOpenSurahInReader={(surahId) => handleNavigateToQuran(surahId)}
                      onBackToHome={handleNavigateToHome}
                    />
                  ) : currentView === 'adhkar' ? (
                    /* Adhkar, Duas & Digital Tasbeeh Section */
                    <MainAdhkarPage
                      initialTab={adhkarInitialTab}
                      onBackToHome={handleNavigateToHome}
                    />
                  ) : currentView === 'hadith' ? (
                    /* Authentic Hadith Library */
                    <MainHadithPage
                      initialHadithId={targetHadithId}
                      onBackToHome={() => {
                        setTargetHadithId(undefined);
                        handleNavigateToHome();
                      }}
                    />
                  ) : currentView === 'prayer' ? (
                    /* Prayer Times, Qibla & Islamic Calendar */
                    <MainPrayerPage
                      initialTab={prayerInitialTab}
                      onBackToHome={handleNavigateToHome}
                    />
                  ) : currentView === 'install' ? (
                    /* Dedicated PWA Installation Guide */
                    <InstallAppPage onBackToHome={handleNavigateToHome} />
                  ) : currentView === 'admin' ? (
                    /* Protected Admin Development & Auto-Update Console */
                    <AdminDashboardPage
                      onBackToHome={handleNavigateToHome}
                      onSiteConfigUpdated={reloadSiteConfig}
                    />
                  ) : (
                    /* Main Platform Homepage */
                    <>
                      <Hero 
                        onStartJourney={handleStartJourney}
                        onBrowseQuran={() => handleNavigateToQuran()}
                      />

                      {/* Published Admin-Approved Weekly Sunnah Enhancement (only when enabled in active release) */}
                      {siteConfig?.config.weeklySunnahBanner && (
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                          <div className="rounded-2xl bg-[#03241b] border border-[#c5a059]/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
                            <div>
                              <div className="text-xs text-[#c5a059]">سنة أسبوعية مأثورة</div>
                              <p className="text-sm text-[#fbf9f5]">
                                حافظ على قراءة سورة الكهف يوم الجمعة، والإكثار من الصلاة على النبي ﷺ، وتحرِّ ساعة الاستجابة.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleNavigateToQuran(18)}
                              className="px-4 py-2 rounded-lg bg-[#dfbd69] text-[#021812] text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                            >
                              قراءة سورة الكهف
                            </button>
                          </div>
                        </section>
                      )}

                      {/* Published Admin-Approved Khatmah Reminder Card (only when enabled in active release) */}
                      {siteConfig?.config.khatmahReminderCard && (
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                          <div className="rounded-2xl bg-white dark:bg-[#032018] border border-[#c5a059]/25 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
                            <div>
                              <div className="text-xs text-[#8c6b2d] dark:text-[#c5a059]">متابعة الختمة اليومية</div>
                              <p className="text-sm text-[#03241b] dark:text-[#fbf9f5]">
                                قراءة ٤ صفحات بعد كل صلاة تعينك على إتمام ختمة كاملة كل شهر بيسر وسكينة.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleNavigateToQuran(targetQuranSurah)}
                              className="px-4 py-2 rounded-lg border border-[#c5a059]/40 text-[#064e3b] dark:text-[#dfbd69] text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                            >
                              مواصلة ورد القرآن
                            </button>
                          </div>
                        </section>
                      )}

                      <div id="daily-wird-section">
                        <DailyWirdCard 
                          onNavigateToAdhkar={handleNavigateToAdhkar}
                        />
                      </div>

                      <PrayerTimesPreview 
                        onOpenPrayerPage={() => handleNavigateToPrayer('times')}
                        onOpenQibla={() => handleNavigateToPrayer('qibla')}
                      />

                      <HomeQuickJournal
                        onResumeQuran={(surahId) => handleNavigateToQuran(surahId)}
                        onOpenDuas={() => handleNavigateToAdhkar('duas')}
                      />

                      <AyahOfTheDay 
                        onExploreQuran={() => handleNavigateToQuran()}
                      />

                      <DailyHadithCard
                        onOpenHadith={(id) => handleNavigateToHadith(id)}
                        onExploreHadithLibrary={() => handleNavigateToHadith()}
                      />

                      <PlatformSections 
                        onSelectSection={handleOpenSectionModal}
                      />

                      <DhikrSanctuary 
                        onOpenAdhkar={() => handleNavigateToAdhkar('directory')}
                      />

                      <PlatformMessage />
                    </>
                  )}
                </Suspense>
              </ErrorBoundary>
            </main>

            {/* Footer */}
            <Footer 
              onSelectSection={handleOpenSectionModal}
            />

            {/* Persistent Floating Quran Audio Player */}
            <QuranAudioBar />

            {/* Fixed Mobile Bottom Navigation Bar */}
            <MobileBottomNav
              currentView={currentView === 'admin' ? 'home' : currentView}
              onSelectView={(view) => {
                if (view === 'home') handleNavigateToHome();
                else if (view === 'quran') handleNavigateToQuran();
                else if (view === 'listen') handleNavigateToListen();
                else if (view === 'adhkar') handleNavigateToAdhkar('directory');
                else if (view === 'prayer') handleNavigateToPrayer('times');
              }}
            />

            {/* Interactive Section Modals */}
            <SectionModal 
              sectionId={activeModalSection} 
              onClose={handleCloseSectionModal}
            />

          </div>
        </QuranAudioProvider>
      </PrayerProvider>
    </ThemeProvider>
  );
}
