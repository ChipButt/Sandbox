const ASTRA_LINK = 'https://www.youtube.com/playlist?list=PLWh6zjkuSLMD8saDiL2UjJOzB-M_i8Oms';

const VENUES = [
  {
    id: 'astra-hq',
    code: 'ASTRA-HQ-AZUREBRINE',
    venueName: 'Astra HQ',
    displayName: 'Astra HQ',
    partnerName: 'Roll Britannia',
    anomaly: 'Azurebrine',
    asset: 'assets/anomaly-azurebrine.png',
    summary: 'A luminous spiral of charged blue energy. It appears to bend local signal paths and leave bright residual traces in scanner memory.',
    details: ['Classification: Energetic Spiral', 'Signal: Stable but volatile', 'Protocol: Observe only']
  },
  {
    id: 'venue-2',
    code: 'ASTRA-VENUE-2-CINDERCAP',
    venueName: 'Venue 2',
    displayName: 'Venue 2',
    partnerName: 'Venue 2',
    anomaly: 'Cindercap',
    asset: 'assets/anomaly-cindercap.png',
    summary: 'A branching bio-luminous growth with bright cyan caps. Emits a low pulsing signal similar to deep-space fungal networks.',
    details: ['Classification: Organic Bloom', 'Signal: Rhythmic pulse', 'Protocol: Do not touch']
  },
  {
    id: 'venue-3',
    code: 'ASTRA-VENUE-3-ECHOSHELL',
    venueName: 'Venue 3',
    displayName: 'Venue 3',
    partnerName: 'Venue 3',
    anomaly: 'Echoshell',
    asset: 'assets/anomaly-echoshell.png',
    summary: 'A dense mineral mass marked with glowing blue claw-like channels. Internal echoes suggest something hollow beneath the surface.',
    details: ['Classification: Mineral Relic', 'Signal: Echo return', 'Protocol: Scan twice']
  },
  {
    id: 'venue-4',
    code: 'ASTRA-VENUE-4-GLIMMERROOT',
    venueName: 'Venue 4',
    displayName: 'Venue 4',
    partnerName: 'Venue 4',
    anomaly: 'Glimmerroot',
    asset: 'assets/anomaly-glimmerroot.png',
    summary: 'A tangled crystalline root structure carrying bright seed-like cores. The vines seem to grow around the light rather than from it.',
    details: ['Classification: Rooted Crystal', 'Signal: Photosynthetic glow', 'Protocol: Maintain distance']
  },
  {
    id: 'venue-5',
    code: 'ASTRA-VENUE-5-HOLLOWCLAW',
    venueName: 'Venue 5',
    displayName: 'Venue 5',
    partnerName: 'Venue 5',
    anomaly: 'Hollowclaw',
    asset: 'assets/anomaly-hollowclaw.png',
    summary: 'A claw-scored stone formation with concentrated blue residue. The markings resemble a warning left by an unknown lifeform.',
    details: ['Classification: Impact Stone', 'Signal: Residual energy', 'Protocol: Log and withdraw']
  },
  {
    id: 'venue-6',
    code: 'ASTRA-VENUE-6-NULLGLASS',
    venueName: 'Venue 6',
    displayName: 'Venue 6',
    partnerName: 'Venue 6',
    anomaly: 'Nullglass',
    asset: 'assets/anomaly-nullglass.png',
    summary: 'A suspended shard of dark crystal threaded with blue circuitry. It absorbs light at its centre and throws data noise outward.',
    details: ['Classification: Void Crystal', 'Signal: Distorted', 'Protocol: High caution']
  }
];

const RARITIES = [
  {name:'Common', asset:'assets/1. common.png', reward:'Initial issue: field item acquired.'},
  {name:'Uncommon', asset:'assets/2. uncommon.png', reward:'Upgrade logged: power signature increased.'},
  {name:'Rare', asset:'assets/3. rare.png', reward:'Rare status achieved: anomaly trail strengthening.'},
  {name:'Very Rare', asset:'assets/4. Very Rare.png', reward:'Very Rare status achieved: field resonance confirmed.'},
  {name:'Legendary', asset:'assets/5. Legendary.png', reward:'Legendary status achieved: report to Astra HQ to claim your gift.'},
  {name:'Godlike', asset:'assets/6. Godlike.png', reward:'Godlike status achieved: claim your gift and enter the prize draw at Astra HQ.'}
];

