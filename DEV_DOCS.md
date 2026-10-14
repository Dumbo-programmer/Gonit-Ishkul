# Prothom Alo Gonit Ishkul — Developer & Architecture Documentation

> Living document. Updated whenever a task, feature, schema change, or phase completes.

Last updated: 2026-10-12 (Phase 2 complete)

---

## 1. System Architecture & Tech Stack Summary

### Frontend
* **Framework:** Next.js `14.2.35` (App Router, React Server Components, Server Actions)
* **UI runtime:** React `18.3.1`
* **Styling:** Tailwind CSS `3.4` with a custom brand theme (`tailwind.config.ts`) + `globals.css` component layer (`btn-*`, `card`, `badge`, `field-*`, `math-bg`)
* **Icons:** `lucide-react`
* **Math engine:** `katex` (installed + `globals.css` hooks in place; wired into problem/article pages during Phase 4)
* **Typography:** `next/font/google` — **Hind Siliguri** (Bangla body, `--font-bangla`), **Baloo Da 2** (playful rounded headings, `--font-display`), **Inter** (English/technical, `--font-inter`)
* **i18n:** custom Bangla-first context (`src/lib/i18n`) with cookie persistence (`gi_lang`) and a `bn`/`en` toggle, no external i18n dependency

### Backend
* **Structure:** Next.js Server Actions (`src/app/gonit-doot/actions.ts`, `src/app/courses/actions.ts`) + Route Handlers (`src/app/api/**`)
* **Auth:** NextAuth.js `4.24` (Credentials provider, JWT session strategy, bcryptjs hashing)
* **Validation:** `zod` schemas on every Server Action payload
* **RBAC:** central permission matrix in `src/lib/rbac.ts` (`can(role, permission)`)

### Database
* **Production target:** PostgreSQL via Prisma ORM — full model set in `prisma/schema.prisma` (User, AmbassadorApplication, ApplicationTimeline, AmbassadorProfile, ActivityReport, PointEntry, ResourceItem, Course, Lecture, LectureChapter, LectureAttachment, Quiz, QuizQuestion, Enrollment, LectureProgress, Problem, Submission, Bulletins; enums Role/ApplicationStatus/ActivityType/ActivityStatus/PointSource/CourseLevel)
* **Active dev runtime:** a **file-backed JSON store** (`src/lib/store.ts` → `data/db.json`) exposed through repository modules (`src/lib/repositories/*`). This lets the app boot and be tested without a running PostgreSQL. Set `DATA_SOURCE="prisma"` and run `npm run db:push` to switch the data layer to Prisma (repository interfaces are the swap point).
* **Persistence:** `data/db.json` is auto-seeded on first run and git-ignored.

### Authentication System & Role Permissions Matrix
* Session strategy: **JWT**, secrets via `NEXTAUTH_SECRET`; roles embedded in the token (`src/types/next-auth.d.ts`).
* Seeded demo accounts (JSON store):
  * `admin@gonitishkul.local` / `Admin@12345` → **ADMIN**
  * `mentor@gonitishkul.local` / `Mentor@12345` → **MENTOR**
  * `sakib@example.com` / `Doot@12345` → **AMBASSADOR** (also `nusrat@`, `rifat@`, `tasnim@`, `mehjabin@example.com`)

| Role | apply | viewStatus | reportActivity | downloadKit | viewLeaderboard | review | grade | courses.manage | admin.all |
| :--- | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| STUDENT | ✅ | ✅ | — | — | ✅ | — | — | — | — |
| AMBASSADOR | — | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| MENTOR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| INSTRUCTOR | — | — | — | — | ✅ | — | ✅ | ✅ | — |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 2. Asset Mapping Index (What is used where)

| Asset Path | Component / Page Location | Purpose |
| :--- | :--- | :--- |
| `Resources/Logo.png` → `public/brand/logo.png` | `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/app/layout.tsx` (favicon/OG) | Main brand identity |
| `Resources/GonitBhaiya.jpeg` → `public/brand/gonit-bhaiya.jpeg` | `src/components/HeroBanner.tsx`, `src/components/DootLanding.tsx`, `src/components/DootDashboard.tsx`, `src/components/PhasePlaceholder.tsx` | Weekly puzzle mascot / ambassador avatar |
| `Resources/slogan-4.png` → `public/brand/slogan-4.png` | `src/components/HeroBanner.tsx` | Hero slogan lockup (transparent PNG, 2640×1296) |
| `Resources/slogan.png` → `public/brand/slogan.png` | Resource-kit "Event Poster Template" (`src/lib/store.ts`), OG image (`src/app/layout.tsx`) | Full banner / poster template |
| `Resources/slogan-2/3/5.png` → `public/brand/` | Reserved (unused) | Alternate slogan variants |
| `public/downloads/*.pdf` (generated placeholders) | `src/components/Classroom.tsx` (per-lecture attachments) | Lecture slides / practice sheet / instructor notes downloads |

