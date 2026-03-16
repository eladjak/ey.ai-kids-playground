/**
 * Supabase Client — shared instance for Storage, Database, and future Auth.
 *
 * Phase 2: Used for file/image storage (replacing Base44 UploadFile).
 * Phase 3: Will also handle entity CRUD (replacing Base44 entities).
 * Phase 4: Will handle auth (replacing Base44 auth).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Phase 2: No auth yet (Base44 still handles auth).
    // We disable auto-detection to avoid conflicts with Base44's auth.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// ─── Storage Helpers ────────────────────────────────────────────────────────

const STORAGE_BUCKET = 'sipurai-images';

/**
 * Upload a File to Supabase Storage and return its public URL.
 *
 * @param {File} file - The file to upload
 * @param {string} [folder='uploads'] - Subfolder inside the bucket
 * @returns {Promise<{ file_url: string }>} - Matches Base44's UploadFile return shape
 */
export async function uploadFileToSupabase(file, folder = 'uploads') {
  const ext = file.name?.split('.').pop() || 'png';
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(uniqueName, file, {
      contentType: file.type || 'image/png',
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return { file_url: urlData.publicUrl };
}
