<p align="center">
  <img src="public/logo.svg" alt="FolioMint" width="96" height="96" />
</p>

<h1 align="center">FolioMint</h1>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white" alt="Next.js 14" /></a>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

<p align="center"><strong>Your resume, turned into a hosted portfolio you are proud to share.</strong><br />
Upload or start from scratch, refine in the editor, and publish on the web in minutes.</p>

## Why FolioMint

A personal site should not be a side quest. FolioMint is a full-stack web portfolio builder for people who want a clear, modern presence online without fighting templates, DNS, analytics, or hosting. You own the story. We help with structure, design, publishing, and iteration.

## What you can do

- **Resume or blank canvas to site** Start from a file, use Groq-assisted parsing, or build manually.
- **Edit with a live preview** Tune profile, experience, projects, and more with feedback as you go.
- **Pick a look that fits** Neubrutalist app UI plus flexible portfolio themes with light and dark support.
- **Publish and grow** Hosted URLs, custom domains, blog posts, SEO, integrations, and analytics.
- **Scale up when it makes sense** Free and monthly Pro tiers keep the product useful without surprise costs.

## Who it is for

Students, career switchers, freelancers, makers, and professionals who want one link that feels like them for jobs, clients, or their network, without maintaining a custom stack.

## License

See [LICENSE](./LICENSE) for details.

## Security

See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities responsibly.

## Run locally (new machine)

Clone the repo and install dependencies:

```bash
git clone https://github.com/launchdoor-studio/foliomint.git
cd foliomint
nvm use
mkdir -p data
npm install
```

Create your environment file. Copy `.env.example` to `.env.local`, then add any secrets you use (for example `GROQ_API_KEY`). `.env.local` is gitignored and must be copied or recreated on each machine.

```bash
cp .env.example .env.local
```

With `LOCAL_DEV_MODE=true` (the default in `.env.example`), you can develop without OAuth or billing setup. AI features use dev stubs when `GROQ_API_KEY` is empty.

Push the database schema and start the app:

```bash
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then try `/generate` or `/dashboard`.

Other useful commands: `npm test`, `npm run lint`, `npm run build`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for stack details and project structure.

---

<p align="center">Product spec: <a href="./SPEC.md">SPEC.md</a> · Task list: <a href="./TODO.md">TODO.md</a></p>
