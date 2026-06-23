import { Tab, TabList } from '@fluentui/react-components'
import { useApp } from '../context/AppContext.jsx'
import { Icon } from './icons.jsx'

const TABS = ['dashboard', 'income', 'expenses', 'ledger', 'subscriptions', 'budgets', 'accounts', 'goals', 'cards', 'settings']

export default function Sidebar({ tab, setTab }) {
  const { t } = useApp()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo"><Icon.wallet width={30} height={30} /></div>
        <div className="brand-text">
          <span className="brand-name">{t('appName')}</span>
          <span className="brand-sub">{t('appTagline')}</span>
        </div>
      </div>

      <TabList
        className="sidebar-nav"
        vertical
        size="large"
        selectedValue={tab}
        onTabSelect={(_, d) => setTab(d.value)}
      >
        {TABS.map(key => {
          const Glyph = Icon[key]
          return (
            <Tab key={key} value={key} icon={<Glyph />}>{t(key)}</Tab>
          )
        })}
      </TabList>
    </aside>
  )
}
