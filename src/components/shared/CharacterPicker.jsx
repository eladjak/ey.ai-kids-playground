import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, UserPlus, User, BookOpen } from "lucide-react";
import useCharacterSelector from "@/hooks/useCharacterSelector";

const CHARACTER_TEMPLATES = [
  { id: "brave_hero", emoji: "🦸", en: "Brave Hero", he: "גיבור אמיץ", traits: "brave, kind, helpful" },
  { id: "smart_detective", emoji: "🔍", en: "Smart Detective", he: "בלש חכם", traits: "clever, curious, observant" },
  { id: "friendly_animal", emoji: "🐻", en: "Friendly Animal", he: "חיה ידידותית", traits: "loyal, playful, gentle" },
  { id: "magical_fairy", emoji: "🧚", en: "Magical Fairy", he: "פיה קסומה", traits: "magical, cheerful, wise" },
  { id: "space_explorer", emoji: "🚀", en: "Space Explorer", he: "חוקר חלל", traits: "adventurous, scientific, brave" },
  { id: "princess", emoji: "👸", en: "Princess", he: "נסיכה", traits: "kind, wise, resourceful" },
  { id: "pirate", emoji: "🏴‍☠️", en: "Pirate", he: "פיראט", traits: "adventurous, clever, bold" },
  { id: "robot", emoji: "🤖", en: "Robot Friend", he: "חבר רובוט", traits: "smart, helpful, funny" },
  { id: "dragon", emoji: "🐉", en: "Friendly Dragon", he: "דרקון ידידותי", traits: "strong, protective, warm" },
  { id: "wizard", emoji: "🧙", en: "Wizard", he: "קוסם", traits: "wise, powerful, mentoring" },
];

const templateVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.2 }
  })
};

/**
 * CharacterPicker - Unified character selection with:
 * 1. "My Characters" - loaded from Character entities
 * 2. "Quick Templates" - emoji-based templates
 * 3. "Add Custom" - inline custom character name
 */
