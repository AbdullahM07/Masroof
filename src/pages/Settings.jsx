import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Keypad, PinDots, PinError } from '../components/LockScreen.jsx'
import { SelectMenu, MonthField } from '../components/fields.jsx'
import { useConfirm, useToast } from '../components/Confirm.jsx'
import { Icon } from '../components/icons.jsx'
import { Card, CardTitle, Button, Input, Field, Switch, Segmented, Dialog, DialogContent, DialogFooter, Stack } from '../components/ui/index.jsx'
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
    download(`masroof-${new Date().toISOString().slice(0, 10)}.json`, exportData(), 'application/json')
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

  return (
    <Stack className="max-w-[760px]">
      {/* Appearance */}
      <Card>
        <CardTitle icon={<Icon.sun size={18} />}>{t('appearance')}</CardTitle>
        <div className="divide-y divide-line">
          <SettingRow label={t('theme')}>
            <Segmented value={theme} onValueChange={(v) => setSetting('theme', v)} aria-label={t('theme')}
              options={[
                { value: 'light', label: t('light'), icon: <Icon.sun size={14} /> },
                { value: 'dark', label: t('dark'), icon: <Icon.moon size={14} /> },
              ]} />
          </SettingRow>
          <SettingRow label={t('language')}>
            <Segmented value={locale} onValueChange={(v) => setSetting('locale', v)} aria-label={t('language')}
              options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
          </SettingRow>
          <SettingRow label={t('currency')}>
            <SelectMenu value={currency} onChange={(v) => setSetting('currency', v)} className="w-32">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </SelectMenu>
          </SettingRow>
          <SettingRow label={t('budgetAlerts')} desc={`${t('alertThreshold')} (${t('nearLimit')})`}>
            <SelectMenu value={String(state.settings.alertThreshold ?? 80)} onChange={(v) => setSetting('alertThreshold', Number(v))} className="w-32">
              {[70, 80, 90, 100].map(v => <option key={v} value={v}>{v}%</option>)}
            </SelectMenu>
          </SettingRow>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardTitle icon={<Icon.lock size={18} />}>{t('security')}</CardTitle>
        <div className="divide-y divide-line">
          <SettingRow label={t('pinLock')} desc={t('pinLockDesc')}>
            <Switch checked={pinOn} onCheckedChange={(on) => { if (on) setPinFlow(true); else disablePin() }} />
          </SettingRow>
          {pinOn && (
            <SettingRow label={t('changePin')}>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPinFlow(true)}>{t('changePin')}</Button>
                <Button variant="ghost" size="sm" icon={<Icon.lock size={14} />} onClick={lock}>{t('lockNow')}</Button>
              </div>
            </SettingRow>
          )}
        </div>
      </Card>

      {/* Reports */}
      <Card>
        <CardTitle icon={<Icon.pdf size={18} />}>{t('reports')}</CardTitle>
        <div className="divide-y divide-line">
          <SettingRow label={t('reportRange')}>
            <Segmented value={rangeMode} onValueChange={setRangeMode} aria-label={t('reportRange')}
              options={[{ value: 'month', label: t('singleMonth') }, { value: 'range', label: t('customRange') }, { value: 'all', label: t('allTime') }]} />
          </SettingRow>
          {rangeMode === 'month' && (
            <SettingRow label={t('month')}>
              <MonthField value={reportMonth} onChange={setReportMonth} />
            </SettingRow>
          )}
          {rangeMode === 'range' && (
            <SettingRow label={t('customRange')}>
              <div className="flex flex-wrap gap-2">
                <Field label={t('dateFrom')}><Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="w-40" /></Field>
                <Field label={t('dateTo')}><Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="w-40" /></Field>
              </div>
            </SettingRow>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" icon={<Icon.excel size={16} />} onClick={() => requirePin(onExcel)} loading={busy}>{t('excelReport')}</Button>
          <Button variant="secondary" icon={<Icon.pdf size={16} />} onClick={() => requirePin(onPdf)}>{t('pdfReport')}</Button>
          <Button variant="secondary" icon={<Icon.download size={16} />} onClick={() => requirePin(onCsv)}>{t('csvReport')}</Button>
        </div>
      </Card>

      {/* Data */}
      <Card>
        <CardTitle icon={<Icon.forecast size={18} />}>{t('dataManagement')}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Icon.download size={16} />} onClick={() => requirePin(exportJson)}>{t('exportJson')}</Button>
          <Button variant="secondary" icon={<Icon.upload size={16} />} onClick={() => fileRef.current?.click()}>{t('importJson')}</Button>
          <Button variant="destructiveGhost" icon={<Icon.trash size={16} />} onClick={() => setClearOpen(true)} className="border border-negative/30">{t('clearAll')}</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} className="hidden" />
        </div>
        <p className="mt-4 t-caption text-ink-3 font-normal num-soft">
          {state.income.length + state.expenses.length} {t('transactions').toLowerCase()} · {state.cards.length} {t('cards').toLowerCase()} · {state.goals.length} {t('goals').toLowerCase()}
          {' · '}{formatDate(new Date().toISOString().slice(0, 10), locale)}
        </p>
      </Card>

      <PinSetup open={pinFlow} onClose={() => setPinFlow(false)} onSet={(pin) => { setPin(pin); setPinFlow(false); toast(t('pinSet')) }} />

      <ClearDataDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirmed={() => { clearAll(); setClearOpen(false); toast(t('deletedDone'), 'info') }}
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
    </Stack>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0 max-w-[36ch]">
        <div className="font-medium text-ink">{label}</div>
        {desc && <div className="t-small text-ink-2 mt-0.5">{desc}</div>}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

