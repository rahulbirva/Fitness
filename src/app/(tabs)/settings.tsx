import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getStoredItem, setStoredItem } from '../../utils/storage';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getProfile, updateProfile, Profile } from '../../db/queries/profile';
import { resetDatabase } from '../../db';
import {
  scheduleWorkoutReminder,
  scheduleWaterReminders,
  requestNotificationPermissions,
} from '../../services/notifications';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('27');
  const [height, setHeight] = useState('174');
  const [weight, setWeight] = useState('74');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [goal, setGoal] = useState<'fat_loss' | 'maintain' | 'muscle_gain'>('fat_loss');
  const [weddingDate, setWeddingDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  // AI settings
  const [aiProvider, setAiProvider] = useState<'gemini' | 'claude'>('gemini');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);

  // Notification settings
  const [reminderTime, setReminderTime] = useState('17:30');
  const [waterReminder, setWaterReminder] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      const p = await getProfile();
      if (p) {
        setProfile(p);
        setName(p.name);
        setAge(String(p.age));
        setHeight(String(p.height_cm));
        setWeight(String(p.weight_kg));
        setSex(p.sex);
        setGoal(p.goal);
        setWeddingDate(p.wedding_date);
        setStartDate(p.program_start_date);
        setAiProvider(p.ai_provider as 'gemini' | 'claude');
        setAiModel(p.ai_model);
        setReminderTime(p.reminder_time || '17:30');
        setWaterReminder(p.water_reminder_enabled === 1);
        setUnits((p.units as 'metric' | 'imperial') || 'metric');

        const storedKey = await getStoredItem(`api_key_${p.ai_provider}`);
        const envKey =
          p.ai_provider === 'gemini'
            ? process.env.EXPO_PUBLIC_GEMINI_API_KEY
            : process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

        if ((storedKey && storedKey.trim()) || (envKey && envKey.trim())) {
          setHasExistingKey(true);
          setApiKey('••••••••••••••••••••••••');
        } else {
          setHasExistingKey(false);
          setApiKey('');
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const handleProviderChange = async (provider: 'gemini' | 'claude') => {
    setAiProvider(provider);
    setAiModel(provider === 'gemini' ? 'gemini-1.5-flash' : 'claude-3-5-haiku-20241022');

    const key = await getStoredItem(`api_key_${provider}`);
    const envKey =
      provider === 'gemini'
        ? process.env.EXPO_PUBLIC_GEMINI_API_KEY
        : process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

    if ((key && key.trim()) || (envKey && envKey.trim())) {
      setHasExistingKey(true);
      setApiKey('••••••••••••••••••••••••');
    } else {
      setHasExistingKey(false);
      setApiKey('');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const ageNum = parseInt(age.trim(), 10) || 27;
      const heightNum = parseFloat(height.trim()) || 174;
      const weightNum = parseFloat(weight.trim()) || 74;

      await updateProfile({
        name: name.trim(),
        age: ageNum,
        height_cm: heightNum,
        weight_kg: weightNum,
        sex,
        goal,
        wedding_date: weddingDate.trim(),
        program_start_date: startDate.trim(),
        ai_provider: aiProvider,
        ai_model: aiModel.trim(),
        reminder_time: reminderTime.trim(),
        water_reminder_enabled: waterReminder ? 1 : 0,
        units,
      });

      // Save API key securely if changed and not bullets
      if (apiKey && !apiKey.startsWith('•')) {
        await setStoredItem(`api_key_${aiProvider}`, apiKey.trim());
        setHasExistingKey(true);
        setApiKey('••••••••••••••••••••••••');
      }

      // Schedule notifications
      const hasPerm = await requestNotificationPermissions();
      if (hasPerm) {
        await scheduleWorkoutReminder(reminderTime.trim());
        if (waterReminder) {
          await scheduleWaterReminders();
        }
      }

      Alert.alert('Saved', 'Your settings and reminders have been updated.');
    } catch (err) {
      console.error('Error saving settings:', err);
      Alert.alert('Save Error', 'Could not save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will erase your entire local SQLite database, logs, photos, and messages. This action cannot be reversed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert('Reset Complete', 'Data reset. Please reload the app.');
              await loadProfileData();
            } catch (err) {
              console.error('Reset error:', err);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="captionBold" color={Colors.accent} style={styles.subtitle}>
            CONFIGURATION & SECURE PREFERENCES
          </Typography>
          <Typography variant="h1">Settings</Typography>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            USER PROFILE & BIOMETRICS
          </Typography>

          <Input
            label="YOUR NAME"
            value={name}
            onChangeText={setName}
            placeholder="Groom / Bride"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="AGE"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="27"
                unit="YRS"
              />
            </View>
            <View style={{ width: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Input
                label="HEIGHT"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                placeholder="174"
                unit="CM"
              />
            </View>
            <View style={{ width: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Input
                label="WEIGHT"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="74"
                unit="KG"
              />
            </View>
          </View>

          {/* Sex selector */}
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.fieldLabel}>
            SEX (FOR BMR CALCULATION)
          </Typography>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionBtn, sex === 'male' && styles.optionBtnActive]}
              onPress={() => setSex('male')}
              activeOpacity={0.7}
            >
              <Typography
                variant="captionBold"
                color={sex === 'male' ? Colors.textInverse : Colors.text}
              >
                MALE
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, sex === 'female' && styles.optionBtnActive]}
              onPress={() => setSex('female')}
              activeOpacity={0.7}
            >
              <Typography
                variant="captionBold"
                color={sex === 'female' ? Colors.textInverse : Colors.text}
              >
                FEMALE
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Goal selector */}
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.fieldLabel}>
            PROGRAM GOAL
          </Typography>
          <View style={styles.optionRow}>
            {(['fat_loss', 'maintain', 'muscle_gain'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.optionBtn, goal === g && styles.optionBtnActive]}
                onPress={() => setGoal(g)}
                activeOpacity={0.7}
              >
                <Typography
                  variant="captionBold"
                  color={goal === g ? Colors.textInverse : Colors.text}
                >
                  {g === 'fat_loss' ? 'FAT LOSS' : g === 'maintain' ? 'MAINTAIN' : 'BUILD'}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* Units selector */}
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.fieldLabel}>
            UNITS
          </Typography>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionBtn, units === 'metric' && styles.optionBtnActive]}
              onPress={() => setUnits('metric')}
              activeOpacity={0.7}
            >
              <Typography
                variant="captionBold"
                color={units === 'metric' ? Colors.textInverse : Colors.text}
              >
                METRIC (KG / CM)
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, units === 'imperial' && styles.optionBtnActive]}
              onPress={() => setUnits('imperial')}
              activeOpacity={0.7}
            >
              <Typography
                variant="captionBold"
                color={units === 'imperial' ? Colors.textInverse : Colors.text}
              >
                IMPERIAL (LBS / IN)
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wedding & Program Dates */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            WEDDING & PROGRAM CALENDAR
          </Typography>

          <Input
            label="SISTER'S WEDDING DATE (YYYY-MM-DD)"
            value={weddingDate}
            onChangeText={setWeddingDate}
            placeholder="2025-06-15"
          />

          <Input
            label="PROGRAM START DATE (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2025-05-15"
          />
        </View>

        {/* AI Coach Configuration */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            AI COACH PROVIDER & MODEL
          </Typography>

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionBtn, aiProvider === 'gemini' && styles.optionBtnActive]}
              onPress={() => handleProviderChange('gemini')}
              activeOpacity={0.7}
            >
              <Typography
                variant="captionBold"
                color={aiProvider === 'gemini' ? Colors.textInverse : Colors.text}
              >
                GOOGLE GEMINI
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, aiProvider === 'claude' && styles.optionBtnActive]}
              onPress={() => handleProviderChange('claude')}
              activeOpacity={0.7}
            >
              <Typography
                variant="captionBold"
                color={aiProvider === 'claude' ? Colors.textInverse : Colors.text}
              >
                ANTHROPIC CLAUDE
              </Typography>
            </TouchableOpacity>
          </View>

          <Input
            label="MODEL NAME"
            value={aiModel}
            onChangeText={setAiModel}
            placeholder={aiProvider === 'gemini' ? 'gemini-1.5-flash' : 'claude-3-5-haiku-20241022'}
          />

          <Input
            label={`API KEY (${aiProvider.toUpperCase()})`}
            value={apiKey}
            onChangeText={setApiKey}
            onFocus={() => {
              if (apiKey.startsWith('•')) setApiKey('');
            }}
            placeholder="Paste your API key here"
            secureTextEntry={apiKey.startsWith('•')}
          />

          <Typography variant="caption" color={Colors.textMuted} style={styles.keyHelp}>
            Key is stored strictly inside expo-secure-store on your device. Never hardcoded or logged.
          </Typography>
        </View>

        {/* Notification Reminders */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            DAILY NOTIFICATIONS (LOCAL REMINDERS)
          </Typography>

          <Input
            label="EVENING WORKOUT REMINDER (HH:MM)"
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholder="17:30"
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: Spacing.sm }}>
              <Typography variant="bodyBold">WATER REMINDERS</Typography>
              <Typography variant="caption" color={Colors.textMuted}>
                Sends hydration nudges during the day toward the 3.5 L target.
              </Typography>
            </View>

            <Switch
              value={waterReminder}
              onValueChange={setWaterReminder}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.textInverse}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          label={isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
          onPress={handleSaveSettings}
          disabled={isSaving}
          style={styles.saveBtn}
        />

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Typography variant="captionBold" color={Colors.error} style={styles.sectionHeader}>
            DANGER ZONE
          </Typography>
          <Button
            label="RESET ALL APP DATA"
            onPress={handleResetData}
            variant="danger"
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
  header: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  fieldLabel: {
    letterSpacing: 0.6,
    fontSize: 10,
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  optionBtn: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  optionBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  keyHelp: {
    marginTop: -4,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm + 4,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    marginBottom: Spacing.xl,
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
});
