# FolioMint — Product Spec

Last updated: June 19, 2026

## Overview

FolioMint is a full-stack web portfolio builder. Users sign in, import a resume or start manually, refine their content in a guided editor with live preview, and publish a hosted portfolio at a FolioMint URL or custom domain.

The product is web-only. Desktop, Tauri, local-only export, and one-time license-key payments are out of scope.

## Architecture

| Layer | Choice |
|-------|--------|
| App | Next.js App Router on Vercel |
| UI | React, TypeScript, Tailwind CSS, Framer Motion |
| Database | Turso/libSQL with Drizzle ORM |
| Auth | Auth.js/NextAuth v5 with GitHub, Google/Gmail, and LinkedIn |
| Payments | Lemon Squeezy monthly subscriptions |
| AI | Groq for resume parsing and portfolio-writing assistance |
| Email | Resend for optional lifecycle email |
| Shared logic | `packages/core` for schemas, parser utilities, Groq helpers, and tier rules |

## Product Flow

1. Sign in with GitHub, Google/Gmail, or LinkedIn.
2. Create a portfolio from a resume upload, pasted text, or a blank editor.
3. Use Groq-assisted parsing and suggestions where allowed by tier and user settings.
4. Refine content in a modular editor with live preview.
5. Customize theme, layout, accent colors, typography, social links, SEO, and visibility.
6. Publish to `/u/{handle}` and optionally connect a custom domain.
7. Track analytics and keep improving the portfolio over time.

## Tiers

| | Free | Pro |
|---|------|-----|
| Monthly price | $0 | Target $5/month |
| Published portfolios | 1 | Multiple |
| AI parsing | Limited | Higher limits and rewrite suggestions |
| Portfolio themes | Core themes | Premium themes and deeper customization |
| FolioMint footer | Included | Removable |
| Blog | Not included | Included |
| Custom domains | Not included | Included |
| Analytics | Basic views | Referrer, device, country, and trends |

Free should remain useful enough to publish a real portfolio. Pro should cover recurring AI, database, hosting, webhook, and support costs without feeling expensive.

## Design Direction

FolioMint uses end-to-end neubrutalism: sharp borders, chunky shadows, tactile controls, crisp editorial layout, and a palette anchored around the logo colors. The app supports light and dark themes. Portfolio sites support broader theme choices, including accent palettes, font pairings, section treatments, and layout density.

Motion should feel physical and confident: press states, card lifts, short reveals, and reduced-motion support. Avoid decorative noise that makes portfolio creation feel less professional.

## Core Features

- Resume import for PDF, DOCX, and TXT.
- Manual portfolio creation with strong empty states.
- Portfolio-specific Groq parsing and editable suggestions.
- Modular editor for profile, experience, projects, education, skills, certifications, awards, languages, links, custom sections, blog, SEO, and domain settings.
- Public hosted portfolios with light/dark support.
- Blog CRUD for Pro portfolios.
- Custom domain request and DNS TXT verification.
- Integrations for GitHub, LinkedIn, X, Bluesky, YouTube, website, Mastodon, Dribbble, Behance, Discord, and similar profile links.
- Analytics with tiered depth.
- Lemon Squeezy checkout and subscription webhooks.

## Operational Goals

- Deploy entirely on Vercel where possible.
- Keep Turso as the production database.
- Avoid persistent file storage for resume uploads by parsing in memory.
- Add object storage only when user-uploaded portfolio images become a product requirement.
- Keep local development cheap through SQLite, dev auth bypass, and payment gating bypass.
