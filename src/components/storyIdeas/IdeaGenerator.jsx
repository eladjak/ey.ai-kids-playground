
import React, { useState, useEffect, useCallback } from "react";
import { Wand2, Loader2, Lightbulb, X, Plus, ChevronDown, Users2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function IdeaGenerator({
  ideaParams = {},
  onInputChange = () => {},
  onGenerate = () => {},
  currentLanguage = "english",
  isRTL = false,
  existingChildrenNames = []
}) {
  console.log("IdeaGenerator rendered with ideaParams:", ideaParams); // Debug log

  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Individual input states to avoid re-render issues
  const [newChildName, setNewChildName] = useState("");
  const [newThemeInput, setNewThemeInput] = useState("");
  const [newCharacterInput, setNewCharacterInput] = useState("");
  const [newSettingInput, setNewSettingInput] = useState("");
  const [newGenreInput, setNewGenreInput] = useState("");

  // Load characters when component mounts
  useEffect(() => {
    loadAvailableCharacters();
  }, []);

  const loadAvailableCharacters = async () => {
    try {
      const { Character } = await import('@/entities/Character');
      const characters = await Character.list("-created_date");
      setAvailableCharacters(characters);
    } catch (error) {
      console.error("Failed to load characters:", error);
    }
  };

  const translations = {
    english: {
      "ideaGenerator.title": "Story Idea Generator",
      "ideaGenerator.description": "Generate creative story ideas for your children's book",
      "ideaGenerator.childNames": "Main Characters",
      "ideaGenerator.childNames.placeholder": "Add character name...",
      "ideaGenerator.childNames.help": "Add one or more characters who will be the main characters in the story",
      "ideaGenerator.existingChildren": "Your existing characters:",
      "ideaGenerator.myCharacters": "My Characters",
      "ideaGenerator.childAge": "Age Range",
      "ideaGenerator.genres": "Story Genres",
      "ideaGenerator.genres.placeholder": "Select genres",
      "ideaGenerator.genre.adventure": "Adventure",
      "ideaGenerator.genre.fairyTale": "Fairy Tale",
      "ideaGenerator.genre.educational": "Educational",
      "ideaGenerator.genre.bedtime": "Bedtime",
      "ideaGenerator.genre.fantasy": "Fantasy",
      "ideaGenerator.genre.science": "Science",
      "ideaGenerator.genre.animals": "Animals",
      "ideaGenerator.genre.sports": "Sports",
      "ideaGenerator.themes": "Themes",
      "ideaGenerator.themes.placeholder": "Add themes...",
      "ideaGenerator.characters": "Characters",
      "ideaGenerator.characters.placeholder": "Add characters...",
      "ideaGenerator.setting": "Settings",
      "ideaGenerator.setting.placeholder": "Add settings...",
      "ideaGenerator.additional": "Additional Details (Optional)",
      "ideaGenerator.additional.placeholder": "Any other preferences or details",
      "ideaGenerator.generate": "Generate Idea",
      "ideaGenerator.generating": "Generating...",
      "ideaGenerator.useDailyPrompt": "Use Today's Prompt",
      "ideaGenerator.addTag": "Add",
      "ideaGenerator.suggestedTags": "Suggested:",
      "ideaGenerator.customGenres.placeholder": "Add custom genres..."
    },
    hebrew: {
      "ideaGenerator.title": "מחולל רעיונות לסיפור",
      "ideaGenerator.description": "יצירת רעיונות יצירתיים לספר הילדים שלך",
      "ideaGenerator.childNames": "דמויות ראשיות",
      "ideaGenerator.childNames.placeholder": "הוסף שם דמות...",
      "ideaGenerator.childNames.help": "הוסף דמות אחת או יותר שיהיו הדמויות הראשיות בסיפור",
      "ideaGenerator.existingChildren": "הדמויות הקיימות שלך:",
      "ideaGenerator.myCharacters": "הדמויות שלי",
      "ideaGenerator.childAge": "טווח גילאים",
      "ideaGenerator.genres": "ז'אנרי הסיפור",
      "ideaGenerator.genres.placeholder": "בחר ז'אנרים",
      "ideaGenerator.genre.adventure": "הרפתקה",
      "ideaGenerator.genre.fairyTale": "אגדה",
      "ideaGenerator.genre.educational": "חינוכי",
      "ideaGenerator.genre.bedtime": "לפני השינה",
      "ideaGenerator.genre.fantasy": "פנטזיה",
      "ideaGenerator.genre.science": "מדע",
      "ideaGenerator.genre.animals": "חיות",
      "ideaGenerator.genre.sports": "ספורט",
      "ideaGenerator.themes": "נושאים",
      "ideaGenerator.themes.placeholder": "הוסף נושאים...",
      "ideaGenerator.characters": "דמויות",
      "ideaGenerator.characters.placeholder": "הוסף דמויות...",
      "ideaGenerator.setting": "סביבות",
      "ideaGenerator.setting.placeholder": "הוסף סביבות...",
      "ideaGenerator.additional": "פרטים נוספים (אופציונלי)",
      "ideaGenerator.additional.placeholder": "העדפות או פרטים נוספים",
      "ideaGenerator.generate": "צור רעיון",
      "ideaGenerator.generating": "יוצר רעיון...",
      "ideaGenerator.useDailyPrompt": "השתמש ברעיון היומי",
      "ideaGenerator.addTag": "הוסף",
      "ideaGenerator.suggestedTags": "הצעות:",
      "ideaGenerator.customGenres.placeholder": "הוסף ז'אנרים מותאמים אישית..."
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  // Re-define genreOptions inside component to ensure t() is ready
  const genreOptions = [
    { value: "adventure", label: t("ideaGenerator.genre.adventure"), labelEn: "adventure" },
    { value: "fairy_tale", label: t("ideaGenerator.genre.fairyTale"), labelEn: "fairy_tale" },
    { value: "educational", label: t("ideaGenerator.genre.educational"), labelEn: "educational" },
    { value: "bedtime", label: t("ideaGenerator.genre.bedtime"), labelEn: "bedtime" },
    { value: "fantasy", label: t("ideaGenerator.genre.fantasy"), labelEn: "fantasy" },
    { value: "science", label: t("ideaGenerator.genre.science"), labelEn: "science" },
    { value: "animals", label: t("ideaGenerator.genre.animals"), labelEn: "animals" },
    { value: "sports", label: t("ideaGenerator.genre.sports"), labelEn: "sports" }
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

  const handleGenreToggle = (genreValue, isChecked) => {
    const currentGenres = ideaParams.genres || [];
    let newGenres;

    if (isChecked) {
      newGenres = [...currentGenres, genreValue];
    } else {
      newGenres = currentGenres.filter(g => g !== genreValue);
    }
    onInputChange("genres", newGenres);
  };

  // Fixed tag handling with stable references
  const handleAddTag = useCallback((field, tagValue, tagDisplay) => {
    if (!tagValue || !tagValue.trim()) return;

    const currentTags = ideaParams[field] || [];
    const normalizedTag = tagValue.trim().toLowerCase();

    if (!currentTags.some(tag => 
      (typeof tag === 'string' ? tag : tag.value) === normalizedTag
    )) {
      const newTag = {
        value: normalizedTag,
        display: tagDisplay || tagValue.trim()
      };
      onInputChange(field, [...currentTags, newTag]);
    }
  }, [ideaParams, onInputChange]);

  const handleRemoveTag = useCallback((field, tagToRemoveValue) => {
    const currentTags = ideaParams[field] || [];
    onInputChange(field, currentTags.filter(tag => 
      typeof tag === 'string' ? tag !== tagToRemoveValue : tag.value !== tagToRemoveValue
    ));
  }, [ideaParams, onInputChange]);

  const handleAddCharacterAsChild = useCallback((character) => {
    const currentNames = ideaParams.childNames || [];
    if (!currentNames.includes(character.name)) {
      onInputChange("childNames", [...currentNames, character.name]);
      const currentCharacters = ideaParams.selectedCharacters || [];
      onInputChange("selectedCharacters", [...currentCharacters, character]);
    }
  }, [ideaParams.childNames, ideaParams.selectedCharacters, onInputChange]);

  const handleRemoveChildName = useCallback((nameToRemove) => {
    const currentNames = ideaParams.childNames || [];
    const currentCharacters = ideaParams.selectedCharacters || [];

    onInputChange("childNames", currentNames.filter(name => name !== nameToRemove));
    onInputChange("selectedCharacters", currentCharacters.filter(char => char.name !== nameToRemove));
  }, [ideaParams.childNames, ideaParams.selectedCharacters, onInputChange]);

  // Handle comma-separated input and Enter key
  const handleTagInput = useCallback((e, field, value, inputSetter) => {
    inputSetter(value); // Always update the input state

    const processAndAddTag = (tagToAdd) => {
      if (!tagToAdd.trim()) return;

      if (field === "childNames") {
        const currentNames = ideaParams.childNames || [];
        const normalizedName = tagToAdd.trim();
        if (!currentNames.includes(normalizedName)) {
          onInputChange("childNames", [...currentNames, normalizedName]);
        }
      } else {
        // For other fields, use the object structure via handleAddTag
        handleAddTag(field, tagToAdd.trim(), tagToAdd.trim());
      }
    };

    // Handle comma-separated input
    if (value.endsWith(',')) {
      if (e) e.preventDefault(); // Prevent default if it's a keyboard event
      const tag = value.slice(0, -1).trim();
      if (tag) {
        processAndAddTag(tag);
      }
      inputSetter(''); // Clear the input after adding
    } 
    // Handle Enter key press
    else if (e && e.key === 'Enter') { // Only trigger on Enter key press
      e.preventDefault(); // Prevent form submission or newline
      const tag = value.trim();
      if (tag) {
        processAndAddTag(tag);
      }
      inputSetter(''); // Clear the input after adding
    }
  }, [ideaParams, onInputChange, handleAddTag]);

  // Tag Input Component with fixed state management
  const TagInput = ({ field, label, placeholder, suggestions = [], inputValue, setInputValue }) => {
    console.log(`TagInput rendered for field: ${field}, inputValue: ${inputValue}`); // Debug log
    
    return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 dark:border-gray-700 rounded-md">
        {(ideaParams[field] || []).map((tag, index) => {
          const displayValue = typeof tag === 'string' ? tag : tag.display;
          const tagValue = typeof tag === 'string' ? tag : tag.value;
          
          return (
            <Badge key={`${field}-${index}`} variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {displayValue}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-purple-200 dark:hover:bg-purple-800"
                onClick={() => handleRemoveTag(field, tagValue)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}

        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              console.log(`Input changed for ${field}:`, e.target.value); // Debug log
              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                console.log(`Enter pressed for ${field} with value:`, inputValue); // Debug log
                e.preventDefault();
                handleAddTag(field, inputValue.trim(), inputValue.trim());
                setInputValue('');
              }
            }}
            className="border-none shadow-none focus-visible:ring-0 h-8 px-0"
          />
          {inputValue && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                console.log(`Add button clicked for ${field} with value:`, inputValue); // Debug log
                handleAddTag(field, inputValue.trim(), inputValue.trim());
                setInputValue('');
              }}
              className="h-6 px-2 text-xs"
            >
              {t("ideaGenerator.addTag")}
            </Button>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("ideaGenerator.suggestedTags")}</p>
          <div className="flex flex-wrap gap-1">
            {suggestions
              .filter(item => !(ideaParams[field] || []).some(tag => 
                (typeof tag === 'string' ? tag : tag.value) === item.value
              ))
              .slice(0, 8)
              .map((item, index) => (
                <Badge
                  key={`${field}-suggestion-${index}`}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
                  onClick={() => handleAddTag(field, item.value, item.display)}
                >
                  <Plus className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {item.display}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  )};

  const handleGenerateIdea = async () => {
    console.log("handleGenerateIdea called with ideaParams:", ideaParams); // Debug log
    
    if (!onGenerate) {
      console.error("onGenerate prop is missing!");
      return;
    }
    
    try {
      setIsGenerating(true);
      const targetLanguage = currentLanguage;
      const prompt = constructPromptForIdea(ideaParams, targetLanguage);
      
      console.log("Generated prompt:", prompt); // Debug log
      console.log("Target language:", targetLanguage); // Debug log
      
      const { InvokeLLM } = await import('@/integrations/Core');
      
      const result = await InvokeLLM({
        prompt: prompt,
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

      console.log("LLM result:", result); // Debug log

      if (result) {
        const ideaWithMetadata = {
          ...result,
          language: targetLanguage,
          parameters: JSON.stringify(ideaParams),
          plot_points: Array.isArray(result.plot_points) ? result.plot_points : [result.plot_points]
        };
        
        console.log("Calling onGenerate with:", ideaWithMetadata); // Debug log
        onGenerate(ideaWithMetadata);
      }
    } catch (error) {
      console.error("Error generating story idea:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to construct language-appropriate prompt
  const constructPromptForIdea = (params, targetLanguage) => {
    const languageInstruction = targetLanguage === "hebrew" ? 
      "יש ליצור את כל התוכן בעברית בלבד. " : 
      targetLanguage === "yiddish" ? 
      "Create all content in Yiddish only. " :
      "Create all content in English only. ";
    
    let prompt = `${languageInstruction}Create a detailed children's story idea with the following parameters:\n\n`;
    
    if (params.childNames && params.childNames.length > 0) {
      prompt += `Main characters: ${params.childNames.join(', ')}\n`;
    }
    
    if (params.childAge) {
      prompt += `Target age: ${params.childAge} years old\n`;
    }
    
    const allGenres = [];
    if (params.genres && params.genres.length > 0) {
        // Find label for English genre values
        params.genres.forEach(gValue => {
            const genreOpt = genreOptions.find(opt => opt.labelEn === gValue);
            if (genreOpt) {
                allGenres.push(genreOpt.label); // Use translated label
            } else {
                allGenres.push(gValue); // Fallback if not found in options (shouldn't happen for fixed options)
            }
        });
    }
    if (params.customGenres && params.customGenres.length > 0) {
        allGenres.push(...params.customGenres.map(cg => typeof cg === 'string' ? cg : cg.display));
    }
    if (allGenres.length > 0) {
        prompt += `Genre: ${allGenres.join(', ')}\n`;
    }
    
    if (params.themes && params.themes.length > 0) {
      prompt += `Themes: ${params.themes.map(t => typeof t === 'string' ? t : t.display).join(', ')}\n`;
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

      <CardContent className="space-y-6">
        {/* Children Names Section */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-purple-500" />
            {t("ideaGenerator.childNames")}
          </Label>

          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 dark:border-gray-700 rounded-md">
            {(ideaParams.childNames || []).map((name, index) => {
              const character = (ideaParams.selectedCharacters || []).find(char => char.name === name);
              return (
                <Badge key={`child-${index}`} variant="secondary" className={`flex items-center gap-1 ${
                  character ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {character && character.primary_image_url && (
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={character.primary_image_url} alt={name} />
                      <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  {name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-purple-200 dark:hover:bg-purple-800"
                    onClick={() => handleRemoveChildName(name)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder={t("ideaGenerator.childNames.placeholder")}
                value={newChildName}
                onChange={(e) => handleTagInput(e, "childNames", e.target.value, setNewChildName)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTagInput(e, "childNames", newChildName, setNewChildName);
                  }
                }}
                className="border-none shadow-none focus-visible:ring-0 h-8 px-0"
              />
              {newChildName && (
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => handleTagInput(e, "childNames", newChildName + ',', setNewChildName)}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t("ideaGenerator.addTag")}
                </Button>
              )}
            </div>
          </div>

          {/* Available Characters from Character Library */}
          {availableCharacters.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                {t("ideaGenerator.myCharacters")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2">
                {availableCharacters
                  .filter(character => !(ideaParams.childNames || []).includes(character.name))
                  .slice(0, 6)
                  .map((character, index) => (
                    <div
                      key={`character-${character.id || index}`}
                      className="flex items-center gap-2 p-2 border border-purple-200 dark:border-purple-800 rounded-md cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      onClick={() => handleAddCharacterAsChild(character)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={character.primary_image_url} alt={character.name} />
                        <AvatarFallback className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                          {character.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{character.name}</span>
                      {character.age && (
                        <Badge variant="outline" className="text-xs h-4">
                          {character.age}
                        </Badge>
                      )}
                      <Plus className="h-3 w-3 text-purple-500 ml-auto" />
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("ideaGenerator.childNames.help")}
          </p>
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label>{t("ideaGenerator.childAge")}</Label>
          <div className="flex flex-wrap gap-2">
            {["2-4", "5-7", "8-10", "11+"].map(age => (
              <Badge
                key={age}
                variant={ideaParams.childAge === age ? "secondary" : "outline"}
                className={`cursor-pointer transition-colors ${ideaParams.childAge === age ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => onInputChange("childAge", age)}
              >
                {age}
              </Badge>
            ))}
          </div>
        </div>

        {/* Story Genres */}
        <div className="space-y-2">
          <Label>{t("ideaGenerator.genres")}</Label>
          
          <div className="flex flex-wrap gap-2 mb-2 p-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-md min-h-[40px]">
            {genreOptions.map(genre => {
              const isChecked = (ideaParams.genres || []).includes(genre.labelEn);
              return (
                <Badge
                  key={genre.value}
                  variant={isChecked ? "secondary" : "outline"}
                  className={`cursor-pointer transition-colors flex items-center gap-1.5 ${isChecked ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => handleGenreToggle(genre.labelEn, !isChecked)}
                >
                  <div className={`w-2 h-2 rounded-full ${isChecked ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  {genre.label}
                </Badge>
              )
            })}
          </div>
          
          <TagInput
            field="customGenres"
            label=""
            placeholder={t("ideaGenerator.customGenres.placeholder")}
            suggestions={[]}
            inputValue={newGenreInput}
            setInputValue={setNewGenreInput}
          />
        </div>

        {/* Themes */}
        <TagInput
          field="themes"
          label={t("ideaGenerator.themes")}
          placeholder={t("ideaGenerator.themes.placeholder")}
          suggestions={suggestedTags.themes[currentLanguage] || suggestedTags.themes.english}
          inputValue={newThemeInput}
          setInputValue={setNewThemeInput}
        />

        {/* Characters */}
        <TagInput
          field="characters"
          label={t("ideaGenerator.characters")}
          placeholder={t("ideaGenerator.characters.placeholder")}
          suggestions={[
            ...availableCharacters.map(c => ({
              display: c.name,
              value: c.name.toLowerCase()
            })),
            ...(suggestedTags.characters[currentLanguage] || suggestedTags.characters.english)
              .filter(sugItem => !availableCharacters.some(ac => ac.name.toLowerCase() === sugItem.value.toLowerCase()))
          ]}
          inputValue={newCharacterInput}
          setInputValue={setNewCharacterInput}
        />

        {/* Settings */}
        <TagInput
          field="setting"
          label={t("ideaGenerator.setting")}
          placeholder={t("ideaGenerator.setting.placeholder")}
          suggestions={suggestedTags.setting[currentLanguage] || suggestedTags.setting.english}
          inputValue={newSettingInput}
          setInputValue={setNewSettingInput}
        />

        {/* Additional Details */}
        <div className="space-y-2">
          <Label htmlFor="details">{t("ideaGenerator.additional")}</Label>
          <Textarea
            id="details"
            placeholder={t("ideaGenerator.additional.placeholder")}
            value={ideaParams.additionalDetails || ""}
            onChange={(e) => onInputChange("additionalDetails", e.target.value)}
            className={isRTL ? "text-right" : ""}
          />
        </div>

        {/* Generate Button */}
        <div className="pt-4 flex flex-wrap gap-3">
          <Button
            onClick={handleGenerateIdea}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("ideaGenerator.generating")}
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                {t("ideaGenerator.generate")}
              </>
            )}
          </Button>

          {localStorage.getItem("dailyStoryPrompt") && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                try {
                  const dailyPrompt = JSON.parse(localStorage.getItem("dailyStoryPrompt"));
                  if (dailyPrompt && dailyPrompt.title) {
                    onInputChange("additionalDetails", dailyPrompt.title);
                  }
                } catch (e) {
                  console.error("Error using daily prompt", e);
                }
              }}
            >
              <Lightbulb className="h-4 w-4" />
              {t("ideaGenerator.useDailyPrompt")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
