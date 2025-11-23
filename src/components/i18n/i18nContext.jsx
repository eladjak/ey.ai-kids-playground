import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from "@/entities/User";

// Translations data
import hebrewTranslations from './locales/he';
import englishTranslations from './locales/en';
import yiddishTranslations from './locales/yi';

// Create a context for i18n
const I18nContext = createContext();

// Define available languages
const LANGUAGES = {
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

  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      try {
        const user = await User.me();
        
        // Check if user has a language preference saved
        if (user.language && LANGUAGES[user.language]) {
          setLanguage(user.language);
          setTranslations(LANGUAGES[user.language].translations);
          setDirection(LANGUAGES[user.language].direction);
          // Update document direction
          document.documentElement.dir = LANGUAGES[user.language].direction;
          document.documentElement.lang = LANGUAGES[user.language].code;
        }
      } catch (error) {
        console.error("Error loading user language preference:", error);
      } finally {
        setLoading(false);
      }
    };

    // Load from localStorage as fallback
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setLanguage(savedLanguage);
      setTranslations(LANGUAGES[savedLanguage].translations);
      setDirection(LANGUAGES[savedLanguage].direction);
      // Update document direction
      document.documentElement.dir = LANGUAGES[savedLanguage].direction;
      document.documentElement.lang = LANGUAGES[savedLanguage].code;
      setLoading(false);
    } else {
      loadUserLanguagePreference();
    }
  }, []);

  // Helper function to change language
  const changeLanguage = async (newLanguage) => {
    if (LANGUAGES[newLanguage]) {
      setLanguage(newLanguage);
      setTranslations(LANGUAGES[newLanguage].translations);
      setDirection(LANGUAGES[newLanguage].direction);
      
      // Update document direction and lang attributes
      document.documentElement.dir = LANGUAGES[newLanguage].direction;
      document.documentElement.lang = LANGUAGES[newLanguage].code;

      // Save to localStorage
      localStorage.setItem('language', newLanguage);
      
      // Save to user preferences
      try {
        await User.updateMyUserData({
          language: newLanguage
        });
      } catch (error) {
        console.error("Error saving language preference:", error);
      }
    }
  };

  // Translate function - returns the translation or the key itself if not found
  const t = (key) => {
    if (!key) return '';
    
    // Split the key by dots to handle nested translations
    const keys = key.split('.');
    let current = translations;
    
    for (const k of keys) {
      if (current && current[k]) {
        current = current[k];
      } else {
        // Return the key if translation is not found
        return key;
      }
    }
    
    return current;
  };

  // The context value
  const contextValue = {
    language,
    direction,
    changeLanguage,
    t,
    loading,
    availableLanguages: LANGUAGES
  };

  return (
    <I18nContext.Provider value={contextValue}>
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