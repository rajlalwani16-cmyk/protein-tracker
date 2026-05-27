export function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString().slice(0, 10)
}

export function todayKey() {
  return toDateKey(new Date())
}

export function offsetDate(dateKey, days) {
  const d = new Date(dateKey + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

export function formatDate(dateKey) {
  const d = new Date(dateKey + 'T12:00:00')
  const isToday = dateKey === todayKey()
  const isYesterday = dateKey === offsetDate(todayKey(), -1)
  if (isToday) return { day: 'Today', full: d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }) }
  if (isYesterday) return { day: 'Yesterday', full: d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }) }
  return {
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    full: d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })
  }
}

export function getMonthDays(year, month) {
  // Returns array of date keys for a full calendar grid (Mon start)
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Day of week (0=Sun..6=Sat) → shift to Mon=0
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(toDateKey(new Date(year, month, d)))
  }
  while (days.length % 7 !== 0) days.push(null)
  return days
}

export function weekLabel(dateKey) {
  const d = new Date(dateKey + 'T12:00:00')
  const mon = new Date(d)
  const dow = (d.getDay() + 6) % 7
  mon.setDate(d.getDate() - dow)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = (dt) => dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return `${fmt(mon)} – ${fmt(sun)}`
}

export function isFuture(dateKey) {
  return dateKey > todayKey()
}
