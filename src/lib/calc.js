// Financial calculations for monthly income management.
import { catKind } from './categories.js'
import { daysInMonth, dayOfMonth, daysLeftInMonth, prevMonth, addMonths, shortMonth, currentMonthStr } from './format.js'

const sum = (arr) => arr.reduce((s, e) => s + (Number(e.amount) || 0), 0)
const inMonth = (rows, monthStr) => rows.filter(e => (e.date || '').startsWith(monthStr))

// Core monthly summary: income, expenses, balance, savings rate.
export function monthSummary(state, monthStr) {
  const income = inMonth(state.income, monthStr)
  const expenses = inMonth(state.expenses, monthStr)
  const totalIncome = sum(income)
  const totalExpenses = sum(expenses)
  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0
  return {
    income, expenses, totalIncome, totalExpenses, balance, savingsRate,
    txCount: income.length + expenses.length,
  }
}

// Spending pace + projection for the selected month.
export function projection(state, monthStr) {
  const { totalExpenses, totalIncome } = monthSummary(state, monthStr)
  const elapsed = Math.max(1, dayOfMonth(monthStr))
  const totalDays = daysInMonth(monthStr)
  const left = daysLeftInMonth(monthStr)

  const dailyAvg = totalExpenses / elapsed
  const projectedExpenses = dailyAvg * totalDays
  const projectedBalance = totalIncome - projectedExpenses

  // What you can still spend per remaining day and stay within income.
  const remainingIncome = totalIncome - totalExpenses
  const safePerDay = left > 0 ? Math.max(0, remainingIncome / left) : 0

  return { dailyAvg, projectedExpenses, projectedBalance, daysLeft: left, totalDays, safePerDay }
}

// Totals per expense category for a month, sorted desc.
export function byCategory(state, monthStr) {
  const totals = {}
  inMonth(state.expenses, monthStr).forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + (Number(e.amount) || 0)
  })
  return Object.entries(totals)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
}

// Totals per payment method / card for a month.
export function byPayment(state, monthStr) {
  const out = {}
  inMonth(state.expenses, monthStr).forEach(e => {
    const label = e.paymentMethod === 'cash' ? '__cash__' : (e.cardName || '__card__')
    out[label] = (out[label] || 0) + (Number(e.amount) || 0)
  })
  return out
}

// 50/30/20 rule: actual spend per bucket vs the recommended share of income.
export function ruleBuckets(state, monthStr) {
  const { totalIncome } = monthSummary(state, monthStr)
  const spend = { needs: 0, wants: 0, savings: 0 }
  inMonth(state.expenses, monthStr).forEach(e => {
    spend[catKind(e.category)] += (Number(e.amount) || 0)
  })
  // Leftover income (not yet spent) counts toward the savings bucket.
  const balance = totalIncome - (spend.needs + spend.wants + spend.savings)
  if (balance > 0) spend.savings += balance

  const targets = { needs: 0.5, wants: 0.3, savings: 0.2 }
  return ['needs', 'wants', 'savings'].map(kind => ({
    kind,
    actual: spend[kind],
    recommended: totalIncome * targets[kind],
    pct: totalIncome > 0 ? (spend[kind] / totalIncome) * 100 : 0,
    targetPct: targets[kind] * 100,
  }))
}

// Per-category budget progress for the month.
export function budgetProgress(state, monthStr) {
  const cats = state.budgets?.categories || {}
  const spentByCat = Object.fromEntries(byCategory(state, monthStr).map(c => [c.category, c.value]))
  return Object.entries(cats)
    .filter(([, limit]) => Number(limit) > 0)
    .map(([category, limit]) => {
      const spent = spentByCat[category] || 0
      const pct = limit > 0 ? (spent / limit) * 100 : 0
      return { category, limit: Number(limit), spent, pct, over: spent > limit, remaining: limit - spent }
    })
    .sort((a, b) => b.pct - a.pct)
}

// Overall monthly budget progress (uses explicit overall budget, else total income).
export function overallBudget(state, monthStr) {
  const { totalExpenses, totalIncome } = monthSummary(state, monthStr)
  const limit = Number(state.budgets?.overall) > 0 ? Number(state.budgets.overall) : totalIncome
  const pct = limit > 0 ? (totalExpenses / limit) * 100 : 0
  return { limit, spent: totalExpenses, pct, over: totalExpenses > limit, remaining: limit - totalExpenses, hasExplicit: Number(state.budgets?.overall) > 0 }
}

// Last N months of income/expenses/savings for the trend chart.
export function trend(state, monthStr, months = 6) {
  const out = []
  for (let i = months - 1; i >= 0; i--) {
    const m = addMonths(monthStr, -i)
    const s = monthSummary(state, m)
    out.push({
      month: m,
      label: shortMonth(m, state.settings.locale),
      income: s.totalIncome,
      expenses: s.totalExpenses,
      savings: s.balance,
    })
  }
  return out
}

