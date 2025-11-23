import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Save, Loader2, X } from 'lucide-react';
import IdeaGenerator from './IdeaGenerator'; // Re-using the generator as an editor form

export default function IdeaEditor({ idea, onSave, onCancel, isSaving, currentLanguage, isRTL }) {
  const [editedIdea, setEditedIdea] = useState(idea);
  const [ideaParams, setIdeaParams] = useState(
    idea && idea.parameters ? JSON.parse(idea.parameters) : {}
  );

  const t = (key) => {
    // Basic translation, can be expanded
    const translations = {
      english: {
        'editor.title': 'Edit Story Idea',
        'editor.save': 'Save Changes',
        'editor.saving': 'Saving...',
        'editor.cancel': 'Cancel',
        'editor.storyTitle': 'Story Title',
        'editor.description': 'Description',
        'editor.plotPoints': 'Plot Points (one per line)',
        'editor.charDev': 'Character Development',
        'editor.moral': 'Moral of the Story'
      },
      hebrew: {
        'editor.title': 'עריכת רעיון לסיפור',
        'editor.save': 'שמור שינויים',
        'editor.saving': 'שומר...',
        'editor.cancel': 'ביטול',
        'editor.storyTitle': 'כותרת הסיפור',
        'editor.description': 'תיאור',
        'editor.plotPoints': 'נקודות עלילה (אחת בכל שורה)',
        'editor.charDev': 'פיתוח דמויות',
        'editor.moral': 'מוסר השכל'
      }
    };
    return translations[currentLanguage]?.[key] || translations.english[key];
  };

  const handleParamChange = (field, value) => {
    setIdeaParams(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field, value) => {
    setEditedIdea(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveClick = () => {
    const finalIdea = {
      ...editedIdea,
      parameters: JSON.stringify(ideaParams),
    };
    onSave(finalIdea);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <ScrollArea className="h-[70vh] p-1">
        <div className="p-4 space-y-6">
          {/* Re-use IdeaGenerator for parameter editing */}
          <h3 className="text-lg font-semibold border-b pb-2">{t('editor.title')}</h3>
          
          {/* Basic idea details first */}
          <div className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="title">{t('editor.storyTitle')}</Label>
              <Input 
                id="title" 
                value={editedIdea.title || ''} 
                onChange={(e) => handleTextChange('title', e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('editor.description')}</Label>
              <Textarea 
                id="description"
                value={editedIdea.description || ''} 
                onChange={(e) => handleTextChange('description', e.target.value)} 
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plot_points">{t('editor.plotPoints')}</Label>
              <Textarea 
                id="plot_points"
                value={(editedIdea.plot_points || []).join('\n')} 
                onChange={(e) => handleTextChange('plot_points', e.target.value.split('\n'))}
                rows={5} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="char_dev">{t('editor.charDev')}</Label>
              <Textarea 
                id="char_dev"
                value={editedIdea.character_development || ''} 
                onChange={(e) => handleTextChange('character_development', e.target.value)}
                rows={3} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moral">{t('editor.moral')}</Label>
              <Textarea 
                id="moral"
                value={editedIdea.moral_lesson || ''} 
                onChange={(e) => handleTextChange('moral_lesson', e.target.value)}
                rows={2} 
              />
            </div>
          </div>
          
          {/* Parameters editing using IdeaGenerator */}
          <div className="pt-4 border-t">
            <IdeaGenerator
              ideaParams={ideaParams}
              onInputChange={handleParamChange}
              onGenerate={() => {}} // No generation needed here
              currentLanguage={currentLanguage}
              isRTL={isRTL}
            />
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="p-4 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('editor.cancel')}
          </Button>
        </DialogClose>
        <Button type="button" onClick={handleSaveClick} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          {isSaving ? t('editor.saving') : t('editor.save')}
        </Button>
      </DialogFooter>
    </div>
  );
}