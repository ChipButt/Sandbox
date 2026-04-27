import { APP_CONFIG } from "./config.js";
import { getNextStage, getRewardStatus, getStage } from "./swordData.js";

const els = {
  connectionStatus: document.getElementById("connectionStatus"),
  syncStatus: document.getElementById("syncStatus"),
  rarityPill: document.getElementById("rarityPill"),
  swordName: document.getElementById("swordName"),
  swordDescription: document.getElementById("swordDescription"),
  swordFrame: document.getElementById("swordFrame"),
  swordArt: document.getElementById("swordArt"),
  messageBox: document.getElementById("messageBox"),
  progressText: document.getElementById("progressText"),
  nextText: document.getElementById("nextText"),
  progressFill: document.getElementById("progressFill"),
  standList: document.getElementById("standList"),
  rewardList: document.getElementById("rewardList"),
  claimPanel: document.getElementById("claimPanel"),
  claimTitle: document.getElementById("claimTitle"),
  claimText: document.getElementById("claimText"),
  prizeDrawForm: document.getElementById("prizeDrawForm"),
  drawName: document.getElementById("drawName"),
  drawEmail: document.getElementById("drawEmail"),
  drawPhone: document.getElementById("drawPhone"),
  drawConsent: document.getElementById("drawConsent"),
  qrLinks: document.getElementById("qrLinks"),
  syncNowBtn: document.getElementById("syncNowBtn"),
  resetBtn: document.getElementById("resetBtn")
};

export function getElements() {
  return els;
}

export function renderApp(state) {
  renderSword(state);
  renderProgress(state);
  renderStands(state);
  renderRewards(state);
  renderClaimPanel(state);
  renderQrLinks();
}

export function renderConnectionStatus() {
  const online = navigator.onLine;
  els.connectionStatus.textContent = online ? "Online" : "Offline mode";
  els.connectionStatus.className = `status-chip ${online ? "good" : "warn"}`;
}

export function renderSyncStatus(state, syncing = false) {
  if (syncing) {
    els.syncStatus.textContent = "Syncing…";
    els.syncStatus.className = "status-chip warn";
    return;
  }

  if (state.pendingSync) {
    els.syncStatus.textContent = navigator.onLine ? "Pending sync" : "Saved locally — waiting for internet";
    els.syncStatus.className = "status-chip warn";
    return;
  }

  if (state.lastSyncedAt) {
    els.syncStatus.textContent = "Synced";
    els.syncStatus.className = "status-chip good";
    return;
  }

  els.syncStatus.textContent = "Saved on this device";
  els.syncStatus.className = "status-chip warn";
}

export function showMessage(type, text) {
  els.messageBox.className = `message-box ${type}`;
  els.messageBox.textContent = text;
}

export function hideMessage() {
  els.messageBox.className = "message-box hidden";
  els.messageBox.textContent = "";
}

export function animateSword(className = "reveal") {
  els.swordFrame.classList.remove("reveal", "claimed");
  window.requestAnimationFrame(() => {
    els.swordFrame.classList.add(className);
  });
  window.setTimeout(() => {
    els.swordFrame.classList.remove(className);
  }, 2500);
}

function renderSword(state) {
  const stage = getStage(state.level);
  document.documentElement.style.setProperty("--rarity-color", stage.colour);

  els.rarityPill.textContent = stage.rarity;
  els.swordName.textContent = stage.name;

  if (state.claimed) {
    const reward = APP_CONFIG.rewards.find(item => item.id === state.claimTier);
    els.swordDescription.textContent = reward?.successText || "This sword has been exchanged. Quest complete.";
  } else if (state.pendingGodlikeClaim) {
    els.swordDescription.textContent = "Godlike claim started. Complete the prize draw consent form to finish your exchange.";
  } else {
    els.swordDescription.textContent = stage.description;
  }

  els.swordArt.innerHTML = createSwordSvg(stage);
}

function renderProgress(state) {
  const nextStage = getNextStage(state.level);
  const percent = Math.round((state.level / APP_CONFIG.maxLevel) * 100);

  els.progressText.textContent = `Progress: ${state.level} / ${APP_CONFIG.maxLevel}`;
  els.progressFill.style.width = `${percent}%`;

  if (state.claimed) {
    els.nextText.textContent = "Quest complete";
  } else if (nextStage) {
    els.nextText.textContent = `Next: ${nextStage.name}`;
  } else {
    els.nextText.textContent = "Final form reached";
  }
}

