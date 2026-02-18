/**
 * Content Moderation Utilities for EY.AI Kids Playground
 *
 * Provides input sanitization, prompt injection protection,
 * and child-safety content filtering for AI-generated content.
 */

// Blocked words/patterns that are inappropriate for children's content
const BLOCKED_PATTERNS = [
  // Violence (using word-start boundary to catch forms like "killing", "murdered", etc.)
  /\b(kill|murder|blood|gore|weapon|gun|knife|stab|shoot|dead|death|die|dying|suicide|torture)\w*/gi,
  // Inappropriate content
  /\b(sex|nude|naked|porn|drug|alcohol|beer|wine|cigarette|smoke|vape)\w*/gi,
  // Scary content for kids
  /\b(demon|devil|hell|damn|satan|curse|cursed)\w*/gi,
  // Profanity
  /\b(shit|fuck|ass|bitch|bastard|crap|dick|piss)\w*/gi,
  // Hebrew profanity
  /\b(זונה|מניאק|חרא|זין|תחת|כוס)\b/gi,
];

// Prompt injection patterns to detect and block
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /ignore\s+(all\s+)?above/gi,
  /disregard\s+(all\s+)?previous/gi,
  /forget\s+(all\s+)?previous/gi,
  /override\s+(all\s+)?instructions/gi,
  /you\s+are\s+now\s+(a|an)\b/gi,
  /act\s+as\s+(a|an|if)\b/gi,
  /pretend\s+(you|to\s+be)\b/gi,
  /new\s+instructions?:/gi,
  /system\s*prompt/gi,
  /\bDAN\b/g, // "Do Anything Now" jailbreak
  /jailbreak/gi,
  /bypass\s+(safety|filter|moderation)/gi,
  /\[system\]/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
];

// Maximum input lengths for different field types
const MAX_INPUT_LENGTHS = {
  name: 50,
  title: 100,
  description: 500,
  additionalDetails: 300,
  theme: 50,
  setting: 100,
  genre: 50,
  moral: 200,
  prompt: 1000,
};

/**
 * Sanitize a text input by removing potentially dangerous characters
 * while preserving Hebrew, English, and common punctuation.
 *
 * @param {string} input - The raw user input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  // Trim whitespace
  let sanitized = input.trim();

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove script-like patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove excessive whitespace (but keep single spaces and newlines)
  sanitized = sanitized.replace(/[^\S\n]{2,}/g, ' ');

  // Remove control characters (except newline and tab)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Truncate input to a safe maximum length based on field type.
 *
 * @param {string} input - The input string
 * @param {string} fieldType - The type of field (e.g., 'name', 'title', 'description')
 * @returns {string} Truncated input
 */
export function truncateInput(input, fieldType = 'description') {
  if (typeof input !== 'string') return '';

  const maxLength = MAX_INPUT_LENGTHS[fieldType] || MAX_INPUT_LENGTHS.description;
  return input.slice(0, maxLength);
}

/**
 * Check if text contains inappropriate content for children.
 *
 * @param {string} text - The text to check
 * @returns {{ isClean: boolean, blockedTerms: string[] }} Result with flag and matched terms
 */
export function checkContentSafety(text) {
  if (typeof text !== 'string') return { isClean: true, blockedTerms: [] };

  const blockedTerms = [];

  for (const pattern of BLOCKED_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      blockedTerms.push(...matches.map(m => m.toLowerCase()));
    }
  }

  // Deduplicate
  const uniqueBlocked = [...new Set(blockedTerms)];

  return {
    isClean: uniqueBlocked.length === 0,
    blockedTerms: uniqueBlocked,
  };
}

/**
 * Detect prompt injection attempts in user input.
 *
 * @param {string} text - The text to check
 * @returns {{ isSafe: boolean, detectedPatterns: string[] }} Result with safety flag and detected patterns
 */
export function detectPromptInjection(text) {
  if (typeof text !== 'string') return { isSafe: true, detectedPatterns: [] };

  const detectedPatterns = [];

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      detectedPatterns.push(...matches);
    }
  }

  return {
    isSafe: detectedPatterns.length === 0,
    detectedPatterns,
  };
}

