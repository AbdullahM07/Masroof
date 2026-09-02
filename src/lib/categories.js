// Expense categories. `kind` maps each category to the 50/30/20 budgeting
// rule buckets: needs (essentials), wants (lifestyle), savings (savings/debt).
// Colours are the muted category palette from DESIGN.md — distinguishable in
// both themes, never used as filled chips. `icon` is kept for the report
// exporters; the UI draws Lucide glyphs via CategoryIcon.
export const CATEGORIES = [
  { key: 'food',          icon: '🍔', color: '#c2703e', kind: 'needs'   }, // terracotta
  { key: 'rent',          icon: '🏠', color: '#6f5ba6', kind: 'needs'   }, // plum
  { key: 'transport',     icon: '🚗', color: '#3a78a8', kind: 'needs'   }, // steel
  { key: 'bills',         icon: '💡', color: '#b08a2e', kind: 'needs'   }, // ochre
  { key: 'health',        icon: '💊', color: '#3e8e6e', kind: 'needs'   }, // jade
  { key: 'education',     icon: '📚', color: '#2f7f8f', kind: 'needs'   }, // teal
  { key: 'shopping',      icon: '🛍️', color: '#c05c7a', kind: 'wants'   }, // rose
  { key: 'entertainment', icon: '🎬', color: '#9a5c9e', kind: 'wants'   }, // mauve
  { key: 'savings',       icon: '🐖', color: '#4e8a3b', kind: 'savings' }, // moss
  { key: 'debt',          icon: '💳', color: '#a8453a', kind: 'savings' }, // brick
  { key: 'other',         icon: '📦', color: '#8a857b', kind: 'wants'   }, // stone
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]))

export function catIcon(key)  { return CATEGORY_MAP[key]?.icon  || '💸' }
export function catColor(key) { return CATEGORY_MAP[key]?.color || '#8a857b' }
export function catKind(key)  { return CATEGORY_MAP[key]?.kind  || 'wants' }

// Card / account palette (deep, bank-note tones; white text passes AA on all).
export const CARD_COLORS = [
  '#1e2f52', '#2f5d50', '#6b3a3a', '#4a4a6a',
  '#7a5a2b', '#2b5b6b', '#5a3f63', '#2a2a2a',
]
