import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { computeTargets, DEFAULT_PROFILE, ACTIVITY_LABELS, GOAL_LABELS } from '../utils/targets.js'

const STEPS = ['you', 'body', 'activity', 'goal', 'confirm']

export default function Onboarding() {
  const { completeOnboarding, updateSettings } = useApp()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }))
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const targets = computeTargets(profile)

  const handleDone = () => {
    updateSettings({ profile, targets })
    completeOnboarding()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--g800)',
      display: 'flex', flexDirection: 'column',
      padding: 'calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 24px)',
      overflowY: 'auto'
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            height: 4, flex: 1,
            borderRadius: 2,
            background: i <= step ? 'var(--g400)' : 'rgba(255,255,255,0.12)',
            transition: 'background 300ms'
          }} />
        ))}
      </div>

      {/* Steps */}
      <div style={{ flex: 1 }}>
        {step === 0 && <StepYou profile={profile} set={set} />}
        {step === 1 && <StepBody profile={profile} set={set} />}
        {step === 2 && <StepActivity profile={profile} set={set} />}
        {step === 3 && <StepGoal profile={profile} set={set} />}
        {step === 4 && <StepConfirm profile={profile} targets={targets} />}
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        {step > 0 && (
          <button
            onClick={back}
            style={{
              height: 52, width: 52, borderRadius: 'var(--r12)',
              background: 'rgba(255,255,255,0.08)', color: 'var(--g200)',
              fontSize: '1.25rem', flexShrink: 0
            }}
            aria-label="Back"
          >←</button>
        )}
        <button
          onClick={step === STEPS.length - 1 ? handleDone : next}
          disabled={step === 0 && !profile.name.trim()}
          style={{
            flex: 1, height: 52, borderRadius: 'var(--rFull)',
            background: 'var(--g400)', color: 'var(--g900)',
            fontSize: '1rem', fontWeight: 700,
            opacity: (step === 0 && !profile.name.trim()) ? 0.4 : 1,
            transition: 'opacity 200ms'
          }}
        >
          {step === STEPS.length - 1 ? "Let's go 🚀" : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

/* ── Step 1: Name + Sex ──────────────────────────────────────────── */
function StepYou({ profile, set }) {
  return (
    <div>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>👋</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', color: 'var(--g100)', fontSize: '1.875rem', marginBottom: 8 }}>
        What's your name?
      </h1>
      <p style={{ color: 'var(--g300)', marginBottom: 32, lineHeight: 1.6 }}>
        We'll personalise your targets and greet you properly.
      </p>

      <input
        type="text"
        placeholder="Your name"
        value={profile.name}
        onChange={e => set('name', e.target.value)}
        autoFocus
        style={{
          width: '100%', height: 56, padding: '0 16px',
          borderRadius: 'var(--r16)',
          border: '2px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.07)',
          color: 'white', fontSize: '1.125rem', fontWeight: 500,
          outline: 'none', marginBottom: 24
        }}
        onFocus={e => e.target.style.borderColor = 'var(--g400)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
      />

      <p className="label" style={{ color: 'var(--g300)', marginBottom: 10 }}>Biological sex</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['male', '♂️', 'Male'], ['female', '♀️', 'Female']].map(([val, emoji, label]) => (
          <button
            key={val}
            onClick={() => set('sex', val)}
            style={{
              height: 64, borderRadius: 'var(--r16)',
              border: `2px solid ${profile.sex === val ? 'var(--g400)' : 'rgba(255,255,255,0.12)'}`,
              background: profile.sex === val ? 'rgba(61,155,101,0.25)' : 'rgba(255,255,255,0.05)',
              color: profile.sex === val ? 'var(--g200)' : 'var(--g300)',
              fontSize: '1rem', fontWeight: 600, transition: 'all 200ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Step 2: Age + Weight + Height ───────────────────────────────── */
function StepBody({ profile, set }) {
  const fields = [
    { key: 'age',    label: 'Age',    unit: 'yrs', min: 10,  max: 100, step: 1,   emoji: '🎂' },
    { key: 'weight', label: 'Weight', unit: 'kg',  min: 30,  max: 250, step: 0.5, emoji: '⚖️' },
    { key: 'height', label: 'Height', unit: 'cm',  min: 120, max: 230, step: 1,   emoji: '📏' },
  ]

  return (
    <div>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📏</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', color: 'var(--g100)', fontSize: '1.875rem', marginBottom: 8 }}>
        Your body stats
      </h1>
      <p style={{ color: 'var(--g300)', marginBottom: 32, lineHeight: 1.6 }}>
        Used to calculate your BMR and personalised calorie target.
      </p>

      {fields.map(({ key, label, unit, min, max, step, emoji }) => (
        <Stepper
          key={key}
          emoji={emoji}
          label={label}
          unit={unit}
          value={profile[key]}
          min={min} max={max} step={step}
          onChange={v => set(key, v)}
          dark
        />
      ))}
    </div>
  )
}

/* ── Step 3: Activity Level ──────────────────────────────────────── */
function StepActivity({ profile, set }) {
  return (
    <div>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🏃</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', color: 'var(--g100)', fontSize: '1.875rem', marginBottom: 8 }}>
        How active are you?
      </h1>
      <p style={{ color: 'var(--g300)', marginBottom: 28, lineHeight: 1.6 }}>
        Be honest — this affects your calorie needs.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(ACTIVITY_LABELS).map(([val, { label, desc, emoji }]) => (
          <button
            key={val}
            onClick={() => set('activity', val)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px',
              borderRadius: 'var(--r16)',
              border: `2px solid ${profile.activity === val ? 'var(--g400)' : 'rgba(255,255,255,0.10)'}`,
              background: profile.activity === val ? 'rgba(61,155,101,0.2)' : 'rgba(255,255,255,0.04)',
              textAlign: 'left', transition: 'all 200ms'
            }}
          >
            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{emoji}</span>
            <div>
              <div style={{ color: profile.activity === val ? 'var(--g200)' : 'var(--g100)', fontWeight: 600, fontSize: '0.9375rem' }}>
                {label}
              </div>
              <div style={{ color: 'var(--g400)', fontSize: '0.75rem', marginTop: 2 }}>{desc}</div>
            </div>
            {profile.activity === val && (
              <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Reusable stepper ────────────────────────────────────────────── */
export function Stepper({ emoji, label, unit, value, min, max, step = 1, onChange, dark = false }) {
  const dec = () => onChange(Math.max(min, Math.round((value - step) * 100) / 100))
  const inc = () => onChange(Math.min(max, Math.round((value + step) * 100) / 100))

  const btnStyle = (disabled) => ({
    width: 52, height: 52,
    borderRadius: 'var(--r12)',
    border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid var(--border2)',
    background: dark ? 'rgba(255,255,255,0.07)' : 'var(--surf3)',
    color: dark ? (disabled ? 'rgba(255,255,255,0.2)' : 'var(--g200)') : (disabled ? 'var(--txt5)' : 'var(--txt2)'),
    fontSize: '1.5rem',
    fontWeight: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 150ms',
    cursor: disabled ? 'not-allowed' : 'pointer'
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderRadius: 'var(--r16)',
      background: dark ? 'rgba(255,255,255,0.05)' : 'var(--surf)',
      border: dark ? '1.5px solid rgba(255,255,255,0.08)' : '1px solid var(--border)',
      marginBottom: 12
    }}>
      <span style={{ fontSize: '1.375rem', flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: dark ? 'var(--g400)' : 'var(--txt4)' }}>
          {label}
        </div>
      </div>
      <button style={btnStyle(value <= min)} onClick={dec} disabled={value <= min} aria-label={`Decrease ${label}`}>−</button>
      <div style={{ minWidth: 72, textAlign: 'center' }}>
        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.375rem', color: dark ? 'var(--amberL)' : 'var(--g600)', lineHeight: 1 }}>
          {value}
        </span>
        <div style={{ fontSize: '0.6875rem', color: dark ? 'var(--g400)' : 'var(--txt4)', marginTop: 2 }}>{unit}</div>
      </div>
      <button style={btnStyle(value >= max)} onClick={inc} disabled={value >= max} aria-label={`Increase ${label}`}>+</button>
    </div>
  )
}

/* ── Step 4: Goal ────────────────────────────────────────────────── */
function StepGoal({ profile, set }) {
  return (
    <div>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🎯</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', color: 'var(--g100)', fontSize: '1.875rem', marginBottom: 8 }}>
        What's your goal?
      </h1>
      <p style={{ color: 'var(--g300)', marginBottom: 28, lineHeight: 1.6 }}>
        This sets your calorie deficit or surplus and protein target.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(GOAL_LABELS).map(([val, { label, desc, emoji }]) => (
          <button
            key={val}
            onClick={() => set('goal', val)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px',
              borderRadius: 'var(--r16)',
              border: `2px solid ${profile.goal === val ? 'var(--g400)' : 'rgba(255,255,255,0.10)'}`,
              background: profile.goal === val ? 'rgba(61,155,101,0.2)' : 'rgba(255,255,255,0.04)',
              textAlign: 'left', transition: 'all 200ms'
            }}
          >
            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{emoji}</span>
            <div>
              <div style={{ color: profile.goal === val ? 'var(--g200)' : 'var(--g100)', fontWeight: 600, fontSize: '0.9375rem' }}>
                {label}
              </div>
              <div style={{ color: 'var(--g400)', fontSize: '0.75rem', marginTop: 2 }}>{desc}</div>
            </div>
            {profile.goal === val && (
              <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Step 5: Confirm calculated targets ──────────────────────────── */
function StepConfirm({ profile, targets }) {
  return (
    <div>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', color: 'var(--g100)', fontSize: '1.875rem', marginBottom: 8 }}>
        Hey, {profile.name}!
      </h1>
      <p style={{ color: 'var(--g300)', marginBottom: 28, lineHeight: 1.6 }}>
        Here are your personalised daily targets based on your stats.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Protein', val: `${targets.protein.goal}g`, sub: `${targets.protein.min}–${targets.protein.max}g` },
          { label: 'Calories', val: targets.calories.goal, sub: `${targets.calories.min}–${targets.calories.max}` },
          { label: 'Water', val: `${targets.water.goal}L`, sub: `min ${targets.water.min}L` },
        ].map(({ label, val, sub }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.07)', borderRadius: 'var(--r16)',
            padding: '16px 12px', textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--amberL)', lineHeight: 1 }}>
              {val}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--g300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--g500)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--r16)', padding: 16 }}>
        {[
          ['👤', `${profile.name}, ${profile.age}y, ${profile.weight}kg, ${profile.height}cm`],
          ['🏃', ACTIVITY_LABELS[profile.activity]?.label],
          ['🎯', GOAL_LABELS[profile.goal]?.label],
        ].map(([emoji, text]) => (
          <div key={emoji} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, fontSize: '0.8125rem', color: 'var(--g200)' }}>
            <span>{emoji}</span><span>{text}</span>
          </div>
        ))}
        <p style={{ fontSize: '0.75rem', color: 'var(--g500)', marginTop: 8, lineHeight: 1.5 }}>
          You can update these anytime in Settings.
        </p>
      </div>
    </div>
  )
}