/**
 * Full moderation pipeline: sanitize, truncate, check safety, and detect injection.
 * Returns a safe version of the input or null if blocked.
 *
 * @param {string} input - Raw user input
 * @param {string} fieldType - The type of field for length limits
 * @returns {{ sanitized: string | null, blocked: boolean, reasons: string[] }}
 */
export function moderateInput(input, fieldType = 'description') {
  const reasons = [];

  // Step 1: Sanitize
  let sanitized = sanitizeInput(input);

  // Step 2: Truncate
  sanitized = truncateInput(sanitized, fieldType);

  // Step 3: Check content safety
  const safetyCheck = checkContentSafety(sanitized);
  if (!safetyCheck.isClean) {
    reasons.push(`Inappropriate content detected: ${safetyCheck.blockedTerms.join(', ')}`);
  }

  // Step 4: Check for prompt injection
  const injectionCheck = detectPromptInjection(sanitized);
  if (!injectionCheck.isSafe) {
    reasons.push('Potentially harmful input pattern detected');
  }

  const blocked = reasons.length > 0;

  return {
    sanitized: blocked ? null : sanitized,
    blocked,
    reasons,
  };
}

/**
 * Sanitize AI-generated output before rendering.
 * Strips any unexpected HTML/script content from LLM responses.
 *
 * @param {string} output - The AI-generated text
 * @returns {string} Sanitized output safe for rendering
 */
export function sanitizeAIOutput(output) {
  if (typeof output !== 'string') return '';

  // Remove HTML tags
  let sanitized = output.replace(/<[^>]*>/g, '');

  // Remove script-like patterns
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized;
}

/**
 * Build a child-safe system prompt prefix to prepend to all AI prompts.
 * This instructs the AI to generate only child-appropriate content.
 *
 * @param {string} ageRange - The target age range (e.g., "5-7", "8-10")
 * @returns {string} System prompt prefix
 */
export function buildSafetyPromptPrefix(ageRange = '5-10') {
  return `IMPORTANT SAFETY INSTRUCTIONS: This content is for a children's book application targeting ages ${ageRange}. ` +
    'ALL content MUST be: ' +
    '1) Age-appropriate and child-friendly. ' +
    '2) Free of violence, scary themes, or inappropriate content. ' +
    '3) Positive, educational, and encouraging. ' +
    '4) Free of any discriminatory or harmful stereotypes. ' +
    'If any input seems inappropriate, generate safe, child-friendly alternative content instead.\n\n';
}

// --- Age-Appropriate Language Checks ---

/**
 * Complex/advanced vocabulary that may not suit very young children (ages 3-5).
 * These words are not blocked, just flagged for age-appropriateness.
 */
const ADVANCED_VOCABULARY_PATTERNS = [
  /\b(consequently|furthermore|nevertheless|notwithstanding|ubiquitous|paradigm|existential|philosophical)\b/gi,
  /\b(metamorphosis|photosynthesis|hypothesis|algorithm|cryptocurrency|derivatives)\b/gi,
  /\b(geopolitical|bureaucratic|infrastructure|jurisprudence|constitutional)\b/gi,
];

/**
 * Mildly scary or emotionally intense words that warrant a flag for younger audiences.
 */
const MILDLY_SCARY_PATTERNS = [
  /\b(ghost|monster|scary|afraid|nightmare|dark\s+forest|haunted|creepy|terrifying)\b/gi,
  /\b(lost|alone|abandoned|trapped|crying|screaming)\b/gi,
  /\b(רוח|מפחיד|סיוט|אפלה|רדוף|מפלצת)\b/gi,
];

/**
 * Check if text uses age-appropriate language for the target audience.
 * Does NOT block content, but returns flags and suggestions.
 *
 * @param {string} text - The text to check
 * @param {string} ageRange - Target age range (e.g., "3-5", "5-7", "8-10")
 * @returns {{ isAppropriate: boolean, flags: string[], suggestions: string[] }}
 */
