const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const successModal = document.getElementById('successModal');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const returnToMenuBtn = document.getElementById('returnToMenuBtn');
const busImage = document.getElementById('busImage');
const mudCanvas = document.getElementById('mudCanvas');
const progressText = document.getElementById('progressText');

const mudCtx = mudCanvas.getContext('2d');
const maskCanvas = document.createElement('canvas');
const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });

const BUS_POINTS = [
  [0.022, 0.835], [0.017, 0.470], [0.032, 0.255], [0.088, 0.045],
  [0.760, 0.010], [0.935, 0.178], [0.827, 0.235], [0.830, 0.560],
  [0.885, 0.612], [0.810, 0.668], [0.765, 0.668], [0.695, 0.760],
  [0.645, 0.845], [0.545, 0.868], [0.515, 0.775], [0.412, 0.782],
  [0.378, 0.888], [0.212, 0.905], [0.160, 0.790], [0.050, 0.885]
];

let drawing = false;
let complete = false;
let totalMaskPixels = 0;
let lastPoint = null;
let lastProgressCheck = 0;

startBtn.addEventListener('click', async () => {
  showGame();
  if (busImage.complete) {
    initGame();
  } else {
    await new Promise(resolve => busImage.addEventListener('load', resolve, { once: true }));
    initGame();
  }
});
backBtn.addEventListener('click', resetToMenu);
returnToMenuBtn.addEventListener('click', resetToMenu);
window.addEventListener('resize', () => {
  if (gameScreen.classList.contains('screen--active')) {
    sizeCanvasToImage();
    renderMudLayer();
    rebuildMask();
    updateProgress(0);
  }
});

mudCanvas.addEventListener('pointerdown', event => {
  if (complete) return;
  drawing = true;
  mudCanvas.classList.add('is-scrubbing');
  mudCanvas.setPointerCapture(event.pointerId);
  lastPoint = getCanvasPoint(event);
  stampErase(lastPoint.x, lastPoint.y);
  queueProgressCheck();
});

mudCanvas.addEventListener('pointermove', event => {
  if (!drawing || complete) return;
  const point = getCanvasPoint(event);
  eraseStroke(lastPoint, point);
  lastPoint = point;
  queueProgressCheck();
});

const stopDrawing = event => {
  if (!drawing) return;
  drawing = false;
  mudCanvas.classList.remove('is-scrubbing');
  lastPoint = null;
  try { mudCanvas.releasePointerCapture(event.pointerId); } catch (_) {}
  queueProgressCheck(true);
};

mudCanvas.addEventListener('pointerup', stopDrawing);
mudCanvas.addEventListener('pointercancel', stopDrawing);
mudCanvas.addEventListener('pointerleave', event => {
  if (drawing) stopDrawing(event);
});

function showGame() {
  menuScreen.classList.remove('screen--active');
  gameScreen.classList.add('screen--active');
  menuScreen.setAttribute('aria-hidden', 'true');
  gameScreen.setAttribute('aria-hidden', 'false');
}

function resetToMenu() {
  successModal.classList.remove('modal--active');
  gameScreen.classList.remove('screen--active');
  menuScreen.classList.add('screen--active');
  menuScreen.setAttribute('aria-hidden', 'false');
  gameScreen.setAttribute('aria-hidden', 'true');
  complete = false;
  drawing = false;
  lastPoint = null;
}

function initGame() {
  complete = false;
  drawing = false;
  sizeCanvasToImage();
  renderMudLayer();
  rebuildMask();
  updateProgress(0);
}

function sizeCanvasToImage() {
  const width = busImage.naturalWidth;
  const height = busImage.naturalHeight;
  mudCanvas.width = width;
  mudCanvas.height = height;
  maskCanvas.width = width;
  maskCanvas.height = height;
}

