import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils.js'

export const inputClass = [
  'h-9 w-full min-w-0 rounded-sm border border-line-strong bg-surface px-3 text-[14px] text-ink',
  'placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150',
  'hover:border-ink-3',
  'focus:outline-none focus-visible:outline-none focus:border-accent-ink focus:ring-[3px] focus:ring-accent-ink/15',
  'disabled:opacity-50 disabled:bg-surface-2',
  'aria-[invalid=true]:border-negative aria-[invalid=true]:focus:ring-negative/15',
].join(' ')

export const Input = forwardRef(function Input({ className, before, after, invalid, ...props }, ref) {
  if (!before && !after) {
    return <input ref={ref} className={cn(inputClass, className)} aria-invalid={invalid || undefined} {...props} />
  }
  return (
    <div className={cn('relative flex items-center', className)}>
      {before && <span className="absolute start-3 text-ink-3 pointer-events-none inline-flex">{before}</span>}
      <input ref={ref} className={cn(inputClass, before && 'ps-9', after && 'pe-9')} aria-invalid={invalid || undefined} {...props} />
      {after && <span className="absolute end-2 inline-flex">{after}</span>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(inputClass, 'h-auto min-h-20 py-2 resize-y', className)} {...props} />
})

// Label + control + optional hint / inline error. Passes `id` to a single child
// control automatically so the label is real.
export function Field({ label, required, hint, error, children, className, htmlFor }) {
  const auto = useId()
  const id = htmlFor || auto
  const isEl = children && typeof children === 'object' && !Array.isArray(children) && children.type
  const isDom = isEl && typeof children.type === 'string'
  const child = isEl
    ? { ...children, props: { ...children.props, id: children.props.id || id, ...(isDom ? {} : { invalid: children.props.invalid ?? !!error }) } }
    : children
  return (
    <div className={cn('flex flex-col gap-1.5 min-w-0', className)}>
      {label && (
        <label htmlFor={id} className="t-small font-medium text-ink-2 flex items-center gap-1">
          {label}
          {required && <span className="text-negative" aria-hidden="true">*</span>}
        </label>
      )}
      {child}
      {error
        ? <p className="t-caption text-negative font-normal" role="alert">{error}</p>
        : hint ? <p className="t-caption text-ink-3 font-normal">{hint}</p> : null}
    </div>
  )
}

export function Label({ className, ...props }) {
  return <label className={cn('t-small font-medium text-ink-2', className)} {...props} />
}
