import { cn } from '../../lib/utils.js'

// Line illustrations drawn in the icon grammar (1.5px stroke, currentColor).
const ART = {
  ledger: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="22" y="10" width="76" height="60" rx="6" />
      <path d="M34 26h28M34 38h52M34 50h40M34 62h20" />
      <circle cx="86" cy="26" r="6" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M26 24a6 6 0 0 1 6-6h52a6 6 0 0 1 6 6" />
      <rect x="22" y="22" width="76" height="42" rx="6" />
      <path d="M76 43h20a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H76a4 4 0 0 0 0 8z" />
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M36 10h48v60l-6-4-6 4-6-4-6 4-6-4-6 4-6-4-6 4z" />
      <path d="M48 28h24M48 40h24M48 52h14" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="40" r="28" />
      <circle cx="60" cy="40" r="17" />
      <circle cx="60" cy="40" r="6" />
      <path d="M60 40l30-28" strokeLinecap="round" />
    </svg>
  ),
  pie: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="56" cy="42" r="28" />
      <path d="M56 14v28h28" />
      <path d="M92 20l8-8M96 30h10" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 30l36-18 36 18H24z" />
      <path d="M32 30v28M48 30v28M72 30v28M88 30v28M24 66h72" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="20" y="20" width="80" height="44" rx="6" />
      <path d="M20 34h80M32 52h18" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="26" y="16" width="68" height="54" rx="6" />
      <path d="M26 32h68M44 10v10M76 10v10" />
      <path d="M48 52l8 8 16-16" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="40" r="28" />
      <path d="M46 41l10 10 20-22" />
    </svg>
  ),
  bulb: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 10a20 20 0 0 0-12 36c2 1.5 3 4 3 6v4h18v-4c0-2 1-4.5 3-6a20 20 0 0 0-12-36z" />
      <path d="M52 64h16M55 70h10" />
    </svg>
  ),
  swap: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 30h56l-10-10M90 50H34l10 10" />
    </svg>
  ),
}

export function EmptyState({ art = 'ledger', title, children, action, className, compact = false }) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'py-6' : 'py-10', className)}>
      <div className={cn('text-ink-3/70', compact ? 'w-24' : 'w-32')} aria-hidden="true">{ART[art] || ART.ledger}</div>
      {title && <p className="mt-3 font-medium text-ink">{title}</p>}
      {children && <div className="mt-1 t-small text-ink-2 max-w-xs leading-relaxed">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
