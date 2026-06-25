import { useState } from 'react'
import { Button, Field, Input } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr, formatMoney } from '../lib/format.js'
import { CARD_COLORS } from '../lib/categories.js'
import { EmptyState } from '../components/ui/index.jsx'
import { useConfirm } from '../components/Confirm.jsx'

export default function Cards() {
  const { state, t, currency, addCard, deleteCard } = useApp()
  const confirm = useConfirm()
  const [form, setForm] = useState({ name: '', last4: '', color: CARD_COLORS[0] })

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    addCard({ name: form.name.trim(), last4: form.last4.trim(), color: form.color })
    setForm({ name: '', last4: '', color: CARD_COLORS[0] })
  }

  async function remove(id) {
    if (await confirm({ title: t('remove'), body: t('removeCardWarn'), danger: true, confirmLabel: t('remove') }))
      deleteCard(id)
  }

  // spend per card this month
  const month = currentMonthStr()
  const spentByCard = {}
  state.expenses.filter(e => (e.date || '').startsWith(month) && e.cardId).forEach(e => {
    spentByCard[e.cardId] = (spentByCard[e.cardId] || 0) + (Number(e.amount) || 0)
  })

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title">{t('addCard')}</div>
        <form className="form" onSubmit={submit}>
          <Field label={t('cardName')}>
            <Input type="text" placeholder={t('cardNamePlace')} value={form.name}
              onChange={(_, d) => setForm({ ...form, name: d.value })} required />
          </Field>
          <Field label={`${t('last4')} (${t('optional')})`}>
            <Input type="text" input={{ inputMode: 'numeric', maxLength: 4 }} placeholder="1234" value={form.last4}
              onChange={(_, d) => setForm({ ...form, last4: d.value.replace(/\D/g, '') })} />
          </Field>
          <Field label={t('cardColor')}>
            <div className="row wrap" style={{ gap: 10 }}>
              {CARD_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                  aria-label={c} aria-pressed={form.color === c}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', background: c, padding: 0,
                    border: form.color === c ? '3px solid var(--text)' : '3px solid transparent',
                    transform: form.color === c ? 'scale(1.15)' : 'none', transition: '.15s',
                  }} />
              ))}
            </div>
          </Field>
          <Button type="submit" appearance="primary" style={{ width: '100%' }}>{t('addCard')}</Button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">{t('savedCards')}</div>
        {state.cards.length === 0
          ? <EmptyState icon="cards"><p>{t('noCards')}</p></EmptyState>
          : (
            <div className="cards-grid">
              {state.cards.map(card => (
                <div className="credit-card" key={card.id}
                  style={{ background: `linear-gradient(135deg, ${card.color}dd, ${card.color})` }}>
                  <div className="cc-top">
                    <div className="cc-chip" />
                    <div className="cc-brand">{t('card')}</div>
                  </div>
                  <div className="cc-num">{card.last4 ? `•••• •••• •••• ${card.last4}` : t('noNumberSaved')}</div>
                  <div className="cc-bottom">
                    <div>
                      <div className="cc-name">{card.name}</div>
                      <div className="cc-spent">{formatMoney(spentByCard[card.id] || 0, currency, { short: true })} · {t('spentOnCard')}</div>
                    </div>
                    <button className="cc-remove" onClick={() => remove(card.id)}>{t('remove')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
