import { SignIn } from '@clerk/clerk-react'
import { useApp } from '../context/AppContext.jsx'
import { Icon } from './icons.jsx'

// Signed-out landing: branded header + Clerk's hosted-in-component sign-in
// (handles sign-up, email/password, social — configured in the Clerk dashboard).
export default function AuthScreen() {
  const { t } = useApp()
  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <span className="auth-logo"><Icon.wallet width={34} height={34} /></span>
        <h1>{t('appName')}</h1>
        <p>{t('appTagline')}</p>
      </div>
      <SignIn
        routing="virtual"
        appearance={{
          variables: { colorPrimary: '#0F6CBD', borderRadius: '10px' },
          elements: { rootBox: 'auth-clerk', card: 'auth-clerk-card' },
        }}
      />
    </div>
  )
}