export default function CharacterPicker({
  selectedCharacters,
  onCharactersChange,
  isRTL,
  language
}) {
  const isHebrew = language === "hebrew";
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCharacterName, setCustomCharacterName] = useState("");
  const { savedCharacters, isLoading, entityToSelection } = useCharacterSelector();

  const toggleCharacter = (charSelection) => {
    const exists = selectedCharacters.find((c) => c.id === charSelection.id);
    if (exists) {
      onCharactersChange(selectedCharacters.filter((c) => c.id !== charSelection.id));
    } else {
      onCharactersChange([...selectedCharacters, charSelection]);
    }
  };

  const toggleTemplate = (template) => {
    const charSelection = {
      id: template.id,
      name: isHebrew ? template.he : template.en,
      traits: template.traits,
      emoji: template.emoji,
      avatar: null,
      isTemplate: true,
      isEntity: false,
    };
    toggleCharacter(charSelection);
  };

  const toggleEntity = (entity) => {
    const charSelection = entityToSelection(entity);
    toggleCharacter(charSelection);
  };

  const addCustomCharacter = () => {
    if (!customCharacterName.trim()) return;
    const customChar = {
      id: `custom_${Date.now()}`,
      name: customCharacterName.trim(),
      traits: "",
      emoji: "🧑",
      avatar: null,
      isTemplate: false,
      isEntity: false,
    };
    onCharactersChange([...selectedCharacters, customChar]);
    setCustomCharacterName("");
    setShowCustomInput(false);
  };

  const removeCharacter = (charId) => {
    onCharactersChange(selectedCharacters.filter((c) => c.id !== charId));
  };

  const hasSavedCharacters = savedCharacters.length > 0;

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isHebrew ? "מי יהיו הדמויות?" : "Who are the characters?"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {isHebrew ? "בחר מהדמויות שלך, מהתבניות, או צור חדש" : "Pick from your characters, templates, or create new"}
        </p>
      </div>

      {/* My Characters section */}
      {isLoading ? (
        <div>
          <Label className="text-sm font-semibold mb-3 block text-purple-700 dark:text-purple-300">
            {isHebrew ? "הדמויות שלי" : "My Characters"}
          </Label>
          <div className="flex gap-3">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
      ) : hasSavedCharacters ? (
        <div>
          <Label className="text-sm font-semibold mb-3 block text-purple-700 dark:text-purple-300">
            <BookOpen className="inline h-4 w-4 mr-1" aria-hidden="true" />
            {isHebrew ? "הדמויות שלי" : "My Characters"}
          </Label>
          <div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
            role="group"
            aria-label={isHebrew ? "הדמויות שלי" : "My Characters"}
          >
            {savedCharacters.map((entity) => {
              const selectionId = `entity_${entity.id}`;
              const isSelected = selectedCharacters.some((c) => c.id === selectionId);
              return (
                <motion.button
                  key={entity.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleEntity(entity)}
                  aria-pressed={isSelected}
                  aria-label={entity.name}
                  className={`
                    flex flex-col items-center p-3 rounded-xl transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? "bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-500 shadow-md"
                      : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }
                  `}
                >
                  <Avatar className="h-12 w-12 mb-2 border-2 border-purple-100 dark:border-purple-900">
                    <AvatarImage src={entity.primary_image_url} alt={entity.name} />
                    <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-center line-clamp-1">
                    {entity.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Quick Templates */}
      <div>
        <Label className="text-sm font-semibold mb-3 block text-gray-600 dark:text-gray-400">
          {isHebrew ? "תבניות מהירות" : "Quick Templates"}
        </Label>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
          role="group"
          aria-label={isHebrew ? "תבניות דמויות" : "Character templates"}
        >
          {CHARACTER_TEMPLATES.map((template, index) => {
            const isSelected = selectedCharacters.some((c) => c.id === template.id);
            return (
              <motion.button
                key={template.id}
                custom={index}
                variants={templateVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTemplate(template)}
                aria-pressed={isSelected}
                aria-label={isHebrew ? template.he : template.en}
                className={`
                  flex flex-col items-center p-3 md:p-4 rounded-xl transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? "bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-500 shadow-md"
                    : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }
                `}
              >
                <span className="text-3xl md:text-4xl mb-2" aria-hidden="true">{template.emoji}</span>
                <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 text-center">
                  {isHebrew ? template.he : template.en}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected characters display */}
      {selectedCharacters.length > 0 && (
        <div className="mt-4">
          <Label className="text-sm font-semibold mb-2 block">
            {isHebrew ? `דמויות נבחרות (${selectedCharacters.length})` : `Selected Characters (${selectedCharacters.length})`}
          </Label>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedCharacters.map((char) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-full"
                >
                  {char.avatar ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={char.avatar} alt={char.name} />
                      <AvatarFallback className="text-[10px]"><User className="h-3 w-3" /></AvatarFallback>
                    </Avatar>
                  ) : char.emoji ? (
                    <span aria-hidden="true">{char.emoji}</span>
                  ) : (
                    <User className="h-3.5 w-3.5 text-purple-600" />
                  )}
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">{char.name}</span>
                  <button
                    onClick={() => removeCharacter(char.id)}
                    className="text-purple-600 hover:text-red-500 transition-colors"
                    aria-label={isHebrew ? `הסר ${char.name}` : `Remove ${char.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add custom character */}
      <div className="mt-4">
        {!showCustomInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="gap-2"
            aria-label={isHebrew ? "הוסף דמות מותאמת" : "Add custom character"}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {isHebrew ? "הוסף דמות משלך" : "Add your own character"}
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1">
              <Label htmlFor="custom-character-name" className="mb-1 block text-sm">
                {isHebrew ? "שם הדמות" : "Character name"}
              </Label>
              <Input
                id="custom-character-name"
                value={customCharacterName}
                onChange={(e) => setCustomCharacterName(e.target.value)}
                placeholder={isHebrew ? "למשל: דני הדובי" : "e.g. Danny the Bear"}
                dir={isRTL ? "rtl" : "ltr"}
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustomCharacter();
                }}
              />
            </div>
            <Button
              onClick={addCustomCharacter}
              disabled={!customCharacterName.trim()}
              className="bg-purple-600 hover:bg-purple-700"
              aria-label={isHebrew ? "הוסף" : "Add"}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCustomInput(false);
                setCustomCharacterName("");
              }}
              aria-label={isHebrew ? "ביטול" : "Cancel"}
            >
              {isHebrew ? "ביטול" : "Cancel"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
