import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { searchByName, searchByBarcode } from '../utils/api.js'
import { searchOfflineDB } from '../data/foodDatabase.js'
import { scaleNutrition } from '../utils/nutrition.js'
import { parseDescriptionWithGroq } from '../utils/groq.js'
import BarcodeScanner from './BarcodeScanner.jsx'

function isDescription(query) {
  const q = query.toLowerCase().trim()
  const words = q.split(/\s+/)
  let score = 0
  if (words.length > 4) score += 2
  else if (words.length > 2) score += 1
  if (/\b(made|cooked|had|ate|prepared|mixed|added|fried|boiled|grilled|baked|roasted|steamed|sauteed)\b/.test(q)) score += 3
  const connectors = (q.match(/\b(with|and|some|bit of|piece of|bowl of|cup of|scoop of|along with|on top)\b/g) || [])
  score += connectors.length * 1.5
  if (/\d+\s*(egg|piece|bowl|cup|roti|slice|scoop|serving|gram|ml|spoon|tsp|tbsp)/i.test(q)) score += 2
  if (/\b(a bowl|a cup|a plate|a piece|a scoop|a slice|half a|a bit of|some )\b/.test(q)) score += 1.5
  if (/\b(homemade|leftover|spicy|creamy|crispy|fresh|extra|drizzle|topped|sprinkled|little|lot of)\b/.test(q)) score += 1
  if (/\b(i made|i had|i ate|i cooked|we had|we ate|my )\b/.test(q)) score += 2
  return score >= 3
}

const btnStyle = {
  width: 36, height: 36, borderRadius: 'var(--r8)',
  background: 'var(--g50)', color: 'var(--g600)',
  border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}