> Note: the original `slogan.jpg` was replaced by the PNG variants above. `slogan-4.png` (383 KB, alpha) is the hero artwork and is served through `next/image` with explicit dimensions + `sizes` to stay optimized and layout-shift free.

---

## 3. Implemented Features & Phase Progress

- [x] **Phase 1: Ambassador Program Portal ("Gonit Doot")** — *Completed 2026-10-12*
  - *Public landing* (`/gonit-doot`): eligibility, perks, expectations (`src/components/DootLanding.tsx`), selection-process steps, live leaderboard, "Ambassador of the Month" card.
  - *Application form* (`/gonit-doot/apply`): Zod-validated Server Action `submitApplication`, division→district linked selects, statement + resume/social link capture, on-screen tracking-code issuance (`src/components/ApplyForm.tsx`).
  - *Status tracker* (`/gonit-doot/status`): lookup by **tracking code or email**, 5-stage timeline with reached/terminal states (`src/components/StatusResult.tsx`).
  - *Ambassador dashboard* (`/gonit-doot/dashboard`): auth-guarded; stats cards, activity report logger (Server Action `submitActivityReport`, auto points), digital resource-kit download center, bulletin board, leadership board (`src/components/DootDashboard.tsx`).
  - *Mentor/Admin review queue* (`/gonit-doot/review`): 403 for unauthorised roles; approve/reject activity reports (`resolveActivityAction`) and advance application status (`reviewApplicationAction`) (`src/components/ReviewQueue.tsx`).
  - *Interactive Bangladesh map* (`src/components/AmbassadorMap.tsx`): all **64 real district cutouts** (geoBoundaries ADM2 outlines, see §6), coverage heat fill, division filter chips, hover tooltip, click-to-select district detail; 64-district dataset (`src/lib/districts.ts`, `src/lib/bdMap.ts`).
  - *Gamification engine* (`src/lib/points.ts`): activity base points + capped participant bonus, leaderboard aggregation with ranks, 4 scoring tiers.
  - *RBAC layer* (`src/lib/rbac.ts`): full role→permission matrix + `can()` guard, enforced in Server Actions and route pages.
- [x] **Phase 2: Learning & Video Class Platform** — *Completed 2026-10-12*
  - *Course & batch storefront* (`/courses`): level filter chips (Primary, Junior, Secondary, Higher Secondary, BdMO Prep), cards with price, instructor, lecture count, duration and per-student progress (`src/components/CourseStorefront.tsx`, `CourseCard.tsx`).
  - *Course detail* (`/courses/[slug]`): level-tinted hero, instructor/duration/price meta, full curriculum list with locked/completed state, and enroll CTA (`enrollAction`) or "continue learning".
  - *Classroom* (`/courses/[slug]/learn`): auth + enrollment gated; custom **HD video player** with play/pause, seek, mute, playback-speed cycling, request-fullscreen and a **chapter-timestamp** panel (`src/components/VideoPlayer.tsx`).
  - *Downloadable resources*: per-lecture slides / practice sheet / instructor notes with one-click download; placeholder PDFs generated into `public/downloads/`.
  - *Progress tracking*: watch-time is throttled-saved to the server (`saveWatchProgressAction`), resume-from-last-position, 90% watch threshold marks a lecture watched, and a live course progress bar aggregates completion (`src/lib/learning.ts`).
  - *Mandatory post-lecture quizzes*: each lecture has a quiz; passing (default 60%) is required to unlock the next lecture — **sequential gating** enforced in `isLectureUnlocked` (`src/components/QuizPanel.tsx`, `submitQuizAction`).
  - *Data layer*: `CourseRecord`, `LectureRecord` (with chapters + attachments), `QuizRecord`, `EnrollmentRecord`, `LectureProgressRecord`; repository `src/lib/repositories/courses.ts`; seed ships 5 courses × 3 lectures, 15 quizzes, demo enrollments/progress.
