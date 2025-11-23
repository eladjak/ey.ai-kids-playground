import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, Heart, Target, Sparkles, Lightbulb, Zap } from "lucide-react";

export default function CharacterProfile({ 
  character = {}, 
  onChange,
  onSave, 
  currentLanguage = "english",
  isRTL = false
}) {
  const [profile, setProfile] = useState({
    name: character.name || "",
    age: character.age || "",
    gender: character.gender || "neutral",
    personality: character.personality || [],
    strengths: character.strengths || "",
    weaknesses: character.weaknesses || "",
    goals: character.goals || "",
    fears: character.fears || "",
    interests: character.interests || "",
    appearance: character.appearance || "",
    backstory: character.backstory || "",
    relationships: character.relationships || "",
    growthDirection: character.growthDirection || "",
    traits: {
      bravery: character.traits?.bravery || 50,
      kindness: character.traits?.kindness || 50,
      curiosity: character.traits?.curiosity || 50,
      creativity: character.traits?.creativity || 50,
    }
  });

  // Translations
  const translations = {
    english: {
      title: "Character Development",
      subtitle: "Define the character's traits and development arc",
      basicInfo: "Basic Information",
      name: "Character Name",
      age: "Age",
      gender: "Gender",
      genderOptions: {
        boy: "Boy",
        girl: "Girl",
        neutral: "Neutral"
      },
      personality: "Personality Type",
      personalityTypes: {
        brave: "Brave",
        shy: "Shy",
        curious: "Curious",
        creative: "Creative",
        kind: "Kind",
        mischievous: "Mischievous",
        wise: "Wise",
        energetic: "Energetic"
      },
      traits: "Character Traits",
      bravery: "Bravery",
      kindness: "Kindness",
      curiosity: "Curiosity",
      creativity: "Creativity",
      low: "Low",
      medium: "Medium",
      high: "High",
      strengths: "Strengths",
      strengthsPlaceholder: "What is the character good at?",
      weaknesses: "Weaknesses",
      weaknessesPlaceholder: "What does the character struggle with?",
      goals: "Goals & Motivations",
      goalsPlaceholder: "What does the character want to achieve?",
      fears: "Fears & Challenges",
      fearsPlaceholder: "What is the character afraid of?",
      interests: "Interests & Hobbies",
      interestsPlaceholder: "What does the character like to do?",
      appearance: "Appearance",
      appearancePlaceholder: "Describe how the character looks",
      backstory: "Backstory",
      backstoryPlaceholder: "Brief background story",
      relationships: "Relationships",
      relationshipsPlaceholder: "Relationship with other characters",
      growth: "Character Growth",
      growthPlaceholder: "How will the character change during the story?",
      saveButton: "Save Character Profile"
    },
    hebrew: {
      title: "פיתוח דמות",
      subtitle: "הגדר את תכונות הדמות וקשת ההתפתחות שלה",
      basicInfo: "מידע בסיסי",
      name: "שם הדמות",
      age: "גיל",
      gender: "מגדר",
      genderOptions: {
        boy: "בן",
        girl: "בת",
        neutral: "ניטרלי"
      },
      personality: "סוג אישיות",
      personalityTypes: {
        brave: "אמיץ/ה",
        shy: "ביישן/ית",
        curious: "סקרן/ית",
        creative: "יצירתי/ת",
        kind: "טוב/ת לב",
        mischievous: "שובב/ה",
        wise: "חכם/ה",
        energetic: "אנרגטי/ת"
      },
      traits: "תכונות אופי",
      bravery: "אומץ",
      kindness: "טוב לב",
      curiosity: "סקרנות",
      creativity: "יצירתיות",
      low: "נמוך",
      medium: "בינוני",
      high: "גבוה",
      strengths: "חוזקות",
      strengthsPlaceholder: "במה הדמות טובה?",
      weaknesses: "חולשות",
      weaknessesPlaceholder: "עם מה הדמות מתקשה?",
      goals: "מטרות ומוטיבציות",
      goalsPlaceholder: "מה הדמות רוצה להשיג?",
      fears: "פחדים ואתגרים",
      fearsPlaceholder: "ממה הדמות פוחדת?",
      interests: "תחומי עניין ותחביבים",
      interestsPlaceholder: "מה הדמות אוהבת לעשות?",
      appearance: "מראה",
      appearancePlaceholder: "תאר איך הדמות נראית",
      backstory: "רקע",
      backstoryPlaceholder: "סיפור רקע קצר",
      relationships: "יחסים",
      relationshipsPlaceholder: "יחסים עם דמויות אחרות",
      growth: "התפתחות הדמות",
      growthPlaceholder: "איך הדמות תשתנה במהלך הסיפור?",
      saveButton: "שמור פרופיל דמות"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const handleChange = (field, value) => {
    setProfile(prev => {
      const newProfile = { ...prev, [field]: value };
      if (onChange) onChange(newProfile);
      return newProfile;
    });
  };

  const handleTraitChange = (trait, value) => {
    setProfile(prev => {
      const newProfile = { 
        ...prev, 
        traits: { 
          ...prev.traits, 
          [trait]: value[0] 
        } 
      };
      if (onChange) onChange(newProfile);
      return newProfile;
    });
  };

  const handlePersonalityChange = (type) => {
    const currentPersonality = [...profile.personality];
    const index = currentPersonality.indexOf(type);
    
    if (index === -1) {
      // Limit to 3 personality types
      if (currentPersonality.length < 3) {
        currentPersonality.push(type);
      }
    } else {
      currentPersonality.splice(index, 1);
    }
    
    handleChange("personality", currentPersonality);
  };

  return (
    <Card className="shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-purple-500" />
            {t("basicInfo")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input 
                value={profile.name} 
                onChange={e => handleChange("name", e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t("age")}</Label>
              <Input 
                value={profile.age} 
                onChange={e => handleChange("age", e.target.value)} 
                type="number" 
                min="1"
                max="18"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("gender")}</Label>
              <RadioGroup 
                value={profile.gender} 
                onValueChange={value => handleChange("gender", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="boy" id="gender-boy" />
                  <Label htmlFor="gender-boy">{t("genderOptions.boy")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="girl" id="gender-girl" />
                  <Label htmlFor="gender-girl">{t("genderOptions.girl")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="gender-neutral" />
                  <Label htmlFor="gender-neutral">{t("genderOptions.neutral")}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-500" />
            {t("personality")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries({
              brave: t("personalityTypes.brave"),
              shy: t("personalityTypes.shy"),
              curious: t("personalityTypes.curious"),
              creative: t("personalityTypes.creative"),
              kind: t("personalityTypes.kind"),
              mischievous: t("personalityTypes.mischievous"),
              wise: t("personalityTypes.wise"),
              energetic: t("personalityTypes.energetic")
            }).map(([type, label]) => (
              <div 
                key={type} 
                className={`border rounded p-3 cursor-pointer text-center transition-colors ${
                  profile.personality.includes(type) 
                    ? "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-400" 
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => handlePersonalityChange(type)}
              >
                {label}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isRTL ? "בחר עד 3 סוגי אישיות" : "Select up to 3 personality types"}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
            {t("traits")}
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t("bravery")}</Label>
                <span className="text-sm text-gray-500">
                  {profile.traits.bravery < 33 ? t("low") : profile.traits.bravery < 66 ? t("medium") : t("high")}
                </span>
              </div>
              <Slider
                value={[profile.traits.bravery]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleTraitChange("bravery", value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t("kindness")}</Label>
                <span className="text-sm text-gray-500">
                  {profile.traits.kindness < 33 ? t("low") : profile.traits.kindness < 66 ? t("medium") : t("high")}
                </span>
              </div>
              <Slider
                value={[profile.traits.kindness]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleTraitChange("kindness", value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t("curiosity")}</Label>
                <span className="text-sm text-gray-500">
                  {profile.traits.curiosity < 33 ? t("low") : profile.traits.curiosity < 66 ? t("medium") : t("high")}
                </span>
              </div>
              <Slider
                value={[profile.traits.curiosity]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleTraitChange("curiosity", value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t("creativity")}</Label>
                <span className="text-sm text-gray-500">
                  {profile.traits.creativity < 33 ? t("low") : profile.traits.creativity < 66 ? t("medium") : t("high")}
                </span>
              </div>
              <Slider
                value={[profile.traits.creativity]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleTraitChange("creativity", value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t("strengths")}</Label>
            <Textarea 
              placeholder={t("strengthsPlaceholder")}
              value={profile.strengths}
              onChange={e => handleChange("strengths", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("weaknesses")}</Label>
            <Textarea 
              placeholder={t("weaknessesPlaceholder")}
              value={profile.weaknesses}
              onChange={e => handleChange("weaknesses", e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5 text-blue-500" />
            {t("goals")}
          </h3>
          <Textarea 
            placeholder={t("goalsPlaceholder")}
            value={profile.goals}
            onChange={e => handleChange("goals", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t("fears")}</Label>
            <Textarea 
              placeholder={t("fearsPlaceholder")}
              value={profile.fears}
              onChange={e => handleChange("fears", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("interests")}</Label>
            <Textarea 
              placeholder={t("interestsPlaceholder")}
              value={profile.interests}
              onChange={e => handleChange("interests", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t("appearance")}</Label>
            <Textarea 
              placeholder={t("appearancePlaceholder")}
              value={profile.appearance}
              onChange={e => handleChange("appearance", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("backstory")}</Label>
            <Textarea 
              placeholder={t("backstoryPlaceholder")}
              value={profile.backstory}
              onChange={e => handleChange("backstory", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t("relationships")}</Label>
            <Textarea 
              placeholder={t("relationshipsPlaceholder")}
              value={profile.relationships}
              onChange={e => handleChange("relationships", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("growth")}</Label>
            <Textarea 
              placeholder={t("growthPlaceholder")}
              value={profile.growthDirection}
              onChange={e => handleChange("growthDirection", e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={() => onSave && onSave(profile)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {t("saveButton")}
        </Button>
      </CardContent>
    </Card>
  );
}