import { UserButton } from '@clerk/clerk-react'
import { useApp } from '../context/AppContext.jsx'
import { cn } from '../lib/utils.js'
import { Icon } from '../components/icons.jsx'
import { IconButton, Button } from '../components/ui/button.jsx'
import { Tooltip } from '../components/ui/overlay.jsx'
import { MonthField } from '../components/fields.jsx'
// Pages whose content is scoped to the month shown in the top bar.
export const MONTHLY_PAGES = ['dashboard', 'budgets']

function SyncBadge({ status, t }) {
  const map = {
    saving: { cls: 'text-ink-3', label: t('syncSaving'), icon: <Icon.refresh size={14} className="animate-spin [animation-duration:1.4s]" /> },
    offline: { cls: 'text-warning', label: t('syncOffline'), icon: <Icon.cloudOff size={14} /> },
    saved: { cls: 'text-ink-3', label: t('syncSaved'), icon: <Icon.cloudOk size={14} /> },
  }
  const s = map[status] || map.saved
  return (
    <Tooltip content={s.label} side="bottom">
      <span className={cn('inline-flex h-8 items-center gap-1.5 rounded-sm px-2 t-caption', s.cls)} role="status" aria-live="polite">
        {s.icon}<span className="hidden md:inline">{s.label}</span>
      </span>
    </Tooltip>
  )
}

function greeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('greetingMorning')
  if (h < 18) return t('greetingDay')
  return t('greetingEvening')
}

export default function TopBar({ tab, month, setMonth, onMenu, onSearch }) {
  const { t, theme, locale, toggleTheme, toggleLocale, lock, state, syncStatus } = useApp()
  const pinOn = state?.settings?.pinEnabled
  const sub = tab === 'dashboard' ? greeting(t) : t('appTagline')
  const monthly = MONTHLY_PAGES.includes(tab)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
    <div className="flex h-[var(--topbar-h)] items-center gap-2 px-4 sm:px-6 lg:px-8">
      <IconButton label="Menu" onClick={onMenu} className="nav:hidden -ms-2 text-ink-2">
        <Icon.menu size={20} />
      </IconButton>

      <div className="min-w-0 flex-1">
        <h1 className="t-h1 truncate text-[18px] leading-6 sm:text-[20px]">{t(tab)}</h1>
        <p className="t-caption text-ink-3 hidden sm:block truncate">{sub}</p>
      </div>

      {monthly && <MonthField value={month} onChange={setMonth} size="sm" className="max-sm:hidden" />}

      <div className="flex items-center gap-0.5 sm:gap-1">
        <Tooltip content="⌘K" side="bottom">
          <Button variant="ghost" size="iconSm" aria-label={t('searchTx')} onClick={onSearch} className="text-ink-2">
            <Icon.search size={18} />
          </Button>
        </Tooltip>
        <SyncBadge status={syncStatus} t={t} />
        <Tooltip content={t('language')} side="bottom">
          <Button variant="ghost" size="iconSm" onClick={toggleLocale} aria-label={t('language')} className="text-ink-2 font-semibold text-[13px]">
            {locale === 'ar' ? 'EN' : 'ع'}
          </Button>
        </Tooltip>
        <Tooltip content={t('theme')} side="bottom">
          <Button variant="ghost" size="iconSm" onClick={toggleTheme} aria-label={t('theme')} className="text-ink-2">
            {theme === 'dark' ? <Icon.sun size={18} /> : <Icon.moon size={18} />}
          </Button>
        </Tooltip>
        {pinOn && (
          <Tooltip content={t('lockNow')} side="bottom">
            <Button variant="ghost" size="iconSm" onClick={lock} aria-label={t('lockNow')} className="text-ink-2">
              <Icon.lock size={18} />
            </Button>
          </Tooltip>
        )}
        <div className="ms-1.5 flex items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
      {monthly && (
        <div className="sm:hidden border-t border-line px-4 py-2">
          <MonthField value={month} onChange={setMonth} size="sm" className="w-full" />
        </div>
      )}
    </header>
  )
}
