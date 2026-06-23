import { SignIn } from '@clerk/clerk-react'
import { useApp } from '../context/AppContext.jsx'
import { Icon, CategoryIcon } from './icons.jsx'
import { RingGauge } from './ui.jsx'

// Signed-out landing page: marketing hero + animated preview on one side,
// Clerk sign-in / sign-up on the other.
export default function AuthScreen() {
  const { t, locale, toggleLocale } = useApp()

  const feats = [
    { icon: <Icon.ledger />, label: t('heroFeatTrack') },
    { icon: <Icon.budgets />, label: t('heroFeatBudget') },
    { icon: <Icon.gauge />, label: t('heroFeatInsights') },
    { icon: <Icon.shield />, label: t('heroFeatSync') },
  ]

  return (
    <div className="landing">
      <button className="landing-lang" onClick={toggleLocale} aria-label="language">
        {locale === 'ar' ? 'EN' : 'ع'}
      </button>

      <section className="landing-hero">
        <div className="landing-brand">
          <span className="landing-logo"><Icon.wallet width={30} height={30} /></span>
          <span className="landing-name">{t('appName')}</span>
        </div>

        <h1 className="landing-title">{t('heroTitle')}</h1>
        <p className="landing-sub">{t('heroSub')}</p>

        <ul className="landing-feats">
          {feats.map((f, i) => (
            <li key={i}><span className="lf-ico">{f.icon}</span>{f.label}</li>
          ))}
        </ul>

        <HeroVisual t={t} />
      </section>

      <section className="landing-auth">
        <div className="landing-auth-inner">
          <h2>{t('heroAuthTitle')}</h2>
          <SignIn
            routing="virtual"
            appearance={{ variables: { colorPrimary: '#0F6CBD', borderRadius: '10px' } }}
          />
          <p className="landing-cta-note">{t('heroCtaNote')}</p>
        </div>
      </section>
    </div>
  )
}

// Decorative, animated preview card (a spending-pace ring + a couple of
// category chips). Static demo numbers — purely illustrative.
function HeroVisual({ t }) {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hv-card">
        <RingGauge value={72} max={100} size={104} stroke={9}>
          <div className="hv-ring-pct">72%</div>
          <div className="hv-ring-cap">{t('ofExpected')}</div>
        </RingGauge>
        <div className="hv-chips">
          <span className="hv-chip" style={{ '--c': '#f97316' }}><CategoryIcon category="food" width={14} height={14} /> 1,850</span>
          <span className="hv-chip" style={{ '--c': '#8b5cf6' }}><CategoryIcon category="rent" width={14} height={14} /> 4,000</span>
          <span className="hv-chip" style={{ '--c': '#10b981' }}><Icon.wallet width={14} height={14} /> +12,300</span>
        </div>
      </div>
    </div>
  )
}
