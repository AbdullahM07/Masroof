import { useEffect, useRef } from 'react'
import { SignIn } from '@clerk/clerk-react'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney } from '../lib/format.js'
import { Icon, CategoryIcon } from '../components/icons.jsx'
import { Button } from '../components/ui/button.jsx'
import { Progress, Badge } from '../components/ui/controls.jsx'
import { RingGauge } from '../components/ui/index.jsx'
import { Wordmark } from './Wordmark.jsx'

// Signed-out landing: one headline, a product mock built from the real
// components, three proof points, and Clerk sign-in styled to the tokens.
export default function AuthScreen() {
  const { t, locale, toggleLocale, theme, toggleTheme } = useApp()
  const ref = useRef(null)

  // Spotlight follows the pointer (desktop only; static on touch / reduced motion).
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    function move(e) {
      el.style.setProperty('--x', `${e.clientX}px`)
      el.style.setProperty('--y', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const proofs = [
    { icon: <Icon.gauge size={18} />, label: t('heroFeatInsights'), body: t('heroProofInsights') },
    { icon: <Icon.budgets size={18} />, label: t('heroFeatBudget'), body: t('heroProofBudget') },
    { icon: <Icon.shield size={18} />, label: t('heroFeatSync'), body: t('heroProofSync') },
  ]

  const isDark = theme === 'dark'

  return (
    <div ref={ref} className="spotlight min-h-screen text-ink">
      <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Wordmark size={30} />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="iconSm" onClick={toggleTheme} aria-label={t('theme')} className="text-ink-2">
            {isDark ? <Icon.sun size={18} /> : <Icon.moon size={18} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLocale} aria-label={t('language')} className="text-ink-2 font-semibold">
            {locale === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-16 lg:pt-14">
        <section className="page-enter">
          <h1 className="max-w-[16ch] text-[36px] font-semibold leading-[1.08] tracking-[-0.025em] text-ink sm:text-[48px] rtl:tracking-normal">
            {t('heroTitle')}
          </h1>
          <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-2">{t('heroSub')}</p>

          <HeroMock t={t} locale={locale} />

          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {proofs.map((p, i) => (
              <li key={i} className="flex flex-col gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-accent-soft text-accent-ink">{p.icon}</span>
                <span className="font-semibold text-ink">{p.label}</span>
                <span className="t-small leading-relaxed text-ink-2">{p.body}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="page-enter lg:sticky lg:top-8 [animation-delay:80ms]">
          <h2 className="t-h2 mb-4">{t('heroAuthTitle')}</h2>
          <SignIn routing="virtual" />
          <p className="mt-4 t-small text-ink-3 text-center">{t('heroCtaNote')}</p>
        </section>
      </main>
    </div>
  )
}

// A framed mini dashboard rendered with the real components and demo numbers.
function HeroMock({ t, locale }) {
  const cur = 'EGP'
  const money = (n) => formatMoney(n, cur, { short: true })
  const rows = [
    { cat: 'rent', label: locale === 'ar' ? 'إيجار الشقة' : 'Apartment rent', amt: 4000, c: '#6f5ba6' },
    { cat: 'food', label: locale === 'ar' ? 'كارفور' : 'Carrefour', amt: 1850, c: '#c2703e' },
    { cat: 'transport', label: locale === 'ar' ? 'أوبر' : 'Uber', amt: 320, c: '#3a78a8' },
  ]
  return (
    <div className="relative mt-10 select-none" aria-hidden="true">
      <div className="pointer-events-none overflow-hidden rounded-lg border border-line bg-surface shadow-float">
        <div className="flex h-10 items-center gap-2 border-b border-line bg-surface-2 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" /><span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="ms-3 t-caption text-ink-3">{t('dashboard')}</span>
          <Badge tone="neutral" className="ms-auto"><Icon.cloudOk size={12} />{t('syncSaved')}</Badge>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
          <div className="flex items-center gap-4 rounded-md bg-surface-2 p-4">
            <RingGauge value={72} size={124} stroke={7} color="var(--positive)">
              <span className="num text-[15px] leading-5 text-ink whitespace-nowrap">{money(263)}</span>
              <span className="t-caption text-ink-3">{t('perDay')}</span>
            </RingGauge>
            <div className="flex flex-col gap-1">
              <span className="t-caption text-ink-3">{t('netBalance')}</span>
              <span className="num text-[26px] leading-7 text-ink">{money(12300)}</span>
              <span className="inline-flex items-center gap-1 t-caption text-positive"><Icon.trendUp size={13} />8% <span className="text-ink-3 font-normal">{t('vsLastMonth')}</span></span>
              <Progress pct={72} status="good" className="mt-2 w-36" thin />
            </div>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {rows.map(r => (
              <div key={r.cat} className="cat-bar flex h-11 items-center gap-3 ps-3" style={{ '--c': r.c }}>
                <span className="inline-flex text-ink-3" style={{ color: r.c }}><CategoryIcon category={r.cat} size={16} /></span>
                <span className="flex-1 truncate text-[13px] font-medium text-ink">{r.label}</span>
                <span className="t-caption text-ink-3">{t(r.cat)}</span>
                <span className="num text-[13px] text-negative">−{money(r.amt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
