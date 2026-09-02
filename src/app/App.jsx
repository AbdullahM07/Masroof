import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Direction } from 'radix-ui'
import { useApp } from '../context/AppContext.jsx'
import { currentMonthStr } from '../lib/format.js'
import { ConfirmProvider } from '../components/Confirm.jsx'
import { TooltipProvider } from '../components/ui/overlay.jsx'
import { Skeleton } from '../components/ui/controls.jsx'
import AuthScreen from '../layout/AuthScreen.jsx'
import Sidebar from '../layout/Sidebar.jsx'
import TopBar from '../layout/TopBar.jsx'
import { BottomTabBar, MobileNavSheet } from '../layout/MobileNav.jsx'
import LockScreen from '../components/LockScreen.jsx'
import Dashboard from '../pages/Dashboard.jsx'

// Every page except the dashboard loads on first visit (keeps the initial bundle small).
const Income = lazy(() => import('../pages/Income.jsx'))
const Expenses = lazy(() => import('../pages/Expenses.jsx'))
const Ledger = lazy(() => import('../pages/Ledger.jsx'))
const Budgets = lazy(() => import('../pages/Budgets.jsx'))
const Goals = lazy(() => import('../pages/Goals.jsx'))
const Cards = lazy(() => import('../pages/Cards.jsx'))
const Settings = lazy(() => import('../pages/Settings.jsx'))
const Accounts = lazy(() => import('../pages/Accounts.jsx'))
const Subscriptions = lazy(() => import('../pages/Subscriptions.jsx'))
const CommandPalette = lazy(() => import('../components/ui/command.jsx').then(m => ({ default: m.CommandPalette })))

const PAGES = {
  dashboard: Dashboard,
  income: Income,
  expenses: Expenses,
  ledger: Ledger,
  subscriptions: Subscriptions,
  budgets: Budgets,
  accounts: Accounts,
  goals: Goals,
  cards: Cards,
  settings: Settings,
}

export default function App() {
  const { locked, locale, dataLoading } = useApp()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  return (
    <Direction.Provider dir={dir}>
      <TooltipProvider delayDuration={250} skipDelayDuration={400}>
        <ConfirmProvider>
          <SignedOut>
            <AuthScreen />
          </SignedOut>
          <SignedIn>
            {dataLoading ? <LoadingShell /> : locked ? <LockScreen /> : <Shell />}
          </SignedIn>
        </ConfirmProvider>
      </TooltipProvider>
    </Direction.Provider>
  )
}

function Shell() {
  const [tab, setTab] = useState('dashboard')
  const [intent, setIntent] = useState(null)
  const [month, setMonth] = useState(currentMonthStr())
  const [navOpen, setNavOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sm_sidebar') === 'rail' } catch { return false }
  })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteMounted, setPaletteMounted] = useState(false)
  const openPalette = useCallback((o = true) => { setPaletteMounted(true); setPaletteOpen(o) }, [])

  // ⌘K / Ctrl+K opens the command palette (loaded on first use).
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(!paletteOpen) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paletteOpen, openPalette])

  useEffect(() => { try { localStorage.setItem('sm_sidebar', collapsed ? 'rail' : 'full') } catch { /* quota */ } }, [collapsed])

  const navigate = useCallback((next, nextIntent = null) => {
    setTab(next)
    setIntent(nextIntent)
    setNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])
  const clearIntent = useCallback(() => setIntent(null), [])

  const Page = PAGES[tab] || Dashboard

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Sidebar tab={tab} navigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <MobileNavSheet open={navOpen} onOpenChange={setNavOpen} tab={tab} navigate={navigate} />

      <div className={collapsed ? 'nav:ps-[var(--rail-w)] transition-[padding] duration-200' : 'nav:ps-[var(--sidebar-w)] transition-[padding] duration-200'}>
        <TopBar
          tab={tab}
          month={month}
          setMonth={setMonth}
          onMenu={() => setNavOpen(true)}
          onSearch={() => openPalette(true)}
        />
        <main className="mx-auto w-full max-w-[1240px] px-4 pb-[calc(var(--tabbar-h)+24px)] pt-4 sm:px-6 sm:pt-6 nav:pb-16 lg:px-8">
          <div key={tab} className="page-enter">
            <Suspense fallback={<PageSkeleton />}>
              <Page setTab={navigate} navigate={navigate} intent={intent} clearIntent={clearIntent} month={month} setMonth={setMonth} />
            </Suspense>
          </div>
        </main>
      </div>

      <BottomTabBar tab={tab} navigate={navigate} onMore={() => setNavOpen(true)} />
      {paletteMounted && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} navigate={navigate} />
        </Suspense>
      )}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]" aria-busy="true">
      <Skeleton className="h-96 rounded-md" />
      <Skeleton className="h-72 rounded-md" />
    </div>
  )
}

// Skeleton of the dashboard while the user's data loads (no spinner in the middle).
function LoadingShell() {
  const { t } = useApp()
  return (
    <div className="min-h-screen bg-canvas" aria-busy="true" aria-label={t('loadingData')}>
      <div className="hidden nav:block fixed inset-y-0 start-0 w-[var(--sidebar-w)] border-e border-line bg-surface p-4">
        <Skeleton className="h-8 w-32 mb-8" />
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 mb-2" />)}
      </div>
      <div className="nav:ps-[var(--sidebar-w)]">
        <div className="h-[var(--topbar-h)] border-b border-line bg-surface px-6 flex items-center"><Skeleton className="h-6 w-40" /></div>
        <div className="mx-auto max-w-[1240px] p-6 flex flex-col gap-5">
          <Skeleton className="h-40 rounded-md" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-md" />
            <Skeleton className="h-64 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
