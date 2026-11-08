import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../db';

function webDownload(content: string, filename: string, mimeType: string) {
  if (typeof window !== 'undefined' && window.document) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export async function exportAllDataAsJSON(): Promise<void> {
  const db = await getDatabase();

  const [profiles, workoutLogs, setLogs, mealLogs, waterLogs, bodyMetrics, chatMessages] = await Promise.all([
    db.getAllAsync('SELECT * FROM profiles'),
    db.getAllAsync('SELECT * FROM workout_logs ORDER BY date ASC'),
    db.getAllAsync('SELECT * FROM set_logs ORDER BY id ASC'),
    db.getAllAsync('SELECT * FROM meal_logs ORDER BY date ASC, slot ASC'),
    db.getAllAsync('SELECT * FROM water_logs ORDER BY date ASC'),
    db.getAllAsync('SELECT * FROM body_metrics ORDER BY date ASC'),
    db.getAllAsync('SELECT * FROM chat_messages ORDER BY id ASC'),
  ]);

  const payload = {
    appName: '30 Day Wedding Fit',
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    profiles,
    workoutLogs,
    setLogs,
    mealLogs,
    waterLogs,
    bodyMetrics,
    chatMessages,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const filename = `wedding_fit_backup_${Date.now()}.json`;

  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    webDownload(jsonStr, filename, 'application/json');
    return;
  }

  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Export 30 Day Wedding Fit Data (JSON)',
      UTI: 'public.json',
    });
  }
}

export async function exportBodyMetricsAsCSV(): Promise<void> {
  const db = await getDatabase();
  const metrics = await db.getAllAsync<{
    date: string;
    weight_kg: number | null;
    waist_cm: number | null;
    steps: number | null;
    sleep_hours: number | null;
    notes: string | null;
  }>('SELECT date, weight_kg, waist_cm, steps, sleep_hours, notes FROM body_metrics ORDER BY date ASC');

  const headers = ['Date', 'Weight (kg)', 'Waist (cm)', 'Steps', 'Sleep (hours)', 'Notes'];
  const rows = metrics.map((m) => [
    m.date,
    m.weight_kg ?? '',
    m.waist_cm ?? '',
    m.steps ?? '',
    m.sleep_hours ?? '',
    `"${(m.notes ?? '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `wedding_fit_metrics_${Date.now()}.csv`;

  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    webDownload(csvContent, filename, 'text/csv');
    return;
  }

  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Body Metrics (CSV)',
      UTI: 'public.comma-separated-values-text',
    });
  }
}
