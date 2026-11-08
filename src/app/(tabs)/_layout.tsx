import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors, FontFamily, FontSize } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';

function TabItem({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <Typography
        variant={focused ? 'captionBold' : 'caption'}
        color={focused ? Colors.accent : Colors.textMuted}
        style={styles.tabLabel}
        numberOfLines={1}
      >
        {label}
      </Typography>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        lazy: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabItem label="TODAY" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ focused }) => <TabItem label="LIBRARY" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          tabBarIcon: ({ focused }) => <TabItem label="PLAN" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => <TabItem label="PROGRESS" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          tabBarIcon: ({ focused }) => <TabItem label="DIET" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => <TabItem label="COACH" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabItem label="SETTINGS" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 56,
    paddingTop: 0,
    paddingBottom: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  tabItemFocused: {
    borderTopColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
