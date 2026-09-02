import { useApp } from '../context/AppContext.jsx'
import { cn } from '../lib/utils.js'
import { Icon } from '../components/icons.jsx'
import { Tooltip } from '../components/ui/overlay.jsx'
import { Wordmark } from './Wordmark.jsx'

export const NAV_TABS = ['dashboard', 'income', 'expenses', 'ledger', 'subscriptions', 'budgets', 'accounts', 'goals', 'cards', 'settings']

// Desktop sidebar: 240px, collapsible to a 64px icon rail. Hidden below the
// `nav` breakpoint (mobile uses the bottom tab bar + sheet).
export default function Sidebar({ tab, navigate, collapsed, onToggle }) {
  const { t, locale } = useApp()
  const tipSide = locale === 'ar' ? 'left' : 'right'
  return (
    <aside
      className={cn(
        'hidden nav:flex fixed inset-y-0 start-0 z-40 flex-col border-e border-line bg-surface transition-[width] duration-200 ease-out-soft',
        collapsed ? 'w-[var(--rail-w)]' : 'w-[var(--sidebar-w)]',
      )}
      aria-label="Primary"
    >
      <div className={cn('flex h-[var(--topbar-h)] items-center border-b border-line', collapsed ? 'justify-center px-0' : 'px-5')}>
        <Wordmark compact={collapsed} />
      </div>

      <nav className={cn('flex flex-1 flex-col gap-0.5 py-3', collapsed ? 'px-2.5' : 'px-3')}>
        {NAV_TABS.map(key => {
          const Glyph = Icon[key]
          const active = tab === key
          const item = (
            <button
              key={key}
              type="button"
              onClick={() => navigate(key)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-9 items-center gap-3 rounded-sm text-[13.5px] font-medium transition-colors duration-100',
                collapsed ? 'justify-center px-0' : 'px-3',
                active ? 'bg-accent-soft text-accent-ink' : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
              )}
            >
              <Glyph size={18} className={cn('shrink-0', active ? 'text-accent-ink' : 'text-ink-3')} />
              {!collapsed && <span className="truncate">{t(key)}</span>}
            </button>
          )
          return collapsed ? <Tooltip key={key} content={t(key)} side={tipSide} align="center">{item}</Tooltip> : item
        })}
      </nav>

      <div className={cn('border-t border-line p-3', collapsed && 'px-2.5')}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn('flex h-9 w-full items-center gap-3 rounded-sm text-ink-3 hover:bg-surface-3 hover:text-ink transition-colors', collapsed ? 'justify-center' : 'px-3')}
        >
          {collapsed
            ? <Icon.panelOpen size={18} className="rtl:rotate-180" />
            : <><Icon.panelClose size={18} className="rtl:rotate-180" /><span className="t-caption text-ink-3">{t('appName')} · {t('appTagline')}</span></>}
        </button>
      </div>
    </aside>
  )
}
