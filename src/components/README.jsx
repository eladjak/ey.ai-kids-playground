# EY.AI Kids Playground - Component Documentation

## Overview
EY.AI Kids Playground is an interactive platform for creating personalized children's books. This directory contains all the reusable components that make up the application.

## Key Component Directories

### /library
Components related to the book library and book browsing experience.
- BookCard - Displays book cover and metadata in grid or list view
- EmptyState - Shows friendly messaging when no books are found

### /createBook
Components for the book creation wizard.
- ChildInfoStep - Collects information about the child
- StoryDetailsStep - Collects story genre, tone, and moral
- StoryStyleStep - Allows selection of art style
- ArtStyleOption - Visual display of different art styles
- LanguageStep - Language selection for the book
- BookPreview - Shows preview of book settings before generation

### /bookCreation
Components for the book writing and illustration process.
- GenerationSteps - Shows progress of AI generation
- PageStyler - Customize page layout and styles
- BookCoverPreview - Preview of the generated book cover
- RhymeOptions - Controls for rhyming text
- InteractiveElementsPanel - Add interactive elements to the story
- StoryVisualizer - Visual layout of the story structure

### /storyIdeas
Components for generating and managing story ideas.
- IdeaGenerator - Form for generating new story ideas
- IdeaResult - Display generated story idea
- SavedIdeas - Browse and manage saved story ideas
- StoryArcs - Templates for classic story structures

### /characterDevelopment
Components for creating and developing characters.
- CharacterProfile - Create detailed character profiles
- CharacterRelationshipMap - Visualize relationships between characters

### /interactive
Components for adding interactive elements to stories.
- InteractiveElements - Add clickable elements, quizzes, and decision points

### /community
Components for community interaction.
- CommunityPost - Display shared books from the community
- FeaturedStory - Highlighted community stories
- CommentItem - Comments on community posts
- ShareBookModal - UI for sharing books with the community

### /collaborate
Components for collaborative book creation.
- CollaborativeEditor - Real-time collaborative editing
- CollaborationInviteForm - Invite others to collaborate
- CollaboratorsList - Manage book collaborators
- PageComments - Comment on specific pages
- RevisionHistory - Track changes to the book

### /feedback
Components for gathering and displaying feedback.
- FeedbackForm - Submit feedback on books
- FeedbackList - Display received feedback
- FeedbackStats - Analytics on received feedback

### /i18n
Components and services for internationalization.
- i18nContext - React context for language settings
- i18nProvider - Provider component for language support
- TranslationService - Service for managing translations
- LanguageService - Service for detecting and setting languages

## Multilingual Support
The application supports multiple languages including:
- English
- Hebrew (with RTL support)
- Yiddish (with RTL support)

## Interactive Features
- Character customization
- Story structure templates
- Interactive elements (clickable items, quizzes, decisions)
- Audio narration
- Collaborative editing

## Visual Elements
- Custom illustrations
- Multiple art styles
- Visual story structure tools
- Character relationship maps
- Page layout customization

---

# תיעוד רכיבים - מגרש המשחקים של EY.AI Kids

## סקירה כללית
מגרש המשחקים של EY.AI Kids הוא פלטפורמה אינטראקטיבית ליצירת ספרי ילדים מותאמים אישית. ספרייה זו מכילה את כל הרכיבים השימושיים שמרכיבים את האפליקציה.

## ספריות רכיבים עיקריות

### /library
רכיבים הקשורים לספריית הספרים וחוויית העיון בספרים.
- BookCard - מציג כריכת ספר ומטא-דאטה בתצוגת רשת או רשימה
- EmptyState - מציג הודעות ידידותיות כאשר לא נמצאו ספרים

### /createBook
רכיבים לאשף יצירת הספר.
- ChildInfoStep - אוסף מידע על הילד
- StoryDetailsStep - אוסף ז'אנר סיפור, טון ומוסר השכל
- StoryStyleStep - מאפשר בחירת סגנון אמנותי
- ArtStyleOption - תצוגה חזותית של סגנונות אמנות שונים
- LanguageStep - בחירת שפה לספר
- BookPreview - מציג תצוגה מקדימה של הגדרות הספר לפני היצירה

### /bookCreation
רכיבים לתהליך כתיבת הספר והאיור.
- GenerationSteps - מציג את התקדמות היצירה באמצעות AI
- PageStyler - התאמה אישית של פריסת עמוד וסגנונות
- BookCoverPreview - תצוגה מקדימה של כריכת הספר שנוצרה
- RhymeOptions - בקרות לטקסט מחורז
- InteractiveElementsPanel - הוספת אלמנטים אינטראקטיביים לסיפור
- StoryVisualizer - פריסה חזותית של מבנה הסיפור

### /storyIdeas
רכיבים ליצירת וניהול רעיונות לסיפורים.
- IdeaGenerator - טופס ליצירת רעיונות חדשים לסיפורים
- IdeaResult - הצגת רעיון סיפור שנוצר
- SavedIdeas - עיון וניהול רעיונות שמורים לסיפורים
- StoryArcs - תבניות למבני סיפור קלאסיים

### /characterDevelopment
רכיבים ליצירת ופיתוח דמויות.
- CharacterProfile - יצירת פרופילי דמויות מפורטים
- CharacterRelationshipMap - המחשה של מערכות יחסים בין דמויות

### /interactive
רכיבים להוספת אלמנטים אינטראקטיביים לסיפורים.
- InteractiveElements - הוספת אלמנטים לחיצים, חידונים ונקודות החלטה

### /community
רכיבים לאינטראקציה קהילתית.
- CommunityPost - הצגת ספרים משותפים מהקהילה
- FeaturedStory - סיפורי קהילה מודגשים
- CommentItem - תגובות על פוסטים בקהילה
- ShareBookModal - ממשק משתמש לשיתוף ספרים עם הקהילה

### /collaborate
רכיבים ליצירת ספרים בשיתוף פעולה.
- CollaborativeEditor - עריכה שיתופית בזמן אמת
- CollaborationInviteForm - הזמנת אחרים לשיתוף פעולה
- CollaboratorsList - ניהול משתפי פעולה בספר
- PageComments - הערות על עמודים ספציפיים
- RevisionHistory - מעקב אחר שינויים בספר

### /feedback
רכיבים לאיסוף והצגת משוב.
- FeedbackForm - שליחת משוב על ספרים
- FeedbackList - הצגת משוב שהתקבל
- FeedbackStats - אנליטיקה על משוב שהתקבל

### /i18n
רכיבים ושירותים לבינלאומיות.
- i18nContext - הקשר React להגדרות שפה
- i18nProvider - רכיב ספק לתמיכת שפה
- TranslationService - שירות לניהול תרגומים
- LanguageService - שירות לזיהוי והגדרת שפות

## תמיכה רב-לשונית
האפליקציה תומכת במספר שפות כולל:
- אנגלית
- עברית (עם תמיכה ב-RTL)
- יידיש (עם תמיכה ב-RTL)

## תכונות אינטראקטיביות
- התאמה אישית של דמויות
- תבניות מבנה סיפור
- אלמנטים אינטראקטיביים (פריטים לחיצים, חידונים, החלטות)
- קריינות קולית
- עריכה שיתופית

## אלמנטים חזותיים
- איורים מותאמים אישית
- סגנונות אמנות מרובים
- כלי מבנה סיפור חזותיים
- מפות יחסי דמויות
- התאמה אישית של פריסת עמוד