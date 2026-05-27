// Compute personalized daily targets from user profile
export function computeTargets(profile) {
  const { sex = 'male', age = 25, weight = 70, height = 170, activity = 'sedentary', goal = 'loss' } = profile

  // BMR — Mifflin-St Jeor
  const bmr = sex === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161

  // TDEE
  const activityMult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }
  const tdee = bmr * (activityMult[activity] || 1.2)

  // Calorie target
  const calorieAdj = { loss: -400, maintain: 0, gain: 250 }
  const calGoal = Math.max(1200, Math.round(tdee + (calorieAdj[goal] ?? -400)))

  // Protein (g/kg body weight)
  const proteinPerKg = { loss: 1.8, maintain: 1.6, gain: 2.0 }
  const proteinGoal = Math.round(weight * (proteinPerKg[goal] || 1.8))

  // Water (35ml/kg, capped 2–4L)
  const waterGoal = Math.min(4, Math.max(2, Math.round((weight * 35) / 100) / 10))

  return {
    protein: {
      min: Math.round(proteinGoal * 0.94),
      max: Math.round(proteinGoal * 1.06),
      goal: proteinGoal
    },
    calories: {
      min: calGoal - 100,
      max: calGoal + 100,
      goal: calGoal
    },
    water: {
      min: Math.max(2, waterGoal - 0.25),
      max: waterGoal + 0.5,
      goal: waterGoal,
      glassML: 250
    }
  }
}

export const DEFAULT_PROFILE = {
  name: '',
  sex: 'male',
  age: 25,
  weight: 70,
  height: 170,
  activity: 'sedentary',
  goal: 'loss'
}

export const ACTIVITY_LABELS = {
  sedentary: { label: 'Sedentary', desc: 'Desk job, little or no exercise', emoji: '🪑' },
  light:     { label: 'Lightly Active', desc: '1–3 days/week light exercise', emoji: '🚶' },
  moderate:  { label: 'Moderately Active', desc: '3–5 days/week moderate exercise', emoji: '🏃' },
  active:    { label: 'Very Active', desc: '6–7 days/week hard training', emoji: '🏋️' }
}

export const GOAL_LABELS = {
  loss:     { label: 'Lose Fat', desc: '~400 kcal deficit, high protein to preserve muscle', emoji: '🔥' },
  maintain: { label: 'Maintain', desc: 'Eat at TDEE, balanced macros', emoji: '⚖️' },
  gain:     { label: 'Build Muscle', desc: '~250 kcal surplus, maximum protein', emoji: '💪' }
}
