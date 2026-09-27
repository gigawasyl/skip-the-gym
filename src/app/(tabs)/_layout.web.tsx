import { Redirect, Tabs } from 'expo-router';

import { Fitness } from '@/constants/fitness';
import { useWalks } from '@/features/walks/walks-store';

export default function TabLayout() {
  const { ready, profile } = useWalks();

  if (ready && !profile.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Fitness.play,
        tabBarInactiveTintColor: Fitness.muted,
        tabBarStyle: {
          backgroundColor: Fitness.canvas,
          borderTopColor: Fitness.banner,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
