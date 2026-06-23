import { useState } from 'react'
import { Button, Input } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr, formatMoney } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { budgetProgress, overallBudget } from '../lib/calc.js'
import { ProgressBar, MonthPicker, EmptyState } from '../components/ui.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { DeleteButton } from '../components/fluentBits.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

export default function Budgets() {
  const { state, t, currency, setOverallBudget, setCategoryBudget } = useApp()
  const [month, setMonth] = useState(currentMonthStr())
  const [overall, setOverall] = useState(state.budgets.overall || '')
  const [pick, setPick] = useState({ cat: '', amount: '' })

  const cats = budgetProgress(state, month)
  const all = overallBudget(state, month)

  function saveOverall(e) {
    e.preventDefault()
    setOverallBudget(overall)
  }
  function addCatBudget(e) {
    e.preventDefault()
    if (!pick.cat || !(Number(pick.amount) > 0)) return
    setCategoryBudget(pick.cat, pick.amount)
    setPick({ cat: '', amount: '' })
  }

  const overStatus = (pct) => pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'good'

  return (
    <>
      <div className="section-head" style={{ justifyContent: 'flex-end' }}>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {/* Overall budget */}
      <div className="card section">
        <div className="card-title">{t('monthlyBudget')} <span className="hint">{t('budgetHint')}</span></div>
        <form className="row wrap" style={{ gap: 10, marginBottom: 18 }} onSubmit={saveOverall}>
          <Input type="number" min={0} step="1" placeholder={`${t('monthlyBudget')} (${currency})`}
            value={overall} onChange={(_, d) => setOverall(d.value)} style={{ flex: 1, minWidth: 200 }} />
          <Button type="submit" appearance="primary">{t('save')}</Button>
        </form>
        <div className="progress-head" style={{ marginBottom: 8 }}>
          <span className="progress-name" style={{ fontSize: 14 }}>
            {all.hasExplicit ? t('monthlyBudget') : t('totalIncome')}
          </span>
          <span className="progress-val">
            <b style={{ color: all.over ? 'var(--danger)' : 'var(--text)' }}>{formatMoney(all.spent, currency, { short: true })}</b>
            {' '}{t('ofBudget')} {formatMoney(all.limit, currency, { short: true })}
          </span>
        </div>
        <ProgressBar pct={all.pct} status={overStatus(all.pct)} />
        <div className="budget-note mt-8" style={{ color: all.over ? 'var(--danger)' : 'var(--text-muted)' }}>
          {all.over
            ? <><Icon.alert width={13} height={13} /> {t('overBudget')} · {formatMoney(Math.abs(all.remaining), currency, { short: true })}</>
            : `${formatMoney(all.remaining, currency, { short: true })} ${t('remaining')}`}
        </div>
      </div>

      {/* Category budgets */}
      <div className="card">
        <div className="card-title">{t('categoryBudgets')}</div>
        <form className="filters-row" onSubmit={addCatBudget}>
          <SelectMenu value={pick.cat} onChange={(_, d) => setPick({ ...pick, cat: d.value })}>
            <option value="">{t('selectCat')}</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{t(c.key)}</option>)}
          </SelectMenu>
          <Input type="number" min={0} step="1" placeholder={t('setBudget')}
            value={pick.amount} onChange={(_, d) => setPick({ ...pick, amount: d.value })} />
          <Button type="submit" appearance="primary" style={{ flex: '0 0 auto' }}>{t('add')}</Button>
        </form>

        {cats.length === 0
          ? <EmptyState icon="budgets"><p>{t('noBudgets')}</p></EmptyState>
          : cats.map(b => (
            <div className="progress-row" key={b.category}>
              <div className="progress-head">
                <span className="progress-name">
                  <span className="ico" style={{ color: catColor(b.category) }}><CategoryIcon category={b.category} /></span>
                  {t(b.category)}
                </span>
                <span className="progress-val">
                  <b style={{ color: b.over ? 'var(--danger)' : 'var(--text)' }}>{formatMoney(b.spent, currency, { short: true })}</b>
                  {' '}{t('ofBudget')} {formatMoney(b.limit, currency, { short: true })}
                  <span style={{ marginInlineStart: 6, verticalAlign: 'middle', display: 'inline-flex' }}>
                    <DeleteButton onClick={() => setCategoryBudget(b.category, 0)} title={t('delete')} />
                  </span>
                </span>
              </div>
              <ProgressBar pct={b.pct} status={overStatus(b.pct)} />
              <div className="budget-note" style={{ color: b.over ? 'var(--danger)' : 'var(--text-muted)' }}>
                {b.over
                  ? <><Icon.alert width={12} height={12} /> {t('overBudget')} · {formatMoney(Math.abs(b.remaining), currency, { short: true })}</>
                  : `${b.pct.toFixed(0)}% · ${formatMoney(b.remaining, currency, { short: true })} ${t('remaining')}`}
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
