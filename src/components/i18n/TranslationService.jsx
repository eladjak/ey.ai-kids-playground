// Translation Service - Global service for translations

// Available languages information
const languages = {
  english: { name: "English", code: "en", direction: "ltr" },
  hebrew: { name: "עברית", code: "he", direction: "rtl" },
  yiddish: { name: "ייִדיש", code: "yi", direction: "rtl" }
};

// Translations for all supported languages
const translations = {
  english: {
    // Navigation
    "common.home": "Home",
    "common.createBook": "Create New Book",
    "common.library": "My Library",
    "common.community": "Community",
    "common.settings": "Settings",
    "common.logout": "Logout",
    "common.darkMode": "Dark Mode",
    "common.lightMode": "Light Mode",
    "common.saving": "Saving...",
    
    // Home page
    "home.title": "Create Magical Personalized Children's Books",
    "home.subtitle": "Spark your child's imagination with custom stories featuring them as the main character",
    "home.createBookBtn": "Create a Book",
    "home.viewLibraryBtn": "View Library",
    "home.features.title": "Features",
    "home.features.subtitle": "Everything you need to create unique stories",
    "home.features.personalized.title": "Personalized Stories",
    "home.features.personalized.description": "Create stories featuring your child's name, interests, and adventures",
    "home.features.genres.title": "Multiple Genres",
    "home.features.genres.description": "Choose from adventures, fairy tales, educational stories, and more",
    "home.features.illustrations.title": "Beautiful Illustrations",
    "home.features.illustrations.description": "Select from various art styles to bring your stories to life",
    "home.features.ageAppropriate.title": "Age-Appropriate Content",
    "home.features.ageAppropriate.description": "Content tailored to different age groups",
    "home.features.perfectGifts.title": "Perfect Gifts",
    "home.features.perfectGifts.description": "Create meaningful gifts for special occasions",
    "home.features.multilingual.title": "Multilingual Support",
    "home.features.multilingual.description": "Create stories in multiple languages",
    "home.callToAction.title": "Ready to create a magical story?",
    "home.callToAction.description": "Start your journey today and create a personalized book",
    "home.callToAction.button": "Create Your First Book",
    
    // Settings page
    "settings.title": "Settings",
    "settings.subtitle": "Customize your app experience and preferences",
    "settings.appearance.title": "Appearance",
    "settings.appearance.description": "Customize how the application looks",
    "settings.appearance.darkMode": "Dark Mode",
    "settings.appearance.darkModeDescription": "Switch to dark theme",
    "settings.appearance.textDensity": "Text Density",
    "settings.appearance.densityOptions.low": "Low - More spacing, larger text",
    "settings.appearance.densityOptions.medium": "Medium - Balanced (recommended)",
    "settings.appearance.densityOptions.high": "High - Compact layout",
    "settings.language.title": "Language & Region",
    "settings.language.description": "Set your preferred language and regional settings",
    "settings.language.appLanguage": "Application Language",
    "settings.language.appLanguageDescription": "Changing language will translate the interface",
    "settings.language.defaultStoryLanguage": "Default Story Language",
    "settings.notifications.title": "Notifications",
    "settings.notifications.description": "Manage how and when you receive notifications",
    "settings.notifications.enableNotifications": "Enable Notifications",
    "settings.notifications.enableDescription": "Receive notifications about your books",
    "settings.notifications.bookCompletion": "Book Completion",
    "settings.notifications.bookCompletionDescription": "Notify when a book is ready",
    "settings.notifications.newFeatures": "New Features",
    "settings.notifications.newFeaturesDescription": "Notify about app updates",
    "settings.accessibility.title": "Accessibility",
    "settings.accessibility.description": "Adjust settings to make the app more accessible",
    "settings.accessibility.audioNarration": "Audio Narration",
    "settings.accessibility.audioDescription": "Enable automatic narration of books",
    "settings.accessibility.fontSize": "Font Size",
    "settings.accessibility.fontSizes.small": "Small",
    "settings.accessibility.fontSizes.medium": "Medium",
    "settings.accessibility.fontSizes.large": "Large",
    "settings.accessibility.fontSizes.xlarge": "Extra Large",
    "settings.accessibility.audioSpeed": "Audio Speed",
    "settings.accessibility.audioSpeeds.slow": "Slow (0.75x)",
    "settings.accessibility.audioSpeeds.normal": "Normal (1x)",
    "settings.accessibility.audioSpeeds.fast": "Fast (1.25x)",
    "settings.accessibility.audioSpeeds.veryFast": "Very Fast (1.5x)",
    "settings.saveSettings": "Save Settings",
    "settings.saved": "Settings saved successfully!",
    
    // Library page
    "library.title": "My Library",
    "library.subtitle": "View and manage your personalized storybooks",
    "library.createNewBook": "Create New Book",
    "library.searchPlaceholder": "Search by title or child's name...",
    "library.filters": "Filters",
    "library.resetFilters": "Reset filters",
    
    // Create Book page
    "createBook.title": "Create a New Book",
    "createBook.subtitle": "Follow the steps below to create a personalized book for your child",
    "createBook.childInfo": "Child Info",
    "createBook.storyDetails": "Story Details",
    "createBook.visualStyle": "Visual Style",
    "createBook.language": "Language",
    "createBook.preview": "Preview"
  },
  
  hebrew: {
    // Navigation
    "common.home": "דף הבית",
    "common.createBook": "יצירת ספר חדש",
    "common.library": "הספרייה שלי",
    "common.community": "קהילה",
    "common.settings": "הגדרות",
    "common.logout": "התנתק",
    "common.darkMode": "מצב כהה",
    "common.lightMode": "מצב בהיר",
    "common.saving": "שומר...",
    
    // Home page
    "home.title": "יצירת ספרי ילדים קסומים מותאמים אישית",
    "home.subtitle": "עוררו את הדמיון של ילדיכם עם סיפורים מותאמים אישית",
    "home.createBookBtn": "צור ספר חדש",
    "home.viewLibraryBtn": "צפה בספרייה",
    "home.features.title": "תכונות",
    "home.features.subtitle": "כל מה שצריך ליצירת סיפורים ייחודיים",
    "home.features.personalized.title": "סיפורים מותאמים אישית",
    "home.features.personalized.description": "צרו סיפורים המציגים את שם הילד שלכם והעניין שלו",
    "home.features.genres.title": "ז'אנרים מרובים",
    "home.features.genres.description": "בחרו מבין הרפתקאות, אגדות, סיפורים חינוכיים ועוד",
    "home.features.illustrations.title": "איורים יפים",
    "home.features.illustrations.description": "בחרו מבין סגנונות אמנות שונים להפיח חיים בסיפורים",
    "home.features.ageAppropriate.title": "תוכן מותאם גיל",
    "home.features.ageAppropriate.description": "תוכן מותאם לקבוצות גיל שונות עם מורכבות מתאימה",
    "home.features.perfectGifts.title": "מתנות מושלמות",
    "home.features.perfectGifts.description": "צרו מתנות משמעותיות לימי הולדת, חגים או אירועים מיוחדים",
    "home.features.multilingual.title": "תמיכה רב-לשונית",
    "home.features.multilingual.description": "צרו סיפורים באנגלית, עברית ויידיש עם תמיכה מלאה בשפה",
    "home.callToAction.title": "מוכנים ליצור סיפור קסום?",
    "home.callToAction.description": "התחילו את המסע היום וצרו ספר מותאם אישית",
    "home.callToAction.button": "צור את הספר הראשון שלך",
    
    // Settings page
    "settings.title": "הגדרות",
    "settings.subtitle": "התאם את חוויית האפליקציה וההעדפות שלך",
    "settings.appearance.title": "מראה",
    "settings.appearance.description": "התאם כיצד האפליקציה נראית",
    "settings.appearance.darkMode": "מצב כהה",
    "settings.appearance.darkModeDescription": "עבור לערכת נושא כהה",
    "settings.appearance.textDensity": "צפיפות טקסט",
    "settings.appearance.densityOptions.low": "נמוכה - יותר מרווח, טקסט גדול יותר",
    "settings.appearance.densityOptions.medium": "בינוני - מאוזן (מומלץ)",
    "settings.appearance.densityOptions.high": "גבוה - פריסה קומפקטית",
    "settings.language.title": "שפה ואזור",
    "settings.language.description": "הגדר את השפה המועדפת עליך והגדרות אזוריות",
    "settings.language.appLanguage": "שפת האפליקציה",
    "settings.language.appLanguageDescription": "שינוי שפה יתרגם את הממשק",
    "settings.language.defaultStoryLanguage": "שפת סיפור ברירת מחדל",
    "settings.notifications.title": "התראות",
    "settings.notifications.description": "נהל כיצד ומתי אתה מקבל התראות",
    "settings.notifications.enableNotifications": "אפשר התראות",
    "settings.notifications.enableDescription": "קבל התראות על הספרים שלך",
    "settings.notifications.bookCompletion": "השלמת ספר",
    "settings.notifications.bookCompletionDescription": "הודע כאשר ספר מוכן",
    "settings.notifications.newFeatures": "תכונות חדשות",
    "settings.notifications.newFeaturesDescription": "הודע על עדכוני אפליקציה",
    "settings.accessibility.title": "נגישות",
    "settings.accessibility.description": "התאם הגדרות כדי להפוך את האפליקציה לנגישה יותר",
    "settings.accessibility.audioNarration": "הקראה קולית",
    "settings.accessibility.audioDescription": "אפשר הקראה אוטומטית של ספרים",
    "settings.accessibility.fontSize": "גודל גופן",
    "settings.accessibility.fontSizes.small": "קטן",
    "settings.accessibility.fontSizes.medium": "בינוני",
    "settings.accessibility.fontSizes.large": "גדול",
    "settings.accessibility.fontSizes.xlarge": "גדול במיוחד",
    "settings.accessibility.audioSpeed": "מהירות שמע",
    "settings.accessibility.audioSpeeds.slow": "איטי (0.75x)",
    "settings.accessibility.audioSpeeds.normal": "רגיל (1x)",
    "settings.accessibility.audioSpeeds.fast": "מהיר (1.25x)",
    "settings.accessibility.audioSpeeds.veryFast": "מהיר מאוד (1.5x)",
    "settings.saveSettings": "שמור הגדרות",
    "settings.saved": "ההגדרות נשמרו בהצלחה!",
    
    // Library page
    "library.title": "הספרייה שלי",
    "library.subtitle": "צפה ונהל את ספרי הסיפורים המותאמים אישית שלך",
    "library.createNewBook": "צור ספר חדש",
    "library.searchPlaceholder": "חפש לפי כותרת או שם הילד...",
    "library.filters": "סינונים",
    "library.resetFilters": "איפוס סינונים",
    
    // Create Book page
    "createBook.title": "יצירת ספר חדש",
    "createBook.subtitle": "עקוב אחר השלבים למטה כדי ליצור ספר מותאם אישית לילד שלך",
    "createBook.childInfo": "פרטי הילד",
    "createBook.storyDetails": "פרטי הסיפור",
    "createBook.visualStyle": "סגנון חזותי",
    "createBook.language": "שפה",
    "createBook.preview": "תצוגה מקדימה"
  },
  
  yiddish: {
    // Add Yiddish translations as needed
    "common.home": "היימבלאַט",
    "common.createBook": "שאַפֿן אַ נײַ בוך",
    "common.library": "מײַן ביבליאָטעק",
    "common.community": "קהילה",
    "common.settings": "אײַנשטעלונגען",
    "common.logout": "אַרויסלאָגירן",
    "common.darkMode": "טונקל מאָדע",
    "common.lightMode": "ליכט מאָדע"
  }
};

