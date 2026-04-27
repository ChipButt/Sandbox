import { APP_CONFIG } from "./config.js";

function makeId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function createDefaultState() {
  const createdAt = nowIso();

  return {
    playerId: makeId(),
    level: 0,
    scannedStandIds: [],
    claimed: false,
    claimTier: null,
    claimedAt: null,
    prizeDraw: null,
    pendingGodlikeClaim: false,
    createdAt,
    updatedAt: createdAt,
    lastSyncedAt: null,
    pendingSync: false,
    authUid: null
  };
}

export function normalizeState(input) {
  const fallback = createDefaultState();
  const raw = input && typeof input === "object" ? input : {};
  const validStandIds = APP_CONFIG.stands.map(stand => stand.id);

  const scannedStandIds = Array.isArray(raw.scannedStandIds)
    ? [...new Set(raw.scannedStandIds.filter(id => validStandIds.includes(id)))]
    : [];

  const level = Math.min(APP_CONFIG.maxLevel, scannedStandIds.length);

  return {
    ...fallback,
    ...raw,
    playerId: typeof raw.playerId === "string" && raw.playerId ? raw.playerId : fallback.playerId,
    level,
    scannedStandIds,
    claimed: Boolean(raw.claimed),
    claimTier: raw.claimTier === "legendary" || raw.claimTier === "godlike" ? raw.claimTier : null,
    claimedAt: typeof raw.claimedAt === "string" ? raw.claimedAt : null,
    prizeDraw: raw.prizeDraw && typeof raw.prizeDraw === "object" ? raw.prizeDraw : null,
    pendingGodlikeClaim: Boolean(raw.pendingGodlikeClaim),
    pendingSync: Boolean(raw.pendingSync),
    lastSyncedAt: typeof raw.lastSyncedAt === "string" ? raw.lastSyncedAt : null,
    authUid: typeof raw.authUid === "string" ? raw.authUid : null
  };
}

export function loadLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(APP_CONFIG.localSaveKey));
    return normalizeState(saved);
  } catch {
    return createDefaultState();
  }
}

export function saveLocalState(state) {
  const next = normalizeState({
    ...state,
    updatedAt: nowIso()
  });

  localStorage.setItem(APP_CONFIG.localSaveKey, JSON.stringify(next));
  return next;
}

export function markPendingSync(state) {
  return saveLocalState({
    ...state,
    pendingSync: true
  });
}

export function markSynced(state, authUid) {
  return saveLocalState({
    ...state,
    authUid: authUid || state.authUid || null,
    pendingSync: false,
    lastSyncedAt: nowIso()
  });
}

export function resetLocalState() {
  const fresh = createDefaultState();
  localStorage.setItem(APP_CONFIG.localSaveKey, JSON.stringify(fresh));
  return fresh;
}
