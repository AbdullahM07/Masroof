import { Button, Tooltip } from '@fluentui/react-components'
import { UserButton } from '@clerk/clerk-react'
import { useApp } from '../context/AppContext.jsx'
import { Icon } from './icons.jsx'

function SyncBadge({ status, t }) {
  const map = {
    saving: { cls: 'syncing', label: t('syncSaving'), icon: <Icon.repeat width={13} height={13} /> },
    offline: { cls: 'offline', label: t('syncOffline'), icon: <Icon.alert width={13} height={13} /> },
    saved: { cls: 'saved', label: t('syncSaved'), icon: <Icon.check width={13} height={13} /> },
  }
  const s = map[status] || map.saved
  return <span className={`sync-badge ${s.cls}`} title={s.label}>{s.icon}<span className="sync-cap">{s.label}</span></span>
}

function greeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('greetingMorning')
  if (h < 18) return t('greetingDay')
  return t('greetingEvening')
}

export default function TopBar({ tab, onMenu }) {
  const { t, theme, locale, toggleTheme, toggleLocale, lock, state, syncStatus } = useApp()
  const pinOn = state?.settings?.pinEnabled
  const Sub = tab === 'dashboard' ? greeting(t) : t('appTagline')

  return (
    <header className="topbar">
      <div className="row">
        <Button className="menu-btn" appearance="subtle" icon={<Icon.menu />} onClick={onMenu} aria-label="menu" />
        <div className="topbar-titles">
          <h1>{t(tab)}</h1>
          <p>{Sub}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <SyncBadge status={syncStatus} t={t} />
        <Tooltip content={t('language')} relationship="label" positioning="below">
          <Button appearance="outline" onClick={toggleLocale}>
            {locale === 'ar' ? 'EN' : 'ع'}
          </Button>
        </Tooltip>
        <Tooltip content={t('theme')} relationship="label" positioning="below">
          <Button appearance="subtle" icon={theme === 'dark' ? <Icon.sun /> : <Icon.moon />} onClick={toggleTheme} aria-label="theme" />
        </Tooltip>
        {pinOn && (
          <Tooltip content={t('lockNow')} relationship="label" positioning="below">
            <Button appearance="subtle" icon={<Icon.lock />} onClick={lock} aria-label="lock" />
          </Tooltip>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
