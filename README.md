# Cabinet — Doctor Practice Management MVP

A functional MVP for independent doctors in Tunisia to manage patients, appointments,
consultations, and prescriptions. Built as a student project; designed to be small,
understandable, and genuinely usable rather than feature-heavy.

## Changelog — bug fixes & redesign pass

- **Fixed:** diagnosis dropdown validation rejecting real selections (ID format
  mismatch between Zod's `.cuid()` and the seed script's `crypto.randomUUID()`).
- **Added:** `Consultation.symptoms` (doctor-reported symptoms, separate from notes).
- **Added:** "Other" diagnosis option with a free-text `Consultation.customDiagnosis`
  field, displayed everywhere the diagnosis normally appears.
- **Fixed:** overly strict Tunisian phone validation — now accepts common format
  variations and normalizes to `+216 XX XXX XXX` server-side.
- **Redesigned:** color system (genuinely distinct status colors), sidebar, topbar,
  dashboard, patient list/profile, and every form — see `DEVELOPMENT_GUIDE.md` §14
  for the full list of what changed.
- **Requires a migration** — run `npm run db:migrate` after pulling these changes
  (adds `Diagnosis.isOther`, `Consultation.symptoms`, `Consultation.customDiagnosis`;
  all additive/nullable, no existing data is touched).

## 1. Project overview

A signed-in doctor can log in, see a daily dashboard, search and manage patients, run
the full consultation → prescription workflow, and manage appointments. Every button
in the UI does something real against a PostgreSQL database — there is no mock data
rendered client-side.

This app is the **operational layer**. A separate analytical Star Schema (see the
`bi_project/` deliverables from the earlier phase of this project) exists for Power BI
reporting; the two are intentionally different databases with different shapes. See
`DEVELOPMENT_GUIDE.md` → "How the two databases relate" for the mapping.

## 2. Features

- Email/password login (NextAuth, bcrypt-hashed passwords, JWT sessions)
- Dashboard: today's schedule, summary counts, recent patients, quick actions
- Patients: searchable/paginated list, create, edit, full profile with tabs
  (Overview timeline, Consultations, Prescriptions, Appointments)
- Appointments: list with status filters, inline status change, create
- Consultations: create from a patient's profile, optionally linked to an appointment
  (which is then marked completed automatically)
- Prescriptions: multi-medication form, printable prescription view
- Loading skeletons, empty states, and error boundaries on every page
- Server-side validation (Zod) mirrored by inline form errors

## 3. Architecture

```
Doctor's browser
      │
      ▼
Next.js App Router (Server Components for reads, Server Actions for writes)
      │
      ▼
Service layer (src/server/services) — the only code that calls Prisma
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL (operational schema — prisma/schema.prisma)
```

Reads happen directly in Server Components (no client-side data-fetching library
needed for this scale). Writes go through Server Actions, which always:
`requireDoctor()` (re-check the session) → Zod validation → a service function →
`revalidatePath()`. See `DEVELOPMENT_GUIDE.md` for a full walkthrough with real files.

The frontend never talks to PostgreSQL directly and never sees `DATABASE_URL` — all
database access is server-only code (Server Components, Server Actions, and the one
NextAuth API route).

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | One framework for UI + server logic, minimal moving parts for a student team |
| Styling | Tailwind CSS | Fast to build with, no separate CSS files to keep in sync |
| Database | PostgreSQL | Matches the analytical layer's DDL; free, well-documented |
| ORM | Prisma | Type-safe queries, readable migrations, easy to learn |
| Auth | NextAuth.js (Credentials + JWT) | Mature session/cookie handling instead of hand-rolled auth |
| Validation | Zod | One schema shared between server actions and form inline errors |
| Tests | Vitest | Fast, zero-config, works well with TypeScript path aliases |

## 5. Requirements

- Node.js 18.18 or newer (Node 20 LTS recommended)
- PostgreSQL 14+ running locally (or a connection string to any reachable instance)
- npm (comes with Node)

## 6. Installation

```bash
npm install
```

## 7. Environment variables

Copy `.env.example` to `.env` and fill in real values:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string Prisma uses for every query |
| `AUTH_SECRET` | Signs NextAuth's session JWT and cookies — must be a long random string |
| `NEXTAUTH_URL` | Base URL NextAuth uses to build callback links (`http://localhost:3000` for local dev) |

Never commit `.env` — it's already in `.gitignore`.

## 8. Database setup

```bash
npm run db:migrate
```

This creates the schema in your PostgreSQL database from `prisma/schema.prisma`.
The very first time you run this, Prisma will ask you to **name the migration** —
type `init` and press Enter. This is normal and only happens once per new migration.
See `DEVELOPMENT_GUIDE.md` for exact click-by-click steps if you're new to this.

**If you're updating an existing database** (already ran `db:migrate` before this
version): run `npm run db:migrate` again — it will detect three new additive,
nullable/defaulted columns (`Consultation.symptoms`, `Consultation.customDiagnosis`,
`Diagnosis.isOther`) and generate a migration for them. Nothing existing is dropped
or altered. You'll be asked to name this migration too — `add_symptoms_and_other_diagnosis`
is a reasonable choice. Then re-run `npm run db:seed` so the catalog gets its "Other"
diagnosis row.

## 9. Seed instructions

```bash
npm run db:seed
```

Loads the synthetic Tunisian dataset (10 doctors, 3 clinics, 1,000 patients, ~5,000
appointments, 3,500 consultations, 4,000 prescriptions) bundled in `prisma/seed-data/`.
Safe to re-run — it clears existing data first.

**Demo login:** `doctor@demo.local` / `demo1234` (development only — never use this
password anywhere real).

## 10. Running the application

```bash
npm run dev
```

Open `http://localhost:3000`.

## 11. Testing

```bash
npm test
```

Runs the Vitest suite (validation schemas, date/formatting utilities, seed data
integrity). These tests don't require a database connection.

## 12. Project structure

```
doctor-mvp/
├── prisma/
│   ├── schema.prisma       # operational database schema
│   ├── seed.ts             # loads prisma/seed-data/*.csv into Postgres
│   ├── seed-lib/           # CSV parsing helpers used by seed.ts
│   └── seed-data/          # the synthetic dataset (from the BI project phase)
├── src/
│   ├── app/                # pages (App Router) — one folder per route
│   ├── components/ui/      # design-system primitives (Button, Input, Card...)
│   ├── components/layout/  # Sidebar, Topbar, MobileNav
│   ├── features/           # one folder per domain: forms, actions, feature-specific UI
│   ├── lib/                # db client, auth config, session helpers, validation, utils
│   ├── server/services/    # all Prisma queries live here, nowhere else
│   └── types/              # shared TypeScript types
└── tests/                  # Vitest tests
```

## 13. Known limitations

- Only the Doctor role is exposed in the UI (Assistant role exists in the schema —
  see `Role` enum — but has no dedicated screens yet).
- No pagination on the Appointments/Consultations/Prescriptions lists — they cap at
  a reasonable window (Appointments: ±30 days, others: most recent 50). Fine at this
  data volume; would need real pagination before a larger production rollout.
- Patient editing doesn't track change history (no audit log yet).
- No email/SMS reminders, no calendar-grid view (list view only).
- Doctor/clinic profile editing isn't implemented — Settings is read-only.

## 14. Future roadmap

- Assistant role with its own permission-scoped screens
- Audit log table for clinical record changes
- Calendar-grid appointment view
- Patient-facing portal (explicitly out of scope for this MVP)
- ETL job connecting this operational database to the analytical Star Schema
- Notifications (SMS/WhatsApp reminders)
