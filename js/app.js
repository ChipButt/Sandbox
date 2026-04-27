import { APP_CONFIG } from "./config.js";
import { syncQuestStateToFirebase } from "./firebaseClient.js";
import { parseRuneValue, startRuneScanner, stopRuneScanner } from "./scanner.js";
import {
  loadLocalState,
  markPendingSync,
  markSynced,
  resetLocalState,
  saveLocalState
} from "./storage.js";
import { canClaimReward, getReward, getRuneLocation, getStage } from "./swordData.js";
import {
  animateSword,
  getElements,
  hideMessage,
  hideScanner,
  renderApp,
  renderConnectionStatus,
  renderSyncStatus,
  setScannerStatus,
  showMessage,
  showScanner,
  showScannerFallback
} from "./ui.js";

let state = loadLocalState();
let syncing = false;
let syncTimer = null;
let scannerActive = false;

const els = getElements();

boot();

function boot() {
  registerServiceWorker();
  bindEvents();
  watchOnlineStatus();
  processUrlAction();
  renderConnectionStatus();
  renderApp(state);
  renderSyncStatus(state, syncing);
  queueSync("boot");
}

function bindEvents() {
  els.openScannerBtn.addEventListener("click", openScanner);
  els.closeScannerBtn.addEventListener("click", closeScanner);
  els.scannerOverlay.addEventListener("click", event => {
    if (event.target === els.scannerOverlay) closeScanner();
  });
  els.manualRuneForm.addEventListener("submit", handleManualRuneSubmit);
  els.prizeDrawForm.addEventListener("submit", handlePrizeDrawSubmit);
  els.resetBtn.addEventListener("click", handleReset);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !els.scannerOverlay.classList.contains("hidden")) {
      closeScanner();
    }
  });
}

function watchOnlineStatus() {
  window.addEventListener("online", () => {
    renderConnectionStatus();
    renderSyncStatus(state, syncing);
    queueSync("online");
  });

  window.addEventListener("offline", () => {
    renderConnectionStatus();
    renderSyncStatus(state, syncing);
    showMessage("warn", "Signal dropped. Your quest is still saved on this device and will sync when connection returns.");
  });
}

function processUrlAction() {
  const params = new URLSearchParams(window.location.search);
  const scanId = params.get("scan");
  const claimId = params.get("claim");
  const claimCode = params.get("claimCode");

  if (scanId) {
    handleRuneAbsorption({ type: "scan", id: scanId, rawValue: window.location.href });
    cleanUrl(["scan"]);
    return;
  }

  if (claimId) {
    handleRuneAbsorption({ type: "claim", id: claimId, claimCode, rawValue: window.location.href });
    cleanUrl(["claim", "claimCode"]);
  }
}

async function openScanner() {
  showScanner();
  setScannerStatus("Preparing the Aether Lens…");

  const started = await startRuneScanner({
    videoEl: els.scannerVideo,
    onStatus: setScannerStatus,
    onScan: scanned => {
      scannerActive = false;
      stopRuneScanner(els.scannerVideo);
      hideScanner();
      handleRuneAbsorption(scanned);
    },
    onError: message => {
      setScannerStatus(message);
      showScannerFallback();
    }
  });

  scannerActive = started;
  if (!started) showScannerFallback();
}

function closeScanner() {
  scannerActive = false;
  stopRuneScanner(els.scannerVideo);
  hideScanner();
}

function handleManualRuneSubmit(event) {
  event.preventDefault();
  const value = els.manualRuneInput.value.trim();
  if (!value) return;

  els.manualRuneInput.value = "";
  closeScanner();
  handleRuneAbsorption(parseRuneValue(value));
}

function handleRuneAbsorption(scanned) {
  if (!scanned || scanned.type === "unknown") {
    showMessage("bad", "That rune is not recognised for this quest.");
    return;
  }

  if (scanned.type === "scan") {
    handleLocationRune(scanned.id);
    return;
  }

  if (scanned.type === "claim") {
    handleClaimRune(scanned.id, scanned.claimCode);
  }
}

