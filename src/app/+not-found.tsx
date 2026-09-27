import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <Screen centered>
        <ThemedText type="subtitle">This screen does not exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Back to Today</ThemedText>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: Spacing.two,
  },
});
