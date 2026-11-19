import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-950/90 border-b border-amber-500/40 text-amber-100 px-4 py-2 text-center text-xs sm:text-sm font-['Amiri',serif]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
        <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
        <span>
          أنت تتصفح الآن دون اتصال بالإنترنت: الأذكار والأدعية والمسبحة وبوصلة القبلة والبيانات المحفوظة متاحة، بينما تتطلب التلاوات الصوتية ومواقيت الصلاة الحية والبحث النصي اتصالاً بالشبكة.
        </span>
      </div>
    </div>
  );
};
