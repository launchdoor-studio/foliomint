import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { decryptAiKey, encryptAiKey, keyHintFromApiKey } from '@/lib/ai-key-encryption';

describe('ai-key-encryption', () => {
  const originalSecret = process.env.AI_KEY_ENCRYPTION_SECRET;
  const originalNextAuth = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.AI_KEY_ENCRYPTION_SECRET = 'test-encryption-secret-for-unit-tests';
    delete process.env.NEXTAUTH_SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.AI_KEY_ENCRYPTION_SECRET;
    } else {
      process.env.AI_KEY_ENCRYPTION_SECRET = originalSecret;
    }
    if (originalNextAuth === undefined) {
      delete process.env.NEXTAUTH_SECRET;
    } else {
      process.env.NEXTAUTH_SECRET = originalNextAuth;
    }
  });

  it('round-trips encrypt and decrypt', () => {
    const plaintext = 'gsk_test_key_abcdefghijklmnop';
    const encrypted = encryptAiKey(plaintext);
    expect(encrypted).not.toContain(plaintext);
    expect(decryptAiKey(encrypted)).toBe(plaintext);
  });

  it('produces different ciphertext for the same plaintext', () => {
    const plaintext = 'gsk_same_key';
    expect(encryptAiKey(plaintext)).not.toBe(encryptAiKey(plaintext));
  });

  it('derives key hint from api key', () => {
    expect(keyHintFromApiKey('gsk_abcdefghijklmnop')).toBe('mnop');
    expect(keyHintFromApiKey('ab')).toBe('ab');
  });
});
