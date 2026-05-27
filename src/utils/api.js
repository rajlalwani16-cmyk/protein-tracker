const OFF_BASE = 'https://world.openfoodfacts.org'

export async function searchByBarcode(barcode) {
  const url = `${OFF_BASE}/api/v0/product/${barcode}.json`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  if (data.status !== 1 || !data.product) return null
  return parseProduct(data.product)
}

export async function searchByName(query, limit = 8) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(limit),
    fields: 'product_name,brands,nutriments,serving_size,serving_quantity'
  })
  const url = `${OFF_BASE}/cgi/search.pl?${params}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  if (!data.products) return []
  return data.products
    .map(parseProduct)
    .filter(p => p && p.name && (p.protein > 0 || p.calories > 0))
    .slice(0, limit)
}

function parseProduct(p) {
  if (!p) return null
  const n = p.nutriments || {}
  const protein = roundNutrient(n['proteins_100g'] || n['proteins'] || 0)
  const calories = roundNutrient(n['energy-kcal_100g'] || (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0) || n['energy-kcal'] || 0)
  return {
    name: [p.product_name, p.brands].filter(Boolean).join(' — ').slice(0, 60) || 'Unknown Product',
    protein,
    calories,
    servingSize: p.serving_size || '100g',
    per: '100g'
  }
}

function roundNutrient(val) {
  return Math.round(parseFloat(val) * 10) / 10 || 0
}
