import { useState } from 'react'
import { Button } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr, formatDate, formatMoney } from '../lib/format.js'
import {
  monthSummary, projection, byCategory, byPayment, ruleBuckets, trend, monthDeltas, spendingPace,
  budgetAlerts, categoryAnomalies, biggestExpenses, upcomingBills, pendingRecurring, netWorthTrend,
} from '../lib/calc.js'
import { catColor } from '../lib/categories.js'
import { Icon, CategoryIcon } from '../components/icons.jsx'
import { DonutChart, PaymentBars, TrendChart, NetWorthChart } from '../components/Charts.jsx'
import { StatCard, MonthPicker, EmptyState, ProgressBar, RingGauge, useCountUp, Info } from '../components/ui.jsx'
import { useToast } from '../components/Confirm.jsx'

const STATUS_COLOR = { over: 'var(--danger)', on: 'var(--success)', under: '#0ea5e9', none: 'var(--text-faint)' }

export default function Dashboard() {
  const { state, t, currency, locale, paySubscription, addRecurringForMonth } = useApp()
  const toast = useToast()
  const [month, setMonth] = useState(currentMonthStr())
  const isCurrentMonth = month === currentMonthStr()
  const pending = isCurrentMonth ? pendingRecurring(state, month) : { count: 0 }

  function postRecurring() {
    const n = pending.count
    addRecurringForMonth(month)
    if (n > 0) toast(t('recurringAdded', { n }))
  }

  const s = monthSummary(state, month)
  const proj = projection(state, month)
  const deltas = monthDeltas(state, month)
  const cats = byCategory(state, month)
  const pay = byPayment(state, month)
  const rule = ruleBuckets(state, month)
  const trendData = trend(state, month, 6)
  const pace = spendingPace(state, month)
  const alerts = budgetAlerts(state, month)
  const spikes = categoryAnomalies(state, month)
  const biggest = biggestExpenses(state, month, 4)
  const bills = upcomingBills(state, month)
  const netWorth = netWorthTrend(state, month, 6)
  const currentNetWorth = netWorth.length ? netWorth[netWorth.length - 1].net : 0

  const catData = cats.map(c => ({ name: t(c.category), value: c.value, color: catColor(c.category) }))
  const payPalette = ['#22c55e', '#0F6CBD', '#7c3aed', '#f97316', '#0891b2', '#be185d', '#d97706']
  const payData = Object.entries(pay).map(([k, v], i) => ({
    name: k === '__cash__' ? t('cash') : k === '__card__' ? t('card') : k, value: v, color: payPalette[i % payPalette.length],
  }))

  const recent = [
    ...s.income.map(e => ({ ...e, _type: 'income' })),
    ...s.expenses.map(e => ({ ...e, _type: 'expense' })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8)

  const money = (n) => formatMoney(n, currency, { short: true })

  return (
    <>
      <div className="section-head" style={{ justifyContent: 'flex-end' }}>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {pending.count > 0 && (
        <div className="recurring-banner section">
          <span className="rb-ico"><Icon.repeat width={18} height={18} /></span>
          <div className="rb-text">
            <b>{t('recurringDueTitle')}</b>
            <span>{t('recurringDueMsg', { n: pending.count })}</span>
          </div>
          <Button appearance="primary" size="small" icon={<Icon.plus />} onClick={postRecurring}>
            {t('addRecurring')}
          </Button>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="stats-grid section">
        <StatCard label={t('totalIncome')} tip={t('tip_totalIncome')} icon={<Icon.wallet />} valueClass="pos"
          value={<KpiMoney value={s.totalIncome} />} delta={deltas.income} />
        <StatCard label={t('totalExpenses')} tip={t('tip_totalExpenses')} icon={<Icon.receipt />} valueClass="neg"
          value={<KpiMoney value={s.totalExpenses} />} delta={deltas.expenses} deltaInvert />
        <StatCard feature label={t('netBalance')} tip={t('tip_netBalance')} icon={s.balance >= 0 ? <Icon.trendUp /> : <Icon.trendDown />}
          value={<KpiMoney value={s.balance} sign />} sub={`${t('savingsRate')}: ${s.savingsRate.toFixed(0)}%`} />
        <StatCard label={t('transactions')} tip={t('tip_transactions')} icon={<Icon.swap />}
          value={s.txCount} sub={`${proj.daysLeft} ${t('daysLeft')}`} />
      </div>

      {/* ── Spending analytics (pace ring + advice) ── */}
      <div className="card section">
        <div className="card-title"><span className="ct-ico"><Icon.gauge /></span>{t('analytics')}<Info tip={t('tip_pace')} /></div>
        <div className="analytics-grid">
          <div className="pace-ring-wrap">
            <RingGauge value={pace.hasRef ? Math.min(pace.pacePct, 100) : 0}
              color={STATUS_COLOR[pace.hasRef ? pace.status : 'none']}>
              <div className="ring-pct">{pace.hasRef ? `${Math.round(pace.pacePct)}%` : '—'}</div>
              <div className="ring-cap">{t('ofExpected')}</div>
            </RingGauge>
            <div className={`pace-status ${pace.hasRef ? pace.status : ''}`}>
              {pace.hasRef
                ? <>{pace.status === 'over' ? <Icon.trendUp width={16} height={16} /> : pace.status === 'under' ? <Icon.trendDown width={16} height={16} /> : <Icon.shield width={16} height={16} />}
                    {t(pace.status === 'over' ? 'paceOver' : pace.status === 'under' ? 'paceUnder' : 'paceOn')}</>
                : <>{t('spendPace')}</>}
            </div>
          </div>

          <div className="pace-metrics">
            <Metric icon={<Icon.calendar />} label={t('expectedByNow')} tip={t('tip_expectedByNow')} value={pace.hasRef ? money(pace.expectedByNow) : '—'} />
            <Metric icon={<Icon.receipt />} label={t('spentSoFar')} tip={t('tip_spentSoFar')} value={money(pace.actual)} />
            <Metric icon={<Icon.trendUp />} label={t('dailyAvg')} tip={t('tip_dailyAvg')} value={money(proj.dailyAvg)} />
            <Metric icon={<Icon.shield />} label={t('dailyBudget')} tip={t('tip_safePerDay')}
              value={pace.hasRef ? money(pace.allowedPerDay) : money(proj.safePerDay)}
              tone={(pace.hasRef ? pace.allowedPerDay : proj.safePerDay) > 0 ? 'good' : 'bad'} />
            <Metric icon={<Icon.budgets />} label={t('budgetUsed')} tip={t('tip_budgetUsed')} value={pace.hasRef ? `${Math.round(pace.budgetUsedPct)}%` : '—'} />
            <Metric icon={<Icon.forecast />} label={t('projectedEnd')} tip={t('tip_projectedEnd')} value={money(proj.projectedBalance)}
              tone={proj.projectedBalance >= 0 ? 'good' : 'bad'} />
          </div>
        </div>

        <Advice pace={pace} t={t} money={money} />
      </div>

      {/* ── Insights & alerts + upcoming bills ── */}
      <div className="grid-2 section">
        <div className="card">
          <div className="card-title"><span className="ct-ico"><Icon.bulb /></span>{t('insights')}</div>
          {(alerts.length + spikes.length + biggest.length) === 0
            ? <EmptyState icon="bulb"><p>{t('noInsights')}</p></EmptyState>
            : (
              <div className="insight-list">
                {alerts.map(a => (
                  <div className="insight-row" key={`al-${a.category}`}>
                    <span className="insight-ico" style={{ color: a.over ? 'var(--danger)' : 'var(--warning)' }}><Icon.alert /></span>
                    <span className="insight-text"><b>{t(a.category)}</b> — {a.over ? t('overBudget') : t('nearLimit')}</span>
                    <span className="insight-val" style={{ color: a.over ? 'var(--danger)' : 'var(--warning)' }}>{Math.round(a.pct)}%</span>
                  </div>
                ))}
                {spikes.map(sp => (
                  <div className="insight-row" key={`sp-${sp.category}`}>
                    <span className="insight-ico" style={{ color: 'var(--warning)' }}><Icon.trendUp /></span>
                    <span className="insight-text"><b>{t(sp.category)}</b> {t('aboveAvg')}</span>
                    <span className="insight-val" style={{ color: 'var(--warning)' }}>+{Math.round(sp.change)}%</span>
                  </div>
                ))}
                {biggest.length > 0 && <div className="insight-sub">{t('biggestExpenses')}</div>}
                {biggest.map(e => (
                  <div className="insight-row" key={`bg-${e.id}`}>
                    <span className="insight-ico" style={{ color: catColor(e.category) }}><CategoryIcon category={e.category} /></span>
                    <span className="insight-text">{e.description}</span>
                    <span className="insight-val neg">{money(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="card">
          <div className="card-title"><span className="ct-ico"><Icon.subscriptions /></span>{t('upcomingBills')}</div>
          {bills.length === 0
            ? <EmptyState icon="check"><p>{t('allPaid')}</p></EmptyState>
            : (
              <div className="insight-list">
                {bills.map(v => (
                  <div className="insight-row" key={v.id}>
                    <span className="insight-ico" style={{ color: v.status === 'overdue' ? 'var(--danger)' : 'var(--warning)' }}>
                      <CategoryIcon category={v.category} />
                    </span>
                    <span className="insight-text">
                      <b>{v.name}</b>
                      <span className="tx-meta"> · {v.daysUntil == null ? t('overdue') : v.status === 'overdue' ? t('overdueDays', { n: Math.abs(v.daysUntil) }) : v.daysUntil === 0 ? t('dueToday') : t('inDays', { n: v.daysUntil })}</span>
                    </span>
                    <span className="insight-val">{money(v.amount)}</span>
                    <Button appearance="primary" size="small" icon={<Icon.check />}
                      onClick={() => paySubscription(v.id, month)}>{t('markPaid')}</Button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid-2 section">
        <div className="card">
          <div className="card-title">{t('expensesByCat')}</div>
          <DonutChart data={catData} emptyText={t('noTxThisMonth')} />
        </div>
        <div className="card">
          <div className="card-title">{t('byPayment')}</div>
          <PaymentBars data={payData} emptyText={t('noTxThisMonth')} />
        </div>
      </div>

      {/* ── Net worth over time ── */}
      <div className="card section">
        <div className="card-title">
          <span className="ct-ico"><Icon.forecast /></span>{t('netWorthTrend')}
          <span className="hint">{t('netWorth')}: {money(currentNetWorth)}</span>
        </div>
        <NetWorthChart data={netWorth} />
      </div>

      {/* ── Trend + 50/30/20 ── */}
      <div className="grid-2 section">
        <div className="card">
          <div className="card-title">{t('trend6m')}</div>
          <TrendChart data={trendData} />
        </div>
        <div className="card">
          <div className="card-title">{t('rule503020')}<Info tip={t('tip_rule')} /> <span className="hint">{t('recommended')}: 50 / 30 / 20</span></div>
          <div className="rule-grid">
            {rule.map(r => (
              <div className="rule-cell" key={r.kind}>
                <h4>
                  <span>{r.kind === 'needs' ? t('needs') : r.kind === 'wants' ? t('wants') : t('savingsBucket')}</span>
                  <span>{r.pct.toFixed(0)}%</span>
                </h4>
                <div className="rule-amt">{money(r.actual)}</div>
                <ProgressBar pct={r.targetPct ? (r.pct / r.targetPct) * 100 : 0}
                  status={r.kind === 'savings' ? (r.pct >= r.targetPct ? 'good' : 'warn') : (r.pct > r.targetPct ? 'over' : 'good')} />
                <div className="rule-target mt-8">{t('recommended')}: {r.targetPct}% · {money(r.recommended)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent transactions ── */}
      <div className="card">
        <div className="card-title">{t('recentTx')}</div>
        {recent.length === 0
          ? <EmptyState icon="swap"><p>{t('noTxThisMonth')}</p></EmptyState>
          : (
            <div className="tx-list">
              {recent.map(item => {
                const isInc = item._type === 'income'
                const label = isInc ? item.source : item.description
                const meta = isInc
                  ? formatDate(item.date, locale)
                  : `${t(item.category)} · ${item.paymentMethod === 'cash' ? t('cash') : (item.cardName || t('card'))} · ${formatDate(item.date, locale)}`
                return (
                  <div className="tx-row" key={item.id}>
                    <div className="tx-left">
                      <span className="tx-ico" style={{ color: isInc ? 'var(--success)' : catColor(item.category) }}>
                        {isInc ? <Icon.wallet /> : <CategoryIcon category={item.category} />}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="tx-desc">{label}</div>
                        <div className="tx-meta">{meta}</div>
                      </div>
                    </div>
                    <div className={`tx-amt ${isInc ? 'pos' : 'neg'}`}>
                      {isInc ? '+' : '−'}{formatMoney(item.amount, currency)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>
    </>
  )
}

function KpiMoney({ value, sign }) {
  const { currency } = useApp()
  const v = useCountUp(value)
  return <>{formatMoney(v, currency, { short: true, sign })}</>
}

function Metric({ icon, label, value, tone, tip }) {
  const color = tone === 'good' ? 'var(--success)' : tone === 'bad' ? 'var(--danger)' : 'var(--text)'
  return (
    <div className="metric reveal">
      <span className="metric-ico">{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div className="metric-label">{label}{tip && <Info tip={tip} />}</div>
        <div className="metric-value" style={{ color }}>{value}</div>
      </div>
    </div>
  )
}

function Advice({ pace, t, money }) {
  let key = 'tipNoRef'
  let params
  if (pace.hasRef) {
    if (pace.overBudget) { key = 'tipOverBudget'; params = { amount: money(pace.overBudgetBy) } }
    else if (pace.projectedOver > 0 && pace.cutPerDay > 0) { key = 'tipCutDaily'; params = { amount: money(pace.cutPerDay), days: pace.daysLeft } }
    else if (pace.projectedOver > 0) { key = 'tipWithinBudget'; params = { amount: money(pace.allowedPerDay), days: pace.daysLeft } }
    else if (pace.status === 'under') { key = 'tipUnder'; params = { amount: money(pace.projectedSaving) } }
    else { key = 'tipOnTrack'; params = { amount: money(pace.allowedPerDay), days: pace.daysLeft } }
  }
  const tone = !pace.hasRef ? '' : pace.overBudget || pace.status === 'over' ? 'over' : pace.status === 'under' ? 'under' : 'on'
  return (
    <div className={`advice ${tone}`}>
      <span className="advice-ico"><Icon.bulb /></span>
      <div>
        <b>{t('smartTip')}</b>
        <p>{t(key, params)}</p>
      </div>
    </div>
  )
}
