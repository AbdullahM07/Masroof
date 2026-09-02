import { cn } from '../../lib/utils.js'

// Dense, readable data table: 40px rows, hairline separators, hover row
// actions. Amounts use `.num` + `text-end`.
export function Table({ className, children, ...props }) {
  return (
    <div className={cn('-mx-5 min-w-0 overflow-x-auto px-5 max-sm:-mx-4 max-sm:px-4', className)}>
      <table className="w-full border-collapse text-[13.5px]" {...props}>
        {children}
      </table>
    </div>
  )
}

export function THead({ children }) {
  return <thead>{children}</thead>
}
export function TBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>
}
export function TR({ className, children, ...props }) {
  return (
    <tr className={cn('group border-t border-line transition-colors duration-100 hover:bg-surface-2 first:border-t-0', className)} {...props}>
      {children}
    </tr>
  )
}
export function TH({ className, children, end, ...props }) {
  return (
    <th
      scope="col"
      className={cn('h-9 px-3 t-caption text-ink-3 font-medium text-start align-middle whitespace-nowrap first:ps-2 last:pe-2', end && 'text-end', className)}
      {...props}
    >
      {children}
    </th>
  )
}
export function TD({ className, children, end, muted, strong, nowrap, ...props }) {
  return (
    <td
      className={cn(
        'h-10 px-3 align-middle first:ps-2 last:pe-2',
        end && 'text-end',
        muted && 'text-ink-3',
        strong && 'font-medium text-ink',
        nowrap && 'whitespace-nowrap',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}

// Row actions: visible on hover/focus on pointer devices, always on touch.
export function RowActions({ children, className }) {
  return (
    <div className={cn('flex items-center justify-end gap-0.5 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100 transition-opacity duration-100', className)}>
      {children}
    </div>
  )
}

export function TableTotal({ label, children, className }) {
  return (
    <div className={cn('flex items-center justify-between border-t border-line-strong pt-3 mt-1 t-small text-ink-2', className)}>
      <span className="font-medium">{label}</span>
      <span className="num text-[14px]">{children}</span>
    </div>
  )
}
