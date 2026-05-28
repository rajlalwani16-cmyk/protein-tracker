# AI Dish Logger — Design Spec (Revised)
Date: 2026-05-28 (revised: unified input)

## Overview

Add AI-powered dish parsing to the existing Log Food search flow. No tab switcher — one unified input handles both search and custom dish description. Groq parses free-text descriptions into estimated protein/calories when the user asks.

## Unified Input Flow

The existing search bar gains two new buttons in the input row:
- **Mic button** (🎤) — Web Speech API, auto-fills the search input on result
- **Sparkle button** (✨) — always visible, taps to send current input text to Groq for AI parsing

The search-as-you-type behavior is **unchanged**. Users can still search normally.

### Two ways to trigger AI parse:

1. **Sparkle button** — always visible in input row, works even when search results exist
2. **"Parse as custom dish" prompt** — appears in the no-results state instead of just "no results"

### After AI parse triggers:

A confirmation card slides in below the search/results area:
- Dish name (read-only)
- Protein field (editable number, pre-filled by AI)
- Calories field (editable number, pre-filled by AI)
- Note: "AI estimate — adjust if needed"
- "Log this dish ✓" button → `addFreeLog` → toast → card dismisses, input clears

## Architecture

Three files changed from original spec (no tab switcher needed in LogFood):

| File | Change |
|------|--------|
| `src/utils/groq.js` | New — Groq API call, returns `{ dishName, protein, calories }` |
| `src/components/FoodSearch.jsx` | Add mic + sparkle buttons; "parse as dish" in no-results state; `onAiParse` prop callback |
| `src/components/AiDishLogger.jsx` | New — receives `query` prop, auto-calls Groq on mount, shows confirmation card |
| `src/pages/LogFood.jsx` | Add `aiQuery` state; pass `onAiParse` to FoodSearch; render AiDishLogger when `aiQuery` set |
| `.env` | New — `VITE_GROQ_API_KEY` |

## Component Communication

```
LogFood
  ├── aiQuery state (null | string)
  ├── FoodSearch  onAiParse={setAiQuery}
  └── AiDishLogger  query={aiQuery}  onDone={() => setAiQuery(null)}   [renders only when aiQuery set]
```

`FoodSearch` calls `onAiParse(query)` on sparkle tap or no-results parse tap.
`LogFood` sets `aiQuery` → `AiDishLogger` mounts → auto-calls Groq → shows card.
On log or dismiss, `onDone()` clears `aiQuery` → `AiDishLogger` unmounts.

## Groq Integration

- Model: `llama-3.1-8b-instant`
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- API key: `import.meta.env.VITE_GROQ_API_KEY`
- Response format: JSON mode
- Returns: `{ dishName, estimatedProteinG, estimatedCaloriesKcal }`
- Timeout: 15s
- User context baked into system prompt: adult male, Indian home cooking common, single serving

## Error Handling

- Groq down/timeout → error message in confirmation card area, dismiss button
- Web Speech unavailable (Safari) → mic button hidden
- Malformed AI response → "Couldn't parse — try rephrasing"
- Empty query → sparkle button disabled

## Out of Scope

- Saving AI-parsed dishes to My Recipes
- Ingredient-level breakdown
