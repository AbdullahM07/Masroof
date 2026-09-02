// ⌘K command palette: navigate, quick add, search transactions.
import { useEffect, useMemo, useState } from 'react'
import { Command } from 'cmdk'
import { useApp } from '../../context/AppContext.jsx'
import { formatDate, formatMoney } from '../../lib/format.js'
import { catColor } from '../../lib/categories.js'
import { cn } from '../../lib/utils.js'
import { Icon, CategoryIcon } from '../icons.jsx'
import { Dialog, DialogContent } from './overlay.jsx'

const NAV = ['dashboard', 'expenses', 'income', 'ledger', 'subscriptions', 'budgets', 'accounts', 'goals', 'cards', 'settings']

export function CommandPalette({ open, onOpenChange, navigate }) {
  const { state, t, locale, currency } = useApp()
  const [q, setQ] = useState('')

  useEffect(() => { if (!open) setQ('') }, [open])

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2 || !state) return []
    const rows = [
      ...state.expenses.map(e => ({ id: e.id, kind: 'expense', label: e.description || '', meta: `${t(e.category)} · ${formatDate(e.date, locale)}`, amount: e.amount, category: e.category, date: e.date, hay: [e.description, e.payee, ...(e.tags || [])].filter(Boolean).join(' ').toLowerCase() })),
      ...state.income.map(e => ({ id: e.id, kind: 'income', label: e.source || '', meta: formatDate(e.date, locale), amount: e.amount, date: e.date, hay: [e.source, e.note].filter(Boolean).join(' ').toLowerCase() })),
    ]
    return rows.filter(r => r.hay.includes(s)).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6)
  }, [q, state, t, locale])

  function go(tab, intent) { navigate(tab, intent); onOpenChange(false) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="p-0 top-[12vh] translate-y-0 max-w-lg overflow-hidden" aria-label="Command palette">
        <Command label="Command palette" shouldFilter={hits.length === 0} className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-line px-4">
            <Icon.search size={16} className="text-ink-3 shrink-0" />
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder={t('searchTx')}
              className="h-12 w-full bg-transparent text-[15px] text-ink placeholder:text-ink-3 outline-none"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center rounded-[4px] border border-line-strong px-1.5 t-caption text-ink-3">Esc</kbd>
          </div>
          <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center t-small text-ink-3">{t('noResults')}</Command.Empty>

            {hits.length > 0 && (
              <Command.Group heading={t('transactions')} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:t-caption [&_[cmdk-group-heading]]:text-ink-3">
                {hits.map(h => (
                  <Item key={`${h.kind}-${h.id}`} value={`tx-${h.id}`} onSelect={() => go('ledger', { q })}>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-surface-3 shrink-0" style={{ color: h.kind === 'income' ? 'var(--positive)' : catColor(h.category) }}>
                      {h.kind === 'income' ? <Icon.wallet size={15} /> : <CategoryIcon category={h.category} size={15} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ink">{h.label}</span>
                      <span className="block truncate t-caption text-ink-3 font-normal">{h.meta}</span>
                    </span>
                    <span className={cn('num text-[13px]', h.kind === 'income' ? 'text-positive' : 'text-negative')}>
                      {h.kind === 'income' ? '+' : '−'}{formatMoney(h.amount, currency, { short: true })}
                    </span>
                  </Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading={t('add')} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:t-caption [&_[cmdk-group-heading]]:text-ink-3">
              <Item value={`add-expense ${t('addExpense')}`} onSelect={() => go('expenses', { action: 'add' })}>
                <Icon.plus size={16} className="text-ink-3" />{t('addExpense')}
              </Item>
              <Item value={`add-income ${t('addIncome')}`} onSelect={() => go('income', { action: 'add' })}>
                <Icon.plus size={16} className="text-ink-3" />{t('addIncome')}
              </Item>
            </Command.Group>

            <Command.Group heading={t('dashboard')} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:t-caption [&_[cmdk-group-heading]]:text-ink-3">
              {NAV.map(key => {
                const Glyph = Icon[key]
                return (
                  <Item key={key} value={`nav-${key} ${t(key)}`} onSelect={() => go(key)}>
                    <Glyph size={16} className="text-ink-3" />{t(key)}
                  </Item>
                )
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function Item({ children, className, ...props }) {
  return (
    <Command.Item
      className={cn(
        'flex h-10 cursor-default select-none items-center gap-3 rounded-sm px-2 text-[13.5px] font-medium text-ink',
        'data-[selected=true]:bg-surface-3 aria-selected:bg-surface-3',
        className,
      )}
      {...props}
    >
      {children}
    </Command.Item>
  )
}
