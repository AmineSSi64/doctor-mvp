# Development Guide

This guide explains what was built, how it works, and exactly what to click/type to
run it — written for a student seeing this codebase for the first time on
**Visual Studio Code, Windows**.

---

## 1. Project structure

```
doctor-mvp/
├── prisma/
│   ├── schema.prisma      # The operational database's shape (tables, columns, relations)
│   ├── seed.ts             # Script that fills your database with synthetic demo data
│   ├── seed-lib/csv.ts     # Small helper that reads the .csv files seed.ts needs
│   └── seed-data/*.csv     # The actual synthetic Tunisian dataset (patients, doctors...)
│
├── src/
│   ├── app/                 # Every folder here is a URL. app/patients/page.tsx = /patients
│   │   ├── (app)/            # Route "group" — pages a logged-in doctor uses (has sidebar)
│   │   │   ├── layout.tsx     # Wraps every (app) page with Sidebar + Topbar, checks login
│   │   │   ├── dashboard/
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   ├── consultations/
│   │   │   └── prescriptions/
│   │   ├── login/page.tsx    # The one public page
│   │   └── api/auth/          # NextAuth's login/logout machinery — you won't edit this
│   │
│   ├── components/
│   │   ├── ui/                # Generic building blocks: Button, Input, Card, Badge...
│   │   │                        These know nothing about "patients" or "appointments".
│   │   └── layout/             # Sidebar, Topbar, MobileNav — the app's outer shell
│   │
│   ├── features/               # One folder per real-world thing: patients, appointments...
│   │   └── <feature>/
│   │       ├── actions.ts       # Server Actions — the only code allowed to write to the DB
│   │       └── *-form.tsx        # The React form component for that feature
│   │
│   ├── server/services/         # One file per feature. The ONLY code allowed to call Prisma
│   │                              for reading data. (actions.ts calls these too, for writing.)
│   │
│   ├── lib/
│   │   ├── db.ts                # Creates the one shared Prisma connection
│   │   ├── auth.ts               # NextAuth configuration (how login works)
│   │   ├── session.ts             # requireDoctor() — the guard every protected page/action uses
│   │   └── validation/schemas.ts  # Zod schemas — the rules a Patient/Appointment/etc must follow
│   │
│   └── types/                    # Shared TypeScript type definitions
│
└── tests/                        # Automated tests (npm test)
```

**Rule of thumb:** if you're looking for where a page's *look* is defined, check
`src/app/.../page.tsx`. If you're looking for where a button's *action* is defined,
check `src/features/<feature>/actions.ts`. If you're looking for the actual database
query, check `src/server/services/<feature>Service.ts`.

---

## 2. How the application works, end to end

Every write in this app follows the same path:

```
Doctor clicks "Create Patient"
        │
        ▼
React form component (src/features/patients/patient-form.tsx)
   — a normal HTML <form>, but its `action` prop points at a Server Action
        │
        ▼
Server Action (src/features/patients/actions.ts → createPatientAction)
   1. requireDoctor()         — re-checks the session on the server; the browser
                                 cannot fake this
   2. patientSchema.safeParse — validates every field (Zod)
   3. createPatient(...)      — calls the service layer
        │
        ▼
Service (src/server/services/patientService.ts → createPatient)
   — the only place that calls db.patient.create(...)
        │
        ▼
Prisma → PostgreSQL
        │
        ▼
revalidatePath("/patients")   — tells Next.js "the patients list is now stale"
        │
        ▼
Server Action returns { success: true, patientId }
        │
        ▼
The form component redirects to the new patient's profile page
```

Reads (just displaying data, no button click) are simpler — a page like
`src/app/(app)/patients/page.tsx` is a **Server Component**: it runs on the server,
calls a service function directly (`listPatients(...)`), and renders HTML with the
result. There's no separate API call the browser has to make.

---

## 3. How the database connection works

- **`DATABASE_URL`** (in your `.env` file) is a connection string:
  `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`. Prisma reads this at startup.
- **Prisma (the ORM)** turns `prisma/schema.prisma` into TypeScript types and query
  functions. Run `npm run db:generate` any time you change `schema.prisma` to
  regenerate those types.
