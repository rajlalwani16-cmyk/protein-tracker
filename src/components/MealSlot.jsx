import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function MealSlot({ meal, dateKey, slotState }) {
  const { toggleMeal, setMealVariant } = useApp()
  const [showSwap, setShowSwap] = useState(false)

  const checked = slotState?.checked || false
  const currentVariantId = slotState?.variant || meal.variant || null

  const activeVariant = meal.variants?.find(v => v.id === currentVariantId)
  const displayProtein = activeVariant ? activeVariant.protein : meal.protein
  const displayCalories = activeVariant ? activeVariant.calories : meal.calories
  const displayName = activeVariant ? activeVariant.name : meal.name
  const displayEmoji = activeVariant ? activeVariant.emoji : meal.emoji

  const handleCheck = () => toggleMeal(dateKey, meal.id)

  const handleVariantSelect = (variantId) => {
    setMealVariant(dateKey, meal.id, variantId)
    setShowSwap(false)
  }

  return (
    <>
      <div className={`meal-slot${checked ? ' checked' : ''}`}>
        <button
          className="meal-check-btn"
          onClick={handleCheck}
          aria-label={checked ? `Uncheck ${displayName}` : `Check ${displayName}`}
          aria-pressed={checked}
        >
          {checked ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : null}
        </button>

        <span className="meal-emoji" aria-hidden="true">{displayEmoji}</span>

        <div className="meal-info">
          <div className="meal-name">{displayName}</div>
          <div className="meal-macros">
            <span className="meal-macro"><strong>{displayProtein}g</strong> protein</span>
            <span className="meal-macro"><strong>{displayCalories}</strong> kcal</span>
          </div>
        </div>

        <div className="meal-actions">
          <span className="label" style={{ fontSize: '0.6rem', color: 'var(--txt4)' }}>{meal.slot}</span>
          <button
            className="swap-btn"
            onClick={() => setShowSwap(true)}
            aria-label={`Swap ${displayName}`}
          >
            ⇄ Swap
          </button>
        </div>
      </div>

      {showSwap && (
        <div className="swap-sheet">
          <div className="swap-backdrop" onClick={() => setShowSwap(false)} />
          <div className="swap-panel">
            <div className="swap-handle" />
            <h2 style={{ marginBottom: 4 }}>Swap {meal.slot} Meal</h2>
            <p className="caption" style={{ marginBottom: 16 }}>Choose an alternative with similar protein</p>

            {meal.variants ? (
              <>
                <p className="label" style={{ marginBottom: 8 }}>Variants</p>
                {meal.variants.map(v => (
                  <button
                    key={v.id}
                    className={`swap-option${currentVariantId === v.id ? ' selected' : ''}`}
                    onClick={() => handleVariantSelect(v.id)}
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{v.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{v.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--txt3)', marginTop: 2 }}>
                        {v.protein}g protein · {v.calories} kcal
                      </div>
                    </div>
                    {currentVariantId === v.id && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
                <div style={{ height: 16 }} />
              </>
            ) : null}

            {meal.swaps?.length > 0 && (
              <>
                <p className="label" style={{ marginBottom: 8 }}>Alternative meals</p>
                {meal.swaps.map((s, i) => (
                  <div key={i} className="swap-option">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--txt3)', marginTop: 2 }}>
                        {s.protein}g protein · {s.calories} kcal · {s.note}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <button
              className="btn btn--ghost w-full mt-4"
              onClick={() => setShowSwap(false)}
              style={{ justifyContent: 'center' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
