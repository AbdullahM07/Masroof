import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney, formatDate, todayStr } from '../lib/format.js'
import { accountsWithBalances, totalNetCash } from '../lib/calc.js'
import { CARD_COLORS } from '../lib/categories.js'
import { cn } from '../lib/utils.js'
import { EmptyState, Card, CardTitle, Button, DeleteButton, Input, Field, CurrencySuffix, Stack } from '../components/ui/index.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { Icon } from '../components/icons.jsx'

const TYPES = ['bank', 'cash', 'card']
const typeIcon = (ty, size = 18) => ty === 'cash' ? <Icon.cash size={size} /> : ty === 'card' ? <Icon.cards size={size} /> : <Icon.accounts size={size} />

const blankAcc = () => ({ name: '', type: 'bank', color: CARD_COLORS[0], openingBalance: '' })
const blankTr = () => ({ fromId: '', toId: '', amount: '', date: todayStr(), note: '' })

export function ColorSwatches({ value, onChange, size = 28 }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CARD_COLORS.map(c => (
        <button type="button" key={c} aria-label={c} aria-pressed={value === c} onClick={() => onChange(c)}
          className={cn('rounded-full transition-transform duration-150 ring-offset-2 ring-offset-surface', value === c ? 'ring-2 ring-ink scale-110' : 'hover:scale-105')}
          style={{ width: size, height: size, background: c }} />
      ))}
    </div>
  )
}

