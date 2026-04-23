const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const successModal = document.getElementById('successModal');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const returnToMenuBtn = document.getElementById('returnToMenuBtn');
const remainingCount = document.getElementById('remainingCount');
const gardenStage = document.getElementById('gardenStage');
const weedLayer = document.getElementById('weedLayer');

const WEED_CONFIGS = [
  { x: 0.12, y: 0.74, size: 0.042 },
  { x: 0.20, y: 0.71, size: 0.037 },
  { x: 0.31, y: 0.79, size: 0.04 },
  { x: 0.40, y: 0.73, size: 0.035 },
  { x: 0.50, y: 0.77, size: 0.039 },
  { x: 0.59, y: 0.71, size: 0.034 },
  { x: 0.67, y: 0.76, size: 0.038 },
  { x: 0.76, y: 0.72, size: 0.034 },
  { x: 0.84, y: 0.78, size: 0.041 },
  { x: 0.90, y: 0.70, size: 0.036 }
];

let weedsRemaining = 10;
let activeWeed = null;

startBtn.addEventListener('click', () => {
  showGame();
  buildWeeds();
});
backBtn.addEventListener('click', resetToMenu);
returnToMenuBtn.addEventListener('click', resetToMenu);
window.addEventListener('resize', () => {
  if (gameScreen.classList.contains('screen--active')) buildWeeds(true);
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
  weedLayer.innerHTML = '';
  weedsRemaining = 10;
  remainingCount.textContent = weedsRemaining;
  activeWeed = null;
}

function buildWeeds(keepState = false) {
  const removedIds = keepState ? new Set([...weedLayer.querySelectorAll('.weed[data-removed="true"]')].map(el => el.dataset.id)) : new Set();
  weedLayer.innerHTML = '';
  const stageWidth = gardenStage.clientWidth;

  WEED_CONFIGS.forEach((config, index) => {
    const weed = document.createElement('div');
    weed.className = 'weed';
    weed.dataset.id = String(index);
    weed.style.left = `${config.x * 100}%`;
    weed.style.top = `${config.y * 100}%`;
    weed.style.setProperty('--weed-size', `${Math.max(26, stageWidth * config.size)}px`);

    const img = document.createElement('img');
    img.src = 'assets/dandelion_clean.png';
    img.alt = '';
    img.draggable = false;
    weed.appendChild(img);

    if (removedIds.has(String(index))) {
      weed.dataset.removed = 'true';
      weed.style.opacity = '0';
      weed.style.pointerEvents = 'none';
    } else {
      wireUpWeed(weed);
    }

    weedLayer.appendChild(weed);
  });

  weedsRemaining = [...weedLayer.querySelectorAll('.weed')].filter(weed => weed.dataset.removed !== 'true').length;
  remainingCount.textContent = weedsRemaining;
}

function wireUpWeed(weed) {
  weed.addEventListener('pointerdown', event => {
    if (weed.dataset.removed === 'true') return;
    event.preventDefault();
    activeWeed = {
      weed,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastDX: 0,
      lastDY: 0,
      rotation: (Math.random() * 10) - 5
    };
    weed.classList.remove('returning');
    weed.classList.add('dragging');
    weed.setPointerCapture(event.pointerId);
  });

  weed.addEventListener('pointermove', event => {
    if (!activeWeed || activeWeed.weed !== weed || activeWeed.pointerId !== event.pointerId) return;
    const dx = event.clientX - activeWeed.startX;
    const dy = event.clientY - activeWeed.startY;
    activeWeed.lastDX = dx;
    activeWeed.lastDY = dy;
    const resistedX = dx * 0.48;
    const resistedY = dy * 0.55;
    const tilt = activeWeed.rotation + resistedX * 0.04;
    weed.style.transform = `translate(calc(-50% + ${resistedX}px), calc(-100% + ${resistedY}px)) rotate(${tilt}deg)`;
  });

  const release = event => {
    if (!activeWeed || activeWeed.weed !== weed) return;
    const { lastDX, lastDY } = activeWeed;
    const distance = Math.hypot(lastDX, lastDY);
    const pulledFarEnough = distance > 95 || lastDY < -70;
    weed.classList.remove('dragging');
    try { weed.releasePointerCapture(event.pointerId); } catch (_) {}

    if (pulledFarEnough) {
      weed.dataset.removed = 'true';
      weed.classList.add('pulled');
      weed.style.transform = `translate(calc(-50% + ${lastDX * 0.62}px), calc(-100% + ${lastDY * 0.62 - 120}px)) rotate(${activeWeed.rotation + 12}deg)`;
      playPluck();
      setTimeout(() => {
        weed.style.display = 'none';
      }, 260);
      weedsRemaining -= 1;
      remainingCount.textContent = weedsRemaining;
      if (weedsRemaining === 0) {
        setTimeout(() => {
          playRewardTone();
          successModal.classList.add('modal--active');
        }, 220);
      }
    } else {
      weed.classList.add('returning');
      weed.style.transform = 'translate(-50%, -100%)';
      setTimeout(() => weed.classList.remove('returning'), 360);
    }

    activeWeed = null;
  };

  weed.addEventListener('pointerup', release);
  weed.addEventListener('pointercancel', release);
}

function playPluck() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(250, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.18);
}

function playRewardTone() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(520, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.36);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.38);
}
