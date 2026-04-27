import { APP_CONFIG } from "./config.js";
import { getBestUnlockedReward, getNextStage, getStage } from "./swordData.js";

const els = {
  connectionStatus: document.getElementById("connectionStatus"),
  syncStatus: document.getElementById("syncStatus"),
  rarityPill: document.getElementById("rarityPill"),
  swordName: document.getElementById("swordName"),
  swordDescription: document.getElementById("swordDescription"),
  swordFrame: document.getElementById("swordFrame"),
  swordArt: document.getElementById("swordArt"),
  messageBox: document.getElementById("messageBox"),
  rewardHint: document.getElementById("rewardHint"),
  progressText: document.getElementById("progressText"),
  nextText: document.getElementById("nextText"),
  progressFill: document.getElementById("progressFill"),
  openScannerBtn: document.getElementById("openScannerBtn"),
  locationList: document.getElementById("locationList"),
  claimPanel: document.getElementById("claimPanel"),
  claimTitle: document.getElementById("claimTitle"),
  claimText: document.getElementById("claimText"),
  prizeDrawForm: document.getElementById("prizeDrawForm"),
  drawName: document.getElementById("drawName"),
  drawEmail: document.getElementById("drawEmail"),
  drawPhone: document.getElementById("drawPhone"),
  drawConsent: document.getElementById("drawConsent"),
  devPanel: document.getElementById("devPanel"),
  qrLinks: document.getElementById("qrLinks"),
  resetBtn: document.getElementById("resetBtn"),
  scannerOverlay: document.getElementById("scannerOverlay"),
  scannerVideo: document.getElementById("scannerVideo"),
  scannerStatus: document.getElementById("scannerStatus"),
  closeScannerBtn: document.getElementById("closeScannerBtn"),
  manualFallback: document.getElementById("manualFallback"),
  manualRuneForm: document.getElementById("manualRuneForm"),
  manualRuneInput: document.getElementById("manualRuneInput")
};

export function getElements() {
  return els;
}

export function renderApp(state) {
  renderSword(state);
  renderProgress(state);
  renderLocations(state);
  renderRewardHint(state);
  renderClaimPanel(state);
  renderDevPanel();
}

export function renderConnectionStatus() {
  const online = navigator.onLine;
  els.connectionStatus.textContent = online ? "Online" : "Offline — quest still works";
  els.connectionStatus.className = `status-chip ${online ? "good" : "warn"}`;
}

export function renderSyncStatus(state, syncing = false) {
  if (syncing) {
    els.syncStatus.textContent = "Syncing quest progress…";
    els.syncStatus.className = "status-chip warn";
    return;
  }

  if (state.pendingSync) {
    els.syncStatus.textContent = navigator.onLine
      ? "Saved here — cloud sync pending"
      : "Saved here — waiting for signal";
    els.syncStatus.className = "status-chip warn";
    return;
  }

  if (state.lastSyncedAt) {
    els.syncStatus.textContent = "Quest saved and synced";
    els.syncStatus.className = "status-chip good";
    return;
  }

  els.syncStatus.textContent = "Quest saved on this device";
  els.syncStatus.className = "status-chip";
}

export function showMessage(type, text) {
  els.messageBox.className = `message-box ${type}`;
  els.messageBox.textContent = text;
}

export function hideMessage() {
  els.messageBox.className = "message-box hidden";
  els.messageBox.textContent = "";
}

export function setScannerStatus(text) {
  els.scannerStatus.textContent = text;
}

export function showScanner() {
  els.scannerOverlay.classList.remove("hidden");
  els.manualFallback.classList.add("hidden");
}

export function hideScanner() {
  els.scannerOverlay.classList.add("hidden");
}

export function showScannerFallback() {
  els.manualFallback.classList.remove("hidden");
}

