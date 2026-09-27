import { metersPerSecondToSpeed, metersToDistance, paceSecondsPerUnit } from '@/lib/units';
import type { Confidence, MetricSource, RecordingMethod, UnitSystem, WalkType } from '@/types';

export function formatDuration(totalSeconds: number | null): string {
  if (totalSeconds == null) {
    return '—';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0 && seconds === 0) {
    return `${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = `${`${minutes}`.padStart(2, '0')}:${`${seconds}`.padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
}

export function formatElapsedPrecise(ms: number): string {
  const total = Math.max(0, ms);
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  const hundredths = Math.floor((total % 1000) / 10);
  const mm = `${minutes}`.padStart(2, '0');
  const ss = `${seconds}`.padStart(2, '0');
  const hh = `${hundredths}`.padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}.${hh}` : `${mm}:${ss}.${hh}`;
}

export function formatSteps(
  steps: number | null,
  source?: MetricSource,
  range?: { min: number; max: number } | null,
): string {
  if (steps == null) {
    return '—';
  }

  if (source === 'estimated' && range) {
    return `${range.min.toLocaleString()}–${range.max.toLocaleString()}`;
  }

  return steps.toLocaleString();
}

export function formatDistance(
  meters: number | null,
  units: UnitSystem,
  source?: MetricSource,
): string {
  if (meters == null) {
    return '—';
  }

  const value = metersToDistance(meters, units);
  const digits = source === 'estimated' ? 1 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units === 'metric' ? 'km' : 'mi'}`;
}

export function formatSpeed(mps: number | null, units: UnitSystem): string {
  if (mps == null) {
    return '—';
  }

  return `${metersPerSecondToSpeed(mps, units).toFixed(1)} ${units === 'metric' ? 'km/h' : 'mph'}`;
}

export function formatPace(paceSecondsPerKm: number | null, units: UnitSystem): string {
  if (paceSecondsPerKm == null) {
    return '—';
  }

  const seconds = Math.round(paceSecondsPerUnit(paceSecondsPerKm, units));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${`${remainder}`.padStart(2, '0')} /${units === 'metric' ? 'km' : 'mi'}`;
}

export function formatIncline(percent: number | null): string {
  if (percent == null) {
    return '—';
  }

  return `${percent.toFixed(percent % 1 === 0 ? 0 : 1)}%`;
}

export function sourceLabel(source: MetricSource): string {
  if (source === 'detected') {
    return 'Detected';
  }

  if (source === 'userEntered') {
    return 'User entered';
  }

  return 'Estimated';
}

export function walkTypeLabel(type: WalkType): string {
  if (type === 'treadmill') {
    return 'Treadmill';
  }

  if (type === 'outdoor') {
    return 'Outdoor walk';
  }

  if (type === 'indoor') {
    return 'Indoor walk';
  }

  return 'Walk';
}

export function methodLabel(method: RecordingMethod): string {
  if (method === 'automatic') {
    return 'Detected while carrying the phone';
  }

  if (method === 'recordedSession') {
    return 'Recorded treadmill session';
  }

  return 'Added manually';
}

export function confidenceLabel(confidence: Confidence): string {
  if (confidence === 'high') {
    return 'High confidence';
  }

  if (confidence === 'medium') {
    return 'Medium confidence';
  }

  return 'Low confidence';
}

export function parseDecimal(value: string): number | undefined {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parsePaceInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.includes(':')) {
    const [minutes, seconds] = trimmed.split(':');
    const mins = Number(minutes);
    const secs = Number(seconds);
    if (!Number.isFinite(mins) || !Number.isFinite(secs)) {
      return undefined;
    }
    return mins * 60 + secs;
  }

  const minutes = Number(trimmed.replace(',', '.'));
  return Number.isFinite(minutes) ? minutes * 60 : undefined;
}

export function formatPaceInput(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}:${`${remainder}`.padStart(2, '0')}`;
}
