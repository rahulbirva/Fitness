import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontFamily, FontSize } from '../../constants/theme';
import { Typography } from '../ui/Typography';
import { Checkbox } from '../ui/Checkbox';
import {
  FOOD_DATABASE,
  MEAL_OPTIONS,
  FoodItem,
  FoodCategory,
  MealOption,
} from '../../constants/dietData';

interface MealSlotProps {
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  selectedMealId: string;
  selectedMealName: string;
  calories: number;
  proteinG: number;
  completed: boolean;
  onSaveMeal: (
    mealName: string,
    totalCalories: number,
    totalProtein: number,
    mealId: string
  ) => void;
  onToggleComplete: () => void;
}

const SLOT_TITLES: Record<string, string> = {
  breakfast: 'BREAKFAST',
  lunch: 'LUNCH',
  snack: 'EVENING SNACK',
  dinner: 'DINNER',
};

const CATEGORIES: { key: FoodCategory | 'combos'; label: string }[] = [
  { key: 'all', label: 'ALL FOODS' },
  { key: 'roti', label: 'ROTI & BREADS' },
  { key: 'rice', label: 'RICE & BIRYANI' },
  { key: 'dosa', label: 'DOSA & SOUTH' },
  { key: 'curry', label: 'CURRIES & DALS' },
  { key: 'fry', label: 'FRYS & SABZI' },
  { key: 'drink', label: 'DRINKS' },
  { key: 'snack', label: 'SNACKS & STREET' },
  { key: 'sweet', label: 'SWEETS & DESSERT' },
  { key: 'combos', label: 'QUICK COMBOS' },
];

