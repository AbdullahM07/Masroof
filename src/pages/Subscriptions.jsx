import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr, formatMoney } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { subscriptionsView, subscriptionsMonthlyTotal } from '../lib/calc.js'
import { cn } from '../lib/utils.js'
import { EmptyState, Card, CardTitle, Button, DeleteButton, Input, Field, Badge, FormPanel, TwoCol, CurrencySuffix } from '../components/ui/index.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

const blank = () => ({ name: '', amount: '', category: 'bills', dueDay: '1', accountId: '', note: '' })

const STATUS = {
  paid: { tone: 'positive', key: 'paid' },
  overdue: { tone: 'negative', key: 'overdue' },
  soon: { tone: 'warning', key: 'dueSoon' },
  due: { tone: 'neutral', key: 'due' },
}

export default function Subscriptions() {
  const { state, t, currency, addSubscription, deleteSubscription, paySubscription } = useApp()
  const confirm = useConfirm()
  const toast = useToast()
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [open, setOpen] = useState(false)
  const month = currentMonthStr()

  const subs = subscriptionsView(state, month)
  const monthlyTotal = subscriptionsMonthlyTotal(state)
  const accounts = state.accounts || []

  function submit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    const day = parseInt(form.dueDay, 10)
    const errs = {}
    if (!form.name.trim()) errs.name = t('errName')
    if (!amount || amount <= 0) errs.amount = t('errAmount')
    if (!(day >= 1 && day <= 31)) errs.dueDay = t('errDueDay')
    setErrors(errs)
    if (Object.keys(errs).length) return
    addSubscription({ name: form.name.trim(), amount, category: form.category, dueDay: day, accountId: form.accountId || null, note: form.note.trim() })
    setForm(blank()); setOpen(false)
    toast(t('subscriptionAdded'))
  }

  function dueLabel(v) {
    if (v.status === 'paid' || v.daysUntil == null) return ''
    if (v.daysUntil === 0) return t('dueToday')
    if (v.daysUntil < 0) return t('overdueDays', { n: Math.abs(v.daysUntil) })
    return t('inDays', { n: v.daysUntil })
  }
  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  return (
    <TwoCol>
      <FormPanel title={t('addSubscription')} icon={<Icon.subscriptions size={18} />} open={open} onOpenChange={setOpen}>
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <Field label={t('subName')} required error={errors.name}>
            <Input value={form.name} placeholder={t('subNamePlace')} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('amount')} required error={errors.amount}>
              <Input type="number" inputMode="decimal" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => set({ amount: e.target.value })} after={<CurrencySuffix code={currency} />} />
            </Field>
            <Field label={t('dueDay')} required error={errors.dueDay}>
              <Input type="number" inputMode="numeric" min={1} max={31} value={form.dueDay} onChange={(e) => set({ dueDay: e.target.value })} />
            </Field>
          </div>
          <Field label={t('category')}>
            <SelectMenu value={form.category} onChange={(v) => set({ category: v })}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key} data-icon={<CategoryIcon category={c.key} size={15} style={{ color: catColor(c.key) }} />}>{t(c.key)}</option>)}
            </SelectMenu>
          </Field>
          {accounts.length > 0 && (
            <Field label={t('selectAccount')}>
              <SelectMenu value={form.accountId} onChange={(v) => set({ accountId: v })}>
                <option value="">{t('noAccount')}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SelectMenu>
            </Field>
          )}
          <Button type="submit" variant="primary" size="lg" className="w-full">{t('addSubscription')}</Button>
        </form>
      </FormPanel>

      <Card>
        <CardTitle hint={<>{t('monthlyCommitment')}: <span className="num text-ink">{formatMoney(monthlyTotal, currency, { short: true })}</span></>}>{t('mySubscriptions')}</CardTitle>
        {subs.length === 0
          ? <EmptyState art="calendar" title={t('noSubscriptions')} action={<Button variant="primary" size="sm" icon={<Icon.plus size={15} />} onClick={() => setOpen(true)}>{t('addSubscription')}</Button>} />
          : (
            <ul className="-mx-5 max-sm:-mx-4 divide-y divide-line stagger">
              {subs.map(v => {
                const st = STATUS[v.status] || STATUS.due
                return (
                  <li key={v.id} className={cn('cat-bar flex flex-wrap items-center gap-3 px-5 max-sm:px-4 py-3 hover:bg-surface-2 transition-colors', v.paid && 'opacity-70')} style={{ '--c': catColor(v.category) }}>
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-surface-3" style={{ color: catColor(v.category) }}>
                      <CategoryIcon category={v.category} size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink truncate">{v.name}</div>
                      <div className="t-caption text-ink-3 font-normal num-soft">
                        {t('dueOn')} {v.day} · {t(v.category)}
                        {dueLabel(v) && <span className={cn('ms-1', v.status === 'overdue' ? 'text-negative' : v.status === 'soon' ? 'text-warning' : '')}>· {dueLabel(v)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="num text-ink">{formatMoney(v.amount, currency, { short: true })}</span>
                      <Badge tone={st.tone}>{t(st.key)}</Badge>
                    </div>
                    <div className="flex items-center gap-1 max-sm:w-full max-sm:justify-end">
                      {!v.paid && (
                        <Button variant="soft" size="sm" icon={<Icon.check size={14} />} onClick={() => { paySubscription(v.id, month); toast(t('markedPaid')) }}>{t('markPaid')}</Button>
                      )}
                      <DeleteButton onClick={async () => { if (await confirm({ title: t('delete'), body: t('removeSubWarn'), danger: true, confirmLabel: t('remove') })) deleteSubscription(v.id) }} title={t('delete')} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
      </Card>
    </TwoCol>
  )
}