- **`src/lib/db.ts`** creates exactly one `PrismaClient` and reuses it everywhere
  (important in development, where Next.js reloads files constantly — without this,
  you'd open a new database connection on every file save).
- **Migrations** are how you apply schema changes to an actual database.
  `npm run db:migrate` compares `schema.prisma` to your database, generates a SQL
  file describing the difference, and runs it. Every migration is saved under
  `prisma/migrations/` so your teammates can apply the same changes.
- **Queries**: nothing outside `src/server/services/*.ts` should ever import
  `@/lib/db` directly. That's a convention, not a technical restriction — it keeps
  every database query in one place per feature so you can find them.

---

## 4. How authentication works

- **Login**: the form at `/login` calls NextAuth's `signIn("credentials", ...)`, which
  sends the email/password to `src/lib/auth.ts`'s `authorize()` function. That
  function looks up the `User` by email, and compares the password against the
  stored `bcrypt` hash — the plaintext password is never stored anywhere.
- **Session**: on success, NextAuth issues a signed JWT stored in an HTTP-only cookie
  (JavaScript in the browser cannot read it). That JWT carries the user's `role` and
  `doctorId` (see the `jwt`/`session` callbacks in `src/lib/auth.ts`).
- **Protected routes**: `src/middleware.ts` blocks any request to `/dashboard`,
  `/patients`, etc. that doesn't have a valid session cookie, redirecting to `/login`.
- **Protected actions**: middleware only protects *pages*. Every Server Action also
  calls `requireDoctor()` (from `src/lib/session.ts`) itself, because a page being
  reachable doesn't mean a specific action should be allowed — this is what the task
  brief means by "the frontend hiding a button is not authorization."
- **Roles**: the `Role` enum (`DOCTOR` | `ASSISTANT`) already exists on `User`, and
  `requireDoctor()` already checks it. Only `DOCTOR` has UI today — see §6 for how
  you'd add an Assistant-facing page later.

---

## 5. How a patient is created (full file walkthrough)

1. **`src/app/(app)/patients/new/page.tsx`** — the page at `/patients/new`. It just
   renders `<PatientForm />` with no `patient` prop (meaning "create mode").
2. **`src/features/patients/patient-form.tsx`** — a client component (`"use client"`
   at the top, because it uses `useState`/`useFormState`). It binds its `<form>`'s
   `action` to the `createPatientAction` Server Action. On success (`state.success`),
   it redirects to the new patient's profile.
3. **`src/features/patients/actions.ts`** → `createPatientAction`:
   - calls `requireDoctor()`
   - reads the raw form fields out of `FormData`
   - validates them with `patientSchema` (`src/lib/validation/schemas.ts`)
   - if validation fails, returns `{ success: false, fieldErrors }`, which the form
     displays next to each field
   - if it succeeds, calls `createPatient(parsed.data)`
4. **`src/server/services/patientService.ts`** → `createPatient`:
   - generates the next human-friendly `patientCode` (`PAT00123`)
   - calls `db.patient.create(...)`
5. Back in the action: `revalidatePath("/patients")` so the list page shows the new
   patient next time it's visited, then returns `{ success: true, patientId }`.

---

## 6. How to add a new feature (worked example: "Medical Documents")

Say you want doctors to attach documents (lab results, scanned referrals) to a patient.

1. **Add the table** to `prisma/schema.prisma`:
   ```prisma
   model Document {
     id        String   @id @default(cuid())
     patientId String
     title     String
     fileUrl   String
     uploadedAt DateTime @default(now())

     patient Patient @relation(fields: [patientId], references: [id])

     @@map("documents")
   }
   ```
   Add `documents Document[]` to the `Patient` model too (every relation needs both sides).
2. **Migrate**: `npm run db:migrate` — name it something like `add_documents`.
3. **Validation**: add a `documentSchema` to `src/lib/validation/schemas.ts`.
4. **Service**: create `src/server/services/documentService.ts` with
   `listDocumentsForPatient(patientId)` and `createDocument(input)`.
5. **Action**: create `src/features/documents/actions.ts` with
   `createDocumentAction`, following the same `requireDoctor → validate → service →
   revalidatePath` shape as every other action in this project.
6. **UI**: add a "Documents" entry to `PatientProfileTabs`
   (`src/features/patients/profile-tabs.tsx`) and a small upload form component.
7. **Test**: add a `documentSchema` validation test to `tests/validation.test.ts`.

Following an existing feature (Prescriptions is the most similar — a form that
belongs to a specific parent record) as a template is the fastest way to stay
consistent with the rest of the app.

---

## 7. How to run the application — exact commands

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Then open **http://localhost:3000** in your browser. Log in with
`doctor@demo.local` / `demo1234`.

---

## 8. How to reset the development database

```bash
npm run db:reset
```

This drops everything, re-applies every migration from scratch, and automatically
re-runs the seed script afterward (Prisma calls the `prisma.seed` command configured
in `package.json`). Use this if your database gets into a confusing state.

---

## 9. How to seed synthetic data

```bash
npm run db:seed
```

Safe to run as many times as you like — it clears existing data first, then reloads
the bundled dataset from `prisma/seed-data/*.csv`. It also **shifts every
appointment/consultation/prescription date** so "today" in the app lines up with
your real current date — see the comment at the top of `prisma/seed.ts` if you're
curious why (short version: the synthetic dataset was generated against a fixed
reference date, and without this shift the dashboard would look empty the moment
that reference date is in the past).

---

## 10. How to troubleshoot common errors

### "Can't reach database server" / PostgreSQL connection error

1. Confirm PostgreSQL is actually running. Open **Services** (press
   `Windows key`, type `Services`, press Enter), find **postgresql-x64-\<version\>**,
   and confirm its status is "Running". If not, right-click → **Start**.
2. Open `.env` and confirm `DATABASE_URL` has the right username, password, host,
   port, and database name. The default port is `5432`.
3. Confirm the database itself exists — open **pgAdmin**, connect to your server,
   and check there's a database named `doctor_mvp` (or whatever you put after the
   last `/` in `DATABASE_URL`). If it's missing, right-click **Databases** →
   **Create** → **Database...** and name it to match.

