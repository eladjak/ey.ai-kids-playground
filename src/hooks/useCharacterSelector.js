import { useRef } from 'react';
import { useQuery, QueryClient } from '@tanstack/react-query';
import { Character } from '@/entities/Character';

/**
 * Hook to load saved Character entities and convert between
 * Character entity format and the bookData.selectedCharacters format.
 * Uses React Query for automatic caching and deduplication.
 */
export default function useCharacterSelector() {
  // Each hook instance owns a stable QueryClient so this hook works both
  // inside a QueryClientProvider (production) and in isolation (tests).
  const clientRef = useRef(null);
  if (!clientRef.current) {
    clientRef.current = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  }

  const { data, isPending, refetch } = useQuery(
    {
      queryKey: ['characters'],
      queryFn: async () => {
        try {
          return await Character.list('-created_date', 50);
        } catch {
          // silently handled - user may not have characters yet
          return [];
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: false,
    },
    clientRef.current
  );

  /**
   * Convert a Character entity to the format used in bookData.selectedCharacters
   */
  const entityToSelection = (entity) => ({
    id: `entity_${entity.id}`,
    entityId: entity.id,
    name: entity.name,
    traits: entity.personality || '',
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
    savedCharacters: data ?? [],
    isLoading: isPending,
    reload: refetch,
    entityToSelection,
    templateToSelection,
  };
}
