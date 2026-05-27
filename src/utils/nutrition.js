import { PRESET_MEALS, DAILY_TARGETS } from '../data/meals.js'

export function getDayTotals(dayLog) {
  if (!dayLog) return { protein: 0, calories: 0, water: 0 }

  let protein = 0
  let calories = 0

  const meals = dayLog.meals || {}
  PRESET_MEALS.forEach(m => {
    const slot = meals[m.id]
    if (slot?.checked) {
      const variant = m.variants?.find(v => v.id === (slot.variant || m.variant))
      protein += variant ? variant.protein : m.protein
      calories += variant ? variant.calories : m.calories
    }
  })

  const freeLog = dayLog.freeLog || []
  freeLog.forEach(item => {
    protein += item.protein || 0
    calories += item.calories || 0
  })

  const water = (dayLog.water || 0) * (DAILY_TARGETS.water.glassML / 1000)

  return {
    protein: Math.round(protein * 10) / 10,
    calories: Math.round(calories),
    water: Math.round(water * 100) / 100
  }
}

export function getProteinColor(grams) {
  const pct = grams / DAILY_TARGETS.protein.goal
  if (pct < 0.5) return 'red'
  if (pct < 0.8) return 'yellow'
  return 'green'
}

export function getCalorieColor(kcal) {
  const { min, max } = DAILY_TARGETS.calories
  if (kcal > max * 1.05) return 'red'
  if (kcal >= min) return 'green'
  return 'yellow'
}

export function hitProteinGoal(dayLog) {
  return getDayTotals(dayLog).protein >= DAILY_TARGETS.protein.min
}

export function computeStreak(dailyLogs) {
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const log = dailyLogs[key]
    if (!log) {
      if (i === 0) continue // today might not be started yet
      break
    }
    if (hitProteinGoal(log)) {
      streak++
    } else if (i === 0) {
      continue // today not done yet — don't break streak
    } else {
      break
    }
  }
  return streak
}

export function getWeeklySummary(dailyLogs, endDateKey) {
  const end = new Date(endDateKey + 'T12:00:00')
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ key, log: dailyLogs[key] || null })
  }

  const withData = days.filter(d => d.log)
  if (withData.length === 0) return null

  const totals = withData.map(d => getDayTotals(d.log))
  const proteinHits = withData.filter((d) => hitProteinGoal(d.log)).length
  const avgProtein = totals.reduce((s, t) => s + t.protein, 0) / withData.length
  const avgCalories = totals.reduce((s, t) => s + t.calories, 0) / withData.length
  const bestDay = withData.reduce((best, d) => {
    const t = getDayTotals(d.log)
    return t.protein > getDayTotals(best.log).protein ? d : best
  }, withData[0])
  const worstDay = withData.reduce((worst, d) => {
    const t = getDayTotals(d.log)
    return t.protein < getDayTotals(worst.log).protein ? d : worst
  }, withData[0])

  return {
    daysLogged: withData.length,
    proteinHits,
    avgProtein: Math.round(avgProtein),
    avgCalories: Math.round(avgCalories),
    bestDay: bestDay.key,
    worstDay: worstDay.key,
  }
}

export function scaleNutrition(protein, calories, qty, baseQty = 100) {
  const factor = qty / baseQty
  return {
    protein: Math.round(protein * factor * 10) / 10,
    calories: Math.round(calories * factor)
  }
}
