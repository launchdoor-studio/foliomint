import { NextResponse } from 'next/server';
import { isDevAuthBypassed } from '@/lib/dev-mode';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { blogPosts, portfolios } from '@/lib/db/schema';
import { userHasProAccess } from '@/lib/pro-access';
import { slugifyBlog } from '@/lib/slug';

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.union([z.string(), z.null()]).optional(),
  isPublished: z.boolean().optional(),
});

interface Ctx {
  params: { id: string; postId: string };
}

async function assertOwner(portfolioId: string, userId: string) {
  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId))
    .get();
  if (!portfolio || portfolio.userId !== userId) {
    return null;
  }
  return portfolio;
}

export async function GET(_request: Request, { params }: Ctx) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await assertOwner(params.id, userId);
  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  const post = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.id, params.postId), eq(blogPosts.portfolioId, portfolio.id)))
    .get();

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await assertOwner(params.id, userId);
  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  if (!(await userHasProAccess(userId))) {
    return NextResponse.json({ error: 'Blog requires a Pro subscription' }, { status: 403 });
  }

  const existing = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.id, params.postId), eq(blogPosts.portfolioId, portfolio.id)))
    .get();

  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let nextSlug = existing.slug;
  if (body.slug !== undefined) {
    nextSlug = slugifyBlog(body.slug);
    if (nextSlug !== existing.slug) {
      const clash = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(and(eq(blogPosts.portfolioId, portfolio.id), eq(blogPosts.slug, nextSlug)))
        .get();
      if (clash && clash.id !== existing.id) {
        nextSlug = `${nextSlug}-${nanoid(6)}`;
      }
    }
  }

  const now = new Date();
  let publishedAt = existing.publishedAt;
  if (typeof body.isPublished === 'boolean') {
    if (body.isPublished && !existing.isPublished) {
      publishedAt = now;
    } else if (!body.isPublished) {
      publishedAt = null;
    }
  }

  await db
    .update(blogPosts)
    .set({
      ...(body.title ? { title: body.title } : {}),
      ...(body.slug !== undefined ? { slug: nextSlug } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
      ...(typeof body.isPublished === 'boolean' ? { isPublished: body.isPublished } : {}),
      publishedAt,
      updatedAt: now,
    })
    .where(eq(blogPosts.id, existing.id));

  const row = await db.select().from(blogPosts).where(eq(blogPosts.id, existing.id)).get();
  return NextResponse.json({ post: row });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const appUser = await getCurrentUser();
  if (!appUser && !isDevAuthBypassed()) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = appUser?.id ?? 'dev-user';

  const portfolio = await assertOwner(params.id, userId);
  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  if (!(await userHasProAccess(userId))) {
    return NextResponse.json({ error: 'Blog requires a Pro subscription' }, { status: 403 });
  }

  const existing = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.id, params.postId), eq(blogPosts.portfolioId, portfolio.id)))
    .get();

  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  await db.delete(blogPosts).where(eq(blogPosts.id, existing.id));
  return NextResponse.json({ ok: true });
}
