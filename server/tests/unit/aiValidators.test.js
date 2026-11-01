import { describe, it, expect } from 'vitest';
import {
  askAiSchema,
  eligibilityCheckSchema,
  verifyClaimSchema,
} from '../../src/validators/aiValidators.js';

describe('aiValidators', () => {
  describe('askAiSchema', () => {
    it('accepts valid question query', () => {
      const result = askAiSchema.safeParse({
        question: 'What are the scholarship requirements for backward classes?',
        language: 'en',
      });
      expect(result.success).toBe(true);
    });

    it('rejects questions shorter than 3 characters', () => {
      const result = askAiSchema.safeParse({ question: 'Hi' });
      expect(result.success).toBe(false);
    });

    it('rejects questions longer than 1000 characters', () => {
      const result = askAiSchema.safeParse({ question: 'q'.repeat(1001) });
      expect(result.success).toBe(false);
    });

    it('rejects unwhitelisted fields via strict mode', () => {
      const result = askAiSchema.safeParse({
        question: 'Valid question',
        role: 'user', // Clients cannot set message role directly
      });
      expect(result.success).toBe(false);
    });
  });

  describe('eligibilityCheckSchema', () => {
    it('accepts query without documentIds', () => {
      const result = eligibilityCheckSchema.safeParse({
        query: 'post matric scholarships',
        applicant: {
          educationLevel: 'undergraduate',
          state: 'Telangana',
        },
      });
      expect(result.success).toBe(true);
    });

    it('accepts documentIds without query', () => {
      const result = eligibilityCheckSchema.safeParse({
        documentIds: ['6ae6c226f169df653a0dbb5e'],
        applicant: {
          educationLevel: 'class_12',
        },
      });
      expect(result.success).toBe(true);
    });

    it('rejects when both query and documentIds are absent', () => {
      const result = eligibilityCheckSchema.safeParse({
        applicant: {
          educationLevel: 'class_12',
        },
      });
      expect(result.success).toBe(false);
    });

    it('enforces maximum of 5 documentIds', () => {
      const result = eligibilityCheckSchema.safeParse({
        documentIds: [
          '6ae6c226f169df653a0dbb51',
          '6ae6c226f169df653a0dbb52',
          '6ae6c226f169df653a0dbb53',
          '6ae6c226f169df653a0dbb54',
          '6ae6c226f169df653a0dbb55',
          '6ae6c226f169df653a0dbb56',
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verifyClaimSchema', () => {
    it('accepts valid civic claim string', () => {
      const result = verifyClaimSchema.safeParse({
        claim: 'Government is awarding Rs 50,000 for top scoring students.',
      });
      expect(result.success).toBe(true);
    });

    it('rejects claim shorter than 10 characters', () => {
      const result = verifyClaimSchema.safeParse({ claim: 'Too short' });
      expect(result.success).toBe(false);
    });

    it('rejects claim longer than 2000 characters', () => {
      const result = verifyClaimSchema.safeParse({ claim: 'a'.repeat(2001) });
      expect(result.success).toBe(false);
    });
  });
});
