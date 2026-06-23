import { useRef, useState } from 'react'
import {
  Button, Input, Switch, ToggleButton, Field,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
} from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { Keypad } from '../components/LockScreen.jsx'
import { SelectMenu, MonthField } from '../components/fields.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { DangerButton } from '../components/fluentBits.jsx'
import { Icon } from '../components/icons.jsx'
import { formatDate, currentMonthStr } from '../lib/format.js'
import { buildReportModel, exportExcel, openPdfReport, exportCsv } from '../lib/report.js'

const CURRENCIES = ['EGP', 'USD', 'EUR', 'SAR', 'AED', 'GBP', 'KWD', 'QAR']

export default function Settings() {
  const {
    state, t, theme, locale, currency,
    setSetting, setPin, disablePin, lock, verifyPin,
    exportData, importData, clearAll,
  } = useApp()
  const confirm = useConfirm()
  const toast = useToast()
  const fileRef = useRef(null)
  const [pinFlow, setPinFlow] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [pinGate, setPinGate] = useState(null) // pending action awaiting PIN
  const [rangeMode, setRangeMode] = useState('month') // 'month' | 'range' | 'all'
  const [reportMonth, setReportMonth] = useState(currentMonthStr())
  const [range, setRange] = useState({ from: '', to: '' })
  const [busy, setBusy] = useState(false)

  const pinOn = state.settings.pinEnabled

  // Run `action` immediately, or behind a PIN prompt when a PIN is set.
  function requirePin(action) {
    if (pinOn) setPinGate(() => action)
    else action()
  }

  function reportPeriod() {
    if (rangeMode === 'all') return null
    if (rangeMode === 'range') return { from: range.from, to: range.to }
    return reportMonth
  }
  const reportModel = () => buildReportModel(state, reportPeriod(), { t, currency, locale })
  async function onExcel() {
    try { setBusy(true); await exportExcel(reportModel()) }
    catch { toast(t('importFail'), 'error') }
    finally { setBusy(false) }
  }
  function onPdf() { openPdfReport(reportModel()) }
  function onCsv() { try { exportCsv(reportModel()) } catch { toast(t('importFail'), 'error') } }

  function download(filename, content, type) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportJson() {
    download(`salary-manager-${new Date().toISOString().slice(0, 10)}.json`, exportData(), 'application/json')
  }

  async function onImport(e) {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    const ok = await confirm({ title: t('importJson'), body: t('importWarn'), confirmLabel: t('confirm') })
    if (!ok) { input.value = ''; return }
    const reader = new FileReader()
    reader.onload = () => {
      try { importData(reader.result); toast(t('importOk')) }
      catch { toast(t('importFail'), 'error') }
    }
    reader.readAsText(file)
    input.value = ''
  }

  function doClear() { setClearOpen(true) }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Appearance */}
      <div className="card section">
        <div className="card-title">{t('appearance')}</div>

        <div className="set-row">
          <div><div className="label">{t('theme')}</div></div>
          <div className="row" style={{ gap: 6 }}>
            <ToggleButton appearance="subtle" checked={theme === 'light'} icon={<Icon.sun />} onClick={() => setSetting('theme', 'light')}>{t('light')}</ToggleButton>
            <ToggleButton appearance="subtle" checked={theme === 'dark'} icon={<Icon.moon />} onClick={() => setSetting('theme', 'dark')}>{t('dark')}</ToggleButton>
          </div>
        </div>

        <div className="set-row">
          <div><div className="label">{t('language')}</div></div>
          <div className="row" style={{ gap: 6 }}>
            <ToggleButton appearance="subtle" checked={locale === 'en'} onClick={() => setSetting('locale', 'en')}>English</ToggleButton>
            <ToggleButton appearance="subtle" checked={locale === 'ar'} onClick={() => setSetting('locale', 'ar')}>العربية</ToggleButton>
          </div>
        </div>

        <div className="set-row">
          <div><div className="label">{t('currency')}</div></div>
          <SelectMenu value={currency} onChange={(_, d) => setSetting('currency', d.value)} style={{ minWidth: 120 }}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </SelectMenu>
        </div>

        <div className="set-row">
          <div>
            <div className="label">{t('budgetAlerts')}</div>
            <div className="desc">{t('alertThreshold')} ({t('nearLimit')})</div>
          </div>
          <SelectMenu value={String(state.settings.alertThreshold ?? 80)} onChange={(_, d) => setSetting('alertThreshold', Number(d.value))} style={{ minWidth: 120 }}>
            {[70, 80, 90, 100].map(v => <option key={v} value={v}>{v}%</option>)}
          </SelectMenu>
        </div>
      </div>

      {/* Security */}
      <div className="card section">
        <div className="card-title">{t('security')}</div>
        <div className="set-row">
          <div>
            <div className="label row" style={{ gap: 7 }}><Icon.lock width={16} height={16} /> {t('pinLock')}</div>
            <div className="desc">{t('pinLockDesc')}</div>
          </div>
          <Switch checked={pinOn}
            onChange={(_, d) => { if (d.checked) setPinFlow(true); else disablePin() }} />
        </div>
        {pinOn && (
          <div className="set-row">
            <div><div className="label">{t('changePin')}</div></div>
            <div className="row" style={{ gap: 8 }}>
              <Button appearance="outline" size="small" onClick={() => setPinFlow(true)}>{t('changePin')}</Button>
              <Button appearance="subtle" size="small" onClick={lock}>{t('lockNow')}</Button>
            </div>
          </div>
        )}
      </div>

      {/* Reports */}
      <div className="card section">
        <div className="card-title"><span className="ct-ico"><Icon.receipt /></span>{t('reports')}</div>
        <div className="set-row">
          <div><div className="label">{t('reportRange')}</div></div>
          <SelectMenu value={rangeMode} onChange={(_, d) => setRangeMode(d.value)} style={{ minWidth: 150 }}>
            <option value="month">{t('singleMonth')}</option>
            <option value="range">{t('customRange')}</option>
            <option value="all">{t('allTime')}</option>
          </SelectMenu>
        </div>
        {rangeMode === 'month' && (
          <div className="set-row">
            <div><div className="label">{t('month')}</div></div>
            <MonthField value={reportMonth} onChange={setReportMonth} />
          </div>
        )}
        {rangeMode === 'range' && (
          <div className="set-row">
            <div><div className="label">{t('customRange')}</div></div>
            <div className="row wrap" style={{ gap: 12 }}>
              <label className="ledger-date"><span>{t('dateFrom')}</span>
                <Input type="date" value={range.from} onChange={(_, d) => setRange({ ...range, from: d.value })} /></label>
              <label className="ledger-date"><span>{t('dateTo')}</span>
                <Input type="date" value={range.to} onChange={(_, d) => setRange({ ...range, to: d.value })} /></label>
            </div>
          </div>
        )}
        <div className="row wrap" style={{ gap: 10, marginTop: 6 }}>
          <Button appearance="primary" icon={<Icon.download />} onClick={() => requirePin(onExcel)} disabled={busy}>
            {t('excelReport')}
          </Button>
          <Button appearance="outline" icon={<Icon.receipt />} onClick={() => requirePin(onPdf)}>
            {t('pdfReport')}
          </Button>
          <Button appearance="outline" icon={<Icon.download />} onClick={() => requirePin(onCsv)}>
            {t('csvReport')}
          </Button>
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div className="card-title">{t('dataManagement')}</div>
        <div className="row wrap" style={{ gap: 10 }}>
          <Button appearance="outline" icon={<Icon.download />} onClick={() => requirePin(exportJson)}>{t('exportJson')}</Button>
          <Button appearance="outline" icon={<Icon.upload />} onClick={() => fileRef.current?.click()}>{t('importJson')}</Button>
          <DangerButton icon={<Icon.trash />} onClick={doClear}>{t('clearAll')}</DangerButton>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} className="hide" />
        </div>
        <div className="desc mt-16" style={{ color: 'var(--text-faint)', fontSize: 12 }}>
          {state.income.length + state.expenses.length} {t('transactions').toLowerCase()} · {state.cards.length} {t('cards').toLowerCase()} · {state.goals.length} {t('goals').toLowerCase()}
          {' · '}{formatDate(new Date().toISOString().slice(0, 10), locale)}
        </div>
      </div>

      {pinFlow && <PinSetup onClose={() => setPinFlow(false)} onSet={(pin) => { setPin(pin); setPinFlow(false) }} />}

      <ClearDataDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirmed={() => { clearAll(); setClearOpen(false) }}
        pinEnabled={pinOn}
        verifyPin={verifyPin}
        t={t}
      />

      <PinPromptDialog
        open={!!pinGate}
        prompt={t('enterPinToExport')}
        verifyPin={verifyPin}
        t={t}
        onClose={() => setPinGate(null)}
        onSuccess={() => { const act = pinGate; setPinGate(null); act && act() }}
      />
    </div>
  )
}

