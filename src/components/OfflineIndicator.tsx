import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-slate-900/95 border border-amber-500/40 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md whitespace-nowrap">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode · Playable anywhere</span>
    </div>
  );
};