### "Environment variable not found: DATABASE_URL"

You don't have a `.env` file yet, or it's not in the project's root folder
(the same folder as `package.json`). Copy `.env.example` to `.env` and fill it in —
see §13 below for exact VS Code steps.

### Migration errors ("drift detected", "migration failed to apply")

Your database's actual structure and `prisma/schema.prisma` have diverged (common
if you edited the schema by hand in pgAdmin, or interrupted a previous migration).
The simplest fix for a development database with no important data is:
```bash
npm run db:reset
```

### npm errors on `npm install`

- **"npm is not recognized..."** — Node.js isn't installed, or your terminal was
  opened before installing it. Install Node.js (see §12), then close and reopen
  your terminal/VS Code completely.
- **`ERESOLVE` dependency conflict** — try `npm install --legacy-peer-deps` once;
  if that's not acceptable, check that your Node version is 18.18+ (`node -v`).

### "Port 3000 is already in use"

Something else (often a previous `npm run dev` you forgot to stop) is using port
3000. Either close that terminal window, or run on a different port:
```bash
npm run dev -- -p 3001
```

### Authentication problems ("Incorrect email or password" even with the demo account)

1. Confirm you actually ran `npm run db:seed` — without it, no `User` rows exist at
   all, so no login can succeed.
2. Confirm `AUTH_SECRET` is set in `.env` — an empty or missing value can cause
   NextAuth to behave unpredictably.
3. If you changed the seed script and re-ran it, remember the demo password is
   always `demo1234` for `doctor@demo.local` — it's fixed in `prisma/seed.ts`.

---

## 11. How the two databases relate

This project intentionally has **two separate schemas** that are not the same shape:

| | This app (`prisma/schema.prisma`) | The analytical Star Schema (separate project) |
|---|---|---|
| Shape | Normalized (3NF) — `Patient`, `Appointment`, `Consultation`... | Star Schema — `Dim_Patient`, `Fact_Appointment`... |
| Patient history | One row per patient, always current | `Dim_Patient` keeps old versions (SCD Type 2) |
| Purpose | Fast single-record reads/writes for the web app | Fast aggregation for Power BI dashboards |
| Who changes it | This application, live | A future ETL job, on a schedule |

They stay in sync only through an ETL/ELT process (`Operational PostgreSQL → ETL →
Analytical PostgreSQL → Power BI`), which is out of scope for this MVP but is exactly
why the operational schema's enums (`AppointmentStatus`, `ConsultationType`) were
deliberately kept identical in spelling to the analytical model's
`Dim_Appointment_Status` / `Dim_Consultation_Type` values — a future ETL script can
copy them across without a translation table.

---

## 12. First-time setup on a brand new Windows machine

If Node.js and PostgreSQL aren't installed yet:

**STEP 1** — Install Node.js
Go to `https://nodejs.org`, download the **LTS** installer for Windows, run it,
click Next through the defaults, finish.

**STEP 2** — Install PostgreSQL
Go to `https://www.postgresql.org/download/windows/`, download the installer, run
it. When asked, set a password for the `postgres` user — **write it down**, you'll
need it for `DATABASE_URL`. Keep the default port `5432`.

**STEP 3** — Create the database
Open **pgAdmin** (installed alongside PostgreSQL — search for it in the Start Menu).
Connect using the password from Step 2. Right-click **Databases** in the left
sidebar → **Create** → **Database...**. Name it `doctor_mvp`. Click **Save**.

**STEP 4** — Verify
Open a terminal (Command Prompt or PowerShell) and run:
```bash
node -v
npm -v
```
Both should print a version number. If not, close and reopen your terminal —
installers sometimes need a fresh terminal to update your PATH.

