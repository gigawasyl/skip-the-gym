import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Fitness } from '@/constants/fitness';
import { useWalks } from '@/features/walks/walks-store';

export default function TabLayout() {
  const { ready, profile } = useWalks();

  if (ready && !profile.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <NativeTabs
      backgroundColor={Fitness.canvas}
      indicatorColor={Fitness.banner}
      iconColor={{ default: Fitness.muted, selected: Fitness.play }}
      labelStyle={{
        default: { color: Fitness.muted },
        selected: { color: Fitness.play },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'figure.walk', selected: 'figure.walk' }} md="directions_walk" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
