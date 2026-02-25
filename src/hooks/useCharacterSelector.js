import { useState, useEffect } from "react";
import { Character } from "@/entities/Character";

/**
 * Hook to load saved Character entities and convert between
 * Character entity format and the bookData.selectedCharacters format.
 */
export default function useCharacterSelector() {
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      const data = await Character.list("-created_date", 50);
      setSavedCharacters(data);
    } catch (error) {
      // silently handled - user may not have characters yet
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Convert a Character entity to the format used in bookData.selectedCharacters
   */
  const entityToSelection = (entity) => ({
    id: `entity_${entity.id}`,
    entityId: entity.id,
    name: entity.name,
    traits: entity.personality || "",
    emoji: null,
    avatar: entity.primary_image_url || null,
    age: entity.age,
    gender: entity.gender,
    isTemplate: false,
    isEntity: true,
  });

  /**
   * Convert a template selection to bookData.selectedCharacters format
   */
  const templateToSelection = (template, isHebrew) => ({
    id: template.id,
    name: isHebrew ? template.he : template.en,
    traits: template.traits,
    emoji: template.emoji,
    avatar: null,
    isTemplate: true,
    isEntity: false,
  });

  return {
    savedCharacters,
    isLoading,
    reload: loadCharacters,
    entityToSelection,
    templateToSelection,
  };
}
