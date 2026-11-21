import { Tabs } from 'expo-router';

import { TabIcon } from '@/components/TabIcon';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              glyph="⌂"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{
                ios: 'camera.fill',
                android: 'photo_camera',
                web: 'photo_camera',
              }}
              glyph="◉"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }}
              glyph="▦"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              glyph="☺"
            />
          ),
        }}
      />
    </Tabs>
  );
}
