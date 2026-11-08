import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { EXERCISES, Exercise } from '../../constants/exercises';
import { ExerciseAnimation } from '../../components/animations/ExerciseAnimation';

const CATEGORIES = ['ALL', 'UPPER', 'LOWER', 'CORE', 'CARDIO'] as const;

export default function LibraryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const filteredExercises = EXERCISES.filter((ex) => {
    if (selectedCategory === 'ALL') return true;
    return ex.category.toUpperCase() === selectedCategory;
  });

  const handleOpenYoutube = (query: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  if (activeExercise) {
    const hasAnimation = activeExercise.hasAnimation;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContainer}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setActiveExercise(null)}
            activeOpacity={0.7}
          >
            <Typography variant="bodyBold" color={Colors.accent}>
              {'< ALL EXERCISES'}
            </Typography>
          </TouchableOpacity>

          <Typography variant="captionBold" color={Colors.accent} style={styles.categoryBadge}>
            {activeExercise.category.toUpperCase()}
          </Typography>

          <Typography variant="h1" style={styles.exerciseName}>
            {activeExercise.name}
          </Typography>

          {/* Muscle Tags */}
          <View style={styles.tagsRow}>
            {activeExercise.targetMuscles.map((muscle) => (
              <View key={muscle} style={styles.muscleTag}>
                <Typography variant="caption" color={Colors.text}>
                  {muscle}
                </Typography>
              </View>
            ))}
          </View>

          {/* SVG Stick-Figure Animation Loop */}
          <View style={styles.animationBox}>
            <Typography variant="captionBold" color={Colors.textMuted} style={styles.animHeader}>
              STICK-FIGURE FORM LOOP
            </Typography>
            <ExerciseAnimation
              exerciseId={activeExercise.id}
              width={260}
              height={170}
            />
          </View>

          {/* YouTube Search Link */}
          <TouchableOpacity
            style={styles.ytBtn}
            onPress={() => handleOpenYoutube(activeExercise.youtubeQuery)}
            activeOpacity={0.7}
          >
            <Typography variant="bodyBold" color={Colors.accent}>
              SEARCH FORM TUTORIAL ON YOUTUBE {'>'}
            </Typography>
          </TouchableOpacity>

          {/* How-To Steps */}
          <View style={styles.section}>
            <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionTitle}>
              HOW TO PERFORM (STEP BY STEP)
            </Typography>
            {activeExercise.steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Typography variant="monoMedium" color={Colors.accent}>
                    {idx + 1}
                  </Typography>
                </View>
                <Typography variant="body" style={styles.stepText}>
                  {step}
                </Typography>
              </View>
            ))}
          </View>

          {/* Common Mistakes */}
          <View style={styles.section}>
            <Typography variant="captionBold" color={Colors.error} style={styles.sectionTitle}>
              COMMON MISTAKES TO AVOID
            </Typography>
            {activeExercise.commonMistakes.map((mistake, idx) => (
              <View key={idx} style={styles.mistakeRow}>
                <Typography variant="monoBold" color={Colors.error} style={styles.bullet}>
                  X
                </Typography>
                <Typography variant="body" style={styles.mistakeText}>
                  {mistake}
                </Typography>
              </View>
            ))}
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionTitle}>
              EQUIPMENT NEEDED
            </Typography>
            <Typography variant="body">
              {activeExercise.equipment.join(', ')}
            </Typography>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Typography variant="captionBold" color={Colors.accent} style={styles.subtitle}>
          FORM & TECHNIQUE DIRECTORY
        </Typography>
        <Typography variant="h1">Exercise Library</Typography>

        {/* Filter categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Typography
                  variant="captionBold"
                  color={isActive ? Colors.textInverse : Colors.text}
                >
                  {cat}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => setActiveExercise(item)}
            activeOpacity={0.7}
          >
            <View style={styles.itemMain}>
              <Typography variant="captionBold" color={Colors.accent}>
                {item.category.toUpperCase()}
              </Typography>
              <Typography variant="bodyBold" style={styles.itemName}>
                {item.name}
              </Typography>
              <Typography variant="caption" color={Colors.textMuted} numberOfLines={1}>
                {item.targetMuscles.join(' • ')}
              </Typography>
            </View>

            <View style={styles.itemAction}>
              <Typography variant="captionBold" color={Colors.accent}>
                FORM & CUES {'>'}
              </Typography>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subtitle: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  filterBar: {
    marginTop: Spacing.sm,
  },
  filterContent: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  listContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 24,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  itemMain: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  itemName: {
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 2,
  },
  itemAction: {
    alignItems: 'flex-end',
  },
  scroll: {
    flex: 1,
  },
  detailContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 24,
  },
  backBtn: {
    marginBottom: Spacing.sm,
    paddingVertical: 4,
  },
  categoryBadge: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  exerciseName: {
    marginBottom: Spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  muscleTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  animationBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  animHeader: {
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: Spacing.xs,
  },
  ytBtn: {
    padding: Spacing.sm + 4,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 24,
    marginTop: 1,
  },
  mistakeText: {
    flex: 1,
    lineHeight: 20,
  },
});
