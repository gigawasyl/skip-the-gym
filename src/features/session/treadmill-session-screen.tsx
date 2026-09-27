import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Fitness } from '@/constants/fitness';
import { CalorieGrid } from '@/features/session/step-grid';
import { estimateWalkingKcal, strideLengthMeters } from '@/features/walks/calculations';
import { useWalks } from '@/features/walks/walks-store';
import { formatElapsedPrecise, parseDecimal } from '@/lib/format';
import { metersPerSecondToSpeed, speedToMetersPerSecond } from '@/lib/units';

export function TreadmillSessionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    session,
    profile,
    beginSession,
    pauseSession,
    resumeSession,
    updateSessionInputs,
    finishSession,
    discardSession,
  } = useWalks();
  const [now, setNow] = useState(Date.now());
  const [speed, setSpeed] = useState(
    session?.speedMetersPerSecond != null
      ? metersPerSecondToSpeed(session.speedMetersPerSecond, profile.unitSystem).toFixed(1)
      : '',
  );
  const [incline, setIncline] = useState(session?.inclinePercent != null ? String(session.inclinePercent) : '');
  const walkType = session?.type ?? 'treadmill';
  const title = walkType === 'treadmill' ? 'Treadmill walk' : 'Outdoor walk';
  const speedUnit = profile.unitSystem === 'metric' ? 'km/h' : 'mph';

  useEffect(() => {
    navigation.setOptions({ headerShown: false, title });
  }, [navigation, title]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), session?.running ? 50 : 400);
    return () => clearInterval(timer);
  }, [session?.running]);

  if (!session) {
    return (
      <Screen backgroundColor={Fitness.canvas} style={styles.empty}>
        <StatusBar style="light" />
        <Text style={styles.emptyTitle}>No walk is open</Text>
        <Text style={styles.hint}>Start one from Today.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.pill, styles.pillDark, { opacity: pressed ? 0.82 : 1 }]}>
          <Text style={styles.pillLabel}>Back</Text>
        </Pressable>
      </Screen>
    );
  }

  const active = session;
  const elapsed =
    active.running && active.lastResumedAt
      ? active.elapsedMs + (now - new Date(active.lastResumedAt).getTime())
      : active.elapsedMs;
  const canFinish = active.running || elapsed > 0;
  const durationSeconds = elapsed / 1000;
  const liveSpeed = parseDecimal(speed);
  const liveIncline = parseDecimal(incline);
  const speedMps =
    liveSpeed != null ? speedToMetersPerSecond(liveSpeed, profile.unitSystem) : (active.speedMetersPerSecond ?? null);
  const stride = strideLengthMeters(profile);
  const distanceFromSteps =
    active.detectedSteps > 0 && stride != null ? active.detectedSteps * stride : null;
  const estimatedKcal = estimateWalkingKcal({
    durationSeconds,
    weightKg: profile.weightKg,
    speedMetersPerSecond: speedMps,
    inclinePercent: walkType === 'treadmill' ? (liveIncline ?? active.inclinePercent) : null,
    distanceMeters: speedMps != null && speedMps > 0 ? speedMps * durationSeconds : distanceFromSteps,
  });
  const filledKcal = estimatedKcal != null ? Math.floor(estimatedKcal) : 0;

  function currentInputs() {
    const value = parseDecimal(speed);
    const inclineValue = parseDecimal(incline);
    return {
      speedMetersPerSecond: value != null ? speedToMetersPerSecond(value, profile.unitSystem) : null,
      inclinePercent: walkType === 'treadmill' ? (inclineValue ?? null) : null,
    };
  }

  function persistInputs() {
    updateSessionInputs(currentInputs());
  }

  function toggleRun() {
    persistInputs();
    if (active.running) {
      pauseSession();
      return;
    }
    if (active.elapsedMs === 0 && active.lastResumedAt == null) {
      beginSession();
      return;
    }
    resumeSession();
  }

  function finish() {
    const walk = finishSession(currentInputs());
    if (walk) {
      router.replace(`/walk/${walk.id}`);
      return;
    }
    router.back();
  }

  const goLabel = active.running ? 'Pause' : active.elapsedMs > 0 ? 'Resume' : 'Start';

  return (
    <Screen flush backgroundColor={Fitness.canvas} style={styles.page}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backMark}>‹</Text>
            <Text style={styles.headerTitle}>{title}</Text>
          </Pressable>
          <View style={[styles.status, active.running && styles.statusOn]} />
        </View>

        <View style={styles.board}>
          <CalorieGrid kcal={filledKcal} />
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{filledKcal.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Estimated kcal</Text>
          </View>
          <View style={[styles.metric, styles.metricEnd]}>
            <Text style={styles.elapsed}>{formatElapsedPrecise(elapsed)}</Text>
            <Text style={styles.metricLabel}>Elapsed</Text>
          </View>
        </View>

        <Text style={styles.hint}>
          {estimatedKcal == null
            ? 'Add weight and a speed so kcal can be estimated. Each colored ball is one estimated kcal.'
            : 'Each colored ball is one estimated kcal. When the field fills, it shrinks and grows four more rows.'}
        </Text>

        <View style={styles.fields}>
          <DarkField label="Speed" unit={speedUnit} value={speed} onChangeText={setSpeed} onBlur={persistInputs} />
          {walkType === 'treadmill' ? (
            <DarkField label="Incline" unit="%" value={incline} onChangeText={setIncline} onBlur={persistInputs} />
          ) : null}
        </View>

        <View style={styles.actions}>
          {active.running && canFinish ? (
            <Pressable
              accessibilityRole="button"
              onPress={finish}
              style={({ pressed }) => [styles.pill, styles.pillDark, { opacity: pressed ? 0.86 : 1 }]}>
              <Text style={styles.pillLabel}>End walk</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void discardSession();
                router.back();
              }}
              style={({ pressed }) => [styles.pill, styles.pillDark, { opacity: pressed ? 0.86 : 1 }]}>
              <Text style={styles.pillLabel}>Discard</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={toggleRun}
            style={({ pressed }) => [
              styles.pill,
              active.running ? styles.pillLight : styles.pillGo,
              { opacity: pressed ? 0.86 : 1 },
            ]}>
            <Text style={[styles.pillLabel, active.running && styles.pillLabelDark]}>{goLabel}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function DarkField({
  label,
  unit,
  value,
  onChangeText,
  onBlur,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={Fitness.dim}
        value={value}
        onChangeText={onChangeText}
        onEndEditing={onBlur}
        style={styles.input}
      />
      <Text style={styles.fieldUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Fitness.canvas,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  empty: {
    backgroundColor: Fitness.canvas,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: Fitness.text,
    fontSize: 28,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 18,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backMark: {
    color: Fitness.text,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '400',
  },
  headerTitle: {
    color: Fitness.text,
    fontSize: 17,
    fontWeight: '500',
  },
  status: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Fitness.dim,
  },
  statusOn: {
    backgroundColor: Fitness.play,
  },
  board: {
    height: 280,
    paddingVertical: 4,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 28,
  },
  metric: {
    gap: 4,
  },
  metricEnd: {
    alignItems: 'flex-end',
  },
  metricValue: {
    color: Fitness.text,
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '500',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  elapsed: {
    color: Fitness.yellow,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: Fitness.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  hint: {
    color: Fitness.dim,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },
  fields: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 'auto',
    paddingBottom: 22,
  },
  field: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    color: Fitness.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    minHeight: 36,
    color: Fitness.text,
    fontSize: 22,
    fontWeight: '500',
    padding: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Fitness.control,
  },
  fieldUnit: {
    color: Fitness.dim,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    flex: 1,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDark: {
    backgroundColor: Fitness.control,
  },
  pillGo: {
    backgroundColor: Fitness.play,
  },
  pillLight: {
    backgroundColor: Fitness.text,
  },
  pillLabel: {
    color: Fitness.text,
    fontSize: 17,
    fontWeight: '600',
  },
  pillLabelDark: {
    color: Fitness.canvas,
  },
});
