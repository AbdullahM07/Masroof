// App-level UI atoms shared by the pages. Primitives live in their own files.
import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { formatMoney } from '../../lib/format.js'
import { cn } from '../../lib/utils.js'
import { MonthField } from '../fields.jsx'
import { Icon } from '../icons.jsx'
import { Tooltip } from './overlay.jsx'
import { Progress } from './controls.jsx'

export { Button, DeleteButton, IconButton } from './button.jsx'
export { Card, CardTitle } from './card.jsx'
export { Input, Textarea, Field, Label } from './input.jsx'
export { Select } from './select.jsx'
export { Popover, PopoverTrigger, PopoverContent, Tooltip, TooltipProvider, Dialog, DialogTrigger, DialogClose, DialogContent, DialogFooter, SheetContent } from './overlay.jsx'
export { Switch, Segmented, Badge, Progress, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from './controls.jsx'
export { Table, THead, TBody, TR, TH, TD, RowActions, TableTotal } from './table.jsx'
export { EmptyState } from './empty-state.jsx'

export function MonthPicker({ value, onChange, className }) {
  return <MonthField value={value} onChange={onChange} className={className} />
}

// Back-compat name used by pages: status-coloured progress bar.
export function ProgressBar({ pct, status = '' }) {
  return <Progress pct={pct} status={status || 'accent'} />
}

// Arc gauge: 240° sweep open at the bottom, thin stroke, animates on mount.
export function RingGauge({ value, max = 100, size = 160, stroke = 8, color = 'var(--accent-ink)', track = 'var(--surface-3)', sweep = 240, children, className }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const arcLen = circ * (sweep / 360)
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0))
  const [draw, setDraw] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setDraw(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])
  const rotate = 90 + (360 - sweep) / 2
  return (
    <div className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${arcLen} ${circ}`} transform={`rotate(${rotate} ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${arcLen * draw} ${circ}`} transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1s var(--ease)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">{children}</div>
    </div>
  )
}

// Count-up animation for KPI numbers. Returns the animated numeric value.
// Updates are capped at ~16 steps so the hero relayouts stay cheap on slow devices.
export function useCountUp(target, duration = 700, steps = 16) {
  const [val, setVal] = useState(0)
  const ref = useRef(0)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) { setVal(target); ref.current = target; return }
    let raf
    const from = ref.current
    const startT = performance.now()
    const interval = duration / steps
    let last = -Infinity
    const tick = (now) => {
      const p = Math.min(1, (now - startT) / duration)
      if (p >= 1 || now - last >= interval) {
        last = now
        const eased = 1 - Math.pow(1 - p, 3)
        const v = from + (target - from) * eased
        ref.current = v
        setVal(v)
      }
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, steps])
  return val
}

// Small "i" badge that explains a figure on hover/focus.
export function Info({ tip }) {
  if (!tip) return null
  return (
    <Tooltip content={tip} side="top">
      <button
        type="button"
        aria-label={tip}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-line-strong text-ink-3 text-[10px] font-semibold leading-none hover:border-accent-ink hover:text-accent-ink transition-colors ms-1 align-middle"
      >
        i
      </button>
    </Tooltip>
  )
}

// Secondary KPI tile.
export function StatCard({ icon, label, value, valueClass = '', delta, deltaInvert, sub, tip, className }) {
  return (
    <div className={cn('card flex flex-col gap-2 min-w-0', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="t-small text-ink-2 flex items-center min-w-0"><span className="truncate">{label}</span>{tip && <Info tip={tip} />}</span>
        {icon && <span className="text-ink-3 inline-flex shrink-0">{icon}</span>}
      </div>
      <div className={cn('num text-[24px] leading-7 text-ink truncate', valueClass)}>{value}</div>
      <div className="flex items-center justify-between gap-2 min-h-4">
        {sub && <span className="t-small text-ink-3 truncate">{sub}</span>}
        {delta != null && <DeltaTag pct={delta} invert={deltaInvert} />}
      </div>
    </div>
  )
}

export function DeltaTag({ pct, invert = false }) {
  const { t } = useApp()
  if (pct == null) return null
  const up = pct >= 0
  const good = pct === 0 ? null : (up === !invert)
  const Arrow = pct === 0 ? null : (up ? Icon.trendUp : Icon.trendDown)
  return (
    <span className={cn('inline-flex items-center gap-1 t-caption num-soft', good == null ? 'text-ink-3' : good ? 'text-positive' : 'text-negative')}>
      {Arrow && <Arrow size={13} />}
      {Math.abs(pct).toFixed(0)}%
      <span className="text-ink-3 font-normal hidden sm:inline">{t('vsLastMonth')}</span>
    </span>
  )
}

// Money strings are Latin in both locales; <bdi> keeps sign and unit in order inside RTL text.
export function Money({ value, short = false, sign = false }) {
  const { currency } = useApp()
  return <bdi>{formatMoney(value, currency, { short, sign })}</bdi>
}

// Section wrapper with the standard vertical rhythm.
export function Stack({ className, children }) {
  return <div className={cn('flex flex-col gap-4 sm:gap-5', className)}>{children}</div>
}
export { FormPanel, TwoCol, CurrencySuffix, useMediaQuery } from './form-panel.jsx'
export { Reveal } from './reveal.jsx'
