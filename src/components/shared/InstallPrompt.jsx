import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHOW_DELAY_MS = 30_000; // 30 seconds

/**
 * InstallPrompt — subtle bottom banner that prompts mobile users to install
 * the PWA after 30 seconds. Dismissal is persisted for 7 days.
 */
const InstallPrompt = React.memo(function InstallPrompt() {
  const { t, isRTL: isRtl } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS) {
      return;
    }

    // Listen for the browser's install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show the banner after 30 seconds if we have a deferred prompt
    const timer = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  // Don't render if no deferred prompt or not yet visible
  if (!deferredPrompt || !visible) return null;

  const handleInstall = async () => {
    setVisible(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  return (
    <div
      role="banner"
      aria-live="polite"
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-white border-t border-purple-200 shadow-lg px-4 py-3 animate-in slide-in-from-bottom duration-300"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
        <Download className="w-5 h-5 text-white" />
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-gray-800">
        {t('installPrompt.message')}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors"
        >
          {t('installPrompt.install')}
        </button>
        <button
          onClick={handleDismiss}
          aria-label={t('installPrompt.dismiss')}
          className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default InstallPrompt;
