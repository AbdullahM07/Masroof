// Form controls that replace browser-native popups:
//  • MonthField — themed month picker (year stepper + month grid)
//  • SelectMenu — `<option>`-children convenience wrapper around Select
import { Children, isValidElement, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatMonthLabel, monthNames, currentMonthStr } from '../lib/format.js'
import { cn } from '../lib/utils.js'
import { Icon } from './icons.jsx'
import { Button, IconButton } from './ui/button.jsx'
import { Popover, PopoverTrigger, PopoverContent } from './ui/overlay.jsx'
import { Select } from './ui/select.jsx'

/* ───────────────────────── MonthField ───────────────────────── */

// `value`/`onChange` use 'YYYY-MM' strings. `clearable` adds a clear action.
export function MonthField({ value, onChange, disabled = false, clearable = false, placeholder, className, id, size = 'md' }) {
  const { t, locale } = useApp()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => parseInt((value || currentMonthStr()).split('-')[0], 10))
  const names = monthNames(locale)
  const now = currentMonthStr()

  const selYear = value ? parseInt(value.split('-')[0], 10) : null
  const selMonth = value ? parseInt(value.split('-')[1], 10) : null
  const label = value ? formatMonthLabel(value, locale) : (placeholder || t('month'))

  function onOpenChange(o) {
    setOpen(o)
    if (o) setViewYear(parseInt((value || now).split('-')[0], 10))
  }
  function pick(month1) {
    onChange(`${viewYear}-${String(month1).padStart(2, '0')}`)
    setOpen(false)
  }
  function thisMonth() {
    onChange(now)
    setViewYear(parseInt(now.split('-')[0], 10))
    setOpen(false)
  }
  function step(delta) {
    const base = value || now
    const [y, m] = base.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className={cn('inline-flex items-stretch rounded-sm border border-line-strong bg-surface transition-[border-color,box-shadow] hover:border-ink-3 focus-within:border-accent-ink focus-within:ring-[3px] focus-within:ring-accent-ink/15', size === 'sm' ? 'h-8' : 'h-9', disabled && 'opacity-50 pointer-events-none', className)}>
      <button type="button" onClick={() => step(-1)} aria-label={t('month') + ' -1'} className="px-1.5 text-ink-3 hover:text-ink hover:bg-surface-2 rounded-s-[5px] focus-visible:outline-offset-[-2px]">
        <Icon.chevronLeft size={16} className="rtl:rotate-180" />
      </button>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            className={cn('inline-flex min-w-[124px] flex-1 items-center justify-between gap-2 px-2 text-start text-ink focus-visible:outline-offset-[-2px]', size === 'sm' ? 'text-[13px]' : 'text-[14px]', !value && 'text-ink-3')}
            aria-label={label}
          >
            <span className="truncate font-medium">{label}</span>
            <Icon.calendar size={15} className="text-ink-3 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[276px] p-3" align="start">
          <div className="flex items-center justify-between mb-2">
            <IconButton label="previous year" size="iconSm" onClick={() => setViewYear(y => y - 1)}>
              <Icon.chevronLeft size={16} className="rtl:rotate-180" />
            </IconButton>
            <span className="num text-[15px]">{viewYear}</span>
            <IconButton label="next year" size="iconSm" onClick={() => setViewYear(y => y + 1)}>
              <Icon.chevronRight size={16} className="rtl:rotate-180" />
            </IconButton>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {names.map((nm, i) => {
              const key = `${viewYear}-${String(i + 1).padStart(2, '0')}`
              const isSel = selYear === viewYear && selMonth === i + 1
              const isNow = key === now
              return (
                <button
                  type="button"
                  key={nm}
                  onClick={() => pick(i + 1)}
                  className={cn(
                    'h-9 rounded-sm text-[13px] transition-colors duration-100',
                    isSel ? 'bg-accent text-on-accent font-semibold' : 'text-ink hover:bg-surface-3',
                    isNow && !isSel && 'text-accent-ink font-semibold',
                  )}
                >
                  {nm}
                </button>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
            {clearable
              ? <Button variant="ghost" size="sm" onClick={() => { onChange(''); setOpen(false) }}>{t('clear')}</Button>
              : <span />}
            <Button variant="soft" size="sm" onClick={thisMonth}>{t('gotoThisMonth')}</Button>
          </div>
        </PopoverContent>
      </Popover>
      <button type="button" onClick={() => step(1)} aria-label={t('month') + ' +1'} className="px-1.5 text-ink-3 hover:text-ink hover:bg-surface-2 rounded-e-[5px] focus-visible:outline-offset-[-2px]">
        <Icon.chevronRight size={16} className="rtl:rotate-180" />
      </button>
    </div>
  )
}

/* ───────────────────────── SelectMenu ───────────────────────── */

function nodeText(node) {
  if (node == null || node === false) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement(node)) return nodeText(node.props.children)
  return ''
}

// Keeps the `<option>`-children API: value / onChange(value) / placeholder.
export function SelectMenu({ value, onChange, children, placeholder, className, ...rest }) {
  const options = []
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== 'option') return
    options.push({ value: String(child.props.value ?? ''), label: nodeText(child.props.children), icon: child.props['data-icon'] })
  })
  return (
    <Select
      value={String(value ?? '')}
      onValueChange={(v) => onChange?.(v)}
      options={options}
      placeholder={placeholder}
      className={className}
      {...rest}
    />
  )
}
