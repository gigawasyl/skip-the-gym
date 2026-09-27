import Storage from 'expo-sqlite/kv-store';

import { createWalkStorage, defaultProfile, templateFromWalk } from '@/features/walks/storage-core';

const store = createWalkStorage(Storage);

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
