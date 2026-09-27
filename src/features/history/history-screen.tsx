import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { MetricRow } from '@/components/ui/metric-row';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { groupWalksByDay, totalWalks, walksInWeek } from '@/features/walks/summaries';
import { WalkCard } from '@/features/walks/walk-card';
import { useWalks } from '@/features/walks/walks-store';
import { formatDayHeading, formatWeekRange, startOfWeek } from '@/lib/dates';
import { formatDistance, formatDuration, formatSteps } from '@/lib/format';

export function HistoryScreen() {
  const router = useRouter();
  const { walks, profile } = useWalks();
  const weekWalks = walksInWeek(walks, new Date());
  const weekTotals = totalWalks(weekWalks);
  const groups = groupWalksByDay(walks);

  return (
    <Screen scroll>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <ThemedText type="title">History</ThemedText>
        <ThemedText themeColor="textSecondary">
          Detected and added walks live in the same record.
        </ThemedText>
      </View>

      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          This week · {formatWeekRange(startOfWeek(new Date()))}
        </ThemedText>
        <MetricRow label="Steps" value={formatSteps(weekTotals.steps || null)} />
        <MetricRow label="Walking time" value={formatDuration(weekTotals.durationSeconds || null)} />
        <MetricRow
          label="Distance"
          value={formatDistance(weekTotals.distanceMeters || null, profile.unitSystem)}
        />
      </Card>

      {groups.length === 0 ? (
        <ThemedText themeColor="textSecondary">No walks saved yet.</ThemedText>
      ) : (
        groups.map((group) => (
          <View key={group.day} style={styles.day}>
            <ThemedText type="subtitle">{formatDayHeading(group.day)}</ThemedText>
            {group.walks.map((walk) => (
              <WalkCard
                key={walk.id}
                walk={walk}
                units={profile.unitSystem}
                onPress={() => router.push(`/walk/${walk.id}`)}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  day: {
    gap: 12,
  },
});
