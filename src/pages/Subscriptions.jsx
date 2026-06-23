import { useState } from 'react'
import { Badge, Button, Field, Input } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr, formatMoney } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { subscriptionsView, subscriptionsMonthlyTotal } from '../lib/calc.js'
import { EmptyState } from '../components/ui.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { useConfirm } from '../components/Confirm.jsx'
import { DeleteButton } from '../components/fluentBits.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

const blank = () => ({ name: '', amount: '', category: 'bills', dueDay: '1', accountId: '', note: '' })

const STATUS = {
  paid:    { color: 'success',     key: 'paid' },
  overdue: { color: 'danger',      key: 'overdue' },
  soon:    { color: 'warning',     key: 'dueSoon' },
  due:     { color: 'informative', key: 'due' },
}

export default function Subscriptions() {
  const { state, t, currency, addSubscription, deleteSubscription, paySubscription } = useApp()
  const confirm = useConfirm()
  const [form, setForm] = useState(blank)
  const month = currentMonthStr()

  const subs = subscriptionsView(state, month)
  const monthlyTotal = subscriptionsMonthlyTotal(state)
  const accounts = state.accounts || []

  function submit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    const day = parseInt(form.dueDay, 10)
    if (!form.name.trim() || !amount || amount <= 0 || !(day >= 1 && day <= 31)) return
    addSubscription({
      name: form.name.trim(), amount, category: form.category,
      dueDay: day, accountId: form.accountId || null, note: form.note.trim(),
    })
    setForm(blank())
  }

  function dueLabel(v) {
    if (v.status === 'paid') return ''
    if (v.daysUntil == null) return ''
    if (v.daysUntil === 0) return t('dueToday')
    if (v.daysUntil < 0) return t('overdueDays', { n: Math.abs(v.daysUntil) })
    return t('inDays', { n: v.daysUntil })
  }

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title">{t('addSubscription')}</div>
        <form className="form" onSubmit={submit}>
          <Field label={t('subName')} required>
            <Input value={form.name} placeholder={t('subNamePlace')}
              onChange={(_, d) => setForm({ ...form, name: d.value })} required />
          </Field>
          <Field label={`${t('amount')} (${currency})`} required>
            <Input type="number" step="0.01" placeholder="0.00" value={form.amount}
              onChange={(_, d) => setForm({ ...form, amount: d.value })} required />
          </Field>
          <Field label={t('category')}>
            <SelectMenu value={form.category} onChange={(_, d) => setForm({ ...form, category: d.value })}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{t(c.key)}</option>)}
            </SelectMenu>
          </Field>
          <Field label={t('dueDay')} required>
            <Input type="number" min={1} max={31} value={form.dueDay}
              onChange={(_, d) => setForm({ ...form, dueDay: d.value })} required />
          </Field>
          {accounts.length > 0 && (
            <Field label={t('selectAccount')}>
              <SelectMenu value={form.accountId} onChange={(_, d) => setForm({ ...form, accountId: d.value })}>
                <option value="">{t('noAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SelectMenu>
            </Field>
          )}
          <Button type="submit" appearance="primary" style={{ width: '100%' }}>{t('addSubscription')}</Button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">{t('mySubscriptions')}
          <span className="hint">{t('monthlyCommitment')}: {formatMoney(monthlyTotal, currency, { short: true })}</span>
        </div>
        {subs.length === 0
          ? <EmptyState icon="subscriptions"><p>{t('noSubscriptions')}</p></EmptyState>
          : (
            <div className="sub-list">
              {subs.map(v => {
                const st = STATUS[v.status] || STATUS.due
                return (
                  <div className={`sub-row ${v.status}`} key={v.id}>
                    <span className="sub-ico" style={{ background: `${catColor(v.category)}1f`, color: catColor(v.category) }}>
                      <CategoryIcon category={v.category} />
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="sub-name">{v.name}</div>
                      <div className="sub-meta">
                        {t('dueOn')} {v.day} · {t(v.category)}
                        {dueLabel(v) && <span className={`sub-due ${v.status}`}> · {dueLabel(v)}</span>}
                      </div>
                    </div>
                    <div className="sub-right">
                      <span className="sub-amt">{formatMoney(v.amount, currency, { short: true })}</span>
                      <Badge appearance="tint" color={st.color} size="small">{t(st.key)}</Badge>
                    </div>
                    <div className="sub-actions">
                      {!v.paid && (
                        <Button appearance="primary" size="small" icon={<Icon.check />}
                          onClick={() => paySubscription(v.id, month)}>{t('markPaid')}</Button>
                      )}
                      <DeleteButton onClick={async () => { if (await confirm({ title: t('delete'), body: t('removeSubWarn'), danger: true, confirmLabel: t('remove') })) deleteSubscription(v.id) }} title={t('delete')} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>
    </div>
  )
}