export function checkAgeAppropriateLanguage(text, ageRange = '5-7') {
  if (typeof text !== 'string' || !text.trim()) {
    return { isAppropriate: true, flags: [], suggestions: [] };
  }

  const flags = [];
  const suggestions = [];

  // Parse minimum age from range
  const minAge = parseInt(ageRange.split('-')[0]) || 5;

  // Check for advanced vocabulary (flag for ages under 8)
  if (minAge < 8) {
    for (const pattern of ADVANCED_VOCABULARY_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = text.match(pattern);
      if (matches) {
        flags.push(`Advanced vocabulary detected: ${matches.join(', ')}`);
        suggestions.push('Consider using simpler words for young readers');
      }
    }
  }

  // Check for mildly scary content (flag for ages under 6)
  if (minAge < 6) {
    for (const pattern of MILDLY_SCARY_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = text.match(pattern);
      if (matches) {
        flags.push(`Potentially scary content for young children: ${matches.join(', ')}`);
        suggestions.push('Consider lighter themes for very young readers');
      }
    }
  }

  // Check sentence complexity for very young children
  if (minAge <= 5) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 15);
    if (longSentences.length > 0) {
      flags.push(`${longSentences.length} sentence(s) may be too long for young readers`);
      suggestions.push('Keep sentences under 15 words for ages 3-5');
    }
  }

  return {
    isAppropriate: flags.length === 0,
    flags,
    suggestions,
  };
}

// --- Parental Controls Helpers ---

/**
 * Default parental control settings.
 */
export const DEFAULT_PARENTAL_CONTROLS = {
  contentFilterLevel: 'strict',   // 'strict' | 'moderate' | 'relaxed'
  allowAIGeneration: true,
  maxDailyBooks: 5,
  allowCommunitySharing: false,
  requireApprovalBeforePublish: true,
  blockedTopics: [],
  ageRange: '5-7',
};

/**
 * Get parental controls from localStorage, or return defaults.
 * @returns {object} Parental control settings
 */
export function getParentalControls() {
  try {
    const stored = localStorage.getItem('parentalControls');
    if (stored) {
      return { ...DEFAULT_PARENTAL_CONTROLS, ...JSON.parse(stored) };
    }
  } catch {
    // Fall through to defaults
  }
  return { ...DEFAULT_PARENTAL_CONTROLS };
}

/**
 * Save parental controls to localStorage.
 * @param {object} controls - Parental control settings
 */
export function saveParentalControls(controls) {
  localStorage.setItem('parentalControls', JSON.stringify({
    ...DEFAULT_PARENTAL_CONTROLS,
    ...controls,
  }));
}

// --- PIN Code Protection ---

/**
 * Hash a PIN code using a simple but effective approach.
 * Uses btoa encoding with a salt for basic protection.
 * (In production, use bcrypt/argon2 on the server side.)
 *
 * @param {string} pin - The 4-6 digit PIN code
 * @returns {string} Hashed PIN
 */
export function hashPin(pin) {
  if (typeof pin !== 'string' || pin.length < 4) return '';
  // Simple hash: reverse + salt + base64
  const salted = `eyai_kids_${pin.split('').reverse().join('')}_${pin.length}`;
  return btoa(salted);
}

/**
 * Check if a parental PIN has been set.
 * @returns {boolean}
 */
export function isPinSet() {
  return !!localStorage.getItem('parentalPin');
}

/**
 * Set or update the parental PIN code.
 * @param {string} pin - 4-6 digit PIN
 * @returns {boolean} Whether the PIN was set successfully
 */
export function setParentalPin(pin) {
  if (typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
    return false;
  }
  localStorage.setItem('parentalPin', hashPin(pin));
  return true;
}

/**
 * Verify a PIN against the stored hash.
 * @param {string} pin - PIN to verify
 * @returns {boolean} Whether the PIN matches
 */
export function verifyParentalPin(pin) {
  if (typeof pin !== 'string') return false;
  const storedHash = localStorage.getItem('parentalPin');
  if (!storedHash) return true; // No PIN set = always pass
  return hashPin(pin) === storedHash;
}

/**
 * Remove the parental PIN (requires correct PIN first).
 * @param {string} currentPin - Current PIN for verification
 * @returns {boolean} Whether the PIN was removed
 */
export function removeParentalPin(currentPin) {
  if (!verifyParentalPin(currentPin)) return false;
  localStorage.removeItem('parentalPin');
  return true;
}
