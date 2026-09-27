import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function CircleButton({
  label,
  detail,
  onPress,
}: {
  label: string;
  detail?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.circle,
          { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.82 : 1 },
        ]}>
        {detail ? (
          <ThemedText type="small" style={styles.label}>
            {label}
          </ThemedText>
        ) : null}
        <ThemedText type={detail ? 'title' : 'smallBold'} style={styles.label}>
          {detail ?? label}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 252,
    paddingVertical: 24,
  },
  circle: {
    width: 208,
    height: 208,
    borderRadius: 104,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    textAlign: 'center',
  },
});
