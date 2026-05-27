import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayKey } from '../utils/date.js'
import { computeTargets, ACTIVITY_LABELS, GOAL_LABELS } from '../utils/targets.js'

export default function Settings() {
  const { settings, updateSettings, clearDay, exportData, showToast, targets, profile } = useApp()
  const [notifStatus, setNotifStatus] = useState(null)

  const updateProfile = (patch) => {
    const newProfile = { ...profile, ...patch }
    const newTargets = computeTargets(newProfile)
    updateSettings({ profile: newProfile, targets: newTargets })
  }

  const handleToggleNotifications = async (enabled) => {
    if (enabled) {
      if (!('Notification' in window)) {
        showToast('Notifications not supported on this device')
        return
      }
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        updateSettings({ notificationsEnabled: true })
        scheduleNotifications(settings)
        showToast('Notifications enabled!')
        setNotifStatus('granted')
      } else {
        showToast('Permission denied — enable in browser settings')
        setNotifStatus('denied')
      }
    } else {
      updateSettings({ notificationsEnabled: false })
    }
  }

  const handleClearToday = () => {
    if (window.confirm('Clear all of today\'s logged meals and water?')) {
      clearDay(todayKey())
    }
  }

  return (
    <div className="page page-enter">
      <div className="settings-header">
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.625rem', marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.8125rem', opacity: 0.7 }}>Notifications, targets, data</p>
      </div>

      <div className="page-content" style={{ paddingTop: 20 }}>
        {/* Profile */}
        <p className="settings-group-label">Your Profile</p>
        <div className="settings-group">
          <div className="settings-row">
            <div className="settings-row-icon">👤</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Name</div>
            </div>
            <input
              type="text"
              value={profile.name || ''}
              onChange={e => updateProfile({ name: e.target.value })}
              style={{ height: 36, padding: '0 10px', borderRadius: 'var(--r8)', border: '1.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--txt)', fontSize: '0.9375rem', fontWeight: 600, outline: 'none', width: 120, textAlign: 'right' }}
            />
          </div>
          {[
            { key: 'age', label: 'Age', unit: 'yrs', min: 10, max: 100 },
            { key: 'weight', label: 'Weight', unit: 'kg', min: 30, max: 250 },
            { key: 'height', label: 'Height', unit: 'cm', min: 120, max: 230 },
          ].map(({ key, label, unit, min, max }) => (
            <div key={key} className="settings-row">
              <div className="settings-row-icon" style={{ fontSize: '0.875rem' }}>
                {key === 'age' ? '🎂' : key === 'weight' ? '⚖️' : '📏'}
              </div>
              <div className="settings-row-info">
                <div className="settings-row-label">{label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="range" min={min} max={max} value={profile[key] || 0}
                  onChange={e => updateProfile({ [key]: parseFloat(e.target.value) })}
                  style={{ width: 80, accentColor: 'var(--g500)' }}
                />
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--g600)', minWidth: 52, textAlign: 'right' }}>
                  {profile[key]} {unit}
                </span>
              </div>
            </div>
          ))}
          <div className="settings-row">
            <div className="settings-row-icon">🏃</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Activity</div>
            </div>
            <select value={profile.activity || 'sedentary'} onChange={e => updateProfile({ activity: e.target.value })}
              style={{ height: 36, padding: '0 8px', borderRadius: 'var(--r8)', border: '1.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--txt)', fontSize: '0.8125rem', fontWeight: 500 }}>
              {Object.entries(ACTIVITY_LABELS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">🎯</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Goal</div>
            </div>
            <select value={profile.goal || 'loss'} onChange={e => updateProfile({ goal: e.target.value })}
              style={{ height: 36, padding: '0 8px', borderRadius: 'var(--r8)', border: '1.5px solid var(--border2)', background: 'var(--surf2)', color: 'var(--txt)', fontSize: '0.8125rem', fontWeight: 500 }}>
              {Object.entries(GOAL_LABELS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculated Targets */}
        <p className="settings-group-label">Calculated Targets</p>
        <div className="settings-group">
          <div style={{ padding: 16 }}>
            <div className="targets-row">
              <div className="target-item">
                <div className="target-val">{targets.protein.goal}g</div>
                <div className="target-unit">Protein</div>
              </div>
              <div className="target-item">
                <div className="target-val">{targets.calories.goal}</div>
                <div className="target-unit">Calories</div>
              </div>
              <div className="target-item">
                <div className="target-val">{targets.water.goal}L</div>
                <div className="target-unit">Water</div>
              </div>
            </div>
            <p className="caption" style={{ marginTop: 10 }}>
              Auto-calculated from your profile. Updates instantly when you change any value above.
            </p>
          </div>
        </div>

        {/* Appearance */}
        <p className="settings-group-label">Appearance</p>
        <div className="settings-group">
          <div className="settings-row">
            <div className="settings-row-icon">🌙</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Dark Mode</div>
              <div className="settings-row-desc">
                {settings.darkMode === 'auto' ? 'Follows system setting' : settings.darkMode === 'dark' ? 'Always dark' : 'Always light'}
              </div>
            </div>
            <div className="settings-row-control">
              <select
                value={settings.darkMode}
                onChange={e => updateSettings({ darkMode: e.target.value })}
                style={{
                  height: 36, padding: '0 10px', borderRadius: 'var(--r8)',
                  border: '1.5px solid var(--border2)', background: 'var(--surf2)',
                  color: 'var(--txt)', fontSize: '0.875rem', fontWeight: 500
                }}
              >
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <p className="settings-group-label">Notifications</p>
        <div className="settings-group">
          <div className="settings-row">
            <div className="settings-row-icon">🔔</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Enable Notifications</div>
              <div className="settings-row-desc">
                {notifStatus === 'denied' ? '⚠️ Blocked in browser — check site permissions' : 'Meal reminders and streak celebrations'}
              </div>
            </div>
            <div className="settings-row-control">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={e => handleToggleNotifications(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {settings.notificationsEnabled && (
            <>
              <div className="settings-row">
                <div className="settings-row-icon">🌅</div>
                <div className="settings-row-info">
                  <div className="settings-row-label">Morning Reminder</div>
                  <div className="settings-row-desc">Time to log overnight oats</div>
                </div>
                <div className="settings-row-control">
                  <input
                    type="time"
                    className="time-input"
                    value={settings.morningTime}
                    onChange={e => updateSettings({ morningTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-row-icon">🌆</div>
                <div className="settings-row-info">
                  <div className="settings-row-label">Evening Reminder</div>
                  <div className="settings-row-desc">Don't forget your evening meal</div>
                </div>
                <div className="settings-row-control">
                  <input
                    type="time"
                    className="time-input"
                    value={settings.eveningTime}
                    onChange={e => updateSettings({ eveningTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-row-icon">💪</div>
                <div className="settings-row-info">
                  <div className="settings-row-label">Streak Nudge</div>
                  <div className="settings-row-desc">Gentle reminder if nothing logged</div>
                </div>
                <div className="settings-row-control">
                  <input
                    type="time"
                    className="time-input"
                    value={settings.nudgeTime}
                    onChange={e => updateSettings({ nudgeTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-row" style={{ background: 'var(--surf3)' }}>
                <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--txt3)', lineHeight: 1.5 }}>
                  ℹ️ Notifications only fire while the app is open or in a background browser tab.
                  For always-on notifications, keep a tab open.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Data */}
        <p className="settings-group-label">Data</p>
        <div className="settings-group">
          <div className="settings-row" style={{ cursor: 'pointer' }} onClick={exportData}>
            <div className="settings-row-icon">📤</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Export Data</div>
              <div className="settings-row-desc">Download JSON backup of all logs</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--txt4)' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          <div className="settings-row" style={{ cursor: 'pointer' }} onClick={handleClearToday}>
            <div className="settings-row-icon" style={{ background: '#FEE2D5' }}>🗑️</div>
            <div className="settings-row-info">
              <div className="settings-row-label" style={{ color: 'var(--coral)' }}>Clear Today's Log</div>
              <div className="settings-row-desc">Reset all meals and water for today</div>
            </div>
          </div>
        </div>

        {/* About */}
        <p className="settings-group-label">About</p>
        <div className="settings-group">
          <div className="settings-row">
            <div className="settings-row-icon">🥗</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Protein Tracker</div>
              <div className="settings-row-desc">v1.0 · No account · No backend · Your data stays on your device</div>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">📡</div>
            <div className="settings-row-info">
              <div className="settings-row-label">Food Data</div>
              <div className="settings-row-desc">Open Food Facts API (offline fallback included)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function scheduleNotifications(settings) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const schedule = (timeStr, title, body) => {
    const [h, m] = timeStr.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)
    const delay = target - now
    setTimeout(() => {
      new Notification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' })
    }, delay)
  }

  schedule(settings.morningTime, '🌅 Morning check-in', 'Time to log your overnight oats! Start strong.')
  schedule(settings.eveningTime, '🌆 Evening reminder', "Don't forget your evening meal. You're almost at your goal!")
  schedule(settings.nudgeTime, '💪 Streak reminder', 'Haven\'t logged much today — keep your streak alive!')
}
