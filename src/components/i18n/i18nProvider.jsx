import React, { createContext, useState, useEffect, useLayoutEffect, useContext } from 'react';
import { User } from "@/entities/User";
import { readDisplayLanguageFromEnvironment, detectLanguageFromBrowser, DEFAULT_LANGUAGE } from "@/utils/languageResolution";

// Import translations
import hebrewTranslations from './locales/he';
import englishTranslations from './locales/en';
import yiddishTranslations from './locales/yi';

// Create context
export const I18nContext = createContext();

// Available languages with their details
export const LANGUAGES = {
  english: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    translations: englishTranslations
  },
  hebrew: {
    code: 'he',
    name: 'עברית',
    direction: 'rtl',
    translations: hebrewTranslations
  },
  yiddish: {
    code: 'yi',
    name: 'ייִדיש',
    direction: 'rtl',
    translations: yiddishTranslations
  }
};

// Read language from localStorage synchronously so the very first render
// already uses the correct language/direction, preventing a flash of LTR
// content for Hebrew/Yiddish users.
function getInitialLanguage() {
  // This used to read localStorage and then return 'english', while the async
  // effect below detected the browser language and could return 'hebrew' for
  // the same visitor. Two answers to one question, in one file: the layout
  // effect painted LTR from this value and the async effect corrected it a
  // moment later — the exact flash the comment above says this prevents.
  // Resolving through the shared helper means the first paint and the
  // correction agree, so for a Hebrew browser there is nothing to correct.
  return readDisplayLanguageFromEnvironment();
}

export const I18nProvider = ({ children }) => {
  const _initialLang = getInitialLanguage();
  const [language, setLanguage] = useState(_initialLang);
  const [translations, setTranslations] = useState(LANGUAGES[_initialLang].translations);
  const [direction, setDirection] = useState(LANGUAGES[_initialLang].direction);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Apply language settings to document
  const applyLanguageSettings = (lang) => {
    const langConfig = LANGUAGES[lang];
    if (!langConfig) return;

    document.documentElement.dir = langConfig.direction;
    document.documentElement.lang = langConfig.code;

    // Force RTL/LTR on body as well for deeper styling control
    document.body.setAttribute('dir', langConfig.direction);
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(langConfig.direction);
  };

  // Apply saved language to the document synchronously before first paint,
  // so Hebrew/Yiddish users don't see a flash of LTR layout.
  useLayoutEffect(() => {
    applyLanguageSettings(_initialLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect browser language for first-time visitors (no saved preference)
  // Delegates so this and getInitialLanguage above cannot drift apart again.
  const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage || '';
    return detectLanguageFromBrowser(browserLang) || DEFAULT_LANGUAGE;
  };

  // Load user language preference
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        // Try to load from localStorage first for immediate feedback
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && LANGUAGES[savedLanguage]) {
          setLanguage(savedLanguage);
          setTranslations(LANGUAGES[savedLanguage].translations);
          setDirection(LANGUAGES[savedLanguage].direction);
          applyLanguageSettings(savedLanguage);
        } else {
          // First visit: auto-detect from browser
          const detected = detectBrowserLanguage();
          setLanguage(detected);
          setTranslations(LANGUAGES[detected].translations);
          setDirection(LANGUAGES[detected].direction);
          applyLanguageSettings(detected);
          // Do NOT save to localStorage yet — let the user confirm via settings
        }

        // Then check user settings from backend
        const user = await User.me();
        // Support both field names: 'language' (canonical) and 'preferred_language' (onboarding legacy)
        const userLang = user?.language || user?.preferred_language;
        if (user && userLang && LANGUAGES[userLang]) {
          setLanguage(userLang);
          setTranslations(LANGUAGES[userLang].translations);
          setDirection(LANGUAGES[userLang].direction);
          applyLanguageSettings(userLang);

          // Update localStorage to match user settings
          localStorage.setItem('language', userLang);
        }
      } catch (error) {
        // silently handled
      } finally {
        setLoading(false);
        setIsReady(true);
      }
    };

    loadLanguagePreference();
  }, []);

  // Change language function
  const changeLanguage = async (newLanguage) => {
    if (!LANGUAGES[newLanguage]) return;

    setLanguage(newLanguage);
    setTranslations(LANGUAGES[newLanguage].translations);
    setDirection(LANGUAGES[newLanguage].direction);
    applyLanguageSettings(newLanguage);
    
    // Save to localStorage for immediate access on reload
    localStorage.setItem('language', newLanguage);
    
    // Save to user profile
    try {
      await User.updateMyUserData({ language: newLanguage });
    } catch (error) {
      // silently handled
    }
  };

  // Translation function
  const t = (key, replacements = {}) => {
    if (!key) return '';
    
    // Split key by dots to handle nested translations
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    // Handle replacements like {{variable}}
    if (typeof value === 'string' && Object.keys(replacements).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, match) => {
        return replacements[match] !== undefined ? replacements[match] : `{{${match}}}`;
      });
    }
    
    return value;
  };

  return (
    <I18nContext.Provider value={{
      language,
      direction,
      isRTL: direction === 'rtl',
      changeLanguage,
      t,
      loading,
      isReady,
      languages: LANGUAGES
    }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use the i18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};