export function animateSword(type = "reveal") {
  els.swordFrame.classList.remove("reveal", "claimed");
  window.requestAnimationFrame(() => {
    els.swordFrame.classList.add(type);
  });

  window.setTimeout(() => {
    els.swordFrame.classList.remove(type);
  }, 2600);
}

function renderSword(state) {
  const stage = getStage(state.level);
  document.documentElement.style.setProperty("--rarity-color", stage.colour);

  els.rarityPill.textContent = stage.rarity;
  els.swordName.textContent = stage.name;
  els.swordDescription.textContent = state.claimed
    ? `This weapon has been exchanged for the ${state.claimTier === "godlike" ? "Godlike" : "Legendary"} reward. Quest complete.`
    : stage.description;
  els.swordArt.innerHTML = createSwordSvg(stage);
}

function renderProgress(state) {
  const nextStage = getNextStage(state.level);
  const percent = (state.level / APP_CONFIG.maxLevel) * 100;

  els.progressText.textContent = `Progress: ${state.level} / ${APP_CONFIG.maxLevel}`;
  els.progressFill.style.width = `${percent}%`;

  if (state.claimed) {
    els.nextText.textContent = "Quest complete";
  } else if (state.pendingGodlikeConsent) {
    els.nextText.textContent = "Complete prize draw entry";
  } else if (nextStage) {
    els.nextText.textContent = `Next: ${nextStage.name}`;
  } else {
    els.nextText.textContent = "Godlike form reached";
  }
}

