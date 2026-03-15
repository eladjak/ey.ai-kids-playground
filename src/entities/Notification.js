/**
 * Notification entity — in-app notifications sent to individual users.
 *
 * Schema:
 *   user_email:   string   — recipient's email address
 *   type:         string   — "new_book" | "new_follower" | "book_liked" | "comment" | "badge_earned"
 *   title:        string   — short notification title
 *   message:      string   — notification body text
 *   link:         string   — deep-link path (e.g. "/BookView?id=xxx")
 *   read:         boolean  — whether the recipient has read it (default false)
 */
import { createSupabaseEntity } from '../lib/supabaseEntity';
import { createSecureEntity } from '../lib/secureEntity';

export const Notification = createSecureEntity(
  createSupabaseEntity('notifications'),
  { ownerField: 'user_email' }
);
