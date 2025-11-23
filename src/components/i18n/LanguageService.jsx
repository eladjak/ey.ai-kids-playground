/**
 * LanguageService - Manages application translations and language preferences
 * 
 * This service handles:
 * - Storing user language preferences
 * - Translating UI elements
 * - Managing RTL/LTR support
 * - Synchronizing language settings across tabs
 */

// Available languages configuration
const AVAILABLE_LANGUAGES = {
  english: { 
    name: "English", 
    code: "en", 
    direction: "ltr",
    emoji: "🇺🇸" 
  },
  hebrew: { 
    name: "עברית", 
    code: "he", 
    direction: "rtl",
    emoji: "🇮🇱" 
  },
  yiddish: { 
    name: "ייִדיש", 
    code: "yi", 
    direction: "rtl",
    emoji: "🇮🇱" 
  }
};

// Default language
const DEFAULT_LANGUAGE = "english";

/**
 * All application translations
 * Organized by language key and then by translation key
 */
const translations = {
  english: {
    // Common elements
    "common.home": "Home",
    "common.createBook": "Create New Book",
    "common.library": "My Library",
    "common.community": "Community",
    "common.storyIdeas": "Story Ideas",
    "common.settings": "Settings",
    "common.logout": "Logout",
    "common.darkMode": "Dark Mode",
    "common.lightMode": "Light Mode",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.share": "Share",
    "common.loading": "Loading...",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.back": "Back",
    "common.continue": "Continue",
    "common.submit": "Submit",
    
    // Story Ideas page
    "storyIdeas.title": "Story Idea Generator",
    "storyIdeas.subtitle": "Get AI-powered story ideas based on your preferences",
    "storyIdeas.tabs.generator": "Idea Generator",
    "storyIdeas.tabs.saved": "Saved Ideas",
    "storyIdeas.tabs.storyArcs": "Story Arcs",
    "storyIdeas.generator.title": "Generate Story Idea",
    "storyIdeas.generator.subtitle": "Fill in the details to generate a personalized story idea",
    "storyIdeas.generator.childName": "Child's Name",
    "storyIdeas.generator.childName.placeholder": "Enter the main character's name",
    "storyIdeas.generator.childAge": "Age Range",
    "storyIdeas.generator.selectAge": "Select age range",
    "storyIdeas.generator.years": "years",
    "storyIdeas.generator.genre": "Genre",
    "storyIdeas.generator.selectGenre": "Select genre",
    "storyIdeas.generator.genre.adventure": "Adventure",
    "storyIdeas.generator.genre.fantasy": "Fantasy",
    "storyIdeas.generator.genre.scifi": "Science Fiction",
    "storyIdeas.generator.genre.mystery": "Mystery",
    "storyIdeas.generator.genre.educational": "Educational",
    "storyIdeas.generator.genre.fairytale": "Fairy Tale",
    "storyIdeas.generator.genre.animals": "Animals",
    "storyIdeas.generator.genre.friendship": "Friendship",
    "storyIdeas.generator.themes": "Themes",
    "storyIdeas.generator.themes.placeholder": "E.g. friendship, bravery, learning, discovery...",
    "storyIdeas.generator.characters": "Additional Characters",
    "storyIdeas.generator.characters.placeholder": "E.g. dragon, fairy, talking animals, family members...",
    "storyIdeas.generator.setting": "Setting",
    "storyIdeas.generator.setting.placeholder": "E.g. forest, space, underwater, magical kingdom...",
    "storyIdeas.generator.additionalDetails": "Additional Details (Optional)",
    "storyIdeas.generator.additionalDetails.placeholder": "Any other details you'd like to include",
    "storyIdeas.generator.button": "Generate Story Idea",
    "storyIdeas.generator.generating": "Generating...",
    "storyIdeas.result.title": "Generated Story Idea",
    "storyIdeas.result.plotPoints": "Main Plot Points",
    "storyIdeas.result.characterDevelopment": "Character Development",
    "storyIdeas.result.moralLesson": "Moral or Lesson",
    "storyIdeas.result.saveButton": "Save This Idea",
    "storyIdeas.result.createButton": "Create Book",
    "storyIdeas.result.regenerateButton": "Generate Another",
    "storyIdeas.saved.title": "Your Saved Ideas",
    "storyIdeas.saved.newIdea": "New Idea",
    "storyIdeas.saved.empty": "You haven't saved any story ideas yet",
    "storyIdeas.saved.emptyDescription": "Create your first story idea to get started with your personalized books",
    "storyIdeas.saved.createFirst": "Generate your first story idea",
    "storyIdeas.saved.loading": "Loading your saved ideas...",
    "storyIdeas.saved.useIdea": "Use This Idea",
    "storyIdeas.saved.plotPoints": "plot points",
    "storyIdeas.storyArcs.title": "Story Arc Templates",
    "storyIdeas.storyArcs.description": "Classic story structures to build your narrative",
    "storyIdeas.storyArcs.heroJourney.title": "Hero's Journey",
    "storyIdeas.storyArcs.heroJourney.description": "A classic structure where the main character goes on an adventure, faces challenges, and returns transformed.",
    "storyIdeas.storyArcs.heroJourney.step1": "Ordinary World - Character's normal life",
    "storyIdeas.storyArcs.heroJourney.step2": "Call to Adventure - Something disrupts the ordinary world",
    "storyIdeas.storyArcs.heroJourney.step3": "Meeting the Mentor - Character gets guidance",
    "storyIdeas.storyArcs.heroJourney.step4": "Crossing the Threshold - Adventure begins",
    "storyIdeas.storyArcs.heroJourney.step5": "Tests & Challenges - Character faces obstacles",
    "storyIdeas.storyArcs.heroJourney.step6": "Supreme Ordeal - The biggest challenge",
    "storyIdeas.storyArcs.heroJourney.step7": "Return with Transformation - Character goes home changed",
    "storyIdeas.storyArcs.problemSolution.title": "Problem & Solution",
    "storyIdeas.storyArcs.problemSolution.description": "A simple structure where the character encounters a problem and works to solve it.",
    "storyIdeas.storyArcs.problemSolution.step1": "Introduction - Meet the character",
    "storyIdeas.storyArcs.problemSolution.step2": "Problem Appears - Something goes wrong",
    "storyIdeas.storyArcs.problemSolution.step3": "Attempts to Solve - First tries fail",
    "storyIdeas.storyArcs.problemSolution.step4": "Discovery - Character learns what's needed",
    "storyIdeas.storyArcs.problemSolution.step5": "Resolution - Problem is solved",
    "storyIdeas.storyArcs.problemSolution.step6": "Celebration - Character celebrates success",
    "storyIdeas.storyArcs.friendshipTale.title": "Friendship Tale",
    "storyIdeas.storyArcs.friendshipTale.description": "A story about building relationships and learning to work together.",
    "storyIdeas.storyArcs.friendshipTale.step1": "Meeting - Characters meet, possibly with conflict",
    "storyIdeas.storyArcs.friendshipTale.step2": "Initial Differences - Characters don't get along",
    "storyIdeas.storyArcs.friendshipTale.step3": "Forced Cooperation - They must work together",
    "storyIdeas.storyArcs.friendshipTale.step4": "Bonding Moment - They begin to understand each other",
    "storyIdeas.storyArcs.friendshipTale.step5": "Challenge Together - They face a problem as a team",
    "storyIdeas.storyArcs.friendshipTale.step6": "New Friendship - They form a lasting bond",
    "storyIdeas.storyArcs.discoveryStory.title": "Discovery Story",
    "storyIdeas.storyArcs.discoveryStory.description": "A narrative where the main character discovers something new about the world or themselves.",
    "storyIdeas.storyArcs.discoveryStory.step1": "Curiosity - Character wonders about something",
    "storyIdeas.storyArcs.discoveryStory.step2": "First Discovery - Finding something unexpected",
    "storyIdeas.storyArcs.discoveryStory.step3": "Exploration - Learning more about the discovery",
    "storyIdeas.storyArcs.discoveryStory.step4": "Misunderstanding - Getting something wrong",
    "storyIdeas.storyArcs.discoveryStory.step5": "True Understanding - Learning the real meaning",
    "storyIdeas.storyArcs.discoveryStory.step6": "Sharing Knowledge - Telling others what was learned",
    "storyIdeas.errors.nameRequired": "Please enter a character name",
    "storyIdeas.errors.generateFailed": "Failed to generate a story idea",
    "storyIdeas.errors.saveFailed": "Failed to save the story idea",
    "storyIdeas.errors.loadingFailed": "Failed to load saved ideas",
    "storyIdeas.errors.tryAgain": "Please try again",
    "storyIdeas.errors.bookCreateFailed": "Failed to create a book from this idea. Please try again.",
    "storyIdeas.errors.loadIdeaFailed": "Failed to load this idea. Please try again.",
    "storyIdeas.success.saved": "Story idea saved successfully",
    "storyIdeas.success.generated": "New story idea generated!",
    "storyIdeas.success.bookCreated": "Book created from story idea!",
    
    // Interactive elements
    "interactive.add-element": "Add Interactive Element",
    "interactive.add-element-description": "Add special elements to make your story interactive",
    "interactive.element-type": "Element Type",
    "interactive.elements.clickable-audio": "Sound",
    "interactive.elements.pop-up-text": "Pop-up Text",
    "interactive.elements.animation": "Animation",
    "interactive.elements.background-change": "Background Change",
    "interactive.elements.interactive-choice": "Choice",
    "interactive.elements.decorative": "Decoration",
    "interactive.elements.narration": "Narration",
    "interactive.elements.wiggle": "Wiggle Effect",
    "interactive.clickable-text": "Clickable Text",
    "interactive.clickable-text-placeholder": "Enter text for the clickable element...",
    "interactive.audio-url": "Audio URL",
    "interactive.audio-url-placeholder": "https://example.com/sound.mp3",
    "interactive.audio-url-help": "Enter URL to an audio file or leave empty to use text-to-speech",
    "interactive.popup-trigger": "Popup Trigger Text",
    "interactive.popup-trigger-placeholder": "Click me to see more!",
    "interactive.popup-text": "Popup Content",
    "interactive.popup-text-placeholder": "This content will appear in a popup",
    "interactive.animation-element": "Element to Animate",
    "interactive.animation-element-placeholder": "Enter text or item to animate...",
    "interactive.animation-type": "Animation Type",
    "interactive.select-animation": "Select an animation style",
    "interactive.animation.bounce": "Bounce",
    "interactive.animation.fade": "Fade In/Out",
    "interactive.animation.slide": "Slide",
    "interactive.animation.wiggle": "Wiggle",
    "interactive.animation.grow": "Grow/Shrink",
    "interactive.animation.spin": "Spin",
    "interactive.background-trigger": "Trigger Text",
    "interactive.background-trigger-placeholder": "Text that changes the background...",
    "interactive.background-color": "Background Color",
    "interactive.choice-question": "Question or Prompt",
    "interactive.choice-question-placeholder": "What should the character do next?",
    "interactive.choice-options": "Choice Options",
    "interactive.option-1": "Option 1",
    "interactive.option-2": "Option 2",
    "interactive.decorative-element": "Decorative Element",
    "interactive.decorative-element-placeholder": "Enter decorative text or emoji...",
    "interactive.element-size": "Element Size",
    "interactive.select-size": "Select size",
    "interactive.size.small": "Small",
    "interactive.size.medium": "Medium",
    "interactive.size.large": "Large",
    "interactive.narration-text": "Narration Text",
    "interactive.narration-text-placeholder": "Text to be narrated...",
    "interactive.auto-play": "Auto-play on page load",
    "interactive.add-to-page": "Add to Page",
    "interactive.added-elements": "Added Elements",
    "interactive.no-content": "No content specified",
    "interactive.errors.content-required": "Please provide content for this element",
    "interactive.element-added": "Interactive element added successfully",
    "interactive.element-removed": "Element removed",
    
    // Visualizer
    "visualizer.story-preview": "Story Preview",
    "visualizer.no-pages": "No pages to display yet. Create some content first!",
    "visualizer.page": "Page",
    "visualizer.no-text": "No text content for this page"
  },
  hebrew: {
    // Common elements
    "common.home": "דף הבית",
    "common.createBook": "יצירת ספר חדש",
    "common.library": "הספרייה שלי",
    "common.community": "קהילה",
    "common.storyIdeas": "רעיונות לסיפורים",
    "common.settings": "הגדרות",
    "common.logout": "התנתק",
    "common.darkMode": "מצב כהה",
    "common.lightMode": "מצב בהיר",
    "common.save": "שמור",
    "common.cancel": "ביטול",
    "common.delete": "מחק",
    "common.edit": "ערוך",
    "common.view": "צפה",
    "common.share": "שתף",
    "common.loading": "טוען...",
    "common.search": "חיפוש",
    "common.filter": "סינון",
    "common.sort": "מיון",
    "common.next": "הבא",
    "common.previous": "הקודם",
    "common.back": "חזרה",
    "common.continue": "המשך",
    "common.submit": "שלח",
    
    // Story Ideas page
    "storyIdeas.title": "יוצר רעיונות לסיפורים",
    "storyIdeas.subtitle": "קבל רעיונות לסיפורים בכוח בינה מלאכותית בהתאם להעדפותיך",
    "storyIdeas.tabs.generator": "יוצר רעיונות",
    "storyIdeas.tabs.saved": "רעיונות שמורים",
    "storyIdeas.tabs.storyArcs": "מבני עלילה",
    "storyIdeas.generator.title": "צור רעיון לסיפור",
    "storyIdeas.generator.subtitle": "מלא את הפרטים כדי ליצור רעיון סיפור מותאם אישית",
    "storyIdeas.generator.childName": "שם הילד/ה",
    "storyIdeas.generator.childName.placeholder": "הכנס את שם הדמות הראשית",
    "storyIdeas.generator.childAge": "טווח גילאים",
    "storyIdeas.generator.selectAge": "בחר טווח גילאים",
    "storyIdeas.generator.years": "שנים",
    "storyIdeas.generator.genre": "ז'אנר",
    "storyIdeas.generator.selectGenre": "בחר ז'אנר",
    "storyIdeas.generator.genre.adventure": "הרפתקאות",
    "storyIdeas.generator.genre.fantasy": "פנטזיה",
    "storyIdeas.generator.genre.scifi": "מדע בדיוני",
    "storyIdeas.generator.genre.mystery": "מסתורין",
    "storyIdeas.generator.genre.educational": "חינוכי",
    "storyIdeas.generator.genre.fairytale": "אגדה",
    "storyIdeas.generator.genre.animals": "חיות",
    "storyIdeas.generator.genre.friendship": "חברות",
    "storyIdeas.generator.themes": "נושאים",
    "storyIdeas.generator.themes.placeholder": "לדוגמה: חברות, אומץ, למידה, גילוי...",
    "storyIdeas.generator.characters": "דמויות נוספות",
    "storyIdeas.generator.characters.placeholder": "לדוגמה: דרקון, פיה, חיות מדברות, בני משפחה...",
    "storyIdeas.generator.setting": "סביבה",
    "storyIdeas.generator.setting.placeholder": "לדוגמה: יער, חלל, מתחת למים, ממלכה קסומה...",
    "storyIdeas.generator.additionalDetails": "פרטים נוספים (לא חובה)",
    "storyIdeas.generator.additionalDetails.placeholder": "פרטים נוספים שתרצה לכלול",
    "storyIdeas.generator.button": "צור רעיון לסיפור",
    "storyIdeas.generator.generating": "מייצר...",
    "storyIdeas.result.title": "רעיון לסיפור שנוצר",
    "storyIdeas.result.plotPoints": "נקודות עלילה מרכזיות",
    "storyIdeas.result.characterDevelopment": "התפתחות הדמות",
    "storyIdeas.result.moralLesson": "מוסר השכל",
    "storyIdeas.result.saveButton": "שמור רעיון זה",
    "storyIdeas.result.createButton": "צור ספר",
    "storyIdeas.result.regenerateButton": "צור רעיון אחר",
    "storyIdeas.saved.title": "הרעיונות השמורים שלך",
    "storyIdeas.saved.newIdea": "רעיון חדש",
    "storyIdeas.saved.empty": "עדיין אין לך רעיונות שמורים",
    "storyIdeas.saved.emptyDescription": "צור את הרעיון הראשון שלך כדי להתחיל עם הספרים המותאמים אישית שלך",
    "storyIdeas.saved.createFirst": "צור את הרעיון הראשון שלך",
    "storyIdeas.saved.loading": "טוען את הרעיונות השמורים שלך...",
    "storyIdeas.saved.useIdea": "השתמש ברעיון זה",
    "storyIdeas.saved.plotPoints": "נקודות עלילה",
    "storyIdeas.storyArcs.title": "תבניות מבנה עלילה",
    "storyIdeas.storyArcs.description": "מבני סיפור קלאסיים לבנות עליהם את הנרטיב שלך",
    "storyIdeas.storyArcs.heroJourney.title": "מסע הגיבור",
    "storyIdeas.storyArcs.heroJourney.description": "מבנה קלאסי בו הדמות הראשית יוצאת להרפתקה, מתמודדת עם אתגרים, וחוזרת כשהיא השתנתה.",
    "storyIdeas.storyArcs.heroJourney.step1": "העולם הרגיל - החיים הרגילים של הדמות",
    "storyIdeas.storyArcs.heroJourney.step2": "הקריאה להרפתקה - משהו משבש את העולם הרגיל",
    "storyIdeas.storyArcs.heroJourney.step3": "פגישה עם המנטור - הדמות מקבלת הדרכה",
    "storyIdeas.storyArcs.heroJourney.step4": "חציית הסף - ההרפתקה מתחילה",
    "storyIdeas.storyArcs.heroJourney.step5": "מבחנים ואתגרים - הדמות מתמודדת עם מכשולים",
    "storyIdeas.storyArcs.heroJourney.step6": "המשבר הגדול - האתגר הגדול ביותר",
    "storyIdeas.storyArcs.heroJourney.step7": "חזרה עם שינוי - הדמות חוזרת הביתה כשהיא השתנתה",
    "storyIdeas.storyArcs.problemSolution.title": "בעיה ופתרון",
    "storyIdeas.storyArcs.problemSolution.description": "מבנה פשוט בו הדמות נתקלת בבעיה ועובדת כדי לפתור אותה.",
    "storyIdeas.storyArcs.problemSolution.step1": "מבוא - הכרת הדמות",
    "storyIdeas.storyArcs.problemSolution.step2": "הופעת הבעיה - משהו משתבש",
    "storyIdeas.storyArcs.problemSolution.step3": "ניסיונות לפתרון - הניסיונות הראשונים נכשלים",
    "storyIdeas.storyArcs.problemSolution.step4": "גילוי - הדמות לומדת מה נדרש",
    "storyIdeas.storyArcs.problemSolution.step5": "פתרון - הבעיה נפתרת",
    "storyIdeas.storyArcs.problemSolution.step6": "חגיגה - הדמות חוגגת את ההצלחה",
    "storyIdeas.storyArcs.friendshipTale.title": "סיפור חברות",
    "storyIdeas.storyArcs.friendshipTale.description": "סיפור על בניית יחסים ולמידה לעבוד יחד.",
    "storyIdeas.storyArcs.friendshipTale.step1": "היכרות - הדמויות נפגשות, אולי עם קונפליקט",
    "storyIdeas.storyArcs.friendshipTale.step2": "הבדלים ראשוניים - הדמויות לא מסתדרות",
    "storyIdeas.storyArcs.friendshipTale.step3": "שיתוף פעולה כפוי - הן חייבות לעבוד יחד",
    "storyIdeas.storyArcs.friendshipTale.step4": "רגע של קירבה - הן מתחילות להבין זו את זו",
    "storyIdeas.storyArcs.friendshipTale.step5": "אתגר משותף - הן מתמודדות עם בעיה כצוות",
    "storyIdeas.storyArcs.friendshipTale.step6": "חברות חדשה - הן יוצרות קשר לאורך זמן",
    "storyIdeas.storyArcs.discoveryStory.title": "סיפור גילוי",
    "storyIdeas.storyArcs.discoveryStory.description": "נרטיב בו הדמות הראשית מגלה משהו חדש על העולם או על עצמה.",
    "storyIdeas.storyArcs.discoveryStory.step1": "סקרנות - הדמות תוהה על משהו",
    "storyIdeas.storyArcs.discoveryStory.step2": "גילוי ראשון - מציאת משהו בלתי צפוי",
    "storyIdeas.storyArcs.discoveryStory.step3": "חקירה - למידה נוספת על הגילוי",
    "storyIdeas.storyArcs.discoveryStory.step4": "אי הבנה - הבנה שגויה של הנושא",
    "storyIdeas.storyArcs.discoveryStory.step5": "הבנה אמיתית - למידת המשמעות האמיתית",
    "storyIdeas.storyArcs.discoveryStory.step6": "שיתוף ידע - סיפור לאחרים על מה שנלמד",
    "storyIdeas.errors.nameRequired": "אנא הכנס שם לדמות",
    "storyIdeas.errors.generateFailed": "יצירת רעיון לסיפור נכשלה",
    "storyIdeas.errors.saveFailed": "שמירת הרעיון לסיפור נכשלה",
    "storyIdeas.errors.loadingFailed": "טעינת הרעיונות השמורים נכשלה",
    "storyIdeas.errors.tryAgain": "אנא נסה שוב",
    "storyIdeas.errors.bookCreateFailed": "יצירת ספר מרעיון זה נכשלה. אנא נסה שוב.",
    "storyIdeas.errors.loadIdeaFailed": "טעינת הרעיון נכשלה. אנא נסה שוב.",
    "storyIdeas.success.saved": "רעיון הסיפור נשמר בהצלחה",
    "storyIdeas.success.generated": "רעיון חדש לסיפור נוצר!",
    "storyIdeas.success.bookCreated": "ספר נוצר מרעיון הסיפור!",
    
    // Interactive elements
    "interactive.add-element": "הוסף אלמנט אינטראקטיבי",
    "interactive.add-element-description": "הוסף אלמנטים מיוחדים כדי להפוך את הסיפור שלך לאינטראקטיבי",
    "interactive.element-type": "סוג האלמנט",
    "interactive.elements.clickable-audio": "צליל",
    "interactive.elements.pop-up-text": "טקסט קופץ",
    "interactive.elements.animation": "אנימציה",
    "interactive.elements.background-change": "שינוי רקע",
    "interactive.elements.interactive-choice": "בחירה",
    "interactive.elements.decorative": "עיטור",
    "interactive.elements.narration": "הקראה",
    "interactive.elements.wiggle": "אפקט תנועה",
    "interactive.clickable-text": "טקסט לחיץ",
    "interactive.clickable-text-placeholder": "הזן טקסט לאלמנט הלחיץ...",
    "interactive.audio-url": "כתובת שמע",
    "interactive.audio-url-placeholder": "https://example.com/sound.mp3",
    "interactive.audio-url-help": "הזן כתובת לקובץ שמע או השאר ריק לשימוש בטקסט-לדיבור",
    "interactive.popup-trigger": "טקסט הפעלת חלון קופץ",
    "interactive.popup-trigger-placeholder": "לחץ עליי כדי לראות עוד!",
    "interactive.popup-text": "תוכן החלון הקופץ",
    "interactive.popup-text-placeholder": "תוכן זה יופיע בחלון קופץ",
    "interactive.animation-element": "אלמנט להנפשה",
    "interactive.animation-element-placeholder": "הזן טקסט או פריט להנפשה...",
    "interactive.animation-type": "סוג האנימציה",
    "interactive.select-animation": "בחר סגנון אנימציה",
    "interactive.animation.bounce": "קפיצה",
    "interactive.animation.fade": "הופעה/היעלמות",
    "interactive.animation.slide": "החלקה",
    "interactive.animation.wiggle": "נענוע",
    "interactive.animation.grow": "גדילה/הקטנה",
    "interactive.animation.spin": "סיבוב",
    "interactive.background-trigger": "טקסט הפעלה",
    "interactive.background-trigger-placeholder": "טקסט שמשנה את הרקע...",
    "interactive.background-color": "צבע רקע",
    "interactive.choice-question": "שאלה או הנחיה",
    "interactive.choice-question-placeholder": "מה הדמות צריכה לעשות כעת?",
    "interactive.choice-options": "אפשרויות בחירה",
    "interactive.option-1": "אפשרות 1",
    "interactive.option-2": "אפשרות 2",
    "interactive.decorative-element": "אלמנט עיטורי",
    "interactive.decorative-element-placeholder": "הזן טקסט עיטורי או אימוג'י...",
    "interactive.element-size": "גודל האלמנט",
    "interactive.select-size": "בחר גודל",
    "interactive.size.small": "קטן",
    "interactive.size.medium": "בינוני",
    "interactive.size.large": "גדול",
    "interactive.narration-text": "טקסט להקראה",
    "interactive.narration-text-placeholder": "טקסט להקראה...",
    "interactive.auto-play": "הפעלה אוטומטית בטעינת העמוד",
    "interactive.add-to-page": "הוסף לעמוד",
    "interactive.added-elements": "אלמנטים שנוספו",
    "interactive.no-content": "לא צוין תוכן",
    "interactive.errors.content-required": "אנא הזן תוכן לאלמנט זה",
    "interactive.element-added": "אלמנט אינטראקטיבי נוסף בהצלחה",
    "interactive.element-removed": "האלמנט הוסר",
    
    // Visualizer
    "visualizer.story-preview": "תצוגה מקדימה של הסיפור",
    "visualizer.no-pages": "אין עדיין עמודים להצגה. צור תוכן תחילה!",
    "visualizer.page": "עמוד",
    "visualizer.no-text": "אין תוכן טקסט לעמוד זה"
  },
  yiddish: {
    // Add Yiddish translations here
    "common.home": "היימבלאַט",
    "common.createBook": "שאַפֿן אַ נײַ בוך",
    "common.library": "מײַן ביבליאָטעק",
    "common.community": "קהילה",
    "common.storyIdeas": "געשיכטע געדאַנקען",
    "common.settings": "אײַנשטעלונגען",
    "common.logout": "אַרויסלאָגירן",
    "common.darkMode": "טונקל מאָדע",
    "common.lightMode": "ליכט מאָדע"
  }
};

