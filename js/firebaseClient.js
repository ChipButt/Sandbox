import { firebaseConfig, APP_CONFIG } from "./config.js";

let firebaseReadyPromise = null;
let firebaseTools = null;
let authPromise = null;

const SDK_VERSION = "12.12.1";

async function loadFirebase() {
  if (firebaseTools) return firebaseTools;

  if (!firebaseReadyPromise) {
    firebaseReadyPromise = Promise.all([
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`)
    ]).then(([appMod, authMod, firestoreMod]) => {
      const app = appMod.initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      const db = firestoreMod.getFirestore(app);

      firebaseTools = {
        app,
        auth,
        db,
        authMod,
        firestoreMod
      };

      return firebaseTools;
    });
  }

  return firebaseReadyPromise;
}

async function ensureAnonymousAuth() {
  const tools = await loadFirebase();

  if (tools.auth.currentUser) return tools.auth.currentUser;

  if (!authPromise) {
    authPromise = tools.authMod.signInAnonymously(tools.auth)
      .then(result => result.user)
      .finally(() => {
        authPromise = null;
      });
  }

  return authPromise;
}

export async function syncQuestStateToFirebase(state) {
  const tools = await loadFirebase();
  const user = await ensureAnonymousAuth();
  const { doc, serverTimestamp, setDoc } = tools.firestoreMod;

  const playerPayload = {
    authUid: user.uid,
    localPlayerId: state.localPlayerId,
    appVersion: APP_CONFIG.appVersion,
    level: state.level,
    scannedRuneIds: state.scannedRuneIds,
    claimed: Boolean(state.claimed),
    claimTier: state.claimTier || null,
    claimedAt: state.claimedAt || null,
    pendingGodlikeConsent: Boolean(state.pendingGodlikeConsent),
    prizeDrawSubmitted: Boolean(state.prizeDraw),
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    lastClientSyncAttemptAt: new Date().toISOString(),
    updatedServerAt: serverTimestamp()
  };

  await setDoc(
    doc(tools.db, APP_CONFIG.firebaseCollections.players, user.uid),
    playerPayload,
    { merge: true }
  );

  if (state.claimTier === "godlike" && state.prizeDraw) {
    const drawPayload = {
      authUid: user.uid,
      localPlayerId: state.localPlayerId,
      appVersion: APP_CONFIG.appVersion,
      claimTier: "godlike",
      swordLevel: state.level,
      scannedRuneIds: state.scannedRuneIds,
      name: state.prizeDraw.name,
      email: state.prizeDraw.email,
      phone: state.prizeDraw.phone || "",
      consent: Boolean(state.prizeDraw.consent),
      consentText: APP_CONFIG.prizeDrawConsentText,
      submittedAt: state.prizeDraw.submittedAt,
      updatedServerAt: serverTimestamp()
    };

    await setDoc(
      doc(tools.db, APP_CONFIG.firebaseCollections.prizeDraw, user.uid),
      drawPayload,
      { merge: true }
    );
  }

  return user.uid;
}
