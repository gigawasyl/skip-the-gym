import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { resolveWalk } from '@/features/walks/calculations';
import {
  readDetectedSteps,
  readMotionStatus,
  requestMotionAccess,
  watchDetectedSteps,
} from '@/features/walks/motion';
import {
  clearAllLocalData,
  defaultProfile,
  loadActiveSession,
  loadDraft,
  loadMotionCursor,
  loadProfile,
  loadTemplate,
  loadWalks,
  saveActiveSession,
  saveDraft,
  saveMotionCursor,
  saveProfile,
  saveTemplate,
  saveWalks,
  templateFromWalk,
} from '@/features/walks/storage';
import { createId } from '@/lib/id';
import type {
  ActiveSession,
  MotionStatus,
  TreadmillTemplate,
  UserProfile,
  Walk,
  WalkDraft,
  WalkType,
} from '@/types';

export type { WalkDraft };

type WalksContextValue = {
  ready: boolean;
  walks: Walk[];
  profile: UserProfile;
  template: TreadmillTemplate | null;
  session: ActiveSession | null;
  draft: WalkDraft | null;
  motion: MotionStatus;
  saveWalk: (draft: WalkDraft) => Walk;
  deleteWalk: (id: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  requestMotion: () => Promise<MotionStatus>;
  startSession: (type?: WalkType) => Promise<void>;
  beginSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  updateSessionInputs: (input: { speedMetersPerSecond?: number | null; inclinePercent?: number | null }) => void;
  finishSession: (input?: { speedMetersPerSecond?: number | null; inclinePercent?: number | null }) => Walk | null;
  discardSession: () => Promise<void>;
  setDraft: (draft: WalkDraft | null) => void;
  draftFromWalk: (walk: Walk) => WalkDraft;
  draftFromTemplate: () => WalkDraft;
  emptyDraft: (type?: WalkType) => WalkDraft;
  deleteAllData: () => Promise<void>;
};

const WalksContext = createContext<WalksContextValue | null>(null);

const emptyMotion = (): MotionStatus => ({
  available: false,
  permission: 'undetermined',
  canAskAgain: true,
  lastError: null,
});

export function WalksProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [template, setTemplate] = useState<TreadmillTemplate | null>(null);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [draft, setDraft] = useState<WalkDraft | null>(null);
  const [motion, setMotion] = useState<MotionStatus>(emptyMotion);
  const sessionRef = useRef<ActiveSession | null>(null);
  const walksRef = useRef<Walk[]>([]);
  const profileRef = useRef<UserProfile>(defaultProfile());

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    walksRef.current = walks;
  }, [walks]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [nextWalks, nextProfile, nextTemplate, nextSession, nextDraft, nextMotion] = await Promise.all([
        loadWalks(),
        loadProfile(),
        loadTemplate(),
        loadActiveSession(),
        loadDraft(),
        readMotionStatus(),
      ]);

      if (cancelled) {
        return;
      }

      setWalks(nextWalks);
      setProfile(nextProfile);
      setTemplate(nextTemplate);
      setSession(nextSession ? { ...nextSession, type: nextSession.type ?? 'treadmill' } : nextSession);
      setDraft(nextDraft);
      setMotion(nextMotion);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void saveWalks(walks);
  }, [ready, walks]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void saveActiveSession(session);
  }, [ready, session]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void saveDraft(draft);
  }, [ready, draft]);

  useEffect(() => {
    if (!ready || motion.permission !== 'granted') {
      return;
    }

    void importDetectedWalks();

    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        void importDetectedWalks();
      }
    };

    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [ready, motion.permission]);

  useEffect(() => {
    if (!session?.id || motion.permission !== 'granted') {
      return;
    }

    const baseline = sessionRef.current?.detectedSteps ?? 0;
    const subscription = watchDetectedSteps((steps) => {
      setSession((current) => (current ? { ...current, detectedSteps: baseline + steps } : current));
    });

    return () => subscription.remove();
  }, [session?.id, motion.permission]);

  async function persistWalks(next: Walk[]) {
    setWalks(next);
    await saveWalks(next);
  }

  async function importDetectedWalks() {
    const end = new Date();
    const cursor = await loadMotionCursor();
    const start = cursor ? new Date(cursor) : startOfRecentWindow(end);

    if (end.getTime() - start.getTime() < 60_000) {
      return;
    }

    const steps = await readDetectedSteps(start, end);
    await saveMotionCursor(end.toISOString());

    if (steps == null || steps < 50) {
      return;
    }

    const overlappingDetected = walksRef.current
      .filter((walk) => {
        const walkStart = new Date(walk.startedAt).getTime();
        return walkStart >= start.getTime() && walkStart <= end.getTime() && walk.raw.detected.steps;
      })
      .reduce((sum, walk) => sum + (walk.raw.detected.steps ?? 0), 0);

    const remaining = steps - overlappingDetected;
    if (remaining < 50) {
      return;
    }

    const walk = resolveWalk({
      type: 'unknown',
      recordingMethod: 'automatic',
      startedAt: start.toISOString(),
      notes: 'Steps detected since the last time the app was open. Duration was not measured.',
      raw: { detected: { steps: remaining }, entered: {} },
      profile: profileRef.current,
    });

    setWalks((current) => [walk, ...current.filter((item) => item.id !== walk.id)]);
  }

  function saveWalk(nextDraft: WalkDraft): Walk {
    const existing = nextDraft.existingId
      ? walksRef.current.find((walk) => walk.id === nextDraft.existingId)
      : undefined;
    const walk = resolveWalk({
      id: nextDraft.existingId,
      type: nextDraft.type,
      recordingMethod: nextDraft.recordingMethod,
      startedAt: nextDraft.startedAt,
      notes: nextDraft.notes,
      raw: nextDraft.raw,
      profile,
      createdAt: existing?.createdAt,
    });

    setWalks((current) => {
      const without = current.filter((item) => item.id !== walk.id);
      return [walk, ...without].sort((left, right) => right.startedAt.localeCompare(left.startedAt));
    });

    if (walk.type === 'treadmill') {
      const nextTemplate = templateFromWalk(walk);
      setTemplate(nextTemplate);
      void saveTemplate(nextTemplate);
    }

    setDraft(null);
    return walk;
  }

  async function deleteWalk(id: string) {
    await persistWalks(walksRef.current.filter((walk) => walk.id !== id));
  }

  async function updateProfile(next: UserProfile) {
    setProfile(next);
    await saveProfile(next);
    setWalks((current) =>
      current.map((walk) =>
        resolveWalk({
          id: walk.id,
          type: walk.type,
          recordingMethod: walk.recordingMethod,
          startedAt: walk.startedAt,
          notes: walk.notes,
          raw: walk.raw,
          profile: next,
          createdAt: walk.createdAt,
        }),
      ),
    );
  }

  async function requestMotion() {
    const next = await requestMotionAccess();
    setMotion(next);
    return next;
  }

  async function startSession(type: WalkType = 'treadmill') {
    if (sessionRef.current) {
      return;
    }

    if (motion.permission !== 'granted') {
      await requestMotion();
    }

    const next: ActiveSession = {
      id: createId('session'),
      type,
      startedAt: new Date().toISOString(),
      elapsedMs: 0,
      running: false,
      lastResumedAt: null,
      detectedSteps: 0,
      speedMetersPerSecond: type === 'treadmill' ? (template?.speedMetersPerSecond ?? null) : null,
      inclinePercent: type === 'treadmill' ? (template?.inclinePercent ?? null) : null,
    };
    setSession(next);
  }

  function beginSession() {
    setSession((current) => {
      if (!current || current.running) {
        return current;
      }

      const now = new Date().toISOString();
      return {
        ...current,
        running: true,
        startedAt: current.elapsedMs === 0 ? now : current.startedAt,
        lastResumedAt: now,
      };
    });
  }

  function pauseSession() {
    setSession((current) => {
      if (!current?.running || !current.lastResumedAt) {
        return current;
      }

      return {
        ...current,
        running: false,
        elapsedMs: current.elapsedMs + (Date.now() - new Date(current.lastResumedAt).getTime()),
        lastResumedAt: null,
      };
    });
  }

  function resumeSession() {
    setSession((current) =>
      current
        ? {
            ...current,
            running: true,
            lastResumedAt: new Date().toISOString(),
          }
        : current,
    );
  }

  function updateSessionInputs(input: {
    speedMetersPerSecond?: number | null;
    inclinePercent?: number | null;
  }) {
    setSession((current) => (current ? { ...current, ...input } : current));
  }

  function finishSession(input?: { speedMetersPerSecond?: number | null; inclinePercent?: number | null }): Walk | null {
    const current = sessionRef.current;
    if (!current) {
      return null;
    }

    const elapsedMs =
      current.running && current.lastResumedAt
        ? current.elapsedMs + (Date.now() - new Date(current.lastResumedAt).getTime())
        : current.elapsedMs;
    const durationSeconds = Math.max(1, Math.round(elapsedMs / 1000));
    const speed = input?.speedMetersPerSecond ?? current.speedMetersPerSecond;
    const incline = input?.inclinePercent ?? current.inclinePercent;
    const walk = saveWalk({
      type: current.type,
      recordingMethod: 'recordedSession',
      startedAt: current.startedAt,
      notes: '',
      raw: {
        detected: {
          durationSeconds,
          steps: current.detectedSteps > 0 ? current.detectedSteps : undefined,
        },
        entered: {
          speedMetersPerSecond: speed ?? undefined,
          inclinePercent: current.type === 'treadmill' ? (incline ?? undefined) : undefined,
        },
      },
    });

    setSession(null);
    return walk;
  }

  async function discardSession() {
    setSession(null);
    await saveActiveSession(null);
  }

  function draftFromWalk(walk: Walk): WalkDraft {
    return {
      existingId: walk.id,
      type: walk.type,
      recordingMethod: walk.recordingMethod,
      startedAt: walk.startedAt,
      notes: walk.notes,
      raw: {
        detected: { ...walk.raw.detected },
        entered: { ...walk.raw.entered },
      },
    };
  }

  function emptyDraft(type: WalkType = 'treadmill'): WalkDraft {
    return {
      type,
      recordingMethod: 'manual',
      startedAt: new Date().toISOString(),
      notes: '',
      raw: { detected: {}, entered: {} },
    };
  }

  function draftFromTemplate(): WalkDraft {
    const base = emptyDraft(template?.type ?? 'treadmill');
    return {
      ...base,
      raw: {
        detected: {},
        entered: {
          durationSeconds: template?.durationSeconds,
          speedMetersPerSecond: template?.speedMetersPerSecond,
          inclinePercent: template?.inclinePercent,
        },
      },
    };
  }

  async function deleteAllData() {
    await clearAllLocalData();
    setWalks([]);
    setProfile(defaultProfile());
    setTemplate(null);
    setSession(null);
    setDraft(null);
  }

  const value = useMemo<WalksContextValue>(
    () => ({
      ready,
      walks,
      profile,
      template,
      session,
      draft,
      motion,
      saveWalk,
      deleteWalk,
      updateProfile,
      requestMotion,
      startSession,
      beginSession,
      pauseSession,
      resumeSession,
      updateSessionInputs,
      finishSession,
      discardSession,
      setDraft,
      draftFromWalk,
      draftFromTemplate,
      emptyDraft,
      deleteAllData,
    }),
    [ready, walks, profile, template, session, draft, motion],
  );

  return <WalksContext.Provider value={value}>{children}</WalksContext.Provider>;
}

export function useWalks() {
  const value = useContext(WalksContext);
  if (!value) {
    throw new Error('useWalks must be used inside WalksProvider');
  }
  return value;
}

function startOfRecentWindow(end: Date): Date {
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  return start;
}
