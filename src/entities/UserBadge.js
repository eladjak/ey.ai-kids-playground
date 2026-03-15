import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const UserBadge = createSecureEntity(
  createSupabaseEntity('user_badges'),
  { ownerField: 'user_id' }
);
