import { createId } from '@/lib/id';
import type {
  Confidence,
  MetricSource,
  UserProfile,
  Walk,
  WalkRaw,
  WalkSources,
  WalkType,
  RecordingMethod,
} from '@/types';

const HEIGHT_TO_STRIDE = 0.413;
const MIN_STRIDE_METERS = 0.4;
const MAX_STRIDE_METERS = 1.1;

export function strideLengthMeters(profile: UserProfile): number | null {
  if (profile.calibratedStrideLengthMeters && profile.calibratedStrideLengthMeters > 0) {
    return clamp(profile.calibratedStrideLengthMeters, MIN_STRIDE_METERS, MAX_STRIDE_METERS);
  }

  if (profile.heightCm && profile.heightCm > 0) {
    return clamp((profile.heightCm / 100) * HEIGHT_TO_STRIDE, MIN_STRIDE_METERS, MAX_STRIDE_METERS);
  }

  return null;
}

export function speedFromPace(paceSecondsPerKilometer: number): number {
  return 1000 / paceSecondsPerKilometer;
}

export function paceFromSpeed(speedMetersPerSecond: number): number {
  return 1000 / speedMetersPerSecond;
}

export function estimateDistanceMeters(durationSeconds: number, speedMetersPerSecond: number): number {
  return speedMetersPerSecond * durationSeconds;
}

export function estimateSteps(distanceMeters: number, strideMetersValue: number): number {
  return roundEstimatedSteps(distanceMeters / strideMetersValue);
}

/** ACSM walking VO2, then ~5 kcal per liter of O2. Returns null when the estimate cannot be formed. */
export function estimateWalkingKcal(input: {
  durationSeconds: number;
  weightKg: number | null;
  speedMetersPerSecond?: number | null;
  inclinePercent?: number | null;
  distanceMeters?: number | null;
}): number | null {
  if (!input.weightKg || input.weightKg <= 0 || input.durationSeconds <= 0) {
    return null;
  }

  let speed = input.speedMetersPerSecond ?? null;
  if ((speed == null || speed <= 0) && input.distanceMeters != null && input.distanceMeters > 0) {
    speed = input.distanceMeters / input.durationSeconds;
  }

  if (speed == null || speed <= 0) {
    return null;
  }

  const speedMPerMin = speed * 60;
  const grade = Math.max(0, (input.inclinePercent ?? 0) / 100);
  const vo2 = 3.5 + 0.1 * speedMPerMin + 1.8 * speedMPerMin * grade;
  const kcalPerMin = (vo2 * input.weightKg * 5) / 1000;
  return Math.max(0, kcalPerMin * (input.durationSeconds / 60));
}

export function roundEstimatedSteps(steps: number): number {
  return Math.max(10, Math.round(steps / 10) * 10);
}

export function estimatedStepRange(steps: number): { min: number; max: number } {
  const spread = Math.max(20, Math.round(steps * 0.1));
  return {
    min: roundEstimatedSteps(steps - spread),
    max: roundEstimatedSteps(steps + spread),
  };
}

export function emptyRaw(): WalkRaw {
  return { detected: {}, entered: {} };
}

