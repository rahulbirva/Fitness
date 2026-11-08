import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../ui/Typography';
import { Checkbox } from '../ui/Checkbox';
import { MEAL_OPTIONS, MealOption } from '../../constants/dietData';

interface MealSlotProps {
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  selectedMealId: string;
  selectedMealName: string;
  calories: number;
  proteinG: number;
  completed: boolean;
  onSelectMeal: (meal: MealOption) => void;
  onToggleComplete: () => void;
}

const SLOT_TITLES: Record<string, string> = {
  breakfast: 'BREAKFAST',
  lunch: 'LUNCH',
  snack: 'EVENING SNACK',
  dinner: 'DINNER',
};

export function MealSlot({
  slot,
  selectedMealId,
  selectedMealName,
  calories,
  proteinG,
  completed,
  onSelectMeal,
  onToggleComplete,
}: MealSlotProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const availableMeals = MEAL_OPTIONS.filter((m) => m.slot === slot);

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.slotHeader}>
          <Typography variant="captionBold" color={Colors.accent}>
            {SLOT_TITLES[slot]}
          </Typography>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.changeBtn}
          activeOpacity={0.7}
        >
          <Typography variant="captionBold" color={Colors.accent}>
            CHANGE MEAL
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Main Meal Item */}
      <View style={styles.contentRow}>
        <View style={styles.mealInfo}>
          <Typography
            variant="bodyBold"
            color={completed ? Colors.textMuted : Colors.text}
            style={completed ? styles.strikethrough : undefined}
          >
            {selectedMealName || 'Choose your meal'}
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

      {/* Modal for selecting alternative meals */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Typography variant="h3">
              SELECT {SLOT_TITLES[slot]}
            </Typography>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Typography variant="bodyBold" color={Colors.accent}>
                DONE
              </Typography>
            </TouchableOpacity>
          </View>

          <FlatList
            data={availableMeals}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedMealId;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                  onPress={() => {
                    onSelectMeal(item);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemHeader}>
                    <Typography variant="bodyBold" color={isSelected ? Colors.textInverse : Colors.text}>
                      {item.name}
                    </Typography>
                    <Typography
                      variant="monoMedium"
                      color={isSelected ? Colors.textInverse : Colors.accent}
                    >
                      {item.proteinG}g P
                    </Typography>
                  </View>

                  <Typography
                    variant="caption"
                    color={isSelected ? Colors.surface : Colors.textMuted}
                    style={styles.itemDesc}
                  >
                    {item.description}
                  </Typography>

                  <View style={styles.macroPillRow}>
                    <Typography
                      variant="monoMedium"
                      color={isSelected ? Colors.textInverse : Colors.textMuted}
                    >
                      {item.calories} kcal • {item.carbG}g C • {item.fatG}g F
                    </Typography>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseBtn: {
    minHeight: 40,
    justifyContent: 'center',
  },
  modalList: {
    padding: Spacing.md,
  },
  modalItem: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm + 4,
    backgroundColor: Colors.background,
  },
  modalItemSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  itemDesc: {
    marginBottom: Spacing.xs,
  },
  macroPillRow: {
    marginTop: 4,
  },
});
