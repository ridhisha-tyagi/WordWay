import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running inside standalone PWA mode, show clean installed badge
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Download and install app on mobile device"
        className={`group relative inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap shrink-0 ${
          compact
            ? 'px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            : 'px-4 py-2 text-sm rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm'
        }`}
      >
        <Download className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} mr-1.5`} />
        <span>{compact ? 'Install' : 'Install Free App'}</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-white">Install WordWay Free</h3>
                <p className="text-xs text-indigo-400 font-medium">100% Free · Play Offline Anywhere</p>
              </div>
            </div>

            <div className="space-y-3.5 my-4 text-sm">
              {isIOS ? (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <Share className="w-4 h-4" />
                    <span>For iPhone & iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                    <li>Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 text-blue-400" /> at bottom of Safari</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                    <li>Tap <strong>Add</strong> in the top right corner</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>For Android & Chrome:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                    <li>Tap the browser menu <strong>(three dots ⋮)</strong> in Chrome or your browser</li>
                    <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
                    <li>The app will install directly to your app launcher!</li>
                  </ol>
                </div>
              )}

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Zero storage footprint, instant updates, and works with no wifi!</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition"
            >
              Got it, let's play!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
