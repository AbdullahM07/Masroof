const CATEGORY_LABELS = {
  food: 'Food & Dining',
  rent: 'Rent & Housing',
  transport: 'Transport',
  entertainment: 'Entertainment',
  health: 'Health',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  education: 'Education',
  other: 'Other'
}

const CATEGORY_ICONS = {
  food: '🍔', rent: '🏠', transport: '🚗', entertainment: '🎬',
  health: '💊', shopping: '🛍️', bills: '💡', education: '📚', other: '📦'
}

const CATEGORY_COLORS_MAP = {
  food: '#f97316', rent: '#8b5cf6', transport: '#3b82f6',
  entertainment: '#ec4899', health: '#10b981', shopping: '#f59e0b',
  bills: '#6366f1', education: '#0ea5e9', other: '#94a3b8'
}

function formatEGP(n, short = false) {
  if (short && n >= 1000) return (n / 1000).toFixed(1) + 'K EGP'
  return n.toLocaleString('en-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EGP'
}

function formatDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function currentMonthStr() {
  return new Date().toISOString().slice(0, 7)
}

function escHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function truncate(str, len) {
  return str && str.length > len ? str.slice(0, len) + '…' : (str || '')
}
