import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { AVAILABLE_RECITERS, ReciterInfo, fetchChapterAudioUrl } from '../services/quranApi';
import { QURAN_SURAHS } from '../data/quranMetadata';

const STORAGE_FAVORITE_RECITERS = 'sakinah_favorite_reciters';
const STORAGE_PREFERRED_RECITER = 'sakinah_preferred_reciter';
const STORAGE_LAST_LISTENED = 'sakinah_listen_last_played';

export interface LastListenedState {
  chapterNumber: number;
  reciterId: number;
  timestamp: number;
}

interface QuranAudioContextType {
  currentChapter: number | null;
  currentChapterName: string;
  currentReciter: ReciterInfo;
  preferredReciterId: number;
  favoriteReciterIds: number[];
  lastListened: LastListenedState | null;
  isPlaying: boolean;
  isLoading: boolean;
  audioError: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeating: boolean;
  playChapter: (chapterNumber: number, reciterId?: number) => Promise<void>;
  retryCurrentChapter: () => void;
  clearAudioError: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  seekRelative: (offsetSeconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  playNextChapter: () => void;
  playPrevChapter: () => void;
  changeReciter: (reciterId: number) => void;
  toggleFavoriteReciter: (reciterId: number) => void;
  setPreferredReciter: (reciterId: number) => void;
  isFavoriteReciter: (reciterId: number) => boolean;
  closePlayer: () => void;
}

const QuranAudioContext = createContext<QuranAudioContextType | null>(null);

function loadStoredPreferredReciter(): number {
  if (typeof window === 'undefined') return AVAILABLE_RECITERS[0].id;
  try {
    const raw = localStorage.getItem(STORAGE_PREFERRED_RECITER);
    const parsed = raw ? Number(raw) : NaN;
    if (!Number.isNaN(parsed) && AVAILABLE_RECITERS.some((r) => r.id === parsed)) {
      return parsed;
    }
  } catch {
    // Ignore storage access errors
  }
  return AVAILABLE_RECITERS[0].id;
}

function loadStoredFavoriteReciters(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_FAVORITE_RECITERS);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => AVAILABLE_RECITERS.some((r) => r.id === id));
    }
  } catch {
    // Ignore storage access errors
  }
  return [];
}

function loadLastListened(): LastListenedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_LAST_LISTENED);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastListenedState;
    if (
      parsed &&
      typeof parsed.chapterNumber === 'number' &&
      parsed.chapterNumber >= 1 &&
      parsed.chapterNumber <= 114 &&
      AVAILABLE_RECITERS.some((r) => r.id === parsed.reciterId)
    ) {
      return parsed;
    }
  } catch {
    // Ignore storage access errors
  }
  return null;
}

