import { useState } from 'react'
import {
  Badge, Button, Field, Input, Radio, RadioGroup, Switch,
  Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow,
} from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { todayStr, currentMonthStr, formatDate } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { knownPayees, knownTags } from '../lib/calc.js'
import { EmptyState, Money } from '../components/ui.jsx'
import { SelectMenu, MonthField } from '../components/fields.jsx'
import { DeleteButton } from '../components/fluentBits.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

const blank = () => ({
  amount: '', description: '', category: '', method: 'cash', cardId: '',
  date: todayStr(), recurring: false, accountId: '', payee: '', tags: '', receipt: '',
})

// Downscale + compress a picked image so it fits comfortably in localStorage.
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

export default function Expenses() {
  const { state, t, locale, addExpense, deleteExpense, updateExpense } = useApp()
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({ month: currentMonthStr(), cat: '', pay: '', q: '', tag: '' })

  const cards = state.cards
  const accounts = state.accounts || []
  const payees = knownPayees(state)
  const tags = knownTags(state)

  function submit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0 || !form.description.trim() || !form.category || !form.date) return
    const cardId = form.method === 'card' ? (form.cardId || null) : null
    const cardName = cardId ? labelForCard(cards, cardId) : null
    const tagList = form.tags.split(',').map(s => s.trim()).filter(Boolean)
    const entry = {
      amount, description: form.description.trim(), category: form.category,
      paymentMethod: form.method, cardId, cardName, date: form.date, recurring: form.recurring,
      accountId: form.accountId || null, payee: form.payee.trim(), tags: tagList, receipt: form.receipt || null,
    }
    if (editingId) updateExpense(editingId, entry)
    else addExpense(entry)
    cancel()
  }
  function edit(e) {
    setEditingId(e.id)
    setForm({
      amount: String(e.amount), description: e.description || '', category: e.category || '',
      method: e.paymentMethod || 'cash', cardId: e.cardId || '', date: e.date, recurring: !!e.recurring,
      accountId: e.accountId || '', payee: e.payee || '', tags: (e.tags || []).join(', '), receipt: e.receipt || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancel() { setForm(blank()); setEditingId(null) }

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

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title">{editingId ? t('editExpense') : t('addExpense')}</div>
        <form className="form" onSubmit={submit}>
          <Field label={t('amount')} required>
            <Input type="number" min={0} step="0.01" placeholder="0.00" value={form.amount}
              onChange={(_, d) => setForm({ ...form, amount: d.value })} required />
          </Field>
          <Field label={t('description')} required>
            <Input type="text" placeholder={t('descPlace')} value={form.description}
              onChange={(_, d) => setForm({ ...form, description: d.value })} required />
          </Field>
          <Field label={t('category')} required>
            <SelectMenu value={form.category} onChange={(_, d) => setForm({ ...form, category: d.value })}>
              <option value="">{t('selectCat')}</option>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{t(c.key)}</option>)}
            </SelectMenu>
          </Field>
          <Field label={t('paymentMethod')}>
            <RadioGroup layout="horizontal" value={form.method} onChange={(_, d) => setForm({ ...form, method: d.value })}>
              <Radio value="cash" label={<span className="row" style={{ gap: 6 }}><Icon.cash width={17} height={17} /> {t('cash')}</span>} />
              <Radio value="card" label={<span className="row" style={{ gap: 6 }}><Icon.cards width={17} height={17} /> {t('card')}</span>} />
            </RadioGroup>
          </Field>
          {form.method === 'card' && (
            <Field label={t('selectCard')}>
              <SelectMenu value={form.cardId} onChange={(_, d) => setForm({ ...form, cardId: d.value })}>
                {cards.length === 0
                  ? <option value="">{t('addCardFirst')}</option>
                  : cards.map(c => <option key={c.id} value={c.id}>{c.name}{c.last4 ? ` ····${c.last4}` : ''}</option>)}
              </SelectMenu>
            </Field>
          )}
          {accounts.length > 0 && (
            <Field label={t('selectAccount')}>
              <SelectMenu value={form.accountId} onChange={(_, d) => setForm({ ...form, accountId: d.value })}>
                <option value="">{t('noAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SelectMenu>
            </Field>
          )}
          <Field label={`${t('payee')} (${t('optional')})`}>
            <Input type="text" placeholder={t('payeePlace')} value={form.payee}
              input={{ list: 'payee-list' }} onChange={(_, d) => setForm({ ...form, payee: d.value })} />
            <datalist id="payee-list">{payees.map(p => <option key={p} value={p} />)}</datalist>
          </Field>
          <Field label={`${t('tags')} (${t('optional')})`}>
            <Input type="text" placeholder={t('tagsPlace')} value={form.tags}
              onChange={(_, d) => setForm({ ...form, tags: d.value })} />
          </Field>
          <Field label={t('date')} required>
            <Input type="date" value={form.date} onChange={(_, d) => setForm({ ...form, date: d.value })} required />
          </Field>
          <Field label={`${t('receipt')} (${t('optional')})`}>
            <div className="row" style={{ gap: 10 }}>
              <Button appearance="outline" icon={<Icon.paperclip />} onClick={() => document.getElementById('receipt-input').click()}>
                {t('addReceipt')}
              </Button>
              {form.receipt && (
                <span className="row" style={{ gap: 6 }}>
                  <img src={form.receipt} alt="receipt" className="receipt-thumb" onClick={() => openImage(form.receipt)} />
                  <Button appearance="subtle" size="small" icon={<Icon.close />} onClick={() => setForm({ ...form, receipt: '' })} aria-label={t('removeReceipt')} />
                </span>
              )}
              <input id="receipt-input" type="file" accept="image/*" onChange={onReceipt} className="hide" />
            </div>
          </Field>
          <Switch checked={form.recurring} label={t('recurring')}
            onChange={(_, d) => setForm({ ...form, recurring: d.checked })} />
          <div className="row" style={{ gap: 8 }}>
            <Button type="submit" appearance="primary" style={{ flex: 1 }}>{editingId ? t('saveChanges') : t('addExpense')}</Button>
            {editingId && <Button appearance="subtle" onClick={cancel}>{t('cancel')}</Button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">{t('expensesList')}</div>
        <div className="filters-row">
          <Input type="text" placeholder={t('search')} value={filters.q} onChange={(_, d) => setFilters({ ...filters, q: d.value })} />
          <MonthField value={filters.month} onChange={(v) => setFilters({ ...filters, month: v })} clearable />
          <SelectMenu value={filters.cat} onChange={(_, d) => setFilters({ ...filters, cat: d.value })}>
            <option value="">{t('allCategories')}</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{t(c.key)}</option>)}
          </SelectMenu>
          <SelectMenu value={filters.pay} onChange={(_, d) => setFilters({ ...filters, pay: d.value })}>
            <option value="">{t('allMethods')}</option>
            <option value="cash">{t('cash')}</option>
            <option value="card">{t('card')}</option>
          </SelectMenu>
          {tags.length > 0 && (
            <SelectMenu value={filters.tag} onChange={(_, d) => setFilters({ ...filters, tag: d.value })}>
              <option value="">{t('allTags')}</option>
              {tags.map(tg => <option key={tg} value={tg}>#{tg}</option>)}
            </SelectMenu>
          )}
        </div>
        {rows.length === 0
          ? <EmptyState icon="receipt"><p>{t('noExpenses')}</p></EmptyState>
          : (
            <div className="table-wrap">
              <Table className="data-table" size="small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>{t('date')}</TableHeaderCell>
                    <TableHeaderCell>{t('description')}</TableHeaderCell>
                    <TableHeaderCell>{t('category')}</TableHeaderCell>
                    <TableHeaderCell>{t('payment')}</TableHeaderCell>
                    <TableHeaderCell>{t('amount')}</TableHeaderCell>
                    <TableHeaderCell />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="nowrap">{formatDate(e.date, locale)}</TableCell>
                      <TableCell>
                        <div className="cell-strong row" style={{ gap: 6 }}>
                          {e.description}
                          {e.recurring && <Badge appearance="tint" color="brand" size="small" icon={<Icon.repeat />} />}
                          {e.receipt && <img src={e.receipt} alt="receipt" className="receipt-thumb sm" onClick={() => openImage(e.receipt)} />}
                        </div>
                        {(e.payee || (e.tags && e.tags.length > 0)) && (
                          <div className="tx-meta row wrap" style={{ gap: 6, marginTop: 2 }}>
                            {e.payee && <span>{e.payee}</span>}
                            {(e.tags || []).map(tg => <span key={tg} className="tag-chip">#{tg}</span>)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="badge badge-soft" style={{ '--c': catColor(e.category) }}>
                          <CategoryIcon category={e.category} width={13} height={13} /> {t(e.category)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge appearance="outline" color="informative"
                          icon={e.paymentMethod === 'cash' ? <Icon.cash /> : <Icon.cards />}>
                          {e.paymentMethod === 'cash' ? t('cash') : (e.cardName || t('card'))}
                        </Badge>
                      </TableCell>
                      <TableCell className="amount-neg">−<Money value={e.amount} /></TableCell>
                      <TableCell>
                        <div className="row-actions">
                          <Button appearance="subtle" size="small" icon={<Icon.edit />} onClick={() => edit(e)} aria-label={t('edit')} title={t('edit')} />
                          <DeleteButton onClick={() => deleteExpense(e.id)} title={t('delete')} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="table-total">
                <span>{t('total')}</span>
                <span className="amount-neg">−<Money value={total} /></span>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

function openImage(dataUrl) {
  const w = window.open('', '_blank')
  if (w) w.document.write(`<title>Receipt</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img src="${dataUrl}" style="max-width:100%;max-height:100vh"/></body>`)
}

function labelForCard(cards, id) {
  const c = cards.find(x => x.id === id)
  return c ? c.name + (c.last4 ? ` ····${c.last4}` : '') : 'Card'
}