const stateDefault = () => ({
  scans: [],
  activeMail: 0,
  lastScan: null,
  startedAt: Date.now()
});

let state = loadState();
let currentPage = 'home';
let detector = null;
let stream = null;
let scanLoopActive = false;
let selectedAnomalyId = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function loadState(){
  try { return {...stateDefault(), ...(JSON.parse(localStorage.getItem('astra-terminal-state')||'{}'))}; }
  catch { return stateDefault(); }
}
function saveState(){ localStorage.setItem('astra-terminal-state', JSON.stringify(state)); }
function resetState(){
  if(!confirm('Reset this field terminal? All local scan progress will be cleared.')) return;
  state = stateDefault(); saveState(); renderAll(); go('home');
}
function scannedVenues(){ return VENUES.filter(v => state.scans.includes(v.code)); }
function progress(){ return Math.min(state.scans.length, RARITIES.length); }
function currentRarity(){ return progress() ? RARITIES[progress()-1] : null; }
function nextVenue(){ return VENUES.find(v => !state.scans.includes(v.code)); }
function normalizeCode(raw){ return String(raw||'').trim().replace(/^https?:\/\/.*?[?#&]code=/i,'').toUpperCase(); }
function findVenueByCode(raw){
  const code = normalizeCode(raw);
  return VENUES.find(v => v.code.toUpperCase() === code || v.id.toUpperCase() === code);
}
function registerScan(raw){
  const venue = findVenueByCode(raw);
  if(!venue){ flash('Unknown QR signature. No Astra anomaly found.', 'bad'); return false; }
  const already = state.scans.includes(venue.code);
  if(!already){ state.scans.push(venue.code); state.lastScan = venue.code; saveState(); }
  selectedAnomalyId = venue.id;
  renderAll();
  if(already){ flash(`${venue.anomaly} already logged. Duplicate scan ignored.`, 'warn'); }
  else { flash(`${venue.anomaly} logged. ${progress()}/6 anomalies secured.`, 'good'); }
  go('scanner');
  return true;
}
function flash(text, type='good'){
  const el = $('#toast');
  el.textContent = text;
  el.className = `toast show ${type}`;
  clearTimeout(flash.t);
  flash.t = setTimeout(()=>el.className='toast', 3000);
}

function go(page){
  currentPage = page;
  $$('.page').forEach(p => p.classList.toggle('active', p.dataset.page === page));
  if(page !== 'scanner') stopScanner();
  renderAll();
}

function renderAll(){
  renderHome(); renderScannerPage(); renderDataLog(); renderInbox(); renderReward(); renderDetail();
}
function renderHome(){
  $('#homeProgress').textContent = `${progress()} / 6`;
  const rarity = currentRarity();
  $('#homeRarity').textContent = rarity ? rarity.name.toUpperCase() : 'NO FIELD ITEM';
  $('#homeItem').src = rarity ? rarity.asset : 'assets/unknown-anomaly.png';
  $('#homeReward').textContent = rarity ? rarity.reward : 'Scan your first Astra QR code to begin field collection.';
  const scanned = scannedVenues();
  $('#homeAnomalyGrid').innerHTML = VENUES.map(v => {
    const found = state.scans.includes(v.code);
    return `<button class="anomaly-dot ${found?'found':''}" data-id="${v.id}" title="${found?v.anomaly:'Unknown anomaly'}"><img src="${found?v.asset:'assets/unknown-anomaly.png'}" alt="${found?v.anomaly:'Unknown'}"></button>`;
  }).join('');
  $$('#homeAnomalyGrid .anomaly-dot').forEach(btn=>btn.addEventListener('click',()=>{selectedAnomalyId=btn.dataset.id; go('anomalyDetail');}));
  $('#nextInstruction').textContent = progress() >= 6
    ? 'All anomaly records are complete. Report to Astra HQ for final reward processing.'
    : `Next objective: scan ${nextVenue()?.displayName || 'remaining venue'} QR signature.`;
}
function renderScannerPage(){
  const selected = selectedAnomalyId ? VENUES.find(v=>v.id===selectedAnomalyId) : (state.lastScan ? VENUES.find(v=>v.code===state.lastScan) : null);
  const found = selected && state.scans.includes(selected.code);
  $('#scannerTitle').textContent = selected ? selected.anomaly.toUpperCase() : 'AWAITING SCAN';
  $('#scannerImage').src = selected ? selected.asset : 'assets/unknown-anomaly.png';
  $('#scannerVenue').textContent = selected ? `${selected.displayName} // ${selected.partnerName}` : 'Point the scanner at an Astra QR code.';
  $('#scannerInfo1').textContent = selected ? selected.details[0] : 'Camera scanner uses the device camera when supported.';
  $('#scannerInfo2').textContent = selected ? selected.details[1] : 'If camera scanning is unavailable, use manual code entry.';
  $('#scannerInfo3').textContent = selected ? (found ? 'Record status: LOGGED' : 'Record status: NOT YET LOGGED') : 'Awaiting anomaly signature.';
  $('#manualCode').placeholder = VENUES[0].code;
}
function renderDataLog(){
  $('#dataRows').innerHTML = VENUES.map((v,i)=>{
    const found = state.scans.includes(v.code);
    return `<button class="data-row ${found?'found':'locked'}" data-id="${v.id}">
      <img src="${found?v.asset:'assets/unknown-anomaly.png'}" alt="${found?v.anomaly:'Unknown'}">
      <span><strong>${found?v.anomaly:`Anomaly ${i+1}`}</strong><em>${found?v.summary:'Record locked until QR signature is scanned.'}</em></span>
    </button>`;
  }).join('');
  $$('#dataRows .data-row').forEach(row=>row.addEventListener('click',()=>{selectedAnomalyId=row.dataset.id; go('anomalyDetail');}));
}
function renderDetail(){
  const v = selectedAnomalyId ? VENUES.find(x=>x.id===selectedAnomalyId) : null;
  const found = v && state.scans.includes(v.code);
  $('#detailTitle').textContent = found ? v.anomaly.toUpperCase() : 'UNKNOWN ANOMALY';
  $('#detailImage').src = found ? v.asset : 'assets/unknown-anomaly.png';
  $('#detailVenue').textContent = found ? `${v.displayName} // ${v.partnerName}` : 'Scan required';
  $('#detailSummary').textContent = found ? v.summary : 'This anomaly record is encrypted until its QR signature has been logged.';
  $('#detailList').innerHTML = found ? v.details.map(d=>`<li>${d}</li>`).join('') : '<li>Classification: Locked</li><li>Signal: Unknown</li><li>Protocol: Locate QR signature</li>';
}
function renderInbox(){
  const mail = [
    {h:'MISSION BRIEF', b:'Junior Astra Agent: your field terminal is active. Locate six QR signatures across the event floor. Each unique signature strengthens your assigned field item and unlocks anomaly data.'},
    {h:'ASTRA HQ', b:'Your primary check-in point is Astra HQ at the Roll Britannia stand. Return there once Legendary or Godlike status has been achieved to claim the appropriate reward.'},
    {h:'SCANNER NOTICE', b:'Repeated scans of the same location will not increase progress. The terminal only accepts unique venue signatures.'},
    {h:'REWARD PROTOCOL', b:'Legendary status grants a gift claim. Godlike status grants a gift claim plus entry into the prize draw. Final reward validation is handled at Astra HQ.'},
    {h:'ASTRA ADVENTURES', b:'Astra archive footage is available through the Astra Adventures terminal link. External link opens the Age of Astra playlist.'},
    {h:'MAP STATUS', b:'The event map is currently marked Coming Soon. The visual map design can be added later without changing the core scan logic.'}
  ];
  $('#mailList').innerHTML = mail.map((m,i)=>`<button class="mail-item ${i===state.activeMail?'active':''}" data-i="${i}"><img src="assets/${i===state.activeMail?'Mail Open Icon.png':'Mail Closed Icon.png'}"><span>${m.h}</span></button>`).join('');
  $$('#mailList .mail-item').forEach(btn=>btn.addEventListener('click',()=>{state.activeMail=+btn.dataset.i; saveState(); renderInbox();}));
  $('#mailHeader').textContent = mail[state.activeMail].h;
  $('#mailBody').textContent = mail[state.activeMail].b;
}
function renderReward(){
  const r = currentRarity();
  $('#rewardImage').src = r ? r.asset : 'assets/unknown-anomaly.png';
  $('#rewardTitle').textContent = r ? r.name.toUpperCase() : 'FIELD ITEM LOCKED';
  $('#rewardText').textContent = r ? r.reward : 'Scan a QR code to activate your field item.';
  $('#rewardClaim').textContent = progress() >= 6 ? 'GODLIKE: GIFT + PRIZE DRAW ENTRY' : progress() >= 5 ? 'LEGENDARY: GIFT CLAIM AVAILABLE' : 'KEEP SCANNING TO UNLOCK REWARD STATUS';
}
async function startScanner(){
  const video = $('#scannerVideo');
  $('#scannerStatus').textContent = 'Starting camera...';
  try{
    if(!('mediaDevices' in navigator)) throw new Error('No camera API available.');
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}, audio:false});
    video.srcObject = stream;
    await video.play();
    if('BarcodeDetector' in window){
      detector = new BarcodeDetector({formats:['qr_code']});
      scanLoopActive = true;
      $('#scannerStatus').textContent = 'Camera active. Searching for QR signature...';
      scanLoop();
    } else {
      $('#scannerStatus').textContent = 'Camera active, but this browser has no built-in QR detector. Use manual entry below.';
    }
  }catch(err){
    $('#scannerStatus').textContent = 'Camera unavailable. Use manual code entry below.';
    flash('Camera scanner could not start on this device/browser.', 'warn');
  }
}
async function scanLoop(){
  if(!scanLoopActive || !detector || !$('#scannerVideo').videoWidth){ requestAnimationFrame(scanLoop); return; }
  try{
    const codes = await detector.detect($('#scannerVideo'));
    if(codes.length){ registerScan(codes[0].rawValue); stopScanner(); return; }
  }catch(err){ $('#scannerStatus').textContent = 'QR detection paused. Use manual entry if needed.'; }
  requestAnimationFrame(scanLoop);
}
function stopScanner(){
  scanLoopActive = false;
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream = null; }
  const video = $('#scannerVideo'); if(video) video.srcObject = null;
}
function installEvents(){
  $('[data-action="scanner"]').addEventListener('click',()=>go('scanner'));
  $('[data-action="map"]').addEventListener('click',()=>go('map'));
  $('[data-action="inbox"]').addEventListener('click',()=>go('inbox'));
  $('[data-action="datalog"]').addEventListener('click',()=>go('dataLog'));
  $('[data-action="astra"]').addEventListener('click',()=>window.open(ASTRA_LINK,'_blank','noopener'));
  $$('[data-back]').forEach(b=>b.addEventListener('click',()=>go('home')));
  $('#startCamera').addEventListener('click', startScanner);
  $('#stopCamera').addEventListener('click', stopScanner);
  $('#manualSubmit').addEventListener('click',()=>registerScan($('#manualCode').value));
  $('#resetTerminal').addEventListener('click', resetState);
  $('#viewReward').addEventListener('click',()=>go('reward'));
  $('#youtubeLink').addEventListener('click',()=>window.open(ASTRA_LINK,'_blank','noopener'));
  $('#quickScanButtons').innerHTML = VENUES.map(v=>`<button data-code="${v.code}">${v.displayName}</button>`).join('');
  $$('#quickScanButtons button').forEach(b=>b.addEventListener('click',()=>registerScan(b.dataset.code)));
}

window.addEventListener('DOMContentLoaded',()=>{
  installEvents(); renderAll(); go('home');
  if('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
});
