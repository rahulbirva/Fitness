import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Svg, { Line, Rect, Circle } from 'react-native-svg';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getProfile, Profile } from '../../db/queries/profile';
import {
  getBodyMetrics,
  upsertBodyMetrics,
  getMetricForDate,
  BodyMetric,
} from '../../db/queries/bodyMetrics';
import { getCompletedDates } from '../../db/queries/workoutLogs';
import { todayDateString, formatDate, daysUntil } from '../../utils/date';
import { exportAllDataAsJSON, exportBodyMetricsAsCSV } from '../../services/export';

export default function ProgressScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metricsList, setMetricsList] = useState<BodyMetric[]>([]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayStr = todayDateString();

  const loadProgressData = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);

      const metrics = await getBodyMetrics(30);
      setMetricsList(metrics);

      const dates = await getCompletedDates();
      setCompletedDates(dates);

      // Populate today's values if present
      const todayMetric = await getMetricForDate(todayStr);
      if (todayMetric) {
        if (todayMetric.weight_kg !== null) setWeightInput(String(todayMetric.weight_kg));
        if (todayMetric.waist_cm !== null) setWaistInput(String(todayMetric.waist_cm));
        if (todayMetric.photo_path) setPhotoUri(todayMetric.photo_path);
      } else if (p) {
        setWeightInput(String(p.weight_kg));
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadProgressData();
    }, [loadProgressData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProgressData();
    setIsRefreshing(false);
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission',
          'Camera access is needed to capture your weekly progress photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.75,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const sourceUri = result.assets[0].uri;
        let targetUri = sourceUri;
        if (FileSystem.documentDirectory) {
          const targetFilename = `progress_photo_${Date.now()}.jpg`;
          targetUri = `${FileSystem.documentDirectory}${targetFilename}`;
          try {
            await FileSystem.copyAsync({
              from: sourceUri,
              to: targetUri,
            });
          } catch {
            targetUri = sourceUri;
          }
        }

        setPhotoUri(targetUri);
        await upsertBodyMetrics(todayStr, { photo_path: targetUri });
      }
    } catch (err) {
      console.error('Photo error:', err);
      Alert.alert('Photo Error', 'Could not save progress photo.');
    }
  };

  const handleSaveMetrics = async () => {
    setIsSaving(true);
    try {
      const w = parseFloat(weightInput.trim());
      const waist = parseFloat(waistInput.trim());

      await upsertBodyMetrics(todayStr, {
        weight_kg: !isNaN(w) ? w : undefined,
        waist_cm: !isNaN(waist) ? waist : undefined,
        photo_path: photoUri ?? undefined,
      });

      const updated = await getBodyMetrics(30);
      setMetricsList(updated);
      Alert.alert('Saved', "Today's metrics have been logged.");
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Could not save metrics.');
    } finally {
      setIsSaving(false);
    }
  };

  // Wedding countdown
  const countdownDays = profile?.wedding_date ? daysUntil(profile.wedding_date) : 30;

  // Streak & completion
  const streakDays = completedDates.length;
  const completionPercent = Math.round((streakDays / 30) * 100);

  // Filter metrics with valid numbers for charts
  const validWeights = metricsList
    .filter((m) => m.weight_kg !== null && m.weight_kg > 0)
    .slice(0, 10)
    .reverse();

  const validWaists = metricsList
    .filter((m) => m.waist_cm !== null && m.waist_cm > 0)
    .slice(0, 10)
    .reverse();

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
        {/* Wedding Countdown Banner */}
        <View style={styles.countdownBanner}>
          <Typography variant="captionBold" color={Colors.accent} style={styles.countdownSubtitle}>
            SISTER'S WEDDING COUNTDOWN
          </Typography>
          <Typography variant="monoLarge" color={Colors.accent} style={styles.countdownNumber}>
            {countdownDays > 0 ? `${countdownDays} DAYS` : 'TODAY IS THE DAY!'}
          </Typography>
          <Typography variant="caption" color={Colors.textMuted}>
            Stay disciplined: 1 hour evening workout + 3.5 L water
          </Typography>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Typography variant="caption" color={Colors.textMuted}>
              STREAK
            </Typography>
            <Typography variant="monoLarge" color={Colors.accent}>
              {streakDays} <Typography variant="monoMedium" color={Colors.textMuted}>DAYS</Typography>
            </Typography>
          </View>

          <View style={styles.statBox}>
            <Typography variant="caption" color={Colors.textMuted}>
              COMPLETION
            </Typography>
            <Typography variant="monoLarge" color={Colors.accent}>
              {completionPercent}%
            </Typography>
          </View>
        </View>

        {/* Log Today's Weight, Waist, and Weekly Face Photo */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            LOG TODAY'S MEASUREMENTS
          </Typography>

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="WEIGHT"
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder="74.0"
                unit="KG"
              />
            </View>

            <View style={{ width: Spacing.md }} />

            <View style={{ flex: 1 }}>
              <Input
                label="WAIST CIRCUMFERENCE"
                value={waistInput}
                onChangeText={setWaistInput}
                keyboardType="decimal-pad"
                placeholder="86.0"
                unit="CM"
              />
            </View>
          </View>

          {/* Weekly Progress Photo */}
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.photoLabel}>
            WEEKLY FACE & PHYSIQUE PHOTO
          </Typography>

          <TouchableOpacity
            style={styles.photoContainer}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Typography variant="bodyBold" color={Colors.accent}>
                  TAP TO CAPTURE PROGRESS PHOTO
                </Typography>
                <Typography variant="caption" color={Colors.textMuted} style={{ marginTop: 4 }}>
                  Stored privately on your device storage
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          <Button
            label={isSaving ? 'SAVING MEASUREMENTS...' : 'SAVE MEASUREMENTS'}
            onPress={handleSaveMetrics}
            disabled={isSaving}
            style={styles.saveBtn}
          />
        </View>

        {/* Weight Trend Chart */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            WEIGHT TREND (KG)
          </Typography>

          {validWeights.length > 0 ? (
            <View style={styles.chartBox}>
              <View style={styles.chartBars}>
                {validWeights.map((w, idx) => {
                  const val = w.weight_kg ?? 70;
                  const allVals = validWeights.map((x) => x.weight_kg ?? 70);
                  const min = Math.min(...allVals) - 2;
                  const max = Math.max(...allVals) + 2;
                  const range = max - min || 1;
                  const heightPercent = Math.max(15, Math.min(100, ((val - min) / range) * 80 + 20));

                  return (
                    <View key={idx} style={styles.chartColumn}>
                      <Typography variant="monoMedium" color={Colors.accent} style={styles.chartVal}>
                        {val}
                      </Typography>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                      </View>
                      <Typography variant="caption" color={Colors.textMuted} style={styles.chartDate}>
                        {w.date.slice(8)}
                      </Typography>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Typography variant="caption" color={Colors.textMuted}>
                Log weight measurements to populate chart.
              </Typography>
            </View>
          )}
        </View>

        {/* Waist Trend Chart */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            WAIST TREND (CM)
          </Typography>

          {validWaists.length > 0 ? (
            <View style={styles.chartBox}>
              <View style={styles.chartBars}>
                {validWaists.map((w, idx) => {
                  const val = w.waist_cm ?? 85;
                  const allVals = validWaists.map((x) => x.waist_cm ?? 85);
                  const min = Math.min(...allVals) - 2;
                  const max = Math.max(...allVals) + 2;
                  const range = max - min || 1;
                  const heightPercent = Math.max(15, Math.min(100, ((val - min) / range) * 80 + 20));

                  return (
                    <View key={idx} style={styles.chartColumn}>
                      <Typography variant="monoMedium" color={Colors.accent} style={styles.chartVal}>
                        {val}
                      </Typography>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                      </View>
                      <Typography variant="caption" color={Colors.textMuted} style={styles.chartDate}>
                        {w.date.slice(8)}
                      </Typography>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Typography variant="caption" color={Colors.textMuted}>
                Log waist measurements to populate chart.
              </Typography>
            </View>
          )}
        </View>

        {/* Export Data Section */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            DATA EXPORT (SHARE SHEET)
          </Typography>

          <Button
            label="EXPORT ALL DATA (JSON)"
            onPress={exportAllDataAsJSON}
            variant="secondary"
            style={styles.exportBtn}
          />

          <Button
            label="EXPORT BODY METRICS (CSV)"
            onPress={exportBodyMetricsAsCSV}
            variant="secondary"
          />
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
  countdownBanner: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  countdownSubtitle: {
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  countdownNumber: {
    fontSize: 32,
    lineHeight: 38,
    marginVertical: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm + 4,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
  },
  photoLabel: {
    letterSpacing: 0.6,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  photoContainer: {
    height: 180,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  saveBtn: {
    marginBottom: Spacing.xs,
  },
  chartBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    gap: Spacing.xs,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartVal: {
    fontSize: 9,
    marginBottom: 2,
  },
  barTrack: {
    width: '70%',
    height: 90,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.none,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.accent,
  },
  chartDate: {
    fontSize: 9,
    marginTop: 4,
  },
  emptyChart: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  exportBtn: {
    marginBottom: Spacing.sm,
  },
});
