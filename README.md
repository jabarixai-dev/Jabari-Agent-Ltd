# Jabari Revenue OS

Private, single-operator AI opportunity and revenue operating system.

## Current build

- Public Jabari founder hub (Linktree-style, no signup)
- Red / gold / black visual identity
- Jabari portrait brand asset
- Private Command Center shell
- Agent registry and provider-agnostic runtime
- Orchestrator contract
- Neon-ready initial schema migration
- No public AI assistant yet — intentionally deferred

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Add `DATABASE_URL` when database access is needed.
3. Install dependencies with `npm install`.
4. Start with `npm run dev`.

The public hub is `/` and the private Command Center shell is `/command`.

## Database

`db/migrations/001_initial_schema.sql` is prepared for the Neon migration workflow. Do not apply it directly in production without the approved migration/test process.

## Next implementation step

Connect the real discovery/research tools to the agent runtime, then wire task leasing, mission creation, opportunity persistence and operator controls into the Command Center.

The visitor-facing AI assistant is deliberately not included in this phase.
