import { describe, it, expect } from 'vitest';
import { searchQuerySchema } from '../../src/validators/searchValidators.js';

describe('searchValidators', () => {
  it('accepts valid keyword search query', () => {
    const result = searchQuerySchema.safeParse({
      q: 'scholarship eligibility',
      category: 'scholarship',
      docType: 'scheme',
      limit: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('scholarship eligibility');
      expect(result.data.limit).toBe(10);
      expect(result.data.page).toBe(1);
    }
  });

  it('rejects query that is too short (< 2 characters)', () => {
    const result = searchQuerySchema.safeParse({ q: 'a' });
    expect(result.success).toBe(false);
  });

  it('rejects query exceeding 200 characters', () => {
    const longQuery = 'x'.repeat(201);
    const result = searchQuerySchema.safeParse({ q: longQuery });
    expect(result.success).toBe(false);
  });

  it('enforces maximum limit of 20 results per request', () => {
    const result = searchQuerySchema.safeParse({
      q: 'valid query',
      limit: 50,
    });
    expect(result.success).toBe(false);
  });

  it('coerces includeOlderVersions string to boolean', () => {
    const result = searchQuerySchema.safeParse({
      q: 'valid query',
      includeOlderVersions: 'true',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.includeOlderVersions).toBe(true);
    }
  });
});
