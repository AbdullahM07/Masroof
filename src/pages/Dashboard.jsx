import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr, formatDate, formatMoney } from '../lib/format.js'
import {
  monthSummary, projection, byCategory, byPayment, ruleBuckets, trend, monthDeltas, spendingPace,
  budgetAlerts, categoryAnomalies, biggestExpenses, upcomingBills, pendingRecurring, netWorthTrend,
} from '../lib/calc.js'
import { catColor } from '../lib/categories.js'
import { cn } from '../lib/utils.js'
import { Icon, CategoryIcon } from '../components/icons.jsx'
import { DonutChart, PaymentBars, TrendChart, NetWorthChart } from '../components/charts/lazy.jsx'
import {
  StatCard, EmptyState, Progress, RingGauge, useCountUp, Info, Card, CardTitle, Button, Badge, Stack, DeltaTag, Reveal,
} from '../components/ui/index.jsx'
import { useToast } from '../components/Confirm.jsx'

const STATUS = {
  over: { color: 'var(--negative)', tone: 'negative', key: 'paceOver', icon: Icon.trendUp },
  on: { color: 'var(--positive)', tone: 'positive', key: 'paceOn', icon: Icon.shield },
  under: { color: 'var(--info)', tone: 'info', key: 'paceUnder', icon: Icon.trendDown },
  none: { color: 'var(--line-strong)', tone: 'neutral', key: 'spendPace', icon: Icon.gauge },
}

