export default function ProgressBar({ label, current, goal, unit, color = 'green', showNumbers = true, size = 'md' }) {
  const pct = Math.min((current / goal) * 100, 100)

  return (
    <div className="progress-wrap">
      {showNumbers && (
        <div className="progress-label-row">
          <span className="label">{label}</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="progress-num">{typeof current === 'number' ? current % 1 === 0 ? current : current.toFixed(1) : current}</span>
            <span className="progress-goal">/ {goal}{unit}</span>
          </span>
        </div>
      )}
      <div className="progress-track" style={size === 'sm' ? { height: 8 } : {}}>
        <div
          className={`progress-fill progress-fill--${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label={`${label}: ${current} of ${goal}${unit}`}
        />
      </div>
    </div>
  )
}
