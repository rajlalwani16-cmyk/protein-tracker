import { useApp } from '../context/AppContext.jsx'

const MILESTONES = { 3: '🌱', 7: '🔥', 14: '💪', 30: '🏆', 60: '🌟', 100: '👑' }

function getMilestoneEmoji(streak) {
  const keys = Object.keys(MILESTONES).map(Number).sort((a, b) => b - a)
  for (const k of keys) {
    if (streak >= k) return MILESTONES[k]
  }
  return '✨'
}

export function StreakBadge({ streak }) {
  if (streak === 0) return (
    <div className="streak-badge" aria-label="No streak yet">
      <span className="streak-flame">💧</span>
      <div>
        <div className="streak-num" style={{ color: 'rgba(255,255,255,0.5)' }}>0</div>
        <div className="streak-text">day streak</div>
      </div>
    </div>
  )

  return (
    <div className="streak-badge" aria-label={`${streak} day protein streak`}>
      <span className="streak-flame">{getMilestoneEmoji(streak)}</span>
      <div>
        <div className="streak-num">{streak}</div>
        <div className="streak-text">day streak</div>
      </div>
    </div>
  )
}

export function StreakCelebration() {
  const { celebrateStreak, setCelebrateStreak } = useApp()
  if (!celebrateStreak) return null

  const messages = {
    3:  { emoji: '🌱', title: '3 Day Streak!', sub: 'You\'re building momentum. Keep it up!' },
    7:  { emoji: '🔥', title: 'One Week!', sub: 'Seven days of hitting your protein goal. Incredible!' },
    14: { emoji: '💪', title: 'Two Weeks Strong!', sub: 'Half a month of consistent nutrition. You\'re unstoppable!' },
    30: { emoji: '🏆', title: '30 Days!', sub: 'A full month of hitting 100g protein daily. Legendary.' },
    60: { emoji: '🌟', title: '60 Day Streak!', sub: 'Two months of discipline. This is a lifestyle now.' },
    100: { emoji: '👑', title: '100 Days!', sub: '100 consecutive days of protein goals. You\'re elite.' },
  }
  const m = messages[celebrateStreak] || { emoji: '🎉', title: `${celebrateStreak} Day Streak!`, sub: 'Keep going!' }

  return (
    <div className="streak-celebrate" onClick={() => setCelebrateStreak(null)}>
      <div className="streak-celebrate-card">
        <div className="streak-celebrate-emoji">{m.emoji}</div>
        <div className="streak-celebrate-title">{m.title}</div>
        <div className="streak-celebrate-sub">{m.sub}</div>
        <button
          onClick={() => setCelebrateStreak(null)}
          className="btn btn--primary"
          style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
        >
          Let's go! 🚀
        </button>
      </div>
    </div>
  )
}
