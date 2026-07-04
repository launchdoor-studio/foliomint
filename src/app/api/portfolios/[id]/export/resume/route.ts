import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { canUseAiFeature } from '@/lib/access';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiUsageEvents, portfolios } from '@/lib/db/schema';
import { renderResumePdf } from '@/lib/export/resume-pdf';
import { resumeDataSchema } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';
  const portfolioId = params.id;

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  if (!(await canUseAiFeature(userId, 'export'))) {
    return NextResponse.json(
      { error: 'You have reached your resume export limit for this period.', code: 'EXPORT_LIMIT' },
      { status: 403 },
    );
  }

  const parsed = resumeDataSchema.safeParse(portfolio.content);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid portfolio content' }, { status: 400 });
  }

  const pdf = await renderResumePdf(parsed.data);
  const filename = `${(parsed.data.name || 'resume').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-resume.pdf`;

  await db.insert(aiUsageEvents).values({
    id: nanoid(12),
    userId,
    portfolioId,
    kind: 'export',
    model: null,
    succeeded: true,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