/**
 * Gets the current application language
 * @returns {string} - Current language key
 */
const getCurrentLanguage = () => {
  const storedLanguage = localStorage.getItem("appLanguage");
  return storedLanguage && AVAILABLE_LANGUAGES[storedLanguage] 
    ? storedLanguage 
    : DEFAULT_LANGUAGE;
};

/**
 * Sets the application language
 * @param {string} language - Language key to set
 */
const setLanguage = (language) => {
  if (!AVAILABLE_LANGUAGES[language]) {
    console.error(`Invalid language: ${language}`);
    return;
  }
  
  localStorage.setItem("appLanguage", language);
  applyLanguageSettings(language);
  
  // Dispatch event for other components to react to language change
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
};

/**
 * Applies language settings to the document
 * @param {string} language - Language key to apply
 */
const applyLanguageSettings = (language) => {
  const languageInfo = AVAILABLE_LANGUAGES[language];
  if (!languageInfo) return;
  
  // Apply RTL/LTR based on language
  document.documentElement.dir = languageInfo.direction;
  document.documentElement.lang = languageInfo.code;
  
  // Add/remove RTL class from body
  if (languageInfo.direction === "rtl") {
    document.body.classList.add("rtl");
    document.body.classList.remove("ltr");
  } else {
    document.body.classList.add("ltr");
    document.body.classList.remove("rtl");
  }
};

