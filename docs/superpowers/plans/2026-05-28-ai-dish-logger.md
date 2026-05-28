# AI Dish Logger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Groq-powered "Describe a Dish" tab to the Log Food page so users can type or speak a meal description and get AI-estimated protein/calories to log.

**Architecture:** Three new/modified files. `src/utils/groq.js` handles the Groq API call and returns `{ dishName, protein, calories }`. `src/components/AiDishLogger.jsx` owns the full describe→parse→confirm UI. `src/pages/LogFood.jsx` gains a tab switcher that renders either the existing `FoodSearch` or new `AiDishLogger`. No schema changes — logging still calls existing `addFreeLog`.

**Tech Stack:** React 18, Vite (env vars via `import.meta.env`), Groq REST API (`llama-3.1-8b-instant`), Web Speech API (browser built-in)

---

### Task 1: Groq API utility

**Files:**
- Create: `src/utils/groq.js`
- Create: `.env` (git-ignored)

- [ ] **Step 1: Create `.env` with API key**

Create file `.env` at project root (already in `.gitignore` via Vite defaults):

```
VITE_GROQ_API_KEY=your_groq_key_here
```

- [ ] **Step 2: Create `src/utils/groq.js`**

```javascript
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

const SYSTEM_PROMPT = `You are a nutrition estimator for a personal food tracker. Given a description of a home-cooked meal or food eaten, return a JSON object with exactly these keys:
- dishName: short descriptive name (e.g. "Rice with Eggs & Dal")
- estimatedProteinG: estimated protein in grams (integer)
- estimatedCaloriesKcal: estimated calories in kcal (integer)

Rules:
- Assume a typical single home-cooked serving for an 80kg adult male
- Indian home cooking is common (rice, dal, roti, sabzi, eggs are frequent)
- If multiple dishes are described, sum protein and calories and combine the dish names
- Be realistic — do not overestimate protein
- Respond ONLY with valid JSON, no explanation`

export async function parseDescriptionWithGroq(description) {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key) throw new Error('VITE_GROQ_API_KEY not set')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description.trim() },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 150,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`)
    const data = await res.json()
    const parsed = JSON.parse(data.choices[0].message.content)

    if (!parsed.dishName || parsed.estimatedProteinG == null || parsed.estimatedCaloriesKcal == null) {
      throw new Error("Couldn't parse — try rephrasing")
    }

    return {
      dishName: parsed.dishName,
      protein: Math.round(parsed.estimatedProteinG),
      calories: Math.round(parsed.estimatedCaloriesKcal),
    }
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') throw new Error('Request timed out — check connection')
    throw err
  }
}
```

- [ ] **Step 3: Verify env var loads**

Run dev server (`npm run dev`), open browser console, type:
```javascript
import.meta.env.VITE_GROQ_API_KEY
```
Expected: the key string (not `undefined`). If `undefined`, restart the dev server — Vite requires restart after `.env` changes.

- [ ] **Step 4: Commit**

```bash
git add src/utils/groq.js .env
git commit -m "Add Groq API utility for AI dish parsing"
```

Note: `.env` will likely be blocked by `.gitignore`. If so, only commit `src/utils/groq.js`:
```bash
git add src/utils/groq.js
git commit -m "Add Groq API utility for AI dish parsing"
```

---

### Task 2: AiDishLogger component

**Files:**
- Create: `src/components/AiDishLogger.jsx`

- [ ] **Step 1: Create `src/components/AiDishLogger.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { parseDescriptionWithGroq } from '../utils/groq.js'

