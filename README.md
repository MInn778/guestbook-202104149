# 미니 방명록 (guestbook-202104149)

개발자: 김민혁-202104149

Next.js (App Router) + TypeScript + Neon Postgres, deployed on Vercel. Built SDD-style: `GLOSSARY.md` → `.scratch/guestbook/spec.md` → `.scratch/guestbook/issues/` → code. See `docs/adr/` for decisions.

## Setup

1. Run `db/schema.sql` once in the Neon SQL Editor.
2. Set environment variables (locally in `.env.local`, and in Vercel → Settings → Environment Variables, then redeploy):
   - `DATABASE_URL`: Neon connection string (required)
   - `ADMIN_PASSWORD`: the single Admin password (required for Admin login; never commit it)
3. `npm install`, `npm run dev`.

## Tests

`npm test` runs the Entries module tests against the database in `.env.local` (they clean up after themselves).