// Reusable PIN entry in an alert dialog — gates a sensitive action.
function PinPromptDialog({ open, prompt, verifyPin, t, onClose, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function press(d) {
    setError('')
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      if (verifyPin(next)) { setPin(''); onSuccess() }
      else { setError(t('wrongPin')); setPin('') }
    }
  }
  function close() { setPin(''); setError(''); onClose() }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent alert hideClose className="max-w-sm text-center" title={<span className="inline-flex items-center gap-2"><Icon.lock size={18} />{t('confirmIdentity')}</span>} description={prompt}>
        <PinDots count={pin.length} error={!!error} className="mt-6" />
        <PinError>{error}</PinError>
        <Keypad onPress={press} onBack={() => { setError(''); setPin(p => p.slice(0, -1)) }} />
        <DialogFooter className="justify-center">
          <Button variant="ghost" onClick={close}>{t('cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Sensitive: confirm by typing the word, then (if a PIN is set) by entering it.
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
      else { setError(t('wrongPin')); setPin('') }
    }
  }

  const canDelete = typed.trim().toLowerCase() === word.toLowerCase()

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent alert hideClose className="max-w-md"
        title={<span className="inline-flex items-center gap-2 text-negative"><Icon.alert size={18} />{t('clearConfirmTitle')}</span>}
        description={step === 'confirm' ? t('clearConfirmBody') : t('enterPinToConfirm')}>
        {step === 'confirm' ? (
          <>
            <Field label={t('typeToConfirm', { word })} className="mt-5">
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={word} autoComplete="off" autoFocus />
            </Field>
            <DialogFooter>
              <Button variant="secondary" onClick={close}>{t('cancel')}</Button>
              <Button variant="destructive" disabled={!canDelete} icon={<Icon.trash size={16} />} onClick={proceed}>
                {pinEnabled ? t('continueAction') : t('deleteEverything')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center">
            <PinDots count={pin.length} error={!!error} className="mt-6" />
            <PinError>{error}</PinError>
            <Keypad onPress={pressPin} onBack={() => { setError(''); setPin(p => p.slice(0, -1)) }} />
            <DialogFooter className="justify-center">
              <Button variant="ghost" onClick={close}>{t('cancel')}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Two-step PIN creation (enter → confirm).
function PinSetup({ open, onClose, onSet }) {
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
        if (next === first) { onSet(next); setFirst(''); setPin('') }
        else { setError(t('pinMismatch')); setPin(''); setFirst('') }
      }
    }
  }
  function close() { setFirst(''); setPin(''); setError(''); onClose() }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent alert hideClose className="max-w-sm text-center" title={<span className="inline-flex items-center gap-2"><Icon.lock size={18} />{stage === 'set' ? t('setPin') : t('confirmPin')}</span>} description={t('pinLockDesc')}>
        <PinDots count={pin.length} error={!!error} className="mt-6" />
        <PinError>{error}</PinError>
        <Keypad onPress={press} onBack={() => setPin(p => p.slice(0, -1))} />
        <DialogFooter className="justify-center">
          <Button variant="ghost" onClick={close}>{t('cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
