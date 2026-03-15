import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Book = createSecureEntity(
  createSupabaseEntity('books', {
    columnMap: {
      childNames: 'child_names',
      selectedCharacters: 'selected_characters',
    },
  })
);
