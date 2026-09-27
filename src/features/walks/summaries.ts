import { isSameDay, startOfDay, startOfWeek } from '@/lib/dates';
import type { Walk } from '@/types';

export type WalkTotals = {
  steps: number;
  durationSeconds: number;
  distanceMeters: number;
  walkCount: number;
};

export function walkOverlapsDay(walk: Walk, day: Date): boolean {
  return isSameDay(new Date(walk.startedAt), day);
}

export function walksOnDay(walks: Walk[], day: Date): Walk[] {
  return walks
    .filter((walk) => walkOverlapsDay(walk, day))
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

export function walksInWeek(walks: Walk[], day: Date): Walk[] {
  const weekStart = startOfWeek(day).getTime();
  const weekEnd = startOfDay(day);
  weekEnd.setDate(startOfWeek(day).getDate() + 7);

  return walks
    .filter((walk) => {
      const started = new Date(walk.startedAt).getTime();
      return started >= weekStart && started < weekEnd.getTime();
    })
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

export function totalWalks(walks: Walk[]): WalkTotals {
  return walks.reduce<WalkTotals>(
    (totals, walk) => ({
      steps: totals.steps + (walk.steps ?? 0),
      durationSeconds: totals.durationSeconds + (walk.durationSeconds ?? 0),
      distanceMeters: totals.distanceMeters + (walk.distanceMeters ?? 0),
      walkCount: totals.walkCount + 1,
    }),
    { steps: 0, durationSeconds: 0, distanceMeters: 0, walkCount: 0 },
  );
}

export function groupWalksByDay(walks: Walk[]): { day: string; walks: Walk[] }[] {
  const groups = new Map<string, Walk[]>();

  for (const walk of [...walks].sort((left, right) => right.startedAt.localeCompare(left.startedAt))) {
    const key = startOfDay(new Date(walk.startedAt)).toISOString();
    const current = groups.get(key) ?? [];
    current.push(walk);
    groups.set(key, current);
  }

  return [...groups.entries()].map(([day, grouped]) => ({ day, walks: grouped }));
}
