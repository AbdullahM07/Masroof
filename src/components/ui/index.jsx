import { useEffect, useRef, useState } from 'react'
import { ProgressBar as FluentProgressBar } from '@fluentui/react-components'
import { useApp } from '../../context/AppContext.jsx'
import { formatMoney } from '../../lib/format.js'
import { MonthField } from '../fields.jsx'
import { Icon } from '../icons.jsx'

export function EmptyState({ icon = 'wallet', children }) {
  const Glyph = typeof icon === 'string' ? (Icon[icon] || Icon.wallet) : null
  return (
    <div className="empty-state">
      <span className="empty-ico">{Glyph ? <Glyph /> : icon}</span>
      {children}
    </div>
  )
}

export function MonthPicker({ value, onChange }) {
  const { t } = useApp()
  return (
    <div className="row" style={{ gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
      <span>{t('month')}</span>
      <MonthField value={value} onChange={onChange} />
    </div>
  )
}

// status: 'good' | 'warn' | 'over' | '' → maps to a Fluent ProgressBar color
const PROGRESS_COLOR = { good: 'success', warn: 'warning', over: 'error' }
export function ProgressBar({ pct, status = '' }) {
  const value = Math.min(1, Math.max(0, pct / 100))
  return <FluentProgressBar value={value} color={PROGRESS_COLOR[status] || 'brand'} thickness="large" shape="rounded" />
}

// Animated circular gauge ("spin ring"). `value`/`max` drive the arc;
// the arc animates from empty on mount. Children render in the centre.
export function RingGauge({ value, max = 100, size = 132, stroke = 11, color = 'var(--brand)', track = 'var(--surface-alt)', children }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0))
  const [draw, setDraw] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setDraw(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])
  const offset = circ * (1 - draw)
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}

// Count-up animation for KPI numbers. Returns the animated numeric value.
export function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0)
  const ref = useRef({ from: 0, start: 0 })
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) { setVal(target); return }
    ref.current.from = val
    let raf
    const startT = performance.now()
    const from = ref.current.from
    const tick = (now) => {
      const p = Math.min(1, (now - startT) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(from + (target - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])
  return val
}

// Small "i" badge that reveals an explanation on hover/focus.
export function Info({ tip }) {
  if (!tip) return null
  return <span className="info" tabIndex={0} data-tip={tip} aria-label={tip}>i</span>
}

// KPI card. `icon` is an SVG node (no background chip). `feature` paints it accent.
export function StatCard({ icon, label, value, valueClass = '', delta, deltaInvert, feature, sub, tip }) {
  return (
    <div className={`stat-card reveal ${feature ? 'feature' : ''}`}>
      <div className="stat-top">
        <span className="stat-label">{label}{tip && <Info tip={tip} />}</span>
        {icon && <span className="stat-ico">{icon}</span>}
      </div>
      <div className={`stat-value ${valueClass}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {delta != null && <DeltaTag pct={delta} invert={deltaInvert} />}
    </div>
  )
}

export function DeltaTag({ pct, invert = false }) {
  const { t } = useApp()
  if (pct == null) return null
  const up = pct >= 0
  const cls = pct === 0 ? 'flat' : (up === !invert ? 'up' : 'down')
  const Arrow = pct === 0 ? null : (up ? Icon.trendUp : Icon.trendDown)
  return (
    <span className={`stat-delta ${cls}`}>
      {Arrow && <Arrow width={14} height={14} />}
      {Math.abs(pct).toFixed(0)}% <span className="delta-cap">{t('vsLastMonth')}</span>
    </span>
  )
}

export function Money({ value, short = false, sign = false }) {
  const { currency } = useApp()
  return <>{formatMoney(value, currency, { short, sign })}</>
}