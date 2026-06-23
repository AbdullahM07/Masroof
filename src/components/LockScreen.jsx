import { useState } from 'react'
import { Button, makeStyles, tokens } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { useConfirm } from './Confirm.jsx'
import { Icon } from './icons.jsx'

const LEN = 4

const useKeyStyles = makeStyles({
  key: {
    width: '100%',
    minWidth: 0,
    height: '56px',
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
})

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
        setTimeout(() => setPin(''), 300)
      }
    }
  }

  async function reset() {
    if (await confirm({ title: t('forgotPin'), body: t('clearWarn'), danger: true, confirmLabel: t('delete') }))
      clearAll()
  }

  return (
    <div className="lock-screen">
      <div className="lock-box">
        <div className="lock-logo"><Icon.lock width={28} height={28} /></div>
        <h2>{t('enterPin')}</h2>
        <p className="sub">{t('appName')}</p>

        <div className="pin-dots">
          {Array.from({ length: LEN }).map((_, i) => (
            <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>
        <div className="pin-error">{error}</div>

        <Keypad onPress={press} onBack={() => { setError(''); setPin(p => p.slice(0, -1)) }} backLabel="⌫" />

        <div className="lock-reset">
          <Button appearance="transparent" size="small" onClick={reset}>{t('forgotPin')}</Button>
        </div>
      </div>
    </div>
  )
}

export function Keypad({ onPress, onBack, backLabel = '⌫' }) {
  const s = useKeyStyles()
  return (
    <div className="keypad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <Button key={n} appearance="subtle" className={s.key} onClick={() => onPress(String(n))}>{n}</Button>
      ))}
      <span />
      <Button appearance="subtle" className={s.key} onClick={() => onPress('0')}>0</Button>
      <Button appearance="subtle" className={s.key} onClick={onBack} aria-label="backspace">{backLabel}</Button>
    </div>
  )
}
