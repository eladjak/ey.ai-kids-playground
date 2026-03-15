import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const StoryIdea = createSecureEntity(createSupabaseEntity('story_ideas'));
