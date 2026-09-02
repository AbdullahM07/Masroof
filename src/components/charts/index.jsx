// Recharts, restyled to the tokens: 1px horizontal grid, no axis lines, no
// tick lines, tabular ticks, a surface-card tooltip. No default Recharts colour
// ever reaches the screen.
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import { useApp } from '../../context/AppContext.jsx'
import { formatMoney } from '../../lib/format.js'
import { cn } from '../../lib/utils.js'

const EASE = 'ease-out'
const TICK = { fill: 'var(--ink-3)', fontSize: 11, fontFamily: 'inherit' }
const GRID = { stroke: 'var(--line)', strokeWidth: 1, vertical: false }

function MoneyTooltip({ active, payload, label }) {
  const { currency } = useApp()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-float min-w-36">
      {label != null && <div className="t-caption text-ink-3 mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-[13px]">
          <span className="flex items-center gap-1.5 text-ink-2">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
            {p.name}
          </span>
          <span className="num text-ink">{formatMoney(p.value, currency, { short: true })}</span>
        </div>
      ))}
    </div>
  )
}

export function Legend({ items, className }) {
  return (
    <div className={cn('mt-3 flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {items.map((d, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 t-small text-ink-2">
          <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
          {d.name}{d.value != null && <span className="num-soft font-medium text-ink">{d.value}</span>}
        </span>
      ))}
    </div>
  )
}

function ChartEmpty({ text, height }) {
  return <div className="grid place-items-center t-small text-ink-3" style={{ height }}>{text}</div>
}

export function DonutChart({ data, emptyText, height = 220 }) {
  const { t, currency } = useApp()
  if (!data.length) return <ChartEmpty text={emptyText} height={height} />
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <>
      <div className="relative" style={{ height }} aria-hidden="true" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" rootTabIndex={-1}
              innerRadius="68%" outerRadius="94%" paddingAngle={2} stroke="var(--surface)" strokeWidth={2} cornerRadius={3}
              isAnimationActive animationDuration={800} animationEasing={EASE}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<MoneyTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="t-caption text-ink-3">{t('total')}</span>
          <span className="num text-[18px] text-ink">{formatMoney(total, currency, { short: true })}</span>
        </div>
      </div>
      <Legend items={data.map(d => ({ ...d, value: formatMoney(d.value, currency, { short: true }) }))} />
    </>
  )
}

export function PaymentBars({ data, emptyText, height = 220 }) {
  const { currency } = useApp()
  if (!data.length) return <ChartEmpty text={emptyText} height={height} />
  return (
    <div style={{ height }} aria-hidden="true" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="name" tick={TICK} tickLine={false} axisLine={false} dy={6} />
          <YAxis tickFormatter={(v) => formatMoney(v, currency, { short: true })} tick={TICK} tickLine={false} axisLine={false} width={64} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'var(--surface-3)', opacity: 0.6 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive animationDuration={700} animationEasing={EASE}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Net worth over time — an area line of total balance per month.
export function NetWorthChart({ data, height = 240 }) {
  const { t, currency } = useApp()
  return (
    <div style={{ height }} aria-hidden="true" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-ink)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--accent-ink)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} dy={6} />
          <YAxis tickFormatter={(v) => formatMoney(v, currency, { short: true })} tick={TICK} tickLine={false} axisLine={false} width={64} />
          <Tooltip content={<MoneyTooltip />} cursor={{ stroke: 'var(--line-strong)', strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="net" name={t('netWorth')} stroke="var(--accent-ink)" strokeWidth={2}
            fill="url(#nwFill)" isAnimationActive animationDuration={800} animationEasing={EASE}
            dot={{ r: 2.5, fill: 'var(--surface)', stroke: 'var(--accent-ink)', strokeWidth: 1.5 }}
            activeDot={{ r: 4, fill: 'var(--accent-ink)', stroke: 'var(--surface)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// 6-month income vs expenses — grouped bars.
export function TrendChart({ data, height = 240 }) {
  const { t, currency } = useApp()
  return (
    <>
      <div style={{ height }} aria-hidden="true" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={3}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} dy={6} />
            <YAxis tickFormatter={(v) => formatMoney(v, currency, { short: true })} tick={TICK} tickLine={false} axisLine={false} width={64} />
            <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'var(--surface-3)', opacity: 0.6 }} />
            <Bar dataKey="income" name={t('income')} fill="var(--positive)" radius={[3, 3, 0, 0]} maxBarSize={22} isAnimationActive animationDuration={700} animationEasing={EASE} />
            <Bar dataKey="expenses" name={t('expenses')} fill="var(--negative)" radius={[3, 3, 0, 0]} maxBarSize={22} isAnimationActive animationDuration={700} animationEasing={EASE} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend items={[{ name: t('income'), color: 'var(--positive)' }, { name: t('expenses'), color: 'var(--negative)' }]} />
    </>
  )
}
