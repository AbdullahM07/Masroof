# Masroof — product truth

**What it is.** A bilingual (English / Arabic, full RTL) personal-finance manager for one person's monthly money: income, expenses, budgets, savings goals, accounts and transfers, recurring bills, and cards. Data is per Clerk account and syncs to MongoDB; localStorage is only an offline cache.

**Who uses it.** An individual (Egypt-first, EGP default) checking their month on a laptop at a desk or on a phone in the evening. They already know the vocabulary of banking apps and want the calm precision of one, not a gamified budgeting toy.

**The mechanism only this product has.** *Spending pace.* The dashboard compares what has been spent so far against the expected pace for today's day-of-month, then tells the user the single number that matters: what is safe to spend per day for the rest of the month, and by how much to trim if they are ahead of pace.

**Core jobs, in order of frequency.**
1. Log an expense or income quickly (defaults: today, last-used account).
2. Glance at the month: net balance, safe-to-spend, upcoming bills, alerts.
3. Review and filter history (ledger, expenses, income).
4. Maintain structure: budgets, goals, accounts, subscriptions, cards.
5. Export reports (PDF / Excel / CSV), back up JSON, manage PIN lock.

**Must remain untouched.** All business logic in `src/lib/calc.js`, data shapes in `src/lib/storage.js`, the i18n keys in `src/i18n/index.js`, the Clerk + `/api` sync in `src/context/AppContext.jsx`, and every existing feature and behaviour.

**Brand commitments.**
- Name: Masroof / مصروف. Tagline: "Your money, managed".
- No emoji anywhere in the UI. Icons are drawn (Lucide).
- Money direction is the only place semantic green/red appears.
- Tabular numerals wherever money is shown.
- Calm, precise, "private banking" register in both languages; both directions are first-class.
