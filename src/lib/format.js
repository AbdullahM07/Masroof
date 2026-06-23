// Currency + date + month helpers. Currency code is configurable in Settings.

export function formatMoney(n, currency = 'EGP', { short = false, sign = false } = {}) {
  const num = Number(n) || 0
  const prefix = sign && num > 0 ? '+' : ''
  if (short && Math.abs(num) >= 1000) {
    const k = (num / 1000)
    return `${prefix}${k.toFixed(k % 1 === 0 ? 0 : 1)}K ${currency}`
  }
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${prefix}${formatted} ${currency}`
}

const MONTHS = {
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
}

export function formatDate(str, locale = 'en') {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  const months = MONTHS[locale] || MONTHS.en
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`
}

export function formatMonthLabel(monthStr, locale = 'en') {
  if (!monthStr) return ''
  const [y, m] = monthStr.split('-')
  const months = MONTHS[locale] || MONTHS.en
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

// Localised month names (Jan…Dec / يناير…ديسمبر) for custom pickers.
export function monthNames(locale = 'en') {
  return MONTHS[locale] || MONTHS.en
}

export function shortMonth(monthStr, locale = 'en') {
  if (!monthStr) return ''
  const [, m] = monthStr.split('-')
  const months = MONTHS[locale] || MONTHS.en
  return months[parseInt(m, 10) - 1]
}

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function currentMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

// Returns the month string N months before the given one (e.g. addMonths('2024-03', -2) => '2024-01').
export function addMonths(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function prevMonth(monthStr) { return addMonths(monthStr, -1) }

// Days in the month identified by 'YYYY-MM'.
export function daysInMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// For the *current* month returns how many days are left (incl. today);
// for past/future months returns full length / 0 respectively.
export function daysLeftInMonth(monthStr) {
  const total = daysInMonth(monthStr)
  if (monthStr !== currentMonthStr()) {
    return monthStr < currentMonthStr() ? 0 : total
  }
  return total - new Date().getDate() + 1
}

export function dayOfMonth(monthStr) {
  if (monthStr !== currentMonthStr()) {
    return monthStr < currentMonthStr() ? daysInMonth(monthStr) : 0
  }
  return new Date().getDate()
}

function pad(n) { return String(n).padStart(2, '0') }
