import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { and, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { blogPosts, portfolios } from '@/lib/db/schema';
import { userHasProAccess } from '@/lib/pro-access';
import { slugifyBlog } from '@/lib/slug';

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().default(''),
  excerpt: z.string().optional(),
  isPublished: z.boolean().optional(),
});

interface Ctx {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Ctx) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.portfolioId, portfolio.id))
    .orderBy(desc(blogPosts.updatedAt));

  return NextResponse.json({ posts });
}

export async function POST(request: Request, { params }: Ctx) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, params.id))
    .get();

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  if (!(await userHasProAccess(userId))) {
    return NextResponse.json({ error: 'Blog requires a Pro subscription' }, { status: 403 });
  }

  let parsed: z.infer<typeof createSchema>;
  try {
    parsed = createSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let slug = parsed.slug?.trim() ? slugifyBlog(parsed.slug.trim()) : slugifyBlog(parsed.title);
  const existing = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(and(eq(blogPosts.portfolioId, portfolio.id), eq(blogPosts.slug, slug)))
    .get();
  if (existing) {
    slug = `${slug}-${nanoid(6)}`;
  }

  const id = nanoid(12);
  const now = new Date();
  const isPublished = parsed.isPublished ?? false;

  await db.insert(blogPosts).values({
    id,
    portfolioId: portfolio.id,
    title: parsed.title,
    slug,
    content: parsed.content,
    excerpt: parsed.excerpt ?? null,
    isPublished,
    publishedAt: isPublished ? now : null,
    createdAt: now,
    updatedAt: now,
  });

  const row = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
  return NextResponse.json({ post: row }, { status: 201 });
}
