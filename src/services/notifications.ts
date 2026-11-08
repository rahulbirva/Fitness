import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleWorkoutReminder(timeString = '17:30'): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const parts = timeString.split(':');
    const hour = parseInt(parts[0], 10) || 17;
    const minute = parseInt(parts[1], 10) || 30;

    // Cancel previous scheduled reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "30 Day Wedding Fit: Evening Training",
        body: "Time for your 1-hour workout. Put on your workout gear and crush today's plan!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (error) {
    // Notification scheduling error (e.g., in Expo Go or test env)
    console.warn('Could not schedule workout reminder:', error);
  }
}

export async function scheduleWaterReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    // Schedule daytime hydration reminders (10:00, 13:00, 16:00, 19:00)
    const hours = [10, 13, 16, 19];
    for (const h of hours) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hydration Check (Target 3.5 L)",
          body: "Drink a 250 ml glass of water now to stay on pace for the wedding countdown.",
          sound: false,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: h,
          minute: 0,
        },
      });
    }
  } catch (error) {
    console.warn('Could not schedule water reminders:', error);
  }
}
