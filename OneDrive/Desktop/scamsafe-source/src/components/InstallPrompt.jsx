import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, MoreVertical } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState('android'); // 'ios' | 'android' | 'android-manual'
  const [isInstalled, setIsInstalled] = useState(false);
  const promptFired = useRef(false);

  useEffect(() => {
    // Check if already installed (standalone or fullscreen mode)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (24h cooldown)
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect platform
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isiOS) {
      setPlatform('ios');
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      promptFired.current = true;
      setDeferredPrompt(e);
      setPlatform('android');
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const installedHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Fallback: if beforeinstallprompt didn't fire after 5s on mobile, show manual instructions
    const fallbackTimer = setTimeout(() => {
      if (!promptFired.current && /Android|webOS|Mobile/i.test(ua)) {
        setPlatform('android-manual');
        setShowBanner(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3 safe-bottom"
      >
        <div className="max-w-md mx-auto rounded-2xl border border-dark-border bg-dark-card/95 backdrop-blur-xl shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-red to-accent-purple flex items-center justify-center flex-shrink-0">
              <Download size={22} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Install ScamSafe</h3>
                <button onClick={handleDismiss} className="text-gray-500 hover:text-gray-300 p-1 -mr-1">
                  <X size={16} />
                </button>
              </div>

              {platform === 'ios' && (
                <div className="mt-1">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tap <Share size={12} className="inline text-blue-400 -mt-0.5" /> then{' '}
                    <span className="text-white font-medium">"Add to Home Screen"</span>{' '}
                    <Plus size={12} className="inline text-gray-300 -mt-0.5" /> to install
                  </p>
                </div>
              )}

              {platform === 'android' && (
                <div className="mt-1">
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">
                    Install for quick access — works offline, no app store needed
                  </p>
                  <button
                    onClick={handleInstall}
                    className="w-full py-2 rounded-lg bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} />
                    Install App
                  </button>
                </div>
              )}

              {platform === 'android-manual' && (
                <div className="mt-1">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Tap <MoreVertical size={12} className="inline text-gray-300 -mt-0.5" /> menu then{' '}
                    <span className="text-white font-medium">"Add to Home screen"</span> or{' '}
                    <span className="text-white font-medium">"Install app"</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
