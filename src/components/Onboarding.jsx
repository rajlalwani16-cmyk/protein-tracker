import { useApp } from '../context/AppContext.jsx'
import { DAILY_TARGETS } from '../data/meals.js'

export default function Onboarding() {
  const { completeOnboarding } = useApp()

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-icon">🥗</div>
      <h1 className="onboarding-title" style={{ fontFamily: 'Fraunces, serif' }}>
        Welcome, Raj.
      </h1>
      <p className="onboarding-sub">
        Your personal nutrition tracker is ready.<br />
        Daily targets are set. Start by logging your first meal.
      </p>

      <div className="onboarding-targets">
        <div>
          <div className="ob-target-val">{DAILY_TARGETS.protein.goal}g</div>
          <div className="ob-target-label">Protein</div>
        </div>
        <div>
          <div className="ob-target-val">{DAILY_TARGETS.calories.goal}</div>
          <div className="ob-target-label">Calories</div>
        </div>
        <div>
          <div className="ob-target-val">{DAILY_TARGETS.water.goal}L</div>
          <div className="ob-target-label">Water</div>
        </div>
      </div>

      <div style={{ marginTop: 24, width: '100%' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--r16)', padding: '16px' }}>
          {[
            { icon: '🏠', text: 'Home — dashboard with your daily progress' },
            { icon: '➕', text: 'Log Food — search any food or scan barcodes' },
            { icon: '📖', text: 'Recipes — 10 high-protein recipes with steps' },
            { icon: '📅', text: 'History — track your streak and past days' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 3 ? 12 : 0 }}>
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{tip.icon}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--g200)', lineHeight: 1.5 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="onboarding-start-btn"
        onClick={completeOnboarding}
        autoFocus
      >
        Let's hit 100g today 💪
      </button>
    </div>
  )
}
