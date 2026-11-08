import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';
import { Colors } from '../constants/theme';
import { getDatabase } from '../db';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fail-safe dismiss timer: guaranteed max 1.2s on loading screen
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsReady(true);
      }
    }, 1200);

    async function prepare() {
      // 1. Font loading race: 700ms max so offline/slow network never hangs the splash
      try {
        await Promise.race([
          Font.loadAsync({
            IBMPlexSans_400Regular,
            IBMPlexSans_500Medium,
            IBMPlexSans_700Bold,
            IBMPlexMono_400Regular,
            IBMPlexMono_700Bold,
          }),
          new Promise((resolve) => setTimeout(resolve, 700)),
        ]);
      } catch (fontErr) {
        console.warn('Font load skipped or timed out:', fontErr);
      }

      // 2. Database readiness
      try {
        await getDatabase();
      } catch (dbErr) {
        console.warn('Database init fallback:', dbErr);
      }

      if (isMounted) {
        clearTimeout(fallbackTimer);
        setIsReady(true);
      }
    }

    prepare();

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>
          30 DAY WEDDING FIT
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'none',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    letterSpacing: 1.5,
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.accent,
  },
});
