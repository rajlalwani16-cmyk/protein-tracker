import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayKey, offsetDate, formatDate, isFuture } from '../utils/date.js'
import { getDayTotals, getProteinColor, getCalorieColor } from '../utils/nutrition.js'
import { PRESET_MEALS } from '../data/meals.js'
import ProgressBar from '../components/ProgressBar.jsx'
import MealSlot from '../components/MealSlot.jsx'
import WaterTracker from '../components/WaterTracker.jsx'
import { StreakBadge } from '../components/StreakBadge.jsx'
import ProteinReference from '../components/ProteinReference.jsx'

export default function Dashboard() {
  const { getDay, streak, targets, profile } = useApp()
  const [dateKey, setDateKey] = useState(todayKey())

  const dayLog = getDay(dateKey)
  const totals = getDayTotals(dayLog)
  const dateLabel = formatDate(dateKey)
  const isToday = dateKey === todayKey()
  const [showRef, setShowRef] = useState(false)

  const proteinColor = getProteinColor(totals.protein)
  const calorieColor = getCalorieColor(totals.calories)

  const navPrev = () => setDateKey(d => offsetDate(d, -1))
  const navNext = () => {
    if (!isFuture(offsetDate(dateKey, 1))) setDateKey(d => offsetDate(d, 1))
  }

  return (
    <div className="page page-enter">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-deco" aria-hidden="true" />
        <div className="dash-date-nav">
          <button className="date-nav-btn" onClick={navPrev} aria-label="Previous day">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="dash-date-text">
            <div className="day display">{dateLabel.day}</div>
            <div className="date-full">
              {profile.name ? `${profile.name} · ` : ''}{dateLabel.full}
            </div>
          </div>

          <button
            className="date-nav-btn"
            onClick={navNext}
            disabled={isToday}
            aria-label="Next day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <StreakBadge streak={streak} />
          {isToday && totals.protein >= targets.protein.min && (
            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--rFull)', padding: '4px 12px', fontSize: '0.75rem', color: 'var(--g100)', fontWeight: 600 }}>
              🎯 Goal hit!
            </span>
          )}
        </div>

        <div className="dash-totals">
          <div className="dash-total-item">
            <div className="dash-total-val">{totals.protein}<span style={{ fontSize: '0.9rem' }}>g</span></div>
            <div className="dash-total-label">Protein</div>
            <div className="dash-total-unit">goal {targets.protein.goal}g</div>
          </div>
          <div className="dash-total-item">
            <div className="dash-total-val">{totals.calories}</div>
            <div className="dash-total-label">Calories</div>
            <div className="dash-total-unit">goal {targets.calories.goal}</div>
          </div>
          <div className="dash-total-item">
            <div className="dash-total-val">{totals.water.toFixed(1)}<span style={{ fontSize: '0.9rem' }}>L</span></div>
            <div className="dash-total-label">Water</div>
            <div className="dash-total-unit">goal {targets.water.goal}L</div>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="dash-body">
        <div className="dash-progress-card">
          <ProgressBar
            label="Protein"
            current={totals.protein}
            goal={targets.protein.goal}
            unit="g"
            color={proteinColor}
          />
          <ProgressBar
            label="Calories"
            current={totals.calories}
            goal={targets.calories.goal}
            unit=" kcal"
            color={calorieColor}
          />
          <ProgressBar
            label="Water"
            current={totals.water}
            goal={targets.water.goal}
            unit="L"
            color="water"
          />
        </div>

        {/* Water Tracker */}
        <div className="section-header">
          <h2>Water Intake</h2>
        </div>
        <div className="card">
          <WaterTracker dateKey={dateKey} water={dayLog.water || 0} />
        </div>

        {/* Meal Checklist */}
        <div className="section-header">
          <h2>Today's Meals</h2>
          <span className="caption">
            {PRESET_MEALS.filter(m => dayLog.meals?.[m.id]?.checked).length}/{PRESET_MEALS.length} done
          </span>
        </div>

        <div className="meal-slots">
          {PRESET_MEALS.map(meal => (
            <MealSlot
              key={meal.id}
              meal={meal}
              dateKey={dateKey}
              slotState={dayLog.meals?.[meal.id]}
            />
          ))}
        </div>

        {/* Free logged items */}
        {dayLog.freeLog?.length > 0 && (
          <>
            <div className="section-header">
              <h2>Custom Logged</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dayLog.freeLog.map(item => (
                <FreeLogItemDisplay key={item.id} item={item} dateKey={dateKey} />
              ))}
            </div>
          </>
        )}

        {/* Protein Reference */}
        <div className="section-header">
          <h2>Protein Reference</h2>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowRef(r => !r)}
          >
            {showRef ? 'Hide' : 'Show'}
          </button>
        </div>
        {showRef && (
          <div className="card">
            <ProteinReference />
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}

function FreeLogItemDisplay({ item, dateKey }) {
  const { removeFreeLog } = useApp()
  return (
    <div className="logged-item">
      <div className="logged-dot" />
      <div className="logged-item-info">
        <div className="logged-item-name">{item.name}</div>
        <div className="logged-item-detail">
          {item.quantity}{item.unit} · {item.protein}g protein · {item.calories} kcal
          {item.time ? ` · ${item.time}` : ''}
        </div>
      </div>
      <button
        className="delete-btn"
        onClick={() => removeFreeLog(dateKey, item.id)}
        aria-label={`Remove ${item.name}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
