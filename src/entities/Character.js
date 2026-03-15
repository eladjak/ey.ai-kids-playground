import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Character = createSecureEntity(createSupabaseEntity('characters'));
