import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { WalksProvider } from '@/features/walks/walks-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WalksProvider>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="session"
            options={{
              title: 'Walk',
              headerStyle: { backgroundColor: '#000000' },
              headerTintColor: '#FFFFFF',
              headerShadowVisible: false,
              contentStyle: { backgroundColor: '#000000' },
            }}
          />
          <Stack.Screen name="walk/form" options={{ title: 'Walk' }} />
          <Stack.Screen name="walk/[id]" options={{ title: 'Walk' }} />
        </Stack>
      </WalksProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
