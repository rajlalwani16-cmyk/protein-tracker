# AI Dish Logger — Design Spec
Date: 2026-05-28

## Overview

Add an AI-powered "Describe a Dish" mode to the Log Food page. User types or speaks a free-form description of what they cooked/ate; Groq LLM parses it and returns estimated protein and calories; user confirms (with optional edits) and logs.

## Entry Point

The existing search bar area on LogFood is replaced by a segmented tab control:

- **Search tab** — renders existing `FoodSearch` component unchanged
- **Describe tab** — renders new `AiDishLogger` component

Default active tab: Search (existing behaviour preserved).

## AiDishLogger Component Flow

1. Textarea with placeholder: `"e.g. made rice with 2 eggs and some dal, or leftover chicken curry with roti"`
2. Mic button (top-right of textarea) — uses Web Speech API (`SpeechRecognition`), auto-fills textarea on result; falls back gracefully if API unavailable (button hidden)
3. "Parse with AI" button — disabled when textarea is empty
4. **Loading state**: button shows spinner, textarea disabled
5. **Confirmation card** (replaces parse button area after successful parse):
   - Dish name (read-only display)
   - Protein field (editable number input, pre-filled by AI)
   - Calories field (editable number input, pre-filled by AI)
   - Note: "AI estimate — adjust if portion was larger or smaller"
   - "Log this dish ✓" button → calls `addFreeLog` → toast → resets component
6. **Error state**: inline error message below textarea if Groq call fails; textarea re-enabled

## Groq Integration

**File:** `src/utils/groq.js`

- Model: `llama-3.1-8b-instant`
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- API key: `import.meta.env.VITE_GROQ_API_KEY` (stored in `.env`, git-ignored)
- Response format: JSON mode (`response_format: { type: "json_object" }`)
- Prompt instructs model to return: `{ dishName: string, estimatedProteinG: number, estimatedCaloriesKcal: number }`
- Prompt includes user context: adult male, Indian cooking common, estimate for 1 typical home-cooked serving
- Timeout: 15s; on timeout show error state

## API Key Storage

Key stored as `VITE_GROQ_API_KEY` in `.env` at project root (already git-ignored via default Vite setup). Baked into bundle at build time. Acceptable for personal-use PWA; key can be rotated if ever exposed.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/LogFood.jsx` | Replace search bar with tab switcher; render `FoodSearch` or `AiDishLogger` based on active tab |
| `src/components/AiDishLogger.jsx` | New component — full describe/parse/confirm flow |
| `src/utils/groq.js` | New utility — Groq API call, prompt, JSON parsing |
| `.env` | New file — `VITE_GROQ_API_KEY=<key>` |

## Data Shape Logged

Calls existing `addFreeLog(dateKey, { name, protein, calories, quantity: 1, unit: 'serving' })` — no schema changes.

## Error Handling

- Groq API down / timeout → show inline error, re-enable textarea
- Web Speech API unavailable (Safari, no mic permission) → mic button hidden, text-only mode
- Empty response / malformed JSON from LLM → show error "Couldn't parse — try rephrasing"
- API key missing → console.error only (dev), graceful error message in UI

## Out of Scope

- Ingredient-level breakdown display (show dish name only, not per-ingredient list)
- Saving custom dishes to My Recipes from this flow
- Voice input on desktop (Web Speech is mobile-focused; desktop gets text-only)
