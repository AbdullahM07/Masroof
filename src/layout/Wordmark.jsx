import { useApp } from '../context/AppContext.jsx'
import { cn } from '../lib/utils.js'

// Brand mark: a folded note in the accent, next to the wordmark.
export function Mark({ size = 28, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={cn('shrink-0', className)} aria-hidden="true">
      <rect x="2" y="5" width="24" height="18" rx="4" fill="var(--accent)" />
      <path d="M2 11h24" stroke="var(--on-accent)" strokeOpacity=".35" strokeWidth="1.2" />
      <rect x="6" y="15" width="7" height="3" rx="1.5" fill="var(--on-accent)" fillOpacity=".9" />
      <circle cx="20.5" cy="16.5" r="2.2" fill="var(--on-accent)" fillOpacity=".9" />
    </svg>
  )
}

export function Wordmark({ compact = false, className, size = 28 }) {
  const { t } = useApp()
  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <Mark size={size} />
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink truncate">{t('appName')}</span>}
    </div>
  )
}
