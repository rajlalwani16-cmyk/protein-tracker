import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { todayKey } from '../utils/date.js'
import { computeStreak } from '../utils/nutrition.js'
import { PRESET_MEALS } from '../data/meals.js'

const STORAGE_KEY = 'proteinTracker_v1'
const SETTINGS_KEY = 'proteinTracker_settings'

function defaultDayLog() {
  const meals = {}
  PRESET_MEALS.forEach(m => {
    meals[m.id] = { checked: false, time: null, variant: m.variant || null }
  })
  return { meals, freeLog: [], water: 0 }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { dailyLogs: {}, onboardingComplete: false, seenTips: [] }
  } catch { return { dailyLogs: {}, onboardingComplete: false, seenTips: [] } }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

const defaultSettings = {
  morningTime: '08:00',
  eveningTime: '19:00',
  nudgeTime: '20:00',
  notificationsEnabled: false,
  darkMode: 'auto',
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [settings, setSettingsState] = useState(() => ({ ...defaultSettings, ...loadSettings() }))
  const [toast, setToast] = useState(null)
  const [celebrateStreak, setCelebrateStreak] = useState(null)

  const save = useCallback((newState) => {
    setState(newState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
  }, [])

  const saveSettings = useCallback((newSettings) => {
    setSettingsState(newSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
  }, [])

  // Dark mode
  useEffect(() => {
    const apply = () => {
      const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches
      const theme = settings.darkMode === 'auto'
        ? (prefer ? 'dark' : 'light')
        : settings.darkMode
      document.documentElement.setAttribute('data-theme', theme)
    }
    apply()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.darkMode])

  const getDay = useCallback((dateKey) => {
    return state.dailyLogs[dateKey] || defaultDayLog()
  }, [state.dailyLogs])

  const showToast = useCallback((msg, duration = 2000) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }, [])

  const toggleMeal = useCallback((dateKey, mealId) => {
    const current = state.dailyLogs[dateKey] || defaultDayLog()
    const slot = current.meals[mealId] || { checked: false, time: null, variant: null }
    const nowChecked = !slot.checked
    const updated = {
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [dateKey]: {
          ...current,
          meals: {
            ...current.meals,
            [mealId]: { ...slot, checked: nowChecked, time: nowChecked ? new Date().toTimeString().slice(0,5) : null }
          }
        }
      }
    }
    save(updated)

    if ('vibrate' in navigator) navigator.vibrate(nowChecked ? [40] : [20, 10, 20])

    if (nowChecked && dateKey === todayKey()) {
      const streak = computeStreak(updated.dailyLogs)
      if ([3, 7, 14, 30, 60, 100].includes(streak)) {
        setTimeout(() => setCelebrateStreak(streak), 400)
      }
    }
  }, [state, save])

  const setMealVariant = useCallback((dateKey, mealId, variantId) => {
    const current = state.dailyLogs[dateKey] || defaultDayLog()
    save({
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [dateKey]: {
          ...current,
          meals: {
            ...current.meals,
            [mealId]: { ...current.meals[mealId], variant: variantId }
          }
        }
      }
    })
  }, [state, save])

  const addFreeLog = useCallback((dateKey, item) => {
    const current = state.dailyLogs[dateKey] || defaultDayLog()
    const newItem = { ...item, id: Date.now().toString(), time: new Date().toTimeString().slice(0,5) }
    save({
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [dateKey]: { ...current, freeLog: [...(current.freeLog || []), newItem] }
      }
    })
    showToast(`Added ${item.name}`)
    if ('vibrate' in navigator) navigator.vibrate(30)
  }, [state, save, showToast])

  const removeFreeLog = useCallback((dateKey, itemId) => {
    const current = state.dailyLogs[dateKey] || defaultDayLog()
    save({
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [dateKey]: { ...current, freeLog: current.freeLog.filter(i => i.id !== itemId) }
      }
    })
  }, [state, save])

  const addWater = useCallback((dateKey) => {
    const current = state.dailyLogs[dateKey] || defaultDayLog()
    const max = 16
    if ((current.water || 0) >= max) return
    save({
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [dateKey]: { ...current, water: (current.water || 0) + 1 }
      }
    })
    if ('vibrate' in navigator) navigator.vibrate(20)
  }, [state, save])

  const removeWater = useCallback((dateKey) => {
    const current = state.dailyLogs[dateKey] || defaultDayLog()
    if ((current.water || 0) <= 0) return
    save({
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [dateKey]: { ...current, water: (current.water || 0) - 1 }
      }
    })
  }, [state, save])

  const clearDay = useCallback((dateKey) => {
    const updated = { ...state, dailyLogs: { ...state.dailyLogs } }
    delete updated.dailyLogs[dateKey]
    save(updated)
    showToast('Day cleared')
  }, [state, save, showToast])

  const completeOnboarding = useCallback(() => {
    save({ ...state, onboardingComplete: true })
  }, [state, save])

  const markTipSeen = useCallback((tipId) => {
    if (state.seenTips?.includes(tipId)) return
    save({ ...state, seenTips: [...(state.seenTips || []), tipId] })
  }, [state, save])

  const exportData = useCallback(() => {
    const data = { dailyLogs: state.dailyLogs, settings, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protein-tracker-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported!')
  }, [state, settings, showToast])

  const updateSettings = useCallback((patch) => {
    saveSettings({ ...settings, ...patch })
  }, [settings, saveSettings])

  const streak = computeStreak(state.dailyLogs)

  return (
    <AppContext.Provider value={{
      state, settings,
      getDay, streak,
      toggleMeal, setMealVariant,
      addFreeLog, removeFreeLog,
      addWater, removeWater,
      clearDay, completeOnboarding, markTipSeen,
      exportData, updateSettings,
      showToast, toast,
      celebrateStreak, setCelebrateStreak
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
