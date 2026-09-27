import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { SourceBadge } from '@/components/ui/source-badge';
import { ThemedText } from '@/components/ui/themed-text';
import { formatDayHeading, formatTime } from '@/lib/dates';
import { formatDistance, formatDuration, formatSteps, walkTypeLabel } from '@/lib/format';
import type { UnitSystem, Walk } from '@/types';

export function WalkCard({
  walk,
  units,
  showDate = false,
  onPress,
}: {
  walk: Walk;
  units: UnitSystem;
  showDate?: boolean;
  onPress: () => void;
}) {
  const when = showDate ? `${formatDayHeading(walk.startedAt)} · ${formatTime(walk.startedAt)}` : formatTime(walk.startedAt);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card>
        <View style={styles.top}>
          <ThemedText type="smallBold">{walkTypeLabel(walk.type)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {when}
          </ThemedText>
        </View>
        <ThemedText>
          {formatDuration(walk.durationSeconds)}
          {walk.steps != null ? ` · ${formatSteps(walk.steps, walk.metricSources.steps, walk.stepRange)} steps` : ''}
          {walk.distanceMeters != null ? ` · ${formatDistance(walk.distanceMeters, units, walk.metricSources.distanceMeters)}` : ''}
        </ThemedText>
        <View style={styles.badges}>
          {walk.metricSources.steps ? <SourceBadge source={walk.metricSources.steps} /> : null}
          {walk.metricSources.distanceMeters && walk.metricSources.distanceMeters !== walk.metricSources.steps ? (
            <SourceBadge source={walk.metricSources.distanceMeters} />
          ) : null}
          {!walk.metricSources.steps && walk.metricSources.durationSeconds ? (
            <SourceBadge source={walk.metricSources.durationSeconds} />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