export default function FoodSearch({ dateKey, onAiParse, suppressResults }) {
  const { addFreeLog, showToast } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(100)
  const [qtyUnit, setQtyUnit] = useState('g')
  const [editProtein, setEditProtein] = useState('')
  const [editCalories, setEditCalories] = useState('')
  const [nutritionLocked, setNutritionLocked] = useState(false)
  const [micAvailable, setMicAvailable] = useState(false)
  const [listening, setListening] = useState(false)
  const [descMode, setDescMode] = useState(false)

  // Inline AI estimate state (for search results — auto-triggered)
  const [inlineAi, setInlineAi] = useState({ status: 'idle', result: null, protein: '', calories: '' })

  const searchDebounceRef = useRef(null)
  const aiDebounceRef = useRef(null)
  const aiCancelRef = useRef({ cancelled: false })
  const queryRef = useRef('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setMicAvailable(true)
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-IN'
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      queryRef.current = transcript
      setListening(false)
      if (onAiParse) onAiParse(transcript)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
  }, [])

  const startInlineAi = useCallback((q) => {
    aiCancelRef.current.cancelled = true
    const token = { cancelled: false }
    aiCancelRef.current = token
    setInlineAi({ status: 'loading', result: null, protein: '', calories: '' })
    parseDescriptionWithGroq(q)
      .then(parsed => {
        if (token.cancelled) return
        setInlineAi({ status: 'done', result: parsed, protein: String(parsed.protein), calories: String(parsed.calories) })
      })
      .catch(() => {
        if (token.cancelled) return
        setInlineAi({ status: 'idle', result: null, protein: '', calories: '' })
      })
  }, [])

  const resetInlineAi = () => {
    aiCancelRef.current.cancelled = true
    setInlineAi({ status: 'idle', result: null, protein: '', calories: '' })
  }

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); resetInlineAi(); return }
    setLoading(true)
    resetInlineAi()
    const offline = searchOfflineDB(q)
    setResults(offline.map(f => ({ ...f, source: 'offline' })))
    if (offline.length > 0) startInlineAi(q)
    try {
      const online = await searchByName(q)
      if (online.length > 0) {
        setResults(prev => {
          const combined = [...online.map(f => ({ ...f, source: 'api' })), ...prev.filter(p => p.source === 'offline')]
          return combined.slice(0, 10)
        })
        // Start AI if not already running
        if (offline.length === 0) startInlineAi(q)
      }
    } catch { /* offline — keep offline results */ }
    finally { setLoading(false) }
  }, [startInlineAi])

  const handleQueryChange = (e) => {
    const q = e.target.value
    setQuery(q)
    queryRef.current = q
    if (onAiParse) onAiParse(null)
    resetInlineAi()
    clearTimeout(searchDebounceRef.current)
    clearTimeout(aiDebounceRef.current)
    if (!q.trim()) { setResults([]); setDescMode(false); return }
    const desc = isDescription(q)
    setDescMode(desc)
    if (desc) {
      aiDebounceRef.current = setTimeout(() => { if (onAiParse) onAiParse(queryRef.current) }, 700)
    } else {
      searchDebounceRef.current = setTimeout(() => doSearch(queryRef.current), 400)
    }
  }

  const handleBarcode = async (barcode) => {
    setShowScanner(false)
    setLoading(true)
    try {
      const product = await searchByBarcode(barcode)
      if (product) { setResults([{ ...product, source: 'barcode' }]); setQuery(product.name) }
      else showToast('Product not found in Open Food Facts')
    } catch { showToast('Could not fetch product — check connection') }
    finally { setLoading(false) }
  }

  const getScaled = (food, newQty) => scaleNutrition(food.protein, food.calories, newQty, food.perUnit ? 1 : 100)

  const handleSelect = (food) => {
    const defaultQty = food.perUnit ? 1 : 100
    setSelected(food)
    setQty(defaultQty)
    setQtyUnit(food.perUnit ? food.unit : 'g')
    setNutritionLocked(false)
    setEditProtein(String(food.protein))
    setEditCalories(String(food.calories))
  }

  const updateQty = (newQty) => {
    setQty(newQty)
    if (!nutritionLocked && selected) {
      const scaled = getScaled(selected, newQty)
      setEditProtein(scaled.protein.toFixed(1))
      setEditCalories(String(scaled.calories))
    }
  }

  const handleAdd = () => {
    if (!selected) return
    addFreeLog(dateKey, {
      name: selected.name,
      protein: Number(editProtein) || 0,
      calories: Number(editCalories) || 0,
      quantity: qty,
      unit: qtyUnit,
    })
    setSelected(null); setQuery(''); setResults([])
    setQty(100); setEditProtein(''); setEditCalories('')
    setNutritionLocked(false); setDescMode(false); resetInlineAi()
  }

  const handleInlineLog = () => {
    if (!inlineAi.result) return
    addFreeLog(dateKey, {
      name: inlineAi.result.dishName,
      protein: Number(inlineAi.protein) || 0,
      calories: Number(inlineAi.calories) || 0,
      quantity: 1,
      unit: 'serving',
    })
    setQuery(''); setResults([]); setDescMode(false); resetInlineAi()
  }

  const toggleMic = () => {
    if (!recognitionRef.current) return
    if (listening) { recognitionRef.current.stop(); setListening(false) }
    else { setListening(true); recognitionRef.current.start() }
  }

  const inputBorderColor = listening ? '#e05c3a' : descMode ? 'var(--g400)' : undefined
  const showEmptyMic = micAvailable && !query && !listening
  const showInlineMic = micAvailable && (!!query || listening)
  const hasResults = results.length > 0 && !loading && !suppressResults && !descMode
  const showInlineAiCard = hasResults && inlineAi.status !== 'idle'

  return (
    <>
      {showScanner && <BarcodeScanner onDetect={handleBarcode} onClose={() => setShowScanner(false)} />}

      {/* Search bar */}
      <div className="food-search-wrap">
        {listening ? (
          <div style={{
            height: 52, borderRadius: 'var(--r16)',
            border: '2px solid #e05c3a', background: 'var(--surf)',
            display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', background: '#e05c3a',
              animation: 'mic-pulse 1s ease-in-out infinite', flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.9375rem', color: 'var(--txt3)', flex: 1 }}>Listening…</span>
            <button onClick={toggleMic} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt3)', padding: 4, fontSize: '0.875rem' }}>
              ✕ Cancel
            </button>
          </div>
        ) : (
          <>
            <svg className="food-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              className="food-search-input"
              placeholder={descMode ? 'Describing a dish — keep going…' : 'Search food, or describe what you made…'}
              value={query}
              onChange={handleQueryChange}
              aria-label="Search food or describe a dish"
              autoComplete="off"
              style={{
                paddingRight: showInlineMic ? 90 : 52,
                borderColor: inputBorderColor,
                transition: 'border-color 0.2s',
              }}
            />
            {/* Buttons — all inline styles, no barcode-btn class inside flex */}
            <div style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
              {showInlineMic && (
                <button onClick={toggleMic} aria-label="Describe by voice" style={btnStyle}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="2" width="6" height="12" rx="3"/>
                    <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
                  </svg>
                </button>
              )}
              <button onClick={() => setShowScanner(true)} aria-label="Scan barcode" style={btnStyle}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/>
                  <path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Large speak button — only when input empty */}
      {showEmptyMic && (
        <button onClick={toggleMic} style={{
          width: '100%', marginTop: 10, padding: '13px 16px',
          background: 'var(--g50)', border: '1.5px dashed var(--border2)',
          borderRadius: 'var(--r12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: '0.9375rem', fontWeight: 600, color: 'var(--txt2)', cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="2" width="6" height="12" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
          </svg>
          Tap to describe what you ate
        </button>
      )}

      {/* AI mode hint */}
      {descMode && !suppressResults && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: '0.75rem', color: 'var(--g500)', fontWeight: 500 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Looks like a meal description — parsing with AI…
        </div>
      )}

      {loading && !descMode && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}><div className="spinner" /></div>
      )}

      {hasResults && (
        <div className="food-results">

          {/* Inline AI estimate card — auto-shown above results */}
          {showInlineAiCard && (
            <div style={{
              background: 'var(--g50)',
              border: '1.5px solid var(--g200)',
              borderRadius: 'var(--r16)',
              padding: 14,
              marginBottom: 8,
            }}>
              {inlineAi.status === 'loading' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="spinner" style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--txt)' }}>Estimating ~ {query}…</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--txt4)' }}>AI estimate for a typical serving</div>
                  </div>
                </div>
              )}

              {inlineAi.status === 'done' && inlineAi.result && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🍱</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--txt)' }}>~ {inlineAi.result.dishName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--txt4)' }}>AI estimate · typical serving</div>
                    </div>
                    <button onClick={resetInlineAi} aria-label="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt4)', padding: 2 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  {/* Editable macro boxes */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    {[
                      { label: 'Protein', value: inlineAi.protein, unit: 'g', setter: v => setInlineAi(p => ({ ...p, protein: v })) },
                      { label: 'Calories', value: inlineAi.calories, unit: 'kcal', setter: v => setInlineAi(p => ({ ...p, calories: v })) },
                    ].map(({ label, value, unit, setter }) => (
                      <div key={label} style={{
                        flex: 1, background: 'white', borderRadius: 8,
                        padding: '7px 10px',
                        border: '1.5px dashed var(--g300)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt4)' }}>{label}</span>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--txt4)" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                          <input type="number" value={value} min="0" onChange={e => setter(e.target.value)}
                            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--g600)', fontFamily: 'inherit', outline: 'none', padding: 0 }} />
                          <span style={{ fontSize: '0.65rem', color: 'var(--txt4)', flexShrink: 0 }}>{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleInlineLog} style={{
                    width: '100%', padding: '10px 0',
                    background: 'var(--g700)', color: 'white',
                    border: 'none', borderRadius: 'var(--r10, var(--r8))',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Log this dish ✓
                  </button>
                </>
              )}
            </div>
          )}

          {/* Database results */}
          {results.map((food, i) => (
            <div key={i}>
              <div className="food-result-item" style={selected === food ? { borderColor: 'var(--g400)', background: 'var(--g50)' } : {}}>
                <div className="food-result-info">
                  <div className="food-result-name">{food.name}</div>
                  <div className="food-result-macros">
                    <span className="food-result-macro"><span className="val">{food.protein}g</span> protein</span>
                    <span className="food-result-macro"><span className="val">{food.calories}</span> kcal</span>
                    <span className="food-result-macro" style={{ fontSize: '0.65rem' }}>per {food.perUnit ? food.unit : '100g'}</span>
                  </div>
                </div>
                <button className="add-food-btn" onClick={() => handleSelect(food)} aria-label={`Add ${food.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              </div>

              {selected === food && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 2px 4px' }}>
                  <div className="qty-picker">
                    <button className="qty-btn" onClick={() => updateQty(Math.max(1, qty - (food.perUnit ? 1 : 25)))} aria-label="Decrease">−</button>
                    <input type="number" className="qty-input" value={qty} min="1" onChange={e => updateQty(Math.max(1, Number(e.target.value)))} aria-label="Quantity" />
                    <span className="qty-unit">{qtyUnit}</span>
                    <button className="qty-btn" onClick={() => updateQty(qty + (food.perUnit ? 1 : 25))} aria-label="Increase">+</button>
                    <button className="btn btn--primary btn--sm" onClick={handleAdd} style={{ marginLeft: 'auto' }}>Add ✓</button>
                  </div>

                  {/* Editable nutrition — clearly styled */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[
                      { label: 'Protein', value: editProtein, setter: (v) => { setEditProtein(v); setNutritionLocked(true) }, unit: 'g' },
                      { label: 'Calories', value: editCalories, setter: (v) => { setEditCalories(v); setNutritionLocked(true) }, unit: 'kcal' },
                    ].map(({ label, value, setter, unit }) => (
                      <div key={label} style={{
                        flex: 1, background: 'var(--g50)', borderRadius: 8, padding: '6px 10px',
                        border: '1.5px dashed var(--g300)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--txt4)' }}>{label}</span>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--txt4)" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                          <input type="number" value={value} min="0" onChange={e => setter(e.target.value)}
                            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--g600)', fontFamily: 'inherit', outline: 'none', padding: 0 }} />
                          <span style={{ fontSize: '0.65rem', color: 'var(--txt4)', flexShrink: 0 }}>{unit}</span>
                        </div>
                      </div>
                    ))}
                    {nutritionLocked && (
                      <button onClick={() => { const s = getScaled(food, qty); setEditProtein(s.protein.toFixed(1)); setEditCalories(String(s.calories)); setNutritionLocked(false) }}
                        title="Reset" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt4)', padding: 4, fontSize: '0.875rem', flexShrink: 0 }}>↺</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && !loading && !descMode && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p style={{ marginBottom: onAiParse ? 12 : 0 }}>
            No results for "{query}".<br />Try a simpler term, or estimate it.
          </p>
          {onAiParse && (
            <button onClick={() => onAiParse(query)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', background: 'var(--g700)', color: 'white',
              border: 'none', borderRadius: 'var(--r12)',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              ~ Estimate it
            </button>
          )}
        </div>
      )}
    </>
  )
}
