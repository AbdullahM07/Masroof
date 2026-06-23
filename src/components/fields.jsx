// Design-system form controls that replace browser-native popups:
//  • MonthField — a themed month picker (no native <input type="month"> calendar)
//  • SelectMenu — a drop-in <Select> replacement built on Fluent's custom
//    Dropdown, so the open option list follows the design system instead of the
//    OS-native dropdown.
import { Children, isValidElement, useState } from 'react'
import {
  Popover, PopoverTrigger, PopoverSurface,
  Dropdown, Option, Button, makeStyles, mergeClasses, tokens,
} from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { formatMonthLabel, monthNames, currentMonthStr } from '../lib/format.js'
import { Icon } from './icons.jsx'

/* ───────────────────────── MonthField ───────────────────────── */

const useMonthStyles = makeStyles({
  trigger: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '8px', width: '100%', minWidth: '150px', boxSizing: 'border-box',
    height: '32px', padding: '0 10px',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderBottomColor: tokens.colorNeutralStrokeAccessible,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase300, fontFamily: tokens.fontFamilyBase,
    cursor: 'pointer', textAlign: 'start',
    ':hover': {
      borderTopColor: tokens.colorNeutralStroke1Hover,
      borderRightColor: tokens.colorNeutralStroke1Hover,
      borderLeftColor: tokens.colorNeutralStroke1Hover,
      borderBottomColor: tokens.colorNeutralStrokeAccessibleHover,
    },
    ':disabled': {
      cursor: 'not-allowed',
      color: tokens.colorNeutralForegroundDisabled,
      borderTopColor: tokens.colorNeutralStrokeDisabled,
      borderRightColor: tokens.colorNeutralStrokeDisabled,
      borderBottomColor: tokens.colorNeutralStrokeDisabled,
      borderLeftColor: tokens.colorNeutralStrokeDisabled,
    },
  },
  ico: { color: tokens.colorNeutralForeground3, display: 'inline-flex', flexShrink: 0 },
  surface: { padding: '12px', width: '284px', maxWidth: '92vw' },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  year: { fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase400 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' },
  month: {
    padding: '9px 0', borderRadius: tokens.borderRadiusMedium, border: 'none',
    backgroundColor: tokens.colorTransparentBackground, color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300, fontFamily: tokens.fontFamilyBase, cursor: 'pointer',
    ':hover': { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  selected: {
    backgroundColor: tokens.colorBrandBackground, color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightSemibold,
    ':hover': { backgroundColor: tokens.colorBrandBackgroundHover, color: tokens.colorNeutralForegroundOnBrand },
  },
  foot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' },
})

// Themed month picker. `value`/`onChange` use the same 'YYYY-MM' string the
// native <input type="month"> produced, so it's a drop-in replacement.
export function MonthField({ value, onChange, disabled = false, clearable = false, placeholder }) {
  const { t, locale } = useApp()
  const s = useMonthStyles()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => parseInt((value || currentMonthStr()).split('-')[0], 10))
  const names = monthNames(locale)

  const selYear = value ? parseInt(value.split('-')[0], 10) : null
  const selMonth = value ? parseInt(value.split('-')[1], 10) : null
  const label = value ? formatMonthLabel(value, locale) : (placeholder || t('month'))

  function onOpenChange(_, d) {
    setOpen(d.open)
    if (d.open) setViewYear(parseInt((value || currentMonthStr()).split('-')[0], 10))
  }
  function pick(month1) {
    onChange(`${viewYear}-${String(month1).padStart(2, '0')}`)
    setOpen(false)
  }
  function thisMonth() {
    const m = currentMonthStr()
    onChange(m)
    setViewYear(parseInt(m.split('-')[0], 10))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange} positioning="below-start" withArrow trapFocus>
      <PopoverTrigger disableButtonEnhancement>
        <button type="button" className={s.trigger} disabled={disabled} aria-label={label}>
          <span>{label}</span>
          <span className={s.ico}><Icon.calendar width={16} height={16} /></span>
        </button>
      </PopoverTrigger>
      <PopoverSurface className={s.surface}>
        <div className={s.head}>
          <Button appearance="subtle" size="small" shape="circular"
            icon={<Icon.chevronLeft />} aria-label="previous year"
            onClick={() => setViewYear(y => y - 1)} />
          <span className={s.year}>{viewYear}</span>
          <Button appearance="subtle" size="small" shape="circular"
            icon={<Icon.chevronRight />} aria-label="next year"
            onClick={() => setViewYear(y => y + 1)} />
        </div>
        <div className={s.grid}>
          {names.map((nm, i) => {
            const isSel = selYear === viewYear && selMonth === i + 1
            return (
              <button type="button" key={nm}
                className={mergeClasses(s.month, isSel && s.selected)}
                onClick={() => pick(i + 1)}>
                {nm}
              </button>
            )
          })}
        </div>
        <div className={s.foot}>
          {clearable
            ? <Button appearance="subtle" size="small" onClick={() => { onChange(''); setOpen(false) }}>{t('clear')}</Button>
            : <span />}
          <Button appearance="subtle" size="small" onClick={thisMonth}>{t('gotoThisMonth')}</Button>
        </div>
      </PopoverSurface>
    </Popover>
  )
}

/* ───────────────────────── SelectMenu ───────────────────────── */

// Flatten a React node to plain text (for the collapsed trigger + typeahead).
function nodeText(node) {
  if (node == null || node === false) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement(node)) return nodeText(node.props.children)
  return ''
}

// Drop-in replacement for Fluent's <Select>: keeps the same
// `value` / `onChange={(_, d) => …d.value}` API and `<option>` children, but
// renders Fluent's custom Dropdown so the open list is themed by the design
// system (instead of the OS-native option popup).
export function SelectMenu({ value, onChange, children, placeholder, required, ...rest }) {
  const opts = []
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== 'option') return
    opts.push({ value: String(child.props.value ?? ''), node: child.props.children })
  })
  const selected = opts.find(o => o.value === String(value ?? ''))
  const display = selected ? nodeText(selected.node) : (placeholder || '')

  return (
    <Dropdown
      value={display}
      selectedOptions={[String(value ?? '')]}
      placeholder={placeholder}
      onOptionSelect={(ev, d) => onChange?.(ev, { value: d.optionValue })}
      {...rest}
    >
      {opts.map(o => (
        <Option key={o.value} value={o.value} text={nodeText(o.node)}>
          {o.node}
        </Option>
      ))}
    </Dropdown>
  )
}
