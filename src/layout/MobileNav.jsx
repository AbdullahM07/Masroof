import { useApp } from '../context/AppContext.jsx'
import { cn } from '../lib/utils.js'
import { Icon } from '../components/icons.jsx'
import { Dialog, SheetContent } from '../components/ui/overlay.jsx'
import { NAV_TABS } from './Sidebar.jsx'
import { Wordmark } from './Wordmark.jsx'

const PRIMARY = ['dashboard', 'expenses', 'income', 'ledger', 'budgets']

// Bottom tab bar (mobile) for the five most-used pages.
export function BottomTabBar({ tab, navigate }) {
  const { t } = useApp()
  return (
    <nav
      className="nav:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid h-[var(--tabbar-h)] grid-cols-5">
        {PRIMARY.map(key => {
          const Glyph = Icon[key]
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(key)}
              aria-current={active ? 'page' : undefined}
              className={cn('flex flex-col items-center justify-center gap-1 t-caption transition-colors', active ? 'text-accent-ink' : 'text-ink-3')}
            >
              <span className={cn('inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors', active && 'bg-accent-soft')}>
                <Glyph size={20} strokeWidth={active ? 2 : 1.75} />
              </span>
              <span className="truncate max-w-[68px]">{t(key === 'ledger' ? 'transactions' : key)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Sheet with every page (mobile "more" menu).
export function MobileNavSheet({ open, onOpenChange, tab, navigate }) {
  const { t, theme, toggleTheme, locale, toggleLocale } = useApp()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent side="start" closeLabel={t('cancel')}>
        <div className="flex h-[var(--topbar-h)] items-center border-b border-line px-5"><Wordmark /></div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV_TABS.map(key => {
            const Glyph = Icon[key]
            const active = tab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(key)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-10 items-center gap-3 rounded-sm px-3 text-[14px] font-medium transition-colors',
                  active ? 'bg-accent-soft text-accent-ink' : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
                )}
              >
                <Glyph size={18} className={active ? 'text-accent-ink' : 'text-ink-3'} />
                {t(key)}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto flex gap-2 border-t border-line p-3">
          <button type="button" onClick={toggleTheme} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm bg-surface-3 t-small font-medium text-ink-2">
            {theme === 'dark' ? <Icon.sun size={16} /> : <Icon.moon size={16} />}{t('theme')}
          </button>
          <button type="button" onClick={toggleLocale} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm bg-surface-3 t-small font-medium text-ink-2">
            <Icon.languages size={16} />{locale === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </SheetContent>
    </Dialog>
  )
}
