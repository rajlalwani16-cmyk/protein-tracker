const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

const SYSTEM_PROMPT = `You are a nutrition estimator for a personal food tracker. Given a description of a home-cooked meal or food eaten, return a JSON object with exactly these keys:
- dishName: short descriptive name (e.g. "Rice with Eggs & Dal")
- estimatedProteinG: estimated protein in grams (integer)
- estimatedCaloriesKcal: estimated calories in kcal (integer)

Rules:
- Assume a typical single home-cooked serving for an 80kg adult male
- Indian home cooking is common (rice, dal, roti, sabzi, eggs are frequent)
- If multiple dishes are described, sum protein and calories and combine dish names
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
