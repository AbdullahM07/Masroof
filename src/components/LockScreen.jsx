import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { cn } from '../lib/utils.js'
import { useConfirm } from './Confirm.jsx'
import { Icon } from './icons.jsx'
import { Button } from './ui/button.jsx'
import { Mark } from '../layout/Wordmark.jsx'

const LEN = 4

// Unlock-only screen: a PIN already exists (enabling/changing happens in Settings).
export default function LockScreen() {
  const { t, verifyPin, unlock, clearAll } = useApp()
  const confirm = useConfirm()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function press(d) {
    setError('')
    const next = (pin + d).slice(0, LEN)
    setPin(next)
    if (next.length === LEN) {
      if (verifyPin(next)) {
        unlock()
      } else {
        setError(t('wrongPin'))
        setPin('')
      }
    }
  }

  async function reset() {
    if (await confirm({ title: t('forgotPin'), body: t('clearWarn'), danger: true, confirmLabel: t('delete') }))
      clearAll()
  }

  return (
    <div className="min-h-screen bg-canvas grid place-items-center p-6">
      <div className="w-full max-w-[340px] card p-7 text-center page-enter">
        <div className="flex items-center justify-center gap-2 text-ink-3 mb-6"><Mark size={22} /><span className="t-small font-medium">{t('appName')}</span></div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink"><Icon.lock size={22} /></span>
        <h2 className="t-h2 mt-4">{t('enterPin')}</h2>
        <PinDots count={pin.length} error={!!error} className="mt-6" />
        <PinError>{error}</PinError>
        <Keypad onPress={press} onBack={() => { setError(''); setPin(p => p.slice(0, -1)) }} />
        <Button variant="link" size="sm" onClick={reset} className="mt-5 text-ink-3 hover:text-negative">{t('forgotPin')}</Button>
      </div>
    </div>
  )
}

export function PinDots({ count, error, className }) {
  return (
    <div className={cn('flex justify-center gap-3', error && 'shake', className)} aria-live="polite">
      {Array.from({ length: LEN }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-3 w-3 rounded-full border-2 transition-[background-color,transform,border-color] duration-150',
            i < count ? 'scale-110 border-accent bg-accent' : 'border-line-strong bg-transparent',
            error && (i < count ? 'border-negative bg-negative' : 'border-negative'),
          )}
        />
      ))}
    </div>
  )
}

export function PinError({ children }) {
  return <div className="mt-3 min-h-5 t-small font-medium text-negative" role="alert">{children}</div>
}

export function Keypad({ onPress, onBack }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  const cls = 'h-14 rounded-md bg-surface-2 text-[20px] font-medium num-soft text-ink hover:bg-surface-3 active:scale-[0.97] transition-[background-color,transform] duration-100'
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {keys.map(n => <button key={n} type="button" className={cls} onClick={() => onPress(n)}>{n}</button>)}
      <span />
      <button type="button" className={cls} onClick={() => onPress('0')}>0</button>
      <button type="button" className={cn(cls, 'text-ink-3 flex items-center justify-center')} onClick={onBack} aria-label="backspace">
        <Icon.backspace size={22} className="rtl:rotate-180" />
      </button>
    </div>
  )
}
