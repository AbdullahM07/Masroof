import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr, formatMoney } from '../lib/format.js'
import { CARD_COLORS } from '../lib/categories.js'
import { EmptyState, Card, CardTitle, Button, Input, Field, FormPanel, TwoCol } from '../components/ui/index.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { Icon } from '../components/icons.jsx'
import { Mark } from '../layout/Wordmark.jsx'
import { ColorSwatches } from './Accounts.jsx'

export default function Cards() {
  const { state, t, currency, addCard, deleteCard } = useApp()
  const confirm = useConfirm()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', last4: '', color: CARD_COLORS[0] })
  const [open, setOpen] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    addCard({ name: form.name.trim(), last4: form.last4.trim(), color: form.color })
    setForm({ name: '', last4: '', color: CARD_COLORS[0] })
    setOpen(false)
    toast(t('cardAdded'))
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
    <TwoCol>
      <FormPanel title={t('addCard')} icon={<Icon.cards size={18} />} open={open} onOpenChange={setOpen}>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <Field label={t('cardName')} required>
            <Input type="text" placeholder={t('cardNamePlace')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label={t('last4')} hint={t('optional')}>
            <Input type="text" inputMode="numeric" maxLength={4} placeholder="1234" value={form.last4} className="[&_input]:num-soft"
              onChange={(e) => setForm({ ...form, last4: e.target.value.replace(/\D/g, '') })} />
          </Field>
          <Field label={t('cardColor')}>
            <ColorSwatches value={form.color} onChange={(c) => setForm({ ...form, color: c })} size={30} />
          </Field>
          <CardVisual name={form.name || t('cardName')} last4={form.last4} color={form.color} t={t} preview />
          <Button type="submit" variant="primary" size="lg" className="w-full">{t('addCard')}</Button>
        </form>
      </FormPanel>

      <Card>
        <CardTitle>{t('savedCards')}</CardTitle>
        {state.cards.length === 0
          ? <EmptyState art="card" title={t('noCards')} action={<Button variant="primary" size="sm" icon={<Icon.plus size={15} />} onClick={() => setOpen(true)}>{t('addCard')}</Button>} />
          : (
            <div className="grid gap-4 sm:grid-cols-2 stagger">
              {state.cards.map(card => (
                <CardVisual key={card.id} name={card.name} last4={card.last4} color={card.color} t={t}
                  spent={formatMoney(spentByCard[card.id] || 0, currency, { short: true })} onRemove={() => remove(card.id)} />
              ))}
            </div>
          )}
      </Card>
    </TwoCol>
  )
}

// Bank-card visual: one deep solid colour, engraved-style pattern, white type.
export function CardVisual({ name, last4, color, spent, onRemove, t, preview = false }) {
  return (
    <div
      className="relative aspect-[1.66] w-full overflow-hidden rounded-lg p-5 text-white shadow-card select-none"
      style={{ background: color }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" style={{ background: 'radial-gradient(120% 90% at 100% 0%, #fff 0%, transparent 55%)' }} />
      <div className="pointer-events-none absolute -bottom-10 -end-6 h-40 w-40 rounded-full border border-white/15" />
      <div className="pointer-events-none absolute -bottom-16 -end-14 h-56 w-56 rounded-full border border-white/10" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="block h-7 w-9 rounded-[4px] bg-white/25 ring-1 ring-white/30">
            <span className="block h-full w-full rounded-[4px] bg-[linear-gradient(90deg,transparent_45%,rgba(255,255,255,.35)_45%,rgba(255,255,255,.35)_55%,transparent_55%)]" />
          </span>
          <span className="t-caption uppercase tracking-[0.12em] text-white/80">{t('card')}</span>
        </div>
        <div className="num-soft text-[17px] tracking-[0.18em] text-white/90">{last4 ? `•••• •••• •••• ${last4}` : t('noNumberSaved')}</div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold">{name}</div>
            {spent != null && <div className="t-caption text-white/75 num-soft font-normal">{spent} · {t('spentOnCard')}</div>}
          </div>
          {!preview && onRemove && (
            <button type="button" onClick={onRemove} className="rounded-sm bg-white/15 px-2.5 py-1 t-caption text-white hover:bg-white/25 transition-colors">{t('remove')}</button>
          )}
        </div>
      </div>
    </div>
  )
}
