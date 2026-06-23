import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { uid, hashPin, defaultState, mergeDefaults, readCache, writeCache, readLegacyLocal } from '../lib/storage.js'
import { fetchState, saveStateRemote } from '../lib/api.js'
import { pendingRecurring } from '../lib/calc.js'
import { makeT } from '../i18n.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const userId = user?.id

  // `state` is null until the signed-in user's data is loaded from the server.
  const [state, setState] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('saved') // 'saved' | 'saving' | 'offline'
  const [locked, setLocked] = useState(false)
  const skipNextSave = useRef(false) // don't re-PUT the state we just loaded

  // ── Load the user's state from the cloud once Clerk is ready ──
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setState(null); setDataLoading(false); return }
    let cancelled = false
    setDataLoading(true)
    ;(async () => {
      let next, status = 'saved'
      try {
        const token = await getToken()
        let server = await fetchState(token)
        if (!server) {
          // New account: seed from any pre-accounts local data, then push it up.
          server = readLegacyLocal() || defaultState()
          try { await saveStateRemote(token, server) } catch { status = 'offline' }
        }
        next = mergeDefaults(server)
      } catch {
        // Offline / API error → fall back to this user's cached copy.
        next = mergeDefaults(readCache(userId) || defaultState())
        status = 'offline'
      }
      if (cancelled) return
      skipNextSave.current = true
      setState(next)
      setLocked(!!next.settings.pinEnabled && !!next.settings.pinHash)
      setSyncStatus(status)
      setDataLoading(false)
    })()
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, userId, getToken])

  // ── Persist: cache locally immediately + debounced push to the server ──
  useEffect(() => {
    if (!state || !userId) return
    writeCache(userId, state)
    if (skipNextSave.current) { skipNextSave.current = false; return }
    setSyncStatus('saving')
    const id = setTimeout(async () => {
      try { await saveStateRemote(await getToken(), state); setSyncStatus('saved') }
      catch { setSyncStatus('offline') }
    }, 800)
    return () => clearTimeout(id)
  }, [state, userId, getToken])

  // Safe settings even before data loads (so locale/theme/t never crash).
  const settings = state?.settings || defaultState().settings

  // Reflect theme + direction on <html> so CSS variables + RTL apply globally.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme)
    root.setAttribute('lang', settings.locale)
    root.setAttribute('dir', settings.locale === 'ar' ? 'rtl' : 'ltr')
  }, [settings.theme, settings.locale])

  const t = useMemo(() => makeT(settings.locale), [settings.locale])

  // ── generic state helpers ──
  const patch = useCallback((fn) => setState(prev => fn(structuredClone(prev))), [])

  // ── income ──
  const addIncome = useCallback((entry) => patch(s => {
    s.income.unshift({ ...entry, id: uid() }); return s
  }), [patch])
  const deleteIncome = useCallback((id) => patch(s => {
    s.income = s.income.filter(e => e.id !== id); return s
  }), [patch])
  const updateIncome = useCallback((id, fields) => patch(s => {
    s.income = s.income.map(e => e.id === id ? { ...e, ...fields } : e); return s
  }), [patch])

  // ── expenses ──
  const addExpense = useCallback((entry) => patch(s => {
    s.expenses.unshift({ ...entry, id: uid() }); return s
  }), [patch])
  const deleteExpense = useCallback((id) => patch(s => {
    s.expenses = s.expenses.filter(e => e.id !== id); return s
  }), [patch])
  const updateExpense = useCallback((id, fields) => patch(s => {
    s.expenses = s.expenses.map(e => e.id === id ? { ...e, ...fields } : e); return s
  }), [patch])

  // ── cards ──
  const addCard = useCallback((card) => patch(s => {
    s.cards.push({ ...card, id: uid() }); return s
  }), [patch])
  const deleteCard = useCallback((id) => patch(s => {
    s.expenses = s.expenses.map(e => e.cardId === id ? { ...e, cardId: null, cardName: null } : e)
    s.cards = s.cards.filter(c => c.id !== id); return s
  }), [patch])

  // ── accounts & transfers ──
  const addAccount = useCallback((acc) => patch(s => {
    s.accounts.push({ ...acc, id: uid(), openingBalance: Number(acc.openingBalance) || 0 }); return s
  }), [patch])
  const updateAccount = useCallback((id, fields) => patch(s => {
    s.accounts = s.accounts.map(a => a.id === id ? { ...a, ...fields } : a); return s
  }), [patch])
  const deleteAccount = useCallback((id) => patch(s => {
    s.income = s.income.map(e => e.accountId === id ? { ...e, accountId: null } : e)
    s.expenses = s.expenses.map(e => e.accountId === id ? { ...e, accountId: null } : e)
    s.subscriptions = (s.subscriptions || []).map(x => x.accountId === id ? { ...x, accountId: null } : x)
    s.transfers = (s.transfers || []).filter(x => x.fromId !== id && x.toId !== id)
    s.accounts = s.accounts.filter(a => a.id !== id); return s
  }), [patch])
  const addTransfer = useCallback((tr) => patch(s => {
    s.transfers = s.transfers || []
    s.transfers.unshift({ ...tr, id: uid(), amount: Number(tr.amount) || 0 }); return s
  }), [patch])
  const deleteTransfer = useCallback((id) => patch(s => {
    s.transfers = (s.transfers || []).filter(x => x.id !== id); return s
  }), [patch])

  // ── subscriptions ──
  const addSubscription = useCallback((sub) => patch(s => {
    s.subscriptions = s.subscriptions || []
    s.subscriptions.push({ ...sub, id: uid(), amount: Number(sub.amount) || 0, active: true, lastPaid: null }); return s
  }), [patch])
  const updateSubscription = useCallback((id, fields) => patch(s => {
    s.subscriptions = (s.subscriptions || []).map(x => x.id === id ? { ...x, ...fields } : x); return s
  }), [patch])
  const deleteSubscription = useCallback((id) => patch(s => {
    s.subscriptions = (s.subscriptions || []).filter(x => x.id !== id); return s
  }), [patch])
  // Mark a subscription paid for `month`: logs an expense + records lastPaid.
  const paySubscription = useCallback((id, month) => patch(s => {
    const sub = (s.subscriptions || []).find(x => x.id === id)
    if (!sub) return s
    const day = String(Math.min(Math.max(1, Number(sub.dueDay) || 1), 28)).padStart(2, '0')
    const acc = (s.accounts || []).find(a => a.id === sub.accountId)
    s.expenses.unshift({
      id: uid(), amount: Number(sub.amount) || 0, description: sub.name,
      category: sub.category || 'bills',
      paymentMethod: acc && acc.type !== 'cash' ? 'card' : 'cash',
      cardId: null, cardName: acc ? acc.name : null, accountId: sub.accountId || null,
      date: `${month}-${day}`, recurring: true, fromSubscription: sub.id,
    })
    s.subscriptions = s.subscriptions.map(x => x.id === id ? { ...x, lastPaid: month } : x)
    return s
  }), [patch])

  // Post any recurring income/expenses that aren't logged yet for `month`.
  const addRecurringForMonth = useCallback((month) => patch(s => {
    const { income, expenses } = pendingRecurring(s, month)
    const reDate = (orig) => {
      const day = Math.min(Math.max(1, parseInt((orig || '').slice(8, 10), 10) || 1), 28)
      return `${month}-${String(day).padStart(2, '0')}`
    }
    income.forEach(({ id, ...rest }) => s.income.unshift({ ...rest, id: uid(), date: reDate(rest.date), recurring: true }))
    expenses.forEach(({ id, ...rest }) => s.expenses.unshift({ ...rest, id: uid(), date: reDate(rest.date), recurring: true, receipt: null }))
    return s
  }), [patch])

  // ── budgets ──
  const setOverallBudget = useCallback((amount) => patch(s => {
    s.budgets.overall = amount ? Number(amount) : null; return s
  }), [patch])
  const setCategoryBudget = useCallback((category, amount) => patch(s => {
    if (amount && Number(amount) > 0) s.budgets.categories[category] = Number(amount)
    else delete s.budgets.categories[category]
    return s
  }), [patch])

  // ── goals ──
  const addGoal = useCallback((goal) => patch(s => {
    s.goals.push({ ...goal, id: uid(), saved: Number(goal.saved) || 0 }); return s
  }), [patch])
  const updateGoal = useCallback((id, fields) => patch(s => {
    s.goals = s.goals.map(g => g.id === id ? { ...g, ...fields } : g); return s
  }), [patch])
  const addGoalFunds = useCallback((id, amount) => patch(s => {
    s.goals = s.goals.map(g => g.id === id ? { ...g, saved: (Number(g.saved) || 0) + Number(amount) } : g)
    return s
  }), [patch])
  const deleteGoal = useCallback((id) => patch(s => {
    s.goals = s.goals.filter(g => g.id !== id); return s
  }), [patch])

  // ── settings ──
  const setSetting = useCallback((key, value) => patch(s => {
    s.settings[key] = value; return s
  }), [patch])
  const toggleTheme = useCallback(() => patch(s => {
    s.settings.theme = s.settings.theme === 'dark' ? 'light' : 'dark'; return s
  }), [patch])
  const toggleLocale = useCallback(() => patch(s => {
    s.settings.locale = s.settings.locale === 'ar' ? 'en' : 'ar'; return s
  }), [patch])

  // ── PIN / lock ──
  const setPin = useCallback((pin) => patch(s => {
    s.settings.pinEnabled = true
    s.settings.pinHash = hashPin(pin)
    return s
  }), [patch])
  const disablePin = useCallback(() => patch(s => {
    s.settings.pinEnabled = false
    s.settings.pinHash = null
    return s
  }), [patch])
  const verifyPin = useCallback((pin) => hashPin(pin) === state?.settings?.pinHash, [state?.settings?.pinHash])
  const lock = useCallback(() => { if (state?.settings?.pinEnabled) setLocked(true) }, [state?.settings?.pinEnabled])
  const unlock = useCallback(() => setLocked(false), [])

  // ── data management ──
  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state])
  const importData = useCallback((json) => {
    // Normalise through the same guards as load, so a malformed/legacy file
    // (e.g. a non-array `expenses`) can never crash the app after import.
    setState(mergeDefaults(JSON.parse(json)))
  }, [])
  const clearAll = useCallback(() => {
    const fresh = defaultState()
    // keep appearance prefs, wipe the money data + PIN
    fresh.settings.theme = state.settings.theme
    fresh.settings.locale = state.settings.locale
    fresh.settings.currency = state.settings.currency
    setState(fresh)
    setLocked(false)
  }, [state?.settings])

  const value = {
    state,
    t,
    locale: settings.locale,
    currency: settings.currency,
    theme: settings.theme,
    locked,
    dataLoading,
    syncStatus,
    addIncome, deleteIncome, updateIncome,
    addExpense, deleteExpense, updateExpense,
    addCard, deleteCard,
    addAccount, updateAccount, deleteAccount, addTransfer, deleteTransfer,
    addSubscription, updateSubscription, deleteSubscription, paySubscription,
    addRecurringForMonth,
    setOverallBudget, setCategoryBudget,
    addGoal, updateGoal, addGoalFunds, deleteGoal,
    setSetting, toggleTheme, toggleLocale,
    setPin, disablePin, verifyPin, lock, unlock,
    exportData, importData, clearAll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