export function resolveWalk(input: {
  id?: string;
  type: WalkType;
  recordingMethod: RecordingMethod;
  startedAt: string;
  notes?: string;
  raw: WalkRaw;
  profile: UserProfile;
  createdAt?: string;
}): Walk {
  const now = new Date().toISOString();
  const sources: WalkSources = {};
  const { detected, entered } = input.raw;

  const durationSeconds = pickNumber(entered.durationSeconds, detected.durationSeconds);
  if (durationSeconds != null) {
    sources.durationSeconds = entered.durationSeconds != null ? 'userEntered' : 'detected';
  }

  let speedMetersPerSecond = entered.speedMetersPerSecond;
  let paceSecondsPerKilometer = entered.paceSecondsPerKilometer;
  let speedSource: MetricSource | undefined = entered.speedMetersPerSecond != null ? 'userEntered' : undefined;
  let paceSource: MetricSource | undefined =
    entered.paceSecondsPerKilometer != null ? 'userEntered' : undefined;

  if (speedMetersPerSecond == null && paceSecondsPerKilometer != null) {
    speedMetersPerSecond = speedFromPace(paceSecondsPerKilometer);
    speedSource = 'estimated';
  }

  if (paceSecondsPerKilometer == null && speedMetersPerSecond != null) {
    paceSecondsPerKilometer = paceFromSpeed(speedMetersPerSecond);
    paceSource = 'estimated';
  }

  let distanceMeters = entered.distanceMeters;
  let distanceSource: MetricSource | undefined = entered.distanceMeters != null ? 'userEntered' : undefined;

  if (
    distanceMeters == null &&
    durationSeconds != null &&
    speedMetersPerSecond != null &&
    durationSeconds > 0 &&
    speedMetersPerSecond > 0
  ) {
    distanceMeters = estimateDistanceMeters(durationSeconds, speedMetersPerSecond);
    distanceSource = 'estimated';
  }

  if (
    entered.distanceMeters != null &&
    durationSeconds != null &&
    durationSeconds > 0 &&
    entered.speedMetersPerSecond == null &&
    entered.paceSecondsPerKilometer == null
  ) {
    speedMetersPerSecond = entered.distanceMeters / durationSeconds;
    paceSecondsPerKilometer = paceFromSpeed(speedMetersPerSecond);
    speedSource = 'estimated';
    paceSource = 'estimated';
  }

  let steps = entered.steps ?? detected.steps ?? null;
  let stepsSource: MetricSource | undefined =
    entered.steps != null ? 'userEntered' : detected.steps != null ? 'detected' : undefined;
  let stepRange: Walk['stepRange'] = null;

  if (steps == null && distanceMeters != null) {
    const stride = strideLengthMeters(input.profile);
    if (stride) {
      steps = estimateSteps(distanceMeters, stride);
      stepsSource = 'estimated';
      stepRange = estimatedStepRange(steps);
    }
  }

  if (speedSource) {
    sources.speedMetersPerSecond = speedSource;
  }
  if (paceSource) {
    sources.paceSecondsPerKilometer = paceSource;
  }
  if (distanceSource) {
    sources.distanceMeters = distanceSource;
  }
  if (stepsSource) {
    sources.steps = stepsSource;
  }
  if (entered.inclinePercent != null) {
    sources.inclinePercent = 'userEntered';
  }

  return {
    id: input.id ?? createId(),
    type: input.type,
    recordingMethod: input.recordingMethod,
    startedAt: input.startedAt,
    durationSeconds,
    steps,
    stepRange,
    distanceMeters: distanceMeters ?? null,
    speedMetersPerSecond: speedMetersPerSecond ?? null,
    paceSecondsPerKilometer: paceSecondsPerKilometer ?? null,
    inclinePercent: entered.inclinePercent ?? null,
    notes: input.notes?.trim() ?? '',
    metricSources: sources,
    confidence: resolveConfidence({
      durationSeconds,
      steps,
      stepsSource,
      distanceMeters: distanceMeters ?? null,
      distanceSource,
      speedMetersPerSecond,
    }),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    raw: {
      detected: { ...detected },
      entered: { ...entered },
    },
  };
}

function resolveConfidence({
  durationSeconds,
  steps,
  stepsSource,
  distanceMeters,
  distanceSource,
  speedMetersPerSecond,
}: {
  durationSeconds: number | null;
  steps: number | null;
  stepsSource?: MetricSource;
  distanceMeters: number | null;
  distanceSource?: MetricSource;
  speedMetersPerSecond?: number;
}): Confidence {
  const measuredSteps = steps != null && stepsSource !== 'estimated';
  const measuredDistance = distanceMeters != null && distanceSource !== 'estimated';

  if (durationSeconds != null && (measuredSteps || measuredDistance)) {
    return 'high';
  }

  if (durationSeconds != null && speedMetersPerSecond != null) {
    return 'medium';
  }

  return 'low';
}

function pickNumber(preferred?: number, fallback?: number): number | null {
  if (preferred != null) {
    return preferred;
  }
  if (fallback != null) {
    return fallback;
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
