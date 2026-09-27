import type { UnitSystem } from '@/types';

export const METERS_PER_MILE = 1609.344;
export const CM_PER_INCH = 2.54;
export const LB_PER_KG = 2.2046226218;

export function metersToDistance(meters: number, units: UnitSystem): number {
  return units === 'metric' ? meters / 1000 : meters / METERS_PER_MILE;
}

export function distanceToMeters(value: number, units: UnitSystem): number {
  return units === 'metric' ? value * 1000 : value * METERS_PER_MILE;
}

export function metersPerSecondToSpeed(mps: number, units: UnitSystem): number {
  return units === 'metric' ? mps * 3.6 : mps * 2.2369362921;
}

export function speedToMetersPerSecond(speed: number, units: UnitSystem): number {
  return units === 'metric' ? speed / 3.6 : speed / 2.2369362921;
}

export function paceSecondsPerUnit(paceSecondsPerKm: number, units: UnitSystem): number {
  return units === 'metric' ? paceSecondsPerKm : paceSecondsPerKm * (METERS_PER_MILE / 1000);
}

export function pacePerUnitToPerKm(paceSeconds: number, units: UnitSystem): number {
  return units === 'metric' ? paceSeconds : paceSeconds / (METERS_PER_MILE / 1000);
}

export function cmToHeightInput(cm: number, units: UnitSystem): number {
  return units === 'metric' ? cm : cm / CM_PER_INCH;
}

export function heightInputToCm(value: number, units: UnitSystem): number {
  return units === 'metric' ? value : value * CM_PER_INCH;
}

export function kgToWeightInput(kg: number, units: UnitSystem): number {
  return units === 'metric' ? kg : kg * LB_PER_KG;
}

export function weightInputToKg(value: number, units: UnitSystem): number {
  return units === 'metric' ? value : value / LB_PER_KG;
}

export function strideMetersToInput(meters: number, units: UnitSystem): number {
  return units === 'metric' ? meters * 100 : meters / 0.0254;
}

export function strideInputToMeters(value: number, units: UnitSystem): number {
  return units === 'metric' ? value / 100 : value * 0.0254;
}
