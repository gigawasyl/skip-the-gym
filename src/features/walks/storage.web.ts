import { createWalkStorage, defaultProfile, templateFromWalk } from '@/features/walks/storage-core';

const memory = new Map<string, string>();

const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof localStorage === 'undefined') {
      return memory.get(key) ?? null;
    }

    return localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      memory.set(key, value);
      return;
    }

    localStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      memory.delete(key);
      return;
    }

    localStorage.removeItem(key);
  },
};

const store = createWalkStorage(webStorage);

export { defaultProfile, templateFromWalk };
export const loadWalks = store.loadWalks;
export const saveWalks = store.saveWalks;
export const loadProfile = store.loadProfile;
export const saveProfile = store.saveProfile;
export const loadTemplate = store.loadTemplate;
export const saveTemplate = store.saveTemplate;
export const loadActiveSession = store.loadActiveSession;
export const saveActiveSession = store.saveActiveSession;
export const loadDraft = store.loadDraft;
export const saveDraft = store.saveDraft;
export const loadMotionCursor = store.loadMotionCursor;
export const saveMotionCursor = store.saveMotionCursor;
export const clearAllLocalData = store.clearAllLocalData;
