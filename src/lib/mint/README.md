# FolioMint — Mint knowledge doc (maintainers)

The file **`foliomint-knowledge.md`** in this folder is injected into Mint's system prompt. It must stay **user-safe**:

- No environment variable names, API keys, webhook URLs, or payment variant IDs
- No internal `/api/` routes, database/table names, or file paths (`src/...`)
- No auth bypass flags, admin routes, or infrastructure stack details
- No full reserved-handle lists or security implementation notes
- Product behavior and **public** UI labels only

When you change product behavior, update `foliomint-knowledge.md` and run:

```bash
npm test -- src/lib/mint/knowledge-security.test.ts
```

Tier limits live in `src/lib/access.ts` — translate changes into plain English in the knowledge doc; do not paste code or paths into the markdown.
