import { calculateCalorieTargets } from '../src/utils/calories';

describe('calculateCalorieTargets', () => {
  it('calculates Mifflin-St Jeor BMR correctly for male profile', () => {
    // 75kg, 175cm, 28 years old, male, fat_loss
    // BMR = 10*75 + 6.25*175 - 5*28 + 5 = 750 + 1093.75 - 140 + 5 = 1708.75 ~ 1709
    // Maintenance = 1709 * 1.55 = 2648.95 ~ 2649
    // Fat loss target = 2649 - 400 = 2249
    const targets = calculateCalorieTargets({
      weightKg: 75,
      heightCm: 175,
      ageYears: 28,
      sex: 'male',
      goal: 'fat_loss',
    });

    expect(targets.bmr).toBe(1709);
    expect(targets.maintenanceCalories).toBe(2649);
    expect(targets.targetCalories).toBe(2249);
    expect(targets.proteinMinG).toBe(120); // 75 * 1.6
    expect(targets.proteinMaxG).toBe(150); // 75 * 2.0
    expect(targets.fatG).toBe(62); // (2249 * 0.25) / 9 = 62.47
    expect(targets.carbG).toBeGreaterThan(200);
  });

  it('calculates Mifflin-St Jeor BMR correctly for female profile', () => {
    // 60kg, 162cm, 26 years old, female, fat_loss
    // BMR = 10*60 + 6.25*162 - 5*26 - 161 = 600 + 1012.5 - 130 - 161 = 1321.5 ~ 1322
    // Maintenance = 1322 * 1.55 = 2049
    // Target = 2049 - 400 = 1649
    const targets = calculateCalorieTargets({
      weightKg: 60,
      heightCm: 162,
      ageYears: 26,
      sex: 'female',
      goal: 'fat_loss',
    });

    expect(targets.bmr).toBe(1322);
    expect(targets.maintenanceCalories).toBe(2049);
    expect(targets.targetCalories).toBe(1649);
    expect(targets.proteinMinG).toBe(96); // 60 * 1.6
    expect(targets.proteinMaxG).toBe(120); // 60 * 2.0
  });

  it('handles maintain and muscle_gain goals properly', () => {
    const base = {
      weightKg: 70,
      heightCm: 170,
      ageYears: 25,
      sex: 'male' as const,
    };

    const maintain = calculateCalorieTargets({ ...base, goal: 'maintain' });
    const fatLoss = calculateCalorieTargets({ ...base, goal: 'fat_loss' });
    const muscleGain = calculateCalorieTargets({ ...base, goal: 'muscle_gain' });

    expect(fatLoss.targetCalories).toBe(maintain.targetCalories - 400);
    expect(muscleGain.targetCalories).toBe(maintain.targetCalories + 300);
  });
});
