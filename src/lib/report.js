// Report generation — a structured model shared by the Excel (.xlsx) and the
// print-to-PDF exporters so both stay in sync.
import { formatMoney, formatMonthLabel, formatDate, todayStr } from './format.js'
import { budgetProgress, goalStats } from './calc.js'

const sum = (arr) => arr.reduce((s, e) => s + (Number(e.amount) || 0), 0)

// period = 'YYYY-MM' (single month) | null (all-time) | { from, to } (date range).
export function buildReportModel(state, period, { t, currency, locale }) {
  const isMonth = typeof period === 'string' && !!period
  const isRange = !!period && typeof period === 'object' && (period.from || period.to)
  const from = isRange ? (period.from || '') : ''
  const to = isRange ? (period.to || '9999-12-31') : ''
  const byDate = (a, b) => (a.date || '').localeCompare(b.date || '')

  let income = [...state.income]
  let expenses = [...state.expenses]
  if (isMonth) {
    income = income.filter(e => (e.date || '').startsWith(period))
    expenses = expenses.filter(e => (e.date || '').startsWith(period))
  } else if (isRange) {
    const inRange = (e) => (e.date || '') >= from && (e.date || '') <= to
    income = income.filter(inRange)
    expenses = expenses.filter(inRange)
  }
  income.sort(byDate)
  expenses.sort(byDate)

  const totalIncome = sum(income)
  const totalExpenses = sum(expenses)
  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

  const payLabel = (e) => e.paymentMethod === 'cash' ? t('cash') : (e.cardName || t('card'))

  const summary = [
    [t('totalIncome'), totalIncome],
    [t('totalExpenses'), totalExpenses],
    [t('netBalance'), balance, false, 'balance'],
    [t('savingsRate'), `${savingsRate.toFixed(1)}%`, true],
    [t('transactions'), `${income.length + expenses.length}`, true],
  ]

  const incomeRows = income.map(e => ({
    date: e.date, source: e.source || '', note: e.note || '', amount: Number(e.amount) || 0,
  }))
  const expenseRows = expenses.map(e => ({
    date: e.date, description: e.description || '', category: t(e.category), payment: payLabel(e),
    amount: Number(e.amount) || 0,
  }))

  const rangeLabel = isRange
    ? `${from ? formatDate(from, locale) : '…'} – ${period.to ? formatDate(period.to, locale) : '…'}`
    : ''

  // Budgets only make sense for a single month.
  let budgets = []
  if (isMonth) {
    budgets = budgetProgress(state, period).map(b => ({
      category: t(b.category), limit: b.limit, spent: b.spent,
      remaining: b.remaining, pct: b.pct,
    }))
  }

  const goals = (state.goals || []).map(g => {
    const st = goalStats(g)
    return { name: g.name, target: Number(g.target) || 0, saved: Number(g.saved) || 0, pct: st.pct, monthly: st.perMonth }
  })

  return {
    appName: t('appName'),
    title: t('financialReport'),
    periodLabel: isMonth ? formatMonthLabel(period, locale) : isRange ? rangeLabel : t('allTime'),
    generatedLabel: formatDate(todayStr(), locale),
    currency, locale, t,
    totals: { totalIncome, totalExpenses, balance, savingsRate },
    summary, incomeRows, expenseRows, budgets, goals,
  }
}

// ─────────────────────────── Excel (.xlsx) ───────────────────────────
// SheetJS is loaded on demand so it never weighs down the initial bundle.
export async function exportExcel(model) {
  const XLSX = await import('xlsx')
  const { t, currency } = model
  const cur = (h) => `${h} (${currency})`
  const wb = XLSX.utils.book_new()

  const summaryAoa = [
    [model.title],
    [`${t('period')}: ${model.periodLabel}`],
    [`${t('generatedOn')}: ${model.generatedLabel}`],
    [],
    [t('summary'), ''],
    ...model.summary.map(([label, value]) => [label, value]),
  ]
  addSheet(XLSX, wb, t('summary'), summaryAoa, [{ wch: 26 }, { wch: 22 }])

  addSheet(XLSX, wb, t('income'),
    [[t('date'), t('source'), t('note'), cur(t('amount'))],
      ...model.incomeRows.map(r => [r.date, r.source, r.note, r.amount]),
      [], [t('total'), '', '', model.totals.totalIncome]],
    [{ wch: 12 }, { wch: 24 }, { wch: 24 }, { wch: 16 }])

  addSheet(XLSX, wb, t('expenses'),
    [[t('date'), t('description'), t('category'), t('payment'), cur(t('amount'))],
      ...model.expenseRows.map(r => [r.date, r.description, r.category, r.payment, r.amount]),
      [], [t('total'), '', '', '', model.totals.totalExpenses]],
    [{ wch: 12 }, { wch: 26 }, { wch: 16 }, { wch: 18 }, { wch: 16 }])

  if (model.budgets.length) {
    addSheet(XLSX, wb, t('budgets'),
      [[t('category'), cur(t('limit')), cur(t('spent')), cur(t('remaining')), t('progress')],
        ...model.budgets.map(b => [b.category, b.limit, b.spent, b.remaining, `${b.pct.toFixed(0)}%`])],
      [{ wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }])
  }

  if (model.goals.length) {
    addSheet(XLSX, wb, t('goals'),
      [[t('goalName'), cur(t('targetAmount')), cur(t('savedSoFar')), t('progress'), cur(t('monthlyNeed'))],
        ...model.goals.map(g => [g.name, g.target, g.saved, `${g.pct.toFixed(0)}%`, g.monthly != null ? Math.round(g.monthly) : ''])],
      [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 16 }])
  }

  XLSX.writeFile(wb, `salary-report-${stamp(model)}.xlsx`)
}

