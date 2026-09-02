import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney } from '../lib/format.js'
import { CATEGORIES, catColor } from '../lib/categories.js'
import { budgetProgress, overallBudget } from '../lib/calc.js'
import { cn } from '../lib/utils.js'
import { Progress, EmptyState, Card, CardTitle, Button, DeleteButton, Input, Stack, CurrencySuffix, Badge } from '../components/ui/index.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { useToast } from '../components/Confirm.jsx'
import { Icon, CategoryIcon } from '../components/icons.jsx'

export default function Budgets({ month }) {
  const { state, t, currency, setOverallBudget, setCategoryBudget } = useApp()
  const toast = useToast()
  const [overall, setOverall] = useState(state.budgets.overall || '')
  const [pick, setPick] = useState({ cat: '', amount: '' })

  const cats = budgetProgress(state, month)
  const all = overallBudget(state, month)
  const money = (n) => formatMoney(n, currency, { short: true })
  const used = new Set(cats.map(c => c.category))

  function saveOverall(e) {
    e.preventDefault()
    setOverallBudget(overall)
    toast(t('budgetSaved'))
  }
  function addCatBudget(e) {
    e.preventDefault()
    if (!pick.cat || !(Number(pick.amount) > 0)) return
    setCategoryBudget(pick.cat, pick.amount)
    setPick({ cat: '', amount: '' })
  }

  const statusOf = (pct) => pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'good'

  return (
    <Stack>
      <Card>
        <CardTitle icon={<Icon.budgets size={18} />} hint={t('budgetHint')}>{t('monthlyBudget')}</CardTitle>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="t-caption text-ink-3 font-normal">{all.hasExplicit ? t('monthlyBudget') : t('totalIncome')}</div>
                <div className={cn('num text-[28px] leading-8', all.over ? 'text-negative' : 'text-ink')}>
                  {money(all.spent)} <span className="text-[14px] text-ink-3 font-normal">{t('ofBudget')} {money(all.limit)}</span>
                </div>
              </div>
              <Badge tone={all.over ? 'negative' : all.pct >= 80 ? 'warning' : 'positive'} className="num-soft">{Math.round(all.pct)}%</Badge>
            </div>
            <Progress pct={all.pct} status={statusOf(all.pct)} className="mt-3 h-2" />
            <div className={cn('mt-2 t-small', all.over ? 'text-negative' : 'text-ink-2')}>
              {all.over
                ? <span className="inline-flex items-center gap-1"><Icon.alert size={13} />{t('overBudget')} · {money(Math.abs(all.remaining))}</span>
                : <>{money(all.remaining)} {t('remaining')}</>}
            </div>
          </div>
          <form className="flex items-end gap-2" onSubmit={saveOverall}>
            <div className="flex-1">
              <label className="t-small font-medium text-ink-2 block mb-1.5" htmlFor="overall-budget">{t('setBudget')}</label>
              <Input id="overall-budget" type="number" inputMode="decimal" min={0} step="1" placeholder="0" value={overall}
                onChange={(e) => setOverall(e.target.value)} after={<CurrencySuffix code={currency} />} />
            </div>
            <Button type="submit" variant="primary">{t('save')}</Button>
          </form>
        </div>
      </Card>

      <Card>
        <CardTitle>{t('categoryBudgets')}</CardTitle>
        <form className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:flex-wrap" onSubmit={addCatBudget}>
          <SelectMenu value={pick.cat} onChange={(v) => setPick({ ...pick, cat: v })} placeholder={t('selectCat')} className="col-span-2 sm:w-56">
            {CATEGORIES.map(c => <option key={c.key} value={c.key} data-icon={<CategoryIcon category={c.key} size={15} style={{ color: catColor(c.key) }} />}>{t(c.key)}{used.has(c.key) ? ' ✓' : ''}</option>)}
          </SelectMenu>
          <Input type="number" inputMode="decimal" min={0} step="1" placeholder={t('setBudget')} value={pick.amount}
            onChange={(e) => setPick({ ...pick, amount: e.target.value })} after={<CurrencySuffix code={currency} />} className="sm:w-48" />
          <Button type="submit" variant="primary" icon={<Icon.plus size={15} />} disabled={!pick.cat || !(Number(pick.amount) > 0)}>{t('add')}</Button>
        </form>

        {cats.length === 0
          ? <EmptyState art="pie" title={t('noBudgets')} />
          : (
            <ul className="mt-4 -mx-5 max-sm:-mx-4 divide-y divide-line stagger">
              {cats.map(b => (
                <li key={b.category} className="cat-bar px-5 max-sm:px-4 py-3.5" style={{ '--c': catColor(b.category) }}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex" style={{ color: catColor(b.category) }}><CategoryIcon category={b.category} size={17} /></span>
                    <span className="font-medium text-ink flex-1 truncate">{t(b.category)}</span>
                    <span className="t-small text-ink-2 num-soft">
                      <b className={cn('num', b.over ? 'text-negative' : 'text-ink')}>{money(b.spent)}</b> {t('ofBudget')} {money(b.limit)}
                    </span>
                    <DeleteButton onClick={() => setCategoryBudget(b.category, 0)} title={t('delete')} size="iconXs" />
                  </div>
                  <div className="ms-8"><Progress pct={b.pct} status={statusOf(b.pct)} className="mt-2.5" /></div>
                  <div className={cn('mt-1.5 ms-8 t-caption font-normal', b.over ? 'text-negative' : 'text-ink-3')}>
                    {b.over
                      ? <span className="inline-flex items-center gap-1"><Icon.alert size={12} />{t('overBudget')} · {money(Math.abs(b.remaining))}</span>
                      : `${b.pct.toFixed(0)}% · ${money(b.remaining)} ${t('remaining')}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
      </Card>
    </Stack>
  )
}
