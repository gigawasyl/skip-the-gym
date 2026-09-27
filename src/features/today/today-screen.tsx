import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Fitness } from '@/constants/fitness';
import { MOTION_LIMITATION } from '@/features/walks/motion';
import { walksOnDay } from '@/features/walks/summaries';
import { useWalks } from '@/features/walks/walks-store';
import { formatTime } from '@/lib/dates';
import { formatDistance, formatDuration, walkTypeLabel } from '@/lib/format';
import type { Walk, WalkType } from '@/types';

export function TodayScreen() {
  const router = useRouter();
  const { ready, walks, profile, session, draft, startSession, emptyDraft, setDraft } = useWalks();
  const todayWalks = walksOnDay(walks, new Date());

  function openSession(type: WalkType) {
    if (!session) {
      void startSession(type);
    }
    router.push('/session');
  }

  function addPastWalk(type: WalkType) {
    setDraft(emptyDraft(type));
    router.push('/walk/form');
  }

  return (
    <Screen scroll flush backgroundColor={Fitness.canvas} style={styles.page}>
      <StatusBar style="light" />
      <Text style={styles.title}>Walk</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>{MOTION_LIMITATION}</Text>
      </View>

      {session ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/session')}
          style={({ pressed }) => [styles.continue, { opacity: pressed ? 0.86 : 1 }]}>
          <View>
            <Text style={styles.continueLabel}>Continue</Text>
            <Text style={styles.continueTitle}>{walkTypeLabel(session.type)}</Text>
          </View>
          <View style={styles.play}>
            <Text style={styles.playMark}>▶</Text>
          </View>
        </Pressable>
      ) : null}

      {!session && draft ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/walk/form')}
          style={({ pressed }) => [styles.review, { opacity: pressed ? 0.86 : 1 }]}>
          <Text style={styles.reviewLabel}>Continue review</Text>
        </Pressable>
      ) : null}

      <StartCard
        title="Treadmill walk"
        mark="T"
        onPlay={() => openSession('treadmill')}
        onAdd={() => addPastWalk('treadmill')}
      />
      <StartCard
        title="Outdoor walk"
        mark="O"
        onPlay={() => openSession('outdoor')}
        onAdd={() => addPastWalk('outdoor')}
      />

      <Text style={styles.listHeading}>Today</Text>
      {!ready ? <Text style={styles.empty}>Loading your walks…</Text> : null}
      {ready && todayWalks.length === 0 ? (
        <Text style={styles.empty}>Start a walk or add one after the fact.</Text>
      ) : null}
      {todayWalks.map((walk, index) => (
        <TodayWalkRow
          key={walk.id}
          walk={walk}
          units={profile.unitSystem}
          last={index === todayWalks.length - 1}
          onPress={() => router.push(`/walk/${walk.id}`)}
        />
      ))}
    </Screen>
  );
}

function StartCard({
  title,
  mark,
  onPlay,
  onAdd,
}: {
  title: string;
  mark: string;
  onPlay: () => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.figure}>
          <Text style={styles.figureMark}>{mark}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Start ${title}`}
          onPress={onPlay}
          style={({ pressed }) => [styles.play, { opacity: pressed ? 0.82 : 1 }]}>
          <Text style={styles.playMark}>▶</Text>
        </Pressable>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAdd}
        style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.8 : 1 }]}>
        <Text style={styles.chipLabel}>Add past</Text>
      </Pressable>
    </View>
  );
}

function TodayWalkRow({
  walk,
  units,
  last,
  onPress,
}: {
  walk: Walk;
  units: 'metric' | 'imperial';
  last: boolean;
  onPress: () => void;
}) {
  const extras = [
    walk.distanceMeters != null ? formatDistance(walk.distanceMeters, units, walk.metricSources.distanceMeters) : null,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, last && styles.rowLast, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={styles.rowIcon}>
        <Text style={styles.rowIconMark}>{walk.type === 'treadmill' ? 'T' : 'O'}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{walkTypeLabel(walk.type)}</Text>
        <Text style={styles.rowMeta}>
          {formatTime(walk.startedAt)}
          {extras.length ? `  ·  ${extras.join('  ·  ')}` : ''}
        </Text>
      </View>
      <Text style={styles.rowValue}>{formatDuration(walk.durationSeconds)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: Fitness.canvas,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    color: Fitness.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: 0.2,
    paddingTop: 8,
    paddingBottom: 4,
  },
  banner: {
    backgroundColor: Fitness.banner,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerText: {
    color: Fitness.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  continue: {
    backgroundColor: Fitness.card,
    borderRadius: 22,
    minHeight: 72,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueLabel: {
    color: Fitness.play,
    fontSize: 13,
    fontWeight: '600',
  },
  continueTitle: {
    color: Fitness.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 2,
  },
  review: {
    backgroundColor: Fitness.banner,
    borderRadius: 22,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewLabel: {
    color: Fitness.text,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Fitness.card,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  figure: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  figureMark: {
    color: Fitness.text,
    fontSize: 28,
    fontWeight: '600',
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Fitness.play,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playMark: {
    color: Fitness.canvas,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 2,
  },
  cardTitle: {
    color: Fitness.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '600',
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: Fitness.chip,
    borderRadius: 999,
    minHeight: 36,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    color: Fitness.text,
    fontSize: 14,
    fontWeight: '500',
  },
  listHeading: {
    color: Fitness.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },
  empty: {
    color: Fitness.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Fitness.control,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Fitness.banner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconMark: {
    color: Fitness.text,
    fontSize: 13,
    fontWeight: '600',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: Fitness.text,
    fontSize: 16,
    fontWeight: '600',
  },
  rowMeta: {
    color: Fitness.muted,
    fontSize: 13,
  },
  rowValue: {
    color: Fitness.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
