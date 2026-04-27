import { APP_CONFIG } from "./config.js";
import {
  getPersistenceStatus,
  syncPlayerStateToFirebase,
  syncPrizeDrawToFirebase,
  watchAuth
} from "./firebaseClient.js";
import {
  loadLocalState,
  markPendingSync,
  markSynced,
  resetLocalState,
  saveLocalState
} from "./storage.js";
import { canClaimReward, getReward, getStage, getStand } from "./swordData.js";
import {
  animateSword,
  getElements,
  hideMessage,
  renderApp,
  renderConnectionStatus,
  renderSyncStatus,
  showMessage
} from "./ui.js";

let state = loadLocalState();
let syncing = false;
let syncTimer = null;

const els = getElements();

boot();

async function boot() {
  registerServiceWorker();
  bindEvents();
  watchOnlineStatus();
  watchAuth(user => {
    if (user?.uid && state.authUid !== user.uid) {
      state = saveLocalState({ ...state, authUid: user.uid });
      renderSyncStatus(state, syncing);
    }
  });

  processUrlAction();
  renderConnectionStatus();
  renderApp(state);
  renderSyncStatus(state, syncing);
  queueSync("boot");
}

function bindEvents() {
  els.prizeDrawForm.addEventListener("submit", handlePrizeDrawSubmit);
  els.syncNowBtn.addEventListener("click", () => queueSync("manual"));
  els.resetBtn.addEventListener("click", handleReset);
}

function watchOnlineStatus() {
  window.addEventListener("online", () => {
    renderConnectionStatus();
    showMessage("good", "Internet connection restored. Trying to sync your quest progress now.");
    queueSync("online");
  });

  window.addEventListener("offline", () => {
    renderConnectionStatus();
    renderSyncStatus(state, syncing);
    showMessage("warn", "You are offline. Quest progress will keep saving on this device and sync later.");
  });
}

function processUrlAction() {
  const params = new URLSearchParams(window.location.search);
  const scanId = params.get("scan");
  const claimId = params.get("claim");
  const claimCode = params.get("claimCode");

  if (scanId) {
    handleStandScan(scanId);
    cleanUrl(["scan"]);
    return;
  }

  if (claimId) {
    handleClaimScan(claimId, claimCode);
    cleanUrl(["claim", "claimCode"]);
  }
}

function handleStandScan(scanId) {
  const stand = getStand(scanId);

  if (!stand) {
    showMessage("bad", "That quest QR code is not recognised for this event.");
    return;
  }

  if (state.claimed) {
    showMessage("warn", "This sword has already been exchanged. Quest complete.");
    return;
  }

  if (state.pendingGodlikeClaim) {
    showMessage("warn", "Your Godlike claim has already started. Complete the prize draw form to finish your exchange.");
    return;
  }

  if (state.scannedStandIds.includes(stand.id)) {
    showMessage("warn", `${stand.name} has already empowered your sword. Find a different quest stand to upgrade again.`);
    return;
  }

  if (state.level >= APP_CONFIG.maxLevel) {
    showMessage("good", "Your sword is already Godlike. Ask staff for the Godlike claim QR code when you are ready to exchange it.");
    return;
  }

  const scannedStandIds = [...state.scannedStandIds, stand.id];
  const nextLevel = Math.min(APP_CONFIG.maxLevel, scannedStandIds.length);
  const nextStage = getStage(nextLevel);

  state = markPendingSync({
    ...state,
    scannedStandIds,
    level: nextLevel
  });

  renderApp(state);
  renderSyncStatus(state, syncing);
  animateSword("reveal");
  showMessage("good", `${stand.name} empowered your sword. New form: ${nextStage.name}.`);
  queueSync("scan");
}

