export type StorePlatform = 'ios' | 'android';

export type UnitSystem = 'metric' | 'imperial';
export type WalkType = 'outdoor' | 'indoor' | 'treadmill' | 'unknown';
export type RecordingMethod = 'automatic' | 'recordedSession' | 'manual';
export type MetricSource = 'detected' | 'userEntered' | 'estimated';
export type Confidence = 'high' | 'medium' | 'low';

export type MetricKey =
  | 'durationSeconds'
  | 'steps'
  | 'distanceMeters'
  | 'speedMetersPerSecond'
  | 'paceSecondsPerKilometer'
  | 'inclinePercent';

export type WalkSources = Partial<Record<MetricKey, MetricSource>>;

export type DetectedValues = {
  steps?: number;
  durationSeconds?: number;
};

export type EnteredValues = {
  durationSeconds?: number;
  speedMetersPerSecond?: number;
  paceSecondsPerKilometer?: number;
  inclinePercent?: number;
  distanceMeters?: number;
  steps?: number;
};

export type WalkRaw = {
  detected: DetectedValues;
  entered: EnteredValues;
};

export type Walk = {
  id: string;
  type: WalkType;
  recordingMethod: RecordingMethod;
  startedAt: string;
  durationSeconds: number | null;
  steps: number | null;
  stepRange: { min: number; max: number } | null;
  distanceMeters: number | null;
  speedMetersPerSecond: number | null;
  paceSecondsPerKilometer: number | null;
  inclinePercent: number | null;
  notes: string;
  metricSources: WalkSources;
  confidence: Confidence;
  createdAt: string;
  updatedAt: string;
  raw: WalkRaw;
};

export type Gender = 'woman' | 'man' | 'other';

export type UserProfile = {
  heightCm: number | null;
  weightKg: number | null;
  birthYear: number | null;
  gender: Gender | null;
  bodyFatPercent: number | null;
  unitSystem: UnitSystem;
  calibratedStrideLengthMeters: number | null;
  onboardingCompleted: boolean;
};

export type TreadmillTemplate = {
  durationSeconds?: number;
  speedMetersPerSecond?: number;
  inclinePercent?: number;
  type: WalkType;
};

export type WalkDraft = {
  existingId?: string;
  type: WalkType;
  recordingMethod: RecordingMethod;
  startedAt: string;
  notes: string;
  raw: WalkRaw;
};

export type ActiveSession = {
  id: string;
  type: WalkType;
  startedAt: string;
  elapsedMs: number;
  running: boolean;
  lastResumedAt: string | null;
  detectedSteps: number;
  speedMetersPerSecond: number | null;
  inclinePercent: number | null;
};

export type MotionStatus = {
  available: boolean;
  permission: 'undetermined' | 'granted' | 'denied';
  canAskAgain: boolean;
  lastError: string | null;
};
