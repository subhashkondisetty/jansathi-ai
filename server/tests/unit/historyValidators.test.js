import { describe, it, expect } from 'vitest';
import {
  createConversationSchema,
  listConversationsQuerySchema,
  appendMessageSchema,
} from '../../src/validators/historyValidators.js';

describe('historyValidators', () => {
  it('accepts valid createConversation payload with default values', () => {
    const result = createConversationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe('ask');
      expect(result.data.language).toBe('en');
    }
  });

  it('rejects invalid conversation mode', () => {
    const result = createConversationSchema.safeParse({ mode: 'invalid_mode' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid documentId format', () => {
    const result = createConversationSchema.safeParse({ documentId: 'invalid-id-123' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown properties via strict validation', () => {
    const result = createConversationSchema.safeParse({
      title: 'Valid',
      extraProperty: 'not_allowed',
    });
    expect(result.success).toBe(false);
  });

  it('validates appendMessage content requirements', () => {
    const valid = appendMessageSchema.safeParse({ content: 'Hello assistant' });
    expect(valid.success).toBe(true);

    const empty = appendMessageSchema.safeParse({ content: '   ' });
    expect(empty.success).toBe(false);

    const tooLong = appendMessageSchema.safeParse({ content: 'x'.repeat(8001) });
    expect(tooLong.success).toBe(false);
  });

  it('validates listConversations query pagination bounds', () => {
    const valid = listConversationsQuerySchema.safeParse({ page: '2', limit: '30' });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.page).toBe(2);
      expect(valid.data.limit).toBe(30);
    }

    const invalidLimit = listConversationsQuerySchema.safeParse({ limit: 150 });
    expect(invalidLimit.success).toBe(false);
  });
});
