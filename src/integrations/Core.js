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
  const { base64, mimeType } = await geminiGenerateImage({ prompt });

  const file = base64ToFile(base64, mimeType, `sipurai-${Date.now()}.png`);

  try {
    const result = await uploadFileToSupabase(file, 'generated');
    return { url: result.file_url };
  } catch {
    // Fallback to base64 data URI if upload fails
    return { url: `data:${mimeType};base64,${base64}` };
  }
}

// ─── File Upload ────────────────────────────────────────────────────────────
// Now uses Supabase Storage

export async function UploadFile({ file }) {
  return uploadFileToSupabase(file, 'uploads');
}

