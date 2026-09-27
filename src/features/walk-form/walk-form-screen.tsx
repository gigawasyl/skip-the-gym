import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { MetricRow } from '@/components/ui/metric-row';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { ThemedText } from '@/components/ui/themed-text';
import { resolveWalk } from '@/features/walks/calculations';
import { useWalks, type WalkDraft } from '@/features/walks/walks-store';
import { fromDateAndTime, isValidDateInput, isValidTimeInput, toDateInput, toTimeInput } from '@/lib/dates';
import {
  formatDistance,
  formatPace,
  formatPaceInput,
  formatSpeed,
  formatSteps,
  parseDecimal,
  parsePaceInput,
} from '@/lib/format';
import {
  distanceToMeters,
  metersPerSecondToSpeed,
  metersToDistance,
  pacePerUnitToPerKm,
  paceSecondsPerUnit,
  speedToMetersPerSecond,
} from '@/lib/units';
import type { WalkType } from '@/types';

type FormKind = 'treadmill' | 'other';
type SpeedMode = 'speed' | 'pace';

export function WalkFormScreen() {
  const router = useRouter();
  const { draft, profile, template, saveWalk, draftFromTemplate, emptyDraft, setDraft } = useWalks();
  const initial = draft ?? emptyDraft('treadmill');
  const [kind, setKind] = useState<FormKind>(initial.type === 'treadmill' ? 'treadmill' : 'other');
  const [otherType, setOtherType] = useState<WalkType>(initial.type === 'treadmill' ? 'outdoor' : initial.type);
  const [dateValue, setDateValue] = useState(toDateInput(initial.startedAt));
  const [timeValue, setTimeValue] = useState(toTimeInput(initial.startedAt));
  const [hours, setHours] = useState(durationParts(initial).hours);
  const [minutes, setMinutes] = useState(durationParts(initial).minutes);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('speed');
  const [speed, setSpeed] = useState(
    initial.raw.entered.speedMetersPerSecond != null
      ? metersPerSecondToSpeed(initial.raw.entered.speedMetersPerSecond, profile.unitSystem).toFixed(1)
      : '',
  );
  const [pace, setPace] = useState(
    initial.raw.entered.paceSecondsPerKilometer != null
      ? formatPaceInput(paceSecondsPerUnit(initial.raw.entered.paceSecondsPerKilometer, profile.unitSystem))
      : '',
  );
  const [incline, setIncline] = useState(
    initial.raw.entered.inclinePercent != null ? String(initial.raw.entered.inclinePercent) : '',
  );
  const [distance, setDistance] = useState(
    initial.raw.entered.distanceMeters != null
      ? metersToDistance(initial.raw.entered.distanceMeters, profile.unitSystem).toFixed(2)
      : '',
  );
  const [steps, setSteps] = useState(initial.raw.entered.steps != null ? String(initial.raw.entered.steps) : '');
  const [notes, setNotes] = useState(initial.notes);

  const preview = useMemo(
    () =>
      resolveWalk({
        id: initial.existingId,
        type: kind === 'treadmill' ? 'treadmill' : otherType,
        recordingMethod: initial.recordingMethod,
        startedAt:
          isValidDateInput(dateValue) && isValidTimeInput(timeValue)
            ? fromDateAndTime(dateValue, timeValue)
            : initial.startedAt,
        notes,
        raw: buildRaw(initial, {
          hours,
          minutes,
          speed,
          pace,
          incline,
          distance,
          steps,
          speedMode,
          units: profile.unitSystem,
        }),
        profile,
      }),
    [dateValue, distance, hours, incline, initial, kind, minutes, notes, otherType, pace, profile, speed, speedMode, steps, timeValue],
  );

  function applyTemplate() {
    const next = draftFromTemplate();
    setDraft(next);
    setKind('treadmill');
    setHours(durationParts(next).hours);
    setMinutes(durationParts(next).minutes);
    setSpeed(
      next.raw.entered.speedMetersPerSecond != null
        ? metersPerSecondToSpeed(next.raw.entered.speedMetersPerSecond, profile.unitSystem).toFixed(1)
        : '',
    );
    setIncline(next.raw.entered.inclinePercent != null ? String(next.raw.entered.inclinePercent) : '');
  }

  function onSave() {
    if (!isValidDateInput(dateValue) || !isValidTimeInput(timeValue)) {
      Alert.alert('Check the date', 'Use YYYY-MM-DD and HH:MM, such as 2026-09-13 and 14:30.');
      return;
    }

    const durationSeconds = toDurationSeconds(hours, minutes);
    if (durationSeconds == null && initial.recordingMethod === 'manual') {
      Alert.alert('Duration needed', 'Enter how long the walk lasted. Date and duration are enough.');
      return;
    }

    const saved = saveWalk({
      existingId: initial.existingId,
      type: kind === 'treadmill' ? 'treadmill' : otherType,
      recordingMethod: initial.recordingMethod,
      startedAt: fromDateAndTime(dateValue, timeValue),
      notes,
      raw: buildRaw(initial, {
        hours,
        minutes,
        speed,
        pace,
        incline,
        distance,
        steps,
        speedMode,
        units: profile.unitSystem,
      }),
    });
    router.replace(`/walk/${saved.id}`);
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="title">{initial.existingId ? 'Edit walk' : 'Add walk'}</ThemedText>
        <ThemedText themeColor="textSecondary">
          Date and duration are enough. Speed, incline, and observed numbers are optional.
        </ThemedText>
      </View>

      <Segmented
        value={kind}
        onChange={setKind}
        options={[
          { value: 'treadmill', label: 'Treadmill' },
          { value: 'other', label: 'Other walk' },
        ]}
      />

      {kind === 'other' ? (
        <Segmented
          value={otherType}
          onChange={setOtherType}
          options={[
            { value: 'outdoor', label: 'Outdoor' },
            { value: 'indoor', label: 'Indoor' },
            { value: 'unknown', label: 'Unsure' },
          ]}
        />
      ) : null}

      {kind === 'treadmill' && template && !initial.existingId && initial.recordingMethod === 'manual' ? (
        <Button label="Repeat usual treadmill walk" variant="secondary" onPress={applyTemplate} />
      ) : null}

      <Field label="Date" placeholder="YYYY-MM-DD" value={dateValue} onChangeText={setDateValue} />
      <Field label="Start time" placeholder="HH:MM" value={timeValue} onChangeText={setTimeValue} />
      <View style={styles.row}>
        <View style={styles.half}>
          <Field label="Hours" keyboardType="number-pad" value={hours} onChangeText={setHours} />
        </View>
        <View style={styles.half}>
          <Field label="Minutes" keyboardType="number-pad" value={minutes} onChangeText={setMinutes} />
        </View>
      </View>

      <Segmented
        value={speedMode}
        onChange={setSpeedMode}
        options={[
          { value: 'speed', label: 'Speed' },
          { value: 'pace', label: 'Pace' },
        ]}
      />
      {speedMode === 'speed' ? (
        <Field
          label={`Speed (${profile.unitSystem === 'metric' ? 'km/h' : 'mph'})`}
          keyboardType="decimal-pad"
          value={speed}
          onChangeText={setSpeed}
        />
      ) : (
        <Field
          label={`Pace (min/${profile.unitSystem === 'metric' ? 'km' : 'mi'})`}
          placeholder="8:30"
          value={pace}
          onChangeText={setPace}
        />
      )}
      {kind === 'treadmill' ? (
        <Field label="Incline (%)" keyboardType="decimal-pad" value={incline} onChangeText={setIncline} />
      ) : null}
      <Field
        label={`${kind === 'treadmill' ? 'Treadmill distance' : 'Distance'} (${profile.unitSystem === 'metric' ? 'km' : 'mi'})`}
        keyboardType="decimal-pad"
        value={distance}
        onChangeText={setDistance}
      />

      <Field
        label="Observed steps"
        hint="Only if you counted them or copied them from the treadmill."
        keyboardType="number-pad"
        value={steps}
        onChangeText={setSteps}
      />
      <Field label="Notes" value={notes} onChangeText={setNotes} multiline />

      <Card>
        <ThemedText type="smallBold">Review</ThemedText>
        <ThemedText themeColor="textSecondary">Calculated values stay labeled as estimates.</ThemedText>
        <MetricRow
          label="Steps"
          value={formatSteps(preview.steps, preview.metricSources.steps, preview.stepRange)}
          source={preview.metricSources.steps}
        />
        <MetricRow
          label="Distance"
          value={formatDistance(preview.distanceMeters, profile.unitSystem, preview.metricSources.distanceMeters)}
          source={preview.metricSources.distanceMeters}
        />
        <MetricRow
          label="Speed"
          value={formatSpeed(preview.speedMetersPerSecond, profile.unitSystem)}
          source={preview.metricSources.speedMetersPerSecond}
        />
        <MetricRow
          label="Pace"
          value={formatPace(preview.paceSecondsPerKilometer, profile.unitSystem)}
          source={preview.metricSources.paceSecondsPerKilometer}
        />
      </Card>

      <View style={styles.actions}>
        <Button label="Save walk" onPress={onSave} />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

function durationParts(draft: WalkDraft): { hours: string; minutes: string } {
  const seconds = draft.raw.entered.durationSeconds ?? draft.raw.detected.durationSeconds;
  if (seconds == null) {
    return { hours: '', minutes: '' };
  }

  const hoursValue = Math.floor(seconds / 3600);
  const minutesValue = Math.round((seconds % 3600) / 60);

  return {
    hours: hoursValue > 0 ? String(hoursValue) : '',
    minutes: minutesValue > 0 || hoursValue === 0 ? String(minutesValue) : '',
  };
}

function toDurationSeconds(hours: string, minutes: string): number | undefined {
  const hourValue = parseDecimal(hours) ?? 0;
  const minuteValue = parseDecimal(minutes) ?? 0;
  if (!hours.trim() && !minutes.trim()) {
    return undefined;
  }
  return Math.round(hourValue * 3600 + minuteValue * 60);
}

function buildRaw(
  draft: WalkDraft,
  input: {
    hours: string;
    minutes: string;
    speed: string;
    pace: string;
    incline: string;
    distance: string;
    steps: string;
    speedMode: SpeedMode;
    units: 'metric' | 'imperial';
  },
) {
  const durationSeconds = toDurationSeconds(input.hours, input.minutes);
  const initialDuration = durationParts(draft);
  const durationEdited = input.hours !== initialDuration.hours || input.minutes !== initialDuration.minutes;
  const speedValue = input.speedMode === 'speed' ? parseDecimal(input.speed) : undefined;
  const paceValue = input.speedMode === 'pace' ? parsePaceInput(input.pace) : undefined;
  const distanceValue = parseDecimal(input.distance);
  const stepsValue = parseDecimal(input.steps);
  const inclineValue = parseDecimal(input.incline);

  return {
    detected: { ...draft.raw.detected },
    entered: {
      ...draft.raw.entered,
      durationSeconds: durationEdited ? durationSeconds : draft.raw.entered.durationSeconds,
      speedMetersPerSecond:
        speedValue != null ? speedToMetersPerSecond(speedValue, input.units) : undefined,
      paceSecondsPerKilometer: paceValue != null ? pacePerUnitToPerKm(paceValue, input.units) : undefined,
      inclinePercent: inclineValue,
      distanceMeters: distanceValue != null ? distanceToMeters(distanceValue, input.units) : undefined,
      steps: stepsValue != null ? Math.round(stepsValue) : undefined,
    },
  };
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  actions: {
    gap: 10,
  },
});