- [x] **Phase 10 (partial foundation delivered early): Bilingual + RBAC foundation**
  - Bangla-first context, cookie-persisted `bn`/`en` toggle wired across navbar, hero, footer, and all Phase 1 pages.
  - RBAC middleware-equivalent guards inside Server Actions and server pages.
- [ ] **Phase 3: Problem Solving & Contest Arena** (placeholders `/problems`, `/problems/gonit-bhaiya`)
- [ ] **Phase 4: Resource & Olympiad Library** (placeholder `/resources`; KaTeX dependency + base CSS ready)
- [ ] **Phase 5: Community & Content Pipeline**
- [ ] **Phase 6: Events & School Network** (placeholder `/events`)
- [ ] **Phase 7: Ambassador Gamification & Performance Tracking** (points engine already built in Phase 1)
- [ ] **Phase 8: Interactive Collaborative Learning Tools**
- [ ] **Phase 9: Offline-to-Online Event Media & Gallery**
- [ ] **Phase 10 (remaining): PWA/offline caching, web-push/SMS alerts**

---

## 4. API Routes, Actions & Data Models

### Route Handlers
| Route | Method | File | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | GET/POST | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth credentials sign-in/out |
| `/api/resources/[id]` | GET | `src/app/api/resources/[id]/route.ts` | Increments download counter, redirects to the resource file |

### Server Actions (`src/app/gonit-doot/actions.ts`)
| Action | Permission | Purpose |
| :--- | :--- | :--- |
| `submitApplication` | public | Validate + create ambassador application, issue tracking code |
| `submitActivityReport` | `ambassador.reportActivity` | Create activity report; computes auto points (PENDING) |
| `resolveActivityAction` | `ambassador.review` | Approve/reject a report; approved reports push `PointEntry` |
| `reviewApplicationAction` | `ambassador.review` | Advance application status along the timeline |
| `ensureApplicantUser` | internal | Creates a STUDENT user for a submitted application (future phases) |

### Server Actions (`src/app/courses/actions.ts`)
| Action | Auth | Purpose |
| :--- | :--- | :--- |
| `enrollAction` | required (redirects to sign-in) | Enroll the current user in a course, then redirect to the classroom |
| `saveWatchProgressAction` | required | Throttled watch-time persistence (resume position + 90% completion flag) |
| `submitQuizAction` | required | Grades a lecture quiz, records pass/fail, unlocks the next lecture on pass |
| `isUserEnrolled` | required | Read helper used by server components |

### Repository / Data Layer
| Module | Responsibility |
| :--- | :--- |
| `src/lib/store.ts` | JSON store load/persist + first-run seed (users, applications, activities, kits, bulletins, points, **courses, lectures, quizzes, enrollments, lecture-progress**) |
| `src/lib/repositories/users.ts` | `findUserByEmail`, `createUser`, `verifyPassword` (bcrypt) |
| `src/lib/repositories/ambassador.ts` | applications, activities, leaderboard, district coverage, points |
| `src/lib/repositories/resources.ts` | resource kit + bulletins |
| `src/lib/repositories/courses.ts` | courses, lectures, quizzes, enrollments, progress read/write |
| `src/lib/learning.ts` | pure learning logic — quiz grading, progress %, sequential gating, duration formatting (unit-tested) |

### Prisma Models (production schema)
`User`, `AmbassadorApplication`, `ApplicationTimeline`, `AmbassadorProfile`, `ActivityReport`, `PointEntry`, `ResourceItem`, **`Course`, `Lecture`, `LectureChapter`, `Quiz`, `QuizQuestion`, `Enrollment`, `LectureProgress`**, plus forward-declared `Problem`, `Submission`, `Bulletins`. Enums: `Role`, `ApplicationStatus`, `ActivityType`, `ActivityStatus`, `PointSource`, **`CourseLevel`**.

### Brand Design Tokens (`tailwind.config.ts`)
`brand.orange #FF781E`, `brand.blue #1B4594`, `brand.purple #7952B3`, `brand.red #ED1C24`, `brand.lavender #9E80D2`, `brand.charcoal #222222`, `brand.white #FFFFFF`.

---

## 5. Test Suite Status

* **Unit Tests Passed:** 33 / 33
  * `src/lib/points.test.ts` (7) — points engine, bonus cap, status gating, leaderboard ranking, tiers
  * `src/lib/rbac.test.ts` (6) — role/permission matrix
  * `src/lib/i18n/dictionary.test.ts` (4) — bn/en lookup + bilingual lists
  * `src/lib/bdMap.test.ts` (3) — 64-district shape coverage, viewBox, label centroids
  * `src/lib/learning.test.ts` (13) — duration formatting, 90% watch threshold, quiz grading, progress aggregation, sequential unlock gating
