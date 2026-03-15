import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Page = createSecureEntity(createSupabaseEntity('pages'));
