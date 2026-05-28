import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayKey } from '../utils/date.js'
import FoodSearch from '../components/FoodSearch.jsx'
import AiDishLogger from '../components/AiDishLogger.jsx'
import { RECIPES } from '../data/recipes.js'

function QuickRecipes({ dateKey }) {
  const { addFreeLog, showToast } = useApp()
  const [added, setAdded] = useState(null)

  const handleAdd = (recipe) => {
    addFreeLog(dateKey, {
      name: recipe.name,
      protein: recipe.protein,
      calories: recipe.calories,
      quantity: 1,
      unit: 'serving'
    })
    setAdded(recipe.id)
    setTimeout(() => setAdded(null), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {RECIPES.map(recipe => (
        <div
          key={recipe.id}
          className="logged-item"
          style={{ background: added === recipe.id ? 'var(--g50)' : 'var(--surf)', border: '1.5px solid var(--border)', borderRadius: 'var(--r12)', padding: '10px 14px' }}
        >
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{recipe.emoji}</span>
          <div className="logged-item-info">
            <div className="logged-item-name" style={{ fontWeight: 600 }}>{recipe.name}</div>
            <div className="logged-item-detail">
              <strong style={{ color: 'var(--g600)' }}>{recipe.protein}g protein</strong>
              {' · '}{recipe.calories} kcal · 1 serving · {recipe.time} min
            </div>
          </div>
          <button
            className="add-food-btn"
            onClick={() => handleAdd(recipe)}
            aria-label={`Log ${recipe.name}`}
            style={added === recipe.id ? { background: 'var(--g500)' } : {}}
          >
            {added === recipe.id
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            }
          </button>
        </div>
      ))}
    </div>
  )
}

export default function LogFood() {
  const { getDay, removeFreeLog } = useApp()
  const dateKey = todayKey()
  const dayLog = getDay(dateKey)
  const logged = dayLog.freeLog || []
  const [aiQuery, setAiQuery] = useState(null)

  const totalProtein = logged.reduce((s, i) => s + (i.protein || 0), 0).toFixed(1)
  const totalCalories = logged.reduce((s, i) => s + (i.calories || 0), 0)

  return (
    <div className="page page-enter">
      {/* Header */}
      <div style={{
        background: 'var(--g700)',
        padding: 'calc(var(--safeT) + 20px) 20px 28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -30,
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)'
        }} />
        <h1 style={{ color: 'var(--g100)', fontFamily: 'Fraunces, serif', fontSize: '1.625rem', marginBottom: 4 }}>
          Log Food
        </h1>
        <p style={{ color: 'var(--g300)', fontSize: '0.8125rem' }}>
          Search any food, dish, or scan a barcode
        </p>
        {logged.length > 0 && (
          <div style={{
            marginTop: 14,
            display: 'flex', gap: 12,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--r12)',
            padding: '10px 14px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: 'white', fontWeight: 700 }}>
                {totalProtein}g
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--g300)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Logged protein
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: 'white', fontWeight: 700 }}>
                {totalCalories}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--g300)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Logged kcal
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="page-content" style={{ paddingTop: 20 }}>
        {/* Search + AI parse */}
        <FoodSearch dateKey={dateKey} onAiParse={setAiQuery} />
        {aiQuery && (
          <AiDishLogger
            query={aiQuery}
            dateKey={dateKey}
            onDone={() => setAiQuery(null)}
          />
        )}

        {/* Quick Log — My Recipes */}
        <div className="section-header" style={{ marginTop: 20 }}>
          <h2>My Recipes</h2>
          <span className="caption">1 tap to log</span>
        </div>
        <QuickRecipes dateKey={dateKey} />

        {/* Tips banner — first use */}
        {logged.length === 0 && (
          <div style={{
            marginTop: 24,
            background: 'var(--surf)',
            borderRadius: 'var(--r16)',
            padding: 16,
            border: '1.5px dashed var(--border2)'
          }}>
            <p className="label" style={{ marginBottom: 10 }}>Quick tips</p>
            {[
              '🔍 Type a food name — "chicken breast", "dal", "pizza slice"',
              '📷 Tap the barcode icon to scan packaged foods',
              '⚖️ Adjust the quantity before adding for accurate tracking',
              '📶 Offline? 150 common foods work without internet',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 3 ? 8 : 0, fontSize: '0.8125rem', color: 'var(--txt3)', lineHeight: 1.5 }}>
                {tip}
              </div>
            ))}
          </div>
        )}

        {/* Logged items */}
        {logged.length > 0 && (
          <>
            <div className="section-header">
              <h2>Today's Custom Log</h2>
              <span className="caption">{logged.length} item{logged.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...logged].reverse().map(item => (
                <div key={item.id} className="logged-item">
                  <div className="logged-dot" />
                  <div className="logged-item-info">
                    <div className="logged-item-name" style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className="logged-item-detail">
                      {item.quantity}{item.unit}
                      {' · '}<strong style={{ color: 'var(--g600)' }}>{item.protein}g protein</strong>
                      {' · '}{item.calories} kcal
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
