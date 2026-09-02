import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney, formatMonthLabel } from '../lib/format.js'
import { goalStats } from '../lib/calc.js'
import { cn } from '../lib/utils.js'
import { Progress, EmptyState, Card, CardTitle, Button, DeleteButton, Input, Field, FormPanel, TwoCol, CurrencySuffix, RingGauge, Badge } from '../components/ui/index.jsx'
import { MonthField } from '../components/fields.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { Icon } from '../components/icons.jsx'

const blank = () => ({ name: '', target: '', saved: '', deadline: '' })

export default function Goals() {
  const { state, t, currency, locale, addGoal, addGoalFunds, deleteGoal } = useApp()
  const confirm = useConfirm()
  const toast = useToast()
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [open, setOpen] = useState(false)

  function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = t('errName')
    if (!(Number(form.target) > 0)) errs.target = t('errTarget')
    setErrors(errs)
    if (Object.keys(errs).length) return
    addGoal({ name: form.name.trim(), target: Number(form.target), saved: Number(form.saved) || 0, deadline: form.deadline || null })
    setForm(blank()); setOpen(false)
    toast(t('goalAdded'))
  }
  async function remove(g) {
    if (await confirm({ title: t('delete'), body: g.name, danger: true })) deleteGoal(g.id)
  }
  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  return (
    <TwoCol>
      <FormPanel title={t('addGoal')} icon={<Icon.goals size={18} />} open={open} onOpenChange={setOpen}>
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <Field label={t('goalName')} required error={errors.name}>
            <Input type="text" placeholder={t('goalNamePlace')} value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label={t('targetAmount')} required error={errors.target}>
            <Input type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00" value={form.target} onChange={(e) => set({ target: e.target.value })} after={<CurrencySuffix code={currency} />} />
          </Field>
          <Field label={t('savedSoFar')} hint={t('optional')}>
            <Input type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00" value={form.saved} onChange={(e) => set({ saved: e.target.value })} after={<CurrencySuffix code={currency} />} />
          </Field>
          <Field label={t('deadline')} hint={t('optional')}>
            <MonthField value={form.deadline} onChange={(v) => set({ deadline: v })} clearable placeholder={t('optional')} className="w-full" />
          </Field>
          <Button type="submit" variant="primary" size="lg" className="w-full">{t('addGoal')}</Button>
        </form>
      </FormPanel>

      <Card>
        <CardTitle>{t('savingsGoals')}</CardTitle>
        {state.goals.length === 0
          ? <EmptyState art="target" title={t('noGoals')} action={<Button variant="primary" size="sm" icon={<Icon.plus size={15} />} onClick={() => setOpen(true)}>{t('addGoal')}</Button>} />
          : (
            <div className="grid gap-3 stagger">
              {state.goals.map(g => (
                <GoalCard key={g.id} goal={g} currency={currency} locale={locale} t={t}
                  onAdd={(amt) => { addGoalFunds(g.id, amt); toast(t('fundsAdded')) }} onDelete={() => remove(g)} />
              ))}
            </div>
          )}
      </Card>
    </TwoCol>
  )
}

function GoalCard({ goal, currency, locale, t, onAdd, onDelete }) {
  const [amt, setAmt] = useState('')
  const st = goalStats(goal)
  const status = st.reached ? 'good' : st.pct >= 66 ? 'good' : st.pct >= 33 ? 'accent' : 'warn'
  const color = status === 'good' ? 'var(--positive)' : status === 'warn' ? 'var(--warning)' : 'var(--accent-ink)'
  const money = (n) => formatMoney(n, currency, { short: true })

  function add(e) {
    e.preventDefault()
    if (!(Number(amt) > 0)) return
    onAdd(Number(amt))
    setAmt('')
  }

  return (
    <div className="flex gap-4 rounded-md border border-line bg-surface-2 p-4">
      <RingGauge value={st.pct} size={84} stroke={6} color={color} sweep={300} className="shrink-0 max-sm:hidden">
        <span className="num text-[15px] text-ink">{st.pct.toFixed(0)}%</span>
      </RingGauge>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate text-[15px]">{goal.name}</div>
            <div className="t-small text-ink-2 num-soft mt-0.5">
              <b className="num text-ink">{money(goal.saved)}</b> {t('ofBudget')} {money(goal.target)}
              <span className="sm:hidden"> · {st.pct.toFixed(0)}%</span>
            </div>
          </div>
          <DeleteButton onClick={onDelete} title={t('delete')} size="iconXs" />
        </div>
        <Progress pct={st.pct} status={status} className="mt-2.5" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 t-caption text-ink-3 font-normal">
          {st.reached
            ? <Badge tone="positive"><Icon.check size={12} />{t('goalReached')}</Badge>
            : <span className="num-soft">{money(st.remaining)} {t('remaining')}</span>}
          {goal.deadline && !st.reached && (
            <span className="inline-flex items-center gap-1.5 num-soft">
              <Icon.calendar size={12} />{formatMonthLabel(goal.deadline, locale)} ·
              <b className="text-accent-ink font-semibold">{money(st.perMonth || 0)}{t('perMonthNeeded')}</b>
            </span>
          )}
        </div>
        {!st.reached && (
          <form className="mt-3 flex gap-2" onSubmit={add}>
            <Input type="number" inputMode="decimal" min={0} step="0.01" placeholder={t('addFunds')} value={amt} onChange={(e) => setAmt(e.target.value)}
              after={<CurrencySuffix code={currency} />} className={cn('flex-1 [&_input]:h-8 [&_input]:text-[13px]')} />
            <Button type="submit" variant="success" size="iconSm" aria-label={t('addFunds')} disabled={!(Number(amt) > 0)}><Icon.plus size={16} /></Button>
          </form>
        )}
      </div>
    </div>
  )
}
