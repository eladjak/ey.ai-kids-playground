import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Feedback = createSecureEntity(createSupabaseEntity('feedback'));