// Reusable PIN entry in a Fluent alert Dialog — gates a sensitive action.
function PinPromptDialog({ open, prompt, verifyPin, t, onClose, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function press(d) {
    setError('')
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      if (verifyPin(next)) { setPin(''); onSuccess() }
      else { setError(t('wrongPin')); setTimeout(() => setPin(''), 300) }
    }
  }
  function close() { setPin(''); setError(''); onClose() }

  return (
    <Dialog open={open} modalType="alert" onOpenChange={(_, d) => { if (!d.open) close() }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <span className="row" style={{ gap: 8 }}><Icon.lock width={20} height={20} /> {t('confirmIdentity')}</span>
          </DialogTitle>
          <DialogContent>
            <p style={{ color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>{prompt}</p>
            <div className="pin-dots">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
              ))}
            </div>
            <div className="pin-error" style={{ textAlign: 'center' }}>{error}</div>
            <Keypad onPress={press} onBack={() => { setError(''); setPin(p => p.slice(0, -1)) }} backLabel="⌫" />
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={close}>{t('cancel')}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

// Sensitive: confirm by typing the word, then (if a PIN is set) by entering it.
// Rendered in a Fluent alert Dialog — no native confirm(), no light-dismiss.
function ClearDataDialog({ open, onClose, onConfirmed, pinEnabled, verifyPin, t }) {
  const [step, setStep] = useState('confirm')
  const [typed, setTyped] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const word = t('confirmWord')

  function reset() { setStep('confirm'); setTyped(''); setPin(''); setError('') }
  function close() { reset(); onClose() }
  function finalize() { onConfirmed(); reset() }

  function proceed() {
    if (typed.trim().toLowerCase() !== word.toLowerCase()) return
    if (pinEnabled) setStep('pin')
    else finalize()
  }

  function pressPin(d) {
    setError('')
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      if (verifyPin(next)) finalize()
      else { setError(t('wrongPin')); setTimeout(() => setPin(''), 300) }
    }
  }

  const canDelete = typed.trim().toLowerCase() === word.toLowerCase()

  return (
    <Dialog open={open} modalType="alert" onOpenChange={(_, d) => { if (!d.open) close() }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <span className="row" style={{ gap: 8, color: 'var(--danger)' }}>
              <Icon.alert width={20} height={20} /> {t('clearConfirmTitle')}
            </span>
          </DialogTitle>

          {step === 'confirm' ? (
            <>
              <DialogContent>
                <p style={{ color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{t('clearConfirmBody')}</p>
                <Field label={t('typeToConfirm', { word })}>
                  <Input value={typed} onChange={(_, d) => setTyped(d.value)} placeholder={word} autoComplete="off" />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={close}>{t('cancel')}</Button>
                <DangerButton disabled={!canDelete} icon={<Icon.trash />} onClick={proceed}>
                  {pinEnabled ? t('continueAction') : t('deleteEverything')}
                </DangerButton>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogContent>
                <p style={{ color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>{t('enterPinToConfirm')}</p>
                <div className="pin-dots">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
                  ))}
                </div>
                <div className="pin-error" style={{ textAlign: 'center' }}>{error}</div>
                <Keypad onPress={pressPin} onBack={() => { setError(''); setPin(p => p.slice(0, -1)) }} backLabel="⌫" />
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={close}>{t('cancel')}</Button>
              </DialogActions>
            </>
          )}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

// Two-step PIN creation overlay (enter → confirm).
function PinSetup({ onClose, onSet }) {
  const { t } = useApp()
  const [first, setFirst] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const stage = first ? 'confirm' : 'set'

  function press(d) {
    setError('')
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      if (stage === 'set') {
        setFirst(next); setPin('')
      } else {
        if (next === first) onSet(next)
        else { setError(t('pinMismatch')); setTimeout(() => { setPin(''); setFirst(''); }, 350) }
      }
    }
  }

  return (
    <div className="lock-screen" style={{ position: 'fixed', inset: 0, zIndex: 500 }} onClick={onClose}>
      <div className="lock-box" onClick={(e) => e.stopPropagation()}>
        <div className="lock-logo"><Icon.lock width={28} height={28} /></div>
        <h2>{stage === 'set' ? t('setPin') : t('confirmPin')}</h2>
        <div className="pin-dots">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>
        <div className="pin-error">{error}</div>
        <Keypad onPress={press} onBack={() => setPin(p => p.slice(0, -1))} />
        <div className="lock-reset"><Button appearance="transparent" size="small" onClick={onClose}>{t('cancel')}</Button></div>
      </div>
    </div>
  )
}
