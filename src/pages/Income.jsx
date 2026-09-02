import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayStr, currentMonthStr, formatDate } from '../lib/format.js'
import {
  EmptyState, Money, Card, CardTitle, Button, DeleteButton, Input, Field, Switch,
  Table, THead, TBody, TR, TH, TD, RowActions, TableTotal, FormPanel, TwoCol, CurrencySuffix, Tooltip,
} from '../components/ui/index.jsx'
import { SelectMenu, MonthField } from '../components/fields.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { Icon } from '../components/icons.jsx'

const blank = (accountId = '') => ({ amount: '', source: '', date: todayStr(), note: '', recurring: false, accountId })

export default function Income({ intent, clearIntent }) {
  const { state, t, locale, currency, addIncome, deleteIncome, updateIncome } = useApp()
  const confirm = useConfirm()
  const toast = useToast()
  const lastAccount = state.income.find(e => e.accountId)?.accountId || ''
  const [form, setForm] = useState(() => blank(lastAccount))
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [monthFilter, setMonthFilter] = useState(currentMonthStr())
  const amountRef = useRef(null)
  const accounts = state.accounts || []

  useEffect(() => {
    if (intent?.action === 'add') {
      setIsFormOpen(true)
      setTimeout(() => amountRef.current?.focus(), 50)
      clearIntent()
    }
  }, [intent, clearIntent])

  function validate() {
    const e = {}
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) e.amount = t('errAmount')
    if (!form.source.trim()) e.source = t('errSource')
    if (!form.date) e.date = t('errDate')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit(ev) {
    ev.preventDefault()
    if (!validate()) return
    const entry = { amount: parseFloat(form.amount), source: form.source.trim(), date: form.date, note: form.note.trim(), recurring: form.recurring, accountId: form.accountId || null }
    if (editingId) { updateIncome(editingId, entry); toast(t('changesSaved')) }
    else { addIncome(entry); toast(t('incomeAdded')) }
    cancel()
  }
  function edit(row) {
    setEditingId(row.id)
    setErrors({})
    setForm({ amount: String(row.amount), source: row.source || '', date: row.date, note: row.note || '', recurring: !!row.recurring, accountId: row.accountId || '' })
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancel() { setForm(blank(form.accountId || lastAccount)); setEditingId(null); setErrors({}); setIsFormOpen(false) }
  async function remove(e) {
    if (await confirm({ title: t('delete'), body: e.source, danger: true })) deleteIncome(e.id)
  }

  let rows = state.income
  if (monthFilter) rows = rows.filter(e => (e.date || '').startsWith(monthFilter))
  const total = rows.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  return (
    <TwoCol>
      <FormPanel title={editingId ? t('editIncome') : t('addIncome')} icon={<Icon.wallet size={18} />} open={isFormOpen || !!editingId} onOpenChange={setIsFormOpen}>
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <Field label={t('amount')} required error={errors.amount}>
            <Input ref={amountRef} type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00" value={form.amount}
              onChange={(e) => set({ amount: e.target.value })} after={<CurrencySuffix code={currency} />} className="[&_input]:num-soft [&_input]:text-[15px]" />
          </Field>
          <Field label={t('source')} required error={errors.source}>
            <Input type="text" placeholder={t('sourcePlace')} value={form.source} onChange={(e) => set({ source: e.target.value })} />
          </Field>
          <Field label={t('date')} required error={errors.date}>
            <Input type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} />
          </Field>
          {accounts.length > 0 && (
            <Field label={t('selectAccount')}>
              <SelectMenu value={form.accountId} onChange={(v) => set({ accountId: v })}>
                <option value="">{t('noAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SelectMenu>
            </Field>
          )}
          <Field label={t('note')} hint={t('optional')}>
            <Input type="text" value={form.note} onChange={(e) => set({ note: e.target.value })} />
          </Field>
          <Switch checked={form.recurring} onCheckedChange={(v) => set({ recurring: v })} label={t('recurring')} />
          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="primary" size="lg" className="flex-1">{editingId ? t('saveChanges') : t('addIncome')}</Button>
            {editingId && <Button variant="ghost" size="lg" onClick={cancel}>{t('cancel')}</Button>}
          </div>
        </form>
      </FormPanel>

      <Card>
        <CardTitle hint={<Money value={total} short />}>{t('incomeHistory')}</CardTitle>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <MonthField value={monthFilter} onChange={setMonthFilter} clearable />
          <Button variant="ghost" size="sm" onClick={() => setMonthFilter('')} className={!monthFilter ? 'bg-surface-3 text-ink' : ''}>{t('all')}</Button>
        </div>
        {rows.length === 0
          ? <EmptyState art="wallet" title={t('noIncome')} action={<Button variant="primary" size="sm" icon={<Icon.plus size={15} />} onClick={() => { setIsFormOpen(true); amountRef.current?.focus() }}>{t('addIncome')}</Button>} />
          : (
            <>
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH className="max-sm:hidden">{t('date')}</TH>
                    <TH>{t('source')}</TH>
                    <TH className="max-md:hidden">{t('note')}</TH>
                    <TH end>{t('amount')}</TH>
                    <TH className="w-20 max-sm:w-10" />
                  </TR>
                </THead>
                <TBody>
                  {rows.map(e => (
                    <TR key={e.id} className="cat-row" style={{ '--c': 'var(--positive)' }}>
                      <TD nowrap muted className="num-soft ps-4 max-sm:hidden">{formatDate(e.date, locale)}</TD>
                      <TD strong className="max-sm:ps-3 max-sm:max-w-[160px]">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate">{e.source}</span>
                          {e.recurring && <Tooltip content={t('recurring')}><span className="text-ink-3 inline-flex"><Icon.repeat size={13} /></span></Tooltip>}
                        </span>
                        <div className="t-caption text-ink-3 font-normal truncate md:hidden"><span className="sm:hidden num-soft">{formatDate(e.date, locale)}</span>{e.note && <span className="sm:hidden"> · </span>}{e.note}</div>
                      </TD>
                      <TD muted className="max-md:hidden">{e.note || '—'}</TD>
                      <TD end className="num text-positive whitespace-nowrap">+<Money value={e.amount} /></TD>
                      <TD>
                        <RowActions>
                          <Button variant="ghost" size="iconSm" onClick={() => edit(e)} aria-label={t('edit')} title={t('edit')} className="text-ink-3 hover:text-ink"><Icon.edit size={15} /></Button>
                          <DeleteButton onClick={() => remove(e)} title={t('delete')} className="max-sm:hidden" />
                        </RowActions>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              <TableTotal label={t('total')}><span className="text-positive">+<Money value={total} /></span></TableTotal>
            </>
          )}
      </Card>
    </TwoCol>
  )
}
