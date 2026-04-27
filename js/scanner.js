import { APP_CONFIG } from "./config.js";

let stream = null;
let detector = null;
let scanning = false;
let scanFrame = null;

export function parseRuneValue(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return { type: "unknown", rawValue: value };

  try {
    const url = new URL(value, window.location.href);
    const scanId = url.searchParams.get("scan");
    const claimId = url.searchParams.get("claim");
    const claimCode = url.searchParams.get("claimCode");

    if (scanId) return { type: "scan", id: scanId, rawValue: value };
    if (claimId) return { type: "claim", id: claimId, claimCode, rawValue: value };
  } catch {
    // Not a URL. Continue checking raw codes below.
  }

  if (value.startsWith("RBF-SCAN:")) {
    return { type: "scan", id: value.replace("RBF-SCAN:", "").trim(), rawValue: value };
  }

  if (value.startsWith("RBF-CLAIM:")) {
    const [, id, claimCode] = value.split(":");
    return { type: "claim", id, claimCode, rawValue: value };
  }

  if (APP_CONFIG.runeLocations.some(location => location.id === value)) {
    return { type: "scan", id: value, rawValue: value };
  }

  if (value === APP_CONFIG.claimCodes.legendary) {
    return { type: "claim", id: "legendary", claimCode: value, rawValue: value };
  }

  if (value === APP_CONFIG.claimCodes.godlike) {
    return { type: "claim", id: "godlike", claimCode: value, rawValue: value };
  }

  return { type: "unknown", rawValue: value };
}

export async function startRuneScanner({ videoEl, onStatus, onScan, onError }) {
  if (!navigator.mediaDevices?.getUserMedia) {
    onError?.("This device does not allow camera access in this browser.");
    return false;
  }

  if (!("BarcodeDetector" in window)) {
    onError?.("This browser does not support the built-in rune scanner. Use the manual fallback or scan the QR with the phone camera.");
    return false;
  }

  try {
    stopRuneScanner(videoEl);

    detector = new BarcodeDetector({ formats: ["qr_code"] });
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    videoEl.srcObject = stream;
    await videoEl.play();

    scanning = true;
    onStatus?.("Aether Lens active. Hold a rune inside the frame.");
    scanLoop(videoEl, onStatus, onScan, onError);
    return true;
  } catch (error) {
    stopRuneScanner(videoEl);
    onError?.(friendlyCameraError(error));
    return false;
  }
}

export function stopRuneScanner(videoEl) {
  scanning = false;

  if (scanFrame) {
    cancelAnimationFrame(scanFrame);
    scanFrame = null;
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  if (videoEl) {
    videoEl.pause?.();
    videoEl.srcObject = null;
  }
}

async function scanLoop(videoEl, onStatus, onScan, onError) {
  if (!scanning || !detector) return;

  try {
    if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const results = await detector.detect(videoEl);
      if (results.length > 0) {
        const rawValue = results[0].rawValue;
        onStatus?.("Rune recognised. Absorbing power…");
        onScan?.(parseRuneValue(rawValue));
        return;
      }
    }
  } catch (error) {
    onError?.("The lens flickered. Try holding the rune steady in good light.");
    console.warn("Barcode scan failed:", error);
  }

  scanFrame = requestAnimationFrame(() => scanLoop(videoEl, onStatus, onScan, onError));
}

function friendlyCameraError(error) {
  const name = error?.name || "CameraError";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was denied. Allow camera access to use the rune absorption window.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already in use by another app. Close other camera apps and try again.";
  }

  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    return "Camera scanning needs HTTPS. Upload the app to GitHub Pages or another HTTPS host.";
  }

  return "The camera could not start. Try refreshing the page or using the manual fallback.";
}
