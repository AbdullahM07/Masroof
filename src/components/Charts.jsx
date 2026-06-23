import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney } from '../lib/format.js'

const EASE = 'ease-out'

function MoneyTooltip({ active, payload, label }) {
  const { currency } = useApp()
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      {label != null && <div className="chart-tip-title">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="chart-tip-row">
          <span style={{ color: p.color || p.payload?.fill }}>{p.name}</span>
          <b>{formatMoney(p.value, currency, { short: true })}</b>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({ data, emptyText }) {
  const { t, currency } = useApp()
  if (!data.length) return <div className="chart-wrap"><div className="chart-empty">{emptyText}</div></div>
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
                 innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none"
                 isAnimationActive animationDuration={900} animationEasing={EASE}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<MoneyTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <div className="donut-center-label">{t('total')}</div>
          <div className="donut-center-value">{formatMoney(total, currency, { short: true })}</div>
        </div>
      </div>
      <div className="legend">
        {data.map((d, i) => (
          <span key={i} className="legend-item">
            <span className="dot" style={{ background: d.color }} />
            {d.name} <b>{formatMoney(d.value, currency, { short: true })}</b>
          </span>
        ))}
      </div>
    </>
  )
}

export function PaymentBars({ data, emptyText }) {
  const { currency } = useApp()
  if (!data.length) return <div className="chart-wrap"><div className="chart-empty">{emptyText}</div></div>
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => formatMoney(v, currency, { short: true })} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={62} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'var(--surface-alt)', opacity: .5 }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={800} animationEasing={EASE}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Net worth over time — an area line of total balance per month.
export function NetWorthChart({ data }) {
  const { t, currency } = useApp()
  return (
    <div className="chart-wrap" style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => formatMoney(v, currency, { short: true })} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={62} />
          <Tooltip content={<MoneyTooltip />} cursor={{ stroke: 'var(--border)' }} />
          <Area type="monotone" dataKey="net" name={t('netWorth')} stroke="var(--brand)" strokeWidth={2.5}
            fill="url(#nwFill)" isAnimationActive animationDuration={900} animationEasing={EASE} dot={{ r: 3, fill: 'var(--brand)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// 6-month income vs expenses — grouped bars (robust with sparse data).
export function TrendChart({ data }) {
  const { t, currency } = useApp()
  return (
    <>
      <div className="chart-wrap" style={{ height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => formatMoney(v, currency, { short: true })} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={62} />
            <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'var(--surface-alt)', opacity: .5 }} />
            <Bar dataKey="income" name={t('income')} fill="var(--success)" radius={[6, 6, 0, 0]} maxBarSize={26} isAnimationActive animationDuration={800} animationEasing={EASE} />
            <Bar dataKey="expenses" name={t('expenses')} fill="var(--danger)" radius={[6, 6, 0, 0]} maxBarSize={26} isAnimationActive animationDuration={800} animationEasing={EASE} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        <span className="legend-item"><span className="dot" style={{ background: 'var(--success)' }} />{t('income')}</span>
        <span className="legend-item"><span className="dot" style={{ background: 'var(--danger)' }} />{t('expenses')}</span>
      </div>
    </>
  )
}
