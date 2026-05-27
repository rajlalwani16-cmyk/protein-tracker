import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayKey } from '../utils/date.js'

export default function RecipeCard({ recipe }) {
  const { addFreeLog, showToast } = useApp()
  const [open, setOpen] = useState(false)

  const handleLog = () => {
    addFreeLog(todayKey(), {
      name: recipe.name,
      protein: recipe.protein,
      calories: recipe.calories,
      quantity: 1,
      unit: 'serving'
    })
    showToast(`${recipe.name} logged for today!`)
  }

  return (
    <div className={`recipe-card${open ? ' open' : ''}`}>
      <div className="recipe-card-header" onClick={() => setOpen(o => !o)}>
        <div className="recipe-emoji" aria-hidden="true">{recipe.emoji}</div>
        <div className="recipe-info">
          <div className="recipe-name">{recipe.name}</div>
          <div className="recipe-chips">
            <span className="chip">
              <span>💪</span> {recipe.protein}g
            </span>
            <span className="chip">
              <span>🔥</span> {recipe.calories} kcal
            </span>
            {recipe.tags?.slice(0, 1).map(tag => (
              <span key={tag} className="chip">{tag}</span>
            ))}
          </div>
          <div className="recipe-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {recipe.time} min
          </div>
        </div>
        <svg className="recipe-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <div className="recipe-body">
        <div className="recipe-body-inner">
          <div className="recipe-section">
            <h3>Ingredients</h3>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="recipe-ingredient">{ing}</div>
            ))}
          </div>

          <div className="recipe-section">
            <h3>Steps</h3>
            {recipe.steps.map((step, i) => (
              <div key={i} className="recipe-step">
                <div className="step-num">{i + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>

          <button className="recipe-log-btn" onClick={handleLog}>
            Log this meal for today 📝
          </button>
        </div>
      </div>
    </div>
  )
}
