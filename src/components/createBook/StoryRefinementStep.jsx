import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, X, Sparkles, Wand2, BookOpen, Loader2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import StoryStructureBuilder from "../storyBuilder/StoryStructureBuilder";
import CharacterArcTracker from "../characterDevelopment/CharacterArcTracker";

// Helper component for inline name editing
const EditableCharacterName = ({ character, onNameChange, isRTL }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(character.name);

  const handleSave = () => {
    if (editValue.trim() && editValue !== character.name) {
      onNameChange(character.name, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(character.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyPress={handleKeyPress}
        className="h-6 text-sm font-medium"
        autoFocus
        dir={isRTL ? "rtl" : "ltr"}
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-sm font-medium text-left hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded transition-colors"
    >
      {character.name}
    </button>
  );
};

export default function StoryRefinementStep({ bookData, updateBookData, currentLanguage = "english", isRTL = false }) {
  const [newCharacterName, setNewCharacterName] = useState('');
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(new Set());
  const [isInitialAvatarLoad, setIsInitialAvatarLoad] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Image generation queue to handle rate limits
  const avatarQueue = React.useRef([]);
  const isProcessingAvatarQueue = React.useRef(false);

  // Auto-save functionality
  useEffect(() => {
    const saveData = async () => {
      if (!bookData.id) return;

      try {
        setAutoSaveStatus('saving');
        const { Book } = await import('@/entities/Book');
        await Book.update(bookData.id, bookData);
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
      }
    };

    const timeoutId = setTimeout(saveData, 2000);
    return () => clearTimeout(timeoutId);
  }, [bookData]);

  const processAvatarQueue = async () => {
    if (isProcessingAvatarQueue.current || avatarQueue.current.length === 0) return;

    isProcessingAvatarQueue.current = true;

    while (avatarQueue.current.length > 0) {
      const { characterName, retryCount = 0 } = avatarQueue.current.shift();

      try {
        await generateAvatarInternal(characterName);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait between generations
      } catch (error) {
        if (error.message.includes('429') && retryCount < 3) {
          avatarQueue.current.push({ characterName, retryCount: retryCount + 1 });
          await new Promise(resolve => setTimeout(resolve, 8000 * (retryCount + 1))); // Longer wait for retries
        } else {
          console.error(`Failed to generate avatar for ${characterName} after retries:`, error);
          setLoadingAvatars(prev => {
            const newSet = new Set(prev);
            newSet.delete(characterName);
            return newSet;
          });
        }
      }
    }

    isProcessingAvatarQueue.current = false;
  };

  const generateAvatar = (characterName) => {
    if (!avatarQueue.current.some(item => item.characterName === characterName)) {
      avatarQueue.current.push({ characterName });
      setLoadingAvatars(prev => new Set(prev).add(characterName));
      processAvatarQueue();
    }
  };

  const generateAvatarInternal = async (characterName) => {
    try {
      const { GenerateImage } = await import('@/integrations/Core');
      const character = (bookData.selectedCharacters || []).find(c => c.name === characterName);
      if (!character) return;

      const prompt = getCharacterPrompt(character.name, character.age, character.gender);
      
      // Use Gemini 3 Pro Nano Banana as default for character avatars
      const result = await GenerateImage({ 
        prompt,
        model: 'gemini-3-pro-nano-banana'
      });

      if (result && result.url) {
        const currentCharacters = [...(bookData.selectedCharacters || [])];
        const charIndex = currentCharacters.findIndex(c => c.name === characterName);
        if (charIndex !== -1) {
            currentCharacters[charIndex] = { ...currentCharacters[charIndex], primary_image_url: result.url };
            updateBookData("selectedCharacters", currentCharacters);
        }
      }
    } catch (e) {
      console.error(`Error generating avatar for ${characterName}:`, e);
      throw e;
    } finally {
      setLoadingAvatars(prev => {
        const newSet = new Set(prev);
        newSet.delete(characterName);
        return newSet;
      });
    }
  };

  // Load avatars for characters that don't have them
  useEffect(() => {
    const charactersToUpdate = (bookData.selectedCharacters || []).filter(c => !c.primary_image_url && !loadingAvatars.has(c.name));

    if (charactersToUpdate.length > 0) {
      const generateMissingAvatars = () => {
        charactersToUpdate.forEach(c => generateAvatar(c.name)); // Use the new enqueueing function
        setIsInitialAvatarLoad(false);
      };
      generateMissingAvatars();
    } else if (isInitialAvatarLoad) {
        setIsInitialAvatarLoad(false);
    }
  }, [bookData.selectedCharacters, loadingAvatars, isInitialAvatarLoad]);

  // Translations
  const translations = {
    english: {
      "refine.title": "Story Refinement",
      "refine.subtitle": "Develop your story details and characters",
      "refine.storyOverview": "Story Overview",
      "refine.bookTitle": "Book Title",
      "refine.description": "Story Description",
      "refine.characters": "Characters",
      "refine.addCharacter": "Add Character",
      "refine.characterName": "Character name",
      "refine.mainCharacters": "Main Characters",
      "refine.supportingCharacters": "Supporting Characters",
      "refine.dragToReorder": "Drag characters between categories",
      "refine.regenerateAvatar": "Regenerate Avatar",
      "refine.male": "Male",
      "refine.female": "Female",
      "refine.neutral": "Neutral",
      "refine.age": "Age",
      "refine.gender": "Gender",
      "refine.generateTitle": "Generate Title",
      "refine.storyStructure": "Story Structure",
      "refine.saving": "Saving...",
      "refine.saved": "Saved",
      "refine.error": "Error saving"
    },
    hebrew: {
      "refine.title": "עידון הסיפור",
      "refine.subtitle": "פתח את פרטי הסיפור והדמויות שלך",
      "refine.storyOverview": "סקירת הסיפור",
      "refine.bookTitle": "כותרת הספר",
      "refine.description": "תיאור הסיפור",
      "refine.characters": "דמויות",
      "refine.addCharacter": "הוסף דמות",
      "refine.characterName": "שם הדמות",
      "refine.mainCharacters": "דמויות ראשיות",
      "refine.supportingCharacters": "דמויות משנה",
      "refine.dragToReorder": "גרור דמויות בין הקטגוריות",
      "refine.regenerateAvatar": "צור אווטר מחדש",
      "refine.male": "זכר",
      "refine.female": "נקבה",
      "refine.neutral": "ניטרלי",
      "refine.age": "גיל",
      "refine.gender": "מין",
      "refine.generateTitle": "צור כותרת",
      "refine.storyStructure": "מבנה הסיפור",
      "refine.characterArc": "קשת הדמות",
      "refine.saving": "שומר...",
      "refine.saved": "נשמר",
      "refine.error": "שגיאה בשמירה"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const handleCharacterDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const currentCharacters = bookData.selectedCharacters || [];

    // Ensure we're working with a mutable copy for reordering
    const newCharacters = [...currentCharacters];

    const [reorderedItem] = newCharacters.splice(source.index, 1);
    newCharacters.splice(destination.index, 0, reorderedItem);

    updateBookData("selectedCharacters", newCharacters);
  };

  const handleChange = (field, value) => {
    updateBookData(field, value);
  };

  const handleCharacterUpdate = (characterName, field, value) => {
    const updatedCharacters = (bookData.selectedCharacters || []).map(char =>
      char.name === characterName ? { ...char, [field]: value } : char
    );

    if (!updatedCharacters.some(char => char.name === characterName)) {
      updatedCharacters.push({ name: characterName, [field]: value, isMain: true });
    }

    updateBookData("selectedCharacters", updatedCharacters);

    if (bookData.childNames && bookData.childNames[0] === characterName) {
      if (field === 'age') updateBookData("child_age", value);
      if (field === 'gender') updateBookData("child_gender", value);
    }

    // Auto-regenerate avatar when age or gender changes
    if ((field === 'age' || field === 'gender') && value) {
      // Add a small delay to avoid immediate regeneration while user is typing
      setTimeout(() => {
        if (!loadingAvatars.has(characterName)) {
          generateAvatar(characterName);
        }
      }, 1500);
    }
  };

  const generateTitle = async () => {
    try {
      const { InvokeLLM } = await import('@/integrations/Core');
      const targetLanguage = bookData.language || currentLanguage;
      const languageInstruction = targetLanguage === "hebrew" ?
        "יש ליצור את כל התוכן בעברית בלבד. " :
        "Create all content in English only. ";

      const charactersInfo = bookData.childNames ? bookData.childNames.join(', ') : (bookData.child_name || 'a child');
      const themesInfo = bookData.interests || 'adventure and friendship';

      const prompt = `${languageInstruction}Create a creative and engaging book title for a children's story with these details:
      - Main characters: ${charactersInfo}
      - Age: ${bookData.child_age || 5} years old
      - Genre: ${bookData.genre}
      - Theme/Moral: ${bookData.moral || themesInfo}
      - Tone: ${bookData.tone}
      - Child's interests: ${bookData.interests || 'general'}

      The title should be catchy, age-appropriate, and reflect the story's theme. Return only the title, nothing else.`;

      const result = await InvokeLLM({ prompt: prompt });

      if (result && typeof result === 'string') {
        updateBookData('title', result.trim());
      }
    } catch (error) {
      console.error('Error generating title:', error);
    }
  };

  const getCharacterPrompt = (characterName, age = 5, gender = 'neutral') => {
    const language = bookData.language || currentLanguage;
    const isHebrew = language === 'hebrew';
    const artStyle = bookData.art_style || 'cartoon';

    // Handle special ages
    const actualAge = parseInt(age);
    const isSpecialAge = age === '???' || age === 'Ancient' || isNaN(actualAge);
    const effectiveAge = isSpecialAge ? 25 : actualAge; // Default to adult if special

    let ageGroup = '';
    let ageDescriptor = '';
    let characterType = '';

    // More nuanced age groups
    if (isSpecialAge) {
      ageGroup = isHebrew ? 'יצור מיסטי' : 'mystical being';
      ageDescriptor = isHebrew ? 'בעל גיל לא ידוע או עתיק' : 'ageless or ancient';
    } else if (effectiveAge <= 2) {
      ageGroup = isHebrew ? 'תינוק' : 'baby';
      ageDescriptor = isHebrew ? 'תינוק חמוד' : 'cute baby';
    } else if (effectiveAge <= 5) {
      ageGroup = isHebrew ? 'פעוט' : 'toddler';
      ageDescriptor = isHebrew ? 'פעוט קטן ושובב' : 'small playful toddler';
    } else if (effectiveAge <= 10) {
      ageGroup = isHebrew ? 'ילד' : 'child';
      ageDescriptor = isHebrew ? 'ילד עליז' : 'cheerful child';
    } else if (effectiveAge <= 15) {
      ageGroup = isHebrew ? 'נער צעיר' : 'young teen';
      ageDescriptor = isHebrew ? 'נער צעיר' : 'young teenager';
    } else if (effectiveAge <= 25) {
      ageGroup = isHebrew ? 'צעיר' : 'young adult';
      ageDescriptor = isHebrew ? 'אדם צעיר' : 'young adult person';
    } else if (effectiveAge <= 50) {
      ageGroup = isHebrew ? 'מבוגר' : 'adult';
      ageDescriptor = isHebrew ? 'אדם בוגר' : 'mature adult';
    } else if (effectiveAge <= 80) {
      ageGroup = isHebrew ? 'מבוגר מנוסה' : 'experienced elder';
      ageDescriptor = isHebrew ? 'אדם מבוגר עם חוכמת חיים' : 'elderly person with wisdom';
    } else {
      ageGroup = isHebrew ? 'זקן נכבד' : 'venerable elder';
      ageDescriptor = isHebrew ? 'זקן מכובד ומנוסה' : 'very old respected elder';
    }

    // Check for special character types
    const lowerName = characterName.toLowerCase();
    if (lowerName.includes('wizard') || lowerName.includes('קוסם')) {
      characterType = isHebrew ? 'קוסם חכם' : 'wise wizard';
      ageDescriptor = isHebrew ? 'קוסם מבוגר ומיסטי' : 'old mystical wizard';
    } else if (lowerName.includes('princess') || lowerName.includes('נסיכה')) {
      characterType = isHebrew ? 'נסיכה יפה' : 'beautiful princess';
    } else if (lowerName.includes('dragon') || lowerName.includes('דרקון')) {
      characterType = isHebrew ? 'דרקון ידידותי' : 'friendly dragon';
      ageDescriptor = isHebrew ? 'דרקון עתיק וחכם' : 'ancient wise dragon';
    } else if (lowerName.includes('fairy') || lowerName.includes('פיה')) {
      characterType = isHebrew ? 'פיה קסומה' : 'magical fairy';
    } else {
      characterType = ageGroup;
    }

    // Enhanced prompt with art style and better age representation
    if (isHebrew) {
      return `דמות לספר ילדים בסגנון ${artStyle}: ${characterType} בשם ${characterName}.
      גיל: ${age === '???' ? 'לא ידוע, מיסטי' : `${effectiveAge} שנים`}.
      תיאור הדמות: ${ageDescriptor}, ${gender === 'boy' ? 'זכר' : gender === 'girl' ? 'נקבה' : 'ניטרלי'}.
      סגנון האיור: ${artStyle}, חמוד ומזמין, צבעוני ועדין, מתאים לספרי ילדים.
      הדמות חייבת להיראות כמו ${ageGroup} אמיתי, לא תינוק.
      ביטוי פנים חמוד, ידידותי וחם, מתאים לילדים.
      רקע נקי ופשוט או ללא רקע לגמרי - רק הדמות במרכז.
      איכות גבוהה, פרטים עדינים, תאורה רכה.`;
    } else {
      return `Children's book character in ${artStyle} style: ${characterType} named ${characterName}.
      Age: ${age === '???' ? 'unknown, mystical' : `${effectiveAge} years old`}.
      Character description: ${ageDescriptor}, ${gender === 'boy' ? 'male' : gender === 'girl' ? 'female' : 'gender-neutral'}.
      Art style: ${artStyle}, cute and inviting, colorful and gentle, suitable for children's books.
      The character MUST look like an actual ${ageGroup}, NOT a baby.
      Friendly, warm, and cheerful facial expression, appropriate for children.
      Clean simple background or no background - character centered.
      High quality, fine details, soft lighting.`;
    }
  };

  const addCharacter = () => {
    if (!newCharacterName.trim()) return;

    const currentNames = bookData.childNames || [];
    if (currentNames.includes(newCharacterName.trim())) return;

    const newCharacter = {
      name: newCharacterName.trim(),
      age: 5,
      gender: 'neutral',
      primary_image_url: null,
      isMain: true
    };

    updateBookData("childNames", [...currentNames, newCharacter.name]);
    updateBookData("selectedCharacters", [...(bookData.selectedCharacters || []), newCharacter]);

    if (currentNames.length === 0) {
      updateBookData("child_name", newCharacter.name);
      updateBookData("child_age", newCharacter.age);
      updateBookData("child_gender", newCharacter.gender);
    }

    setNewCharacterName('');
    setShowAddCharacter(false);
  };

  const removeCharacter = (nameToRemove) => {
    const currentNames = bookData.childNames || [];
    const currentCharacters = bookData.selectedCharacters || [];

    updateBookData("childNames", currentNames.filter(name => name !== nameToRemove));
    updateBookData("selectedCharacters", currentCharacters.filter(char => char.name !== nameToRemove));

    if (bookData.child_name === nameToRemove) {
      const remainingNames = currentNames.filter(name => name !== nameToRemove);
      if (remainingNames.length > 0) {
        const nextCharacter = currentCharacters.find(c => c.name === remainingNames[0]);
        updateBookData("child_name", remainingNames[0]);
        if (nextCharacter) {
          updateBookData("child_age", nextCharacter.age || 5);
          updateBookData("child_gender", nextCharacter.gender || "neutral");
        }
      } else {
        updateBookData("child_name", "");
        updateBookData("child_age", 5);
        updateBookData("child_gender", "neutral");
      }
    }
  };

  const handleCharacterNameChange = (oldName, newName) => {
    if (oldName === newName) return;

    const currentNames = bookData.childNames || [];
    const currentCharacters = bookData.selectedCharacters || [];

    const updatedNames = currentNames.map(name => name === oldName ? newName : name);
    const updatedCharacters = currentCharacters.map(char =>
      char.name === oldName ? { ...char, name: newName } : char
    );

    updateBookData("childNames", updatedNames);
    updateBookData("selectedCharacters", updatedCharacters);

    if (bookData.child_name === oldName) {
      updateBookData("child_name", newName);
    }
  };

  const AutoSaveIndicator = () => {
    if (autoSaveStatus === 'saving') {
      return (
        <div className={`flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Loader2 className="w-3 h-3 animate-spin" />
          {t('refine.saving')}
        </div>
      );
    } else if (autoSaveStatus === 'saved' && lastSaved) {
      return (
        <div className={`flex items-center gap-1 text-xs text-green-600 dark:text-green-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          {t('refine.saved')}
        </div>
      );
    } else if (autoSaveStatus === 'error') {
      return (
        <div className={`flex items-center gap-1 text-xs text-red-600 dark:text-red-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          {t('refine.error')}
        </div>
      );
    }
    return null;
  };

  const mainCharacters = (bookData.selectedCharacters || []).filter(char => char.isMain !== false);
  const supportingCharacters = (bookData.selectedCharacters || []).filter(char => char.isMain === false);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Auto-save indicator */}
      <div className={`flex justify-end ${isRTL ? 'justify-start' : ''}`}>
        <AutoSaveIndicator />
      </div>

      {/* Story Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
        <CardHeader>
          <CardTitle className={`text-xl text-purple-700 dark:text-purple-300 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BookOpen className="h-5 w-5" />
            {t("refine.storyOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("refine.bookTitle")}</Label>
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Input
                id="title"
                value={bookData.title || ''}
                onChange={(e) => handleChange("title", e.target.value)}
                className="flex-1"
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button onClick={generateTitle} variant="outline" size="sm">
                <Wand2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {t("refine.generateTitle")}
              </Button>
            </div>
          </div>

          {bookData.description && (
            <div className="space-y-2">
              <Label>{t("refine.description")}</Label>
              <Textarea
                value={bookData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-[80px]"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Characters Management */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Users className="h-5 w-5 text-purple-500" />
            {t("refine.characters")}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddCharacter(!showAddCharacter)}
              className={`text-xs h-auto py-1 px-2 ${isRTL ? 'mr-auto' : 'ml-auto'}`}
            >
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t("refine.addCharacter")}
            </Button>
          </CardTitle>
          <p className={`text-sm text-gray-500 dark:text-gray-400 px-6 pb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("refine.dragToReorder")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {showAddCharacter && (
            <Card className="p-4 bg-green-50 dark:bg-green-900/20">
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Input
                  placeholder={t("refine.characterName")}
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  className="flex-1"
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button onClick={addCharacter} size="sm">
                  {t("refine.addCharacter")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddCharacter(false);
                    setNewCharacterName('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          <DragDropContext onDragEnd={handleCharacterDragEnd}>
            <div className="space-y-6">
              <Droppable droppableId="main-characters">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <h4 className={`font-medium mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("refine.mainCharacters")} ({mainCharacters.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mainCharacters.map((character, index) => (
                        <Draggable key={character.name} draggableId={character.name} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800"
                            >
                              <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className="relative">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={character.primary_image_url} alt={character.name} />
                                    <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                                      {character.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  {loadingAvatars.has(character.name) && (
                                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <EditableCharacterName
                                    character={character}
                                    onNameChange={handleCharacterNameChange}
                                    isRTL={isRTL}
                                  />
                                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex-1">
                                      <Label className="text-xs text-gray-600 dark:text-gray-400">{t("refine.gender")}</Label>
                                      <Select
                                        value={character.gender || 'neutral'}
                                        onValueChange={(value) => handleCharacterUpdate(character.name, 'gender', value)}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="neutral">{t("refine.neutral")}</SelectItem>
                                          <SelectItem value="boy">{t("refine.male")}</SelectItem>
                                          <SelectItem value="girl">{t("refine.female")}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="w-20">
                                      <Label className="text-xs text-gray-600 dark:text-gray-400">{t("refine.age")}</Label>
                                      <Input
                                        type="text" // Allow text for "???"
                                        value={character.age === '???' ? '???' : (character.age || '')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const newAge = val === '???' ? '???' : (parseInt(val) || '');
                                            handleCharacterUpdate(character.name, 'age', newAge);
                                        }}
                                        className="h-8 text-xs"
                                        placeholder="e.g. 8"
                                      />
                                    </div>
                                  </div>
                                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => generateAvatar(character.name)}
                                      disabled={loadingAvatars.has(character.name)}
                                      className="text-xs"
                                    >
                                      <Sparkles className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                      {t("refine.regenerateAvatar")}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCharacter(character.name)}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Story Structure Builder */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <BookOpen className="h-5 w-5 text-purple-500" />
            {t("refine.storyStructure")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StoryStructureBuilder
            bookData={bookData}
            updateBookData={updateBookData}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
          />
        </CardContent>
      </Card>

      {/* Character Arc Tracker */}
      {mainCharacters.length > 0 && bookData.scenes && bookData.scenes.length > 2 && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <Users className="h-5 w-5 text-indigo-500" />
              {t("refine.characterArc")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mainCharacters.map(character => (
              <CharacterArcTracker
                key={character.name}
                character={character}
                scenes={bookData.scenes}
                bookData={bookData}
                currentLanguage={currentLanguage}
                isRTL={isRTL}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}