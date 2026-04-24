import { auth, dom, state, HORN_REPAIR_TOKEN } from "./core.js";
import { showStatus } from "./ui.js";

const HORN_WINDOW_MS = 10000;
const HORN_THRESHOLD_MS = 10000;
const HORN_PRESS_THRESHOLD = 5;
const CAR_HORN_MS = 1200;
const BIKE_HORN_MS = 850;

let audioContext = null;
let isPlaying = false;
let breakAfterCurrentPlay = false;
let alertTimer = null;

function getHornStorageKey(uid) {
  return `rrHornState:${uid}`;
}

function getDefaultHornState() {
  return { broken: false, bursts: [], presses: [] };
}

function readHornState(uid) {
  if (!uid) return getDefaultHornState();
  try {
    const raw = localStorage.getItem(getHornStorageKey(uid));
    if (!raw) return getDefaultHornState();
    const parsed = JSON.parse(raw);
    return {
      broken: !!parsed.broken,
      bursts: Array.isArray(parsed.bursts) ? parsed.bursts.filter((v) => Number.isFinite(v.t) && Number.isFinite(v.d)) : [],
      presses: Array.isArray(parsed.presses) ? parsed.presses.filter((v) => Number.isFinite(v)) : []
    };
  } catch {
    return getDefaultHornState();
  }
}

function writeHornState(uid, hornState) {
  if (!uid) return;
  try {
    localStorage.setItem(getHornStorageKey(uid), JSON.stringify(hornState));
  } catch {}
}

function getCurrentHornState() {
  return readHornState(auth.currentUser?.uid || "");
}

function setCurrentHornState(nextState) {
  const uid = auth.currentUser?.uid || "";
  writeHornState(uid, nextState);
  renderHornState();
}

function showHornBrokenAlert() {
  if (!dom.hornAlertOverlay) return;
  if (dom.hornAlertSubcopy) {
    dom.hornAlertSubcopy.textContent = "Keep leaning on it and these things do tend to give up. Maybe someone handy will sort it out at some point.";
  }
  dom.hornAlertOverlay.classList.remove("hidden");
  dom.hornAlertOverlay.setAttribute("aria-hidden", "false");
  if (alertTimer) clearTimeout(alertTimer);
  alertTimer = window.setTimeout(() => {
    dom.hornAlertOverlay.classList.add("hidden");
    dom.hornAlertOverlay.setAttribute("aria-hidden", "true");
  }, 2200);
}

function renderHornState() {
  if (!dom.hornBtn) return;
  const hornState = getCurrentHornState();
  dom.hornBtn.classList.toggle("is-broken", hornState.broken);
  dom.hornBtn.disabled = hornState.broken;
  dom.hornBtn.setAttribute("aria-disabled", hornState.broken ? "true" : "false");
  dom.hornBtn.title = hornState.broken ? "Horn broken" : "Sound horn";
}

function getHornMode() {
  return state.currentTrailReasonKey === "motorbikes" ? "bike" : "car";
}

async function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  return audioContext;
}

function scheduleTone(ctx, frequency, start, duration, gainValue, type = "sawtooth") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue * 0.6), start + duration * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

async function playHorn(mode) {
  const ctx = await getAudioContext();
  const start = ctx.currentTime + 0.02;

  if (mode === "bike") {
    scheduleTone(ctx, 220, start, 0.38, 0.18, "square");
    scheduleTone(ctx, 247, start + 0.08, 0.34, 0.12, "square");
    scheduleTone(ctx, 220, start + 0.42, 0.24, 0.16, "square");
    return BIKE_HORN_MS;
  }

  scheduleTone(ctx, 392, start, 0.55, 0.16, "sawtooth");
  scheduleTone(ctx, 330, start, 0.55, 0.12, "triangle");
  scheduleTone(ctx, 392, start + 0.58, 0.48, 0.16, "sawtooth");
  scheduleTone(ctx, 330, start + 0.58, 0.48, 0.12, "triangle");
  return CAR_HORN_MS;
}

function registerHornBurst(durationMs) {
  const hornState = getCurrentHornState();
  const now = Date.now();
  const bursts = [...hornState.bursts, { t: now, d: durationMs }].filter((entry) => now - entry.t <= HORN_WINDOW_MS);
  const presses = [...(hornState.presses || []), now].filter((entry) => now - entry <= HORN_WINDOW_MS);
  const totalDuration = bursts.reduce((sum, entry) => sum + entry.d, 0);
  setCurrentHornState({ ...hornState, bursts, presses });
  return { totalDuration, pressCount: presses.length };
}

export async function onHornPress() {
  if (!auth.currentUser || !dom.hornBtn) return;
  const hornState = getCurrentHornState();
  if (hornState.broken) {
    showStatus("Alert: Horn broken. Keep leaning on it and these things do tend to give up.", "error", 2600);
    showHornBrokenAlert();
    return;
  }
  if (isPlaying) return;

  try {
    isPlaying = true;
    const mode = getHornMode();
    const durationMs = await playHorn(mode);
    const hornUsage = registerHornBurst(durationMs);
    breakAfterCurrentPlay =
      hornUsage.totalDuration >= HORN_THRESHOLD_MS ||
      hornUsage.pressCount >= HORN_PRESS_THRESHOLD;
    window.setTimeout(() => {
      isPlaying = false;
      if (breakAfterCurrentPlay) {
        breakAfterCurrentPlay = false;
        const brokenState = getCurrentHornState();
        brokenState.broken = true;
        brokenState.bursts = [];
        brokenState.presses = [];
        setCurrentHornState(brokenState);
        showStatus("Alert: Horn broken. Keep leaning on it and these things do tend to give up.", "error", 2600);
        showHornBrokenAlert();
      }
    }, durationMs);
  } catch {
    isPlaying = false;
    showStatus("Could not sound the horn.", "error", 2200);
  }
}

export function maybeHandleHornRepairClaim() {
  const params = new URLSearchParams(window.location.search);
  const isRepair = params.get("horn") === "repair";
  const token = params.get("token");
  if (!isRepair || token !== HORN_REPAIR_TOKEN || !auth.currentUser) return false;

  setCurrentHornState(getDefaultHornState());
  showStatus("Horn repaired.", "success", 2200);
  try {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("horn");
    nextUrl.searchParams.delete("token");
    window.history.replaceState({}, "", nextUrl.pathname + nextUrl.search);
  } catch {}
  return true;
}

export function initHornUi() {
  if (!dom.hornBtn) return;
  renderHornState();
  dom.hornBtn.addEventListener("click", onHornPress);
}

export function refreshHornUi() {
  renderHornState();
}

export function getHornRepairUrl() {
  return `${window.location.origin}${window.location.pathname}?horn=repair&token=${HORN_REPAIR_TOKEN}`;
}