export default function AiDishLogger({ dateKey }) {
  const { addFreeLog } = useApp()
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | parsed | error
  const [result, setResult] = useState(null)
  const [protein, setProtein] = useState('')
  const [calories, setCalories] = useState('')
  const [error, setError] = useState('')
  const [micAvailable, setMicAvailable] = useState(false)
  const [listening, setListening] = useState(false)
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
      setText(e.results[0][0].transcript)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
  }, [])

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

  const handleParse = async () => {
    if (!text.trim()) return
    setStatus('loading')
    setError('')
    try {
      const parsed = await parseDescriptionWithGroq(text)
      setResult(parsed)
      setProtein(String(parsed.protein))
      setCalories(String(parsed.calories))
      setStatus('parsed')
    } catch (err) {
      setError(err.message || "Couldn't parse — try rephrasing")
      setStatus('error')
    }
  }

  const handleLog = () => {
    addFreeLog(dateKey, {
      name: result.dishName,
      protein: Number(protein) || 0,
      calories: Number(calories) || 0,
      quantity: 1,
      unit: 'serving',
    })
    setText('')
    setResult(null)
    setProtein('')
    setCalories('')
    setStatus('idle')
    setError('')
  }

  const canParse = text.trim().length > 0 && status !== 'loading'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{
        fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt3)',
        textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0,
      }}>
        What did you make?
      </p>

      <div style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); if (status === 'error') setStatus('idle') }}
          disabled={status === 'loading'}
          placeholder="e.g. made rice with 2 eggs and some dal, or leftover chicken curry with roti"
          rows={3}
          style={{
            width: '100%',
            padding: '12px 44px 12px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r12)',
            fontSize: '0.9375rem',
            background: 'var(--surf)',
            color: 'var(--txt)',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
          }}
        />
        {micAvailable && (
          <button
            onClick={toggleMic}
            aria-label={listening ? 'Stop listening' : 'Speak your meal'}
            style={{
              position: 'absolute', right: 10, top: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              color: listening ? '#e05c3a' : 'var(--txt3)',
              padding: 4,
            }}
          >
            {listening ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#e05c3a" stroke="#e05c3a" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {(status === 'error') && error && (
        <p style={{ fontSize: '0.8125rem', color: '#c0392b', margin: 0 }}>{error}</p>
      )}

      <button
        onClick={handleParse}
        disabled={!canParse}
        style={{
          width: '100%',
          padding: 13,
          background: status === 'parsed' ? 'var(--g500)' : 'var(--g700)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--r12)',
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: canParse ? 'pointer' : 'not-allowed',
          opacity: !text.trim() ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 0.15s',
        }}
      >
        {status === 'loading' ? (
          <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Parsing…</>
        ) : status === 'parsed' ? (
          '✓ Parsed — see below'
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Parse with AI
          </>
        )}
      </button>

      {status === 'parsed' && result && (
        <div style={{
          background: 'var(--surf)',
          border: '1.5px solid var(--border2)',
          borderRadius: 'var(--r16)',
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🍱</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--txt)' }}>{result.dishName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>AI estimate · tap values to adjust</div>
            </div>
          </div>

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
            }}
          >
            Log this dish ✓
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify component renders without errors**

Open `http://localhost:5173/log` in browser. Switch to Describe tab (not wired yet — this comes in Task 3). Check browser console has no import errors from `groq.js`.

- [ ] **Step 3: Commit**

```bash
git add src/components/AiDishLogger.jsx
git commit -m "Add AiDishLogger component with voice input and confirmation card"
```

---

### Task 3: Tab switcher in LogFood

**Files:**
- Modify: `src/pages/LogFood.jsx`

- [ ] **Step 1: Add tab state and imports at top of `LogFood.jsx`**

Replace the existing imports block (lines 1–5):

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { todayKey } from '../utils/date.js'
import FoodSearch from '../components/FoodSearch.jsx'
import AiDishLogger from '../components/AiDishLogger.jsx'
import { RECIPES } from '../data/recipes.js'
```

- [ ] **Step 2: Add `activeTab` state inside `LogFood` component**

In `LogFood()`, after the existing `const logged = ...` line, add:

```jsx
const [activeTab, setActiveTab] = useState('search')
```

- [ ] **Step 3: Replace the search section with tab switcher**

In the JSX, find this block (inside `<div className="page-content" ...>`):

```jsx
{/* Search */}
<FoodSearch dateKey={dateKey} />
```

Replace it with:

```jsx
{/* Tab switcher */}
<div style={{
  display: 'flex',
  background: 'var(--surf3)',
  borderRadius: 'var(--r12)',
  padding: 4,
  gap: 4,
  marginBottom: 4,
}}>
  {[
    { id: 'search', label: 'Search', icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    )},
    { id: 'describe', label: 'Describe', icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    )},
  ].map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      style={{
        flex: 1,
        padding: '9px 0',
        border: 'none',
        borderRadius: 'var(--r8)',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.15s',
        background: activeTab === tab.id ? 'var(--surf)' : 'transparent',
        color: activeTab === tab.id ? 'var(--txt)' : 'var(--txt3)',
        boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
      }}
    >
      {tab.icon}
      {tab.label}
    </button>
  ))}
</div>

{activeTab === 'search' && <FoodSearch dateKey={dateKey} />}
{activeTab === 'describe' && <AiDishLogger dateKey={dateKey} />}
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:5173/log`. Confirm:
- Two tabs visible: "Search" and "Describe"
- Search tab shows the existing search bar + barcode button
- Describe tab shows textarea + mic button (if on Chrome) + "Parse with AI" button
- Switching tabs works without page reload

- [ ] **Step 5: Test the full AI flow**

On the Describe tab:
1. Type: `rice with 2 eggs and some dal`
2. Tap "Parse with AI"
3. Spinner appears briefly
4. Confirmation card appears with dish name, protein (g), calories (kcal)
5. Edit a value to confirm inputs are editable
6. Tap "Log this dish ✓"
7. Toast appears with dish name
8. Component resets to empty textarea
9. Scroll down — dish appears in "Today's Custom Log" section

- [ ] **Step 6: Commit**

```bash
git add src/pages/LogFood.jsx
git commit -m "Add Search/Describe tab switcher to Log Food page"
```

---

### Task 4: Build and deploy

- [ ] **Step 1: Production build**

```bash
npm run build
```

Expected: no errors, `dist/` folder created.

- [ ] **Step 2: Deploy to Cloudflare Pages**

```bash
npx wrangler pages deploy dist --project-name protein-tracker
```

Or push to GitHub — Cloudflare Pages auto-deploys on push to `main`.

Note: `VITE_GROQ_API_KEY` must be set as an environment variable in the Cloudflare Pages dashboard (Settings → Environment variables) for the production build to include it. The `.env` file is local only.

- [ ] **Step 3: Delete mockup file**

```bash
git rm public/mockup.html
git commit -m "Remove design mockup"
```
