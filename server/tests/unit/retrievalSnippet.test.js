import { describe, it, expect } from 'vitest';
import { extractSnippet } from '../../src/services/retrievalService.js';

describe('retrievalService extractSnippet', () => {
  it('returns empty string for empty text', () => {
    expect(extractSnippet('', 'scholarship')).toBe('');
    expect(extractSnippet(null, 'scholarship')).toBe('');
  });

  it('returns entire text if shorter than target length', () => {
    const text = 'Simple short civic notice about scholarships.';
    expect(extractSnippet(text, 'scholarships', 300)).toBe(text);
  });

  it('strips HTML tags cleanly from the snippet', () => {
    const html = '<p>The <b>Ministry of Social Justice</b> announces <i>Scholarship 2026</i>.</p>';
    const snippet = extractSnippet(html, 'Scholarship');
    expect(snippet).not.toContain('<p>');
    expect(snippet).not.toContain('<b>');
    expect(snippet).not.toContain('</i>');
    expect(snippet).toContain('Scholarship 2026');
  });

  it('centers the window around the matched query term', () => {
    const prefix = 'Introductory background text about state policy. '.repeat(5);
    const target = 'National Pre-Matric Scholarship Scheme for backward classes.';
    const suffix = ' Follow-up administration guidelines and implementation rules.'.repeat(5);
    const fullText = `${prefix}${target}${suffix}`;

    const snippet = extractSnippet(fullText, 'Pre-Matric', 150);
    expect(snippet).toContain('Pre-Matric');
    expect(snippet.startsWith('...')).toBe(true);
    expect(snippet.endsWith('...')).toBe(true);
  });

  it('falls back to the beginning of the text when no search terms match', () => {
    const fullText = 'Word '.repeat(100);
    const snippet = extractSnippet(fullText, 'unmatchedQueryTerm', 100);
    expect(snippet.length).toBeLessThanOrEqual(105);
    expect(snippet.endsWith('...')).toBe(true);
  });
});