function handleLocationRune(runeId) {
  const location = getRuneLocation(runeId);

  if (!location) {
    showMessage("bad", "That rune location is not recognised for this event.");
    return;
  }

  if (state.claimed) {
    showMessage("warn", "This weapon has already been exchanged. Quest complete.");
    return;
  }

  if (state.pendingGodlikeConsent) {
    showMessage("warn", "Your Godlike exchange has started. Complete the prize draw form before absorbing more runes.");
    return;
  }

  if (state.scannedRuneIds.includes(location.id)) {
    showMessage("warn", `${location.name} has already empowered your weapon. Find a different rune location to upgrade again.`);
    return;
  }

  if (state.level >= APP_CONFIG.maxLevel) {
    showMessage("good", "Your weapon is already Godlike. Ask staff for the Godlike claim rune when you are ready to exchange it.");
    return;
  }

  const scannedRuneIds = [...state.scannedRuneIds, location.id];
  const nextLevel = Math.min(APP_CONFIG.maxLevel, scannedRuneIds.length);
  const nextStage = getStage(nextLevel);

  state = markPendingSync({
    ...state,
    scannedRuneIds,
    level: nextLevel
  });

  renderApp(state);
  renderSyncStatus(state, syncing);
  animateSword("reveal");
  showMessage("good", `${location.name}'s rune empowered your weapon. New form: ${nextStage.name}.`);
  queueSync("rune-scan");
}

function handleClaimRune(claimId, claimCode) {
  const reward = getReward(claimId);

  if (!reward || APP_CONFIG.claimCodes[claimId] !== claimCode) {
    showMessage("bad", "That claim rune is not recognised.");
    return;
  }

  if (state.claimed) {
    showMessage("warn", "This weapon has already been exchanged. Quest complete.");
    return;
  }

  if (!canClaimReward(state, claimId)) {
    const neededStage = getStage(reward.requiredLevel);
    showMessage("warn", `This claim needs a ${neededStage.rarity} weapon. Keep absorbing quest runes to upgrade.`);
    return;
  }

  if (claimId === "legendary") {
    state = markPendingSync({
      ...state,
      claimed: true,
      claimTier: "legendary",
      claimedAt: new Date().toISOString(),
      pendingGodlikeConsent: false
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
      pendingGodlikeConsent: true
    });

    renderApp(state);
    renderSyncStatus(state, syncing);
    animateSword("claimed");
    showMessage("good", "Godlike claim accepted. Complete the prize draw form to finish the exchange.");
    queueSync("godlike-claim-started");
  }
}

function handlePrizeDrawSubmit(event) {
  event.preventDefault();

  const name = els.drawName.value.trim();
  const email = els.drawEmail.value.trim();
  const phone = els.drawPhone.value.trim();
  const consent = els.drawConsent.checked;

  if (!state.pendingGodlikeConsent || state.claimed) {
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
    pendingGodlikeConsent: false,
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
  const confirmed = window.confirm("Reset the quest save on this device? This is only for testing.");
  if (!confirmed) return;

  state = resetLocalState();
  hideMessage();
  renderApp(state);
  renderSyncStatus(state, syncing);
  showMessage("warn", "This device has been reset for testing. Open the rune absorption window to begin again.");
}

function queueSync(reason) {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => syncNow(reason), 400);
}

async function syncNow(reason = "unknown") {
  if (syncing) return;

  renderConnectionStatus();

  if (!navigator.onLine) {
    if (state.pendingSync) renderSyncStatus(state, false);
    return;
  }

  syncing = true;
  renderSyncStatus(state, true);

  try {
    const authUid = await syncQuestStateToFirebase(state);
    state = markSynced(state, authUid);
    renderApp(state);
    renderSyncStatus(state, false);

    if (reason !== "boot") {
      showMessage("good", "Quest progress synced.");
    }
  } catch (error) {
    console.warn("Sync failed:", error);
    state = markPendingSync(state, error?.code || error?.message || "sync-failed");
    renderSyncStatus(state, false);
  } finally {
    syncing = false;
    renderSyncStatus(state, false);
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
