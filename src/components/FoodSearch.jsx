import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { searchByName, searchByBarcode } from '../utils/api.js'
import { searchOfflineDB } from '../data/foodDatabase.js'
import { scaleNutrition } from '../utils/nutrition.js'
import BarcodeScanner from './BarcodeScanner.jsx'

function isDescription(query) {
  const q = query.toLowerCase().trim()
  const words = q.split(/\s+/)
  let score = 0

  if (words.length > 4) score += 2
  else if (words.length > 2) score += 1

  // Strong: cooking/eating verbs
  if (/\b(made|cooked|had|ate|prepared|mixed|added|fried|boiled|grilled|baked|roasted|steamed|stir.fried|pan.fried|sauteed)\b/.test(q)) score += 3

  // Connectors — each one adds score
  const connectors = (q.match(/\b(with|and|some|bit of|piece of|bowl of|cup of|scoop of|along with|on the side|on top)\b/g) || [])
  score += connectors.length * 1.5

  // Quantity + food unit combos
  if (/\d+\s*(egg|piece|bowl|cup|roti|slice|scoop|serving|gram|ml|spoon|tsp|tbsp)/i.test(q)) score += 2
  if (/\b(a bowl|a cup|a plate|a piece|a scoop|a slice|half a|a bit of|some )\b/.test(q)) score += 1.5

  // Descriptive / context words
  if (/\b(homemade|leftover|spicy|creamy|crispy|fresh|extra|drizzle|topped|sprinkled|mixed|little|lot of)\b/.test(q)) score += 1

  // Personal context
  if (/\b(i made|i had|i ate|i cooked|we had|we ate|my )\b/.test(q)) score += 2

  return score >= 3
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
  const [micAvailable, setMicAvailable] = useState(false)
  const [listening, setListening] = useState(false)
  const [descMode, setDescMode] = useState(false)

  const searchDebounceRef = useRef(null)
  const aiDebounceRef = useRef(null)
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

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    const offline = searchOfflineDB(q)
    setResults(offline.map(f => ({ ...f, source: 'offline' })))
    try {
      const online = await searchByName(q)
      if (online.length > 0) {
        setResults(prev => {
          const combined = [...online.map(f => ({ ...f, source: 'api' })), ...prev.filter(p => p.source === 'offline')]
          return combined.slice(0, 10)
        })
      }
    } catch { /* offline — keep offline results */ }
    finally { setLoading(false) }
  }, [])

  const handleQueryChange = (e) => {
    const q = e.target.value
    setQuery(q)
    queryRef.current = q

    // Dismiss active AI card whenever user types
    if (onAiParse) onAiParse(null)

    clearTimeout(searchDebounceRef.current)
    clearTimeout(aiDebounceRef.current)

    if (!q.trim()) {
      setResults([])
      setDescMode(false)
      return
    }

    const desc = isDescription(q)
    setDescMode(desc)

    if (desc) {
      // Description mode: skip search, fire AI after 700ms
      aiDebounceRef.current = setTimeout(() => {
        if (onAiParse) onAiParse(queryRef.current)
      }, 700)
    } else {
      // Search mode: fire Open Food Facts after 400ms
      searchDebounceRef.current = setTimeout(() => doSearch(queryRef.current), 400)
    }
  }

  const handleBarcode = async (barcode) => {
    setShowScanner(false)
    setLoading(true)
    try {
      const product = await searchByBarcode(barcode)
      if (product) {
        setResults([{ ...product, source: 'barcode' }])
        setQuery(product.name)
      } else {
        showToast('Product not found in Open Food Facts')
      }
    } catch {
      showToast('Could not fetch product — check connection')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (food) => {
    setSelected(food)
    setQty(food.perUnit ? 1 : 100)
    setQtyUnit(food.perUnit ? food.unit : 'g')
  }

  const handleAdd = () => {
    if (!selected) return
    const baseQty = selected.perUnit ? 1 : 100
    const scaled = scaleNutrition(selected.protein, selected.calories, qty, baseQty)
    addFreeLog(dateKey, {
      name: selected.name,
      protein: scaled.protein,
      calories: scaled.calories,
      quantity: qty,
      unit: qtyUnit,
    })
    setSelected(null)
    setQuery('')
    setResults([])
    setQty(100)
    setDescMode(false)
  }

  const toggleMic = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setListening(true)
      recognitionRef.current.start()
    }
  }

  const inputBorderColor = listening
    ? '#e05c3a'
    : descMode
      ? 'var(--g400)'
      : undefined

  const showEmptyMic = micAvailable && !query && !listening
  const showInlineMic = micAvailable && (query || listening)

  return (
    <>
      {showScanner && (
        <BarcodeScanner onDetect={handleBarcode} onClose={() => setShowScanner(false)} />
      )}

      {/* Search bar */}
      <div className="food-search-wrap">
        {listening ? (
          /* Listening overlay replaces search bar content */
          <div style={{
            height: 52,
            borderRadius: 'var(--r16)',
            border: '2px solid #e05c3a',
            background: 'var(--surf)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#e05c3a',
              animation: 'mic-pulse 1s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.9375rem', color: 'var(--txt3)', flex: 1 }}>
              Listening…
            </span>
            <button
              onClick={toggleMic}
              aria-label="Stop listening"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--txt3)', padding: 4, fontSize: '0.875rem',
              }}
            >
              ✕ Cancel
            </button>
          </div>
        ) : (
          <>
            <svg className="food-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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
            {/* Inline buttons — only when there's text */}
            {showInlineMic && (
              <div style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                display: 'flex', gap: 4,
              }}>
                <button
                  onClick={toggleMic}
                  aria-label="Describe by voice"
                  style={{
                    width: 36, height: 36, borderRadius: 'var(--r8)',
                    background: 'var(--g50)', color: 'var(--g600)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="2" width="6" height="12" rx="3"/>
                    <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
                  </svg>
                </button>
                <button
                  className="barcode-btn"
                  onClick={() => setShowScanner(true)}
                  aria-label="Scan barcode"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/>
                    <path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>
                  </svg>
                </button>
              </div>
            )}
            {/* Barcode only when no text */}
            {!showInlineMic && (
              <button
                className="barcode-btn"
                onClick={() => setShowScanner(true)}
                aria-label="Scan barcode"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/>
                  <path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* Large speak button — only when input is empty */}
      {showEmptyMic && (
        <button
          onClick={toggleMic}
          style={{
            width: '100%', marginTop: 10,
            padding: '13px 16px',
            background: 'var(--g50)',
            border: '1.5px dashed var(--border2)',
            borderRadius: 'var(--r12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: '0.9375rem', fontWeight: 600, color: 'var(--txt2)',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="2" width="6" height="12" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
          </svg>
          Tap to describe what you ate
        </button>
      )}

      {/* AI mode hint */}
      {descMode && !suppressResults && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px',
          fontSize: '0.75rem', color: 'var(--g500)',
          fontWeight: 500,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Looks like a meal description — parsing with AI…
        </div>
      )}

      {loading && !descMode && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div className="spinner" />
        </div>
      )}

      {results.length > 0 && !loading && !suppressResults && !descMode && (
        <div className="food-results">
          {results.map((food, i) => (
            <div key={i}>
              <div
                className="food-result-item"
                style={selected === food ? { borderColor: 'var(--g400)', background: 'var(--g50)' } : {}}
              >
                <div className="food-result-info">
                  <div className="food-result-name">{food.name}</div>
                  <div className="food-result-macros">
                    <span className="food-result-macro"><span className="val">{food.protein}g</span> protein</span>
                    <span className="food-result-macro"><span className="val">{food.calories}</span> kcal</span>
                    <span className="food-result-macro" style={{ fontSize: '0.65rem' }}>
                      per {food.perUnit ? food.unit : '100g'}
                    </span>
                  </div>
                </div>
                <button className="add-food-btn" onClick={() => handleSelect(food)} aria-label={`Add ${food.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>

              {selected === food && (
                <div className="qty-picker">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - (food.perUnit ? 1 : 25)))} aria-label="Decrease">−</button>
                  <input type="number" className="qty-input" value={qty} min="1" onChange={e => setQty(Math.max(1, Number(e.target.value)))} aria-label="Quantity" />
                  <span className="qty-unit">{qtyUnit}</span>
                  <button className="qty-btn" onClick={() => setQty(q => q + (food.perUnit ? 1 : 25))} aria-label="Increase">+</button>
                  <button className="btn btn--primary btn--sm" onClick={handleAdd} style={{ marginLeft: 'auto' }}>Add ✓</button>
                </div>
              )}
            </div>
          ))}

          {onAiParse && (
            <button
              onClick={() => onAiParse(query)}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'transparent',
                border: '1.5px dashed var(--border2)',
                borderRadius: 'var(--r12)',
                fontSize: '0.8125rem', color: 'var(--txt3)',
                cursor: 'pointer', marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Not what you made? Parse as a custom dish
            </button>
          )}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && !loading && !descMode && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p style={{ marginBottom: onAiParse ? 12 : 0 }}>
            No results for "{query}".<br />Try a simpler term, or parse it as a custom dish.
          </p>
          {onAiParse && (
            <button
              onClick={() => onAiParse(query)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px',
                background: 'var(--g700)', color: 'white',
                border: 'none', borderRadius: 'var(--r12)',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Parse as a custom dish
            </button>
          )}
        </div>
      )}
    </>
  )
}
