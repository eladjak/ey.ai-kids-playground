/**
 * Vercel Serverless Function — AI generation proxy.
 *
 * Keeps GEMINI_API_KEY server-side (never shipped to the browser).
 * Accepts POST { prompt, type, options } and proxies to Google Generative AI.
 *
 * type: "text" | "image"
 */

// ─── Simple in-memory rate limiter (per IP, resets every minute) ─────────────

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // max requests per IP per minute

const ipHits = new Map(); // ip -> { count, windowStart }

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipHits.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const MAX_PROMPT_LENGTH = 12_000;
const ALLOWED_TYPES = ['text', 'image'];

// ─── Schema Conversion ──────────────────────────────────────────────────────

const TYPE_MAP = {
  string: 'STRING',
  number: 'NUMBER',
  integer: 'INTEGER',
  boolean: 'BOOLEAN',
  array: 'ARRAY',
  object: 'OBJECT',
};

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
  }

  return converted;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS preflight — restrict to our domain only
  const allowedOrigins = ['https://sipurai.ai', 'https://www.sipurai.ai', 'http://localhost:5173'];
  const origin = req.headers.origin;
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // Set CORS for all responses
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  // Validate API key is configured server-side
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  // Parse and validate request body
  const { prompt, type, options } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "prompt" field.' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters.` });
  }

  if (!type || !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid "type". Must be "text" or "image".' });
  }

  try {
    if (type === 'text') {
      const result = await handleText(apiKey, prompt, options);
      return res.status(200).json(result);
    }

    if (type === 'image') {
      const result = await handleImage(apiKey, prompt, options);
      return res.status(200).json(result);
    }
  } catch (err) {
    const message = err.message || 'AI generation failed.';
    const status = err.status || 500;
    return res.status(status).json({ error: message });
  }
}

// ─── Text Generation ─────────────────────────────────────────────────────────

async function handleText(apiKey, prompt, options = {}) {
  const { response_json_schema, response_format, temperature, max_tokens } = options;

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

  const response = await fetch(
    `${GEMINI_BASE_URL}/${GEMINI_TEXT_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const error = new Error(`AI text generation failed: ${err.error?.message || response.statusText}`);
    error.status = response.status >= 500 ? 502 : response.status;
    throw error;
  }

  const data = await response.json();

  if (data.candidates?.[0]?.finishReason === 'SAFETY') {
    const error = new Error('Content was blocked by safety filters. Please try a different prompt.');
    error.status = 422;
    throw error;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No text generated. The model returned an empty response.');
  }

  if (wantsJson) {
    try {
      return { result: JSON.parse(text) };
    } catch {
      throw new Error('AI returned invalid JSON. Please try again.');
    }
  }

  return { result: text };
}

// ─── Image Generation ────────────────────────────────────────────────────────

async function handleImage(apiKey, prompt, options = {}) {
  const { aspectRatio = '1:1' } = options;

  // Append child-safety instruction
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
          imageConfig: { aspectRatio },
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const error = new Error(`Image generation failed: ${err.error?.message || response.statusText}`);
    error.status = response.status >= 500 ? 502 : response.status;
    throw error;
  }

  const data = await response.json();

  if (data.candidates?.[0]?.finishReason === 'SAFETY') {
    const error = new Error('Image was blocked by safety filters. Please try a different prompt.');
    error.status = 422;
    throw error;
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
