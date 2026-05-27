import { useApp } from '../context/AppContext.jsx'
import { DAILY_TARGETS } from '../data/meals.js'

const TOTAL_GLASSES = 12

export default function WaterTracker({ dateKey, water }) {
  const { addWater, removeWater } = useApp()
  const goal = DAILY_TARGETS.water.goal * 4 // glasses to hit goal (2.5L = 10 glasses)
  const liters = (water * 0.25).toFixed(2)

  return (
    <div className="water-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="label">Water</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span className="progress-num" style={{ fontSize: '1.375rem', color: '#2E86C1' }}>{liters}</span>
            <span className="progress-goal">/ {DAILY_TARGETS.water.goal}L</span>
          </div>
        </div>
        <div style={{ fontSize: '1.75rem' }} aria-hidden>💧</div>
      </div>

      <div className="water-glasses" role="group" aria-label={`Water intake: ${water} of ${goal} glasses`}>
        {Array.from({ length: TOTAL_GLASSES }).map((_, i) => (
          <button
            key={i}
            className={`water-glass${i < water ? ' filled' : ''}`}
            onClick={() => i < water ? removeWater(dateKey) : addWater(dateKey)}
            aria-label={i < water ? 'Remove water glass' : 'Add water glass'}
            title={`${(i + 1) * 250}ml`}
          >
            <div className="water-fill" />
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="water-ml">{water} × 250ml</span>
        {water >= goal && (
          <span style={{ fontSize: '0.75rem', color: '#2E86C1', fontWeight: 600 }}>
            🎉 Goal reached!
          </span>
        )}
      </div>

      <div className="water-controls">
        <button
          className="water-btn water-btn--remove"
          onClick={() => removeWater(dateKey)}
          disabled={water <= 0}
          aria-label="Remove one glass of water"
          style={{ opacity: water <= 0 ? 0.4 : 1 }}
        >
          − 250ml
        </button>
        <button
          className="water-btn water-btn--add"
          onClick={() => addWater(dateKey)}
          aria-label="Add one glass of water (250ml)"
        >
          + 250ml 💧
        </button>
      </div>
    </div>
  )
}
