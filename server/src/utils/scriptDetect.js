/**
 * @fileoverview Unicode script detector identifying Indian vernacular and English languages.
 */

/**
 * Detects the predominant language from input text using Unicode block frequency.
 * Supported language codes: 'te' (Telugu), 'hi' (Hindi/Devanagari), 'ta' (Tamil), 'en' (English), 'unknown'.
 *
 * @param {string} text - Raw or cleaned text string.
 * @returns {'te'|'hi'|'ta'|'en'|'unknown'} Detected language code.
 */
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') {
    return 'unknown';
  }

  const teluguMatches = text.match(/[\u0C00-\u0C7F]/g);
  const devanagariMatches = text.match(/[\u0900-\u097F]/g);
  const tamilMatches = text.match(/[\u0B80-\u0BFF]/g);
  const latinMatches = text.match(/[A-Za-z]/g);

  const teluguCount = teluguMatches ? teluguMatches.length : 0;
  const devanagariCount = devanagariMatches ? devanagariMatches.length : 0;
  const tamilCount = tamilMatches ? tamilMatches.length : 0;
  const latinCount = latinMatches ? latinMatches.length : 0;

  const totalLetters = teluguCount + devanagariCount + tamilCount + latinCount;

  // Insufficient alphabetic characters to make a reliable determination
  if (totalLetters < 10) {
    return 'unknown';
  }

  // Prioritize Indic vernacular scripts (official documents often embed English terms)
  if (
    teluguCount > 0 &&
    teluguCount >= devanagariCount &&
    teluguCount >= tamilCount &&
    (teluguCount / totalLetters >= 0.15 || teluguCount > latinCount)
  ) {
    return 'te';
  }

  if (
    devanagariCount > 0 &&
    devanagariCount >= teluguCount &&
    devanagariCount >= tamilCount &&
    (devanagariCount / totalLetters >= 0.15 || devanagariCount > latinCount)
  ) {
    return 'hi';
  }

  if (
    tamilCount > 0 &&
    tamilCount >= teluguCount &&
    tamilCount >= devanagariCount &&
    (tamilCount / totalLetters >= 0.15 || tamilCount > latinCount)
  ) {
    return 'ta';
  }

  if (latinCount / totalLetters >= 0.4) {
    return 'en';
  }

  return 'unknown';
};

export default {
  detectLanguage,
};
