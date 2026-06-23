// Fluent-style line icons (24×24, inherit currentColor, no background).
// Realistic iconography — no emoji.
// Default to 1em so they size like @fluentui/react-icons inside Fluent slots
// (Button/Badge/Tab icon props). Explicit width/height props and any `svg {…}`
// CSS rule override this presentation attribute.
const base = {
  viewBox: '0 0 24 24', width: '1em', height: '1em', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
}

export const Icon = {
  // ── navigation ──
  dashboard: (p) => <svg {...base} {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  income:    (p) => <svg {...base} {...p}><path d="M3 7h13a2 2 0 0 1 2 2v1"/><path d="M18 14v1a2 2 0 0 1-2 2H3"/><rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="2.2"/></svg>,
  expenses:  (p) => <svg {...base} {...p}><path d="M6 3h12a1 1 0 0 1 1 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 0 1 1-1z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/></svg>,
  budgets:   (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9h-9z" fill="currentColor" stroke="none" opacity="0.18"/><path d="M12 7v5l3.5 3.5"/></svg>,
  goals:     (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>,
  cards:     (p) => <svg {...base} {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><line x1="2.5" y1="9.5" x2="21.5" y2="9.5"/><line x1="6" y1="14.5" x2="10" y2="14.5"/></svg>,
  settings:  (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z"/></svg>,
  accounts:  (p) => <svg {...base} {...p}><path d="M3 9.5l9-5 9 5"/><path d="M5 9.5V19M19 9.5V19M9.5 9.5V19M14.5 9.5V19"/><path d="M3 21h18"/></svg>,
  subscriptions: (p) => <svg {...base} {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/><path d="M8.8 14.5l2.2 2.2 4.2-4.2"/></svg>,
  ledger:    (p) => <svg {...base} {...p}><line x1="8" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>,

  // ── KPI / dashboard ──
  wallet:    (p) => <svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2"/><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M16 12.5h3.5a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H16a1.5 1.5 0 0 0 0 3z"/></svg>,
  receipt:   (p) => <svg {...base} {...p}><path d="M6 3h12a1 1 0 0 1 1 1v17l-2.5-1.6L14 21l-2-1.6L10 21l-2.5-1.6L5 21V4a1 1 0 0 1 1-1z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="13" y2="12"/></svg>,
  trendUp:   (p) => <svg {...base} {...p}><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>,
  trendDown: (p) => <svg {...base} {...p}><polyline points="3 7 9 13 13 9 21 17"/><polyline points="15 17 21 17 21 11"/></svg>,
  swap:      (p) => <svg {...base} {...p}><polyline points="7 4 3 8 7 12"/><line x1="3" y1="8" x2="17" y2="8"/><polyline points="17 20 21 16 17 12"/><line x1="21" y1="16" x2="7" y2="16"/></svg>,
  calendar:  (p) => <svg {...base} {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/></svg>,
  shield:    (p) => <svg {...base} {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9.2 12l2 2 3.6-3.8"/></svg>,
  forecast:  (p) => <svg {...base} {...p}><path d="M4 20V6"/><path d="M4 16l5-4 4 3 7-7"/><circle cx="20" cy="8" r="0"/><path d="M4 20h16"/></svg>,
  gauge:     (p) => <svg {...base} {...p}><path d="M4 19a8 8 0 1 1 16 0"/><line x1="12" y1="19" x2="15.5" y2="11.5"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></svg>,
  bulb:      (p) => <svg {...base} {...p}><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.5.4.8 1 .8 1.6V16h6v-.8c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/></svg>,
  piggy:     (p) => <svg {...base} {...p}><path d="M18 9.5c1.2.7 2 1.9 2 3.3 0 1.2-.6 2.3-1.5 3v2.2h-2.2l-.5-1.2a7.7 7.7 0 0 1-4.6 0L10.2 21H8v-2.2A5.2 5.2 0 0 1 5.6 14H4v-3h1.9A5.6 5.6 0 0 1 11 8h3a3 3 0 0 0 3-3v0a3 3 0 0 1 1 5.5"/><circle cx="9" cy="12" r=".8" fill="currentColor" stroke="none"/></svg>,

  // ── actions / UI ──
  search:    (p) => <svg {...base} {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>,
  download:  (p) => <svg {...base} {...p}><path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M5 20h14"/></svg>,
  upload:    (p) => <svg {...base} {...p}><path d="M12 16V4"/><polyline points="7 9 12 4 17 9"/><path d="M5 20h14"/></svg>,
  trash:     (p) => <svg {...base} {...p}><polyline points="4 7 20 7"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  plus:      (p) => <svg {...base} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close:     (p) => <svg {...base} {...p}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>,
  lock:      (p) => <svg {...base} {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg>,
  sun:       (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon:      (p) => <svg {...base} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  menu:      (p) => <svg {...base} {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  chevronLeft:  (p) => <svg {...base} {...p}><polyline points="15 5 8 12 15 19"/></svg>,
  chevronRight: (p) => <svg {...base} {...p}><polyline points="9 5 16 12 9 19"/></svg>,
  chevronDown:  (p) => <svg {...base} {...p}><polyline points="5 9 12 16 19 9"/></svg>,
  repeat:    (p) => <svg {...base} {...p}><polyline points="17 2 21 6 17 10"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 22 3 18 7 14"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  cash:      (p) => <svg {...base} {...p}><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><line x1="6" y1="9.5" x2="6" y2="9.51"/><line x1="18" y1="14.5" x2="18" y2="14.51"/></svg>,
  globe:     (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>,
  alert:     (p) => <svg {...base} {...p}><path d="M12 4l9 15.5H3z"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>,
  edit:      (p) => <svg {...base} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
  paperclip: (p) => <svg {...base} {...p}><path d="M21 12.5l-8.5 8.5a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.6 17.8a1.6 1.6 0 0 1-2.3-2.3l7.8-7.8"/></svg>,
  check:     (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.2 2.2 4.8-5"/></svg>,

  // ── expense categories ──
  cat_food:          (p) => <svg {...base} {...p}><path d="M6 3v7a2 2 0 0 0 4 0V3"/><line x1="8" y1="10" x2="8" y2="21"/><path d="M17 3c-1.7 0-3 2-3 5s1.3 4 3 4"/><line x1="17" y1="12" x2="17" y2="21"/></svg>,
  cat_rent:          (p) => <svg {...base} {...p}><path d="M4 11l8-6 8 6"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/><path d="M10 20v-5h4v5"/></svg>,
  cat_transport:     (p) => <svg {...base} {...p}><path d="M4 16v-3.5L5.7 8a2 2 0 0 1 1.9-1.3h8.8A2 2 0 0 1 18.3 8L20 12.5V16"/><path d="M3.5 16h17"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="16.5" cy="16.5" r="1.6"/><path d="M5 16v2M19 16v2"/></svg>,
  cat_bills:         (p) => <svg {...base} {...p}><path d="M13 2L4.5 13H11l-1 9 8.5-11.5H12z"/></svg>,
  cat_health:        (p) => <svg {...base} {...p}><path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.6 12 20 12 20z"/><path d="M8.5 12h2l1-2 1.5 3 1-1.5h2"/></svg>,
  cat_education:     (p) => <svg {...base} {...p}><path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v4.5c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V10"/><line x1="21" y1="8" x2="21" y2="13"/></svg>,
  cat_shopping:      (p) => <svg {...base} {...p}><path d="M5.5 8h13l-1 12a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>,
  cat_entertainment: (p) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M10 12.5l4 2.2-4 2.2z" fill="currentColor" stroke="none"/></svg>,
  cat_savings:       (p) => <svg {...base} {...p}><ellipse cx="12" cy="8" rx="7" ry="3"/><path d="M5 8v8c0 1.7 3.1 3 7 3s7-1.3 7-3V8"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></svg>,
  cat_debt:          (p) => <svg {...base} {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><line x1="2.5" y1="9.5" x2="21.5" y2="9.5"/><line x1="6" y1="14.5" x2="11" y2="14.5"/></svg>,
  cat_other:         (p) => <svg {...base} {...p}><path d="M12 2.5l8 4v9l-8 4-8-4v-9z"/><path d="M4.2 6.8L12 11l7.8-4.2M12 11v9"/></svg>,
}

// Map a category key to its glyph (used everywhere a category is shown).
export function CategoryIcon({ category, ...props }) {
  const Glyph = Icon[`cat_${category}`] || Icon.cat_other
  return <Glyph {...props} />
}
