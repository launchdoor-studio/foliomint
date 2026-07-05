import { describe, expect, it } from 'vitest';

import {
  isSafeHttpUrl,
  sanitizeImageUrl,
  sanitizeOutboundUrl,
} from '@/lib/safe-url';
import { normalizeOutboundHref } from '@/lib/utils';

describe('safe-url', () => {
  it('blocks javascript and data URLs for outbound links', () => {
    expect(sanitizeOutboundUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeOutboundUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeOutboundUrl('vbscript:msgbox(1)')).toBeNull();
  });

  it('allows http(s), mailto, and tel links', () => {
    expect(sanitizeOutboundUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeOutboundUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeOutboundUrl('tel:+15551234567')).toBe('tel:+15551234567');
  });

  it('prefixes bare hostnames with https', () => {
    expect(sanitizeOutboundUrl('github.com/user')).toBe('https://github.com/user');
  });

  it('allows site-relative paths', () => {
    expect(sanitizeOutboundUrl('/blog')).toBe('/blog');
    expect(sanitizeOutboundUrl('#about')).toBe('#about');
  });

  it('blocks non-http(s) schemes for images', () => {
    expect(sanitizeImageUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeImageUrl('data:image/png;base64,abc')).toBeNull();
    expect(sanitizeImageUrl('https://cdn.example.com/photo.jpg')).toBe(
      'https://cdn.example.com/photo.jpg',
    );
  });

  it('isSafeHttpUrl matches integration validation', () => {
    expect(isSafeHttpUrl('https://example.com')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('normalizeOutboundHref', () => {
  it('returns empty string for blocked schemes', () => {
    expect(normalizeOutboundHref('javascript:alert(1)')).toBe('');
    expect(normalizeOutboundHref('data:text/html,x')).toBe('');
  });

  it('normalizes safe URLs', () => {
    expect(normalizeOutboundHref('example.com')).toBe('https://example.com');
    expect(normalizeOutboundHref('https://example.com')).toBe('https://example.com');
  });
});
