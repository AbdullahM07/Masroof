// Switch, segmented RadioGroup, Badge, Progress, Skeleton, Tabs.
import { Switch as RSw, RadioGroup as RRg, Progress as RPg, Tabs as RTb } from 'radix-ui'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils.js'

/* ── Switch ──────────────────────────────────────────────── */
export function Switch({ checked, onCheckedChange, label, description, className, id, disabled }) {
  const control = (
    <RSw.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-line-strong transition-colors duration-150',
        'data-[state=checked]:bg-accent disabled:opacity-50',
      )}
    >
      <RSw.Thumb
        className={cn(
          'block h-4 w-4 rounded-full bg-white shadow-card transition-transform duration-150 ease-out-soft',
          'translate-x-0.5 data-[state=checked]:translate-x-[18px]',
          'rtl:-translate-x-0.5 rtl:data-[state=checked]:-translate-x-[18px]',
        )}
      />
    </RSw.Root>
  )
  if (!label) return control
  return (
    <label className={cn('flex items-center justify-between gap-4 cursor-pointer', className)}>
      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[14px] text-ink">{label}</span>
        {description && <span className="t-small text-ink-3">{description}</span>}
      </span>
      {control}
    </label>
  )
}

/* ── Segmented radio ─────────────────────────────────────── */
// options: [{ value, label, icon? }]
export function Segmented({ value, onValueChange, options, className, size = 'md', 'aria-label': ariaLabel }) {
  return (
    <RRg.Root
      value={value}
      onValueChange={onValueChange}
      orientation="horizontal"
      aria-label={ariaLabel}
      className={cn('inline-flex max-w-full rounded-sm bg-surface-3 p-0.5 gap-0.5', className)}
    >
      {options.map(o => (
        <RRg.Item
          key={o.value}
          value={o.value}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] px-3 whitespace-nowrap font-medium text-ink-2 transition-[background-color,color,box-shadow] duration-150',
            size === 'sm' ? 'h-7 text-[13px]' : 'h-8 text-[13.5px]',
            'hover:text-ink data-[state=checked]:bg-surface data-[state=checked]:text-ink data-[state=checked]:shadow-card',
          )}
        >
          {o.icon}
          {o.label}
        </RRg.Item>
      ))}
    </RRg.Root>
  )
}

/* ── Badge ───────────────────────────────────────────────── */
const badge = cva('inline-flex h-6 items-center gap-1 rounded-sm px-2 text-[12px] font-medium whitespace-nowrap [&_svg]:shrink-0', {
  variants: {
    tone: {
      neutral: 'bg-surface-3 text-ink-2',
      accent: 'bg-accent-soft text-accent-ink',
      positive: 'bg-positive-soft text-positive',
      negative: 'bg-negative-soft text-negative',
      warning: 'bg-warning-soft text-warning',
      info: 'bg-info-soft text-info',
      outline: 'border border-line-strong text-ink-2 bg-transparent',
    },
  },
  defaultVariants: { tone: 'neutral' },
})
export function Badge({ tone, className, children, ...props }) {
  return <span className={cn(badge({ tone }), className)} {...props}>{children}</span>
}

/* ── Progress ────────────────────────────────────────────── */
// status: 'good' | 'warn' | 'over' | 'accent' | '' — width, not transform, so RTL mirrors for free.
const STATUS_BG = { good: 'bg-positive', warn: 'bg-warning', over: 'bg-negative', accent: 'bg-accent-ink' }
export function Progress({ pct = 0, status = 'accent', className, thin = false, label }) {
  const v = Math.min(100, Math.max(0, Number(pct) || 0))
  return (
    <RPg.Root
      value={v}
      aria-label={label || `${Math.round(v)}%`}
      className={cn('relative w-full overflow-hidden rounded-full bg-surface-3', thin ? 'h-1' : 'h-1.5', className)}
    >
      <RPg.Indicator
        className={cn('h-full w-full origin-left rtl:origin-right rounded-full transition-transform duration-500 ease-out-soft', STATUS_BG[status] || STATUS_BG.accent)}
        style={{ transform: `scaleX(${v / 100})` }}
      />
    </RPg.Root>
  )
}

/* ── Skeleton ────────────────────────────────────────────── */
export function Skeleton({ className, style }) {
  return <div className={cn('skeleton h-4 w-full', className)} style={style} aria-hidden="true" />
}

/* ── Tabs ────────────────────────────────────────────────── */
export const Tabs = RTb.Root
export const TabsContent = RTb.Content
export function TabsList({ className, ...props }) {
  return <RTb.List className={cn('flex items-center gap-1 border-b border-line', className)} {...props} />
}
export function TabsTrigger({ className, ...props }) {
  return (
    <RTb.Trigger
      className={cn(
        'relative -mb-px inline-flex h-9 items-center gap-2 border-b-2 border-transparent px-3 text-[13.5px] font-medium text-ink-2 transition-colors',
        'hover:text-ink data-[state=active]:border-accent-ink data-[state=active]:text-ink',
        className,
      )}
      {...props}
    />
  )
}