export function MealSlot({
  slot,
  selectedMealId,
  selectedMealName,
  calories,
  proteinG,
  completed,
  onSaveMeal,
  onToggleComplete,
}: MealSlotProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FoodCategory | 'combos'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, number>>({});

  const availableCombos = useMemo(() => {
    return MEAL_OPTIONS.filter((m) => m.slot === slot);
  }, [slot]);

  // Filtered food items based on category and search
  const filteredFoods = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FOOD_DATABASE.filter((f) => {
      const matchesCat = activeCategory === 'all' || f.category === activeCategory;
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Compute live cart totals
  const { currentTotalCalories, currentTotalProtein, totalItemCount } = useMemo(() => {
    let cal = 0;
    let prot = 0;
    let count = 0;

    Object.entries(selectedItemsMap).forEach(([foodId, qty]) => {
      if (qty > 0) {
        const item = FOOD_DATABASE.find((f) => f.id === foodId);
        if (item) {
          cal += item.calories * qty;
          prot += item.proteinG * qty;
          count += qty;
        }
      }
    });

    return {
      currentTotalCalories: cal,
      currentTotalProtein: Math.round(prot * 10) / 10,
      totalItemCount: count,
    };
  }, [selectedItemsMap]);

  const handleIncrement = (foodId: string) => {
    setSelectedItemsMap((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
  };

  const handleDecrement = (foodId: string) => {
    setSelectedItemsMap((prev) => {
      const current = prev[foodId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[foodId];
        return copy;
      }
      return { ...prev, [foodId]: current - 1 };
    });
  };

  const handleConfirmCustomMeal = () => {
    const activeEntries = Object.entries(selectedItemsMap).filter(([_, qty]) => qty > 0);
    if (activeEntries.length === 0) {
      setModalVisible(false);
      return;
    }

    const itemNames: string[] = [];
    const itemIds: string[] = [];

    activeEntries.forEach(([foodId, qty]) => {
      const food = FOOD_DATABASE.find((f) => f.id === foodId);
      if (food) {
        itemNames.push(qty > 1 ? `${qty}x ${food.name}` : food.name);
        itemIds.push(`${foodId}:${qty}`);
      }
    });

    const combinedName = itemNames.join(' + ');
    onSaveMeal(combinedName, currentTotalCalories, currentTotalProtein, itemIds.join(','));
    setModalVisible(false);
  };

  const handleSelectCombo = (combo: MealOption) => {
    onSaveMeal(combo.name, combo.calories, combo.proteinG, combo.id);
    setModalVisible(false);
  };

  const handleOpenModal = () => {
    setSelectedItemsMap({});
    setSearchQuery('');
    setActiveCategory('all');
    setModalVisible(true);
  };

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.slotHeader}>
          <Typography variant="captionBold" color={Colors.accent}>
            {SLOT_TITLES[slot]}
          </Typography>
        </View>

        <TouchableOpacity
          onPress={handleOpenModal}
          style={styles.changeBtn}
          activeOpacity={0.7}
        >
          <Typography variant="captionBold" color={Colors.accent}>
            SELECT / CUSTOMIZE
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Main Meal Display */}
      <View style={styles.contentRow}>
        <View style={styles.mealInfo}>
          <Typography
            variant="bodyBold"
            color={completed ? Colors.textMuted : Colors.text}
            style={completed ? styles.strikethrough : undefined}
            numberOfLines={3}
          >
            {selectedMealName || 'Tap Select / Customize to choose foods'}
          </Typography>

          <View style={styles.macroRow}>
            <Typography variant="monoMedium" color={Colors.accent}>
              {calories} kcal
            </Typography>
            <Typography variant="caption" color={Colors.borderStrong}> | </Typography>
            <Typography variant="monoMedium" color={Colors.accent}>
              {proteinG}g protein
            </Typography>
          </View>
        </View>

        {/* Checkbox */}
        <Checkbox
          checked={completed}
          onToggle={onToggleComplete}
          label=""
        />
      </View>

      {/* Full Indian Food Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Typography variant="captionBold" color={Colors.accent}>
                INDIAN MEAL BUILDER
              </Typography>
              <Typography variant="h3">
                {SLOT_TITLES[slot]}
              </Typography>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Typography variant="bodyBold" color={Colors.textMuted}>
                CLOSE
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search roti, dosa, chicken, dal, fry, lassi..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Horizontal Category Selector */}
          <View style={styles.categoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => setActiveCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Typography
                      variant="captionBold"
                      color={isActive ? Colors.textInverse : Colors.text}
                    >
                      {cat.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Live Nutrition Summary Bar (when items selected) */}
          {totalItemCount > 0 ? (
            <View style={styles.liveSummaryBar}>
              <View style={styles.liveSummaryLeft}>
                <Typography variant="captionBold" color={Colors.accent}>
                  {totalItemCount} ITEM{totalItemCount > 1 ? 'S' : ''} SELECTED
                </Typography>
                <Typography variant="monoLarge" color={Colors.text}>
                  {currentTotalCalories} kcal{' '}
                  <Typography variant="monoMedium" color={Colors.accent}>
                    ({currentTotalProtein}g P)
                  </Typography>
                </Typography>
              </View>

              <TouchableOpacity
                style={styles.confirmSelectionBtn}
                onPress={handleConfirmCustomMeal}
                activeOpacity={0.8}
              >
                <Typography variant="captionBold" color={Colors.textInverse}>
                  ADD TO {slot.toUpperCase()}
                </Typography>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Food List */}
          {activeCategory === 'combos' ? (
            <FlatList
              data={availableCombos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.foodList}
              ListHeaderComponent={
                <Typography variant="captionBold" color={Colors.textMuted} style={styles.listSectionTitle}>
                  QUICK COMPLETE MEAL COMBOS (1-TAP LOG)
                </Typography>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.comboCard}
                  onPress={() => handleSelectCombo(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.comboHeader}>
                    <Typography variant="bodyBold" style={{ flex: 1, marginRight: 8 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="monoMedium" color={Colors.accent}>
                      {item.calories} kcal
                    </Typography>
                  </View>
                  <Typography variant="caption" color={Colors.textMuted} style={{ marginTop: 2 }}>
                    {item.ingredients}
                  </Typography>
                  <View style={styles.comboFooter}>
                    <Typography variant="monoMedium" color={Colors.accent}>
                      {item.proteinG}g Protein
                    </Typography>
                    <Typography variant="captionBold" color={Colors.accent}>
                      [SELECT COMBO]
                    </Typography>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <FlatList
              data={filteredFoods}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.foodList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Typography variant="body" color={Colors.textMuted}>
                    No food items found matching "{searchQuery}".
                  </Typography>
                </View>
              }
              renderItem={({ item }) => {
                const qty = selectedItemsMap[item.id] || 0;
                return (
                  <View style={[styles.foodRow, qty > 0 && styles.foodRowSelected]}>
                    <View style={styles.foodDetails}>
                      <View style={styles.foodTitleRow}>
                        <View
                          style={[
                            styles.dietDot,
                            item.vegetarian ? styles.dietDotVeg : styles.dietDotNonVeg,
                          ]}
                        />
                        <Typography variant="bodyBold" style={styles.foodName}>
                          {item.name}
                        </Typography>
                      </View>

                      <Typography variant="caption" color={Colors.textMuted}>
                        Portion: {item.portion}
                      </Typography>

                      <Typography variant="monoMedium" color={Colors.accent} style={{ marginTop: 2 }}>
                        {item.calories} kcal • {item.proteinG}g P • {item.carbG}g C • {item.fatG}g F
                      </Typography>
                    </View>

                    {/* Quantity Selector [-] Qty [+] */}
                    <View style={styles.stepperContainer}>
                      {qty > 0 ? (
                        <>
                          <TouchableOpacity
                            style={styles.stepBtn}
                            onPress={() => handleDecrement(item.id)}
                            activeOpacity={0.7}
                          >
                            <Typography variant="bodyBold" color={Colors.text}>
                              -
                            </Typography>
                          </TouchableOpacity>

                          <View style={styles.qtyBox}>
                            <Typography variant="monoBold" color={Colors.accent}>
                              {qty}
                            </Typography>
                          </View>
                        </>
                      ) : null}

                      <TouchableOpacity
                        style={[styles.stepBtn, qty === 0 && styles.addBtnFirst]}
                        onPress={() => handleIncrement(item.id)}
                        activeOpacity={0.7}
                      >
                        <Typography
                          variant="captionBold"
                          color={qty === 0 ? Colors.textInverse : Colors.text}
                        >
                          {qty === 0 ? '+ ADD' : '+'}
                        </Typography>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm + 4,
  },
  cardCompleted: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  slotHeader: {
    marginRight: Spacing.sm,
  },
  changeBtn: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    paddingBottom: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  modalSafe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseBtn: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm + 2,
    fontSize: FontSize.md,
    fontFamily: FontFamily.sans,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  categoriesWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  liveSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
  },
  liveSummaryLeft: {
    flex: 1,
  },
  confirmSelectionBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  foodList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 24,
  },
  listSectionTitle: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  foodRowSelected: {
    backgroundColor: Colors.surface,
  },
  foodDetails: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  foodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dietDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
    marginRight: 6,
  },
  dietDotVeg: {
    backgroundColor: '#2D5016',
  },
  dietDotNonVeg: {
    backgroundColor: '#8B2500',
  },
  foodName: {
    flex: 1,
    fontSize: FontSize.md,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  addBtnFirst: {
    width: 60,
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  qtyBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  comboCard: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm + 2,
    backgroundColor: Colors.surface,
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  comboFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs + 2,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
