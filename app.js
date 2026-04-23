const screens = {
  home: document.getElementById('homeScreen'),
  watsons: document.getElementById('watsonsScreen'),
  piston: document.getElementById('pistonScreen'),
};

const rewardModal = document.getElementById('rewardModal');
const rewardTitle = document.getElementById('rewardTitle');
const rewardText = document.getElementById('rewardText');
const rewardClose = document.getElementById('rewardClose');

const state = {
  currentScreen: 'home',
  watsonsDone: false,
  pistonDone: false,
  rewardReturnTo: 'home',
};

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
  state.currentScreen = name;
}

function beep({ frequency = 880, duration = 0.14, type = 'sine', volume = 0.06 } = {}) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = beep.ctx || (beep.ctx = new AudioCtx());
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

function celebrationBeep() {
  beep({ frequency: 880, duration: 0.12, type: 'triangle', volume: 0.08 });
  setTimeout(() => beep({ frequency: 1174, duration: 0.18, type: 'triangle', volume: 0.08 }), 90);
}

function showReward(title, text, returnTo) {
  state.rewardReturnTo = returnTo;
  rewardTitle.textContent = title;
  rewardText.textContent = text;
  rewardModal.classList.remove('hidden');
  celebrationBeep();
}

rewardClose.addEventListener('click', () => {
  rewardModal.classList.add('hidden');
  showScreen(state.rewardReturnTo);
});

document.getElementById('openWatsons').addEventListener('click', () => {
  showScreen('watsons');
  initWatsons();
});

document.getElementById('openPiston').addEventListener('click', () => {
  showScreen('piston');
  initPiston();
});

document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => showScreen('home'));
});

// Mr Watson's bus wash game
const busStage = document.getElementById('busStage');
const busCanvas = document.getElementById('busDirtCanvas');
const busCtx = busCanvas.getContext('2d', { willReadFrequently: true });
let watsonsInitialised = false;
let watsonsCompleted = false;
let watsonsDragging = false;

function resizeBusCanvas() {
  const rect = busStage.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  busCanvas.width = Math.floor(rect.width * ratio);
  busCanvas.height = Math.floor(rect.height * ratio);
  busCanvas.style.width = rect.width + 'px';
  busCanvas.style.height = rect.height + 'px';
  busCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawBusDirt();
}

function drawBusDirt() {
  const w = busStage.clientWidth;
  const h = busStage.clientHeight;
  busCtx.clearRect(0, 0, w, h);
  busCtx.fillStyle = 'rgba(58, 37, 20, 0.42)';
  busCtx.fillRect(0, 0, w, h);

  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const radius = 14 + Math.random() * 40;
    const grad = busCtx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(64, 39, 23, 0.95)');
    grad.addColorStop(0.55, 'rgba(80, 49, 26, 0.72)');
    grad.addColorStop(1, 'rgba(80, 49, 26, 0)');
    busCtx.fillStyle = grad;
    busCtx.beginPath();
    busCtx.arc(x, y, radius, 0, Math.PI * 2);
    busCtx.fill();
  }

  busCtx.globalCompositeOperation = 'source-over';
  busCtx.strokeStyle = 'rgba(106, 63, 34, 0.6)';
  busCtx.lineWidth = 8;
  for (let i = 0; i < 20; i++) {
    const startX = Math.random() * w;
    const startY = Math.random() * h;
    busCtx.beginPath();
    busCtx.moveTo(startX, startY);
    busCtx.quadraticCurveTo(startX + (Math.random() * 120 - 60), startY + (Math.random() * 60 - 30), startX + (Math.random() * 180 - 90), startY + (Math.random() * 70 - 35));
    busCtx.stroke();
  }
}

