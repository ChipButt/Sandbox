import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import {
  doc,
  enableIndexedDbPersistence,
  getFirestore,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { firebaseConfig, APP_CONFIG } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let persistenceReady = false;
let persistenceWarning = null;

try {
  enableIndexedDbPersistence(db)
    .then(() => {
      persistenceReady = true;
    })
    .catch(error => {
      persistenceWarning = error?.code || "persistence-unavailable";
      console.warn("Firestore offline persistence unavailable:", error);
    });
} catch (error) {
  persistenceWarning = error?.code || "persistence-unavailable";
  console.warn("Firestore offline persistence unavailable:", error);
}

let authPromise = null;

export function getPersistenceStatus() {
  return {
    ready: persistenceReady,
    warning: persistenceWarning
  };
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function ensureAnonymousAuth() {
  if (auth.currentUser) return auth.currentUser;

  if (!authPromise) {
    authPromise = signInAnonymously(auth)
      .then(result => result.user)
      .finally(() => {
        authPromise = null;
      });
  }

  return authPromise;
}

export async function syncPlayerStateToFirebase(state) {
  const user = await ensureAnonymousAuth();

  const payload = {
    playerId: state.playerId,
    authUid: user.uid,
    level: state.level,
    scannedStandIds: state.scannedStandIds,
    claimed: Boolean(state.claimed),
    claimTier: state.claimTier || null,
    claimedAt: state.claimedAt || null,
    pendingGodlikeClaim: Boolean(state.pendingGodlikeClaim),
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    lastClientSyncAttemptAt: new Date().toISOString(),
    updatedServerAt: serverTimestamp()
  };

  await setDoc(
    doc(db, APP_CONFIG.firebaseCollections.players, state.playerId),
    payload,
    { merge: true }
  );

  return user.uid;
}

export async function syncPrizeDrawToFirebase(state) {
  if (state.claimTier !== "godlike" || !state.prizeDraw) return null;

  const user = await ensureAnonymousAuth();

  const payload = {
    playerId: state.playerId,
    authUid: user.uid,
    claimTier: "godlike",
    swordLevel: state.level,
    name: state.prizeDraw.name,
    email: state.prizeDraw.email,
    phone: state.prizeDraw.phone || "",
    consent: Boolean(state.prizeDraw.consent),
    consentText: APP_CONFIG.prizeDrawConsentText,
    submittedAt: state.prizeDraw.submittedAt,
    updatedServerAt: serverTimestamp()
  };

  await setDoc(
    doc(db, APP_CONFIG.firebaseCollections.prizeDraw, state.playerId),
    payload,
    { merge: true }
  );

  return user.uid;
}
