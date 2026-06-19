# FolioMint Web — next steps

Primary product: the Next.js web app at the repository root. FolioMint deploys to Vercel, uses Turso/libSQL for data, Groq for AI, Auth.js for OAuth, and Lemon Squeezy for monthly subscriptions.

## Run & build

```bash
npm install
npm run db:push
npm run dev
```

## Active scope

- [x] Root Next.js app is the only product app.
- [x] Turso/libSQL + Drizzle are the production data layer.
- [x] Auth.js supports GitHub and Google/Gmail, with LinkedIn planned through env-backed provider config.
- [x] Lemon Squeezy subscriptions replace one-time license keys.
- [x] Groq parsing remains the AI engine with encrypted BYOK support.
- [x] Hosted portfolios, blog, custom domains, integrations, analytics, and pricing flows live in the web app.

## Follow-ups

- [ ] Finish the cleaned subscription and usage schema migration.
- [ ] Add LinkedIn OAuth credentials in production (`AUTH_LINKEDIN_ID`, `AUTH_LINKEDIN_SECRET`).
- [ ] Tune Groq prompts against real resumes and portfolio examples.
- [ ] Expand portfolio theme presets and editor customization controls.
- [ ] Add webhook idempotency storage for Lemon Squeezy events.
- [ ] Run visual QA for neubrutalist light/dark across marketing, dashboard, editor, pricing, and public portfolios.
