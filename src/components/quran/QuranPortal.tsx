import React, { useState, useEffect } from 'react';
import { QuranDirectory } from './QuranDirectory';
import { QuranReader } from './QuranReader';
import { QuranSearchModal } from './QuranSearchModal';
import { LastReadProgress, QuranBookmark } from './QuranContinueSection';

interface QuranPortalProps {
  initialSurahId?: number;
  initialAyah?: number;
  onActiveSurahChange?: (surahId: number | undefined) => void;
  onBackToHome: () => void;
}

export const QuranPortal: React.FC<QuranPortalProps> = ({
  initialSurahId,
  initialAyah = 1,
  onActiveSurahChange,
  onBackToHome,
}) => {
  const [activeSurahId, setActiveSurahId] = useState<number | null>(initialSurahId || null);
  const [targetAyah, setTargetAyah] = useState<number>(initialAyah);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    setActiveSurahId(initialSurahId ?? null);
    setTargetAyah(initialAyah);
  }, [initialSurahId, initialAyah]);

  // Bookmarks state (saved in localStorage)
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakinah_quran_bookmarks');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Last read position (saved in localStorage)
  const [lastRead, setLastRead] = useState<LastReadProgress | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakinah_quran_lastread');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sakinah_quran_bookmarks', JSON.stringify(bookmarks));
    } catch {
      // Storage full or restricted
    }
  }, [bookmarks]);

  // Save last read to localStorage
  const handleSaveLastRead = (
    chapterId: number,
    chapterName: string,
    verseNumber: number,
    verseExcerpt: string
  ) => {
    const progress: LastReadProgress = {
      chapterId,
      chapterName: `سورة ${chapterName}`,
      verseNumber,
      verseExcerpt,
      timestamp: Date.now(),
    };
    setLastRead(progress);
    try {
      localStorage.setItem('sakinah_quran_lastread', JSON.stringify(progress));
    } catch {
      // Storage restriction
    }
  };

  const handleToggleBookmark = (
    chapterId: number,
    chapterName: string,
    verseNumber: number,
    verseText: string
  ) => {
    const id = `${chapterId}:${verseNumber}`;
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === id);
      if (exists) {
        return prev.filter((b) => b.id !== id);
      } else {
        const newBm: QuranBookmark = {
          id,
          chapterId,
          chapterName: `سورة ${chapterName}`,
          verseNumber,
          verseText,
          timestamp: Date.now(),
        };
        return [newBm, ...prev];
      }
    });
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  const handleOpenSurah = (surahId: number, startAyah: number = 1) => {
    setActiveSurahId(surahId);
    setTargetAyah(startAyah);
    onActiveSurahChange?.(surahId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDirectory = () => {
    setActiveSurahId(null);
    onActiveSurahChange?.(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVerseFromSearch = (chapterNumber: number, verseNumber: number) => {
    setActiveSurahId(chapterNumber);
    setTargetAyah(verseNumber);
    onActiveSurahChange?.(chapterNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {activeSurahId ? (
        <QuranReader
          surahId={activeSurahId}
          initialAyah={targetAyah}
          onBackToDirectory={handleBackToDirectory}
          onSelectSurah={(id, ayah = 1) => handleOpenSurah(id, ayah)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          onSaveLastRead={handleSaveLastRead}
        />
      ) : (
        <QuranDirectory
          onOpenSurah={handleOpenSurah}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          lastRead={lastRead}
          bookmarks={bookmarks}
          onRemoveBookmark={handleRemoveBookmark}
          onBackToHome={onBackToHome}
        />
      )}

      {/* Full Quran Search Modal */}
      <QuranSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectVerse={handleSelectVerseFromSearch}
      />
    </div>
  );
};
