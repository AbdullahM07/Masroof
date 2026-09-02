// Clerk appearance built from the design tokens, applied once on ClerkProvider
// so SignIn, SignUp, UserButton and its popover all follow the system.
// `variables` need concrete colours (Clerk derives shades from them), so they
// switch with the theme; `elements` use the CSS variables directly.

const LIGHT = {
  colorPrimary: '#1e2f52', colorBackground: '#fcfbf8', colorText: '#1c1b18', colorTextSecondary: '#5b574f',
  colorInputBackground: '#fcfbf8', colorInputText: '#1c1b18', colorNeutral: '#1c1b18',
  colorDanger: '#b4352a', colorSuccess: '#1e7a4b', colorWarning: '#8f5e00', colorTextOnPrimaryBackground: '#fbfaf7',
}
const DARK = {
  colorPrimary: '#3f5b93', colorBackground: '#1d1b18', colorText: '#ede9e1', colorTextSecondary: '#a9a398',
  colorInputBackground: '#1d1b18', colorInputText: '#ede9e1', colorNeutral: '#ede9e1',
  colorDanger: '#e8806f', colorSuccess: '#5fc48a', colorWarning: '#e3ad4f', colorTextOnPrimaryBackground: '#f7f5f0',
}

const control = {
  height: '36px',
  borderRadius: 'var(--radius-sm)',
  boxShadow: 'none',
  border: '1px solid var(--line-strong)',
  backgroundColor: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: '14px',
  '&:hover': { borderColor: 'var(--ink-3)' },
  '&:focus, &:focus-within': { borderColor: 'var(--accent-ink)', boxShadow: '0 0 0 3px color-mix(in srgb, var(--accent-ink) 15%, transparent)' },
}

