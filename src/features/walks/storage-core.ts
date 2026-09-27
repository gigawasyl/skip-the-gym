import type { ActiveSession, TreadmillTemplate, UserProfile, Walk, WalkDraft } from '@/types';

export type KeyValueStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const WALKS_KEY = 'walks.v1';
const PROFILE_KEY = 'profile.v1';
const TEMPLATE_KEY = 'treadmill-template.v1';
const SESSION_KEY = 'active-session.v1';
const DRAFT_KEY = 'walk-draft.v1';
const MOTION_CURSOR_KEY = 'motion-cursor.v1';

export const defaultProfile = (): UserProfile => ({
  heightCm: null,
  weightKg: null,
  birthYear: null,
  gender: null,
  bodyFatPercent: null,
  unitSystem: 'metric',
  calibratedStrideLengthMeters: null,
  onboardingCompleted: false,
});

function readJson<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function createWalkStorage(storage: KeyValueStore) {
  return {
    async loadWalks(): Promise<Walk[]> {
      const parsed = readJson<Walk[]>(await storage.getItem(WALKS_KEY), []);
      return Array.isArray(parsed) ? parsed : [];
    },

    async saveWalks(walks: Walk[]): Promise<void> {
      await storage.setItem(WALKS_KEY, JSON.stringify(walks));
    },

    async loadProfile(): Promise<UserProfile> {
      return { ...defaultProfile(), ...readJson<Partial<UserProfile>>(await storage.getItem(PROFILE_KEY), {}) };
    },

    async saveProfile(profile: UserProfile): Promise<void> {
      await storage.setItem(PROFILE_KEY, JSON.stringify(profile));
    },

    async loadTemplate(): Promise<TreadmillTemplate | null> {
      return readJson<TreadmillTemplate | null>(await storage.getItem(TEMPLATE_KEY), null);
    },

    async saveTemplate(template: TreadmillTemplate): Promise<void> {
      await storage.setItem(TEMPLATE_KEY, JSON.stringify(template));
    },

    async loadActiveSession(): Promise<ActiveSession | null> {
      return readJson<ActiveSession | null>(await storage.getItem(SESSION_KEY), null);
    },

    async saveActiveSession(session: ActiveSession | null): Promise<void> {
      if (!session) {
        await storage.removeItem(SESSION_KEY);
        return;
      }

      await storage.setItem(SESSION_KEY, JSON.stringify(session));
    },

    async loadDraft(): Promise<WalkDraft | null> {
      return readJson<WalkDraft | null>(await storage.getItem(DRAFT_KEY), null);
    },

    async saveDraft(draft: WalkDraft | null): Promise<void> {
      if (!draft) {
        await storage.removeItem(DRAFT_KEY);
        return;
      }

      await storage.setItem(DRAFT_KEY, JSON.stringify(draft));
    },

    async loadMotionCursor(): Promise<string | null> {
      return storage.getItem(MOTION_CURSOR_KEY);
    },

    async saveMotionCursor(iso: string): Promise<void> {
      await storage.setItem(MOTION_CURSOR_KEY, iso);
    },

    async clearAllLocalData(): Promise<void> {
      await Promise.all([
        storage.removeItem(WALKS_KEY),
        storage.removeItem(PROFILE_KEY),
        storage.removeItem(TEMPLATE_KEY),
        storage.removeItem(SESSION_KEY),
        storage.removeItem(DRAFT_KEY),
        storage.removeItem(MOTION_CURSOR_KEY),
      ]);
    },
  };
}

export function templateFromWalk(walk: Walk): TreadmillTemplate {
  return {
    type: walk.type,
    durationSeconds: walk.raw.entered.durationSeconds ?? walk.durationSeconds ?? undefined,
    speedMetersPerSecond: walk.raw.entered.speedMetersPerSecond ?? undefined,
    inclinePercent: walk.raw.entered.inclinePercent ?? undefined,
  };
}
