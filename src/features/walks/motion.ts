import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

import { isNative } from '@/lib/platform';
import type { MotionStatus } from '@/types';

export const MOTION_LIMITATION =
  'A phone left on a desk cannot detect your steps. Automatic tracking also pauses while the app is in the background.';

export async function readMotionStatus(): Promise<MotionStatus> {
  if (!isNative) {
    return {
      available: false,
      permission: 'denied',
      canAskAgain: false,
      lastError: 'Motion tracking is available on iOS and Android phones.',
    };
  }

  try {
    const available = await Pedometer.isAvailableAsync();
    const permission = await Pedometer.getPermissionsAsync();
    return {
      available,
      permission: permission.status,
      canAskAgain: permission.canAskAgain,
      lastError: available ? null : 'This phone does not expose a pedometer.',
    };
  } catch (error) {
    return {
      available: false,
      permission: 'denied',
      canAskAgain: false,
      lastError: error instanceof Error ? error.message : 'Motion data is unavailable.',
    };
  }
}

export async function requestMotionAccess(): Promise<MotionStatus> {
  if (!isNative) {
    return readMotionStatus();
  }

  try {
    await Pedometer.requestPermissionsAsync();
  } catch {
    // Status is read below even if the prompt is unavailable.
  }

  return readMotionStatus();
}

export function watchDetectedSteps(onSteps: (steps: number) => void): { remove: () => void } {
  if (!isNative) {
    return { remove() {} };
  }

  const subscription = Pedometer.watchStepCount((result) => {
    onSteps(result.steps);
  });

  return {
    remove() {
      subscription.remove();
    },
  };
}

export async function readDetectedSteps(start: Date, end: Date): Promise<number | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const result = await Pedometer.getStepCountAsync(start, end);
    return result?.steps ?? null;
  } catch {
    return null;
  }
}
