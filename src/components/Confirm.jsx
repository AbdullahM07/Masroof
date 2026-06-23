// App-wide replacement for the browser-native confirm()/alert() dialogs (which
// gray out the whole page and can't be themed). Exposes:
//   const confirm = useConfirm()  →  await confirm({ title, body, danger })  → boolean
//   const toast   = useToast()    →  toast('Saved', 'success')
// Both render inside the FluentProvider, so they follow the design system.
import { createContext, useCallback, useContext, useState } from 'react'
import {
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Button, Toaster, Toast, ToastTitle, useToastController, useId,
} from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { DangerButton } from './fluentBits.jsx'
import { Icon } from './icons.jsx'

const Ctx = createContext(null)

export function useConfirm() { return useContext(Ctx).confirm }
export function useToast() { return useContext(Ctx).toast }

export function ConfirmProvider({ children }) {
  const { t } = useApp()
  const [dlg, setDlg] = useState(null) // { title, body, danger, confirmLabel, resolve }
  const toasterId = useId('toaster')
  const { dispatchToast } = useToastController(toasterId)

  const confirm = useCallback((opts = {}) => new Promise((resolve) => {
    // If a dialog is somehow already open, settle its promise (cancelled) so its
    // awaiter never hangs, then show the new one.
    setDlg(prev => { prev?.resolve(false); return { ...opts, resolve } })
  }), [])

  const toast = useCallback((message, intent = 'success') => {
    dispatchToast(<Toast><ToastTitle>{message}</ToastTitle></Toast>, { intent, position: 'top-end' })
  }, [dispatchToast])

  function settle(result) {
    setDlg(d => { d?.resolve(result); return null })
  }

  const danger = dlg?.danger
  const confirmLabel = dlg?.confirmLabel || (danger ? t('delete') : t('confirm'))

  return (
    <Ctx.Provider value={{ confirm, toast }}>
      {children}
      <Toaster toasterId={toasterId} />
      <Dialog open={!!dlg} modalType="alert" onOpenChange={(_, d) => { if (!d.open) settle(false) }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <span className="row" style={{ gap: 8, color: danger ? 'var(--danger)' : undefined }}>
                {danger && <Icon.alert width={20} height={20} />}
                {dlg?.title || t('confirm')}
              </span>
            </DialogTitle>
            <DialogContent>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{dlg?.body}</p>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => settle(false)}>{t('cancel')}</Button>
              {danger
                ? <DangerButton icon={<Icon.trash />} onClick={() => settle(true)}>{confirmLabel}</DangerButton>
                : <Button appearance="primary" onClick={() => settle(true)}>{confirmLabel}</Button>}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Ctx.Provider>
  )
}
