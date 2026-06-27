##  Masroof — مصروف

A modern, bilingual (English / العربية) personal finance manager.
Built with **React + Vite** (Bun). Sign in with **Clerk** and your data syncs to the
cloud (**MongoDB Atlas**) so it's available on any device — `localStorage` is kept only
as an offline cache.

تطبيق حديث ثنائي اللغة لإدارة الدخل والميزانية. تسجّل الدخول وبياناتك تتزامن سحابيًا فتلاقيها من أي جهاز.

---

## Run / التشغيل

Requires [Bun](https://bun.sh) ≥ 1.3. First copy the env template and fill it in
(see **Cloud sync setup** below):

```bash
cp .env.example .env.local      # then add your Clerk + MongoDB keys
bun install
```

**Full app (auth + cloud sync)** — runs the Vite app *and* the `/api` serverless
functions together via the Vercel CLI:

```bash
bun add -g vercel      # once
vercel dev             # http://localhost:3000
```

**UI-only** (no backend; sync calls fail gracefully to the offline cache):

```bash
bun run dev            # http://localhost:3000
```

> Without `VITE_CLERK_PUBLISHABLE_KEY` set, the app shows a "Setup needed" screen.

---

## Cloud sync setup (Clerk + MongoDB)

1. **Clerk** → create an application, copy the **Publishable key** and **Secret key**.
2. **MongoDB Atlas** → create a free (M0) cluster → add a DB user → Network Access
   `0.0.0.0/0` → copy the connection string.
3. Put all three into `.env.local` (and into **Vercel → Settings → Environment Variables**):

   | Variable | Where it runs | Notes |
   |---|---|---|
   | `VITE_CLERK_PUBLISHABLE_KEY` | browser (build-time) | must be `VITE_`-prefixed |
   | `CLERK_SECRET_KEY` | serverless (runtime) | **server-only** |
   | `MONGODB_URI` | serverless (runtime) | **server-only** |

Each user's full app state is stored as one document in the `userStates` collection,
keyed by their Clerk user id.

## Deploy to Vercel

1. Import the GitHub repo into Vercel (framework auto-detected as **Vite**;
   build `vite build`, output `dist`, `/api` deployed as serverless functions).
2. Add the three environment variables above.
3. Deploy. The first build with the keys present bundles the full app.

---

## Features / المميزات

**Income management** — log salaries & side income, flag recurring entries, filter by month.

**Expense tracking** — categories, cash/card payment, search & filters, recurring flag.

**Budgets** — overall monthly budget + per-category limits with color-coded progress bars and over-budget alerts.

**Savings goals** — targets with deadlines, progress, and the monthly contribution needed to hit each goal.

**Spending analytics** (the dashboard) — an animated ring gauge compares what you've
spent against the **expected pace for the day of the month**, and flags whether you're
spending **more / on track / less** than expected. A **smart tip** then tells you exactly
how much to trim per day for the remaining days to rebalance the month (e.g. *"Trim about
263 EGP/day for the next 8 days"*).

**Financial calculations**:
- Net balance & **savings rate**
- **Average daily spend** and **safe-to-spend per day** for the rest of the month
- **Budget used %** and **projected month-end balance** (based on current burn rate)
- **50 / 30 / 20 rule** — Needs / Wants / Savings vs the recommended split
- Month-over-month deltas (↑/↓ vs last month)
- 6-month income-vs-expenses trend chart
- Spending breakdown by category (donut) and by payment method (bars)

**Accounts & transfers** — track real balances per account (bank / cash / card), move money
between them, and see your true available cash — not just what was spent.

**Subscriptions & bills** — recurring bills with due dates, paid / overdue / due-soon status,
your total monthly commitment, one-tap "mark paid" (logs the expense), and upcoming-bill alerts
on the dashboard.

**Insights & alerts** — budget-threshold alerts (configurable 70–100%), spending-spike detection
(a category running above its 3-month average), and your biggest expenses at a glance.

**Rich transactions** — edit any entry, attach a (compressed) receipt photo, and add a
merchant/payee + free-form tags, then search and filter by them.

**Cards** — save cards with custom colors; see per-card spending this month.

**Security (PIN lock)** — optional 4-digit PIN gate to protect your financial data, with a lock-now button. *(Local privacy guard — data still lives in your browser's storage.)*

**Appearance** — Microsoft **Fluent**-inspired design with realistic line icons (no emoji),
light / dark theme, English ⇄ العربية (full RTL), animated ring gauges, reveal & count-up
animations, smooth scrolling, and selectable currency (EGP, USD, EUR, SAR, AED…).

**Reports** — generate a clean, statement-style **PDF report** or a multi-sheet **Excel
(.xlsx)** workbook (Summary / Income / Expenses / Budgets / Goals) for any month or all-time.

**Data** — JSON backup export & import, or clear all.

**Help on hover** — every figure has a small ⓘ badge; hover it to read exactly what it means
and how it's calculated.

------------

## Notes / ملاحظات

- **Data lives in the cloud** (MongoDB Atlas), scoped to your Clerk account, so you can sign
  in on any device and see it. `localStorage` is only an offline cache + the source for the
  one-time migration of pre-account local data.
- Edits save optimistically and sync (debounced) to the server; the top bar shows
  **Synced / Saving / Offline**. Offline edits flush on reconnect.
- The optional 4-digit **PIN** is now a secondary *local* lock on top of account sign-in.
- The original vanilla-JS app is preserved under [`legacy/`](legacy/).

## Project structure

```
api/          Vercel serverless functions (state GET/PUT, Clerk auth, Mongo)
src/
  lib/        storage/cache, api client, calculations, formatting, categories
  context/    global app state + cloud sync (data, theme, locale, PIN)
  components/ Sidebar, TopBar, LockScreen, AuthScreen, Charts, shared UI
  pages/      Dashboard, Income, Expenses, Ledger, Budgets, Goals, Cards, Settings
  i18n.js     English / Arabic dictionary
  styles/     design system (themes + RTL)
```