// Percent change vs previous month, per metric (null when last month had nothing).
export function monthDeltas(state, monthStr) {
  const cur = monthSummary(state, monthStr)
  const prev = monthSummary(state, prevMonth(monthStr))
  const pct = (now, before) => (before > 0 ? ((now - before) / before) * 100 : null)
  return {
    income: pct(cur.totalIncome, prev.totalIncome),
    expenses: pct(cur.totalExpenses, prev.totalExpenses),
    balance: pct(cur.balance, prev.balance),
  }
}

// Spending pace: compares what's actually been spent against the expected
// linear pace by the current day of the month. Reference = explicit overall
// budget if set, otherwise total income for the month.
// Returns enough for an indicator (over / on / under) + actionable advice.
export function spendingPace(state, monthStr) {
  const { totalExpenses, totalIncome } = monthSummary(state, monthStr)
  const explicit = Number(state.budgets?.overall) > 0 ? Number(state.budgets.overall) : 0
  const reference = explicit || totalIncome  // 0 when neither is set

  const totalDays = daysInMonth(monthStr)
  const elapsed = Math.max(1, dayOfMonth(monthStr))
  const left = daysLeftInMonth(monthStr)

  if (reference <= 0) {
    return { hasRef: false, status: 'on', actual: totalExpenses, daysLeft: left }
  }

  const expectedByNow = reference * (elapsed / totalDays)
  const pacePct = expectedByNow > 0 ? (totalExpenses / expectedByNow) * 100 : 0
  const dailyAvg = totalExpenses / elapsed
  const projectedTotal = dailyAvg * totalDays

  // tolerance band of ±8% around the expected pace
  let status = 'on'
  if (pacePct > 108) status = 'over'
  else if (pacePct < 92) status = 'under'

  const remainingBudget = reference - totalExpenses
  const allowedPerDay = left > 0 ? Math.max(0, remainingBudget / left) : 0
  const cutPerDay = Math.max(0, dailyAvg - allowedPerDay) // trim vs current pace
  const projectedOver = projectedTotal - reference        // >0 → heading over budget
  const projectedSaving = Math.max(0, reference - projectedTotal)

  return {
    hasRef: true,
    reference,
    usesIncome: !explicit,
    expectedByNow,
    actual: totalExpenses,
    pacePct,
    budgetUsedPct: (totalExpenses / reference) * 100,
    status,
    dailyAvg,
    allowedPerDay,
    cutPerDay,
    projectedTotal,
    projectedOver,
    projectedSaving,
    overBudget: remainingBudget < 0,
    overBudgetBy: Math.max(0, -remainingBudget),
    daysLeft: left,
  }
}

// Goal math: progress % and the monthly contribution needed to hit the deadline.
export function goalStats(goal) {
  const target = Number(goal.target) || 0
  const saved = Number(goal.saved) || 0
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0
  const remaining = Math.max(0, target - saved)

  let monthsLeft = null
  let perMonth = null
  if (goal.deadline) {
    const now = new Date()
    const [y, m] = goal.deadline.split('-').map(Number)
    monthsLeft = Math.max(0, (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth()))
    perMonth = monthsLeft > 0 ? remaining / monthsLeft : remaining
  }
  return { pct, remaining, monthsLeft, perMonth, reached: saved >= target && target > 0 }
}

// Total saved across all goals (shown as one of the dashboard stats / savings bucket).
export function totalGoalSaved(state) {
  return sum((state.goals || []).map(g => ({ amount: g.saved })))
}

// ─────────────────────────── Accounts & cash ───────────────────────────
// Live balance = opening + income − expenses + transfers in − transfers out.
export function accountBalance(state, accountId) {
  const acc = (state.accounts || []).find(a => a.id === accountId)
  const opening = Number(acc?.openingBalance) || 0
  const inc = sum((state.income || []).filter(e => e.accountId === accountId))
  const exp = sum((state.expenses || []).filter(e => e.accountId === accountId))
  const tin = sum((state.transfers || []).filter(x => x.toId === accountId))
  const tout = sum((state.transfers || []).filter(x => x.fromId === accountId))
  return opening + inc - exp + tin - tout
}

export function accountsWithBalances(state) {
  return (state.accounts || []).map(a => ({ ...a, balance: accountBalance(state, a.id) }))
}

export function totalNetCash(state) {
  return (state.accounts || []).reduce((s, a) => s + accountBalance(state, a.id), 0)
}

// ─────────────────────────── Subscriptions & bills ───────────────────────────
function pad2(n) { return String(n).padStart(2, '0') }

// Resolve a subscription against a month: its due date + paid/overdue/soon status.
export function subscriptionView(sub, monthStr) {
  const dim = daysInMonth(monthStr)
  const day = Math.min(Math.max(1, Number(sub.dueDay) || 1), dim)
  const dueDate = `${monthStr}-${pad2(day)}`
  const paid = sub.lastPaid === monthStr
  const isCurrent = monthStr === currentMonthStr()
  let status = 'due'
  let daysUntil = null
  if (paid) status = 'paid'
  else if (isCurrent) {
    daysUntil = day - new Date().getDate()
    if (daysUntil < 0) status = 'overdue'
    else if (daysUntil <= 7) status = 'soon'
    else status = 'due'
  } else if (monthStr < currentMonthStr()) status = 'overdue'
  return { ...sub, dueDate, day, paid, status, daysUntil }
}