---

## 13. Opening and configuring the project in VS Code

**STEP 1** — Open VS Code.

**STEP 2** — Open the project folder: **File → Open Folder...** → select the
`doctor-mvp` folder → **Select Folder**.

**STEP 3** — Open a terminal inside VS Code: **Terminal → New Terminal** (or
`` Ctrl+` ``).

**STEP 4** — Run:
```bash
npm install
```

**STEP 5** — Create your environment file. In VS Code's file explorer (left side),
right-click the `doctor-mvp` root folder → **New File** → name it exactly `.env`.

**STEP 6** — Paste this into `.env`, replacing the password with the one you set in
pgAdmin:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/doctor_mvp?schema=public"
AUTH_SECRET="paste-a-long-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```
For `AUTH_SECRET`, run this in your VS Code terminal and paste the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**STEP 7** — Save the file (`Ctrl+S`).

**STEP 8** — Back in the terminal:
```bash
npm run db:migrate
```
You'll be asked to **name the migration** the first time — type `init` and press
Enter. Then:
```bash
npm run db:seed
npm run dev
```

**STEP 9** — Open your browser to `http://localhost:3000` and log in with
`doctor@demo.local` / `demo1234`.

---

## 14. What changed in the bug-fix + redesign pass

If you're comparing against an earlier version of this project, here's what moved
and why — useful if you have local edits to reconcile.

### Bugs fixed

- **`src/lib/validation/schemas.ts`** — replaced `z.string().cuid()` with a new
  `entityId()` helper that accepts both cuid (app-created records) and uuid
  (seed-script records). This was the root cause of "Select a diagnosis" appearing
  even when a diagnosis was selected: `prisma/seed.ts` generates ids with
  `crypto.randomUUID()`, and Zod's `.cuid()` validator rejected them outright.
- **`src/lib/phone.ts`** (new file) — `normalizeTunisianPhone()` accepts common
  format variations and normalizes to `+216 XX XXX XXX` before it's ever written to
  the database. `patientSchema.phone` now uses `.transform()` to apply it
  server-side; `patient-form.tsx` also reformats the field on blur.

### Schema changes (`prisma/schema.prisma`)

- `Consultation.symptoms String?` — doctor-reported symptoms, separate from
  `notes` (the doctor's own clinical observations).
- `Consultation.customDiagnosis String?` — free text captured when the doctor
  picks "Other" in the diagnosis dropdown.
- `Diagnosis.isOther Boolean @default(false)` — marks the one catalog row used as
  the "Other" target; a boolean flag rather than matching on `name === "Other"` so
  the label can be renamed without breaking anything.

All three are additive and nullable/defaulted — run `npm run db:migrate` and
existing rows are untouched.

### How "Other" diagnosis works end to end

1. `consultation-form.tsx` renders every real diagnosis plus one extra
   `<option value="OTHER">` — `OTHER` is a constant
   (`OTHER_DIAGNOSIS_VALUE` in `schemas.ts`), not a real database id.
2. Selecting it reveals a "Specify diagnosis" text input
   (`customDiagnosis`), required via `consultationSchema`'s `.superRefine()`.
3. `consultationService.ts`'s `createConsultation()` resolves the `OTHER` sentinel
   to the catalog's real "Other" row (creating it if a database was seeded before
   this feature existed) — the Zod schema itself never needs to know that id.
4. Everywhere a consultation's diagnosis is displayed, it reads
   `consultation.customDiagnosis || consultation.diagnosis.name` — see
   `diagnosisLabel()` in `profile-tabs.tsx`.

### Design system

- **Colors** (`globals.css`, `tailwind.config.ts`) — added a genuine `info` blue;
  `success` used to be identical to `primary` (both the same teal), which is why
  Scheduled and Completed looked the same — they're now distinct hues.
- **`AppointmentStatusBadge`** (`src/components/appointments/status-badge.tsx`,
  new) — the one place status is rendered anywhere in the app: icon + tinted
  background + colored text, one pairing per status.
- **`PageHeader`, `FormSection`** (`src/components/ui/`, new) — shared components
  so every page's title and every multi-field form's section grouping look the
  same instead of being hand-rolled per page.
- **`Logo`** (`src/components/ui/logo.tsx`, new) — the app's one brand mark.
  `APP_NAME` lives here too, so renaming the product is a one-line change.
- **`ToastProvider`** (`src/components/ui/toast-provider.tsx`, new) — success
  toasts after a Server Action redirect; wrapped around the `(app)` layout, used
  via `useToast()` in every form.