export const QuranAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferredReciterId, setPreferredReciterIdState] = useState<number>(loadStoredPreferredReciter);
  const [favoriteReciterIds, setFavoriteReciterIds] = useState<number[]>(loadStoredFavoriteReciters);
  const [lastListened, setLastListened] = useState<LastListenedState | null>(loadLastListened);

  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const [currentReciter, setCurrentReciter] = useState<ReciterInfo>(() => {
    const prefId = loadStoredPreferredReciter();
    return AVAILABLE_RECITERS.find((r) => r.id === prefId) || AVAILABLE_RECITERS[0];
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRepeatingRef = useRef(isRepeating);
  const currentChapterRef = useRef(currentChapter);
  const currentReciterRef = useRef(currentReciter);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);
  const requestIdRef = useRef(0);

  useEffect(() => {
    isRepeatingRef.current = isRepeating;
  }, [isRepeating]);

  useEffect(() => {
    currentChapterRef.current = currentChapter;
  }, [currentChapter]);

  useEffect(() => {
    currentReciterRef.current = currentReciter;
  }, [currentReciter]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const persistLastListened = useCallback((chapterNumber: number, reciterId: number) => {
    const nextState: LastListenedState = { chapterNumber, reciterId, timestamp: Date.now() };
    setLastListened(nextState);
    try {
      localStorage.setItem(STORAGE_LAST_LISTENED, JSON.stringify(nextState));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const playChapter = useCallback(
    async (chapterNumber: number, reciterId?: number) => {
      const requestId = ++requestIdRef.current;
      const reciterToUse = reciterId
        ? AVAILABLE_RECITERS.find((r) => r.id === reciterId) || currentReciterRef.current
        : currentReciterRef.current;

      if (reciterToUse.id !== currentReciterRef.current.id) {
        setCurrentReciter(reciterToUse);
        currentReciterRef.current = reciterToUse;
      }

      setCurrentChapter(chapterNumber);
      currentChapterRef.current = chapterNumber;
      setAudioError(null);
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);

      // Pause any currently playing stream immediately while resolving the next recording
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }

      try {
        const audioUrl = await fetchChapterAudioUrl(chapterNumber, reciterToUse.id);
        if (requestId !== requestIdRef.current) return;

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
          await audioRef.current.play();
          if (requestId !== requestIdRef.current) return;
          setIsPlaying(true);
          persistLastListened(chapterNumber, reciterToUse.id);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'تعذر تشغيل التلاوة حاليًا. يرجى التحقق من الاتصال بالإنترنت أو تجربة قارئ آخر.';
        setAudioError(message);
        setIsPlaying(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [persistLastListened]
  );

  // Mount single stable HTMLAudioElement so playback continues smoothly across section switches
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if ('mediaSession' in navigator && typeof navigator.mediaSession.setPositionState === 'function') {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate || 1,
              position: Math.min(audio.currentTime, audio.duration),
            });
          } catch {
            // Ignore browsers with strict position bounds during track switch
          }
        }
      }
    };
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => {
      setIsPlaying(true);
      setAudioError(null);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };
    const handlePause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };
    const handleError = () => {
      if (audio.getAttribute('src')) {
        setIsLoading(false);
        setIsPlaying(false);
        setAudioError(
          'تعذر تحميل ملف هذه السورة من الخادم حاليًا. لم يتم استبداله بتسجيل لقارئ آخر حرصًا على صحة العزو.'
        );
      }
    };
    const handleEnded = () => {
      if (isRepeatingRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          setAudioError('تعذر إعادة تشغيل السورة تلقائيًا.');
          setIsPlaying(false);
        });
      } else {
        const ch = currentChapterRef.current;
        if (ch && ch < 114) {
          playChapter(ch + 1);
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [playChapter]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const currentChapterMeta = QURAN_SURAHS.find((s) => s.id === currentChapter);
  const currentChapterName = currentChapterMeta ? `سورة ${currentChapterMeta.name}` : '';

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      setAudioError(null);
      audioRef.current.play().catch(() => {
        setAudioError('تعذر استئناف التلاوة حاليًا.');
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (audioRef.current?.src && !audioError) {
      resume();
    } else if (currentChapter) {
      playChapter(currentChapter);
    }
  }, [isPlaying, pause, audioError, resume, currentChapter, playChapter]);

  const retryCurrentChapter = useCallback(() => {
    if (currentChapter) {
      playChapter(currentChapter);
    }
  }, [currentChapter, playChapter]);

  const clearAudioError = useCallback(() => setAudioError(null), []);

  const seek = useCallback(
    (seconds: number) => {
      if (audioRef.current && duration > 0) {
        const clamped = Math.max(0, Math.min(duration, seconds));
        audioRef.current.currentTime = clamped;
        setCurrentTime(clamped);
      }
    },
    [duration]
  );

  const seekRelative = useCallback(
    (offsetSeconds: number) => {
      if (audioRef.current && duration > 0) {
        const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + offsetSeconds));
        seek(target);
      }
    },
    [duration, seek]
  );

  const setVolume = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      setVolumeState(clamped);
      if (isMuted && clamped > 0) {
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);
  const toggleRepeat = useCallback(() => setIsRepeating((prev) => !prev), []);

  const playNextChapter = useCallback(() => {
    if (currentChapter && currentChapter < 114) {
      playChapter(currentChapter + 1);
    }
  }, [currentChapter, playChapter]);

  const playPrevChapter = useCallback(() => {
    if (currentChapter && currentChapter > 1) {
      playChapter(currentChapter - 1);
    }
  }, [currentChapter, playChapter]);

  const changeReciter = useCallback(
    (reciterId: number) => {
      const reciter = AVAILABLE_RECITERS.find((r) => r.id === reciterId);
      if (reciter) {
        setCurrentReciter(reciter);
        currentReciterRef.current = reciter;
        if (currentChapterRef.current && (isPlaying || audioRef.current?.src)) {
          playChapter(currentChapterRef.current, reciterId);
        }
      }
    },
    [isPlaying, playChapter]
  );

  const toggleFavoriteReciter = useCallback((reciterId: number) => {
    setFavoriteReciterIds((prev) => {
      const exists = prev.includes(reciterId);
      const next = exists ? prev.filter((id) => id !== reciterId) : [...prev, reciterId];
      try {
        localStorage.setItem(STORAGE_FAVORITE_RECITERS, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const setPreferredReciter = useCallback((reciterId: number) => {
    const reciter = AVAILABLE_RECITERS.find((r) => r.id === reciterId);
    if (!reciter) return;
    setPreferredReciterIdState(reciterId);
    try {
      localStorage.setItem(STORAGE_PREFERRED_RECITER, String(reciterId));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const isFavoriteReciter = useCallback(
    (reciterId: number) => favoriteReciterIds.includes(reciterId),
    [favoriteReciterIds]
  );

  const closePlayer = useCallback(() => {
    requestIdRef.current++;
    pause();
    if (audioRef.current) {
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);
    setCurrentChapter(null);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }, [pause]);

  // Background playback Media Session metadata & OS lock screen action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentChapter) {
      navigator.mediaSession.metadata = null;
      return;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentChapterName || `سورة رقم ${currentChapter}`,
        artist: currentReciter.name,
        album: 'SAKINAH | سَكِينَة — تلاوة القرآن الكريم',
        artwork: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => resume());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevChapter());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNextChapter());
      navigator.mediaSession.setActionHandler('seekbackward', (details) =>
        seekRelative(-(details.seekOffset || 10))
      );
      navigator.mediaSession.setActionHandler('seekforward', (details) =>
        seekRelative(details.seekOffset || 10)
      );
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') {
          seek(details.seekTime);
        }
      });
    } catch {
      // Some environments throw on partial MediaSession action handlers
    }
  }, [
    currentChapter,
    currentChapterName,
    currentReciter,
    resume,
    pause,
    playPrevChapter,
    playNextChapter,
    seekRelative,
    seek,
  ]);

  return (
    <QuranAudioContext.Provider
      value={{
        currentChapter,
        currentChapterName,
        currentReciter,
        preferredReciterId,
        favoriteReciterIds,
        lastListened,
        isPlaying,
        isLoading,
        audioError,
        currentTime,
        duration,
        volume,
        isMuted,
        isRepeating,
        playChapter,
        retryCurrentChapter,
        clearAudioError,
        pause,
        resume,
        togglePlay,
        seek,
        seekRelative,
        setVolume,
        toggleMute,
        toggleRepeat,
        playNextChapter,
        playPrevChapter,
        changeReciter,
        toggleFavoriteReciter,
        setPreferredReciter,
        isFavoriteReciter,
        closePlayer,
      }}
    >
      {children}
    </QuranAudioContext.Provider>
  );
};

export const useQuranAudio = () => {
  const context = useContext(QuranAudioContext);
  if (!context) {
    throw new Error('useQuranAudio must be used within a QuranAudioProvider');
  }
  return context;
};
