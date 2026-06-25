import { useState } from 'react'
import { Button, Field, Input } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney, formatMonthLabel } from '../lib/format.js'
import { goalStats } from '../lib/calc.js'
import { ProgressBar, EmptyState } from '../components/ui/index.jsx'
import { MonthField } from '../components/fields.jsx'
import { DeleteButton, SuccessButton } from '../components/fluentBits.jsx'
import { Icon } from '../components/icons.jsx'

const blank = () => ({ name: '', target: '', saved: '', deadline: '' })

export default function Goals() {
  const { state, t, currency, locale, addGoal, addGoalFunds, deleteGoal } = useApp()
  const [form, setForm] = useState(blank)

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !(Number(form.target) > 0)) return
    addGoal({
      name: form.name.trim(),
      target: Number(form.target),
      saved: Number(form.saved) || 0,
      deadline: form.deadline || null,
    })
    setForm(blank())
  }

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title">{t('addGoal')}</div>
        <form className="form" onSubmit={submit}>
          <Field label={t('goalName')}>
            <Input type="text" placeholder={t('goalNamePlace')} value={form.name}
              onChange={(_, d) => setForm({ ...form, name: d.value })} required />
          </Field>
          <Field label={t('targetAmount')}>
            <Input type="number" min={0} step="0.01" placeholder="0.00" value={form.target}
              onChange={(_, d) => setForm({ ...form, target: d.value })} required />
          </Field>
          <Field label={`${t('savedSoFar')} (${t('optional')})`}>
            <Input type="number" min={0} step="0.01" placeholder="0.00" value={form.saved}
              onChange={(_, d) => setForm({ ...form, saved: d.value })} />
          </Field>
          <Field label={`${t('deadline')} (${t('optional')})`}>
            <MonthField value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })}
              clearable placeholder={t('optional')} />
          </Field>
          <Button type="submit" appearance="primary" style={{ width: '100%' }}>{t('addGoal')}</Button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">{t('savingsGoals')}</div>
        {state.goals.length === 0
          ? <EmptyState icon="goals"><p>{t('noGoals')}</p></EmptyState>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {state.goals.map(g => (
                <GoalCard key={g.id} goal={g} currency={currency} locale={locale} t={t}
                  onAdd={(amt) => addGoalFunds(g.id, amt)} onDelete={() => deleteGoal(g.id)} />
              ))}
            </div>}
      </div>
    </div>
  )
}

function GoalCard({ goal, currency, locale, t, onAdd, onDelete }) {
  const [amt, setAmt] = useState('')
  const st = goalStats(goal)
  const status = st.reached ? 'good' : st.pct >= 66 ? 'good' : st.pct >= 33 ? 'warn' : 'over'

  function add(e) {
    e.preventDefault()
    if (!(Number(amt) > 0)) return
    onAdd(Number(amt))
    setAmt('')
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16, background: 'var(--surface-2)' }}>
      <div className="progress-head" style={{ marginBottom: 6 }}>
        <span className="row" style={{ gap: 8, fontWeight: 800, fontSize: 15 }}>
          <Icon.goals width={18} height={18} style={{ color: 'var(--brand)' }} /> {goal.name}
        </span>
        <DeleteButton onClick={onDelete} title={t('delete')} />
      </div>
      <div className="progress-val" style={{ marginBottom: 8 }}>
        <b style={{ color: 'var(--text)' }}>{formatMoney(goal.saved, currency, { short: true })}</b>
        {' '}{t('ofBudget')} {formatMoney(goal.target, currency, { short: true })} · {st.pct.toFixed(0)}%
      </div>
      <ProgressBar pct={st.pct} status={status} />

      <div className="row wrap mt-8" style={{ justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)' }}>
        {st.reached
          ? <span className="row" style={{ gap: 6, color: 'var(--success)', fontWeight: 700 }}><Icon.check width={15} height={15} /> {t('goalReached')}</span>
          : <span>{formatMoney(st.remaining, currency, { short: true })} {t('remaining')}</span>}
        {goal.deadline && !st.reached && (
          <span className="row" style={{ gap: 6 }}>
            <Icon.calendar width={14} height={14} /> {formatMonthLabel(goal.deadline, locale)} ·{' '}
            <b style={{ color: 'var(--brand)' }}>{formatMoney(st.perMonth || 0, currency, { short: true })}{t('perMonthNeeded')}</b>
          </span>
        )}
      </div>

      {!st.reached && (
        <form className="row mt-8" style={{ gap: 8 }} onSubmit={add}>
          <Input type="number" min={0} step="0.01" placeholder={t('addFunds')} value={amt}
            onChange={(_, d) => setAmt(d.value)} style={{ flex: 1 }} />
          <SuccessButton type="submit" icon={<Icon.plus />} aria-label={t('addFunds')} />
        </form>
      )}
    </div>
  )
}