function renderMudLayer() {
  mudCtx.clearRect(0, 0, mudCanvas.width, mudCanvas.height);
  mudCtx.save();
  clipBusShape(mudCtx, mudCanvas.width, mudCanvas.height);
  mudCtx.clip();

  mudCtx.fillStyle = 'rgba(54, 31, 15, 0.28)';
  mudCtx.fillRect(0, 0, mudCanvas.width, mudCanvas.height);

  for (let i = 0; i < 125; i++) {
    const x = Math.random() * mudCanvas.width;
    const y = Math.random() * mudCanvas.height;
    const radius = 8 + Math.random() * 28;
    const gradient = mudCtx.createRadialGradient(x, y, radius * 0.18, x, y, radius);
    const alphaCore = 0.25 + Math.random() * 0.38;
    gradient.addColorStop(0, `rgba(64, 34, 11, ${alphaCore})`);
    gradient.addColorStop(0.55, `rgba(89, 55, 24, ${alphaCore * 0.82})`);
    gradient.addColorStop(1, 'rgba(114, 79, 43, 0)');
    mudCtx.fillStyle = gradient;
    mudCtx.beginPath();
    mudCtx.arc(x, y, radius, 0, Math.PI * 2);
    mudCtx.fill();
  }

  mudCtx.lineCap = 'round';
  for (let i = 0; i < 28; i++) {
    const x1 = Math.random() * mudCanvas.width;
    const y1 = Math.random() * mudCanvas.height;
    const x2 = x1 + (Math.random() - 0.5) * 70;
    const y2 = y1 + 18 + Math.random() * 42;
    mudCtx.strokeStyle = `rgba(70, 43, 18, ${0.12 + Math.random() * 0.14})`;
    mudCtx.lineWidth = 4 + Math.random() * 10;
    mudCtx.beginPath();
    mudCtx.moveTo(x1, y1);
    mudCtx.lineTo(x2, y2);
    mudCtx.stroke();
  }

  mudCtx.restore();
}

function rebuildMask() {
  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  maskCtx.save();
  fillBusShape(maskCtx, maskCanvas.width, maskCanvas.height);
  maskCtx.restore();
  totalMaskPixels = countFilledPixels(maskCtx, maskCanvas.width, maskCanvas.height);
}

function fillBusShape(ctx, width, height) {
  ctx.beginPath();
  BUS_POINTS.forEach(([nx, ny], index) => {
    const x = nx * width;
    const y = ny * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function clipBusShape(ctx, width, height) {
  ctx.beginPath();
  BUS_POINTS.forEach(([nx, ny], index) => {
    const x = nx * width;
    const y = ny * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function getCanvasPoint(event) {
  const rect = mudCanvas.getBoundingClientRect();
  const scaleX = mudCanvas.width / rect.width;
  const scaleY = mudCanvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function eraseStroke(from, to) {
  if (!from) {
    stampErase(to.x, to.y);
    return;
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const step = 5;
  const steps = Math.max(1, Math.ceil(distance / step));
  for (let i = 0; i <= steps; i++) {
    const x = from.x + (dx * i) / steps;
    const y = from.y + (dy * i) / steps;
    stampErase(x, y);
  }
}

function stampErase(x, y) {
  eraseOnContext(mudCtx, x, y);
  eraseOnContext(maskCtx, x, y);
}

function eraseOnContext(ctx, x, y) {
  const radius = 16;
  const brush = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
  brush.addColorStop(0, 'rgba(0, 0, 0, 1)');
  brush.addColorStop(0.72, 'rgba(0, 0, 0, 0.94)');
  brush.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = brush;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function countFilledPixels(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height).data;
  let filled = 0;
  for (let i = 3; i < imageData.length; i += 4) {
    if (imageData[i] > 20) filled++;
  }
  return filled;
}

function queueProgressCheck(force = false) {
  const now = performance.now();
  if (!force && now - lastProgressCheck < 80) return;
  lastProgressCheck = now;
  const remaining = countFilledPixels(maskCtx, maskCanvas.width, maskCanvas.height);
  const cleanedRatio = 1 - remaining / totalMaskPixels;
  const percentage = Math.max(0, Math.min(100, Math.round(cleanedRatio * 100)));
  updateProgress(percentage);
  if (cleanedRatio >= 0.95 && !complete) {
    finishGame();
  }
}

function updateProgress(value) {
  progressText.textContent = `Cleaned ${value}%`;
}

function finishGame() {
  complete = true;
  drawing = false;
  mudCanvas.classList.remove('is-scrubbing');
  updateProgress(100);
  playSuccessTone();
  successModal.classList.add('modal--active');
}

function playSuccessTone() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(660, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.45);
}