export default function Accounts() {
  const { state, t, currency, locale, addAccount, deleteAccount, addTransfer, deleteTransfer } = useApp()
  const confirm = useConfirm()
  const toast = useToast()
  const [acc, setAcc] = useState(blankAcc)
  const [tr, setTr] = useState(blankTr)
  const [trErr, setTrErr] = useState('')

  const accounts = accountsWithBalances(state)
  const total = totalNetCash(state)
  const transfers = state.transfers || []
  const nameOf = (id) => accounts.find(a => a.id === id)?.name || '—'
  const money = (n, short = false) => formatMoney(n, currency, { short })

  function submitAcc(e) {
    e.preventDefault()
    if (!acc.name.trim()) return
    addAccount({ ...acc, name: acc.name.trim() })
    setAcc(blankAcc())
    toast(t('accountAdded'))
  }
  function submitTr(e) {
    e.preventDefault()
    const amount = parseFloat(tr.amount)
    if (!amount || amount <= 0 || !tr.fromId || !tr.toId || tr.fromId === tr.toId) { setTrErr(t('errTransfer')); return }
    setTrErr('')
    addTransfer(tr)
    setTr(blankTr())
    toast(t('transferDone'))
  }
  async function removeAcc(id) {
    if (await confirm({ title: t('delete'), body: t('removeAccountWarn'), danger: true, confirmLabel: t('remove') }))
      deleteAccount(id)
  }

  return (
    <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <Stack>
        <Card>
          <CardTitle icon={<Icon.accounts size={18} />}>{t('addAccount')}</CardTitle>
          <form className="flex flex-col gap-4" onSubmit={submitAcc}>
            <Field label={t('accountName')} required>
              <Input value={acc.name} placeholder={t('accountNamePlace')} onChange={(e) => setAcc({ ...acc, name: e.target.value })} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('accountType')}>
                <SelectMenu value={acc.type} onChange={(v) => setAcc({ ...acc, type: v })}>
                  {TYPES.map(ty => <option key={ty} value={ty} data-icon={typeIcon(ty, 15)}>{t('type' + ty[0].toUpperCase() + ty.slice(1))}</option>)}
                </SelectMenu>
              </Field>
              <Field label={t('openingBalance')}>
                <Input type="number" inputMode="decimal" step="0.01" placeholder="0.00" value={acc.openingBalance} onChange={(e) => setAcc({ ...acc, openingBalance: e.target.value })} after={<CurrencySuffix code={currency} />} />
              </Field>
            </div>
            <Field label={t('cardColor')}>
              <ColorSwatches value={acc.color} onChange={(c) => setAcc({ ...acc, color: c })} />
            </Field>
            <Button type="submit" variant="primary" size="lg" className="w-full">{t('addAccount')}</Button>
          </form>
        </Card>

        <Card>
          <CardTitle icon={<Icon.swap size={18} />}>{t('transferFunds')}</CardTitle>
          {accounts.length < 2
            ? <p className="t-small text-ink-2">{t('noAccounts')}</p>
            : (
              <form className="flex flex-col gap-4" onSubmit={submitTr} noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('fromAccount')}>
                    <SelectMenu value={tr.fromId} onChange={(v) => setTr({ ...tr, fromId: v })} placeholder="—">
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </SelectMenu>
                  </Field>
                  <Field label={t('toAccount')}>
                    <SelectMenu value={tr.toId} onChange={(v) => setTr({ ...tr, toId: v })} placeholder="—">
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </SelectMenu>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('amount')} error={trErr}>
                    <Input type="number" inputMode="decimal" step="0.01" placeholder="0.00" value={tr.amount} onChange={(e) => setTr({ ...tr, amount: e.target.value })} after={<CurrencySuffix code={currency} />} />
                  </Field>
                  <Field label={t('date')}>
                    <Input type="date" value={tr.date} onChange={(e) => setTr({ ...tr, date: e.target.value })} />
                  </Field>
                </div>
                <Button type="submit" variant="primary" size="lg" icon={<Icon.swap size={16} />} className="w-full">{t('transfer')}</Button>
              </form>
            )}
        </Card>
      </Stack>

      <Stack>
        <Card>
          <CardTitle hint={<>{t('totalCash')}: <span className={cn('num', total < 0 ? 'text-negative' : 'text-ink')}>{money(total, true)}</span></>}>{t('myAccounts')}</CardTitle>
          {accounts.length === 0
            ? <EmptyState art="bank" title={t('noAccounts')} />
            : (
              <ul className="-mx-5 max-sm:-mx-4 divide-y divide-line stagger">
                {accounts.map(a => (
                  <li key={a.id} className="flex items-center gap-3 px-5 max-sm:px-4 py-3 hover:bg-surface-2 transition-colors">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white" style={{ background: a.color }}>{typeIcon(a.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink truncate">{a.name}</div>
                      <div className="t-caption text-ink-3 font-normal">{t('type' + a.type[0].toUpperCase() + a.type.slice(1))}</div>
                    </div>
                    <div className={cn('num text-[15px]', a.balance < 0 ? 'text-negative' : 'text-ink')}>{money(a.balance)}</div>
                    <DeleteButton onClick={() => removeAcc(a.id)} title={t('delete')} />
                  </li>
                ))}
              </ul>
            )}
        </Card>

        <Card>
          <CardTitle>{t('transfersHistory')}</CardTitle>
          {transfers.length === 0
            ? <EmptyState art="swap" title={t('noTransfers')} compact />
            : (
              <ul className="-mx-5 max-sm:-mx-4 divide-y divide-line">
                {transfers.map(x => (
                  <li key={x.id} className="flex items-center gap-3 px-5 max-sm:px-4 py-2.5 hover:bg-surface-2 transition-colors">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-ink"><Icon.swap size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink truncate flex items-center gap-1.5">{nameOf(x.fromId)} <Icon.arrowRight size={13} className="text-ink-3 rtl:rotate-180" /> {nameOf(x.toId)}</div>
                      <div className="t-caption text-ink-3 font-normal">{formatDate(x.date, locale)}{x.note ? ` · ${x.note}` : ''}</div>
                    </div>
                    <span className="num text-ink">{money(x.amount, true)}</span>
                    <DeleteButton onClick={() => deleteTransfer(x.id)} title={t('delete')} size="iconXs" />
                  </li>
                ))}
              </ul>
            )}
        </Card>
      </Stack>
    </div>
  )
}
