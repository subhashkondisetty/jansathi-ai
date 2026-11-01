import { describe, it, expect } from 'vitest';
import {
  chunkPages,
  splitIntoSentences,
  isSectionHeading,
} from '../../src/services/chunkingService.js';

describe('chunkingService', () => {
  describe('isSectionHeading', () => {
    it('detects numbered section headings', () => {
      expect(isSectionHeading('1. Eligibility Criteria')).toBe(true);
      expect(isSectionHeading('2.1 Income Ceiling')).toBe(true);
      expect(isSectionHeading('Section 4 Application Procedure')).toBe(true);
    });

    it('detects ALL-CAPS section headings', () => {
      expect(isSectionHeading('TERMS AND CONDITIONS')).toBe(true);
      expect(isSectionHeading('SCHEDULE OF BENEFITS')).toBe(true);
    });

    it('rejects ordinary sentences ending with terminal punctuation', () => {
      expect(isSectionHeading('This is an ordinary sentence.')).toBe(false);
      expect(isSectionHeading('Are you an Indian citizen?')).toBe(false);
      expect(isSectionHeading('आवेदन पत्र जमा करें।')).toBe(false);
    });
  });

  describe('splitIntoSentences', () => {
    it('splits on standard punctuation and Devanagari danda', () => {
      const text = 'First sentence. Second sentence! Third sentence? चौथा वाक्य। Final sentence.';
      const sentences = splitIntoSentences(text, 1500);

      expect(sentences).toHaveLength(5);
      expect(sentences[0]).toBe('First sentence.');
      expect(sentences[1]).toBe('Second sentence!');
      expect(sentences[2]).toBe('Third sentence?');
      expect(sentences[3]).toBe('चौथा वाक्य।');
      expect(sentences[4]).toBe('Final sentence.');
    });

    it('hard-splits overlong sentences on whitespace if exceeding maxChars', () => {
      const longSentence = 'Word '.repeat(50).trim();
      const split = splitIntoSentences(longSentence, 50);

      expect(split.length).toBeGreaterThan(1);
      split.forEach((part) => {
        expect(part.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('chunkPages', () => {
    const sampleMetadata = {
      documentId: '6ae6b216cf373ffa8a9d2f14',
      title: 'National Scholarship Scheme',
      sourceUrl: 'https://scholarships.gov.in/guidelines.pdf',
      issuingAuthority: 'Ministry of Education',
      docType: 'scheme',
      category: 'scholarship',
      language: 'en',
      visibility: 'public',
      ownerId: '6ae64e4b77a92db5db174fa1',
      isLatest: true,
      version: 1,
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    it('propagates all denormalized metadata to every generated chunk', () => {
      const pages = [
        {
          pageNumber: 1,
          text: 'ELIGIBILITY REQUIREMENTS\nCandidates must have secured at least 60% marks in the qualifying examination.',
          sectionHeading: 'ELIGIBILITY REQUIREMENTS',
          isEmpty: false,
        },
      ];

      const chunks = chunkPages(pages, sampleMetadata, {
        targetChars: 500,
        maxChars: 800,
        overlapChars: 50,
      });

      expect(chunks.length).toBeGreaterThan(0);
      const chunk = chunks[0];

      expect(chunk.title).toBe(sampleMetadata.title);
      expect(chunk.sourceUrl).toBe(sampleMetadata.sourceUrl);
      expect(chunk.issuingAuthority).toBe(sampleMetadata.issuingAuthority);
      expect(chunk.docType).toBe(sampleMetadata.docType);
      expect(chunk.category).toBe(sampleMetadata.category);
      expect(chunk.language).toBe(sampleMetadata.language);
      expect(chunk.visibility).toBe(sampleMetadata.visibility);
      expect(chunk.isLatest).toBe(true);
      expect(chunk.version).toBe(1);
      expect(chunk.checksum).toBe(sampleMetadata.checksum);
      expect(chunk.pageStart).toBe(1);
      expect(chunk.pageEnd).toBe(1);
      expect(chunk.chunkIndex).toBe(0);
    });

    it('enforces chunk size bounds and includes overlap across chunks', () => {
      const sentence =
        'The government provides financial assistance to meritorious students from disadvantaged families. ';
      const pageText = sentence.repeat(25); // ~2400 chars

      const pages = [{ pageNumber: 1, text: pageText, isEmpty: false }];

      const targetChars = 600;
      const maxChars = 900;
      const overlapChars = 100;

      const chunks = chunkPages(pages, sampleMetadata, { targetChars, maxChars, overlapChars });

      expect(chunks.length).toBeGreaterThan(1);

      chunks.forEach((chunk, idx) => {
        expect(chunk.chunkIndex).toBe(idx);
        expect(chunk.charCount).toBeLessThanOrEqual(maxChars);
      });

      // Second chunk should contain overlap from the end of the first chunk
      const firstChunkTail = chunks[0].text.slice(-50).trim();
      expect(chunks[1].text).toContain(firstChunkTail);
    });

    it('tracks pageStart and pageEnd correctly when chunks span multiple pages', () => {
      const pages = [
        {
          pageNumber: 1,
          text: 'This text begins on page one and continues forward.',
          isEmpty: false,
        },
        {
          pageNumber: 2,
          text: 'This text continues onto page two without reaching the target character ceiling.',
          isEmpty: false,
        },
      ];

      const chunks = chunkPages(pages, sampleMetadata, {
        targetChars: 500,
        maxChars: 1000,
        overlapChars: 0,
      });

      expect(chunks).toHaveLength(1);
      expect(chunks[0].pageStart).toBe(1);
      expect(chunks[0].pageEnd).toBe(2);
    });

    it('is completely deterministic given the same inputs', () => {
      const pages = [
        {
          pageNumber: 1,
          text: '1. Overview\nJanSathi AI assists citizens in accessing civic services.',
          isEmpty: false,
        },
        {
          pageNumber: 2,
          text: '2. Benefits\nFinancial assistance is directly credited to beneficiary accounts.',
          isEmpty: false,
        },
      ];

      const run1 = chunkPages(pages, sampleMetadata);
      const run2 = chunkPages(pages, sampleMetadata);

      expect(run1).toEqual(run2);
    });
  });
});
