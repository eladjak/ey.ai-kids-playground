import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from "@/entities/User";

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

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('english');
  const [translations, setTranslations] = useState(LANGUAGES.english.translations);
  const [direction, setDirection] = useState('ltr');
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
        }

        // Then check user settings from backend
        const user = await User.me();
        if (user && user.language && LANGUAGES[user.language]) {
          setLanguage(user.language);
          setTranslations(LANGUAGES[user.language].translations);
          setDirection(LANGUAGES[user.language].direction);
          applyLanguageSettings(user.language);
          
          // Update localStorage to match user settings
          localStorage.setItem('language', user.language);
        }
      } catch (error) {
        console.error("Error loading language preferences:", error);
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
      console.error("Error saving language preference:", error);
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