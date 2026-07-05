import { describe, expect, it } from 'vitest';

import { renderResumePdf } from '@/lib/export/resume-pdf';
import { createBlankPortfolioContent } from '@/lib/portfolio-content';

describe('renderResumePdf', () => {
  it('generates a non-empty PDF buffer', async () => {
    const pdf = await renderResumePdf(createBlankPortfolioContent('Test User'));
    expect(pdf.length).toBeGreaterThan(100);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  });
});
