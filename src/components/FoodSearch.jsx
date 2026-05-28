import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { searchByName, searchByBarcode } from '../utils/api.js'
import { searchOfflineDB } from '../data/foodDatabase.js'
import { scaleNutrition } from '../utils/nutrition.js'
import BarcodeScanner from './BarcodeScanner.jsx'

export default function FoodSearch({ dateKey, onAiParse }) {
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
  const debounceRef = useRef(null)
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
      setListening(false)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSearch(transcript), 400)
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
    } catch {
      // Offline — keep offline results
    } finally {
      setLoading(false)
    }
  }, [])

  const handleQueryChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 400)
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
    const isPerUnit = food.perUnit
    setQty(isPerUnit ? 1 : 100)
    setQtyUnit(isPerUnit ? food.unit : 'g')
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
      unit: qtyUnit
    })
    setSelected(null)
    setQuery('')
    setResults([])
    setQty(100)
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

  const triggerAiParse = () => {
    if (query.trim() && onAiParse) onAiParse(query.trim())
  }

  return (
    <>
      {showScanner && (
        <BarcodeScanner
          onDetect={handleBarcode}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="food-search-wrap" style={{ position: 'relative' }}>
        <svg className="food-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          className="food-search-input"
          placeholder="Search or describe what you made…"
          value={query}
          onChange={handleQueryChange}
          aria-label="Search food or describe a dish"
          autoComplete="off"
          style={{ paddingRight: micAvailable ? 124 : 86 }}
        />
        <div style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: 2, alignItems: 'center',
        }}>
          {micAvailable && (
            <button
              onClick={toggleMic}
              aria-label={listening ? 'Stop listening' : 'Describe by voice'}
              title="Describe by voice"
              style={{
                width: 36, height: 36, borderRadius: 'var(--r8)',
                background: listening ? 'rgba(224,92,58,0.12)' : 'var(--g50)',
                color: listening ? '#e05c3a' : 'var(--g600)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {listening ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#e05c3a" stroke="#e05c3a" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="2" width="6" height="12" rx="3"/>
                  <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="2" width="6" height="12" rx="3"/>
                  <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
                </svg>
              )}
            </button>
          )}
          {onAiParse && (
            <button
              onClick={triggerAiParse}
              disabled={!query.trim()}
              aria-label="Parse as custom dish with AI"
              title="Parse as custom dish"
              style={{
                width: 36, height: 36, borderRadius: 'var(--r8)',
                background: 'var(--g50)', color: 'var(--g600)',
                border: 'none', cursor: query.trim() ? 'pointer' : 'not-allowed',
                opacity: query.trim() ? 1 : 0.4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowScanner(true)}
            aria-label="Scan barcode"
            title="Scan barcode"
            style={{
              width: 36, height: 36, borderRadius: 'var(--r8)',
              background: 'var(--g50)', color: 'var(--g600)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/>
              <path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>
            </svg>
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div className="spinner" />
        </div>
      )}

      {results.length > 0 && !loading && (
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
                    <span className="food-result-macro">
                      <span className="val">{food.protein}g</span> protein
                    </span>
                    <span className="food-result-macro">
                      <span className="val">{food.calories}</span> kcal
                    </span>
                    <span className="food-result-macro" style={{ fontSize: '0.65rem' }}>
                      per {food.perUnit ? food.unit : '100g'}
                    </span>
                  </div>
                </div>
                <button
                  className="add-food-btn"
                  onClick={() => handleSelect(food)}
                  aria-label={`Add ${food.name}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>

              {selected === food && (
                <div className="qty-picker">
                  <button
                    className="qty-btn"
                    onClick={() => setQty(q => Math.max(1, q - (food.perUnit ? 1 : 25)))}
                    aria-label="Decrease quantity"
                  >−</button>
                  <input
                    type="number"
                    className="qty-input"
                    value={qty}
                    min="1"
                    onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                    aria-label="Quantity"
                  />
                  <span className="qty-unit">{qtyUnit}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQty(q => q + (food.perUnit ? 1 : 25))}
                    aria-label="Increase quantity"
                  >+</button>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={handleAdd}
                    style={{ marginLeft: 'auto' }}
                  >
                    Add ✓
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p style={{ marginBottom: onAiParse ? 12 : 0 }}>
            No results for "{query}".<br />Try a simpler term or check spelling.
          </p>
          {onAiParse && (
            <button
              onClick={triggerAiParse}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 16px',
                background: 'var(--g700)', color: 'white',
                border: 'none', borderRadius: 'var(--r12)',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                marginTop: 4,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
