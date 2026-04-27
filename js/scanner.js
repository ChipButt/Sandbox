import { APP_CONFIG } from "./config.js";

let stream = null;
let detector = null;
let scanning = false;
let scanFrame = null;
let html5QrCode = null;
let html5ScriptPromise = null;

const HTML5_QR_CDN = "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js";

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

export async function startRuneScanner({ videoEl, readerEl, onStatus, onScan, onError }) {
  stopRuneScanner({ videoEl, readerEl });

  if (!navigator.mediaDevices?.getUserMedia) {
    onError?.("This browser is not exposing camera access to the app. Open the site over HTTPS and allow camera permission.");
    return false;
  }

  // Preferred: browser-native QR decoding where available.
  if ("BarcodeDetector" in window) {
    const started = await startNativeBarcodeScanner({ videoEl, readerEl, onStatus, onScan, onError });
    if (started) return true;
  }

  // Fallback: use html5-qrcode. This covers browsers that can use the camera
  // but do not support BarcodeDetector, which is common on iOS/Safari/PWA.
  const htmlStarted = await startHtml5QrScanner({ videoEl, readerEl, onStatus, onScan, onError });
  if (htmlStarted) return true;

  // Last resort: open camera preview so the lens still feels real, then let the
  // user/staff use the manual fallback code if the decoder cannot load.
  const previewStarted = await startCameraPreview({ videoEl, readerEl, onStatus, onError });
  return previewStarted;
}

async function startNativeBarcodeScanner({ videoEl, readerEl, onStatus, onScan, onError }) {
  try {
    if (readerEl) readerEl.classList.add("hidden");
    videoEl.classList.remove("hidden");

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
    stopNativeVideo(videoEl);
    console.warn("Native scanner failed:", error);
    return false;
  }
}

async function startHtml5QrScanner({ videoEl, readerEl, onStatus, onScan, onError }) {
  if (!readerEl) return false;

  try {
    onStatus?.("Warming the Aether Lens decoder…");
    await loadHtml5QrLibrary();

    if (!window.Html5Qrcode) return false;

    videoEl.classList.add("hidden");
    readerEl.classList.remove("hidden");
    readerEl.innerHTML = "";

    html5QrCode = new window.Html5Qrcode(readerEl.id, { verbose: false });

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 12,
        qrbox: viewport => {
          const size = Math.floor(Math.min(viewport.width, viewport.height) * 0.72);
          return { width: Math.max(180, size), height: Math.max(180, size) };
        },
        aspectRatio: 1.0,
        disableFlip: true
      },
      decodedText => {
        onStatus?.("Rune recognised. Absorbing power…");
        const parsed = parseRuneValue(decodedText);
        stopRuneScanner({ videoEl, readerEl });
        onScan?.(parsed);
      },
      () => {
        // Deliberately quiet: this fires constantly while scanning.
      }
    );

    scanning = true;
    onStatus?.("Aether Lens active. Hold a rune inside the frame.");
    return true;
  } catch (error) {
    console.warn("html5-qrcode scanner failed:", error);
    try {
      if (html5QrCode?.isScanning) await html5QrCode.stop();
      await html5QrCode?.clear?.();
    } catch {}
    html5QrCode = null;
    readerEl.classList.add("hidden");
    onError?.(friendlyCameraError(error));
    return false;
  }
}

function loadHtml5QrLibrary() {
  if (window.Html5Qrcode) return Promise.resolve();

  if (!html5ScriptPromise) {
    html5ScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${HTML5_QR_CDN}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = HTML5_QR_CDN;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("qr-library-unavailable"));
      document.head.appendChild(script);
    });
  }

  return html5ScriptPromise;
}

async function startCameraPreview({ videoEl, readerEl, onStatus, onError }) {
  try {
    if (readerEl) readerEl.classList.add("hidden");
    videoEl.classList.remove("hidden");

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    videoEl.srcObject = stream;
    await videoEl.play();
    onStatus?.("Camera opened, but this browser could not load the QR decoder. Use the fallback rune code for testing.");
    onError?.("Camera opened, but automatic QR decoding is unavailable on this browser right now.");
    return true;
  } catch (error) {
    stopNativeVideo(videoEl);
    onError?.(friendlyCameraError(error));
    return false;
  }
}

export function stopRuneScanner({ videoEl, readerEl } = {}) {
  scanning = false;

  if (scanFrame) {
    cancelAnimationFrame(scanFrame);
    scanFrame = null;
  }

  if (html5QrCode) {
    const scannerToStop = html5QrCode;
    html5QrCode = null;
    Promise.resolve()
      .then(async () => {
        if (scannerToStop.isScanning) await scannerToStop.stop();
        await scannerToStop.clear?.();
      })
      .catch(error => console.warn("QR scanner cleanup failed:", error));
  }

  if (readerEl) {
    readerEl.innerHTML = "";
    readerEl.classList.add("hidden");
  }

  stopNativeVideo(videoEl);
}

function stopNativeVideo(videoEl) {
  detector = null;

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  if (videoEl) {
    videoEl.pause?.();
    videoEl.srcObject = null;
    videoEl.classList.remove("hidden");
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
        const parsed = parseRuneValue(rawValue);
        stopRuneScanner({ videoEl, readerEl: null });
        onScan?.(parsed);
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
  const message = String(error?.message || "").toLowerCase();

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was denied. Allow camera access to use the rune absorption window.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already in use by another app. Close other camera apps and try again.";
  }

  if (message.includes("qr-library-unavailable")) {
    return "The camera may work, but the QR decoder could not load yet. Connect once online, refresh, and try again.";
  }

  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    return "Camera scanning needs HTTPS. Upload the app to GitHub Pages or another HTTPS host.";
  }

  return "The camera could not start. Try refreshing the page, or use the fallback test controls in developer mode.";
}
