# FitTrack — Online Personal Training Platform (Level 1 MVP)

Mobile-first PWA for a personal training business: Admin, Trainer, and
Client roles, built on Next.js + Supabase.

## Phase 1 status (this commit)

- Next.js 16 + TypeScript + Tailwind, App Router
- PWA: manifest + service worker (`@ducanh2912/next-pwa`), installable on mobile
- Supabase Auth (email/password) with role-based routing middleware
- Full database schema + Row Level Security policies (`supabase/migrations/0001_init.sql`)
- Role dashboards are stubs — real screens come in Phases 2+

Not built yet: client/trainer management UI, workout/diet builders,
progress tracking, check-ins, messaging, sessions. See the phase plan
below.

## One-time setup: create your Supabase project

You need this before the app can log anyone in.

1. Go to [supabase.com](https://supabase.com) and sign in / create an account.
2. Click **New project**. Pick any name (e.g. `fittrack`), a strong database
   password (save it somewhere safe), and the region closest to your users.
   Wait ~2 minutes for it to provision.
3. In the left sidebar, go to **Project Settings → API**. You'll need three values:
   - **Project URL** → goes in `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → goes in `SUPABASE_SERVICE_ROLE_KEY`
     — **never** put this one in `NEXT_PUBLIC_...`, and never share it or commit it.
4. In this project folder, copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
   Paste the three values from step 3 into `.env.local`.
5. Apply the database schema: in the Supabase dashboard, go to
   **SQL Editor → New query**, paste the entire contents of
   `supabase/migrations/0001_init.sql`, and click **Run**.
   This creates all tables, the roles, and the security (RLS) policies.
6. Create your first Admin account so you can log in:
   - In Supabase, go to **Authentication → Users → Add user** →
     enter your email + a password → **Create user**.
   - Copy the new user's **UUID** shown in the users table.
   - Go back to **SQL Editor** and run (replace the two placeholders):
     ```sql
     insert into profiles (id, role, full_name, email)
     values ('PASTE-THE-USER-UUID-HERE', 'admin', 'Your Name', 'you@example.com');
     ```
7. You're set. Run the app locally (below) and log in with that email/password —
   you'll land on the Admin dashboard.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Note: the PWA
service worker is disabled in development (by design) so hot-reload
isn't fought by caching — test installability with `npm run build && npm start`.

## Deploying (Vercel)

1. Push this repo to GitHub.
2. In [vercel.com](https://vercel.com), **New Project** → import the GitHub repo.
3. Add the same three environment variables from `.env.local` in
   Vercel's **Project Settings → Environment Variables**.
4. Deploy. Every push to `main` redeploys production automatically.

## Phase plan

1. ✅ Setup, auth, roles, database, security (this phase)
2. Admin dashboard, trainer management, client management, assignment/reassignment
3. Trainer dashboard, client dashboard, client profiles
4. Workout system, workout logging, personal records
5. Diet system (PDF upload)
6. Progress tracking, measurements, activity, charts
7. Daily check-ins
8. In-app messaging
9. Session management
10. PWA polish, notifications, responsive pass
11. Production deployment checklist