function eraseBusAt(clientX, clientY) {
  const rect = busCanvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const radius = Math.max(22, rect.width * 0.045);

  busCtx.save();
  busCtx.globalCompositeOperation = 'destination-out';
  const grad = busCtx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(0.7, 'rgba(0,0,0,0.95)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  busCtx.fillStyle = grad;
  busCtx.beginPath();
  busCtx.arc(x, y, radius, 0, Math.PI * 2);
  busCtx.fill();
  busCtx.restore();
}

function busCleanedEnough() {
  const w = busCanvas.width;
  const h = busCanvas.height;
  const img = busCtx.getImageData(0, 0, w, h).data;
  let visibleAlpha = 0;
  const step = 28;
  for (let i = 3; i < img.length; i += step) {
    visibleAlpha += img[i];
  }
  const maxAlpha = 255 * Math.ceil((img.length / 4) / (step / 4));
  const coveredRatio = visibleAlpha / maxAlpha;
  return coveredRatio < 0.17;
}

function showScenePop(parent, message) {
  const existing = parent.querySelector('.success-pop');
  if (existing) existing.remove();
  const pop = document.createElement('div');
  pop.className = 'success-pop';
  pop.textContent = message;
  parent.appendChild(pop);
  requestAnimationFrame(() => pop.classList.add('show'));
  setTimeout(() => {
    pop.classList.remove('show');
    setTimeout(() => pop.remove(), 260);
  }, 1200);
}

function completeWatsons() {
  if (watsonsCompleted) return;
  watsonsCompleted = true;
  state.watsonsDone = true;
  busCanvas.style.pointerEvents = 'none';
  showScenePop(document.getElementById('watsonsScreen'), 'Bus cleaned');
  setTimeout(() => {
    showReward('BODYWORK', "Mr. Watson's Cafe handed over your bodywork part.", 'home');
  }, 900);
}

function initWatsons() {
  if (!watsonsInitialised) {
    resizeBusCanvas();
    watsonsInitialised = true;

    const startDrag = (clientX, clientY) => {
      if (watsonsCompleted) return;
      watsonsDragging = true;
      eraseBusAt(clientX, clientY);
      if (busCleanedEnough()) completeWatsons();
    };

    busCanvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
      beep({ frequency: 480, duration: 0.05, type: 'square', volume: 0.03 });
    });
    window.addEventListener('pointermove', (e) => {
      if (!watsonsDragging || watsonsCompleted) return;
      eraseBusAt(e.clientX, e.clientY);
      if (Math.random() < 0.15) beep({ frequency: 400 + Math.random() * 120, duration: 0.03, type: 'square', volume: 0.018 });
      if (busCleanedEnough()) completeWatsons();
    });
    window.addEventListener('pointerup', () => { watsonsDragging = false; });
    window.addEventListener('pointercancel', () => { watsonsDragging = false; });
    window.addEventListener('resize', resizeBusCanvas);
  }

  watsonsCompleted = state.watsonsDone;
  busCanvas.style.pointerEvents = watsonsCompleted ? 'none' : 'auto';
  drawBusDirt();
  if (watsonsCompleted) {
    busCtx.clearRect(0, 0, busStage.clientWidth, busStage.clientHeight);
  }
}

// Piston Club weed pulling game
const gardenStage = document.getElementById('gardenStage');
const weedLayer = document.getElementById('weedLayer');
let pistonInitialised = false;
let pistonDragging = false;
let weedsRemaining = 10;

function lawnBounds() {
  const rect = gardenStage.getBoundingClientRect();
  return {
    left: rect.width * 0.07,
    top: rect.height * 0.50,
    right: rect.width * 0.93,
    bottom: rect.height * 0.83,
  };
}

function removeWeed(weed) {
  if (!weed || weed.dataset.removed === 'true') return;
  weed.dataset.removed = 'true';
  weed.classList.add('removing');
  beep({ frequency: 620, duration: 0.05, type: 'triangle', volume: 0.04 });
  weedsRemaining -= 1;
  setTimeout(() => weed.remove(), 240);
  if (weedsRemaining <= 0 && !state.pistonDone) {
    state.pistonDone = true;
    setTimeout(() => {
      showScenePop(document.getElementById('pistonScreen'), 'Lawn cleared');
      setTimeout(() => {
        showReward('ENGINE', 'The Piston Club handed over your engine part.', 'home');
      }, 900);
    }, 260);
  }
}

function weedsFromPoint(clientX, clientY) {
  return document.elementsFromPoint(clientX, clientY).filter(el => el.classList && el.classList.contains('weed'));
}

function spawnWeeds() {
  weedLayer.innerHTML = '';
  weedsRemaining = 10;
  const bounds = lawnBounds();
  const positions = [];

  for (let i = 0; i < 10; i++) {
    let x, y, attempts = 0;
    do {
      x = bounds.left + Math.random() * (bounds.right - bounds.left - 48);
      y = bounds.top + Math.random() * (bounds.bottom - bounds.top - 72);
      attempts += 1;
    } while (positions.some(p => Math.hypot(p.x - x, p.y - y) < 65) && attempts < 60);

    positions.push({ x, y });
    const weed = document.createElement('button');
    weed.type = 'button';
    weed.className = 'weed';
    weed.style.left = `${x}px`;
    weed.style.top = `${y}px`;
    weed.style.transform = `rotate(${Math.random() * 14 - 7}deg) scale(${0.82 + Math.random() * 0.34})`;
    weed.setAttribute('aria-label', 'Remove weed');
    weed.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      pistonDragging = true;
      removeWeed(weed);
    });
    weedLayer.appendChild(weed);
  }
}

function initPiston() {
  if (!pistonInitialised) {
    spawnWeeds();
    pistonInitialised = true;

    weedLayer.addEventListener('pointerdown', () => { pistonDragging = true; });
    window.addEventListener('pointerup', () => { pistonDragging = false; });
    window.addEventListener('pointercancel', () => { pistonDragging = false; });
    window.addEventListener('pointermove', (e) => {
      if (!pistonDragging || state.pistonDone) return;
      weedsFromPoint(e.clientX, e.clientY).forEach(removeWeed);
    });
    window.addEventListener('resize', () => {
      if (!screens.piston.classList.contains('active') || state.pistonDone) return;
      spawnWeeds();
    });
  }

  if (!state.pistonDone) {
    spawnWeeds();
  } else {
    weedLayer.innerHTML = '';
  }
}

showScreen('home');