function handleClaimScan(claimId, claimCode) {
  const reward = getReward(claimId);

  if (!reward || APP_CONFIG.claimCodes[claimId] !== claimCode) {
    showMessage("bad", "That claim QR code is not recognised.");
    return;
  }

  if (state.claimed) {
    showMessage("warn", "This sword has already been exchanged. Quest complete.");
    return;
  }

  if (!canClaimReward(state, claimId)) {
    const neededStage = getStage(reward.requiredLevel);
    showMessage("warn", `This reward needs a ${neededStage.rarity} sword. Keep scanning quest stands to upgrade.`);
    return;
  }

  if (claimId === "legendary") {
    state = markPendingSync({
      ...state,
      claimed: true,
      claimTier: "legendary",
      claimedAt: new Date().toISOString(),
      pendingGodlikeClaim: false
    });

    renderApp(state);
    renderSyncStatus(state, syncing);
    animateSword("claimed");
    showMessage("good", reward.successText);
    queueSync("legendary-claim");
    return;
  }

  if (claimId === "godlike") {
    state = markPendingSync({
      ...state,
      pendingGodlikeClaim: true
    });

    renderApp(state);
    renderSyncStatus(state, syncing);
    animateSword("claimed");
    showMessage("good", "Godlike claim started. Complete the prize draw form below to finish the exchange.");
    queueSync("godlike-claim-started");
  }
}

function handlePrizeDrawSubmit(event) {
  event.preventDefault();

  const name = els.drawName.value.trim();
  const email = els.drawEmail.value.trim();
  const phone = els.drawPhone.value.trim();
  const consent = els.drawConsent.checked;

  if (!state.pendingGodlikeClaim || state.claimed) {
    showMessage("warn", "There is no active Godlike claim to complete.");
    return;
  }

  if (!name || !email || !consent) {
    showMessage("bad", "Please add your name, email address, and consent before entering the prize draw.");
    return;
  }

  const reward = getReward("godlike");

  state = markPendingSync({
    ...state,
    claimed: true,
    claimTier: "godlike",
    claimedAt: new Date().toISOString(),
    pendingGodlikeClaim: false,
    prizeDraw: {
      name,
      email,
      phone,
      consent: true,
      submittedAt: new Date().toISOString()
    }
  });

  els.prizeDrawForm.reset();
  renderApp(state);
  renderSyncStatus(state, syncing);
  animateSword("claimed");
  showMessage("good", reward.successText);
  queueSync("godlike-prize-draw");
}

function handleReset() {
  const confirmed = window.confirm(
    "Reset the quest save on this device? Use this only for testing. A real player should not press this during an event."
  );

  if (!confirmed) return;

  state = resetLocalState();
  hideMessage();
  renderApp(state);
  renderSyncStatus(state, syncing);
  showMessage("warn", "This device has been reset for testing. Scan any quest stand QR to begin again.");
}

function queueSync(reason) {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => syncNow(reason), 250);
}

async function syncNow(reason = "unknown") {
  if (syncing) return;

  renderConnectionStatus();

  if (!navigator.onLine) {
    state = markPendingSync(state);
    renderSyncStatus(state, false);
    return;
  }

  syncing = true;
  renderSyncStatus(state, true);

  try {
    const authUid = await syncPlayerStateToFirebase(state);

    if (state.claimTier === "godlike" && state.prizeDraw) {
      await syncPrizeDrawToFirebase(state);
    }

    state = markSynced(state, authUid);
    renderApp(state);
    renderSyncStatus(state, false);

    if (reason !== "boot") {
      showMessage("good", "Quest progress synced successfully.");
    }
  } catch (error) {
    console.warn("Sync failed:", error);
    state = markPendingSync(state);
    renderSyncStatus(state, false);

    if (navigator.onLine) {
      showMessage("warn", "Progress is saved on this device, but Firebase sync failed. Check Firebase setup/rules and try Sync Now.");
    } else {
      showMessage("warn", "Progress is saved on this device and will sync when internet returns.");
    }
  } finally {
    syncing = false;
    renderSyncStatus(state, false);
    const persistence = getPersistenceStatus();
    if (persistence.warning) {
      console.warn("Firestore persistence warning:", persistence.warning);
    }
  }
}

function cleanUrl(keysToRemove) {
  const url = new URL(window.location.href);
  keysToRemove.forEach(key => url.searchParams.delete(key));
  const clean = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, clean);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.warn("Service worker registration failed:", error);
    });
  });
}