function renderLocations(state) {
  els.locationList.innerHTML = "";

  APP_CONFIG.runeLocations.forEach((location, index) => {
    const scanned = state.scannedRuneIds.includes(location.id);
    const row = document.createElement("div");
    row.className = "location-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(location.name)}</strong>
        <span>${escapeHtml(location.label)} ${index + 1}</span>
      </div>
      <div class="badge ${scanned ? "done" : "locked"}">${scanned ? "Absorbed" : "Unfound"}</div>
    `;
    els.locationList.appendChild(row);
  });
}

function renderRewardHint(state) {
  const unlockedReward = getBestUnlockedReward(state);

  if (state.claimed) {
    els.rewardHint.className = "reward-hint good";
    els.rewardHint.textContent = "Reward exchanged. Quest complete.";
    return;
  }

  if (state.pendingGodlikeConsent) {
    els.rewardHint.className = "reward-hint warn";
    els.rewardHint.textContent = "Godlike exchange started. Complete the prize draw form below to finish.";
    return;
  }

  if (unlockedReward?.id === "godlike") {
    els.rewardHint.className = "reward-hint good";
    els.rewardHint.textContent = "Godlike reward unlocked. Ask staff for the Godlike claim rune when you are ready to exchange.";
    return;
  }

  if (unlockedReward?.id === "legendary") {
    els.rewardHint.className = "reward-hint good";
    els.rewardHint.textContent = "Legendary reward unlocked. Ask staff for the Legendary claim rune, or keep scanning to reach Godlike.";
    return;
  }

  els.rewardHint.className = "reward-hint hidden";
  els.rewardHint.textContent = "";
}

function renderClaimPanel(state) {
  if (!state.pendingGodlikeConsent && !state.claimed) {
    els.claimPanel.classList.add("hidden");
    els.prizeDrawForm.classList.add("hidden");
    return;
  }

  els.claimPanel.classList.remove("hidden");

  if (state.pendingGodlikeConsent) {
    els.claimTitle.textContent = "Godlike Prize Draw Entry";
    els.claimText.textContent = "Your Godlike exchange has been accepted. Add your details below to enter the grand prize draw.";
    els.prizeDrawForm.classList.remove("hidden");
    return;
  }

  els.claimTitle.textContent = state.claimTier === "godlike" ? "Godlike Reward Claimed" : "Legendary Reward Claimed";
  els.claimText.textContent = state.claimTier === "godlike"
    ? "Congratulations — enjoy your reward now, and good luck in the grand prize draw."
    : "Congratulations — your Legendary sword has been exchanged. Enjoy your reward.";
  els.prizeDrawForm.classList.add("hidden");
}

function renderDevPanel() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("dev") !== "1") {
    els.devPanel.classList.add("hidden");
    return;
  }

  els.devPanel.classList.remove("hidden");
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const links = [
    ...APP_CONFIG.runeLocations.map(location => ({ label: location.name, url: `${baseUrl}?scan=${location.id}` })),
    { label: "Legendary claim", url: `${baseUrl}?claim=legendary&claimCode=${APP_CONFIG.claimCodes.legendary}` },
    { label: "Godlike claim", url: `${baseUrl}?claim=godlike&claimCode=${APP_CONFIG.claimCodes.godlike}` }
  ];

  els.qrLinks.innerHTML = links.map(link => `
    <code>${escapeHtml(link.label)} — ${escapeHtml(link.url)}</code>
  `).join("");
}

function createSwordSvg(stage) {
  if (stage.level === 0) {
    return `
      <svg class="sword-svg" viewBox="0 0 200 200" aria-label="No sword yet">
        <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="8" stroke-dasharray="12 12"/>
        <path d="M70 130 L130 70" stroke="rgba(255,255,255,0.22)" stroke-width="12" stroke-linecap="round"/>
      </svg>
    `;
  }

  const crossguardWidth = 56 + (stage.level * 5);
  const bladeWidth = 22 + Math.min(stage.level * 2, 10);

  return `
    <svg class="sword-svg" viewBox="0 0 200 200" aria-label="${escapeHtml(stage.name)}">
      <defs>
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="${stage.blade}"/>
          <stop offset="100%" stop-color="#6f6f78"/>
        </linearGradient>
        <radialGradient id="gemGrad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="42%" stop-color="${stage.gem}"/>
          <stop offset="100%" stop-color="#2a172f"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="${3 + stage.level}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g transform="translate(100 100) rotate(42) translate(-100 -100)">
        <path
          d="M100 14 C106 25 113 50 113 ${112 - stage.level} L100 ${132 - stage.level} L87 ${112 - stage.level} C87 50 94 25 100 14Z"
          fill="url(#bladeGrad)"
          stroke="rgba(255,255,255,0.45)"
          stroke-width="2"
          filter="url(#glow)"
        />
        <path
          d="M${100 - bladeWidth / 2} 48 C97 70 97 92 ${100 - bladeWidth / 3} 116"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          stroke-width="2"
          stroke-linecap="round"
        />
        <rect
          x="${100 - crossguardWidth / 2}"
          y="119"
          width="${crossguardWidth}"
          height="13"
          rx="6.5"
          fill="${stage.hilt}"
          stroke="rgba(255,255,255,0.28)"
          stroke-width="2"
        />
        <circle cx="100" cy="125.5" r="${7 + stage.level}" fill="url(#gemGrad)" stroke="rgba(255,255,255,0.42)" stroke-width="2"/>
        <rect x="91" y="130" width="18" height="${38 + stage.level * 2}" rx="8" fill="${stage.hilt}" stroke="rgba(255,255,255,0.24)" stroke-width="2"/>
        <circle cx="100" cy="${173 + stage.level * 2}" r="${10 + Math.min(stage.level, 4)}" fill="${stage.hilt}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        ${stage.level >= 3 ? `
          <path d="M72 104 C52 86 52 67 64 52" fill="none" stroke="${stage.colour}" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
          <path d="M128 104 C148 86 148 67 136 52" fill="none" stroke="${stage.colour}" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
        ` : ""}
        ${stage.level >= 5 ? `
          <path d="M100 4 L106 22 L125 17 L114 34 L130 46 L109 47 L100 65 L91 47 L70 46 L86 34 L75 17 L94 22Z" fill="${stage.colour}" opacity="0.72"/>
        ` : ""}
      </g>
    </svg>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
