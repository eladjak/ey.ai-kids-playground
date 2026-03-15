import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Community = createSecureEntity(createSupabaseEntity('community'));