export default function Dashboard({ month, navigate }) {
  const { state, t, currency, locale, paySubscription, addRecurringForMonth } = useApp()
  const toast = useToast()
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
  const payPalette = ['var(--accent-ink)', '#3e8e6e', '#6f5ba6', '#c2703e', '#2f7f8f', '#c05c7a', '#b08a2e']
  const payData = Object.entries(pay).map(([k, v], i) => ({
    name: k === '__cash__' ? t('cash') : k === '__card__' ? t('card') : k, value: v, color: payPalette[i % payPalette.length],
  }))

  const recent = [
    ...s.income.map(e => ({ ...e, _type: 'income' })),
    ...s.expenses.map(e => ({ ...e, _type: 'expense' })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8)

  const money = (n) => formatMoney(n, currency, { short: true })
  const st = STATUS[pace.hasRef ? pace.status : 'none']
  const safePerDay = pace.hasRef ? pace.allowedPerDay : proj.safePerDay

  return (
    <Stack>
      {pending.count > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-accent-soft/60 px-4 py-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-surface text-accent-ink"><Icon.repeat size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{t('recurringDueTitle')}</p>
            <p className="t-small text-ink-2">{t('recurringDueMsg', { n: pending.count })}</p>
          </div>
          <Button variant="primary" size="sm" icon={<Icon.plus size={15} />} onClick={postRecurring}>{t('addRecurring')}</Button>
        </div>
      )}

      {/* ── Hero: net balance + pace arc + metrics ── */}
      <Card className="p-0 overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_auto_1.1fr]">
          <div className="flex flex-col justify-between gap-6 p-5 sm:p-6">
            <div>
              <div className="t-small text-ink-2 flex items-center">{t('netBalance')}<Info tip={t('tip_netBalance')} /></div>
              <div className={cn('t-display num mt-2 whitespace-nowrap text-[30px] leading-9 min-[420px]:text-[36px] min-[420px]:leading-10 sm:text-[44px] sm:leading-[48px]', s.balance < 0 ? 'text-negative' : 'text-ink')}>
                <KpiMoney value={s.balance} sign short={false} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="t-small text-ink-2 flex items-center">
                  {t('savingsRate')}: <span className="num-soft font-semibold text-ink ms-1">{s.savingsRate.toFixed(0)}%</span>
                  <Info tip={t('tip_savingsRate')} />
                </span>
                {deltas.balance != null && <DeltaTag pct={deltas.balance} />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
              <MiniStat label={t('totalIncome')} tip={t('tip_totalIncome')} value={<KpiMoney value={s.totalIncome} />} tone="positive" delta={deltas.income} />
              <MiniStat label={t('totalExpenses')} tip={t('tip_totalExpenses')} value={<KpiMoney value={s.totalExpenses} />} tone="negative" delta={deltas.expenses} invert />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 border-y border-line bg-surface-2 px-8 py-6 lg:border-x lg:border-y-0">
            <RingGauge value={pace.hasRef ? Math.min(pace.pacePct, 100) : 0} size={176} stroke={9} color={st.color}>
              <span className="t-caption text-ink-3">{t('dailyBudget')}</span>
              <span className={cn('num text-[26px] leading-8', safePerDay > 0 ? 'text-ink' : 'text-negative')}>{money(safePerDay)}</span>
              <span className="t-caption text-ink-3 num-soft">{pace.hasRef ? `${Math.round(pace.pacePct)}% ${t('ofExpected')}` : t('spendPace')}</span>
            </RingGauge>
            <Badge tone={st.tone} className="-mt-3"><st.icon size={13} />{t(st.key)}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:p-6">
            <Metric label={t('expectedByNow')} tip={t('tip_expectedByNow')} value={pace.hasRef ? money(pace.expectedByNow) : '—'} />
            <Metric label={t('spentSoFar')} tip={t('tip_spentSoFar')} value={money(pace.actual)} />
            <Metric label={t('dailyAvg')} tip={t('tip_dailyAvg')} value={money(proj.dailyAvg)} />
            <Metric label={t('budgetUsed')} tip={t('tip_budgetUsed')} value={pace.hasRef ? `${Math.round(pace.budgetUsedPct)}%` : '—'}
              bar={pace.hasRef ? { pct: pace.budgetUsedPct, status: pace.budgetUsedPct >= 100 ? 'over' : pace.budgetUsedPct >= 80 ? 'warn' : 'good' } : null} />
            <Metric label={t('projectedEnd')} tip={t('tip_projectedEnd')} value={money(proj.projectedBalance)} tone={proj.projectedBalance >= 0 ? 'good' : 'bad'} />
            <Metric label={t('transactions')} tip={t('tip_transactions')} value={<span>{s.txCount} <span className="t-caption text-ink-3 font-normal">· {proj.daysLeft} {t('daysLeft')}</span></span>} />
          </div>
        </div>
        <Advice pace={pace} t={t} money={money} />
      </Card>

      {/* ── Insights & upcoming bills ── */}
      <Reveal lazy minHeight={220} className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle icon={<Icon.bulb size={18} />}>{t('insights')}</CardTitle>
          {(alerts.length + spikes.length + biggest.length) === 0
            ? <EmptyState art="bulb" compact>{t('noInsights')}</EmptyState>
            : (
              <ul className="-mx-2 flex flex-col">
                {alerts.map(a => (
                  <InsightRow key={`al-${a.category}`} color={a.over ? 'var(--negative)' : 'var(--warning)'} icon={<Icon.alert size={16} />}
                    text={<><b className="font-semibold">{t(a.category)}</b> <span className="text-ink-2">· {a.over ? t('overBudget') : t('nearLimit')}</span></>}
                    value={<span className={a.over ? 'text-negative' : 'text-warning'}>{Math.round(a.pct)}%</span>} />
                ))}
                {spikes.map(sp => (
                  <InsightRow key={`sp-${sp.category}`} color="var(--warning)" icon={<Icon.trendUp size={16} />}
                    text={<><b className="font-semibold">{t(sp.category)}</b> <span className="text-ink-2">{t('aboveAvg')}</span></>}
                    value={<span className="text-warning">+{Math.round(sp.change)}%</span>} />
                ))}
                {biggest.length > 0 && <li className="px-2 pt-3 pb-1 t-caption text-ink-3">{t('biggestExpenses')}</li>}
                {biggest.map(e => (
                  <InsightRow key={`bg-${e.id}`} color={catColor(e.category)} icon={<CategoryIcon category={e.category} size={16} />}
                    text={e.description} value={<span className="text-negative">−{money(e.amount)}</span>} />
                ))}
              </ul>
            )}
        </Card>

        <Card>
          <CardTitle icon={<Icon.subscriptions size={18} />}>{t('upcomingBills')}</CardTitle>
          {bills.length === 0
            ? <EmptyState art="check" compact>{t('allPaid')}</EmptyState>
            : (
              <ul className="-mx-2 flex flex-col">
                {bills.map(v => (
                  <li key={v.id} className="flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-surface-2">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-3" style={{ color: catColor(v.category) }}>
                      <CategoryIcon category={v.category} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink">{v.name}</div>
                      <div className={cn('t-caption font-normal', v.status === 'overdue' ? 'text-negative' : 'text-warning')}>
                        {v.daysUntil == null ? t('overdue') : v.status === 'overdue' ? t('overdueDays', { n: Math.abs(v.daysUntil) }) : v.daysUntil === 0 ? t('dueToday') : t('inDays', { n: v.daysUntil })}
                      </div>
                    </div>
                    <span className="num text-ink">{money(v.amount)}</span>
                    <Button variant="soft" size="sm" icon={<Icon.check size={14} />} onClick={() => paySubscription(v.id, month)}>{t('markPaid')}</Button>
                  </li>
                ))}
              </ul>
            )}
        </Card>
      </Reveal>

      {/* ── Charts (mounted when scrolled near; keeps Recharts off the first paint) ── */}
      <Reveal lazy minHeight={300} className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>{t('expensesByCat')}</CardTitle>
          <DonutChart data={catData} emptyText={t('noTxThisMonth')} />
        </Card>
        <Card>
          <CardTitle>{t('byPayment')}</CardTitle>
          <PaymentBars data={payData} emptyText={t('noTxThisMonth')} />
        </Card>
      </Reveal>

      <Reveal lazy minHeight={320}>
        <Card>
          <CardTitle icon={<Icon.forecast size={18} />} hint={<>{t('netWorth')}: <span className="num text-ink">{money(currentNetWorth)}</span></>}>{t('netWorthTrend')}</CardTitle>
          <NetWorthChart data={netWorth} />
        </Card>
      </Reveal>

      <Reveal lazy minHeight={320} className="grid items-start gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>{t('trend6m')}</CardTitle>
          <TrendChart data={trendData} />
        </Card>
        <Card>
          <CardTitle hint={`${t('recommended')}: 50 / 30 / 20`}>{t('rule503020')}<Info tip={t('tip_rule')} /></CardTitle>
          <div className="grid grid-cols-3 gap-4">
            {rule.map(r => {
              const status = r.kind === 'savings' ? (r.pct >= r.targetPct ? 'good' : 'warn') : (r.pct > r.targetPct ? 'over' : 'good')
              return (
                <div key={r.kind} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="t-small font-medium text-ink truncate">{r.kind === 'needs' ? t('needs') : r.kind === 'wants' ? t('wants') : t('savingsBucket')}</span>
                    <span className="num text-[15px] text-ink">{r.pct.toFixed(0)}%</span>
                  </div>
                  <div className="num-soft t-small text-ink-2 mt-0.5">{money(r.actual)}</div>
                  <Progress pct={r.targetPct ? (r.pct / r.targetPct) * 100 : 0} status={status} className="mt-2.5" />
                  <div className="t-caption text-ink-3 mt-2 font-normal">{r.targetPct}% · {money(r.recommended)}</div>
                </div>
              )
            })}
          </div>
        </Card>
      </Reveal>

      {/* ── Recent transactions ── */}
      <Reveal lazy minHeight={280}>
        <Card>
          <CardTitle actions={<Button variant="ghost" size="sm" onClick={() => navigate('ledger')}>{t('ledger')}<Icon.arrowRight size={14} className="rtl:rotate-180" /></Button>}>{t('recentTx')}</CardTitle>
          {recent.length === 0
            ? <EmptyState art="ledger" compact action={<Button variant="primary" size="sm" icon={<Icon.plus size={15} />} onClick={() => navigate('expenses', { action: 'add' })}>{t('addExpense')}</Button>}>{t('noTxThisMonth')}</EmptyState>
            : (
              <ul className="-mx-5 max-sm:-mx-4 divide-y divide-line stagger">
                {recent.map(item => {
                  const isInc = item._type === 'income'
                  const label = isInc ? item.source : item.description
                  const meta = isInc
                    ? formatDate(item.date, locale)
                    : `${t(item.category)} · ${item.paymentMethod === 'cash' ? t('cash') : (item.cardName || t('card'))} · ${formatDate(item.date, locale)}`
                  return (
                    <li key={item.id} className="cat-bar flex h-12 items-center gap-3 ps-5 pe-5 max-sm:ps-4 max-sm:pe-4 hover:bg-surface-2 transition-colors" style={{ '--c': isInc ? 'var(--positive)' : catColor(item.category) }}>
                      <span className="inline-flex shrink-0" style={{ color: isInc ? 'var(--positive)' : catColor(item.category) }}>
                        {isInc ? <Icon.wallet size={17} /> : <CategoryIcon category={item.category} size={17} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-ink">{label}</div>
                        <div className="truncate t-caption font-normal text-ink-3">{meta}</div>
                      </div>
                      <span className={cn('num', isInc ? 'text-positive' : 'text-negative')}>{isInc ? '+' : '−'}{formatMoney(item.amount, currency)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
        </Card>
      </Reveal>
    </Stack>
  )
}

function KpiMoney({ value, sign, short = true }) {
  const { currency } = useApp()
  const v = useCountUp(value)
  return <>{formatMoney(v, currency, { short, sign })}</>
}

function MiniStat({ label, tip, value, tone, delta, invert }) {
  return (
    <div className="min-w-0">
      <div className="t-small text-ink-2 flex items-center"><span className="truncate">{label}</span>{tip && <Info tip={tip} />}</div>
      <div className={cn('num text-[20px] leading-7 mt-0.5', tone === 'positive' ? 'text-positive' : tone === 'negative' ? 'text-negative' : 'text-ink')}>{value}</div>
      {delta != null && <DeltaTag pct={delta} invert={invert} />}
    </div>
  )
}

function Metric({ label, value, tone, tip, bar }) {
  const color = tone === 'good' ? 'text-positive' : tone === 'bad' ? 'text-negative' : 'text-ink'
  return (
    <div className="min-w-0">
      <div className="t-caption text-ink-3 flex items-start font-normal leading-4"><span>{label}</span>{tip && <Info tip={tip} />}</div>
      <div className={cn('num text-[16px] leading-6 mt-0.5 truncate', color)}>{value}</div>
      {bar && <Progress pct={bar.pct} status={bar.status} thin className="mt-1.5" />}
    </div>
  )
}

function InsightRow({ color, icon, text, value }) {
  return (
    <li className="flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-surface-2">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-3" style={{ color }}>{icon}</span>
      <span className="min-w-0 flex-1 truncate text-ink">{text}</span>
      <span className="num text-[13.5px] shrink-0">{value}</span>
    </li>
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
  const tone = !pace.hasRef ? 'text-ink-3' : pace.overBudget || pace.status === 'over' ? 'text-negative' : pace.status === 'under' ? 'text-info' : 'text-positive'
  return (
    <div className="flex items-start gap-3 border-t border-line bg-surface-2 px-5 py-3.5 sm:px-6">
      <span className={cn('mt-0.5 inline-flex shrink-0', tone)}><Icon.bulb size={16} /></span>
      <p className="text-[13.5px] leading-relaxed text-ink-2"><span className="font-semibold text-ink">{t('smartTip')}.</span> {t(key, params)}</p>
    </div>
  )
}
