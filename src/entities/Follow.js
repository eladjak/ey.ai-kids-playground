/**
 * Follow entity — tracks follower/following relationships between users.
 *
 * Schema:
 *   follower_email:  string  — who is following
 *   following_email: string  — who is being followed
 *   created_date:    string  — ISO date
 */
import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Follow = createSecureEntity(createSupabaseEntity('follows'));
