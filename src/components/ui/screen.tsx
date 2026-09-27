import { ScrollView, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';

import { ThemedView } from './themed-view';

type ScreenProps = ViewProps & {
  centered?: boolean;
  scroll?: boolean;
  backgroundColor?: string;
  flush?: boolean;
};

export function Screen({
  children,
  style,
  centered = false,
  scroll = false,
  backgroundColor,
  flush = false,
  ...rest
}: ScreenProps) {
  const canvas = backgroundColor ? { backgroundColor } : null;

  return (
    <ThemedView style={[styles.root, canvas]} {...rest}>
      <SafeAreaView
        style={[styles.safeArea, flush && styles.flush, canvas, centered && styles.centered, !scroll && style]}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scroll, flush && styles.flushScroll, centered && styles.centered, style]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  flush: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },
  flushScroll: {
    gap: 0,
    paddingBottom: 0,
  },
});
