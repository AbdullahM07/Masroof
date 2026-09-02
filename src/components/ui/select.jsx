import { Select as RS } from 'radix-ui'
import { cn } from '../../lib/utils.js'
import { Icon } from '../icons.jsx'

// Themed select. `options`: [{ value, label, icon?, disabled? }]. Empty-string
// values are allowed (they render as a normal option), which the pages rely on
// for "All …" / "None" choices.
// Radix treats "" as "no selection" (shows the placeholder), so an explicit
// empty-string option is encoded as a sentinel instead.
const NONE = '__none__'
const dec = (v) => (v === NONE ? '' : v)

export function Select({ value, onValueChange, options, placeholder, className, contentClassName, disabled, id, invalid, size = 'md', ...props }) {
  const hasEmpty = options.some(o => o.value == null || String(o.value) === '')
  const enc = (v) => (v == null || v === '') ? (hasEmpty ? NONE : '') : String(v)
  const selected = options.find(o => String(o.value ?? '') === String(value ?? ''))
  return (
    <RS.Root value={enc(value)} onValueChange={(v) => onValueChange?.(dec(v))} disabled={disabled} {...props}>
      <RS.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        className={cn(
          'group inline-flex w-full min-w-0 items-center justify-between gap-2 rounded-sm border border-line-strong bg-surface px-3 text-start text-[14px] text-ink',
          size === 'sm' ? 'h-8 text-[13px]' : 'h-9',
          'transition-[border-color,box-shadow] duration-150 hover:border-ink-3',
          'focus:outline-none focus-visible:outline-none focus:border-accent-ink focus:ring-[3px] focus:ring-accent-ink/15',
          'data-[state=open]:border-accent-ink data-[state=open]:ring-[3px] data-[state=open]:ring-accent-ink/15',
          'disabled:opacity-50 aria-[invalid=true]:border-negative',
          'data-[placeholder]:text-ink-3',
          className,
        )}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selected?.icon && <span className="inline-flex shrink-0 text-ink-3">{selected.icon}</span>}
          <RS.Value placeholder={placeholder} />
        </span>
        <RS.Icon className="text-ink-3 shrink-0 transition-transform duration-150 group-data-[state=open]:rotate-180">
          <Icon.chevronDown size={16} />
        </RS.Icon>
      </RS.Trigger>
      <RS.Portal>
        <RS.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'z-[300] max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden',
            'rounded-md border border-line bg-surface p-1 shadow-float',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-1',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150',
            contentClassName,
          )}
        >
          <RS.Viewport className="p-0">
            {options.map(o => (
              <RS.Item
                key={enc(o.value)}
                value={enc(o.value)}
                disabled={o.disabled}
                className={cn(
                  'relative flex h-8 cursor-default select-none items-center gap-2 rounded-[4px] ps-2.5 pe-8 text-[13.5px] text-ink outline-none',
                  'data-[highlighted]:bg-surface-3 data-[state=checked]:font-medium data-[disabled]:opacity-50',
                )}
              >
                {o.icon && <span className="inline-flex shrink-0 text-ink-3">{o.icon}</span>}
                <RS.ItemText>{o.label}</RS.ItemText>
                <RS.ItemIndicator className="absolute end-2 text-accent-ink inline-flex">
                  <Icon.check size={14} />
                </RS.ItemIndicator>
              </RS.Item>
            ))}
          </RS.Viewport>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  )
}
