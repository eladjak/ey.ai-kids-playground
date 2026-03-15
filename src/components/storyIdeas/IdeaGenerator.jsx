
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSafetyPromptPrefix } from "@/utils/content-moderation";
import { useI18n } from "@/components/i18n/i18nProvider";
import IdeaForm from "./IdeaForm";

/**
 * IdeaGenerator — Orchestrates story idea generation.
 * The form UI is delegated to IdeaForm; this component handles
 * data fetching (characters), AI invocation, and translations.
 */
export default function IdeaGenerator({
  ideaParams = {},
  onInputChange = () => {},
  onGenerate = () => {},
  existingChildrenNames = []
}) {
  const { t, isRTL, language } = useI18n();
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Individual input states for tag inputs
  const [newChildName, setNewChildName] = useState("");
  const [newThemeInput, setNewThemeInput] = useState("");
  const [newCharacterInput, setNewCharacterInput] = useState("");
  const [newSettingInput, setNewSettingInput] = useState("");
  const [newGenreInput, setNewGenreInput] = useState("");

  useEffect(() => {
    loadAvailableCharacters();
  }, []);

  const loadAvailableCharacters = async () => {
    try {
      const { Character } = await import('@/entities/Character');
      const characters = await Character.list("-created_date");
      setAvailableCharacters(characters);
    } catch {
      // silently handled
    }
  };

  const genreOptions = [
    { value: "adventure", label: t("ideaGenerator.genreAdventure"), labelEn: "adventure" },
    { value: "fairy_tale", label: t("ideaGenerator.genreFairyTale"), labelEn: "fairy_tale" },
    { value: "educational", label: t("ideaGenerator.genreEducational"), labelEn: "educational" },
    { value: "bedtime", label: t("ideaGenerator.genreBedtime"), labelEn: "bedtime" },
    { value: "fantasy", label: t("ideaGenerator.genreFantasy"), labelEn: "fantasy" },
    { value: "science", label: t("ideaGenerator.genreScience"), labelEn: "science" },
    { value: "animals", label: t("ideaGenerator.genreAnimals"), labelEn: "animals" },
    { value: "sports", label: t("ideaGenerator.genreSports"), labelEn: "sports" }
  ];

  const suggestedTags = {
    themes: {
      english: [
        { value: "friendship", display: "friendship" },
        { value: "courage", display: "courage" },
        { value: "learning", display: "learning" },
        { value: "kindness", display: "kindness" },
        { value: "discovery", display: "discovery" },
        { value: "magic", display: "magic" },
        { value: "nature", display: "nature" },
        { value: "family", display: "family" },
        { value: "sharing", display: "sharing" },
        { value: "honesty", display: "honesty" }
      ],
      hebrew: [
        { value: "friendship", display: "חברות" },
        { value: "courage", display: "אומץ" },
        { value: "learning", display: "למידה" },
        { value: "kindness", display: "נדיבות" },
        { value: "discovery", display: "תגלית" },
        { value: "magic", display: "קסם" },
        { value: "nature", display: "טבע" },
        { value: "family", display: "משפחה" },
        { value: "sharing", display: "שיתוף" },
        { value: "honesty", display: "כנות" }
      ]
    },
    characters: {
      english: [
        { value: "dragon", display: "dragon" },
        { value: "wizard", display: "wizard" },
        { value: "talking_animals", display: "talking animals" },
        { value: "robot", display: "robot" },
        { value: "princess", display: "princess" },
        { value: "superhero", display: "superhero" },
        { value: "fairy", display: "fairy" },
        { value: "pirate", display: "pirate" },
        { value: "astronaut", display: "astronaut" },
        { value: "detective", display: "detective" }
      ],
      hebrew: [
        { value: "dragon", display: "דרקון" },
        { value: "wizard", display: "קוסם" },
        { value: "talking_animals", display: "חיות מדברות" },
        { value: "robot", display: "רובוט" },
        { value: "princess", display: "נסיכה" },
        { value: "superhero", display: "גיבור-על" },
        { value: "fairy", display: "פיה" },
        { value: "pirate", display: "פיראט" },
        { value: "astronaut", display: "אסטרונאוט" },
        { value: "detective", display: "בלש" }
      ]
    },
    setting: {
      english: [
        { value: "forest", display: "forest" },
        { value: "space", display: "space" },
        { value: "underwater_city", display: "underwater city" },
        { value: "enchanted_castle", display: "enchanted castle" },
        { value: "future_city", display: "future city" },
        { value: "farm", display: "farm" },
        { value: "mountain", display: "mountain" },
        { value: "desert", display: "desert" },
        { value: "jungle", display: "jungle" },
        { value: "arctic", display: "arctic" }
      ],
      hebrew: [
        { value: "forest", display: "יער" },
        { value: "space", display: "חלל" },
        { value: "underwater_city", display: "עיר תת-ימית" },
        { value: "enchanted_castle", display: "טירה מכושפת" },
        { value: "future_city", display: "עיר עתידנית" },
        { value: "farm", display: "חווה" },
        { value: "mountain", display: "הר" },
        { value: "desert", display: "מדבר" },
        { value: "jungle", display: "ג'ונגל" },
        { value: "arctic", display: "הקוטב הצפוני" }
      ]
    }
  };

  const constructPromptForIdea = (params, targetLanguage) => {
    const languageInstruction = targetLanguage === "hebrew"
      ? "יש ליצור את כל התוכן בעברית בלבד. "
      : targetLanguage === "yiddish"
        ? "Create all content in Yiddish only. "
        : "Create all content in English only. ";

    const safetyPrefix = buildSafetyPromptPrefix(params.childAge || '5-10');
    let prompt = `${safetyPrefix}${languageInstruction}Create a detailed children's story idea with the following parameters:\n\n`;

    if (params.childNames && params.childNames.length > 0) {
      prompt += `Main characters: ${params.childNames.join(', ')}\n`;
    }
    if (params.childAge) {
      prompt += `Target age: ${params.childAge} years old\n`;
    }

    const allGenres = [];
    if (params.genres && params.genres.length > 0) {
      params.genres.forEach(gValue => {
        const genreOpt = genreOptions.find(opt => opt.labelEn === gValue);
        allGenres.push(genreOpt ? genreOpt.label : gValue);
      });
    }
    if (params.customGenres && params.customGenres.length > 0) {
      allGenres.push(...params.customGenres.map(cg => typeof cg === 'string' ? cg : cg.display));
    }
    if (allGenres.length > 0) prompt += `Genre: ${allGenres.join(', ')}\n`;

    if (params.themes && params.themes.length > 0) {
      prompt += `Themes: ${params.themes.map(th => typeof th === 'string' ? th : th.display).join(', ')}\n`;
    }
    if (params.characters && params.characters.length > 0) {
      prompt += `Additional characters: ${params.characters.map(c => typeof c === 'string' ? c : c.display).join(', ')}\n`;
    }
    if (params.setting && params.setting.length > 0) {
      prompt += `Setting: ${params.setting.map(s => typeof s === 'string' ? s : s.display).join(', ')}\n`;
    }
    if (params.additionalDetails) {
      prompt += `Additional details: ${params.additionalDetails}\n`;
    }

    prompt += `\nPlease provide:\n1. A catchy, age-appropriate title\n2. A brief but engaging description (2-3 sentences)\n3. 3-5 key plot points that create a complete story arc\n4. Character development opportunities\n5. A clear moral lesson or educational value\n\nMake sure everything is appropriate for children and engaging for the target age group.`;
    return prompt;
  };

  const handleGenerateIdea = async () => {
    if (!onGenerate) return;
    try {
      setIsGenerating(true);
      const targetLanguage = language;
      const prompt = constructPromptForIdea(ideaParams, targetLanguage);

      const { InvokeLLM } = await import('@/integrations/Core');
      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            plot_points: { type: "array", items: { type: "string" } },
            character_development: { type: "string" },
            moral_lesson: { type: "string" }
          },
          required: ["title", "description", "plot_points", "moral_lesson"]
        }
      });

      if (result) {
        const ideaWithMetadata = {
          ...result,
          language: targetLanguage,
          parameters: JSON.stringify(ideaParams),
          plot_points: Array.isArray(result.plot_points) ? result.plot_points : [result.plot_points]
        };
        onGenerate(ideaWithMetadata);
      }
    } catch {
      // silently handled
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mb-6" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader className={isRTL ? "text-right" : "text-left"}>
        <CardTitle className="text-xl text-gray-900 dark:text-white">
          {t("ideaGenerator.title")}
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400">
          {t("ideaGenerator.description")}
        </p>
      </CardHeader>

      <CardContent>
        <IdeaForm
          ideaParams={ideaParams}
          onInputChange={onInputChange}
          onGenerate={handleGenerateIdea}
          availableCharacters={availableCharacters}
          isGenerating={isGenerating}
          showMoreOptions={showMoreOptions}
          onToggleMoreOptions={() => setShowMoreOptions(!showMoreOptions)}
          genreOptions={genreOptions}
          suggestedTags={suggestedTags}
          newChildName={newChildName}
          setNewChildName={setNewChildName}
          newThemeInput={newThemeInput}
          setNewThemeInput={setNewThemeInput}
          newCharacterInput={newCharacterInput}
          setNewCharacterInput={setNewCharacterInput}
          newSettingInput={newSettingInput}
          setNewSettingInput={setNewSettingInput}
          newGenreInput={newGenreInput}
          setNewGenreInput={setNewGenreInput}
        />
      </CardContent>
    </Card>
  );
}
