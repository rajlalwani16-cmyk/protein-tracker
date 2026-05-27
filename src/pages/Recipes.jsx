import { useState } from 'react'
import { RECIPES } from '../data/recipes.js'
import RecipeCard from '../components/RecipeCard.jsx'
import ProteinReference from '../components/ProteinReference.jsx'

const FILTER_TAGS = ['All', 'High Protein', 'Quick', 'Vegetarian', 'Indian', 'Vegan']

export default function Recipes() {
  const [filter, setFilter] = useState('All')
  const [showRef, setShowRef] = useState(false)

  const filtered = filter === 'All'
    ? RECIPES
    : RECIPES.filter(r => r.tags?.includes(filter))

  return (
    <div className="page page-enter">
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
          Recipes
        </h1>
        <p style={{ color: 'var(--g300)', fontSize: '0.8125rem' }}>
          10 high-protein recipes — tap to expand
        </p>
      </div>

      <div className="page-content" style={{ paddingTop: 20 }}>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 4, scrollbarWidth: 'none' }}>
          {FILTER_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: 'var(--rFull)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1.5px solid',
                transition: 'all 150ms',
                borderColor: filter === tag ? 'var(--g400)' : 'var(--border2)',
                background: filter === tag ? 'var(--g700)' : 'var(--surf)',
                color: filter === tag ? 'var(--g100)' : 'var(--txt3)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <p className="caption" style={{ marginBottom: 12 }}>
          {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
        </p>

        <div className="recipe-grid">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <p>No recipes for "{filter}"</p>
            </div>
          )}
        </div>

        {/* Protein Reference */}
        <div className="section-header" style={{ marginTop: 28 }}>
          <h2>Protein Quick Reference</h2>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowRef(r => !r)}
          >
            {showRef ? 'Hide' : 'Show'}
          </button>
        </div>
        {showRef && (
          <div className="card" style={{ marginBottom: 8 }}>
            <ProteinReference />
          </div>
        )}
      </div>
    </div>
  )
}
