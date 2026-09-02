import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayStr, currentMonthStr, formatDate } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { knownPayees, knownTags } from '../lib/calc.js'
import { cn } from '../lib/utils.js'
import {
  EmptyState, Money, Card, CardTitle, Button, DeleteButton, Input, Field, Segmented, Switch, Badge,
  Table, THead, TBody, TR, TH, TD, RowActions, TableTotal, FormPanel, TwoCol, CurrencySuffix, Tooltip,
} from '../components/ui/index.jsx'
import { SelectMenu, MonthField } from '../components/fields.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

const blank = (accountId = '') => ({
  amount: '', description: '', category: '', method: 'cash', cardId: '',
  date: todayStr(), recurring: false, accountId, payee: '', tags: '', receipt: '',
})

// Downscale + compress a picked image so it fits comfortably in storage.
function compressImage(file, maxDim = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDim) { height = height * maxDim / width; width = maxDim }
        else if (height > maxDim) { width = width * maxDim / height; height = maxDim }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Expenses({ intent, clearIntent }) {
  const { state, t, locale, currency, addExpense, deleteExpense, updateExpense } = useApp()
  const confirm = useConfirm()
  const toast = useToast()
  const lastAccount = state.expenses.find(e => e.accountId)?.accountId || ''
  const [form, setForm] = useState(() => blank(lastAccount))
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [filters, setFilters] = useState({ month: currentMonthStr(), cat: '', pay: '', q: '', tag: '' })
  const amountRef = useRef(null)

  const cards = state.cards
  const accounts = state.accounts || []
  const payees = knownPayees(state)
  const tags = knownTags(state)

  // ⌘K "Add expense" → open the form and focus the amount.
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
    if (!form.description.trim()) e.description = t('errDescription')
    if (!form.category) e.category = t('errCategory')
    if (!form.date) e.date = t('errDate')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit(ev) {
    ev.preventDefault()
    if (!validate()) return
    const amount = parseFloat(form.amount)
    const cardId = form.method === 'card' ? (form.cardId || null) : null
    const cardName = cardId ? labelForCard(cards, cardId) : null
    const tagList = form.tags.split(',').map(s => s.trim()).filter(Boolean)
    const entry = {
      amount, description: form.description.trim(), category: form.category,
      paymentMethod: form.method, cardId, cardName, date: form.date, recurring: form.recurring,
      accountId: form.accountId || null, payee: form.payee.trim(), tags: tagList, receipt: form.receipt || null,
    }
    if (editingId) { updateExpense(editingId, entry); toast(t('changesSaved')) }
    else { addExpense(entry); toast(t('expenseAdded')) }
    cancel()
  }
  function edit(e) {
    setEditingId(e.id)
    setErrors({})
    setForm({
      amount: String(e.amount), description: e.description || '', category: e.category || '',
      method: e.paymentMethod || 'cash', cardId: e.cardId || '', date: e.date, recurring: !!e.recurring,
      accountId: e.accountId || '', payee: e.payee || '', tags: (e.tags || []).join(', '), receipt: e.receipt || '',
    })
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancel() { setForm(blank(form.accountId || lastAccount)); setEditingId(null); setErrors({}); setIsFormOpen(false) }

  async function remove(e) {
    if (await confirm({ title: t('delete'), body: e.description, danger: true })) deleteExpense(e.id)
  }

  async function onReceipt(ev) {
    const file = ev.target.files?.[0]
    if (!file) return
    try { setForm(f => ({ ...f, receipt: '' })); const data = await compressImage(file); setForm(f => ({ ...f, receipt: data })) }
    catch { /* ignore unreadable image */ }
    ev.target.value = ''
  }

  let rows = state.expenses
  if (filters.month) rows = rows.filter(e => (e.date || '').startsWith(filters.month))
  if (filters.cat) rows = rows.filter(e => e.category === filters.cat)
  if (filters.pay) rows = rows.filter(e => e.paymentMethod === filters.pay)
  if (filters.tag) rows = rows.filter(e => (e.tags || []).includes(filters.tag))
  if (filters.q) {
    const q = filters.q.toLowerCase()
    rows = rows.filter(e =>
      (e.description || '').toLowerCase().includes(q) ||
      (e.payee || '').toLowerCase().includes(q) ||
      (e.tags || []).some(tg => tg.toLowerCase().includes(q)))
  }
  const total = rows.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  return (
    <TwoCol>
      <FormPanel title={editingId ? t('editExpense') : t('addExpense')} icon={<Icon.receipt size={18} />} open={isFormOpen || !!editingId} onOpenChange={setIsFormOpen}>
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <Field label={t('amount')} required error={errors.amount}>
            <Input ref={amountRef} type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00" value={form.amount}
              onChange={(e) => set({ amount: e.target.value })} after={<CurrencySuffix code={currency} />} className="[&_input]:num-soft [&_input]:text-[15px]" />
          </Field>
          <Field label={t('description')} required error={errors.description}>
            <Input type="text" placeholder={t('descPlace')} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <Field label={t('category')} required error={errors.category}>
            <SelectMenu value={form.category} onChange={(v) => set({ category: v })} placeholder={t('selectCat')}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key} data-icon={<CategoryIcon category={c.key} size={15} style={{ color: catColor(c.key) }} />}>{t(c.key)}</option>)}
            </SelectMenu>
          </Field>
          <Field label={t('paymentMethod')}>
            <Segmented value={form.method} onValueChange={(v) => set({ method: v })} className="w-full" aria-label={t('paymentMethod')}
              options={[
                { value: 'cash', label: t('cash'), icon: <Icon.cash size={15} /> },
                { value: 'card', label: t('card'), icon: <Icon.cards size={15} /> },
              ]} />
          </Field>
          {form.method === 'card' && (
            <Field label={t('selectCard')}>
              <SelectMenu value={form.cardId} onChange={(v) => set({ cardId: v })}>
                {cards.length === 0
                  ? <option value="">{t('addCardFirst')}</option>
                  : cards.map(c => <option key={c.id} value={c.id}>{c.name}{c.last4 ? ` ····${c.last4}` : ''}</option>)}
              </SelectMenu>
            </Field>
          )}
          {accounts.length > 0 && (
            <Field label={t('selectAccount')}>
              <SelectMenu value={form.accountId} onChange={(v) => set({ accountId: v })}>
                <option value="">{t('noAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SelectMenu>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('date')} required error={errors.date}>
              <Input type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} />
            </Field>
            <Field label={t('payee')} hint={t('optional')}>
              <Input type="text" placeholder={t('payeePlace')} value={form.payee} list="payee-list" onChange={(e) => set({ payee: e.target.value })} />
            </Field>
            <datalist id="payee-list">{payees.map(p => <option key={p} value={p} />)}</datalist>
          </div>
          <Field label={t('tags')} hint={t('optional')}>
            <Input type="text" placeholder={t('tagsPlace')} value={form.tags} onChange={(e) => set({ tags: e.target.value })} />
          </Field>
          <Field label={t('receipt')} hint={t('optional')}>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" icon={<Icon.paperclip size={15} />} onClick={() => document.getElementById('receipt-input').click()}>
                {t('addReceipt')}
              </Button>
              {form.receipt && (
                <span className="flex items-center gap-1">
                  <button type="button" onClick={() => openImage(form.receipt)} className="rounded-sm overflow-hidden border border-line">
                    <img src={form.receipt} alt={t('receipt')} className="h-9 w-9 object-cover" />
                  </button>
                  <Button variant="ghost" size="iconXs" onClick={() => set({ receipt: '' })} aria-label={t('removeReceipt')}><Icon.close size={14} /></Button>
                </span>
              )}
              <input id="receipt-input" type="file" accept="image/*" onChange={onReceipt} className="hidden" />
            </div>
          </Field>
          <Switch checked={form.recurring} onCheckedChange={(v) => set({ recurring: v })} label={t('recurring')} />
          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="primary" size="lg" className="flex-1">{editingId ? t('saveChanges') : t('addExpense')}</Button>
            {editingId && <Button variant="ghost" size="lg" onClick={cancel}>{t('cancel')}</Button>}
          </div>
        </form>
      </FormPanel>

      <Card>
        <CardTitle hint={<Money value={total} short />}>{t('expensesList')}</CardTitle>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Input type="search" placeholder={t('search')} value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            before={<Icon.search size={15} />} className="col-span-2 sm:flex-1 sm:min-w-[180px]" />
          <MonthField value={filters.month} onChange={(v) => setFilters({ ...filters, month: v })} clearable className="col-span-2 sm:w-auto" />
          <SelectMenu value={filters.cat} onChange={(v) => setFilters({ ...filters, cat: v })} className="sm:w-40">
            <option value="">{t('allCategories')}</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{t(c.key)}</option>)}
          </SelectMenu>
          <SelectMenu value={filters.pay} onChange={(v) => setFilters({ ...filters, pay: v })} className="sm:w-32">
            <option value="">{t('allMethods')}</option>
            <option value="cash">{t('cash')}</option>
            <option value="card">{t('card')}</option>
          </SelectMenu>
          {tags.length > 0 && (
            <SelectMenu value={filters.tag} onChange={(v) => setFilters({ ...filters, tag: v })} className="sm:w-32">
              <option value="">{t('allTags')}</option>
              {tags.map(tg => <option key={tg} value={tg}>#{tg}</option>)}
            </SelectMenu>
          )}
        </div>
        {rows.length === 0
          ? <EmptyState art="receipt" title={t('noExpenses')} action={<Button variant="primary" size="sm" icon={<Icon.plus size={15} />} onClick={() => { setIsFormOpen(true); amountRef.current?.focus() }}>{t('addExpense')}</Button>} />
          : (
            <>
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH className="max-sm:hidden">{t('date')}</TH>
                    <TH>{t('description')}</TH>
                    <TH className="max-md:hidden">{t('category')}</TH>
                    <TH className="max-md:hidden">{t('payment')}</TH>
                    <TH end>{t('amount')}</TH>
                    <TH className="w-20 max-sm:w-10" />
                  </TR>
                </THead>
                <TBody>
                  {rows.map(e => (
                    <TR key={e.id} className="cat-row" style={{ '--c': catColor(e.category) }}>
                      <TD nowrap muted className="num-soft ps-4 max-sm:hidden">{formatDate(e.date, locale)}</TD>
                      <TD className="max-sm:ps-3 max-sm:max-w-[150px]">
                        <div className="flex items-center gap-1.5 font-medium text-ink">
                          <span className="truncate max-w-[220px] max-sm:max-w-[120px]">{e.description}</span>
                          {e.recurring && <Tooltip content={t('recurring')}><span className="text-ink-3 inline-flex"><Icon.repeat size={13} /></span></Tooltip>}
                          {e.receipt && (
                            <button type="button" onClick={() => openImage(e.receipt)} className="inline-flex text-ink-3 hover:text-accent-ink" aria-label={t('viewReceipt')}>
                              <Icon.paperclip size={13} />
                            </button>
                          )}
                        </div>
                        <div className="truncate t-caption text-ink-3 font-normal">
                          <span className="sm:hidden num-soft">{formatDate(e.date, locale)} · </span>
                          <span className="md:hidden">{t(e.category)}{e.payee ? ' · ' : ''}</span>
                          {e.payee && <span>{e.payee}</span>}
                          {(e.tags || []).map(tg => <span key={tg} className="text-accent-ink"> #{tg}</span>)}
                        </div>
                      </TD>
                      <TD className="max-md:hidden">
                        <span className="inline-flex items-center gap-1.5 text-ink-2" style={{ color: catColor(e.category) }}>
                          <CategoryIcon category={e.category} size={14} /><span className="text-ink-2">{t(e.category)}</span>
                        </span>
                      </TD>
                      <TD className="max-md:hidden">
                        <Badge tone="outline">{e.paymentMethod === 'cash' ? <Icon.cash size={12} /> : <Icon.cards size={12} />}{e.paymentMethod === 'cash' ? t('cash') : (e.cardName || t('card'))}</Badge>
                      </TD>
                      <TD end className="num text-negative whitespace-nowrap">−<Money value={e.amount} /></TD>
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
              <TableTotal label={t('total')}><span className="text-negative">−<Money value={total} /></span></TableTotal>
            </>
          )}
      </Card>
    </TwoCol>
  )
}

function openImage(dataUrl) {
  const w = window.open('', '_blank')
  if (w) w.document.write(`<title>Receipt</title><body style="margin:0;background:#151412;display:grid;place-items:center;min-height:100vh"><img src="${dataUrl}" style="max-width:100%;max-height:100vh"/></body>`)
}

function labelForCard(cards, id) {
  const c = cards.find(x => x.id === id)
  return c ? c.name + (c.last4 ? ` ····${c.last4}` : '') : 'Card'
}