function addSheet(XLSX, wb, name, aoa, cols) {
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  if (cols) ws['!cols'] = cols
  // sheet names are capped at 31 chars and can't contain certain symbols
  XLSX.utils.book_append_sheet(wb, ws, name.replace(/[\\/?*[\]:]/g, '').slice(0, 31))
}

// ─────────────────────────── CSV ───────────────────────────
// One flat sheet of every transaction in the period. A UTF-8 BOM is prepended
// so Excel renders Arabic + non-ASCII correctly.
export function exportCsv(model) {
  const { t, currency } = model
  const headers = [t('date'), t('type'), t('description'), t('category'), t('payment'), `${t('amount')} (${currency})`]
  const rows = []
  model.incomeRows.forEach(r => rows.push([r.date, t('inflow'), r.source, '', '', r.amount]))
  model.expenseRows.forEach(r => rows.push([r.date, t('outflow'), r.description, r.category, r.payment, r.amount]))
  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))

  const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `salary-report-${stamp(model)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// ─────────────────────────── PDF (print) ───────────────────────────
// Opens a clean, statement-style HTML report and triggers the browser's
// print dialog (Save as PDF). Renders Arabic/RTL natively.
export function openPdfReport(model) {
  const w = window.open('', '_blank')
  if (!w) { alert('Please allow pop-ups to generate the PDF report.'); return }
  w.document.open()
  w.document.write(buildReportHtml(model))
  w.document.close()
}

function buildReportHtml(model) {
  const { t, currency, locale } = model
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const fmt = (n) => formatMoney(n, currency)
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const summaryRows = model.summary.map(([label, value, isText, kind]) =>
    `<tr class="${kind || ''}"><td class="kv-label">${esc(label)}</td><td class="kv-val${!isText ? ' num' : ''}">${isText ? esc(value) : fmt(value)}</td></tr>`
  ).join('')

  const incomeBody = model.incomeRows.length
    ? model.incomeRows.map(r =>
        `<tr><td class="nowrap">${esc(formatDate(r.date, locale))}</td><td>${esc(r.source)}</td><td class="muted">${esc(r.note || '—')}</td><td class="num">${fmt(r.amount)}</td></tr>`).join('')
    : emptyRow(4, t('reportNoData'))
  const incomeFoot = model.incomeRows.length
    ? `<tfoot><tr><td colspan="3">${esc(t('total'))}</td><td class="num">${fmt(model.totals.totalIncome)}</td></tr></tfoot>` : ''

  const expBody = model.expenseRows.length
    ? model.expenseRows.map(r =>
        `<tr><td class="nowrap">${esc(formatDate(r.date, locale))}</td><td>${esc(r.description)}</td><td>${esc(r.category)}</td><td>${esc(r.payment)}</td><td class="num">${fmt(r.amount)}</td></tr>`).join('')
    : emptyRow(5, t('reportNoData'))
  const expFoot = model.expenseRows.length
    ? `<tfoot><tr><td colspan="4">${esc(t('total'))}</td><td class="num">${fmt(model.totals.totalExpenses)}</td></tr></tfoot>` : ''

  const budgetSection = model.budgets.length ? `
    <section>
      <h2>${esc(t('budgets'))}</h2>
      <table>
        <thead><tr><th>${esc(t('category'))}</th><th class="num">${esc(t('limit'))}</th><th class="num">${esc(t('spent'))}</th><th class="num">${esc(t('remaining'))}</th><th class="num">${esc(t('progress'))}</th></tr></thead>
        <tbody>${model.budgets.map(b =>
          `<tr><td>${esc(b.category)}</td><td class="num">${fmt(b.limit)}</td><td class="num">${fmt(b.spent)}</td><td class="num">${fmt(b.remaining)}</td><td class="num">${b.pct.toFixed(0)}%</td></tr>`).join('')}</tbody>
      </table>
    </section>` : ''

  const goalSection = model.goals.length ? `
    <section>
      <h2>${esc(t('goals'))}</h2>
      <table>
        <thead><tr><th>${esc(t('goalName'))}</th><th class="num">${esc(t('targetAmount'))}</th><th class="num">${esc(t('savedSoFar'))}</th><th class="num">${esc(t('progress'))}</th><th class="num">${esc(t('monthlyNeed'))}</th></tr></thead>
        <tbody>${model.goals.map(g =>
          `<tr><td>${esc(g.name)}</td><td class="num">${fmt(g.target)}</td><td class="num">${fmt(g.saved)}</td><td class="num">${g.pct.toFixed(0)}%</td><td class="num">${g.monthly != null ? fmt(g.monthly) : '—'}</td></tr>`).join('')}</tbody>
      </table>
    </section>` : ''

  const balanceColor = model.totals.balance >= 0 ? '#1a7f4b' : '#b00020'

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(model.title)} — ${esc(model.periodLabel)}</title>
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', 'Cairo', Arial, sans-serif; color: #222; margin: 0; font-size: 12px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report { max-width: 760px; margin: 0 auto; padding: 8px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
  .org { font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; }
  h1 { font-size: 22px; font-weight: 700; margin: 2px 0 0; }
  .meta { text-align: ${dir === 'rtl' ? 'left' : 'right'}; font-size: 11px; color: #6b7280; line-height: 1.7; }
  .meta b { color: #222; font-weight: 600; }
  .rule { border: none; border-top: 2px solid #222; margin: 12px 0 4px; }
  section { margin-top: 22px; }
  h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 8px; padding-bottom: 5px; border-bottom: 1px solid #d8dce3; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: start; font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #8a8f99; padding: 7px 8px; border-bottom: 1px solid #cbd2db; }
  td { padding: 7px 8px; border-bottom: 1px solid #eef1f5; }
  tbody tr:nth-child(even) td { background: #fafbfc; }
  tfoot td { font-weight: 700; border-top: 2px solid #333; border-bottom: none; padding-top: 8px; }
  .num { text-align: end; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .nowrap { white-space: nowrap; }
  .muted { color: #9aa0aa; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; }
  table.kv td { border: none; padding: 6px 0; border-bottom: 1px dotted #e3e7ed; }
  .kv-label { color: #555; }
  .kv-val { font-weight: 700; text-align: end; }
  .balance .kv-val { color: ${balanceColor}; }
  footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e3e7ed; text-align: center; font-size: 10px; color: #aab; }
  @media print { .report { padding: 0; } }
</style>
</head>
<body>
  <div class="report">
    <header>
      <div>
        <div class="org">${esc(model.appName)}</div>
        <h1>${esc(model.title)}</h1>
      </div>
      <div class="meta">
        <div><b>${esc(t('period'))}:</b> ${esc(model.periodLabel)}</div>
        <div><b>${esc(t('generatedOn'))}:</b> ${esc(model.generatedLabel)}</div>
      </div>
    </header>
    <hr class="rule" />

    <section>
      <h2>${esc(t('summary'))}</h2>
      <table class="kv">
        <tbody>${summaryRows}</tbody>
      </table>
    </section>

    <section>
      <h2>${esc(t('income'))}</h2>
      <table>
        <thead><tr><th>${esc(t('date'))}</th><th>${esc(t('source'))}</th><th>${esc(t('note'))}</th><th class="num">${esc(t('amount'))}</th></tr></thead>
        <tbody>${incomeBody}</tbody>
        ${incomeFoot}
      </table>
    </section>

    <section>
      <h2>${esc(t('expenses'))}</h2>
      <table>
        <thead><tr><th>${esc(t('date'))}</th><th>${esc(t('description'))}</th><th>${esc(t('category'))}</th><th>${esc(t('payment'))}</th><th class="num">${esc(t('amount'))}</th></tr></thead>
        <tbody>${expBody}</tbody>
        ${expFoot}
      </table>
    </section>

    ${budgetSection}
    ${goalSection}

    <footer>${esc(t('reportFooter'))}</footer>
  </div>
  <script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 300); });</script>
</body>
</html>`
}

function emptyRow(cols, text) {
  return `<tr><td colspan="${cols}" style="text-align:center;color:#9aa0aa;padding:18px;">${text}</td></tr>`
}

function stamp(model) {
  return model.periodLabel.replace(/\s+/g, '-')
}