function renderStands(state) {
  els.standList.innerHTML = "";

  APP_CONFIG.stands.forEach(stand => {
    const scanned = state.scannedStandIds.includes(stand.id);
    const row = document.createElement("div");
    row.className = "stand-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(stand.name)}</strong>
        <span>${escapeHtml(stand.label)}</span>
      </div>
      <div class="badge ${scanned ? "done" : ""}">${scanned ? "Scanned" : "Open"}</div>
    `;
    els.standList.appendChild(row);
  });
}

function renderRewards(state) {
  els.rewardList.innerHTML = "";

  APP_CONFIG.rewards.forEach(reward => {
    const status = getRewardStatus(state, reward);
    const requiredStage = getStage(reward.requiredLevel);
    const row = document.createElement("div");
    row.className = "reward-row";

    const statusText = {
      locked: "Locked",
      unlocked: "Ready",
      claimed: "Claimed",
      unavailable: "Closed"
    }[status];

    const badgeClass = {
      locked: "locked",
      unlocked: "done",
      claimed: "claimed",
      unavailable: "locked"
    }[status];

    const hint = status === "unlocked"
      ? "Ask staff for the claim QR code."
      : status === "claimed"
        ? "This reward has been claimed on this device."
        : reward.lockedText;

    row.innerHTML = `
      <div>
        <strong>${escapeHtml(reward.title)}</strong>
        <span>Requires ${escapeHtml(requiredStage.rarity)} — ${escapeHtml(hint)}</span>
      </div>
      <div class="badge ${badgeClass}">${statusText}</div>
    `;
    els.rewardList.appendChild(row);
  });
}

function renderClaimPanel(state) {
  if (state.pendingGodlikeClaim && !state.claimed) {
    els.claimPanel.classList.remove("hidden");
    els.claimTitle.textContent = "Godlike Prize Draw Entry";
    els.claimText.textContent = "Complete this form to exchange your Godlike sword, receive your immediate gift, and enter the prize draw.";
    els.prizeDrawForm.classList.remove("hidden");
    return;
  }

  els.prizeDrawForm.classList.add("hidden");

  if (state.claimed) {
    const reward = APP_CONFIG.rewards.find(item => item.id === state.claimTier);
    els.claimPanel.classList.remove("hidden");
    els.claimTitle.textContent = reward?.tierName || "Reward Claimed";
    els.claimText.textContent = reward?.successText || "Reward claimed. Quest complete.";
    return;
  }

  els.claimPanel.classList.add("hidden");
}

function renderQrLinks() {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const normalLinks = APP_CONFIG.stands.map(stand => ({
    title: stand.name,
    url: `${baseUrl}?scan=${encodeURIComponent(stand.id)}`
  }));

  const claimLinks = APP_CONFIG.rewards.map(reward => ({
    title: `${reward.tierName} Claim QR`,
    url: `${baseUrl}?claim=${encodeURIComponent(reward.id)}&claimCode=${encodeURIComponent(APP_CONFIG.claimCodes[reward.id])}`
  }));

  els.qrLinks.innerHTML = "";

  [...normalLinks, ...claimLinks].forEach(link => {
    const card = document.createElement("div");
    card.className = "qr-link-card";
    card.innerHTML = `
      <strong>${escapeHtml(link.title)}</strong>
      <code>${escapeHtml(link.url)}</code>
    `;
    els.qrLinks.appendChild(card);
  });
}

function createSwordSvg(stage) {
  if (stage.level === 0) {
    return `
      <svg viewBox="0 0 200 200" role="img" aria-label="No sword yet">
        <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="8" stroke-dasharray="12 12" />
        <path d="M70 130 L130 70" stroke="rgba(255,255,255,0.24)" stroke-width="12" stroke-linecap="round" />
      </svg>
    `;
  }

  const crossguardWidth = 56 + (stage.level * 5);
  const bladeWidth = 22 + Math.min(stage.level * 2, 10);
  const glowSize = 3 + stage.level;

  return `
    <svg viewBox="0 0 200 200" role="img" aria-label="${escapeHtml(stage.name)}">
      <defs>
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="35%" stop-color="${stage.blade}" />
          <stop offset="100%" stop-color="#6f6f78" />
        </linearGradient>
        <radialGradient id="gemGrad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="42%" stop-color="${stage.gem}" />
          <stop offset="100%" stop-color="#2a172f" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="${glowSize}" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
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
          stroke="rgba(255,255,255,0.48)"
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

        <circle
          cx="100"
          cy="125.5"
          r="${7 + stage.level}"
          fill="url(#gemGrad)"
          stroke="rgba(255,255,255,0.42)"
          stroke-width="2"
        />

        <rect
          x="91"
          y="130"
          width="18"
          height="${38 + stage.level * 2}"
          rx="8"
          fill="${stage.hilt}"
          stroke="rgba(255,255,255,0.24)"
          stroke-width="2"
        />

        <circle
          cx="100"
          cy="${173 + stage.level * 2}"
          r="${10 + Math.min(stage.level, 4)}"
          fill="${stage.hilt}"
          stroke="rgba(255,255,255,0.3)"
          stroke-width="2"
        />

        ${stage.level >= 3 ? `
          <path d="M72 104 C52 86 52 67 64 52" fill="none" stroke="${stage.colour}" stroke-width="4" stroke-linecap="round" opacity="0.65" />
          <path d="M128 104 C148 86 148 67 136 52" fill="none" stroke="${stage.colour}" stroke-width="4" stroke-linecap="round" opacity="0.65" />
        ` : ""}

        ${stage.level >= 5 ? `
          <path d="M100 4 L106 22 L125 17 L114 34 L130 46 L109 47 L100 65 L91 47 L70 46 L86 34 L75 17 L94 22Z" fill="${stage.colour}" opacity="0.72" />
        ` : ""}
      </g>
    </svg>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