* **Component Tests Passed:** 3 / 3
  * `src/components/LangToggle.test.tsx` (1) — Bangla→English toggle updates consumers
  * `src/components/StatusResult.test.tsx` (2) — timeline rendering + not-found state
* **Total:** 36 / 36 passing (7 files)
* **Command to run tests:** `npm test`  (watch: `npm run test:watch`)
* **Type check:** `npm run typecheck` (tsc --noEmit) — clean
* **Lint:** `npm run lint` (next lint) — clean
* **Production build:** `npm run build` — ✅ compiled successfully (18 routes)

### Verification log
* `npx tsc --noEmit` → 0 errors
* `npm run lint` → 0 warnings/errors
* `npm run build` → success; routes: `/`, `/gonit-doot`, `/gonit-doot/apply`, `/gonit-doot/status`, `/gonit-doot/dashboard`, `/gonit-doot/review`, `/courses`, `/courses/[slug]`, `/courses/[slug]/learn`, `/problems`, `/problems/gonit-bhaiya`, `/resources`, `/events`, `/auth/signin`, `/api/auth/[...nextauth]`, `/api/resources/[id]`
* Runtime smoke test Phase 1 (`next start -p 3111`): `/`, `/gonit-doot`, `/apply`, `/status?code=…`, `/auth/signin`, `/courses` → **200**; `/gonit-doot/dashboard` → **307** (auth redirect); `/api/resources/kit_logo_pack` → **307** (file redirect)
* Runtime smoke test Phase 2 (`next start -p 3112`): `/courses` → **200** (renders seeded "প্রাথমিক গণিত ব্যাচ ১" + "BdMO" batches); `/courses/primary-math-batch-1` → **200**; `/courses/primary-math-batch-1/learn` → **307** (auth redirect when signed out); `/downloads/lecture-slides.pdf` → **200** (placeholder handout served)

---

## 6. Notes, Decisions & Remediation Log

* **Next.js version** — initial scaffold pinned `14.2.15`, which npm flagged as vulnerable; upgraded to patched `14.2.35`.
* **DB-free dev** — to make the platform runnable/testable immediately, Phase 1 runs on the JSON store while the full PostgreSQL Prisma schema ships alongside it. Switching providers only touches `src/lib/repositories/*` + env vars.
* **Download tracking** — implemented as a redirecting Route Handler instead of a Server Action so it works from a plain anchor and survives without client JS.
* **Duplicate i18n key** — a duplicate `dashboard.title` key broke `tsc` (`TS1117`); renamed the field label to `dashboard.reportFieldTitle`.
* **Scoring tier shape** — standardised tier labels to `{bn, en}` to match the i18n convention (fixed `TS2339` in tests and dashboard props).
* **`tList` contract** — list keys (`doot.perks`, `doot.eligibility`, …) are arrays of `{bn,en}` objects; the resolver was corrected to return arrays directly (fixed a failing i18n test).
* **Test isolation** — `getByText("Shortlisted")` collided with the status badge + timeline; switched to `getAllByText(...).length`.
* **Outstanding (non-blocking):** `next-auth` prints a `NEXTAUTH_URL` advisory when the env var is absent at runtime; set `NEXTAUTH_URL` in production. `slogan.png` should be optimised before deploy.

