import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { parseDescriptionWithGroq } from '../utils/groq.js'

export default function AiDishLogger({ query, dateKey, onDone }) {
  const { addFreeLog } = useApp()
  const [status, setStatus] = useState('loading') // loading | parsed | error
  const [result, setResult] = useState(null)
  const [protein, setProtein] = useState('')
  const [calories, setCalories] = useState('')
  const [error, setError] = useState('')
  const [refining, setRefining] = useState(false)
  const [refineText, setRefineText] = useState(query)

  const runParse = (description, cancelled) => {
    setStatus('loading')
    setError('')
    parseDescriptionWithGroq(description)
      .then(parsed => {
        if (cancelled?.value) return
        setResult(parsed)
        setProtein(String(parsed.protein))
        setCalories(String(parsed.calories))
        setRefineText(description)
        setRefining(false)
        setStatus('parsed')
      })
      .catch(err => {
        if (cancelled?.value) return
        setError(err.message || "Couldn't parse — try rephrasing")
        setStatus('error')
      })
  }

  useEffect(() => {
    const cancelled = { value: false }
    runParse(query, cancelled)
    return () => { cancelled.value = true }
  }, [query])

  const handleRefine = () => {
    if (!refineText.trim()) return
    runParse(refineText, null)
  }

  const handleLog = () => {
    addFreeLog(dateKey, {
      name: result.dishName,
      protein: Number(protein) || 0,
      calories: Number(calories) || 0,
      quantity: 1,
      unit: 'serving',
    })
    onDone()
  }

  if (status === 'loading') {
    return (
      <div style={{
        background: 'var(--surf)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r16)',
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
      }}>
        <div className="spinner" style={{ width: 18, height: 18, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--txt)' }}>Estimating nutrition…</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--txt3)', marginTop: 2 }}>"{refineText || query}"</div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{
        background: 'var(--surf)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r16)',
        padding: 16,
        marginTop: 8,
      }}>
        <p style={{ fontSize: '0.875rem', color: '#c0392b', marginBottom: 12 }}>{error}</p>
        <button
          onClick={onDone}
          style={{
            padding: '8px 16px',
            background: 'var(--surf2)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r8)',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', color: 'var(--txt2)',
          }}
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surf)',
      border: '1.5px solid var(--border2)',
      borderRadius: 'var(--r16)',
      padding: 16,
      marginTop: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🍱</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--txt)' }}>{result.dishName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>AI estimate · tap values to adjust</div>
        </div>
        <button
          onClick={onDone}
          aria-label="Dismiss"
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--txt4)', padding: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Editable macro boxes */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Protein', value: protein, setter: setProtein, unit: 'grams' },
          { label: 'Calories', value: calories, setter: setCalories, unit: 'kcal' },
        ].map(({ label, value, setter, unit }) => (
          <div key={label} style={{
            flex: 1, background: 'var(--g50)',
            borderRadius: 10, padding: '10px 12px',
          }}>
            <label style={{
              fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--txt3)', display: 'block', marginBottom: 2,
            }}>
              {label}
            </label>
            <input
              type="number"
              value={value}
              min="0"
              onChange={e => setter(e.target.value)}
              style={{
                width: '100%', border: 'none', background: 'transparent',
                fontSize: '1.125rem', fontWeight: 700, color: 'var(--g600)',
                fontFamily: 'inherit', outline: 'none', padding: 0,
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>{unit}</span>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: '0.75rem', color: 'var(--txt4)',
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        AI estimates — adjust if portion was larger or smaller
      </p>

      <button
        onClick={handleLog}
        style={{
          width: '100%', padding: 13,
          background: 'var(--g700)', color: 'white',
          border: 'none', borderRadius: 'var(--r12)',
          fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
          marginBottom: 10,
        }}
      >
        Log this dish ✓
      </button>

      {/* Refine estimate */}
      {!refining ? (
        <button
          onClick={() => setRefining(true)}
          style={{
            width: '100%', padding: '9px 14px',
            background: 'transparent',
            border: '1.5px dashed var(--border2)',
            borderRadius: 'var(--r10, var(--r8))',
            fontSize: '0.8125rem', color: 'var(--txt3)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            <path d="M11 8v6M8 11h6"/>
          </svg>
          Refine estimate — add portion size or ingredients
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={refineText}
            onChange={e => setRefineText(e.target.value)}
            placeholder="e.g. with extra ghee, thick portion, served with 2 rotis…"
            rows={2}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid var(--border2)',
              borderRadius: 'var(--r12)',
              fontSize: '0.875rem',
              background: 'var(--surf)',
              color: 'var(--txt)',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setRefining(false)}
              style={{
                flex: 1, padding: '9px 0',
                background: 'transparent',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r8)',
                fontSize: '0.875rem', color: 'var(--txt3)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRefine}
              disabled={!refineText.trim()}
              style={{
                flex: 2, padding: '9px 0',
                background: 'var(--g700)', color: 'white',
                border: 'none', borderRadius: 'var(--r8)',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Re-estimate ↻
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
