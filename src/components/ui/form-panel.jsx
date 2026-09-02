import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils.js'
import { Icon } from '../icons.jsx'
import { Button } from './button.jsx'
import { Card, CardTitle } from './card.jsx'

export function useMediaQuery(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

// Entry form card. Always visible on wide screens; on narrow screens it sits
// behind one primary button so the list stays first.
export function FormPanel({ title, icon, open, onOpenChange, children, className, cta }) {
  const wide = useMediaQuery('(min-width: 1024px)')
  const show = wide || open
  return (
    <div className={cn('flex flex-col gap-3 lg:sticky lg:top-[calc(var(--topbar-h)+24px)]', className)}>
      {!wide && (
        <Button variant={open ? 'secondary' : 'primary'} size="lg" className="w-full" onClick={() => onOpenChange(!open)}
          icon={open ? <Icon.chevronDown size={16} className="rotate-180" /> : <Icon.plus size={16} />}>
          {cta || title}
        </Button>
      )}
      {show && (
        <Card className={cn(!wide && 'page-enter')}>
          <CardTitle icon={icon}>{title}</CardTitle>
          {children}
        </Card>
      )}
    </div>
  )
}

// Two-column page: form panel (start) + content (end).
export function TwoCol({ children, className, formWidth = '360px' }) {
  return (
    <div className={cn('grid items-start gap-4 sm:gap-5 lg:grid-cols-[var(--form-w)_minmax(0,1fr)] [&>*]:min-w-0', className)} style={{ '--form-w': formWidth }}>
      {children}
    </div>
  )
}

// Amount input suffix (currency code) used by every money field.
export function CurrencySuffix({ code }) {
  return <span className="t-caption text-ink-3 pe-1 pointer-events-none">{code}</span>
}
