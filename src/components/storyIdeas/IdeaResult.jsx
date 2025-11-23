
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  Wand2, 
  BookOpen, 
  User, 
  Lightbulb, 
  ListOrdered, 
  Save,
  Edit,
  Trash2,
  Rocket,
  Loader2 // Added Loader2 import
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IdeaResult({ 
  idea, 
  onContinue, // This prop is no longer used in the UI based on the outline
  onRegenerate, 
  onSave,
  onSaveAndContinue,
  onEdit,
  onDelete,
  isRegenerating, 
  isSaving,
  currentLanguage,
  isEditingMode = false // New prop to control UI for editing
}) {
  const [isEditing, setIsEditing] = useState(isEditingMode);
  const [editedIdea, setEditedIdea] = useState(idea);

  useEffect(() => {
    setEditedIdea(idea); // Sync with prop changes
  }, [idea]);

  const isRTL = currentLanguage === 'hebrew' || currentLanguage === 'yiddish';

  const translations = {
    english: {
      title: "Your Story Idea is Ready!",
      editTitle: "Edit Your Story Idea", // New translation
      subtitle: "Review the details below. You can refine them in the next step.",
      ideaTitle: "Story Title",
      ideaDesc: "Description",
      plotPoints: "Key Plot Points",
      charDev: "Character Development",
      moral: "Moral of the Story",
      continue: "Continue to Next Step", // Still in translations, but UI button removed
      regenerate: "Try a new idea",
      regenerating: "Generating...",
      save: "Save Idea",
      saving: "Saving...",
      edit: "Edit",
      delete: "Delete",
      saveAndContinue: "Save & Create Book",
      cancel: "Cancel",
      saveChanges: "Save Changes"
    },
    hebrew: {
      title: "רעיון הסיפור שלך מוכן!",
      editTitle: "ערוך את רעיון הסיפור", // New translation
      subtitle: "בדוק את הפרטים למטה. תוכל לשנות אותם בשלב הבא.",
      ideaTitle: "כותרת הסיפור",
      ideaDesc: "תיאור",
      plotPoints: "נקודות עלילה מרכזיות",
      charDev: "פיתוח דמויות",
      moral: "מוסר השכל",
      continue: "המשך לשלב הבא", // Still in translations, but UI button removed
      regenerate: "נסה רעיון חדש",
      regenerating: "יוצר רעיון...",
      save: "שמור רעיון",
      saving: "שומר...",
      edit: "ערוך",
      delete: "מחק",
      saveAndContinue: "שמור וצור ספר",
      cancel: "ביטול",
      saveChanges: "שמור שינויים"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];

  if (!idea) return null;

  const handleSaveChanges = () => { // Renamed from handleSaveEdit
    if (onEdit) {
      onEdit(editedIdea); 
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedIdea(idea);
    setIsEditing(false);
  };

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 p-4 bg-white dark:bg-gray-800/30 rounded-lg shadow-sm"
          >
            <div>
              <Label htmlFor="edit-title">{t('ideaTitle')}</Label>
              <Input
                id="edit-title"
                value={editedIdea.title}
                onChange={(e) => setEditedIdea({...editedIdea, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">{t('ideaDesc')}</Label>
              <Textarea
                id="edit-description"
                value={editedIdea.description}
                onChange={(e) => setEditedIdea({...editedIdea, description: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-moral">{t('moral')}</Label>
              <Textarea
                id="edit-moral"
                value={editedIdea.moral_lesson}
                onChange={(e) => setEditedIdea({...editedIdea, moral_lesson: e.target.value})}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" /> {/* Changed icon to Save */}
                {t('saveChanges')}
              </Button>
              <Button variant="ghost" onClick={handleCancelEdit}>
                {t('cancel')}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4 p-4 bg-white dark:bg-gray-800/30 rounded-lg shadow-sm"
          >
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
              {t('ideaTitle')}: <span className="font-normal">{idea.title}</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{t('ideaDesc')}:</span> {idea.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-800/30">
        <CardHeader>
          <CardTitle className="text-xl text-purple-800 dark:text-purple-200 flex items-center gap-3">
            {!isEditingMode && ( // Show check icon only when not in full editing mode
              <Check className="w-8 h-8 p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full" />
            )}
            {isEditingMode ? t("editTitle") : t("title")}
          </CardTitle>
          {!isEditingMode && <CardDescription className="text-gray-600 dark:text-gray-400">{t("subtitle")}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {renderContent()}

          {!isEditing && ( // This entire block for plot points, character dev, and moral lesson
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <ListOrdered className="w-5 h-5 text-purple-500" /> {t('plotPoints')}
                </h4>
                <ul className={`list-disc space-y-2 ${isRTL ? 'list-inside' : 'pl-5'}`}>
                  {(idea.plot_points || []).map((point, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">{point}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <User className="w-5 h-5 text-purple-500" /> {t('charDev')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{idea.character_development}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Lightbulb className="w-5 h-5 text-purple-500" /> {t('moral')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{idea.moral_lesson}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {!isEditingMode && ( // Only show action buttons if not in the main editing mode
          <CardFooter className="flex flex-wrap gap-2 justify-end bg-transparent pt-4">
            <Button variant="ghost" onClick={onDelete} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              {t("delete")}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
            <Button variant="outline" onClick={onRegenerate} disabled={isRegenerating}>
              {isRegenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              {isRegenerating ? t("regenerating") : t("regenerate")}
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? t("saving") : t("save")}
            </Button>
            <Button onClick={onSaveAndContinue} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
              <Rocket className="h-4 w-4 mr-2" />
              {t("saveAndContinue")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
