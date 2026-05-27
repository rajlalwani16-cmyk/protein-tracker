import { useState } from 'react'
import { PROTEIN_REFERENCE } from '../data/proteinReference.js'

export default function ProteinReference() {
  const [q, setQ] = useState('')

  const filtered = q.trim().length < 1
    ? PROTEIN_REFERENCE
    : PROTEIN_REFERENCE.filter(r => r.food.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="ref-search-wrap" style={{ position: 'relative', marginBottom: 4 }}>
        <svg className="ref-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} aria-hidden>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          className="ref-search"
          placeholder="Search foods…"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Filter protein reference"
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="ref-table">
          <thead>
            <tr>
              <th>Food</th>
              <th>Note</th>
              <th>Protein / 100g</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{row.food}</td>
                <td style={{ color: 'var(--txt4)', fontSize: '0.75rem' }}>{row.note}</td>
                <td>{row.per100g}g</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--txt4)', padding: '24px 12px' }}>
                  No results for "{q}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
