import { cmToHeightInput, kgToWeightInput } from '@/lib/units';
import type { UnitSystem } from '@/types';

export const UNSET = 'unset';

export type PickerOption = { label: string; value: string };

function range(from: number, to: number, step = 1): number[] {
  const values: number[] = [];
  for (let value = from; value <= to; value += step) {
    values.push(Math.round(value * 10) / 10);
  }
  return values;
}

export function unsetOption(label = 'Not set'): PickerOption {
  return { label, value: UNSET };
}

export function ageOptions(): PickerOption[] {
  return [unsetOption(), ...range(13, 99).map((age) => ({ label: `${age}`, value: String(age) }))];
}

export function heightOptions(units: UnitSystem): PickerOption[] {
  if (units === 'metric') {
    return [unsetOption(), ...range(120, 220).map((cm) => ({ label: `${cm} cm`, value: String(cm) }))];
  }

  return [
    unsetOption(),
    ...range(48, 84).map((inches) => ({
      label: `${Math.floor(inches / 12)}'${inches % 12}"`,
      value: String(inches),
    })),
  ];
}

export function weightOptions(units: UnitSystem): PickerOption[] {
  if (units === 'metric') {
    return [unsetOption(), ...range(30, 200).map((kg) => ({ label: `${kg} kg`, value: String(kg) }))];
  }

  return [unsetOption(), ...range(70, 440).map((lb) => ({ label: `${lb} lb`, value: String(lb) }))];
}

export function bodyFatOptions(): PickerOption[] {
  return [unsetOption('Optional'), ...range(5, 50).map((percent) => ({ label: `${percent}%`, value: String(percent) }))];
}

export function bodyFatToPicker(percent: number | null): string {
  return snapPickerValue(percent != null ? Math.round(percent) : null, bodyFatOptions());
}

export function snapPickerValue(value: number | null, options: PickerOption[]): string {
  if (value == null || !Number.isFinite(value)) {
    return UNSET;
  }

  const numeric = options
    .map((option) => Number(option.value))
    .filter((option) => Number.isFinite(option));

  if (numeric.length === 0) {
    return UNSET;
  }

  const nearest = numeric.reduce((best, option) =>
    Math.abs(option - value) < Math.abs(best - value) ? option : best,
  );

  return String(nearest);
}

export function storedHeightToPicker(heightCm: number | null, units: UnitSystem): string {
  if (heightCm == null) {
    return UNSET;
  }

  return snapPickerValue(Math.round(cmToHeightInput(heightCm, units)), heightOptions(units));
}

export function storedWeightToPicker(weightKg: number | null, units: UnitSystem): string {
  if (weightKg == null) {
    return UNSET;
  }

  return snapPickerValue(Math.round(kgToWeightInput(weightKg, units)), weightOptions(units));
}

export function ageFromBirthYear(birthYear: number | null): string {
  if (birthYear == null) {
    return UNSET;
  }

  return snapPickerValue(new Date().getFullYear() - birthYear, ageOptions());
}

export function birthYearFromAge(age: string): number | null {
  if (!age || age === UNSET) {
    return null;
  }

  return new Date().getFullYear() - Number(age);
}

export function pickerNumber(value: string): number | null {
  if (!value || value === UNSET) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
