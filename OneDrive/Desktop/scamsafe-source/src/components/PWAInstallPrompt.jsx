import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Tablet } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 3 seconds or after user interaction
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (parseInt(dismissed) > sevenDaysAgo) {
        setShowPrompt(false);
      }
    }
  }, []);

  // Don't show if already installed or no prompt available
  if (isInstalled || !deferredPrompt || !showPrompt) {
    return null;
  }

  // Detect device type
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl shadow-2xl p-4 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {isIOS ? (
              <Smartphone size={24} />
            ) : isAndroid ? (
              <Smartphone size={24} />
            ) : (
              <Tablet size={24} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Install ScamSafe App</h3>
            <p className="text-xs opacity-90 mb-3">
              {isIOS 
                ? "Add ScamSafe to your home screen for quick access"
                : "Install ScamSafe for offline access and better experience"
              }
            </p>

            {/* Install button */}
            <button
              onClick={handleInstall}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              {isIOS ? "Add to Home" : "Install App"}
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Free</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>No Ads</span>
          </div>
        </div>
      </div>
    </div>
  );
}
