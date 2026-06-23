// Expense categories. `kind` maps each category to the 50/30/20 budgeting
// rule buckets: needs (essentials), wants (lifestyle), savings (savings/debt).
export const CATEGORIES = [
  { key: 'food',          icon: '🍔', color: '#f97316', kind: 'needs'   },
  { key: 'rent',          icon: '🏠', color: '#8b5cf6', kind: 'needs'   },
  { key: 'transport',     icon: '🚗', color: '#3b82f6', kind: 'needs'   },
  { key: 'bills',         icon: '💡', color: '#6366f1', kind: 'needs'   },
  { key: 'health',        icon: '💊', color: '#10b981', kind: 'needs'   },
  { key: 'education',     icon: '📚', color: '#0ea5e9', kind: 'needs'   },
  { key: 'shopping',      icon: '🛍️', color: '#f59e0b', kind: 'wants'   },
  { key: 'entertainment', icon: '🎬', color: '#ec4899', kind: 'wants'   },
  { key: 'savings',       icon: '🐖', color: '#14b8a6', kind: 'savings' },
  { key: 'debt',          icon: '💳', color: '#ef4444', kind: 'savings' },
  { key: 'other',         icon: '📦', color: '#94a3b8', kind: 'wants'   },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]))

export function catIcon(key)  { return CATEGORY_MAP[key]?.icon  || '💸' }
export function catColor(key) { return CATEGORY_MAP[key]?.color || '#94a3b8' }
export function catKind(key)  { return CATEGORY_MAP[key]?.kind  || 'wants' }

// Card gradient palette (used by the cards page + payment chart).
export const CARD_COLORS = [
  '#4f46e5', '#7c3aed', '#dc2626', '#059669',
  '#d97706', '#0891b2', '#be185d', '#1e293b',
]
