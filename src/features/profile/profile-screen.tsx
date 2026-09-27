import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { NativePickerField } from '@/components/ui/native-picker-field';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { ThemedText } from '@/components/ui/themed-text';
import { MOTION_LIMITATION } from '@/features/walks/motion';
import { useWalks } from '@/features/walks/walks-store';
import { parseDecimal } from '@/lib/format';
import {
  UNSET,
  ageFromBirthYear,
  ageOptions,
  birthYearFromAge,
  bodyFatOptions,
  bodyFatToPicker,
  heightOptions,
  pickerNumber,
  storedHeightToPicker,
  storedWeightToPicker,
  weightOptions,
} from '@/lib/profile-options';
import { heightInputToCm, strideInputToMeters, strideMetersToInput, weightInputToKg } from '@/lib/units';
import type { Gender, UnitSystem } from '@/types';

export function ProfileScreen() {
  const { profile, updateProfile, motion, requestMotion, deleteAllData } = useWalks();
  const [units, setUnits] = useState<UnitSystem>(profile.unitSystem);
  const [age, setAge] = useState(ageFromBirthYear(profile.birthYear));
  const [height, setHeight] = useState(storedHeightToPicker(profile.heightCm, profile.unitSystem));
  const [weight, setWeight] = useState(storedWeightToPicker(profile.weightKg, profile.unitSystem));
  const [bodyFat, setBodyFat] = useState(bodyFatToPicker(profile.bodyFatPercent));
  const [stride, setStride] = useState(strideToInput(profile.calibratedStrideLengthMeters, profile.unitSystem));
  const [gender, setGender] = useState<Gender | ''>(profile.gender ?? '');

  useEffect(() => {
    setUnits(profile.unitSystem);
    setAge(ageFromBirthYear(profile.birthYear));
    setHeight(storedHeightToPicker(profile.heightCm, profile.unitSystem));
    setWeight(storedWeightToPicker(profile.weightKg, profile.unitSystem));
    setBodyFat(bodyFatToPicker(profile.bodyFatPercent));
    setStride(strideToInput(profile.calibratedStrideLengthMeters, profile.unitSystem));
    setGender(profile.gender ?? '');
  }, [profile]);

  const ages = useMemo(() => ageOptions(), []);
  const fats = useMemo(() => bodyFatOptions(), []);
  const heightChoices = useMemo(() => heightOptions(units), [units]);
  const weightChoices = useMemo(() => weightOptions(units), [units]);
  const strideLabel = units === 'metric' ? 'Stride length (cm)' : 'Stride length (in)';

  function persist(next: {
    units?: UnitSystem;
    age?: string;
    height?: string;
    weight?: string;
    bodyFat?: string;
    stride?: string;
    gender?: Gender | '';
  } = {}) {
    const nextUnits = next.units ?? units;
    const nextAge = next.age ?? age;
    const nextHeight = next.height ?? height;
    const nextWeight = next.weight ?? weight;
    const nextBodyFat = next.bodyFat ?? bodyFat;
    const nextStride = next.stride ?? stride;
    const nextGender = next.gender ?? gender;
    const heightValue = pickerNumber(nextHeight);
    const weightValue = pickerNumber(nextWeight);
    const strideValue = parseDecimal(nextStride);

    void updateProfile({
      ...profile,
      unitSystem: nextUnits,
      birthYear: birthYearFromAge(nextAge),
      heightCm: heightValue != null ? heightInputToCm(heightValue, nextUnits) : null,
      weightKg: weightValue != null ? weightInputToKg(weightValue, nextUnits) : null,
      calibratedStrideLengthMeters: strideValue != null ? strideInputToMeters(strideValue, nextUnits) : null,
      gender: nextGender || null,
      bodyFatPercent: pickerNumber(nextBodyFat),
    });
  }

  function changeUnits(next: UnitSystem) {
    if (next === units) {
      return;
    }

    const heightValue = pickerNumber(height);
    const weightValue = pickerNumber(weight);
    const strideValue = parseDecimal(stride);
    const nextHeight =
      heightValue != null ? storedHeightToPicker(heightInputToCm(heightValue, units), next) : UNSET;
    const nextWeight =
      weightValue != null ? storedWeightToPicker(weightInputToKg(weightValue, units), next) : UNSET;
    const nextStride =
      strideValue != null
        ? String(roundDisplay(strideMetersToInput(strideInputToMeters(strideValue, units), next)))
        : '';

    setUnits(next);
    setHeight(nextHeight);
    setWeight(nextWeight);
    setStride(nextStride);
    persist({ units: next, height: nextHeight, weight: nextWeight, stride: nextStride });
  }

  return (
    <Screen scroll>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText themeColor="textSecondary">
          Height and stride help estimate missing step counts. They are never treated as measurements.
        </ThemedText>
      </View>

      <Card>
        <ThemedText type="smallBold">Units</ThemedText>
        <Segmented
          value={units}
          onChange={changeUnits}
          options={[
            { value: 'metric', label: 'Metric' },
            { value: 'imperial', label: 'Imperial' },
          ]}
        />
        <ThemedText type="smallBold">Gender</ThemedText>
        <Segmented
          value={gender || 'unset'}
          onChange={(value) => {
            if (value !== 'woman' && value !== 'man' && value !== 'other') {
              return;
            }
            setGender(value);
            persist({ gender: value });
          }}
          options={[
            { value: 'woman', label: 'Woman' },
            { value: 'man', label: 'Man' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <NativePickerField
          label="Age"
          value={age}
          options={ages}
          onChange={(value) => {
            setAge(value);
            persist({ age: value });
          }}
        />
        <NativePickerField
          label="Height"
          value={height}
          options={heightChoices}
          onChange={(value) => {
            setHeight(value);
            persist({ height: value });
          }}
        />
        <NativePickerField
          label="Weight"
          value={weight}
          options={weightChoices}
          onChange={(value) => {
            setWeight(value);
            persist({ weight: value });
          }}
        />
        <NativePickerField
          label="Body fat"
          hint="Optional. Helps narrow kcal estimates."
          value={bodyFat}
          options={fats}
          onChange={(value) => {
            setBodyFat(value);
            persist({ bodyFat: value });
          }}
        />
        <Field
          label={strideLabel}
          hint="Optional. Leave blank to estimate stride from height."
          keyboardType="decimal-pad"
          value={stride}
          onChangeText={setStride}
          onEndEditing={() => persist()}
        />
      </Card>

      <Card>
        <ThemedText type="smallBold">Motion access</ThemedText>
        <ThemedText themeColor="textSecondary">
          {motion.available
            ? motion.permission === 'granted'
              ? 'Motion access is on. Walks can be detected while this app is open and the phone is carried.'
              : 'Motion access is off. Manual logging still works.'
            : 'This device does not expose a pedometer.'}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{MOTION_LIMITATION}</ThemedText>
        {motion.lastError ? <ThemedText themeColor="textSecondary">{motion.lastError}</ThemedText> : null}
        {motion.permission !== 'granted' ? (
          <Button label="Allow motion access" variant="secondary" onPress={() => void requestMotion()} />
        ) : null}
      </Card>

      <Card>
        <ThemedText type="smallBold">Data</ThemedText>
        <ThemedText themeColor="textSecondary">
          Walks stay on this phone. Deleting data removes walks, profile details, and any saved treadmill defaults.
        </ThemedText>
        <Button
          label="Delete all local data"
          variant="danger"
          onPress={() => {
            Alert.alert('Delete everything?', 'This cannot be undone.', [
              { text: 'Keep data', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  void deleteAllData();
                  setAge(UNSET);
                  setHeight(UNSET);
                  setWeight(UNSET);
                  setBodyFat(UNSET);
                  setStride('');
                  setGender('');
                },
              },
            ]);
          }}
        />
      </Card>
    </Screen>
  );
}

function strideToInput(meters: number | null, units: UnitSystem): string {
  return meters != null ? String(roundDisplay(strideMetersToInput(meters, units))) : '';
}

function roundDisplay(value: number): number {
  return Math.round(value * 10) / 10;
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
});
