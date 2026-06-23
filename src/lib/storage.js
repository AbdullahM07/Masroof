// Single-key persistence with one-time migration from the legacy vanilla-JS
// app (keys: sm_income / sm_expenses / sm_cards).

const KEY = 'sm_v2'
const LEGACY = { income: 'sm_income', expenses: 'sm_expenses', cards: 'sm_cards' }

export function defaultState() {
  return {
    income: [],
    expenses: [],
    cards: [],
    accounts: [],
    transfers: [],
    subscriptions: [],
    budgets: { overall: null, categories: {} },
    goals: [],
    settings: {
      theme: 'light',
      locale: 'en',
      currency: 'EGP',
      alertThreshold: 80,   // % of a budget at which an alert is raised
      pinEnabled: false,
      pinHash: null,
    },
  }
}

export function loadState() {
  const raw = safeParse(localStorage.getItem(KEY))
  if (raw) return mergeDefaults(raw)

  // First run on v2 — pull anything the legacy app left behind.
  const migrated = defaultState()
  const oldIncome = safeParse(localStorage.getItem(LEGACY.income))
  const oldExp    = safeParse(localStorage.getItem(LEGACY.expenses))
  const oldCards  = safeParse(localStorage.getItem(LEGACY.cards))
  if (Array.isArray(oldIncome)) migrated.income = oldIncome
  if (Array.isArray(oldExp))    migrated.expenses = oldExp.map(normalizeExpense)
  if (Array.isArray(oldCards))  migrated.cards = oldCards
  return migrated
}

// ── Per-user offline cache (used once accounts/cloud-sync are enabled) ──
// Keyed by Clerk user id so multiple accounts on one device don't mix.
function cacheKey(userId) { return `${KEY}:${userId}` }
export function readCache(userId) { return userId ? safeParse(localStorage.getItem(cacheKey(userId))) : null }
export function writeCache(userId, state) {
  if (!userId) return
  try { localStorage.setItem(cacheKey(userId), JSON.stringify(state)) } catch { /* quota */ }
}
// Pre-accounts local data (the old single key), used once to seed a new account.
export function readLegacyLocal() { return safeParse(localStorage.getItem(KEY)) }

let _quotaWarned = false
export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) }
  catch (err) {
    // Most likely the 5 MB quota (e.g. too many receipt images).
    if (!_quotaWarned) {
      _quotaWarned = true
      console.warn('Salary Manager: could not save — storage quota reached.', err)
    }
  }
}

// Legacy expenses used paymentMethod 'visa'; v2 uses 'card' for everything non-cash.
function normalizeExpense(e) {
  return { ...e, paymentMethod: e.paymentMethod === 'visa' ? 'card' : (e.paymentMethod || 'cash') }
}

// Merge arbitrary (possibly corrupt / legacy / imported) data over the defaults,
// guaranteeing every collection is the right shape so the app can't crash on a
// non-array `income`/`expenses`/etc. Exported so import uses the same guards.
export function mergeDefaults(raw) {
  const d = defaultState()
  const safe = obj => (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {}
  const r = safe(raw)
  const arr = (key) => Array.isArray(r[key]) ? r[key] : d[key]
  return {
    ...d,
    ...r,
    income:        arr('income'),
    expenses:      arr('expenses'),
    cards:         arr('cards'),
    goals:         arr('goals'),
    accounts:      arr('accounts'),
    transfers:     arr('transfers'),
    subscriptions: arr('subscriptions'),
    budgets: { ...d.budgets, ...safe(r.budgets), categories: { ...safe(r.budgets?.categories) } },
    settings: { ...d.settings, ...safe(r.settings) },
  }
}

function safeParse(str) {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}

export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Lightweight non-cryptographic hash for the local PIN gate. This guards
// against casual shoulder-surfing only — data still lives in localStorage.
export function hashPin(pin) {
  let h = 2166136261
  const salt = 'sm::' + pin + '::v2'
  for (let i = 0; i < salt.length; i++) {
    h ^= salt.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16)
}
