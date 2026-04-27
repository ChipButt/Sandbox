import { APP_CONFIG } from "./config.js";

function makeLocalId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function createDefaultState() {
  const createdAt = nowIso();

  return {
    localPlayerId: makeLocalId(),
    authUid: null,
    level: 0,
    scannedRuneIds: [],
    claimed: false,
    claimTier: null,
    claimedAt: null,
    pendingGodlikeConsent: false,
    prizeDraw: null,
    createdAt,
    updatedAt: createdAt,
    lastSyncedAt: null,
    lastSyncError: null,
    pendingSync: false
  };
}

export function normalizeState(input) {
  const fallback = createDefaultState();
  const raw = input && typeof input === "object" ? input : {};
  const validRuneIds = APP_CONFIG.runeLocations.map(location => location.id);

  const scannedRuneIds = Array.isArray(raw.scannedRuneIds)
    ? [...new Set(raw.scannedRuneIds.filter(id => validRuneIds.includes(id)))]
    : [];

  const level = clampNumber(raw.level ?? scannedRuneIds.length, 0, APP_CONFIG.maxLevel);
  const claimTier = ["legendary", "godlike"].includes(raw.claimTier) ? raw.claimTier : null;

  return {
    ...fallback,
    ...raw,
    localPlayerId: typeof raw.localPlayerId === "string" ? raw.localPlayerId : fallback.localPlayerId,
    authUid: typeof raw.authUid === "string" ? raw.authUid : null,
    level: Math.min(level, scannedRuneIds.length),
    scannedRuneIds,
    claimed: Boolean(raw.claimed),
    claimTier,
    claimedAt: typeof raw.claimedAt === "string" ? raw.claimedAt : null,
    pendingGodlikeConsent: Boolean(raw.pendingGodlikeConsent),
    prizeDraw: raw.prizeDraw && typeof raw.prizeDraw === "object" ? raw.prizeDraw : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : fallback.createdAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : fallback.updatedAt,
    lastSyncedAt: typeof raw.lastSyncedAt === "string" ? raw.lastSyncedAt : null,
    lastSyncError: typeof raw.lastSyncError === "string" ? raw.lastSyncError : null,
    pendingSync: Boolean(raw.pendingSync)
  };
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.trunc(number)));
}

export function loadLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(APP_CONFIG.localSaveKey));
    return normalizeState(saved);
  } catch {
    return createDefaultState();
  }
}

export function saveLocalState(nextState) {
  const normalized = normalizeState(nextState);
  localStorage.setItem(APP_CONFIG.localSaveKey, JSON.stringify(normalized));
  return normalized;
}

export function markPendingSync(state, error = null) {
  return saveLocalState({
    ...state,
    updatedAt: nowIso(),
    pendingSync: true,
    lastSyncError: error
  });
}

export function markSynced(state, authUid) {
  return saveLocalState({
    ...state,
    authUid: authUid || state.authUid || null,
    lastSyncedAt: nowIso(),
    pendingSync: false,
    lastSyncError: null
  });
}

export function resetLocalState() {
  const fresh = createDefaultState();
  localStorage.setItem(APP_CONFIG.localSaveKey, JSON.stringify(fresh));
  return fresh;
}
