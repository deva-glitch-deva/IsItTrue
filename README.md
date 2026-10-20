# Is It True?

A mobile-first, AI-assisted fact checker for Instagram Reels and text claims.
Every result is an estimate with sources and a permanent disclaimer:
**AI-assisted estimate, not absolute truth.**

## Stack

- Next.js 15 App Router, TypeScript, Tailwind
- Prisma + Postgres (optional; memory cache works without it)
- Adapter pattern: OpenAI-compatible LLM, Whisper STT, Tavily search
- No search key: live Wikipedia articles are still attached as clickable sources
- Missing LLM/STT keys fall back to realistic mock adapters

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## Environment

Copy `.env.example` to `.env`. All keys are optional. Zero keys = full demo mode.

```bash
OPENAI_API_KEY=
STT_API_KEY=
SEARCH_API_KEY=
OTHER_AI_API_KEY=
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Keys stay server-side. Never send them to the client.

## Database

```bash
# Create the schema
npx prisma migrate deploy

# Optional sample claims
npm run db:seed
```

Without `DATABASE_URL` the app uses an in-memory cache seeded with 6 sample claims.

## Deploy

See `DEPLOY.md` for Vercel + Postgres steps and a verification checklist.
