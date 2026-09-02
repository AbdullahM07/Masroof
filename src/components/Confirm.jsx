// App-wide replacement for the browser-native confirm()/alert() dialogs. Exposes:
//   const confirm = useConfirm()  →  await confirm({ title, body, danger, confirmLabel }) → boolean
//   const toast   = useToast()    →  toast('Saved', 'success' | 'error' | 'info')
import { Suspense, createContext, lazy, useCallback, useContext, useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Icon } from './icons.jsx'
import { Button } from './ui/button.jsx'
import { Dialog, DialogContent, DialogFooter } from './ui/overlay.jsx'

// Sonner only matters after a user action, so it stays off the initial bundle.
const loadSonner = () => import('sonner')
const Toaster = lazy(() => loadSonner().then(m => ({ default: m.Toaster })))

const Ctx = createContext(null)

export function useConfirm() { return useContext(Ctx).confirm }
export function useToast() { return useContext(Ctx).toast }

export function ConfirmProvider({ children }) {
  const { t, theme, locale } = useApp()
  const [dlg, setDlg] = useState(null) // { title, body, danger, confirmLabel, resolve }
  const [toasterReady, setToasterReady] = useState(false)
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 800))
    const id = idle(() => setToasterReady(true))
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])

  const confirm = useCallback((opts = {}) => new Promise((resolve) => {
    // If a dialog is somehow already open, settle its promise (cancelled) so its
    // awaiter never hangs, then show the new one.
    setDlg(prev => { prev?.resolve(false); return { ...opts, resolve } })
  }), [])

  const toast = useCallback((message, intent = 'success') => {
    setToasterReady(true)
    loadSonner().then(({ toast: sonner }) => {
      const fn = intent === 'error' ? sonner.error : intent === 'info' ? sonner.info : intent === 'warning' ? sonner.warning : sonner.success
      fn(message)
    })
  }, [])

  function settle(result) {
    setDlg(d => { d?.resolve(result); return null })
  }

  const danger = dlg?.danger
  const confirmLabel = dlg?.confirmLabel || (danger ? t('delete') : t('confirm'))

  return (
    <Ctx.Provider value={{ confirm, toast }}>
      {children}
      {toasterReady && (
      <Suspense fallback={null}>
      <Toaster
        theme={theme === 'dark' ? 'dark' : 'light'}
        position={locale === 'ar' ? 'top-left' : 'top-right'}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        offset={16}
        gap={8}
        duration={3200}
        icons={{
          success: <Icon.checkCircle size={16} className="text-positive" />,
          error: <Icon.alertCircle size={16} className="text-negative" />,
          warning: <Icon.alert size={16} className="text-warning" />,
          info: <Icon.info size={16} className="text-accent-ink" />,
        }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'flex items-center gap-2.5 w-[356px] max-w-[calc(100vw-32px)] rounded-md border border-line bg-surface px-3.5 py-3 shadow-float text-ink text-[13.5px] font-medium',
            title: 'font-medium',
            description: 't-small text-ink-2 font-normal',
            icon: 'shrink-0 inline-flex',
          },
        }}
      />
      </Suspense>
      )}
      <Dialog open={!!dlg} onOpenChange={(o) => { if (!o) settle(false) }}>
        <DialogContent
          alert
          hideClose
          title={(
            <span className={danger ? 'inline-flex items-center gap-2 text-negative' : undefined}>
              {danger && <Icon.alert size={18} />}
              {dlg?.title || t('confirm')}
            </span>
          )}
          description={dlg?.body}
        >
          <DialogFooter>
            <Button variant="secondary" onClick={() => settle(false)}>{t('cancel')}</Button>
            <Button variant={danger ? 'destructive' : 'primary'} icon={danger ? <Icon.trash size={16} /> : undefined} onClick={() => settle(true)} autoFocus>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  )
}
