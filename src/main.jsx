import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { AppProvider } from './context/AppContext.jsx'
import App from './App.jsx'
import './styles/index.css'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function MissingKeyNotice() {
  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24,
      fontFamily: 'system-ui, sans-serif', background: '#f5f5f5', color: '#222', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>⚙️ Setup needed</h1>
        <p style={{ lineHeight: 1.6, color: '#555' }}>
          Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your <code>.env.local</code> (and on Vercel)
          to enable sign-in &amp; cloud sync. See <code>.env.example</code> and the README.
        </p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {clerkKey ? (
      <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
        <AppProvider>
          <App />
        </AppProvider>
      </ClerkProvider>
    ) : (
      <MissingKeyNotice />
    )}
  </StrictMode>
)
