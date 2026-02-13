
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users2, Plus, X, Sparkles, User } from "lucide-react";

export default function ChildInfoStep({ bookData, updateBookData }) {
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [newChildName, setNewChildName] = useState("");

  // Load language preference and characters
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
    loadAvailableCharacters();
  }, []);

  // NEW: Initialize data from bookData when component loads
  useEffect(() => {
    // If we already have childNames and selectedCharacters, we're good
    if (bookData.childNames && bookData.childNames.length > 0) {
      // Ensure we have a primary child_name
      if (!bookData.child_name && bookData.childNames.length > 0) {
        updateBookData("child_name", bookData.childNames[0]);
      }
      return; // No need for further initialization
    }

    // If bookData has child_name but no childNames, convert
    if (bookData.child_name && (!bookData.childNames || bookData.childNames.length === 0)) {
      updateBookData("childNames", [bookData.child_name]);

      // Create a character object for consistency
      const character = {
        name: bookData.child_name,
        age: bookData.child_age,
        gender: bookData.child_gender || "neutral"
      };
      updateBookData("selectedCharacters", [character]);
    }
  }, [bookData.child_name]); // Adjusted dependencies to be safer and avoid loops


  const loadAvailableCharacters = async () => {
    try {
      const { Character } = await import('@/entities/Character');
      const characters = await Character.list("-created_date");
      setAvailableCharacters(characters);
    } catch (error) {
      // silently handled
    }
  };

  // Translations
  const translations = {
    english: {
      "childInfo.title": "Main Characters",
      "childInfo.subtitle": "Choose the main characters for your story",
      "childInfo.mainCharacters": "Selected Characters",
      "childInfo.addNew": "Add as New Character",
      "childInfo.myCharacters": "My Saved Characters",
      "childInfo.characterName": "Enter a new character name",
      "childInfo.characterAge": "Primary Character Age",
      "childInfo.characterGender": "Primary Character Gender",
      "childInfo.boy": "Boy",
      "childInfo.girl": "Girl",
      "childInfo.neutral": "Neutral",
      "childInfo.interests": "Interests & Hobbies",
      "childInfo.interestsPlaceholder": "e.g., Drawing, animals, soccer, music, reading...",
      "childInfo.familyMembers": "Family & Other Characters",
      "childInfo.familyPlaceholder": "e.g., Mom, Dad, little sister Emma, Grandpa Joe..."
    },
    hebrew: {
      "childInfo.title": "דמויות ראשיות",
      "childInfo.subtitle": "בחר את הדמויות הראשיות לסיפור שלך",
      "childInfo.mainCharacters": "דמויות שנבחרו",
      "childInfo.addNew": "הוסף כדמות חדשה",
      "childInfo.myCharacters": "הדמויות השמורות שלי",
      "childInfo.characterName": "הכנס שם לדמות חדשה",
      "childInfo.characterAge": "גיל הדמות הראשית",
      "childInfo.characterGender": "מין הדמות הראשית",
      "childInfo.boy": "בן",
      "childInfo.girl": "בת",
      "childInfo.neutral": "ניטרלי",
      "childInfo.interests": "תחומי עניין ותחביבים",
      "childInfo.interestsPlaceholder": "למשל: ציור, חיות, כדורגל, מוזיקה, קריאה...",
      "childInfo.familyMembers": "בני משפחה ודמויות נוספות",
      "childInfo.familyPlaceholder": "למשל: אמא, אבא, אחות קטנה עמה, סבא יוסי..."
    }
  };

  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  // Determine text direction
  const isRTL = currentLanguage === "hebrew";

  const handleChange = (field, value) => {
    updateBookData(field, value);
  };

  const handleAddCharacter = (character) => {
    const currentCharacters = bookData.selectedCharacters || [];
    const currentNames = bookData.childNames || [];

    if (!currentNames.includes(character.name)) {
      updateBookData("childNames", [...currentNames, character.name]);
      updateBookData("selectedCharacters", [...currentCharacters, character]);

      // If this is the first character, also set as primary child info for backward compatibility
      if (currentNames.length === 0) {
        updateBookData("child_name", character.name);
        updateBookData("child_age", character.age || 5);
        updateBookData("child_gender", character.gender || "neutral");
      }
    }
  };

  const handleAddNewChild = () => {
    if (!newChildName.trim()) return;

    const currentNames = bookData.childNames || [];
    if (!currentNames.includes(newChildName.trim())) {
      const newCharacter = {
        name: newChildName.trim(),
        primary_image_url: null,
        // NEW: Default age and gender from existing bookData if available, otherwise fallback
        age: bookData.child_age || 5,
        gender: bookData.child_gender || 'neutral'
      };

      updateBookData("childNames", [...currentNames, newCharacter.name]);
      updateBookData("selectedCharacters", [...(bookData.selectedCharacters || []), newCharacter]);

      // If this is the first character, also set as primary child info
      if (currentNames.length === 0) {
        updateBookData("child_name", newCharacter.name);
        updateBookData("child_age", newCharacter.age);
        updateBookData("child_gender", newCharacter.gender);
      }
    }
    setNewChildName("");
  };

  const handleRemoveChild = (nameToRemove) => {
    const currentNames = bookData.childNames || [];
    const currentCharacters = bookData.selectedCharacters || [];

    updateBookData("childNames", currentNames.filter(name => name !== nameToRemove));
    updateBookData("selectedCharacters", currentCharacters.filter(char => char.name !== nameToRemove));

    // If removing the primary child, update to next available or clear
    if (bookData.child_name === nameToRemove) {
      const remainingNames = currentNames.filter(name => name !== nameToRemove);
      if (remainingNames.length > 0) {
        const nextCharacter = (bookData.selectedCharacters || []).find(c => c.name === remainingNames[0]);
        updateBookData("child_name", remainingNames[0]);
        if (nextCharacter) {
            updateBookData("child_age", nextCharacter.age || "");
            updateBookData("child_gender", nextCharacter.gender || "neutral");
        }
      } else {
        updateBookData("child_name", "");
        updateBookData("child_age", "");
        updateBookData("child_gender", "neutral");
      }
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">
          {t("childInfo.title")}
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("childInfo.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Characters Section */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 font-semibold">
            <Users2 className="h-4 w-4 text-purple-500" />
            {t("childInfo.mainCharacters")}
          </Label>

          {/* Debug display */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            Debug: childNames = {JSON.stringify(bookData.childNames || [])}
            <br />
            child_name = {bookData.child_name || "empty"}
            <br />
            selectedCharacters = {JSON.stringify(bookData.selectedCharacters || [])}
          </div>

          {/* Display selected characters */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 dark:border-gray-700 rounded-md">
            {(bookData.childNames || []).map((name, index) => {
              const character = (bookData.selectedCharacters || []).find(char => char.name === name);
              return (
                <Badge key={index} variant="secondary" className={`flex items-center gap-2 p-2 ${
                  character ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {character && character.primary_image_url ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={character.primary_image_url} alt={name} />
                      <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{name}</span>
                  {character && character.age && (
                    <span className="text-xs opacity-75">({character.age})</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-200 dark:hover:bg-red-800 rounded-full"
                    onClick={() => handleRemoveChild(name)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}

            {/* Add new character input */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder={t("childInfo.characterName")}
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewChild();
                  }
                }}
                className="border-none shadow-none focus-visible:ring-0 h-8 px-0"
              />
              {newChildName && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddNewChild}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t("childInfo.addNew")}
                </Button>
              )}
            </div>
          </div>

          {/* Available Characters from Library */}
          {availableCharacters.filter(c => !(bookData.childNames || []).includes(c.name)).length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                {t("childInfo.myCharacters")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-52 overflow-y-auto p-1">
                {availableCharacters
                  .filter(character => !(bookData.childNames || []).includes(character.name))
                  .map((character, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border border-purple-200 dark:border-purple-800 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                      onClick={() => handleAddCharacter(character)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={character.primary_image_url} alt={character.name} />
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                          {character.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{character.name}</p>
                        <div className="flex gap-1 text-xs text-gray-500">
                          {character.age && <span>{character.age} {currentLanguage === "hebrew" ? "שנים" : "yrs"}</span>}
                          {character.gender && <span>• {character.gender}</span>}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-purple-500" />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Other details based on selected characters */}
        {(bookData.selectedCharacters || bookData.childNames || []).length > 0 && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="child_age">{t("childInfo.characterAge")}</Label>
                <Input
                  id="child_age"
                  type="number"
                  min="1"
                  max="99"
                  placeholder={(bookData.selectedCharacters?.[0]?.name || bookData.childNames?.[0]) || ""}
                  value={bookData.child_age || ""}
                  onChange={(e) => handleChange("child_age", parseInt(e.target.value) || "")}
                />
              </div>
              <div>
                <Label htmlFor="child_gender">{t("childInfo.characterGender")}</Label>
                <Select
                  value={bookData.child_gender || "neutral"}
                  onValueChange={(value) => handleChange("child_gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("childInfo.neutral")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy">{t("childInfo.boy")}</SelectItem>
                    <SelectItem value="girl">{t("childInfo.girl")}</SelectItem>
                    <SelectItem value="neutral">{t("childInfo.neutral")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="interests">{t("childInfo.interests")}</Label>
              <Textarea
                id="interests"
                placeholder={t("childInfo.interestsPlaceholder")}
                value={bookData.interests || ""}
                onChange={(e) => handleChange("interests", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="family_members">{t("childInfo.familyMembers")}</Label>
              <Textarea
                id="family_members"
                placeholder={t("childInfo.familyPlaceholder")}
                value={bookData.family_members || ""}
                onChange={(e) => handleChange("family_members", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
