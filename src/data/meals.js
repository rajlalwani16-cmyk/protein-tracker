export const PRESET_MEALS = [
  {
    id: 'overnightOats',
    name: 'Overnight Oats',
    description: 'Oats + milk + Greek yogurt + PB + pear',
    emoji: '🥣',
    protein: 28,
    calories: 420,
    slot: 'Morning',
    swaps: [
      { name: 'Egg Omelette + Toast', protein: 22, calories: 350, note: '3 eggs, 2 slices' },
      { name: 'Poha with Peanuts', protein: 10, calories: 320, note: 'Lower protein' },
      { name: 'Greek Yogurt Bowl', protein: 20, calories: 280, note: 'With honey + nuts' },
    ]
  },
  {
    id: 'eggs',
    name: '4 Boiled Eggs',
    description: 'Hard-boiled or fried, with salt & pepper',
    emoji: '🥚',
    protein: 28,
    calories: 280,
    slot: 'Midday',
    swaps: [
      { name: 'Canned Tuna on Crackers', protein: 25, calories: 260, note: 'Quick & easy' },
      { name: 'Paneer Snack (100g)', protein: 18, calories: 300, note: 'With chaat masala' },
      { name: 'Cottage Cheese Bowl', protein: 20, calories: 200, note: 'With fruit' },
    ]
  },
  {
    id: 'greekYogurt',
    name: 'Greek Yogurt',
    description: 'Small cup, plain or with berries',
    emoji: '🍦',
    protein: 10,
    calories: 100,
    slot: 'Snack',
    swaps: [
      { name: 'Handful of Peanuts (30g)', protein: 8, calories: 170, note: 'More calories' },
      { name: 'Hard Boiled Egg', protein: 6, calories: 70, note: 'Quick protein hit' },
      { name: 'Protein Bar', protein: 12, calories: 180, note: 'Convenient' },
    ]
  },
  {
    id: 'eveningMeal',
    name: 'Rajma Chawal',
    description: 'Kidney bean curry with rice',
    emoji: '🍛',
    protein: 20,
    calories: 500,
    slot: 'Evening',
    variant: 'rajma',
    variants: [
      { id: 'rajma', name: 'Rajma Chawal', emoji: '🍛', protein: 20, calories: 500 },
      { id: 'eggFriedRice', name: 'Egg Fried Rice + Chickpeas', emoji: '🍳', protein: 30, calories: 480 },
      { id: 'shakshuka', name: 'Shakshuka', emoji: '🍅', protein: 22, calories: 320 },
      { id: 'pastaCeci', name: 'Pasta e Ceci', emoji: '🍝', protein: 35, calories: 550 },
    ],
    swaps: [
      { name: 'Dal Tadka + Roti', protein: 16, calories: 450, note: 'Lighter option' },
      { name: 'Chole + Rice', protein: 18, calories: 520, note: 'Chickpea curry' },
      { name: 'Palak Paneer + Roti', protein: 22, calories: 480, note: 'Higher protein' },
    ]
  },
  {
    id: 'proteinShake',
    name: 'Protein Shake',
    description: 'Whey or plant protein, water or milk',
    emoji: '🥤',
    protein: 20,
    calories: 150,
    slot: 'Anytime',
    swaps: [
      { name: 'Milk (500ml)', protein: 16, calories: 240, note: 'Natural option' },
      { name: 'Sattu Drink', protein: 14, calories: 200, note: 'Traditional protein' },
      { name: 'Soy Milk (400ml)', protein: 14, calories: 180, note: 'Plant-based' },
    ]
  }
]

export const DAILY_TARGETS = {
  protein: { min: 100, max: 106, goal: 106 },
  calories: { min: 1800, max: 2000, goal: 1900 },
  water: { min: 2.5, max: 3.0, goal: 2.5, glassML: 250 }
}
