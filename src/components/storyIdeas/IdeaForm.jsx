
import React, { useCallback } from "react";
import { Wand2, Loader2, Lightbulb, X, Plus, ChevronDown, ChevronUp, Users2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/components/i18n/i18nProvider";

/**
 * IdeaForm — The form section of the IdeaGenerator.
 * Handles all user inputs: characters, age, genres, themes, settings, and the generate button.
 * Extracted from IdeaGenerator for size and reusability.
 */
const IdeaForm = React.memo(function IdeaForm({
  ideaParams = {},
  onInputChange = () => {},
  onGenerate = () => {},
  availableCharacters = [],
  isGenerating = false,
  showMoreOptions = false,
  onToggleMoreOptions = () => {},
  genreOptions = [],
  suggestedTags = {},
  // Individual input states — controlled from parent to avoid closure stale-state
  newChildName,
  setNewChildName,
  newThemeInput,
  setNewThemeInput,
  newCharacterInput,
  setNewCharacterInput,
  newSettingInput,
  setNewSettingInput,
  newGenreInput,
  setNewGenreInput,
}) {
  const { t, isRTL, language } = useI18n();
  const handleGenreToggle = (genreValue, isChecked) => {
    const currentGenres = ideaParams.genres || [];
    const newGenres = isChecked
      ? [...currentGenres, genreValue]
      : currentGenres.filter(g => g !== genreValue);
    onInputChange("genres", newGenres);
  };

  const handleAddTag = useCallback((field, tagValue, tagDisplay) => {
    if (!tagValue || !tagValue.trim()) return;
    const currentTags = ideaParams[field] || [];
    const normalizedTag = tagValue.trim().toLowerCase();
    if (!currentTags.some(tag =>
      (typeof tag === 'string' ? tag : tag.value) === normalizedTag
    )) {
      const newTag = { value: normalizedTag, display: tagDisplay || tagValue.trim() };
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

  const handleTagInput = useCallback((e, field, value, inputSetter) => {
    inputSetter(value);

    const processAndAddTag = (tagToAdd) => {
      if (!tagToAdd.trim()) return;
      if (field === "childNames") {
        const currentNames = ideaParams.childNames || [];
        const normalizedName = tagToAdd.trim();
        if (!currentNames.includes(normalizedName)) {
          onInputChange("childNames", [...currentNames, normalizedName]);
        }
      } else {
        handleAddTag(field, tagToAdd.trim(), tagToAdd.trim());
      }
    };

    if (value.endsWith(',')) {
      if (e) e.preventDefault();
      const tag = value.slice(0, -1).trim();
      if (tag) processAndAddTag(tag);
      inputSetter('');
    } else if (e && e.key === 'Enter') {
      e.preventDefault();
      const tag = value.trim();
      if (tag) processAndAddTag(tag);
      inputSetter('');
    }
  }, [ideaParams, onInputChange, handleAddTag]);

  // Tag Input Sub-Component
  const TagInput = ({ field, label, placeholder, suggestions = [], inputValue, setInputValue }) => (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
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
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
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
  );

  return (
    <div className="space-y-6">
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
                character
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
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
              placeholder={t("ideaGenerator.childNamesPlaceholder")}
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
          {t("ideaGenerator.childNamesHelp")}
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
              className={`cursor-pointer transition-colors ${
                ideaParams.childAge === age
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
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
                className={`cursor-pointer transition-colors flex items-center gap-1.5 ${
                  isChecked
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleGenreToggle(genre.labelEn, !isChecked)}
              >
                <div className={`w-2 h-2 rounded-full ${isChecked ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                {genre.label}
              </Badge>
            );
          })}
        </div>

        <TagInput
          field="customGenres"
          label=""
          placeholder={t("ideaGenerator.customGenresPlaceholder")}
          suggestions={[]}
          inputValue={newGenreInput}
          setInputValue={setNewGenreInput}
        />
      </div>

      {/* Additional Details */}
      <div className="space-y-2">
        <Label htmlFor="details">{t("ideaGenerator.additional")}</Label>
        <Textarea
          id="details"
          placeholder={t("ideaGenerator.additionalPlaceholder")}
          value={ideaParams.additionalDetails || ""}
          onChange={(e) => onInputChange("additionalDetails", e.target.value)}
          className={isRTL ? "text-right" : ""}
        />
      </div>

      {/* More Options Toggle */}
      <Button
        type="button"
        variant="ghost"
        className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onToggleMoreOptions}
      >
        {showMoreOptions ? (
          <>
            <ChevronUp className="h-4 w-4" />
            {t("ideaGenerator.lessOptions")}
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            {t("ideaGenerator.moreOptions")}
          </>
        )}
      </Button>

      {showMoreOptions && (
        <div className="space-y-6 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Themes */}
          <TagInput
            field="themes"
            label={t("ideaGenerator.themes")}
            placeholder={t("ideaGenerator.themesPlaceholder")}
            suggestions={suggestedTags.themes?.[language] || suggestedTags.themes?.english || []}
            inputValue={newThemeInput}
            setInputValue={setNewThemeInput}
          />

          {/* Characters */}
          <TagInput
            field="characters"
            label={t("ideaGenerator.characters")}
            placeholder={t("ideaGenerator.charactersPlaceholder")}
            suggestions={[
              ...availableCharacters.map(c => ({
                display: c.name,
                value: c.name.toLowerCase()
              })),
              ...(suggestedTags.characters?.[language] || suggestedTags.characters?.english || [])
                .filter(sugItem => !availableCharacters.some(ac => ac.name.toLowerCase() === sugItem.value.toLowerCase()))
            ]}
            inputValue={newCharacterInput}
            setInputValue={setNewCharacterInput}
          />

          {/* Settings */}
          <TagInput
            field="setting"
            label={t("ideaGenerator.setting")}
            placeholder={t("ideaGenerator.settingPlaceholder")}
            suggestions={suggestedTags.setting?.[language] || suggestedTags.setting?.english || []}
            inputValue={newSettingInput}
            setInputValue={setNewSettingInput}
          />
        </div>
      )}

      {/* Generate Button */}
      <div className="pt-4 flex flex-wrap gap-3">
        <Button
          onClick={onGenerate}
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
              } catch {
                // silently handled
              }
            }}
          >
            <Lightbulb className="h-4 w-4" />
            {t("ideaGenerator.useDailyPrompt")}
          </Button>
        )}
      </div>
    </div>
  );
});

export default IdeaForm;
