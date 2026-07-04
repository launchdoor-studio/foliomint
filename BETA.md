# FolioMint — Beta release checklist

Last updated: July 4, 2026

Use this document to ship a **closed beta** (trusted testers) and then a **public beta** (open sign-ups, real billing). Product direction: [SPEC.md](./SPEC.md). Ongoing engineering tasks: [TODO.md](./TODO.md).

---

## Current baseline

The app is **beta-ready for core flows**: sign-in → AI resume parse → editor (with Mint assistant, resume health, and section improvements) → publish → public `/u/{handle}` URL. Pro surfaces (blog, custom domain DNS verification, analytics, Lemon Squeezy checkout/webhooks, resume PDF export) are implemented; custom domain **host routing** is still deferred.

**Production checklist:**

- Set `BYPASS_PAYMENT_GATING=false` and provide `GROQ_API_KEY` (platform AI — no BYOK).
- Optional `SIGNUP_TRIAL_PROMO_END` / `SIGNUP_TRIAL_DAYS` for launch Pro trials.
- Dev bypass flags must stay off in production (`NEXTAUTH_DEV_BYPASS` unset).
- **Custom domain host routing is not implemented** — DNS TXT verification works; serving portfolios on `your-domain.com` still needs middleware or Vercel domain config.
- **Portfolio themes:** Neubrutalism only in the editor.
- CI workflow: `.github/workflows/ci.yml` (lint, test, build).

---

## Phase 0 — Repo health (do before any deploy)

- [ ] `npm install` succeeds on a clean machine (Node LTS).
- [ ] `npm run db:push` (local) or `NODE_ENV=production npm run db:push` (Turso) applies schema without errors.
- [ ] `npm run build` completes with zero errors.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes (6 test files under `src/lib/` and `packages/core/`).
- [ ] Review [SECURITY.md](./SECURITY.md) — no secrets in git; `.env.local` gitignored.

---

## Phase 1 — Closed beta (friends & family)

Goal: real OAuth, real database, real publish flow. Payments and custom domains can stay limited.

### 1.1 Infrastructure

- [ ] Create **Turso** database for staging/production.
- [ ] Create **Vercel** project; connect this repo; set production branch.
- [ ] Set Vercel env vars (see table below). Use a **staging** Turso DB first if possible.
- [ ] Run schema push against Turso:
  ```bash
  NODE_ENV=production TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:push
  ```
  Or apply migration `drizzle/0000_bumpy_retro_girl.sql` if you prefer migrate over push.
- [ ] Set `NEXTAUTH_URL` to the deployed origin (e.g. `https://beta.foliomint.com`).
- [ ] Generate a strong `NEXTAUTH_SECRET` (32+ random bytes).

### 1.2 Auth

