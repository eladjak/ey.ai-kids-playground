import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered, BookOpen, Star } from "lucide-react";

export default function StoryArcs({
  currentLanguage = "english",
  isRTL = false
}) {
  // Translation data with proper story arc templates
  const translations = {
    english: {
      title: "Story Arc Templates",
      description: "Classic story structures to build your narrative",
      heroJourney: {
        title: "Hero's Journey",
        description: "A classic structure where the hero leaves home, overcomes challenges, and returns transformed",
        steps: [
          "Ordinary World - The hero's normal life",
          "Call to Adventure - Something changes",
          "Meeting the Mentor - Getting guidance",
          "Crossing the Threshold - Entering the adventure",
          "Tests, Allies and Enemies - Facing challenges",
          "The Ordeal - Facing the biggest challenge",
          "Return with Reward - Coming home changed"
        ]
      },
      problemSolution: {
        title: "Problem-Solution",
        description: "A simple structure where a character faces a problem and finds a solution",
        steps: [
          "Introduction - Meet the main character",
          "Problem - Something goes wrong",
          "Failed Attempts - Try but fail to solve it",
          "Discovery - Find a new approach",
          "Solution - Solve the problem",
          "Resolution - See how things are better"
        ]
      },
      friendshipTale: {
        title: "Friendship Tale",
        description: "A story about forming and strengthening relationships",
        steps: [
          "Meeting - Characters meet for the first time",
          "Connection - Finding common ground",
          "Enjoyment - Having fun together",
          "Challenge - Facing a problem together",
          "Conflict - Disagreement tests friendship",
          "Resolution - Rebuilding stronger friendship"
        ]
      },
      discoveryStory: {
        title: "Discovery Story",
        description: "A journey of curiosity, exploration and learning",
        steps: [
          "Curiosity - The character wonders about something",
          "Question - Forming a specific question",
          "Exploration - Setting out to find answers",
          "Obstacle - Something makes discovery difficult",
          "Discovery - Finding the answer",
          "Sharing - Sharing knowledge with others"
        ]
      }
    },
    hebrew: {
      title: "תבניות מבנה עלילה",
      description: "מבני סיפור קלאסיים לבניית הנרטיב שלך",
      heroJourney: {
        title: "מסע הגיבור",
        description: "מבנה קלאסי שבו הגיבור יוצא מביתו, מתגבר על אתגרים, וחוזר לאחר שעבר שינוי",
        steps: [
          "העולם הרגיל - חיי היומיום של הגיבור",
          "קריאה להרפתקה - משהו משתנה",
          "פגישה עם המנטור - קבלת הדרכה",
          "חציית הסף - כניסה להרפתקה",
          "מבחנים, בעלי ברית ואויבים - התמודדות עם אתגרים",
          "המשבר - התמודדות עם האתגר הגדול ביותר",
          "חזרה עם תגמול - חזרה הביתה לאחר שינוי"
        ]
      },
      problemSolution: {
        title: "בעיה-פתרון",
        description: "מבנה פשוט שבו דמות מתמודדת עם בעיה ומוצאת פתרון",
        steps: [
          "הקדמה - הכרת הדמות הראשית",
          "בעיה - משהו משתבש",
          "ניסיונות כושלים - ניסיון לפתור אך כישלון",
          "תגלית - מציאת גישה חדשה",
          "פתרון - פתרון הבעיה",
          "סיום - ראיית השיפור במצב"
        ]
      },
      friendshipTale: {
        title: "סיפור חברות",
        description: "סיפור על יצירת וחיזוק קשרים",
        steps: [
          "פגישה - הדמויות נפגשות לראשונה",
          "חיבור - מציאת מכנה משותף",
          "הנאה - בילוי זמן מהנה יחד",
          "אתגר - התמודדות עם בעיה יחד",
          "קונפליקט - מחלוקת מעמידה את החברות במבחן",
          "פתרון - בניית חברות חזקה יותר"
        ]
      },
      discoveryStory: {
        title: "סיפור גילוי",
        description: "מסע של סקרנות, חקירה ולמידה",
        steps: [
          "סקרנות - הדמות תוהה על משהו",
          "שאלה - גיבוש שאלה ספציפית",
          "חקירה - יציאה למציאת תשובות",
          "מכשול - משהו מקשה על הגילוי",
          "תגלית - מציאת התשובה",
          "שיתוף - שיתוף הידע עם אחרים"
        ]
      }
    }
  };

  const renderArcTemplate = (arc, key) => {
    const data = translations[currentLanguage]?.[key] || translations.english[key];
    return (
      <Card className="mb-6" key={key}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {key === 'heroJourney' && <Star className="h-5 w-5 text-yellow-500" />}
            {key === 'problemSolution' && <ListOrdered className="h-5 w-5 text-blue-500" />}
            {key === 'friendshipTale' && <BookOpen className="h-5 w-5 text-green-500" />}
            {key === 'discoveryStory' && <Star className="h-5 w-5 text-purple-500" />}
            {data.title}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{index + 1}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {translations[currentLanguage]?.title || translations.english.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {translations[currentLanguage]?.description || translations.english.description}
        </p>
      </div>
      <div className="space-y-6">
        {renderArcTemplate(translations[currentLanguage]?.heroJourney, 'heroJourney')}
        {renderArcTemplate(translations[currentLanguage]?.problemSolution, 'problemSolution')}
        {renderArcTemplate(translations[currentLanguage]?.friendshipTale, 'friendshipTale')}
        {renderArcTemplate(translations[currentLanguage]?.discoveryStory, 'discoveryStory')}
      </div>
    </div>
  );
}