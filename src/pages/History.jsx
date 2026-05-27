import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayKey, getMonthDays, formatDate, offsetDate, weekLabel } from '../utils/date.js'
import { getDayTotals, hitProteinGoal, getWeeklySummary } from '../utils/nutrition.js'
import { DAILY_TARGETS } from '../data/meals.js'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function History() {
  const { state } = useApp()
  const { dailyLogs } = state
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [viewMode, setViewMode] = useState('calendar')
  const [selectedDay, setSelectedDay] = useState(null)

  const days = getMonthDays(year, month)
  const monthName = new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const navMonth = (dir) => {
    let m = month + dir, y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m); setYear(y)
  }

  const weekSummary = getWeeklySummary(dailyLogs, todayKey())

  // Build list view — last 60 days with data
  const listDays = Object.keys(dailyLogs)
    .filter(k => k <= todayKey())
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 60)

  return (
    <div className="page page-enter">
      <div className="history-header">
        <h1 style={{ color: 'var(--g100)', fontFamily: 'Fraunces, serif', fontSize: '1.625rem', marginBottom: 4 }}>
          History
        </h1>
        <p style={{ color: 'var(--g300)', fontSize: '0.8125rem' }}>
          Your nutrition journey over time
        </p>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${viewMode === 'calendar' ? ' active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {/* Weekly summary */}
        {weekSummary && (
          <div className="weekly-summary">
            <div className="weekly-title">This week — {weekLabel(todayKey())}</div>
            <div className="weekly-stats">
              <div>
                <div className="weekly-stat-val">{weekSummary.avgProtein}g</div>
                <div className="weekly-stat-label">Avg protein / day</div>
              </div>
              <div>
                <div className="weekly-stat-val">{weekSummary.avgCalories}</div>
                <div className="weekly-stat-label">Avg calories / day</div>
              </div>
              <div>
                <div className="weekly-stat-val">{weekSummary.proteinHits}/{weekSummary.daysLogged}</div>
                <div className="weekly-stat-label">Goal days hit</div>
              </div>
              <div>
                <div className="weekly-stat-val">{weekSummary.daysLogged}</div>
                <div className="weekly-stat-label">Days logged</div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'calendar' ? (
          <>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button
                className="btn btn--ghost btn--sm btn--icon"
                onClick={() => navMonth(-1)}
                aria-label="Previous month"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{monthName}</span>
              <button
                className="btn btn--ghost btn--sm btn--icon"
                onClick={() => navMonth(1)}
                disabled={year === today.getFullYear() && month >= today.getMonth()}
                aria-label="Next month"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="cal-grid">
              {DAY_NAMES.map(d => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
              {days.map((key, i) => {
                if (!key) return <div key={i} className="cal-day empty" />
                const log = dailyLogs[key]
                const isToday = key === todayKey()
                const isFut = key > todayKey()
                const totals = log ? getDayTotals(log) : null
                const hit = log ? hitProteinGoal(log) : null
                const d = new Date(key + 'T12:00:00')

                return (
                  <button
                    key={key}
                    className={`cal-day${isToday ? ' today' : ''}${!log ? ' empty' : ''}`}
                    style={{ cursor: log ? 'pointer' : 'default', opacity: isFut ? 0.3 : 1 }}
                    onClick={() => log && setSelectedDay(selectedDay === key ? null : key)}
                    aria-label={`${key}${log ? `: ${getDayTotals(log).protein}g protein` : ''}`}
                    disabled={!log && !isToday}
                  >
                    <span className="cal-day-num">{d.getDate()}</span>
                    {log && (
                      <div className={`cal-dot cal-dot--${hit ? 'green' : 'red'}`} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected day detail */}
            {selectedDay && dailyLogs[selectedDay] && (
              <DayDetail dateKey={selectedDay} log={dailyLogs[selectedDay]} />
            )}
          </>
        ) : (
          <div className="history-list">
            {listDays.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <p>No history yet.<br />Start logging meals to see your progress here.</p>
              </div>
            ) : (
              listDays.map(key => (
                <HistoryListItem
                  key={key}
                  dateKey={key}
                  log={dailyLogs[key]}
                  expanded={selectedDay === key}
                  onToggle={() => setSelectedDay(selectedDay === key ? null : key)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DayDetail({ dateKey, log }) {
  const totals = getDayTotals(log)
  const hit = hitProteinGoal(log)
  const label = formatDate(dateKey)

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3>{label.full}</h3>
        <span className={`history-status history-status--${hit ? 'hit' : 'miss'}`}>
          {hit ? '✓ Goal hit' : '✗ Goal missed'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <MacroStat label="Protein" val={`${totals.protein}g`} />
        <MacroStat label="Calories" val={totals.calories} />
        <MacroStat label="Water" val={`${totals.water.toFixed(1)}L`} />
      </div>
      {log.freeLog?.length > 0 && (
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Custom logged</p>
          {log.freeLog.map(item => (
            <div key={item.id} style={{ fontSize: '0.8125rem', color: 'var(--txt3)', paddingBottom: 4 }}>
              {item.name} — {item.protein}g protein · {item.calories} kcal
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryListItem({ dateKey, log, expanded, onToggle }) {
  const totals = getDayTotals(log)
  const hit = hitProteinGoal(log)
  const d = new Date(dateKey + 'T12:00:00')

  return (
    <div>
      <div className="history-item" onClick={onToggle}>
        <div className="history-date-badge">
          <div className="history-date-day">{d.getDate()}</div>
          <div className="history-date-month">{d.toLocaleDateString('en-IN', { month: 'short' })}</div>
        </div>
        <div className="history-item-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              {d.toLocaleDateString('en-IN', { weekday: 'short' })}
            </span>
            <span className={`history-status history-status--${hit ? 'hit' : 'miss'}`}>
              {hit ? '✓ Hit' : '✗ Missed'}
            </span>
          </div>
          <div className="history-item-macros">
            <span style={{ fontSize: '0.75rem', color: 'var(--g600)', fontWeight: 600 }}>{totals.protein}g protein</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>{totals.calories} kcal</span>
            <span style={{ fontSize: '0.75rem', color: '#2E86C1' }}>{totals.water.toFixed(1)}L</span>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--txt4)', transform: expanded ? 'rotate(180deg)' : '', transition: 'transform 220ms' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {expanded && <DayDetail dateKey={dateKey} log={log} />}
    </div>
  )
}

function MacroStat({ label, val }) {
  return (
    <div style={{ background: 'var(--surf3)', borderRadius: 'var(--r12)', padding: '10px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.125rem' }}>{val}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--txt4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}