// Get the current language (from localStorage or user preference)
function getCurrentLanguage() {
  return localStorage.getItem("appLanguage") || "english";
}

// Change the language
function changeLanguage(language) {
  if (languages[language]) {
    // Save language to localStorage
    localStorage.setItem("appLanguage", language);
    
    // Apply RTL/LTR based on language
    document.documentElement.dir = languages[language].direction;
    document.documentElement.lang = languages[language].code;
    
    // Add/remove RTL class from body
    if (languages[language].direction === "rtl") {
      document.body.classList.add("rtl");
      document.body.classList.remove("ltr");
    } else {
      document.body.classList.add("ltr");
      document.body.classList.remove("rtl");
    }
    
    return true;
  }
  return false;
}

// Get the translation for a key
function translate(key, defaultValue) {
  const currentLanguage = getCurrentLanguage();
  const fallbackLanguage = "english";
  
  // Try to get translation in current language
  const translation = translations[currentLanguage]?.[key];
  
  if (translation) {
    return translation;
  }
  
  // If not found, try fallback language
  const fallbackTranslation = translations[fallbackLanguage]?.[key];
  
  if (fallbackTranslation) {
    return fallbackTranslation;
  }
  
  // If still not found, return the provided default or the key itself
  return defaultValue || key;
}

// Initialize the translation service (call this once at app start)
function initialize() {
  // Load language preference
  const currentLanguage = getCurrentLanguage();
  
  // Apply language settings
  changeLanguage(currentLanguage);
  
  console.log(`Translation service initialized with language: ${currentLanguage}`);
}

// Initialize when the file is imported
initialize();

// Export functions
export { getCurrentLanguage, changeLanguage, translate, languages };