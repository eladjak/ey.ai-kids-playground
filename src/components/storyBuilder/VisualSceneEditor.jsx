import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Image as ImageIcon, Save, X, Sparkles, RefreshCw } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function VisualSceneEditor({ scene, sceneIndex, onUpdate, onGenerateSketch, availableCharacters = [], currentLanguage = "english", isRTL = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScene, setEditedScene] = useState({ ...scene });
  const [generatingSketch, setGeneratingSketch] = useState(false);

  const translations = {
    english: {
      "editor.edit": "Edit Scene",
      "editor.save": "Save Changes",
      "editor.cancel": "Cancel",
      "editor.title": "Scene Title",
      "editor.description": "Description",
      "editor.location": "Location",
      "editor.mood": "Mood",
      "editor.pacing": "Pacing",
      "editor.characters": "Characters",
      "editor.keyActions": "Key Actions",
      "editor.dialogue": "Dialogue Highlights",
      "editor.generateSketch": "Generate Sketch",
      "editor.regenerateSketch": "Regenerate Sketch",
      "editor.generating": "Generating...",
      "editor.calm": "Calm",
      "editor.tense": "Tense",
      "editor.exciting": "Exciting",
      "editor.mysterious": "Mysterious",
      "editor.joyful": "Joyful",
      "editor.sad": "Sad",
      "editor.slow": "Slow",
      "editor.medium": "Medium",
      "editor.fast": "Fast"
    },
    hebrew: {
      "editor.edit": "ערוך סצנה",
      "editor.save": "שמור שינויים",
      "editor.cancel": "בטל",
      "editor.title": "כותרת הסצנה",
      "editor.description": "תיאור",
      "editor.location": "מיקום",
      "editor.mood": "מצב רוח",
      "editor.pacing": "קצב",
      "editor.characters": "דמויות",
      "editor.keyActions": "פעולות מפתח",
      "editor.dialogue": "דיאלוג מרכזי",
      "editor.generateSketch": "צור סקיצה",
      "editor.regenerateSketch": "צור סקיצה מחדש",
      "editor.generating": "יוצר...",
      "editor.calm": "רגוע",
      "editor.tense": "מתוח",
      "editor.exciting": "מרגש",
      "editor.mysterious": "מסתורי",
      "editor.joyful": "שמח",
      "editor.sad": "עצוב",
      "editor.slow": "איטי",
      "editor.medium": "בינוני",
      "editor.fast": "מהיר"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const handleSave = () => {
    onUpdate(sceneIndex, editedScene);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedScene({ ...scene });
    setIsEditing(false);
  };

  const handleGenerateSketch = async () => {
    setGeneratingSketch(true);
    try {
      await onGenerateSketch(sceneIndex, editedScene);
    } finally {
      setGeneratingSketch(false);
    }
  };

  const handleCharacterToggle = (characterName) => {
    const currentCharacters = editedScene.characters || [];
    const updated = currentCharacters.includes(characterName)
      ? currentCharacters.filter(c => c !== characterName)
      : [...currentCharacters, characterName];
    setEditedScene({ ...editedScene, characters: updated });
  };

  if (!isEditing) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className="text-lg">{scene.title || `Scene ${sceneIndex + 1}`}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t("editor.edit")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {scene.sketch_url && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={scene.sketch_url} alt={scene.title} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">{scene.description}</p>
          {scene.characters && scene.characters.length > 0 && (
            <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              {scene.characters.map((char, i) => (
                <Badge key={i} variant="outline">{char}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-300 dark:border-purple-700">
      <CardHeader>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {t("editor.edit")}
          </CardTitle>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t("editor.cancel")}
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t("editor.save")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`title-${sceneIndex}`}>{t("editor.title")}</Label>
            <Input
              id={`title-${sceneIndex}`}
              value={editedScene.title || ''}
              onChange={(e) => setEditedScene({ ...editedScene, title: e.target.value })}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`location-${sceneIndex}`}>{t("editor.location")}</Label>
            <Input
              id={`location-${sceneIndex}`}
              value={editedScene.location || ''}
              onChange={(e) => setEditedScene({ ...editedScene, location: e.target.value })}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`description-${sceneIndex}`}>{t("editor.description")}</Label>
          <Textarea
            id={`description-${sceneIndex}`}
            value={editedScene.description || ''}
            onChange={(e) => setEditedScene({ ...editedScene, description: e.target.value })}
            className="min-h-[100px]"
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("editor.mood")}</Label>
            <Select
              value={editedScene.mood || 'calm'}
              onValueChange={(value) => setEditedScene({ ...editedScene, mood: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">{t("editor.calm")}</SelectItem>
                <SelectItem value="tense">{t("editor.tense")}</SelectItem>
                <SelectItem value="exciting">{t("editor.exciting")}</SelectItem>
                <SelectItem value="mysterious">{t("editor.mysterious")}</SelectItem>
                <SelectItem value="joyful">{t("editor.joyful")}</SelectItem>
                <SelectItem value="sad">{t("editor.sad")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("editor.pacing")}</Label>
            <Select
              value={editedScene.pacing || 'medium'}
              onValueChange={(value) => setEditedScene({ ...editedScene, pacing: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">{t("editor.slow")}</SelectItem>
                <SelectItem value="medium">{t("editor.medium")}</SelectItem>
                <SelectItem value="fast">{t("editor.fast")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {availableCharacters.length > 0 && (
          <div className="space-y-2">
            <Label>{t("editor.characters")}</Label>
            <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              {availableCharacters.map((char) => (
                <Badge
                  key={char.name}
                  variant={editedScene.characters?.includes(char.name) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCharacterToggle(char.name)}
                >
                  {char.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {editedScene.sketch_url && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src={editedScene.sketch_url} alt={editedScene.title} className="w-full h-full object-cover" />
          </div>
        )}

        <Button
          onClick={handleGenerateSketch}
          disabled={generatingSketch}
          variant="outline"
          className="w-full"
        >
          {generatingSketch ? (
            <>
              <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("editor.generating")}
            </>
          ) : (
            <>
              {editedScene.sketch_url ? <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> : <ImageIcon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
              {editedScene.sketch_url ? t("editor.regenerateSketch") : t("editor.generateSketch")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}