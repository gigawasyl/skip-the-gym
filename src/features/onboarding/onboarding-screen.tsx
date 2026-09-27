import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { NativePickerField } from '@/components/ui/native-picker-field';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { ThemedText } from '@/components/ui/themed-text';
import { useWalks } from '@/features/walks/walks-store';
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
import { heightInputToCm, weightInputToKg } from '@/lib/units';
import type { Gender, UnitSystem } from '@/types';

const SKIP_MESSAGE =
  'By providing these details, the kcal estimates will be more accurate. You can add them later in Profile.';

export function OnboardingScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useWalks();
  const [units, setUnits] = useState<UnitSystem>(profile.unitSystem);
  const [gender, setGender] = useState<Gender | ''>(profile.gender ?? '');
  const [age, setAge] = useState(ageFromBirthYear(profile.birthYear));
  const [height, setHeight] = useState(storedHeightToPicker(profile.heightCm, units));
  const [weight, setWeight] = useState(storedWeightToPicker(profile.weightKg, units));
  const [bodyFat, setBodyFat] = useState(bodyFatToPicker(profile.bodyFatPercent));

  const ages = useMemo(() => ageOptions(), []);
  const fats = useMemo(() => bodyFatOptions(), []);
  const heightChoices = useMemo(() => heightOptions(units), [units]);
  const weightChoices = useMemo(() => weightOptions(units), [units]);

  function changeUnits(next: UnitSystem) {
    const heightValue = pickerNumber(height);
    const weightValue = pickerNumber(weight);
    setHeight(
      heightValue != null
        ? storedHeightToPicker(heightInputToCm(heightValue, units), next)
        : UNSET,
    );
    setWeight(
      weightValue != null
        ? storedWeightToPicker(weightInputToKg(weightValue, units), next)
        : UNSET,
    );
    setUnits(next);
  }

  async function finish(next = collectProfile()) {
    await updateProfile({ ...profile, ...next, unitSystem: units, onboardingCompleted: true });
    router.replace('/');
  }

  function collectProfile() {
    const heightValue = pickerNumber(height);
    const weightValue = pickerNumber(weight);

    return {
      gender: gender || null,
      birthYear: birthYearFromAge(age),
      heightCm: heightValue != null ? heightInputToCm(heightValue, units) : null,
      weightKg: weightValue != null ? weightInputToKg(weightValue, units) : null,
      bodyFatPercent: pickerNumber(bodyFat),
    };
  }

  function onSkip() {
    Alert.alert('A few details help', SKIP_MESSAGE, [
      { text: 'Go back', style: 'cancel' },
      {
        text: 'Skip anyway',
        style: 'destructive',
        onPress: () => {
          void finish({
            gender: null,
            birthYear: null,
            heightCm: null,
            weightKg: null,
            bodyFatPercent: null,
          });
        },
      },
    ]);
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="title">Before you start</ThemedText>
        <ThemedText themeColor="textSecondary">
          Gender, age, height, and weight help estimate energy use. Body fat is optional. None of this is treated as
          a measurement of health.
        </ThemedText>
      </View>

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
          if (value === 'woman' || value === 'man' || value === 'other') {
            setGender(value);
          }
        }}
        options={[
          { value: 'woman', label: 'Woman' },
          { value: 'man', label: 'Man' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <NativePickerField label="Age" value={age} options={ages} onChange={setAge} />
      <NativePickerField label="Height" value={height} options={heightChoices} onChange={setHeight} />
      <NativePickerField label="Weight" value={weight} options={weightChoices} onChange={setWeight} />
      <NativePickerField
        label="Body fat"
        hint="Optional."
        value={bodyFat}
        options={fats}
        onChange={setBodyFat}
      />

      <View style={styles.actions}>
        <Button label="Continue" onPress={() => void finish()} />
        <Button label="Skip" variant="ghost" onPress={onSkip} />
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
    marginTop: 8,
  },
});
