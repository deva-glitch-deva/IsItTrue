# Deploy Is It True to Vercel

No code changes are required for a production deploy. The app boots in demo
mode when API keys are missing.

## 1. Create a Postgres database

Pick one:

- [Neon](https://neon.tech) — New project, copy the connection string
- [Supabase](https://supabase.com) — Project settings > Database > URI
- [Vercel Postgres](https://vercel.com/storage/postgres) — Create store, connect to the project

Use the pooled URL if the provider offers one.

## 2. Set environment variables

In the Vercel project, add:

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | For shared cache / trending | Postgres connection string |
| `OPENAI_API_KEY` | For live LLM | OpenAI-compatible |
| `OPENAI_BASE_URL` | No | Default `https://api.openai.com/v1` |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |
| `OTHER_AI_API_KEY` | No | Fallback LLM |
| `OTHER_AI_BASE_URL` | No | |
| `OTHER_AI_MODEL` | No | |
| `STT_API_KEY` | For live transcription | Whisper-compatible |
| `STT_BASE_URL` | No | |
| `STT_MODEL` | No | Default `whisper-1` |
| `SEARCH_API_KEY` | For Tavily web search | Optional. Wikipedia is used when this is empty |
| `SEARCH_PROVIDER` | No | Default `tavily` |
| `NEXT_PUBLIC_SITE_URL` | For OG / share cards | `https://your-domain` |

Leave keys empty to stay in demo mode.

## 3. Run the migration

After the first deploy, or locally against production:

```bash
npx prisma migrate deploy
npm run db:seed
```

`prisma generate` already runs in `postinstall` and in `vercel.json` `buildCommand`.

## 4. Deploy

```bash
npx vercel --prod
```

Or connect the Git repo in the Vercel dashboard. Framework: Next.js.

## 5. Verification checklist

- [ ] Production build, lint and typecheck pass locally (`npm run lint && npm run typecheck && npm run test && npm run build`)
- [ ] Home, Verify, Analysis, Results, Trending, Daily, History, Settings, How it works, Privacy, Terms, Gullibility all load
- [ ] Custom 404 loads for a missing path
- [ ] `/api/health` returns `{ ok: true }`
- [ ] Demo badge shows when keys are missing
- [ ] Paste a seed claim (Eiffel Tower temporary) and get True
- [ ] Paste a thin claim and get Unverified, not a guess
- [ ] Reel URL without caption shows a friendly message and opens the caption field
- [ ] File upload rejects non-media and files over 25 MB
- [ ] Guess First: min bet 5, max 50% of balance, win pays 2x
- [ ] Daily game: 5 claims, +5 per correct, streak bonus, no double-claim on refresh
- [ ] Serious Mode locks slang, sound, betting and coins
- [ ] Share card is 9:16 and includes the disclaimer
- [ ] Security headers: CSP, X-Frame-Options, Referrer-Policy
- [ ] Keys never appear in client bundles
- [ ] Favicon, OG image, manifest, robots.txt present

## Local preview after deploy config

```bash
npm run build
npm start
```
