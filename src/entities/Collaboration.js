import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Collaboration = createSecureEntity(createSupabaseEntity('collaborations'));
