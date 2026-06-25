import { useMemo, useState } from 'react'
import {
  Badge, Button, Input,
  Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow,
} from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { EmptyState, Money } from '../components/ui/index.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { DeleteButton } from '../components/fluentBits.jsx'
import { useConfirm } from '../components/Confirm.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

const blankFilters = () => ({ q: '', from: '', to: '', type: '', cat: '', acc: '', pay: '' })

// A single searchable ledger of every income + expense across all months.
export default function Ledger() {
  const { state, t, locale, deleteIncome, deleteExpense } = useApp()
  const confirm = useConfirm()
  const [f, setF] = useState(blankFilters)
  const accounts = state.accounts || []
  const set = (patch) => setF(prev => ({ ...prev, ...patch }))

  const accName = (id) => accounts.find(a => a.id === id)?.name || '—'

  // Unified rows from income + expenses.
  const all = useMemo(() => [
    ...state.income.map(e => ({
      id: e.id, kind: 'income', date: e.date, label: e.source || '',
      category: null, account: e.accountId, payment: null,
      note: e.note || '', amount: Number(e.amount) || 0, recurring: !!e.recurring,
    })),
    ...state.expenses.map(e => ({
      id: e.id, kind: 'expense', date: e.date, label: e.description || '',
      category: e.category, account: e.accountId, payment: e.paymentMethod,
      cardName: e.cardName, payee: e.payee || '', tags: e.tags || [],
      amount: Number(e.amount) || 0, recurring: !!e.recurring,
    })),
  ], [state.income, state.expenses])

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return all.filter(r => {
      if (f.type && r.kind !== f.type) return false
      if (f.from && (r.date || '') < f.from) return false
      if (f.to && (r.date || '') > f.to) return false
      if (f.cat && r.category !== f.cat) return false
      if (f.acc && r.account !== f.acc) return false
      if (f.pay && r.payment !== f.pay) return false
      if (q) {
        const hay = [r.label, r.note, r.payee, ...(r.tags || [])].filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [all, f])

  const totals = useMemo(() => {
    let inc = 0, exp = 0
    for (const r of rows) (r.kind === 'income' ? (inc += r.amount) : (exp += r.amount))
    return { inc, exp, net: inc - exp }
  }, [rows])

  const filtersActive = Object.values(f).some(Boolean)

  async function remove(r) {
    const ok = await confirm({ title: t('delete'), body: r.label || t('delete'), danger: true })
    if (!ok) return
    r.kind === 'income' ? deleteIncome(r.id) : deleteExpense(r.id)
  }

  return (
    <div className="card">
      <div className="card-title">
        {t('ledger')}
        <span className="hint">{t('showing', { n: rows.length, total: all.length })}</span>
      </div>

      {/* Filters */}
      <div className="filters-row" style={{ marginBottom: 12 }}>
        <Input type="text" placeholder={t('searchTx')} value={f.q} onChange={(_, d) => set({ q: d.value })}
          contentBefore={<Icon.search width={16} height={16} />} />
        <SelectMenu value={f.type} onChange={(_, d) => set({ type: d.value })}>
          <option value="">{t('allTypes')}</option>
          <option value="income">{t('inflow')}</option>
          <option value="expense">{t('outflow')}</option>
        </SelectMenu>
        <SelectMenu value={f.cat} onChange={(_, d) => set({ cat: d.value })}>
          <option value="">{t('allCategories')}</option>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{t(c.key)}</option>)}
        </SelectMenu>
        {accounts.length > 0 && (
          <SelectMenu value={f.acc} onChange={(_, d) => set({ acc: d.value })}>
            <option value="">{t('allAccounts')}</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </SelectMenu>
        )}
      </div>
      <div className="filters-row" style={{ marginBottom: 6, alignItems: 'flex-end' }}>
        <label className="ledger-date"><span>{t('dateFrom')}</span>
          <Input type="date" value={f.from} onChange={(_, d) => set({ from: d.value })} /></label>
        <label className="ledger-date"><span>{t('dateTo')}</span>
          <Input type="date" value={f.to} onChange={(_, d) => set({ to: d.value })} /></label>
        <SelectMenu value={f.pay} onChange={(_, d) => set({ pay: d.value })}>
          <option value="">{t('allMethods')}</option>
          <option value="cash">{t('cash')}</option>
          <option value="card">{t('card')}</option>
        </SelectMenu>
        {filtersActive && (
          <Button appearance="subtle" icon={<Icon.close />} onClick={() => setF(blankFilters())}>{t('clearFilters')}</Button>
        )}
      </div>

      {/* Totals */}
      <div className="ledger-totals">
        <span className="amount-pos">+<Money value={totals.inc} short /></span>
        <span className="amount-neg">−<Money value={totals.exp} short /></span>
        <span style={{ fontWeight: 800, color: totals.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {t('netTotal')}: <Money value={totals.net} short sign />
        </span>
      </div>

      {rows.length === 0
        ? <EmptyState icon="ledger"><p>{t('noResults')}</p></EmptyState>
        : (
          <div className="table-wrap">
            <Table className="data-table" size="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>{t('date')}</TableHeaderCell>
                  <TableHeaderCell>{t('type')}</TableHeaderCell>
                  <TableHeaderCell>{t('description')}</TableHeaderCell>
                  <TableHeaderCell>{t('category')}</TableHeaderCell>
                  <TableHeaderCell>{t('account')}</TableHeaderCell>
                  <TableHeaderCell>{t('amount')}</TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={`${r.kind}-${r.id}`}>
                    <TableCell className="nowrap">{formatDate(r.date, locale)}</TableCell>
                    <TableCell>
                      <Badge appearance="tint" color={r.kind === 'income' ? 'success' : 'danger'} size="small">
                        {r.kind === 'income' ? t('inflow') : t('outflow')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="cell-strong row" style={{ gap: 6 }}>
                        {r.label}
                        {r.recurring && <Badge appearance="tint" color="brand" size="small" icon={<Icon.repeat />} />}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.category
                        ? <span className="badge badge-soft" style={{ '--c': catColor(r.category) }}>
                            <CategoryIcon category={r.category} width={13} height={13} /> {t(r.category)}
                          </span>
                        : <span className="text-muted">—</span>}
                    </TableCell>
                    <TableCell className="text-muted nowrap">{r.account ? accName(r.account) : '—'}</TableCell>
                    <TableCell className={r.kind === 'income' ? 'amount-pos' : 'amount-neg'}>
                      {r.kind === 'income' ? '+' : '−'}<Money value={r.amount} />
                    </TableCell>
                    <TableCell>
                      <DeleteButton onClick={() => remove(r)} title={t('delete')} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  )
}
