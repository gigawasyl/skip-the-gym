import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricRow } from '@/components/ui/metric-row';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useWalks } from '@/features/walks/walks-store';
import { formatDayHeading, formatTime } from '@/lib/dates';
import {
  confidenceLabel,
  formatDistance,
  formatDuration,
  formatIncline,
  formatPace,
  formatSpeed,
  formatSteps,
  methodLabel,
  walkTypeLabel,
} from '@/lib/format';

export function WalkDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { walks, profile, deleteWalk, draftFromWalk, setDraft } = useWalks();
  const walk = walks.find((item) => item.id === id);

  if (!walk) {
    return (
      <Screen>
        <ThemedText type="subtitle">This walk is no longer saved.</ThemedText>
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="title">{walkTypeLabel(walk.type)}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {formatDayHeading(walk.startedAt)} · {formatTime(walk.startedAt)}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{methodLabel(walk.recordingMethod)}</ThemedText>
      </View>

      <Card>
        <MetricRow
          label="Duration"
          value={formatDuration(walk.durationSeconds)}
          source={walk.metricSources.durationSeconds}
        />
        <MetricRow
          label="Steps"
          value={formatSteps(walk.steps, walk.metricSources.steps, walk.stepRange)}
          source={walk.metricSources.steps}
        />
        <MetricRow
          label="Distance"
          value={formatDistance(walk.distanceMeters, profile.unitSystem, walk.metricSources.distanceMeters)}
          source={walk.metricSources.distanceMeters}
        />
        <MetricRow
          label="Speed"
          value={formatSpeed(walk.speedMetersPerSecond, profile.unitSystem)}
          source={walk.metricSources.speedMetersPerSecond}
        />
        <MetricRow
          label="Pace"
          value={formatPace(walk.paceSecondsPerKilometer, profile.unitSystem)}
          source={walk.metricSources.paceSecondsPerKilometer}
        />
        <MetricRow
          label="Incline"
          value={formatIncline(walk.inclinePercent)}
          source={walk.metricSources.inclinePercent}
        />
      </Card>

      <Card>
        <ThemedText type="smallBold">{confidenceLabel(walk.confidence)}</ThemedText>
        <ThemedText themeColor="textSecondary">
          Detected numbers come from the phone. User-entered numbers come from you or the treadmill. Estimated
          numbers are calculated and are never labeled as measurements.
        </ThemedText>
        {walk.notes ? <ThemedText>{walk.notes}</ThemedText> : null}
      </Card>

      <View style={styles.actions}>
        <Button label="Finish walk" variant="secondary" onPress={() => router.replace('/')} />
        <Button
          label="Edit walk"
          variant="secondary"
          onPress={() => {
            setDraft(draftFromWalk(walk));
            router.push('/walk/form');
          }}
        />
        <Button
          label="Delete walk"
          variant="danger"
          onPress={() => {
            Alert.alert('Delete this walk?', 'It will be removed from Today and History.', [
              { text: 'Keep', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  void deleteWalk(walk.id);
                  router.replace('/');
                },
              },
            ]);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  actions: {
    gap: 10,
  },
});
