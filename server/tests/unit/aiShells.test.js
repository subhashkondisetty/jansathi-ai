import { describe, it, expect } from 'vitest';
import { NotImplementedError } from '../../src/utils/ApiError.js';
import embeddingService from '../../src/services/embeddingService.js';
import aiService from '../../src/services/aiService.js';
import ragService from '../../src/services/ragService.js';
import eligibilityService from '../../src/services/eligibilityService.js';
import verificationService from '../../src/services/verificationService.js';

describe('AI Hook Shells (501 NOT_IMPLEMENTED Contracts)', () => {
  it('embeddingService exports isAvailable() returning false and methods throw NotImplementedError', async () => {
    expect(embeddingService.isAvailable()).toBe(false);

    await expect(embeddingService.embedTexts(['sample'])).rejects.toThrow(NotImplementedError);
    await expect(embeddingService.embedTexts(['sample'])).rejects.toThrow(
      'embeddingService.embedTexts is not implemented yet'
    );

    await expect(embeddingService.embedQuery('sample')).rejects.toThrow(NotImplementedError);
    await expect(embeddingService.embedQuery('sample')).rejects.toThrow(
      'embeddingService.embedQuery is not implemented yet'
    );
  });

  it('aiService exports isAvailable() returning false and methods throw NotImplementedError', async () => {
    expect(aiService.isAvailable()).toBe(false);

    await expect(aiService.generateStructured({})).rejects.toThrow(NotImplementedError);
    await expect(aiService.generateStructured({})).rejects.toThrow(
      'aiService.generateStructured is not implemented yet'
    );

    await expect(aiService.translate({ text: 'test', targetLanguage: 'te' })).rejects.toThrow(
      NotImplementedError
    );
    await expect(aiService.translate({ text: 'test', targetLanguage: 'te' })).rejects.toThrow(
      'aiService.translate is not implemented yet'
    );
  });

  it('ragService exports isAvailable() returning false and answerQuestion throws NotImplementedError', async () => {
    expect(ragService.isAvailable()).toBe(false);

    await expect(ragService.answerQuestion({ question: 'test' })).rejects.toThrow(
      NotImplementedError
    );
    await expect(ragService.answerQuestion({ question: 'test' })).rejects.toThrow(
      'ragService.answerQuestion is not implemented yet'
    );
  });

  it('eligibilityService exports isAvailable() returning false and methods throw NotImplementedError', async () => {
    expect(eligibilityService.isAvailable()).toBe(false);

    await expect(eligibilityService.extractCriteria({ chunks: [] })).rejects.toThrow(
      NotImplementedError
    );
    await expect(eligibilityService.extractCriteria({ chunks: [] })).rejects.toThrow(
      'eligibilityService.extractCriteria is not implemented yet'
    );

    await expect(eligibilityService.checkEligibility({})).rejects.toThrow(NotImplementedError);
    await expect(eligibilityService.checkEligibility({})).rejects.toThrow(
      'eligibilityService.checkEligibility is not implemented yet'
    );
  });

  it('verificationService exports isAvailable() returning false and verifyClaim throws NotImplementedError', async () => {
    expect(verificationService.isAvailable()).toBe(false);

    await expect(verificationService.verifyClaim({ claim: 'test claim' })).rejects.toThrow(
      NotImplementedError
    );
    await expect(verificationService.verifyClaim({ claim: 'test claim' })).rejects.toThrow(
      'verificationService.verifyClaim is not implemented yet'
    );
  });
});
