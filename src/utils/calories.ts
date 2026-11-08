export interface CalorieProfile {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: 'male' | 'female';
  goal: 'fat_loss' | 'maintain' | 'muscle_gain';
}

export interface CalorieTargets {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  proteinMinG: number;
  proteinMaxG: number;
  carbG: number;
  fatG: number;
}

/**
 * Calculates Mifflin-St Jeor BMR, Total Daily Energy Expenditure (TDEE),
 * and macronutrient targets based on goal and weight.
 */
export function calculateCalorieTargets(profile: CalorieProfile): CalorieTargets {
  const { weightKg, heightCm, ageYears, sex, goal } = profile;

  // Mifflin-St Jeor equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const bmr = sex === 'male' ? Math.round(base + 5) : Math.round(base - 161);

  // Moderate activity (1 hr workout 6 days/wk + 8-10k daily steps) = 1.55
  const maintenanceCalories = Math.round(bmr * 1.55);

  let targetCalories: number;
  switch (goal) {
    case 'fat_loss':
      targetCalories = Math.round(maintenanceCalories - 400);
      break;
    case 'muscle_gain':
      targetCalories = Math.round(maintenanceCalories + 300);
      break;
    case 'maintain':
    default:
      targetCalories = maintenanceCalories;
      break;
  }

  // Protein targets: 1.6 g to 2.0 g per kg of bodyweight
  const proteinMinG = Math.round(1.6 * weightKg);
  const proteinMaxG = Math.round(2.0 * weightKg);

  // Fat target: ~25% of target calories (9 kcal per gram)
  const fatCalories = targetCalories * 0.25;
  const fatG = Math.round(fatCalories / 9);

  // Carbs target: remaining calories after protein (using proteinMinG * 4 kcal) and fat
  const proteinCalories = proteinMinG * 4;
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - (fatG * 9));
  const carbG = Math.round(remainingCalories / 4);

  return {
    bmr,
    maintenanceCalories,
    targetCalories,
    proteinMinG,
    proteinMaxG,
    carbG,
    fatG,
  };
}
