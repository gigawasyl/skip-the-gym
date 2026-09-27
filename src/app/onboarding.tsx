import { Redirect } from 'expo-router';

import { OnboardingScreen } from '@/features/onboarding/onboarding-screen';
import { useWalks } from '@/features/walks/walks-store';

export default function OnboardingRoute() {
  const { ready, profile } = useWalks();

  if (ready && profile.onboardingCompleted) {
    return <Redirect href="/" />;
  }

  return <OnboardingScreen />;
}
