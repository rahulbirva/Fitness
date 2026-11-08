import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      return null;
    }
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    console.warn(`SecureStore.getItemAsync error for ${key}:`, err);
    return null;
  }
}

export async function setStoredItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    console.warn(`SecureStore.setItemAsync error for ${key}:`, err);
  }
}

export async function deleteStoredItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.warn(`SecureStore.deleteItemAsync error for ${key}:`, err);
  }
}
