import { useState } from 'react'
import { Button, Field, Input } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney, formatDate, todayStr } from '../lib/format.js'
import { accountsWithBalances, totalNetCash } from '../lib/calc.js'
import { CARD_COLORS } from '../lib/categories.js'
import { EmptyState } from '../components/ui/index.jsx'
import { SelectMenu } from '../components/fields.jsx'
import { useConfirm } from '../components/Confirm.jsx'
import { DeleteButton } from '../components/fluentBits.jsx'
import { Icon } from '../components/icons.jsx'

const TYPES = ['bank', 'cash', 'card']
const typeIcon = (t) => t === 'cash' ? <Icon.cash /> : t === 'card' ? <Icon.cards /> : <Icon.accounts />

const blankAcc = () => ({ name: '', type: 'bank', color: CARD_COLORS[0], openingBalance: '' })
const blankTr = () => ({ fromId: '', toId: '', amount: '', date: todayStr(), note: '' })

export default function Accounts() {
  const { state, t, currency, locale, addAccount, deleteAccount, addTransfer, deleteTransfer } = useApp()
  const confirm = useConfirm()
  const [acc, setAcc] = useState(blankAcc)
  const [tr, setTr] = useState(blankTr)

  const accounts = accountsWithBalances(state)
  const total = totalNetCash(state)
  const transfers = state.transfers || []
  const nameOf = (id) => accounts.find(a => a.id === id)?.name || '—'

  function submitAcc(e) {
    e.preventDefault()
    if (!acc.name.trim()) return
    addAccount({ ...acc, name: acc.name.trim() })
    setAcc(blankAcc())
  }
  function submitTr(e) {
    e.preventDefault()
    const amount = parseFloat(tr.amount)
    if (!amount || amount <= 0 || !tr.fromId || !tr.toId || tr.fromId === tr.toId) return
    addTransfer(tr)
    setTr(blankTr())
  }
  async function removeAcc(id) {
    if (await confirm({ title: t('delete'), body: t('removeAccountWarn'), danger: true, confirmLabel: t('remove') }))
      deleteAccount(id)
  }

  return (
    <div className="two-col">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card">
          <div className="card-title">{t('addAccount')}</div>
          <form className="form" onSubmit={submitAcc}>
            <Field label={t('accountName')} required>
              <Input value={acc.name} placeholder={t('accountNamePlace')}
                onChange={(_, d) => setAcc({ ...acc, name: d.value })} required />
            </Field>
            <Field label={t('accountType')}>
              <SelectMenu value={acc.type} onChange={(_, d) => setAcc({ ...acc, type: d.value })}>
                {TYPES.map(ty => <option key={ty} value={ty}>{t('type' + ty[0].toUpperCase() + ty.slice(1))}</option>)}
              </SelectMenu>
            </Field>
            <Field label={`${t('openingBalance')} (${currency})`}>
              <Input type="number" step="0.01" placeholder="0.00" value={acc.openingBalance}
                onChange={(_, d) => setAcc({ ...acc, openingBalance: d.value })} />
            </Field>
            <Field label={t('cardColor')}>
              <div className="row wrap" style={{ gap: 10 }}>
                {CARD_COLORS.map(c => (
                  <button type="button" key={c} aria-label={c} aria-pressed={acc.color === c}
                    onClick={() => setAcc({ ...acc, color: c })}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, padding: 0,
                      border: acc.color === c ? '3px solid var(--text)' : '3px solid transparent',
                      transform: acc.color === c ? 'scale(1.15)' : 'none', transition: '.15s',
                    }} />
                ))}
              </div>
            </Field>
            <Button type="submit" appearance="primary" style={{ width: '100%' }}>{t('addAccount')}</Button>
          </form>
        </div>

        <div className="card">
          <div className="card-title"><span className="ct-ico"><Icon.swap /></span>{t('transferFunds')}</div>
          {accounts.length < 2
            ? <p className="text-muted" style={{ fontSize: 13 }}>{t('noAccounts')}</p>
            : (
              <form className="form" onSubmit={submitTr}>
                <div className="row" style={{ gap: 10 }}>
                  <Field label={t('fromAccount')} style={{ flex: 1 }}>
                    <SelectMenu value={tr.fromId} onChange={(_, d) => setTr({ ...tr, fromId: d.value })}>
                      <option value="">—</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </SelectMenu>
                  </Field>
                  <Field label={t('toAccount')} style={{ flex: 1 }}>
                    <SelectMenu value={tr.toId} onChange={(_, d) => setTr({ ...tr, toId: d.value })}>
                      <option value="">—</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </SelectMenu>
                  </Field>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <Field label={`${t('amount')} (${currency})`} style={{ flex: 1 }}>
                    <Input type="number" step="0.01" placeholder="0.00" value={tr.amount}
                      onChange={(_, d) => setTr({ ...tr, amount: d.value })} required />
                  </Field>
                  <Field label={t('date')} style={{ flex: 1 }}>
                    <Input type="date" value={tr.date} onChange={(_, d) => setTr({ ...tr, date: d.value })} />
                  </Field>
                </div>
                <Button type="submit" appearance="primary" icon={<Icon.swap />} style={{ width: '100%' }}>{t('transfer')}</Button>
              </form>
            )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card">
          <div className="card-title">{t('myAccounts')}
            <span className="hint">{t('totalCash')}: {formatMoney(total, currency, { short: true })}</span>
          </div>
          {accounts.length === 0
            ? <EmptyState icon="accounts"><p>{t('noAccounts')}</p></EmptyState>
            : (
              <div className="acct-list">
                {accounts.map(a => (
                  <div className="acct-row" key={a.id}>
                    <span className="acct-ico" style={{ background: `${a.color}1f`, color: a.color }}>{typeIcon(a.type)}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="acct-name">{a.name}</div>
                      <div className="acct-type">{t('type' + a.type[0].toUpperCase() + a.type.slice(1))}</div>
                    </div>
                    <div className={`acct-bal ${a.balance < 0 ? 'neg' : ''}`}>{formatMoney(a.balance, currency)}</div>
                    <DeleteButton onClick={() => removeAcc(a.id)} title={t('delete')} />
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="card">
          <div className="card-title">{t('transfersHistory')}</div>
          {transfers.length === 0
            ? <EmptyState icon="swap"><p>{t('noTransfers')}</p></EmptyState>
            : (
              <div className="tx-list">
                {transfers.map(x => (
                  <div className="tx-row" key={x.id}>
                    <div className="tx-left">
                      <span className="tx-ico" style={{ color: 'var(--brand-ink)' }}><Icon.swap /></span>
                      <div style={{ minWidth: 0 }}>
                        <div className="tx-desc">{nameOf(x.fromId)} → {nameOf(x.toId)}</div>
                        <div className="tx-meta">{formatDate(x.date, locale)}{x.note ? ` · ${x.note}` : ''}</div>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="tx-amt">{formatMoney(x.amount, currency, { short: true })}</span>
                      <DeleteButton onClick={() => deleteTransfer(x.id)} title={t('delete')} />
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