- [ ] Register OAuth apps for **GitHub** and **Google** with callback URL `{NEXTAUTH_URL}/api/auth/callback/{provider}`.
- [ ] Set `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
- [ ] **Do not** set `NEXTAUTH_DEV_BYPASS` in production.
- [ ] Confirm `/sign-in` lists enabled providers (`getEnabledOAuthProviders` in `src/lib/auth-providers.ts`).
- [ ] Optional for closed beta: defer LinkedIn until `AUTH_LINKEDIN_ID` / `AUTH_LINKEDIN_SECRET` are ready.

### 1.3 Security & gating

- [ ] **Unset** or set `BYPASS_PAYMENT_GATING=false` in production (critical — otherwise everyone gets Pro).
- [ ] Set `GROQ_API_KEY` (platform AI; required for parse and Mint).
- [ ] Confirm middleware protects `/dashboard`, `/editor`, `/generate`, `/preview` (`src/middleware.ts`).
- [ ] Verify unauthenticated users cannot hit portfolio mutation APIs.

### 1.4 AI (closed beta)

- [ ] Set `GROQ_API_KEY` in production (platform key for parse, Mint, and improvements).
- [ ] Document tier limits: Free — 3 parses / 30 days; Pro/trial — 20 parses / day.
- [ ] Test Mint assistant on Generate, Dashboard, and Editor (`Ask Mint` widget).
- [ ] Test resume health panel after parse and **Improve with Mint** on profile fields.
- [ ] Test **Resume PDF** download from editor and manage page.

### 1.5 Payments (optional in closed beta)

- [ ] Leave Lemon Squeezy unset — Free tier only, or manually grant Pro in DB for testers.
- [ ] If testing checkout: configure Lemon Squeezy vars and webhook URL `{NEXTAUTH_URL}/api/webhooks/lemonsqueezy`.

### 1.6 Email (optional)

- [ ] Set `RESEND_API_KEY` and `RESEND_FROM` if you want publish confirmation emails (`src/lib/email.ts`).

### 1.7 Manual test plan — closed beta

Run on the **deployed** URL after each release candidate.

**Auth & account**

- [ ] Sign in with GitHub.
- [ ] Sign in with Google.
- [ ] Sign out; protected routes redirect to `/sign-in`.
- [ ] `/api/me` returns tier and AI key status.

**Create portfolio**

- [ ] **Generate:** upload PDF, DOCX, and TXT (under 4 MB); lands in editor with AI-parsed content and resume health panel.
- [ ] **Generate:** blank canvas creates portfolio and opens editor.
- [ ] Free tier: second portfolio blocked with clear error (when bypass is off).
- [ ] Without platform key: parse fails with clear message.

**Editor**

- [ ] All wizard steps save (profile, skills, experience, education, projects, awards/more).
- [ ] Live preview updates; accent color applies on public site.
- [ ] Set public handle (`/u/your-name`); invalid handles rejected.
- [ ] Publish → success toast + post-publish checklist.
- [ ] Unpublish works.

**Public site**

- [ ] Published portfolio loads at `/u/{handle}`.
- [ ] Legacy slug URL redirects to `/u/{handle}` when handle is set.
- [ ] Light/dark toggle on public portfolio works.
- [ ] Profile links, project link chips, integrations render.
- [ ] `/robots.txt` and `/sitemap.xml` respond.

**Dashboard**

- [ ] Portfolio list, view counts, links to editor and live site.
- [ ] Settings: Mint info (no API key setup).
- [ ] Integrations: add GitHub / LinkedIn / website links; appear on public portfolio.

**Regression**

- [ ] 404 page for missing portfolio.
- [ ] Error boundary does not leak stack traces in production.

### 1.8 Closed beta sign-off

- [ ] 3+ testers complete full flow without you fixing data by hand.
- [ ] No P0 bugs (auth loop, data loss, publish broken, public 500s).
- [ ] Error monitoring in place (Vercel logs minimum; Sentry optional).

---

## Phase 2 — Public beta

Goal: strangers can sign up, hit Free limits, upgrade to Pro, and use Pro features reliably.

### 2.1 Payments (Lemon Squeezy)

- [ ] Create Lemon Squeezy store, **monthly** Pro variant (~$5/mo per [SPEC.md](./SPEC.md)).
- [ ] Set `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_VARIANT_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`.
- [ ] Webhook endpoint: `POST {NEXTAUTH_URL}/api/webhooks/lemonsqueezy` (signature verified in `src/app/api/webhooks/lemonsqueezy/route.ts`).
- [ ] Test checkout → webhook → user `subscriptionStatus` updates → Pro limits unlock.
- [ ] Test cancellation / expiry → user returns to Free limits.
- [ ] Confirm `BYPASS_PAYMENT_GATING` is **false** on production.

### 2.2 Free vs Pro enforcement

- [ ] Free: max **1** published portfolio (`TIER_LIMITS` in `src/lib/access.ts`).
- [ ] Free: AI parse daily cap (3/day) and suggestion monthly cap (10/month).
- [ ] Pro: blog create/publish at `/editor/{id}/blog`.
- [ ] Pro: custom domain UI unlocked; Free sees upgrade prompt.
- [ ] Pro: advanced analytics (referrer, device, country) on `/dashboard/analytics`.
- [ ] Pro: FolioMint footer hidden on public site (`includeFooter: false`).

### 2.3 Custom domains

- [ ] **Implement host-based routing** (not in repo today): middleware or edge config resolves `Host` → portfolio with `customDomainVerified = true`.
- [ ] Add verified domain in Vercel project (or document CNAME target for testers).
- [ ] Test flow: request domain → add `_foliomint.{domain}` TXT → verify → site loads on custom domain.
- [ ] HTTP → HTTPS redirect on custom domain.

### 2.4 OAuth polish

- [ ] LinkedIn provider live (`AUTH_LINKEDIN_ID`, `AUTH_LINKEDIN_SECRET`).
- [ ] OAuth app privacy policy URL points to `{NEXTAUTH_URL}/privacy`.

### 2.5 AI quality

- [ ] Run 10+ real resumes through parse; fix Groq prompt gaps (`src/lib/groq.ts`).
- [ ] Verify project multi-link extraction and bullet normalization.
- [ ] Confirm usage events recorded in `ai_usage_events` for limit enforcement.

### 2.6 Visual & content QA

- [ ] Light and dark mode: marketing home, pricing, sign-in, dashboard, editor, public portfolio, blog.
- [ ] Mobile layout: editor wizard, public portfolio, pricing.
- [ ] Pricing page matches live tier limits.
- [ ] Terms and privacy pages accurate for billing and AI data handling.

### 2.7 CI (recommended)

- [ ] GitHub Action on PR: `npm run lint`, `npm test`, `npm run build`.
- [ ] Optional: preview deploy on Vercel for PRs.

### 2.8 Manual test plan — public beta (additions)

- [ ] Free user hits parse limit → clear upgrade path.
- [ ] Checkout success and cancel URLs land correctly on dashboard.
- [ ] Webhook retry / duplicate event does not double-apply (idempotency via `paymentWebhookEvents`).
- [ ] Pro user creates second published portfolio.
- [ ] Blog post CRUD + public `/u/{handle}/blog/{slug}`.
- [ ] Custom domain end-to-end (after routing implemented).
- [ ] Past_due subscription grace behavior (3-day window in `src/lib/access.ts`).

### 2.9 Public beta sign-off

- [ ] End-to-end paid upgrade tested with real (or LS test mode) card.
- [ ] Support path documented (email or GitHub issues).
- [ ] Rollback plan: previous Vercel deployment + DB backup.
- [ ] Launch announcement only after Phase 1 + Phase 2 checklists are green.

---

## Production environment variables

Copy from [`.env.example`](./.env.example). **Never** commit real values.

| Variable | Closed beta | Public beta | Notes |
|----------|:-----------:|:-----------:|-------|
| `TURSO_DATABASE_URL` | Required | Required | Production DB |
| `TURSO_AUTH_TOKEN` | Required | Required | |
| `NEXTAUTH_SECRET` | Required | Required | Also accepted as `AUTH_SECRET` in middleware |
| `NEXTAUTH_URL` | Required | Required | Must match deployed origin |
| `AUTH_GITHUB_ID` / `SECRET` | Required | Required | |
| `AUTH_GOOGLE_ID` / `SECRET` | Required | Required | |
| `AUTH_LINKEDIN_ID` / `SECRET` | Optional | Recommended | |
| `AI_KEY_ENCRYPTION_SECRET` | Required | Required | BYOK at rest |
| `BYPASS_PAYMENT_GATING` | **false** | **false** | Must not be `true` |
| `NEXTAUTH_DEV_BYPASS` | **unset** | **unset** | Never in production |
| `GROQ_API_KEY` | Optional | Optional | Dev-only unless you add platform key support |
| `LEMONSQUEEZY_*` | Optional | Required | Four vars + webhook secret |
| `RESEND_API_KEY` | Optional | Optional | Publish emails |

---

## Known deferrals (OK for beta v1)

Document these in release notes so expectations match reality:

- Portfolio theme picker limited to **Neubrutalism** in the editor (Classic legacy only).
- Editorial / minimal / terminal themes not shipped as distinct layouts.
- Custom domain **verification** without **host routing** until Phase 2.3 is done.
- Subscription schema cleanup migration ([TODO.md](./TODO.md)).
- No automated E2E browser tests yet.

---

## Quick reference — deploy order

1. Turso DB + schema push  
2. Vercel project + env vars (bypass flags off)  
3. OAuth apps → test sign-in  
4. BYOK docs or platform Groq key  
5. Closed beta manual test plan  
6. Lemon Squeezy + webhooks  
7. Custom domain routing + visual QA  
8. CI + public beta launch  

---

## Related docs

- [SPEC.md](./SPEC.md) — product scope and tiers  
- [TODO.md](./TODO.md) — engineering follow-ups  
- [CONTRIBUTING.md](./CONTRIBUTING.md) — local setup and scripts  
- [SECURITY.md](./SECURITY.md) — vulnerability reporting  
