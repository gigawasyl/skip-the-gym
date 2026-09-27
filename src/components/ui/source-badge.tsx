import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { sourceLabel } from '@/lib/format';
import { useTheme } from '@/hooks/use-theme';
import type { MetricSource } from '@/types';

export function SourceBadge({ source }: { source?: MetricSource }) {
  const theme = useTheme();

  if (!source) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="small" style={{ color: theme[source], fontSize: 12, lineHeight: 16 }}>
        {sourceLabel(source)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
