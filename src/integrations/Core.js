/**
 * Core integrations — AI text, image generation, and file uploads.
 *
 * Phase 1: AI text + image generation → Gemini API (direct, no Base44)
 * Phase 2: File uploads → Supabase Storage (no more Base44 for storage)
 *
 * All existing callers import from this file and need NO changes.
 */

import {
  invokeLLM as geminiInvokeLLM,
  generateImage as geminiGenerateImage,
  base64ToFile,
} from '../lib/aiProvider';
import { uploadFileToSupabase } from '../lib/supabaseClient';

// ─── Text Generation ────────────────────────────────────────────────────────
// Powered by Gemini API directly

export async function InvokeLLM(params) {
  return geminiInvokeLLM(params);
}

// ─── Image Generation ───────────────────────────────────────────────────────
// Gemini generates base64 → upload to Supabase Storage → persistent URL

export async function GenerateImage({ prompt, quality, size }) {
  if (import.meta.env.DEV) console.log('[Core.GenerateImage] Starting image generation, prompt length:', prompt?.length);

  let base64, mimeType;
  try {
    const result = await geminiGenerateImage({ prompt });
    base64 = result.base64;
    mimeType = result.mimeType;
    if (import.meta.env.DEV) console.log('[Core.GenerateImage] Gemini returned base64:', !!base64, 'length:', base64?.length || 0, 'mimeType:', mimeType);
  } catch (err) {
    console.error('[Core.GenerateImage] Gemini image generation FAILED:', err?.message || err);
    throw err;
  }

  if (!base64) {
    console.error('[Core.GenerateImage] No base64 data received from Gemini');
    throw new Error('Image generation returned no data');
  }

  const file = base64ToFile(base64, mimeType, `sipurai-${Date.now()}.png`);

  try {
    const uploadResult = await uploadFileToSupabase(file, 'generated');
    if (import.meta.env.DEV) console.log('[Core.GenerateImage] Upload success, URL:', uploadResult.file_url?.substring(0, 80));
    return { url: uploadResult.file_url };
  } catch (uploadErr) {
    if (import.meta.env.DEV) console.warn('[Core.GenerateImage] Supabase upload failed, using data URI fallback:', uploadErr?.message);
    // Fallback to base64 data URI if upload fails
    return { url: `data:${mimeType};base64,${base64}` };
  }
}

// ─── File Upload ────────────────────────────────────────────────────────────
// Now uses Supabase Storage

export async function UploadFile({ file }) {
  return uploadFileToSupabase(file, 'uploads');
}

