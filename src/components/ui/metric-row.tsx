import { StyleSheet, View } from 'react-native';

import { SourceBadge } from '@/components/ui/source-badge';
import { ThemedText } from '@/components/ui/themed-text';
import type { MetricSource } from '@/types';

export function MetricRow({
  label,
  value,
  source,
}: {
  label: string;
  value: string;
  source?: MetricSource;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText type="smallBold">{value}</ThemedText>
      </View>
      <SourceBadge source={source} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