export function subscriptionsView(state, monthStr) {
  return (state.subscriptions || [])
    .filter(s => s.active !== false)
    .map(s => subscriptionView(s, monthStr))
    .sort((a, b) => a.day - b.day)
}

export function subscriptionsMonthlyTotal(state) {
  return sum((state.subscriptions || []).filter(s => s.active !== false))
}

// Bills needing attention this month (due soon, overdue, or unpaid in a past month).
export function upcomingBills(state, monthStr) {
  return subscriptionsView(state, monthStr).filter(v => v.status === 'soon' || v.status === 'overdue')
}

// ─────────────────────────── Insights & alerts ───────────────────────────
// Categories at/over the user's alert threshold (% of their budget).
export function budgetAlerts(state, monthStr) {
  const threshold = Number(state.settings?.alertThreshold) || 80
  return budgetProgress(state, monthStr)
    .filter(b => b.pct >= threshold)
    .map(b => ({ category: b.category, pct: b.pct, over: b.over, spent: b.spent, limit: b.limit }))
}

export function biggestExpenses(state, monthStr, n = 5) {
  return inMonth(state.expenses, monthStr).slice()
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
    .slice(0, n)
}

export function topPayees(state, monthStr, n = 5) {
  const totals = {}
  inMonth(state.expenses, monthStr).forEach(e => {
    const p = (e.payee || '').trim()
    if (!p) return
    totals[p] = (totals[p] || 0) + (Number(e.amount) || 0)
  })
  return Object.entries(totals)
    .map(([payee, value]) => ({ payee, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
}

// Categories spending notably more than their recent average (spending spikes).
export function categoryAnomalies(state, monthStr, lookback = 3, minChange = 35) {
  const current = Object.fromEntries(byCategory(state, monthStr).map(c => [c.category, c.value]))
  const months = []
  for (let i = 1; i <= lookback; i++) months.push(addMonths(monthStr, -i))
  const out = []
  for (const [cat, val] of Object.entries(current)) {
    const prev = months.map(m => sum(inMonth(state.expenses, m).filter(e => e.category === cat)))
    const avg = prev.reduce((a, b) => a + b, 0) / lookback
    if (avg <= 0) continue
    const change = ((val - avg) / avg) * 100
    if (change >= minChange) out.push({ category: cat, current: val, avg, change })
  }
  return out.sort((a, b) => b.change - a.change)
}

// ─────────────────────────── Recurring auto-posting ───────────────────────────
// Keep the most-recent row per key (used to derive a "template" from history).
function dedupeLatest(rows, keyFn) {
  const map = new Map()
  for (const r of rows) {
    const k = keyFn(r)
    const cur = map.get(k)
    if (!cur || (r.date || '') > (cur.date || '')) map.set(k, r)
  }
  return [...map.values()]
}

// Recurring income/expenses that haven't been logged yet for `monthStr`.
// A template = the latest recurring entry per source (income) or
// description+category (expenses); subscription-generated expenses are excluded
// (subscriptions post themselves via paySubscription).
export function pendingRecurring(state, monthStr) {
  const incTemplates = dedupeLatest((state.income || []).filter(e => e.recurring), e => (e.source || '').trim().toLowerCase())
  const income = incTemplates.filter(tmpl =>
    !(state.income || []).some(e => (e.date || '').startsWith(monthStr) && e.source === tmpl.source))

  const expTemplates = dedupeLatest(
    (state.expenses || []).filter(e => e.recurring && !e.fromSubscription),
    e => `${(e.description || '').trim().toLowerCase()}|${e.category}`)
  const expenses = expTemplates.filter(tmpl =>
    !(state.expenses || []).some(e => (e.date || '').startsWith(monthStr) && e.description === tmpl.description && e.category === tmpl.category))

  return { income, expenses, count: income.length + expenses.length }
}

// ─────────────────────────── Net worth over time ───────────────────────────
// Net worth at each month-end = opening balances + cumulative income − expenses
// up to that month (internal transfers net to zero, so they're ignored).
export function netWorthTrend(state, monthStr, months = 6) {
  const opening = (state.accounts || []).reduce((s, a) => s + (Number(a.openingBalance) || 0), 0)
  const out = []
  for (let i = months - 1; i >= 0; i--) {
    const m = addMonths(monthStr, -i)
    const end = `${m}-31`
    const inc = sum((state.income || []).filter(e => (e.date || '') <= end))
    const exp = sum((state.expenses || []).filter(e => (e.date || '') <= end))
    out.push({ month: m, label: shortMonth(m, state.settings.locale), net: opening + inc - exp })
  }
  return out
}

// Autocomplete sources collected from existing expenses.
export function knownPayees(state) {
  return [...new Set((state.expenses || []).map(e => (e.payee || '').trim()).filter(Boolean))].sort()
}
export function knownTags(state) {
  const set = new Set()
  ;(state.expenses || []).forEach(e => (e.tags || []).forEach(tg => set.add(tg)))
  return [...set].sort()
}
