/**
 * AI Provider — Direct API integration for text and image generation.
 *
 * Replaces Base44's InvokeLLM and GenerateImage with direct API calls.
 * Currently supports Gemini (client-side). Claude and OpenAI can be added
 * via a backend proxy (Supabase Edge Functions) in the future.
 *
 * Architecture:
 *   aiProvider.js  → direct Gemini API calls
 *   Core.js        → thin adapter (converts image base64 → URL via upload)
 *   Pages/hooks    → import from Core.js (unchanged)
 */

// ─── Configuration ──────────────────────────────────────────────────────────

const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'VITE_GEMINI_API_KEY is not configured. ' +
      'Add it to your .env file to use AI features.'
    );
  }
  return key;
}

// ─── Schema Conversion ─────────────────────────────────────────────────────
// Base44 uses lowercase JSON Schema types ("string", "object", "array").
// Gemini API requires uppercase enum values ("STRING", "OBJECT", "ARRAY").

const TYPE_MAP = {
  string: 'STRING',
  number: 'NUMBER',
  integer: 'INTEGER',
  boolean: 'BOOLEAN',
  array: 'ARRAY',
  object: 'OBJECT',
};

/**
 * Recursively convert a JSON Schema (Base44 style) to Gemini responseSchema format.
 */
function convertSchemaToGemini(schema) {
  if (!schema || typeof schema !== 'object') return schema;

  const converted = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === 'type' && typeof value === 'string') {
      converted.type = TYPE_MAP[value.toLowerCase()] || value.toUpperCase();
    } else if (key === 'properties' && typeof value === 'object') {
      converted.properties = {};
      for (const [propName, propSchema] of Object.entries(value)) {
        converted.properties[propName] = convertSchemaToGemini(propSchema);
      }
    } else if (key === 'items' && typeof value === 'object') {
      converted.items = convertSchemaToGemini(value);
    } else if (key === 'required' && Array.isArray(value)) {
      converted.required = value;
    } else if (key === 'description' && typeof value === 'string') {
      converted.description = value;
    }
    // Skip unknown keys (Gemini doesn't support all JSON Schema features)
  }

  return converted;
}

// ─── Text Generation (LLM) ─────────────────────────────────────────────────

/**
 * Invoke an LLM for text generation with optional structured JSON output.
 *
 * @param {Object} params
 * @param {string} params.prompt - The prompt text
 * @param {Object} [params.response_json_schema] - JSON Schema for structured output
 * @param {Object} [params.response_format] - Alternative: { type: "json_object" }
 * @param {number} [params.temperature] - Generation temperature (0-2)
 * @param {number} [params.max_tokens] - Maximum output tokens
 * @returns {Object|string} Parsed JSON object when schema is provided, raw text otherwise
 */
export async function invokeLLM({
  prompt,
  response_json_schema,
  response_format,
  temperature,
  max_tokens,
}) {
  const apiKey = getApiKey();
  const wantsJson = !!(response_json_schema || response_format?.type === 'json_object');

  const generationConfig = {};

  if (response_json_schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = convertSchemaToGemini(response_json_schema);
  } else if (wantsJson) {
    generationConfig.responseMimeType = 'application/json';
  }

  if (temperature !== undefined) {
    generationConfig.temperature = temperature;
  }
  if (max_tokens !== undefined) {
    generationConfig.maxOutputTokens = max_tokens;
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };

  const response = await fetch(
    `${GEMINI_BASE_URL}/${GEMINI_TEXT_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`AI text generation failed: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();

  // Handle safety blocks
  if (data.candidates?.[0]?.finishReason === 'SAFETY') {
    throw new Error('Content was blocked by safety filters. Please try a different prompt.');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No text generated. The model returned an empty response.');
  }

  // Always return parsed JSON when JSON output was requested
  if (wantsJson) {
    return JSON.parse(text);
  }

  return text;
}

// ─── Image Generation ───────────────────────────────────────────────────────

/**
 * Generate an image from a text prompt.
 *
 * Returns raw base64 data. The caller (Core.js) is responsible for
 * converting this to a persistent URL via upload.
 *
 * @param {Object} params
 * @param {string} params.prompt - Image description
 * @param {string} [params.aspectRatio='1:1'] - Aspect ratio
 * @returns {{ base64: string, mimeType: string }}
 */
export async function generateImage({ prompt, aspectRatio = '1:1' }) {
  const apiKey = getApiKey();

  // Append child-safety instruction to all image prompts
  const safePrompt = `${prompt}\n\nIMPORTANT: This image is for a children's book. It must be completely child-friendly, wholesome, and appropriate for young readers.`;

  const response = await fetch(
    `${GEMINI_BASE_URL}/${GEMINI_IMAGE_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: safePrompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`Image generation failed: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();

  // Handle safety blocks
  if (data.candidates?.[0]?.finishReason === 'SAFETY') {
    throw new Error('Image was blocked by safety filters. Please try a different prompt.');
  }

  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error('No image generated. The model returned an empty response.');
  }

  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) {
    throw new Error('No image in response. The model returned text only.');
  }

  return {
    base64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}

// ─── Utilities ──────────────────────────────────────────────────────────────

/**
 * Convert a base64 string to a File object for upload.
 */
export function base64ToFile(base64, mimeType = 'image/png', filename = 'generated.png') {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}