/**
 * Translates a key to the current language
 * @param {string} key - Translation key
 * @param {Object} params - Optional parameters for interpolation
 * @returns {string} - Translated text
 */
const translate = (key, params = {}) => {
  const currentLanguage = getCurrentLanguage();
  
  // Get translation from current language, fallback to English, then key
  const translation = translations[currentLanguage]?.[key] || 
                      translations.english[key] || 
                      key;
  
  // Interpolate parameters if any
  return interpolateParams(translation, params);
};

/**
 * Interpolates parameters into a translation string
 * @param {string} text - Text with placeholders
 * @param {Object} params - Parameters to interpolate
 * @returns {string} - Text with interpolated parameters
 */
const interpolateParams = (text, params) => {
  return Object.keys(params).reduce((result, key) => {
    return result.replace(new RegExp(`{${key}}`, 'g'), params[key]);
  }, text);
};

/**
 * Checks if the current language is RTL
 * @returns {boolean} - True if current language is RTL
 */
const isRTL = () => {
  const currentLanguage = getCurrentLanguage();
  return AVAILABLE_LANGUAGES[currentLanguage]?.direction === "rtl";
};

/**
 * Gets all available languages
 * @returns {Object} - Available languages
 */
const getAvailableLanguages = () => {
  return AVAILABLE_LANGUAGES;
};

/**
 * Initialize language service
 * Should be called on app start
 */
const initialize = () => {
  const storedLanguage = localStorage.getItem("appLanguage");
  
  if (storedLanguage && AVAILABLE_LANGUAGES[storedLanguage]) {
    applyLanguageSettings(storedLanguage);
  } else {
    // Try to detect user browser language
    const browserLang = navigator.language.split('-')[0];
    
    // Map browser language code to our language keys
    const langMap = {
      'en': 'english',
      'he': 'hebrew',
      'yi': 'yiddish'
    };
    
    const detectedLang = langMap[browserLang];
    
    if (detectedLang && AVAILABLE_LANGUAGES[detectedLang]) {
      setLanguage(detectedLang);
    } else {
      setLanguage(DEFAULT_LANGUAGE);
    }
  }
  
  // Set up storage event listener to sync language across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === "appLanguage" && AVAILABLE_LANGUAGES[e.newValue]) {
      applyLanguageSettings(e.newValue);
      // Dispatch language change event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: e.newValue } }));
    }
  });
};

// Export the service methods
export const LanguageService = {
  getCurrentLanguage,
  setLanguage,
  translate,
  isRTL,
  getAvailableLanguages,
  initialize
};

export default LanguageService;