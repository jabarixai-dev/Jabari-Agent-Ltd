# Jabari Revenue OS

Private autonomous revenue platform for a single operator.

## Structure
- `app/` — public face and private Command Center
- `lib/agents/` — agent runtime and definitions
- `lib/core/` — missions, tasks, opportunities, orchestration
- `lib/db/` — Neon database access
- `db/migrations/` — database schema migrations
- `public/brand/` — Jabari brand assets

There is no public signup or multi-tenant SaaS layer.

## Run
1. Copy `.env.example` to `.env.local`
2. Set `DATABASE_URL` and `JABARI_ACCESS_KEY`
3. `npm install`
4. `npm run dev`

Do not apply database migrations until the schema is finalized and approved.

## Repository map

`app/` — website routes and private Command Center.
`lib/agents/` — individual autonomous agents and their registry.
`lib/core/` — orchestration, missions, tasks, opportunities and event history.
`lib/database/` — Neon database client.
`lib/tools/` — shared tool contracts.
`db/migrations/` — Neon schema migrations.
`public/brand/` — Jabari visual identity assets.

Next.js route files such as `page.tsx` and `route.ts` keep their required framework names.