### Redesign pass — Hero & District Map (2026-10-12)
* **Hero redesign (`src/components/HeroBanner.tsx`)** — layered gradient + blurred brand-colour glows, gradient-clipped "গণিত" wordmark, floating math symbol chips, pillar quick-links, a CSS marquee topic ticker, and a transparent `slogan-4.png` lockup with a floating mascot badge. Optimized: single prioritized `next/image` with explicit `2640×1296` dimensions and `sizes`, all decorations are pure CSS (no extra image weight), and every animation respects `motion-reduce`.
* **Real district cutouts (`src/components/AmbassadorMap.tsx`)** — replaced the generic division polygons with genuine ADM2 boundary outlines for all 64 districts. Data pipeline: downloaded `geoBoundaries-BGD-ADM2_simplified.geojson`, projected equirectangularly (cos-latitude corrected), Douglas-Peucker simplified (tol 1.6), rounded to 1 decimal, and emitted `src/data/bd-districts-paths.json` (64 districts, ~5.6k points, **68.6 KB**). Source names are aliased to our dataset (`Chittagong→Chattogram`, `Comilla→Cumilla`, `Jessore→Jashore`, `Bogra→Bogura`, `Nawabganj→Chapainawabganj`, `Netrakona→Netrokona`, `Barisal→Barishal`, `Brahamanbaria→Brahmanbaria`, `Maulvibazar→Moulvibazar`). Map features: coverage heat fill (lavender→orange interpolation), division filter chips, hover tooltip + native `<title>`, click-to-select district detail panel, and labels that appear only where relevant. Zero runtime GeoJSON parsing — paths are static.
* **Replaced asset refs** — `slogan.jpg` (removed by the user) swapped for `slogan-4.png` (hero) and `slogan.png` (poster kit + OG). `data/db.json` deleted so the seed re-runs with the updated poster URL.
* **New tests** — `src/lib/bdMap.test.ts` verifies all 64 districts have shapes, a valid viewBox, and in-bounds label centroids (23/23 passing at this point).

### Phase 2 — Learning & Video Class Platform (2026-10-12)
* **Video strategy** — the player streams public sample MP4s (`gtv-videos-bucket`) with a brand poster; chapters come from `LectureRecord.chapters`, so swapping in the real CDN/HLS URLs is a data-only change. Watch time is persisted on a 10-second throttle, on pause, and on unmount.
* **Gating rule** — the first lecture is always open; every later lecture unlocks only when the previous lecture is both *watched (≥90%)* and *quiz-passed*. This is centralised in `isLectureUnlocked` / `lectureStatus` so UI and server actions agree.
* **Server-action boundary gotcha** — a `"use server"` module may only export async functions; the initial-state object (`INITIAL_QUIZ_STATE`) initially broke `next build` ("can only export async functions, found object") and was moved into `src/lib/learning.ts`.
* **Placeholder handouts** — real (tiny, valid) PDFs are generated into `public/downloads/` (`lecture-slides.pdf`, `practice-sheet.pdf`, `lecture-notes.pdf`, `solution-key.pdf`) so download flows are functional end-to-end; replace with authored content later.

### Phase 4 — Articles, Free Tracks & Admin Console (2026-10-13)
* **Knowledge-sharing, not paid courses** — tracks are grouped by `CourseCategory` (`TRIVIA`, `SOLUTIONS`, `MO_TRAINING`, `ARTICLE_WRITING`); the old `priceBdt` field was removed and every track shows as free. Enrollment remains instant. Category metadata lives in `COURSE_CATEGORIES` / `courseCategoryMeta()` in `src/lib/learning.ts`.
* **Articles & ambassadors** — users can submit articles (`src/lib/repositories/articles.ts`, `src/app/articles/actions.ts`) either as `PUBLIC` (any signed-in user) or `AMBASSADOR` (campus-ambassador channel); submissions enter `PENDING` and are approved/rejected by mentor/admin via `/admin`. Authors track, view and edit their own pieces from `/account` (`/account/articles/[id]/edit`). Bodies render inline/display LaTeX via the existing `MathContent` component.
* **Universal admin** — alongside the seeded `admin@gonitishkul.local`, a full-access account `superadmin@gonitishkul.local` (`SEED_SUPERADMIN_EMAIL`/`SEED_SUPERADMIN_PASSWORD`) exposes all platform metrics, article review and ambassador role management at `/admin`.
* **RBAC additions** — `articles.submit`, `articles.review`, `ambassadors.manage`, `metrics.view` (`src/lib/rbac.ts`); `ADMIN` still short-circuits via `admin.all`.
* **Server-action boundary gotcha (again)** — the shared form-state object `INITIAL_ARTICLE_STATE` lives in `src/lib/articleForm.ts` (not the `"use server"` actions module) to satisfy Next's "only async functions" rule.
* **Seed invariants locked by tests** — `src/lib/store.seed.test.ts` asserts only the six demo names are used, courses carry categories with no pricing, a universal admin exists, and both published + pending articles are seeded.

---

## 7. Local Development Quickstart

```bash
npm install
cp .env.example .env        # a dev .env is already present; override secrets for production
npm run dev                 # http://localhost:3000
npm test                    # vitest
npm run typecheck
npm run lint
npm run build

# Production data layer (PostgreSQL):
#   set DATA_SOURCE="prisma" and DATABASE_URL, then:
npm run db:push
npm run db:generate
```
