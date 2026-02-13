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
