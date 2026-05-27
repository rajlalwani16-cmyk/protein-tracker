import { useState, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { searchByName, searchByBarcode } from '../utils/api.js'
import { searchOfflineDB } from '../data/foodDatabase.js'
import { scaleNutrition } from '../utils/nutrition.js'
import BarcodeScanner from './BarcodeScanner.jsx'

export default function FoodSearch({ dateKey }) {
  const { addFreeLog, showToast } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(100)
  const [qtyUnit, setQtyUnit] = useState('g')
  const debounceRef = useRef(null)

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return }
    setLoading(true)

    // Always show offline results immediately
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

  return (
    <>
      {showScanner && (
        <BarcodeScanner
          onDetect={handleBarcode}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="food-search-wrap">
        <svg className="food-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          className="food-search-input"
          placeholder="Search any food — pizza, dal, eggs…"
          value={query}
          onChange={handleQueryChange}
          aria-label="Search food"
          autoComplete="off"
        />
        <button
          className="barcode-btn"
          onClick={() => setShowScanner(true)}
          aria-label="Scan barcode"
          title="Scan barcode"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/>
            <path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>
          </svg>
        </button>
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
          <p>No results for "{query}".<br />Try a simpler term or check spelling.</p>
        </div>
      )}
    </>
  )
}
