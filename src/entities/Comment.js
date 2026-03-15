import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Comment = createSecureEntity(createSupabaseEntity('comments'));