export function clerkAppearance(theme, locale) {
  const dark = theme === 'dark'
  return {
    variables: {
      ...(dark ? DARK : LIGHT),
      borderRadius: '6px',
      fontFamily: locale === 'ar'
        ? '"IBM Plex Sans Arabic", "Inter Variable", system-ui, sans-serif'
        : '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
      fontFamilyButtons: locale === 'ar'
        ? '"IBM Plex Sans Arabic", "Inter Variable", system-ui, sans-serif'
        : '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: '14px',
      fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 600 },
      spacingUnit: '16px',
    },
    layout: {
      socialButtonsVariant: 'blockButton',
      socialButtonsPlacement: 'top',
      shimmer: false,
      animations: true,
    },
    elements: {
      // ── sign-in / sign-up card ──
      rootBox: { width: '100%' },
      cardBox: { width: '100%', maxWidth: '100%', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
      card: { backgroundColor: 'var(--surface)', boxShadow: 'none', padding: '28px 24px 24px', gap: '24px', borderRadius: 0 },
      header: { gap: '4px' },
      headerTitle: { fontSize: '17px', lineHeight: '24px', fontWeight: 600, letterSpacing: '-0.005em', color: 'var(--ink)' },
      headerSubtitle: { color: 'var(--ink-2)', fontSize: '14px' },
      logoBox: { display: 'none' },
      socialButtons: { gap: '8px' },
      socialButtonsBlockButton: { ...control, fontWeight: 500, gap: '10px', '&:hover': { borderColor: 'var(--ink-3)', backgroundColor: 'var(--surface-2)' } },
      socialButtonsBlockButtonText: { fontSize: '14px', fontWeight: 500, color: 'var(--ink)' },
      socialButtonsProviderIcon: { width: '16px', height: '16px' },
      badge: { backgroundColor: 'var(--surface-3)', color: 'var(--ink-2)', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 500, border: 'none', boxShadow: 'none' },
      dividerRow: { gap: '12px' },
      dividerLine: { backgroundColor: 'var(--line)', height: '1px' },
      dividerText: { color: 'var(--ink-3)', fontSize: '12px' },
      form: { gap: '16px' },
      formFieldRow: { gap: '6px' },
      formFieldLabel: { fontSize: '13px', fontWeight: 500, color: 'var(--ink-2)' },
      formFieldLabelRow: { marginBottom: '4px' },
      formFieldInput: { ...control, padding: '0 12px', '&::placeholder': { color: 'var(--ink-3)' } },
      formFieldInputShowPasswordButton: { color: 'var(--ink-3)', '&:hover': { color: 'var(--ink)' } },
      formFieldErrorText: { color: 'var(--negative)', fontSize: '12px' },
      formFieldSuccessText: { color: 'var(--positive)', fontSize: '12px' },
      formFieldHintText: { color: 'var(--ink-3)', fontSize: '12px' },
      formButtonPrimary: {
        height: '36px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 500, textTransform: 'none',
        backgroundColor: 'var(--accent)', color: 'var(--on-accent)', boxShadow: 'var(--shadow-card)', border: 'none',
        '&:hover': { backgroundColor: 'var(--accent-hover)' },
        '&:focus': { boxShadow: '0 0 0 2px var(--surface), 0 0 0 4px var(--accent-ink)' },
      },
      buttonArrowIcon: { display: 'none' },
      otpCodeFieldInput: { ...control, width: '40px', padding: 0, textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
      identityPreview: { backgroundColor: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' },
      identityPreviewText: { color: 'var(--ink)' },
      identityPreviewEditButton: { color: 'var(--accent-ink)' },
      formResendCodeLink: { color: 'var(--accent-ink)', fontWeight: 500 },
      backLink: { color: 'var(--ink-2)' },
      backRow: { color: 'var(--ink-2)' },
      alert: { borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)' },
      alertText: { color: 'var(--ink-2)' },
      footer: { background: 'var(--surface-2)', backgroundImage: 'none', borderTop: '1px solid var(--line)', margin: 0 },
      footerAction: { padding: '14px 24px', justifyContent: 'center', gap: '6px', background: 'transparent' },
      footerActionText: { color: 'var(--ink-2)', fontSize: '13px' },
      footerActionLink: { color: 'var(--accent-ink)', fontSize: '13px', fontWeight: 600, '&:hover': { color: 'var(--accent-hover)', textDecoration: 'underline', textUnderlineOffset: '3px' } },
      footerPages: { padding: '8px 24px 12px', gap: '12px', background: 'transparent' },
      footerPagesLink: { color: 'var(--ink-3)', fontSize: '12px' },

      // ── user button + popover ──
      userButtonBox: { gap: '8px' },
      userButtonTrigger: { borderRadius: '999px', '&:focus': { boxShadow: '0 0 0 2px var(--surface), 0 0 0 4px var(--accent-ink)' } },
      avatarBox: { width: '32px', height: '32px', boxShadow: '0 0 0 1px var(--line-strong)' },
      userButtonPopoverCard: { backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-float)', color: 'var(--ink)', width: '300px' },
      userButtonPopoverMain: { backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)' },
      userPreview: { padding: '16px 16px 12px', gap: '12px' },
      userPreviewAvatarBox: { width: '40px', height: '40px', boxShadow: '0 0 0 1px var(--line-strong)' },
      userPreviewMainIdentifier: { color: 'var(--ink)', fontWeight: 600, fontSize: '14px' },
      userPreviewSecondaryIdentifier: { color: 'var(--ink-3)', fontSize: '12.5px' },
      userButtonPopoverActions: { borderTop: '1px solid var(--line)', padding: '6px' },
      userButtonPopoverActionButton: {
        height: '40px', padding: '0 12px', borderRadius: 'var(--radius-sm)', color: 'var(--ink)', fontSize: '14px', fontWeight: 500, gap: '12px', border: 'none',
        '&:hover': { backgroundColor: 'var(--surface-3)', color: 'var(--ink)' },
        '&:focus': { backgroundColor: 'var(--surface-3)', boxShadow: 'none' },
      },
      userButtonPopoverActionButtonIcon: { color: 'var(--ink-3)', width: '16px', height: '16px' },
      userButtonPopoverActionButtonText: { color: 'inherit', fontSize: '14px' },
      userButtonPopoverActionButtonIconBox: { width: '24px' },
      userButtonPopoverFooter: { background: 'var(--surface-2)', backgroundImage: 'none', borderTop: '1px solid var(--line)', padding: '8px 16px', color: 'var(--ink-3)' },

      // Clerk's "Secured by" line and dev badge (dev keys only): keep them quiet.
      internal: { color: 'var(--ink-3)' },
    },
  }
}
