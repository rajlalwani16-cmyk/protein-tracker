// Offline fallback database — ~150 common foods
// protein and calories are per 100g unless noted
export const FOOD_DB = [
  // ── Proteins ─────────────────────────────────────────────────────
  { name: 'Chicken Breast (cooked)', protein: 31, calories: 165, unit: '100g', tags: ['meat'] },
  { name: 'Chicken Thigh (cooked)', protein: 25, calories: 210, unit: '100g', tags: ['meat'] },
  { name: 'Egg (1 large)', protein: 6, calories: 70, unit: 'egg', tags: ['egg'], perUnit: true },
  { name: 'Egg White (1 large)', protein: 3.6, calories: 17, unit: 'white', tags: ['egg'], perUnit: true },
  { name: 'Canned Tuna (drained)', protein: 25, calories: 116, unit: '100g', tags: ['fish'] },
  { name: 'Salmon (cooked)', protein: 25, calories: 208, unit: '100g', tags: ['fish'] },
  { name: 'Paneer', protein: 18, calories: 296, unit: '100g', tags: ['dairy', 'indian'] },
  { name: 'Tofu (firm)', protein: 17, calories: 144, unit: '100g', tags: ['vegan'] },
  { name: 'Tofu (silken)', protein: 6, calories: 55, unit: '100g', tags: ['vegan'] },
  { name: 'Greek Yogurt (full fat)', protein: 10, calories: 97, unit: '100g', tags: ['dairy'] },
  { name: 'Greek Yogurt (0% fat)', protein: 10, calories: 59, unit: '100g', tags: ['dairy'] },
  { name: 'Cottage Cheese', protein: 11, calories: 98, unit: '100g', tags: ['dairy'] },
  { name: 'Whey Protein Shake', protein: 20, calories: 130, unit: 'serving (30g)', tags: ['supplement'], perUnit: true },
  { name: 'Milk (full fat)', protein: 3.4, calories: 61, unit: '100ml', tags: ['dairy'] },
  { name: 'Milk (skimmed)', protein: 3.4, calories: 35, unit: '100ml', tags: ['dairy'] },
  { name: 'Soy Milk', protein: 3.3, calories: 45, unit: '100ml', tags: ['vegan'] },

  // ── Legumes / Beans ───────────────────────────────────────────────
  { name: 'Chickpeas (cooked)', protein: 9, calories: 164, unit: '100g', tags: ['legume', 'vegan'] },
  { name: 'Red Lentils (cooked)', protein: 9, calories: 116, unit: '100g', tags: ['legume', 'vegan'] },
  { name: 'Green Lentils (cooked)', protein: 9, calories: 116, unit: '100g', tags: ['legume', 'vegan'] },
  { name: 'Kidney Beans (cooked)', protein: 9, calories: 127, unit: '100g', tags: ['legume', 'vegan', 'indian'] },
  { name: 'Black Beans (cooked)', protein: 9, calories: 132, unit: '100g', tags: ['legume', 'vegan'] },
  { name: 'Moong Dal (cooked)', protein: 7, calories: 105, unit: '100g', tags: ['legume', 'indian'] },
  { name: 'Soybean (cooked)', protein: 17, calories: 173, unit: '100g', tags: ['legume', 'vegan'] },

  // ── Grains ────────────────────────────────────────────────────────
  { name: 'White Rice (cooked)', protein: 2.7, calories: 130, unit: '100g', tags: ['grain'] },
  { name: 'Brown Rice (cooked)', protein: 2.6, calories: 112, unit: '100g', tags: ['grain'] },
  { name: 'Pasta (cooked)', protein: 5, calories: 158, unit: '100g', tags: ['grain'] },
  { name: 'Oats (dry)', protein: 13, calories: 389, unit: '100g', tags: ['grain'] },
  { name: 'Oats (cooked)', protein: 2.5, calories: 71, unit: '100g', tags: ['grain'] },
  { name: 'Bread (white, 1 slice)', protein: 3, calories: 79, unit: 'slice', tags: ['grain'], perUnit: true },
  { name: 'Bread (whole wheat, 1 slice)', protein: 4, calories: 81, unit: 'slice', tags: ['grain'], perUnit: true },
  { name: 'Roti / Chapati', protein: 3, calories: 80, unit: 'roti', tags: ['grain', 'indian'], perUnit: true },
  { name: 'Quinoa (cooked)', protein: 4.4, calories: 120, unit: '100g', tags: ['grain'] },
  { name: 'Upma (cooked)', protein: 3, calories: 110, unit: '100g', tags: ['grain', 'indian'] },
  { name: 'Poha (cooked)', protein: 2, calories: 100, unit: '100g', tags: ['grain', 'indian'] },

  // ── Nuts & Seeds ──────────────────────────────────────────────────
  { name: 'Peanuts', protein: 26, calories: 567, unit: '100g', tags: ['nut'] },
  { name: 'Peanut Butter', protein: 25, calories: 588, unit: '100g', tags: ['nut'] },
  { name: 'Almonds', protein: 21, calories: 579, unit: '100g', tags: ['nut'] },
  { name: 'Cashews', protein: 18, calories: 553, unit: '100g', tags: ['nut'] },
  { name: 'Sunflower Seeds', protein: 21, calories: 584, unit: '100g', tags: ['seed'] },
  { name: 'Chia Seeds', protein: 17, calories: 486, unit: '100g', tags: ['seed'] },

  // ── Vegetables ────────────────────────────────────────────────────
  { name: 'Spinach (cooked)', protein: 3, calories: 23, unit: '100g', tags: ['veg'] },
  { name: 'Broccoli', protein: 2.8, calories: 34, unit: '100g', tags: ['veg'] },
  { name: 'Capsicum / Bell Pepper', protein: 1, calories: 31, unit: '100g', tags: ['veg'] },
  { name: 'Mushrooms (cooked)', protein: 3.6, calories: 35, unit: '100g', tags: ['veg'] },
  { name: 'Potato (boiled)', protein: 2, calories: 87, unit: '100g', tags: ['veg'] },
  { name: 'Sweet Potato (boiled)', protein: 1.6, calories: 90, unit: '100g', tags: ['veg'] },
  { name: 'Tomato', protein: 0.9, calories: 18, unit: '100g', tags: ['veg'] },
  { name: 'Onion', protein: 1.1, calories: 40, unit: '100g', tags: ['veg'] },

  // ── Fruits ────────────────────────────────────────────────────────
  { name: 'Banana (1 medium)', protein: 1.3, calories: 105, unit: 'banana', tags: ['fruit'], perUnit: true },
  { name: 'Pear (1 medium)', protein: 0.4, calories: 100, unit: 'pear', tags: ['fruit'], perUnit: true },
  { name: 'Apple (1 medium)', protein: 0.3, calories: 95, unit: 'apple', tags: ['fruit'], perUnit: true },
  { name: 'Mango (1 cup)', protein: 1.4, calories: 107, unit: 'cup', tags: ['fruit'], perUnit: true },
  { name: 'Orange (1 medium)', protein: 1.2, calories: 62, unit: 'orange', tags: ['fruit'], perUnit: true },

  // ── Indian Dishes ─────────────────────────────────────────────────
  { name: 'Dal Tadka (serving)', protein: 8, calories: 180, unit: 'serving', tags: ['indian'], perUnit: true },
  { name: 'Palak Paneer (serving)', protein: 12, calories: 280, unit: 'serving', tags: ['indian'], perUnit: true },
  { name: 'Butter Chicken (serving)', protein: 28, calories: 320, unit: 'serving', tags: ['indian', 'meat'], perUnit: true },
  { name: 'Chole (serving)', protein: 12, calories: 240, unit: 'serving', tags: ['indian', 'veg'], perUnit: true },
  { name: 'Biryani (chicken, serving)', protein: 20, calories: 450, unit: 'serving', tags: ['indian', 'meat'], perUnit: true },
  { name: 'Biryani (veg, serving)', protein: 8, calories: 380, unit: 'serving', tags: ['indian', 'veg'], perUnit: true },
  { name: 'Idli (1 piece)', protein: 2, calories: 39, unit: 'idli', tags: ['indian'], perUnit: true },
  { name: 'Dosa (plain)', protein: 4, calories: 165, unit: 'dosa', tags: ['indian'], perUnit: true },
  { name: 'Sambar (serving)', protein: 4, calories: 90, unit: 'serving', tags: ['indian'], perUnit: true },

  // ── Fast Food & Common Dishes ─────────────────────────────────────
  { name: 'Pizza (cheese, 1 slice)', protein: 12, calories: 285, unit: 'slice', tags: ['fastfood'], perUnit: true },
  { name: 'Pizza (pepperoni, 1 slice)', protein: 13, calories: 313, unit: 'slice', tags: ['fastfood'], perUnit: true },
  { name: 'Burger (beef, regular)', protein: 15, calories: 354, unit: 'burger', tags: ['fastfood'], perUnit: true },
  { name: 'Burger (chicken, regular)', protein: 14, calories: 300, unit: 'burger', tags: ['fastfood'], perUnit: true },
  { name: 'Ramen (bowl)', protein: 20, calories: 436, unit: 'bowl', tags: ['asian'], perUnit: true },
  { name: 'Mapo Tofu (serving)', protein: 14, calories: 200, unit: 'serving', tags: ['asian'], perUnit: true },
  { name: 'Fried Rice (serving)', protein: 8, calories: 290, unit: 'serving', tags: ['asian'], perUnit: true },
  { name: 'Pad Thai (serving)', protein: 16, calories: 380, unit: 'serving', tags: ['asian'], perUnit: true },
  { name: 'Sushi (salmon nigiri, 2pc)', protein: 12, calories: 130, unit: '2 pcs', tags: ['japanese'], perUnit: true },
  { name: 'Chips / French Fries (medium)', protein: 3, calories: 365, unit: 'serving', tags: ['fastfood'], perUnit: true },
  { name: 'Potato Chips (30g)', protein: 2, calories: 150, unit: '30g bag', tags: ['snack'], perUnit: true },

  // ── Snacks & Treats ───────────────────────────────────────────────
  { name: 'Chocolate (dark, 30g)', protein: 2, calories: 170, unit: '30g', tags: ['sweet'], perUnit: true },
  { name: 'Chocolate (milk, 30g)', protein: 2, calories: 155, unit: '30g', tags: ['sweet'], perUnit: true },
  { name: 'Ice Cream (2 scoops)', protein: 3, calories: 220, unit: '2 scoops', tags: ['sweet'], perUnit: true },
  { name: 'Biscuit / Cookie (1 piece)', protein: 1, calories: 70, unit: 'biscuit', tags: ['sweet'], perUnit: true },

  // ── Drinks ───────────────────────────────────────────────────────
  { name: 'Cola / Soda (330ml)', protein: 0, calories: 139, unit: 'can', tags: ['drink'], perUnit: true },
  { name: 'Orange Juice (200ml)', protein: 1, calories: 88, unit: 'glass', tags: ['drink'], perUnit: true },
  { name: 'Beer (330ml, regular)', protein: 1, calories: 154, unit: 'can', tags: ['alcohol'], perUnit: true },
  { name: 'Wine (150ml, red)', protein: 0.1, calories: 125, unit: 'glass', tags: ['alcohol'], perUnit: true },
  { name: 'Lassi (sweet, 250ml)', protein: 5, calories: 180, unit: 'glass', tags: ['indian', 'drink'], perUnit: true },
  { name: 'Chai with milk (150ml)', protein: 3, calories: 70, unit: 'cup', tags: ['indian', 'drink'], perUnit: true },
  { name: 'Coffee (black)', protein: 0.3, calories: 5, unit: '240ml', tags: ['drink'], perUnit: true },

  // ── Condiments / Extras ───────────────────────────────────────────
  { name: 'Olive Oil (1 tbsp)', protein: 0, calories: 119, unit: 'tbsp', tags: ['fat'], perUnit: true },
  { name: 'Butter (1 tsp)', protein: 0, calories: 36, unit: 'tsp', tags: ['fat'], perUnit: true },
  { name: 'Ghee (1 tsp)', protein: 0, calories: 45, unit: 'tsp', tags: ['fat', 'indian'], perUnit: true },
  { name: 'Honey (1 tbsp)', protein: 0.1, calories: 64, unit: 'tbsp', tags: ['sweet'], perUnit: true },
]

export function searchOfflineDB(query) {
  if (!query || query.trim().length < 2) return []
  const q = query.toLowerCase().trim()
  const words = q.split(/\s+/)

  return FOOD_DB
    .map(food => {
      const nameLower = food.name.toLowerCase()
      let score = 0
      if (nameLower === q) score = 100
      else if (nameLower.startsWith(q)) score = 80
      else if (nameLower.includes(q)) score = 60
      else {
        const matched = words.filter(w => nameLower.includes(w))
        score = (matched.length / words.length) * 40
      }
      return { ...food, score }
    })
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
}
