import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';
import { MealSlot } from '../../components/diet/MealSlot';
import { getProfile, updateProfile, toggleFastFoodEaten, Profile } from '../../db/queries/profile';
import {
  getMealLogsForDate,
  upsertMealLog,
  toggleMealCompleted,
  MealLog,
} from '../../db/queries/mealLogs';
import { calculateCalorieTargets, CalorieTargets } from '../../utils/calories';
import { todayDateString } from '../../utils/date';
import { MEAL_OPTIONS, DIET_RULES, MealOption } from '../../constants/dietData';

export default function DietScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [fastFoodEaten, setFastFoodEaten] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayStr = todayDateString();

  const loadDietData = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      if (p) {
        setFastFoodEaten(p.fast_food_eaten_this_week === 1);
      }

      const meals = await getMealLogsForDate(todayStr);
      setMealLogs(meals);
    } catch (err) {
      console.error('Error loading diet data:', err);
    }
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadDietData();
    }, [loadDietData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDietData();
    setIsRefreshing(false);
  };

  const handleFastFoodToggle = async (val: boolean) => {
    setFastFoodEaten(val);
    await toggleFastFoodEaten(val);
  };

  const handleSaveMeal = async (
    slot: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    mealName: string,
    calories: number,
    proteinG: number,
    mealId: string
  ) => {
    await upsertMealLog(
      todayStr,
      slot,
      mealId,
      mealName,
      calories,
      proteinG,
      false
    );
    const updated = await getMealLogsForDate(todayStr);
    setMealLogs(updated);
  };

  const handleToggleMealDone = async (slot: string, currentCompleted: boolean) => {
    await toggleMealCompleted(todayStr, slot, !currentCompleted);
    const updated = await getMealLogsForDate(todayStr);
    setMealLogs(updated);
  };

  // Calculate targets from profile
  const targets: CalorieTargets = calculateCalorieTargets({
    weightKg: profile?.weight_kg || 74,
    heightCm: profile?.height_cm || 174,
    ageYears: profile?.age || 27,
    sex: profile?.sex || 'male',
    goal: profile?.goal || 'fat_loss',
  });

  // Calculate logged totals
  const totalCaloriesPlanned = mealLogs.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinPlanned = mealLogs.reduce((acc, m) => acc + m.protein_g, 0);

  const totalCaloriesEaten = mealLogs
    .filter((m) => m.completed === 1)
    .reduce((acc, m) => acc + m.calories, 0);
  const totalProteinEaten = mealLogs
    .filter((m) => m.completed === 1)
    .reduce((acc, m) => acc + m.protein_g, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="captionBold" color={Colors.accent} style={styles.subtitle}>
            INDIAN NUTRITION & MACROS
          </Typography>
          <Typography variant="h1">Diet & Fuel</Typography>
        </View>

        {/* Dynamic Macro Targets Dashboard */}
        <View style={styles.targetsCard}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.targetsTitle}>
            DAILY TARGETS ({profile?.goal?.toUpperCase() || 'FAT LOSS'})
          </Typography>

          <View style={styles.targetMetricsRow}>
            <View style={styles.targetMetric}>
              <Typography variant="caption" color={Colors.textMuted}>
                CALORIES
              </Typography>
              <Typography variant="monoLarge" color={Colors.accent}>
                {totalCaloriesEaten}
                <Typography variant="monoMedium" color={Colors.textMuted}>
                  {' '}/ {targets.targetCalories}
                </Typography>
              </Typography>
              <Typography variant="caption" color={Colors.textMuted}>
                Deficit of ~400 kcal
              </Typography>
            </View>

            <View style={styles.targetMetric}>
              <Typography variant="caption" color={Colors.textMuted}>
                PROTEIN
              </Typography>
              <Typography variant="monoLarge" color={Colors.accent}>
                {Math.round(totalProteinEaten)}
                <Typography variant="monoMedium" color={Colors.textMuted}>
                  {' '}/ {targets.proteinMinG}-{targets.proteinMaxG}g
                </Typography>
              </Typography>
              <Typography variant="caption" color={Colors.textMuted}>
                1.6 to 2.0 g / kg
              </Typography>
            </View>
          </View>
        </View>

        {/* Weekly Fast-Food Meal Toggle */}
        <View style={styles.fastFoodCard}>
          <View style={styles.fastFoodInfo}>
            <Typography variant="bodyBold">WEEKLY FAST-FOOD MEAL</Typography>
            <Typography variant="caption" color={Colors.textMuted}>
              1 meal per week permitted. Plan it guilt-free, then return to plan.
            </Typography>
          </View>

          <Switch
            value={fastFoodEaten}
            onValueChange={handleFastFoodToggle}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.textInverse}
          />
        </View>

        {/* Indian Meal Slots */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            INDIAN MEALS TODAY
          </Typography>

          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((slot) => {
            const currentLog = mealLogs.find((m) => m.slot === slot);
            const isCompleted = currentLog ? currentLog.completed === 1 : false;

            return (
              <MealSlot
                key={slot}
                slot={slot}
                selectedMealId={currentLog?.meal_id || ''}
                selectedMealName={currentLog?.meal_name || ''}
                calories={currentLog?.calories || 0}
                proteinG={currentLog?.protein_g || 0}
                completed={isCompleted}
                onSaveMeal={(name, cal, prot, mId) => handleSaveMeal(slot, name, cal, prot, mId)}
                onToggleComplete={() => handleToggleMealDone(slot, isCompleted)}
              />
            );
          })}
        </View>

        {/* What to Eat vs What Not to Eat Guidelines */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            FOOD GUIDELINES
          </Typography>

          <View style={styles.rulesCard}>
            <View>
              <Typography variant="captionBold" color={Colors.accent} style={styles.guideHeading}>
                WHAT TO EAT (RECOMMENDED CHOICES)
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                + Whole eggs, boiled egg whites, besan chilla
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                + Low-fat paneer, paneer bhurji, yellow tadka dal
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                + Soya chunks, kala chana, steamed moong sprouts
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                + Skinless chicken breast, grilled or tawa fish
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                + Homemade curd (dahi) with roasted cumin powder
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                + Fresh cucumber, tomato, and lemon salads
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                + 3.5 Liters of water throughout the day
              </Typography>
            </View>

            <View style={styles.guideDivider} />

            <View>
              <Typography variant="captionBold" color="#8B2500" style={styles.guideHeading}>
                WHAT NOT TO EAT (AVOID OR LIMIT)
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                - No sodas, canned juices, or sugary cold drinks
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                - No sugar in chai (max 1/4 teaspoon or green tea)
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                - Max 2 rotis at lunch; strictly 1 or 0 rotis at dinner
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                - Less rice (under 80g cooked weight; prefer brown rice)
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                - No biscuits, namkeen, bhujia, or fried snacks
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                - Finish dinner 2 to 3 hours before sleep
              </Typography>
              <Typography variant="body" style={styles.guideLine}>
                - Final week: strictly low salt and zero packaged food
              </Typography>
            </View>
          </View>
        </View>

        {/* Seeded Diet Rules */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            DIET RULES (SEED RULES)
          </Typography>

          <View style={styles.rulesCard}>
            {DIET_RULES.map((rule, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <Typography variant="monoBold" color={Colors.accent} style={styles.ruleBullet}>
                  {String(idx + 1).padStart(2, '0')}.
                </Typography>
                <Typography variant="body" style={styles.ruleText}>
                  {rule}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 24,
  },
  header: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  targetsCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  targetsTitle: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  targetMetricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  targetMetric: {
    flex: 1,
  },
  fastFoodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  fastFoodInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  rulesCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  ruleBullet: {
    width: 28,
    fontSize: 12,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    lineHeight: 20,
  },
  guideHeading: {
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  guideLine: {
    lineHeight: 22,
    marginBottom: 4,
  },
  guideDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
});
