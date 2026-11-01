import { describe, it, expect } from 'vitest';
import {
  cleanText,
  cleanPages,
  isPageNumberLine,
  stripControlChars,
} from '../../src/services/textCleaner.js';

describe('textCleaner service', () => {
  describe('stripControlChars', () => {
    it('strips null bytes and unprintable control characters while preserving tabs and newlines', () => {
      const input = 'Hello\x00World\x07!\tThis is a newline:\nEnd.';
      const output = stripControlChars(input);
      expect(output).toBe('HelloWorld!\tThis is a newline:\nEnd.');
    });
  });

  describe('isPageNumberLine', () => {
    it('identifies various page number indicator formats', () => {
      expect(isPageNumberLine('12')).toBe(true);
      expect(isPageNumberLine('Page 5')).toBe(true);
      expect(isPageNumberLine('pg. 42')).toBe(true);
      expect(isPageNumberLine('12 of 45')).toBe(true);
      expect(isPageNumberLine('Page 3 / 10')).toBe(true);
      expect(isPageNumberLine('- 8 -')).toBe(true);
      expect(isPageNumberLine('Section 2: Eligibility Rules')).toBe(false);
      expect(isPageNumberLine('₹5000 grant per acre')).toBe(false);
    });
  });

  describe('cleanText', () => {
    it('preserves Indic scripts and performs NFC normalization', () => {
      const telugu = 'రైతు బంధు పథకం';
      const hindi = 'प्रधानमंत्री आवास योजना';
      const tamil = 'தமிழ்நாடு அரசு';

      expect(cleanText(telugu)).toBe(telugu.normalize('NFC'));
      expect(cleanText(hindi)).toBe(hindi.normalize('NFC'));
      expect(cleanText(tamil)).toBe(tamil.normalize('NFC'));
    });

    it('unifies line endings from Windows CRLF and CR to LF', () => {
      const input = 'Line 1\r\nLine 2\rLine 3\nLine 4';
      expect(cleanText(input)).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    });

    it('de-hyphenates Latin words split across line breaks while preserving standalone hyphens', () => {
      const input = 'This docu-\nment provides an exam-\nination of the policy.';
      expect(cleanText(input)).toBe('This document provides an examination of the policy.');
    });

    it('removes standalone page number lines', () => {
      const input = 'First paragraph text.\nPage 14\nSecond paragraph text.';
      expect(cleanText(input)).toBe('First paragraph text.\nSecond paragraph text.');
    });

    it('collapses runs of whitespace and 3+ newlines to standard paragraph breaks', () => {
      const input = 'First    paragraph    with   extra   spaces.\n\n\n\nSecond paragraph.';
      expect(cleanText(input)).toBe('First paragraph with extra spaces.\n\nSecond paragraph.');
    });
  });

  describe('cleanPages', () => {
    it('removes repeated header and footer lines when document has at least 4 pages', () => {
      const pages = [
        { pageNumber: 1, text: 'GOVERNMENT OF INDIA\nContent of page 1.\nConfidential Gazette' },
        { pageNumber: 2, text: 'GOVERNMENT OF INDIA\nContent of page 2.\nConfidential Gazette' },
        { pageNumber: 3, text: 'GOVERNMENT OF INDIA\nContent of page 3.\nConfidential Gazette' },
        { pageNumber: 4, text: 'GOVERNMENT OF INDIA\nContent of page 4.\nDifferent Footer' },
      ];

      const cleaned = cleanPages(pages);
      expect(cleaned).toHaveLength(4);

      // 'GOVERNMENT OF INDIA' appeared in 4/4 pages (> 50%) -> stripped
      // 'Confidential Gazette' appeared in 3/4 pages (> 50%) -> stripped
      expect(cleaned[0].text).toBe('Content of page 1.');
      expect(cleaned[1].text).toBe('Content of page 2.');
      expect(cleaned[2].text).toBe('Content of page 3.');
      expect(cleaned[3].text).toBe('Content of page 4.\nDifferent Footer');
    });

    it('does not strip headers if document has fewer than 4 pages', () => {
      const pages = [
        { pageNumber: 1, text: 'GOVERNMENT OF INDIA\nShort document page 1.' },
        { pageNumber: 2, text: 'GOVERNMENT OF INDIA\nShort document page 2.' },
      ];

      const cleaned = cleanPages(pages);
      expect(cleaned[0].text).toContain('GOVERNMENT OF INDIA');
      expect(cleaned[1].text).toContain('GOVERNMENT OF INDIA');
    });

    it('accurately identifies empty pages (< 20 characters)', () => {
      const pages = [
        { pageNumber: 1, text: '12\n\n' }, // Cleans to empty string
        { pageNumber: 2, text: 'Short' }, // 5 chars < 20
        {
          pageNumber: 3,
          text: 'This page has substantial content exceeding the minimum threshold.',
        },
      ];

      const cleaned = cleanPages(pages);
      expect(cleaned[0].isEmpty).toBe(true);
      expect(cleaned[1].isEmpty).toBe(true);
      expect(cleaned[2].isEmpty).toBe(false);
    });
  });
});
