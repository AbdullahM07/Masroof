import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { cn } from '../lib/utils.js'
import {
  EmptyState, Money, Card, CardTitle, Button, DeleteButton, Input, Badge, Field,
  Table, THead, TBody, TR, TH, TD, RowActions, Tooltip,
} from '../components/ui/index.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { useConfirm } from '../components/Confirm.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

const blankFilters = () => ({ q: '', from: '', to: '', type: '', cat: '', acc: '', pay: '' })

// A single searchable ledger of every income + expense across all months.
export default function Ledger({ intent, clearIntent }) {
  const { state, t, locale, deleteIncome, deleteExpense } = useApp()
  const confirm = useConfirm()
  const [f, setF] = useState(blankFilters)
  const [more, setMore] = useState(false)
  const accounts = state.accounts || []
  const set = (patch) => setF(prev => ({ ...prev, ...patch }))

  useEffect(() => {
    if (intent?.q != null) { setF(prev => ({ ...prev, q: intent.q })); clearIntent() }
  }, [intent, clearIntent])

  const accName = (id) => accounts.find(a => a.id === id)?.name || '—'

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
    <Card>
      <CardTitle hint={t('showing', { n: rows.length, total: all.length })}>{t('ledger')}</CardTitle>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Input type="search" placeholder={t('searchTx')} value={f.q} onChange={(e) => set({ q: e.target.value })}
          before={<Icon.search size={15} />} className="col-span-2 sm:flex-1 sm:min-w-[200px]" autoFocus={!!f.q} />
        <SelectMenu value={f.type} onChange={(v) => set({ type: v })} className="sm:w-36">
          <option value="">{t('allTypes')}</option>
          <option value="income">{t('inflow')}</option>
          <option value="expense">{t('outflow')}</option>
        </SelectMenu>
        <SelectMenu value={f.cat} onChange={(v) => set({ cat: v })} className="sm:w-40">
          <option value="">{t('allCategories')}</option>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{t(c.key)}</option>)}
        </SelectMenu>
        <Button variant={more ? 'soft' : 'secondary'} size="md" icon={<Icon.filter size={15} />} onClick={() => setMore(m => !m)} className="col-span-2 sm:col-auto">
          {t('dateFrom')} / {t('dateTo')}
        </Button>
      </div>
      {more && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end page-enter">
          <Field label={t('dateFrom')} className="sm:w-40"><Input type="date" value={f.from} onChange={(e) => set({ from: e.target.value })} /></Field>
          <Field label={t('dateTo')} className="sm:w-40"><Input type="date" value={f.to} onChange={(e) => set({ to: e.target.value })} /></Field>
          {accounts.length > 0 && (
            <Field label={t('account')} className="sm:w-40">
              <SelectMenu value={f.acc} onChange={(v) => set({ acc: v })}>
                <option value="">{t('allAccounts')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SelectMenu>
            </Field>
          )}
          <Field label={t('payment')} className="sm:w-32">
            <SelectMenu value={f.pay} onChange={(v) => set({ pay: v })}>
              <option value="">{t('allMethods')}</option>
              <option value="cash">{t('cash')}</option>
              <option value="card">{t('card')}</option>
            </SelectMenu>
          </Field>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-sm bg-surface-2 px-4 py-2.5 t-small">
        <span className="num text-positive">+<Money value={totals.inc} short /></span>
        <span className="num text-negative">−<Money value={totals.exp} short /></span>
        <span className="text-ink-2">{t('netTotal')}: <span className={cn('num', totals.net >= 0 ? 'text-positive' : 'text-negative')}><Money value={totals.net} short sign /></span></span>
        {filtersActive && (
          <Button variant="ghost" size="sm" icon={<Icon.close size={14} />} onClick={() => setF(blankFilters())} className="ms-auto -my-1">{t('clearFilters')}</Button>
        )}
      </div>

      {rows.length === 0
        ? <EmptyState art="ledger" title={t('noResults')} action={filtersActive && <Button variant="secondary" size="sm" onClick={() => setF(blankFilters())}>{t('clearFilters')}</Button>} />
        : (
          <Table className="mt-3">
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="max-sm:hidden">{t('date')}</TH>
                <TH>{t('description')}</TH>
                <TH className="max-md:hidden">{t('category')}</TH>
                <TH className="max-lg:hidden">{t('account')}</TH>
                <TH end>{t('amount')}</TH>
                <TH className="w-12" />
              </TR>
            </THead>
            <TBody>
              {rows.map(r => {
                const inc = r.kind === 'income'
                return (
                  <TR key={`${r.kind}-${r.id}`} className="cat-row" style={{ '--c': inc ? 'var(--positive)' : catColor(r.category) }}>
                    <TD nowrap muted className="num-soft ps-4 max-sm:hidden">{formatDate(r.date, locale)}</TD>
                    <TD className="max-sm:ps-3 max-sm:max-w-[170px]">
                      <span className="flex items-center gap-1.5 font-medium text-ink">
                        <span className="truncate max-w-[260px] max-sm:max-w-[140px]">{r.label}</span>
                        {r.recurring && <Tooltip content={t('recurring')}><span className="text-ink-3 inline-flex"><Icon.repeat size={13} /></span></Tooltip>}
                      </span>
                      <span className="block truncate t-caption text-ink-3 font-normal md:hidden"><span className="sm:hidden num-soft">{formatDate(r.date, locale)} · </span>{inc ? t('inflow') : t(r.category)}</span>
                    </TD>
                    <TD className="max-md:hidden">
                      {r.category
                        ? <span className="inline-flex items-center gap-1.5" style={{ color: catColor(r.category) }}><CategoryIcon category={r.category} size={14} /><span className="text-ink-2">{t(r.category)}</span></span>
                        : <Badge tone="positive">{t('inflow')}</Badge>}
                    </TD>
                    <TD muted nowrap className="max-lg:hidden">{r.account ? accName(r.account) : '—'}</TD>
                    <TD end className={cn('num whitespace-nowrap', inc ? 'text-positive' : 'text-negative')}>{inc ? '+' : '−'}<Money value={r.amount} /></TD>
                    <TD><RowActions><DeleteButton onClick={() => remove(r)} title={t('delete')} /></RowActions></TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )}
    </Card>
  )
}
