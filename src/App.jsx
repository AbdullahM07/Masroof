import { useState } from 'react'
import { FluentProvider, webLightTheme, webDarkTheme, Spinner } from '@fluentui/react-components'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { useApp } from './context/AppContext.jsx'
import { ConfirmProvider } from './components/Confirm.jsx'
import AuthScreen from './components/AuthScreen.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import LockScreen from './components/LockScreen.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Income from './pages/Income.jsx'
import Expenses from './pages/Expenses.jsx'
import Ledger from './pages/Ledger.jsx'
import Budgets from './pages/Budgets.jsx'
import Goals from './pages/Goals.jsx'
import Cards from './pages/Cards.jsx'
import Settings from './pages/Settings.jsx'
import Accounts from './pages/Accounts.jsx'
import Subscriptions from './pages/Subscriptions.jsx'

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
  const { locked, theme, locale, dataLoading, t } = useApp()
  const [tab, setTab] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)

  const fluentTheme = theme === 'dark' ? webDarkTheme : webLightTheme
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const Page = PAGES[tab] || Dashboard

  return (
    <FluentProvider theme={fluentTheme} dir={dir} className="fp-root">
      <ConfirmProvider>
        <SignedOut>
          <AuthScreen />
        </SignedOut>
        <SignedIn>
          {dataLoading ? (
            <div className="app-loading"><Spinner label={t('loadingData')} /></div>
          ) : locked ? (
            <LockScreen />
          ) : (
            <div className={`app ${navOpen ? 'nav-open' : ''}`}>
              <Sidebar tab={tab} setTab={(t) => { setTab(t); setNavOpen(false) }} />
              <div className="nav-scrim" onClick={() => setNavOpen(false)} />
              <main className="main-content">
                <TopBar tab={tab} onMenu={() => setNavOpen(o => !o)} />
                <div className="page-body">
                  <Page setTab={setTab} />
                </div>
              </main>
            </div>
          )}
        </SignedIn>
      </ConfirmProvider>
    </FluentProvider>
  )
}
