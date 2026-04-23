import { CAMERA_PERMISSION_HINT_KEY, dom } from "./core.js";
import { showStatus } from "./ui.js";

let qrScanner = null;
let qrScannerRunning = false;
let qrScanHandled = false;
let qrLibraryPromise = null;

function scannerSupported() {
  return window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
}

function normalizeScannedUrl(decodedText) {
  try {
    const resolved = new URL(decodedText, window.location.href);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.href;
  } catch {
    return null;
  }
}

async function ensureQrLibrary() {
  if (typeof window.Html5Qrcode === "function") return;
  if (!qrLibraryPromise) {
    qrLibraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load scanner library."));
      document.head.appendChild(script);
    });
  }
  await qrLibraryPromise;
}

async function warmCameraPermission() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
  stream.getTracks().forEach((track) => track.stop());
  try {
    localStorage.setItem(CAMERA_PERMISSION_HINT_KEY, "granted");
  } catch {}
}

export async function stopScanner() {
  if (qrScanner) {
    try {
      if (qrScannerRunning) await qrScanner.stop();
    } catch {}
    try {
      await qrScanner.clear();
    } catch {}
  }

  qrScanner = null;
  qrScannerRunning = false;
  qrScanHandled = false;
}

export async function closeScannerOverlay() {
  dom.scannerOverlay.classList.remove("show");
  dom.scannerOverlay.setAttribute("aria-hidden", "true");
  dom.scannerHelp.textContent =
    "Bought something and ready for the next fix? Ask a member of staff to show you the repair QR code, then point your camera at it.";
  await stopScanner();
}

async function handleScanSuccess(decodedText) {
  if (qrScanHandled) return;
  qrScanHandled = true;

  const targetUrl = normalizeScannedUrl(decodedText);
  if (!targetUrl) {
    qrScanHandled = false;
    dom.scannerHelp.textContent = "That QR code did not contain a valid web link.";
    return;
  }

  dom.scannerHelp.textContent = "QR code captured. Opening…";
  await closeScannerOverlay();
  window.location.href = targetUrl;
}

export async function startScanner() {
  if (!scannerSupported()) {
    showStatus("Camera scanning needs HTTPS and a supported browser camera API.", "error", 4500);
    return;
  }

  dom.scannerOverlay.classList.add("show");
  dom.scannerOverlay.setAttribute("aria-hidden", "false");
  dom.scannerHelp.textContent = "Opening camera…";

  try {
    await ensureQrLibrary();
    await warmCameraPermission();
    await stopScanner();
  } catch (error) {
    await closeScannerOverlay();
    try { localStorage.removeItem(CAMERA_PERMISSION_HINT_KEY); } catch {}
    showStatus(error?.message || "Camera access is blocked for this browser or site. Please allow camera access in your browser settings.", "error", 4500);
    return;
  }

  qrScanner = new window.Html5Qrcode("qr-reader");
  const config = {
    fps: 10,
    qrbox: { width: 240, height: 240 },
    aspectRatio: 1,
    rememberLastUsedCamera: true,
    supportedScanTypes: [window.Html5QrcodeScanType?.SCAN_TYPE_CAMERA].filter(Boolean)
  };

  const readerEl = document.getElementById("qr-reader");
  if (readerEl) {
    readerEl.innerHTML = "";
    readerEl.style.minHeight = "300px";
  }

  const scannerReadyText =
    "Ask a member of staff to show you the repair QR code, then point your camera at it.";

  try {
    const cameras = await window.Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) throw new Error("No camera found.");

    const backCamera =
      cameras.find((camera) => /back|rear|environment/i.test(camera.label)) ||
      cameras[cameras.length - 1];

    await qrScanner.start(backCamera.id, config, handleScanSuccess, () => {});
    qrScannerRunning = true;
    dom.scannerHelp.textContent = scannerReadyText;
  } catch (error) {
    await closeScannerOverlay();
    try { localStorage.removeItem(CAMERA_PERMISSION_HINT_KEY); } catch {}
    showStatus(error?.message || "Could not start the camera scanner.", "error", 4500);
  }
}
