
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Edit, Trash2, Rocket } from "lucide-react";
import EmptyState from '../library/EmptyState'; // Assuming EmptyState is in '../library/EmptyState.jsx' or '.tsx'

export default function SavedIdeas({
  ideas = [],
  onUseIdea,
  onEditIdea,
  onDeleteIdea,
  currentLanguage = "english",
  isRTL = false,
}) {

  const translations = {
    english: {
      "savedIdeas.title": "Saved Story Ideas",
      "savedIdeas.subtitle": "Your collection of previously generated story ideas",
      "savedIdeas.emptyTitle": "No Saved Ideas Yet",
      "savedIdeas.emptyDesc": "Generate and save some ideas to see them here, or try generating a new one.",
      "savedIdeas.newIdea": "Create New Idea", // Not used in this version but kept for consistency
      "savedIdeas.use": "Use This Idea",
      "savedIdeas.recent": "Recent", // Not used in this version but kept for consistency
      "savedIdeas.language": "Language", // Not used in this version but kept for consistency
      "savedIdeas.createdOn": "Created on", // Not used in this version but kept for consistency
      "savedIdeas.edit": "Edit",
      "savedIdeas.delete": "Delete",
    },
    hebrew: {
      "savedIdeas.title": "רעיונות סיפורים שנשמרו",
      "savedIdeas.subtitle": "האוסף שלך של רעיונות סיפורים שנוצרו בעבר",
      "savedIdeas.emptyTitle": "אין עדיין רעיונות שמורים",
      "savedIdeas.emptyDesc": "צור ושמור רעיונות כדי לראות אותם כאן, או נסה ליצור רעיון חדש.",
      "savedIdeas.newIdea": "צור רעיון חדש", // Not used in this version but kept for consistency
      "savedIdeas.use": "השתמש ברעיון זה",
      "savedIdeas.recent": "נוצר לאחרונה", // Not used in this version but kept for consistency
      "savedIdeas.language": "שפה", // Not used in this version but kept for consistency
      "savedIdeas.createdOn": "נוצר ב", // Not used in this version but kept for consistency
      "savedIdeas.edit": "ערוך",
      "savedIdeas.delete": "מחק",
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  if (ideas.length === 0) {
    return (
      <EmptyState
        title={t("savedIdeas.emptyTitle")}
        description={t("savedIdeas.emptyDesc")}
        icon={<FileText className="h-12 w-12 text-gray-400 mb-4" />}
      />
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`text-center ${isRTL ? 'rtl' : ''}`}>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t("savedIdeas.title")}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t("savedIdeas.subtitle")}</p>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isRTL ? 'rtl' : ''}`}>
          {ideas.map((idea) => (
            <Card key={idea.id} className={`flex flex-col justify-between hover:shadow-lg transition-shadow overflow-hidden ${isRTL ? 'rtl' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg text-gray-900 dark:text-white line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {idea.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-2">
                <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {idea.description}
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                    {idea.language === 'hebrew' ? 'עברית' : 'English'}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className={`flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 border-t border-gray-100 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                   <Button variant="ghost" size="icon" onClick={() => onEditIdea && onEditIdea(idea)} title={t("savedIdeas.edit")}>
                      <Edit className="h-4 w-4 text-blue-500" />
                   </Button>
                   <Button variant="ghost" size="icon" onClick={() => onDeleteIdea && onDeleteIdea(idea.id)} className="text-red-500 hover:text-red-600" title={t("savedIdeas.delete")}>
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
                <Button onClick={() => onUseIdea && onUseIdea(idea)} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Rocket className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("savedIdeas.use")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
