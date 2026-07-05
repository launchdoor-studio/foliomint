import { describe, expect, it } from 'vitest';

import {
  bulletsFromTextareaValue,
  hasVisibleBullets,
  visibleBullets,
} from '@/lib/bullet-textarea';

describe('bullet-textarea', () => {
  it('preserves trailing blank line while editing', () => {
    expect(bulletsFromTextareaValue('First line\n')).toEqual(['First line', '']);
  });

  it('preserves blank lines between bullets', () => {
    expect(bulletsFromTextareaValue('A\n\nB')).toEqual(['A', '', 'B']);
  });

  it('filters empty lines for display', () => {
    expect(visibleBullets(['Done', '', '  '])).toEqual(['Done']);
    expect(hasVisibleBullets(['', ''])).toBe(false);
    expect(hasVisibleBullets(['', 'Real bullet'])).toBe(true);
  });
});
