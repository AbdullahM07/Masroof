import { cn } from '../../lib/utils.js'

export function Card({ className, children, ...props }) {
  return (
    <section className={cn('card', className)} {...props}>
      {children}
    </section>
  )
}

// Card heading row: title (H2), optional leading icon, optional trailing hint/actions.
export function CardTitle({ icon, children, hint, actions, className, as: Tag = 'h2' }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-4 min-h-7', className)}>
      {icon && <span className="text-ink-3 inline-flex shrink-0">{icon}</span>}
      <Tag className="t-h2 text-ink flex items-center gap-1.5 min-w-0">{children}</Tag>
      {hint && <span className="t-small text-ink-3 num-soft basis-full sm:basis-auto sm:ms-auto sm:text-end">{hint}</span>}
      {actions && <div className={cn('flex items-center gap-2', !hint && 'ms-auto')}>{actions}</div>}
    </div>
  )
}
