import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { AppProvider } from '../context/AppContext.jsx'
import { clerkAppearance } from '../lib/clerkAppearance.js'
import App from './App.jsx'
import '../styles/index.css'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// AppContext mirrors theme/locale onto <html data-theme dir>; ClerkProvider sits
// above it, so it follows those attributes to keep Clerk's UI on-system.
function useHtmlAttrs() {
  const read = () => {
    const el = document.documentElement
    // Before AppContext mounts the attributes are absent; use the stored preference so
    // Clerk initialises in the right language and theme on the very first render.
    let pref = {}
    try { pref = JSON.parse(localStorage.getItem('sm_pref') || '{}') } catch { /* ignore */ }
    const theme = el.getAttribute('data-theme') || pref.theme || 'light'
    const dir = el.getAttribute('dir')
    const locale = dir ? (dir === 'rtl' ? 'ar' : 'en') : (pref.locale || 'en')
    return { theme, locale }
  }
  const [attrs, setAttrs] = useState(read)
  useEffect(() => {
    const mo = new MutationObserver(() => setAttrs(prev => {
      const next = read()
      return prev.theme === next.theme && prev.locale === next.locale ? prev : next
    }))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'dir'] })
    return () => mo.disconnect()
  }, [])
  return attrs
}

function ClerkRoot({ children }) {
  const { theme, locale } = useHtmlAttrs()
  // Clerk ships English by default; the Arabic pack loads only when needed and
  // must be present before Clerk initialises, so the provider waits for it.
  const [packs, setPacks] = useState({})
  useEffect(() => {
    if (locale === 'ar' && !packs.ar) {
      import('@clerk/localizations/ar-SA')
        // The pack leaves a few strings in English; fill the ones the sign-in card shows.
        .then(m => setPacks(p => ({ ...p, ar: { ...m.arSA, formFieldInputPlaceholder__emailAddress: 'أدخل بريدك الإلكتروني', formFieldInputPlaceholder__password: 'أدخل كلمة المرور' } })))
        .catch(() => setPacks(p => ({ ...p, ar: null }))) // fall back to Clerk's English rather than block
    }
  }, [locale, packs.ar])
  const localization = locale === 'ar' ? packs.ar : undefined
  if (locale === 'ar' && packs.ar === undefined) return null
  return (
    <ClerkProvider
      publishableKey={clerkKey}
      afterSignOutUrl="/"
      appearance={clerkAppearance(theme, locale)}
      localization={localization}
    >
      {children}
    </ClerkProvider>
  )
}

function MissingKeyNotice() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-canvas text-ink text-center">
      <div className="max-w-md card">
        <h1 className="t-h2 mb-2">Setup needed</h1>
        <p className="text-ink-2 leading-relaxed">
          Set <code className="px-1 rounded-sm bg-surface-3 font-mono text-[12px]">VITE_CLERK_PUBLISHABLE_KEY</code> in
          your <code className="px-1 rounded-sm bg-surface-3 font-mono text-[12px]">.env.local</code> (and on Vercel)
          to enable sign-in and cloud sync. See <code className="px-1 rounded-sm bg-surface-3 font-mono text-[12px]">.env.example</code> and the README.
        </p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {clerkKey ? (
      <ClerkRoot>
        <AppProvider>
          <App />
        </AppProvider>
      </ClerkRoot>
    ) : (
      <MissingKeyNotice />
    )}
  </StrictMode>
)
