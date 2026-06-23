import { useState } from 'react'
import {
  Badge, Button, Field, Input, Switch,
  Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow,
} from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { todayStr, currentMonthStr, formatDate } from '../lib/format.js'
import { EmptyState, Money } from '../components/ui.jsx'
import { SelectMenu, MonthField } from '../components/fields.jsx'
import { DeleteButton } from '../components/fluentBits.jsx'
import { Icon } from '../components/icons.jsx'

const blank = () => ({ amount: '', source: '', date: todayStr(), note: '', recurring: false, accountId: '' })

export default function Income() {
  const { state, t, locale, addIncome, deleteIncome, updateIncome } = useApp()
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [monthFilter, setMonthFilter] = useState(currentMonthStr())
  const accounts = state.accounts || []

  function submit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0 || !form.source.trim() || !form.date) return
    const entry = { amount, source: form.source.trim(), date: form.date, note: form.note.trim(), recurring: form.recurring, accountId: form.accountId || null }
    if (editingId) updateIncome(editingId, entry)
    else addIncome(entry)
    cancel()
  }
  function edit(row) {
    setEditingId(row.id)
    setForm({ amount: String(row.amount), source: row.source || '', date: row.date, note: row.note || '', recurring: !!row.recurring, accountId: row.accountId || '' })
  }
  function cancel() { setForm(blank()); setEditingId(null) }

  let rows = state.income
  if (monthFilter) rows = rows.filter(e => (e.date || '').startsWith(monthFilter))
  const total = rows.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title">{editingId ? t('editIncome') : t('addIncome')}</div>
        <form className="form" onSubmit={submit}>
          <Field label={t('amount')} required>
            <Input type="number" min={0} step="0.01" placeholder="0.00" value={form.amount}
              onChange={(_, d) => setForm({ ...form, amount: d.value })} required />
          </Field>
          <Field label={t('source')} required>
            <Input type="text" placeholder={t('sourcePlace')} value={form.source}
              onChange={(_, d) => setForm({ ...form, source: d.value })} required />
          </Field>
          <Field label={t('date')} required>
            <Input type="date" value={form.date} onChange={(_, d) => setForm({ ...form, date: d.value })} required />
          </Field>
          {accounts.length > 0 && (
            <Field label={t('selectAccount')}>
              <SelectMenu value={form.accountId} onChange={(_, d) => setForm({ ...form, accountId: d.value })}>
                <option value="">{t('noAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SelectMenu>
            </Field>
          )}
          <Field label={`${t('note')} (${t('optional')})`}>
            <Input type="text" value={form.note} onChange={(_, d) => setForm({ ...form, note: d.value })} />
          </Field>
          <Switch checked={form.recurring} label={t('recurring')}
            onChange={(_, d) => setForm({ ...form, recurring: d.checked })} />
          <div className="row" style={{ gap: 8 }}>
            <Button type="submit" appearance="primary" style={{ flex: 1 }}>{editingId ? t('saveChanges') : t('addIncome')}</Button>
            {editingId && <Button appearance="subtle" onClick={cancel}>{t('cancel')}</Button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">{t('incomeHistory')}</div>
        <div className="filters-row">
          <MonthField value={monthFilter} onChange={setMonthFilter} clearable />
          <Button appearance="subtle" onClick={() => setMonthFilter('')}>{t('all')}</Button>
        </div>
        {rows.length === 0
          ? <EmptyState icon="wallet"><p>{t('noIncome')}</p></EmptyState>
          : (
            <div className="table-wrap">
              <Table className="data-table" size="small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>{t('date')}</TableHeaderCell>
                    <TableHeaderCell>{t('source')}</TableHeaderCell>
                    <TableHeaderCell>{t('note')}</TableHeaderCell>
                    <TableHeaderCell>{t('amount')}</TableHeaderCell>
                    <TableHeaderCell />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="nowrap">{formatDate(e.date, locale)}</TableCell>
                      <TableCell className="cell-strong">
                        {e.source}
                        {e.recurring && <Badge appearance="tint" color="brand" size="small" icon={<Icon.repeat />} style={{ marginInlineStart: 8 }} />}
                      </TableCell>
                      <TableCell className="text-muted">{e.note || '—'}</TableCell>
                      <TableCell className="amount-pos">+<Money value={e.amount} /></TableCell>
                      <TableCell>
                        <div className="row-actions">
                          <Button appearance="subtle" size="small" icon={<Icon.edit />} onClick={() => edit(e)} aria-label={t('edit')} title={t('edit')} />
                          <DeleteButton onClick={() => deleteIncome(e.id)} title={t('delete')} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="table-total">
                <span>{t('total')}</span>
                <span className="amount-pos"><Money value={total} /></span>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
