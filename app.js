(function () {
  "use strict";

  const TRAIL = (window.CAPTAINS_TRAILS || [])[0];
  const STORAGE_KEY = "captains-trail-bidford-state-v1";
  const DEV_TAP_TARGET = 7;
  const app = document.getElementById("app");
  const splash = document.getElementById("splash");

  const runtime = {
    screen: "home",
    params: {},
    selectedLocationId: null,
    currentPosition: null,
    gpsError: "",
    logoTaps: 0,
    logoTapTimer: null,
    toastTimer: null,
    scanner: null
  };

  let state = loadState();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    if (!TRAIL) {
      app.innerHTML = '<main class="screen"><div class="empty-card"><h1>Trail data missing</h1><p>Check /data/trails.js.</p></div></main>';
      return;
    }

    parseHash();
    runtime.selectedLocationId = getDefaultLocationId();

    app.addEventListener("click", handleClick);
    app.addEventListener("submit", handleSubmit);
    app.addEventListener("change", handleChange);
    window.addEventListener("hashchange", handleHashChange);

    setTimeout(() => splash && splash.classList.add("is-hidden"), 850);
    render();
    registerServiceWorker();
  }

  function defaultState() {
    return {
      version: 1,
      trail: {
        id: TRAIL ? TRAIL.id : "",
        startedAt: null,
        lastActiveAt: null,
        solvedLocationIds: [],
        unlockedLocationIds: [],
        eliminated: [],
        hintsUsed: {},
        completedAt: null,
        completionStats: null
      },
      profile: {
        name: "Captain",
        stats: {
          trailsCompleted: 0,
          cluesSolved: 0,
          hintsUsed: 0,
          bestTimeMs: null
        }
      },
      settings: {
        sound: true,
        vibration: true
      },
      dev: {
        enabled: false,
        bypassGps: false,
        bypassScanner: false,
        lastConfidence: null
      }
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored || typeof stored !== "object") return base;
      return mergeState(base, stored);
    } catch (error) {
      console.warn("Could not load progress", error);
      return base;
    }
  }

  function mergeState(base, stored) {
    return {
      ...base,
      ...stored,
      trail: { ...base.trail, ...(stored.trail || {}) },
      profile: {
        ...base.profile,
        ...(stored.profile || {}),
        stats: { ...base.profile.stats, ...((stored.profile || {}).stats || {}) }
      },
      settings: { ...base.settings, ...(stored.settings || {}) },
      dev: { ...base.dev, ...(stored.dev || {}) }
    };
  }

  function saveState() {
    state.trail.lastActiveAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function parseHash() {
    const raw = (window.location.hash || "#home").replace(/^#\/?/, "");
    const [screen, query = ""] = raw.split("?");
    runtime.screen = screen || "home";
    runtime.params = Object.fromEntries(new URLSearchParams(query));
  }

  function navigate(screen, params = {}) {
    const query = new URLSearchParams(params).toString();
    const next = `#${screen}${query ? `?${query}` : ""}`;
    if (window.location.hash === next) {
      parseHash();
      render();
      return;
    }
    window.location.hash = next;
  }

  function handleHashChange() {
    const previous = runtime.screen;
    parseHash();
    if (previous === "scanner" && runtime.screen !== "scanner") stopScanner();
    render();
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  function render() {
    const screen = normaliseScreen(runtime.screen);
    runtime.screen = screen;

    if (screen !== "scanner") stopScanner();

    const contentByScreen = {
      home: renderHome,
      intro: renderIntro,
      map: renderMap,
      location: renderLocation,
      scanner: renderScanner,
      clue: renderClue,
      eliminated: renderEliminated,
      board: renderBoard,
      final: renderFinalAnswer,
      completion: renderCompletion,
      trophy: renderTrophy,
      profile: renderProfile,
      settings: renderSettings
    };

    app.innerHTML = contentByScreen[screen]();

    if (screen === "scanner") {
      const loc = getLocation(runtime.params.id);
      if (loc) startScanner(loc);
    }
  }

  function normaliseScreen(screen) {
    const allowed = new Set(["home", "intro", "map", "location", "scanner", "clue", "eliminated", "board", "final", "completion", "trophy", "profile", "settings"]);
    return allowed.has(screen) ? screen : "home";
  }

  function shell(content, subtitle = TRAIL.location) {
    return `
      <main class="screen">
        ${header(subtitle)}
        ${content}
      </main>
      ${bottomNav()}
    `;
  }

  function header(subtitle) {
    return `
      <header class="topbar">
        <button class="brand-button" data-action="logo-tap" aria-label="Captain's Trail logo">
          <img src="assets/generated/logo.svg" alt="">
        </button>
        <div class="topbar__title">
          <h1>Captain&rsquo;s Trail</h1>
          <p>${escapeHtml(subtitle)}</p>
        </div>
        <button class="icon-button" data-nav="settings" aria-label="Settings">
          ${icon("settings")}
        </button>
      </header>
    `;
  }

  function bottomNav() {
    const active = runtime.screen;
    const items = [
      ["home", "Home", "home"],
      ["map", "Map", "map"],
      ["board", "Board", "board"],
      ["trophy", "Trophy", "trophy"],
      ["settings", "Settings", "settings"]
    ];
    return `
      <nav class="bottom-nav" aria-label="App navigation">
        ${items.map(([screen, label, iconName]) => `
          <button type="button" data-nav="${screen}" class="${active === screen ? "is-active" : ""}" aria-label="${label}">
            ${icon(iconName)}
            <span>${label}</span>
          </button>
        `).join("")}
      </nav>
    `;
  }

  function renderHome() {
    const status = getTrailStatus();
    const progress = getProgress();
    return shell(`
      <section class="stack stack--loose">
        <div class="hero-card">
          <div class="hero-card__art">
            <img src="assets/generated/compass.svg" alt="">
            <div>
              <span class="status-pill ${status.className}">${status.label}</span>
              <h2>Bidford-on-Avon</h2>
            </div>
          </div>
          <p class="story-text">A pirate walking trail of clues, camera scans, and deduction around the river village.</p>
        </div>

        <article class="trail-card">
          <div class="trail-card__top">
            <img src="assets/generated/case-file.svg" alt="">
            <div>
              <h2>${escapeHtml(TRAIL.name)}</h2>
              <p>${escapeHtml(TRAIL.location)}</p>
            </div>
          </div>
          <div class="meta-list">
            <div><strong>Time</strong><span>${escapeHtml(TRAIL.estimatedTime)}</span></div>
            <div><strong>Clues</strong><span>${progress.solved}/${TRAIL.locations.length}</span></div>
            <div><strong>False left</strong><span>${progress.falseRemaining}</span></div>
          </div>
          <div class="button-row">
            <button class="btn" data-action="start-trail">${state.trail.startedAt ? "View Case File" : "Start Trail"}</button>
            <button class="btn btn--secondary ${state.trail.startedAt ? "" : "is-disabled"}" data-action="continue-trail" ${state.trail.startedAt ? "" : "disabled"}>Continue Trail</button>
            <button class="btn btn--ghost" data-nav="trophy">Trophy Case</button>
            <button class="btn btn--ghost" data-nav="profile">Profile</button>
          </div>
        </article>
      </section>
    `, "Bidford-on-Avon");
  }

  function renderIntro() {
    return shell(`
      <section class="stack stack--loose">
        <article class="parchment">
          <div class="clue-title-row">
            <img src="assets/generated/case-file.svg" alt="">
            <div>
              <span class="status-pill">Case file</span>
              <h2>${escapeHtml(TRAIL.name)}</h2>
            </div>
          </div>
          <p class="story-text" style="margin-top: 14px">${escapeHtml(TRAIL.story)}</p>
        </article>

        <div class="meta-list meta-list--dark">
          <div><strong>Estimated time</strong><span>${escapeHtml(TRAIL.estimatedTime)}</span></div>
          <div><strong>Distance</strong><span>${escapeHtml(TRAIL.distanceEstimate)}</span></div>
          <div><strong>Difficulty</strong><span>${escapeHtml(TRAIL.difficulty)}</span></div>
        </div>

        <div class="warning">
          ${icon("warning")}
          <p>${escapeHtml(TRAIL.safetyWarning)}</p>
        </div>

        <section class="dark-panel stack">
          <h2>Possible Hiding Places</h2>
          <ul class="hiding-list">
            ${TRAIL.possibleHidingPlaces.map((place) => `<li>${escapeHtml(place)}</li>`).join("")}
          </ul>
        </section>

        <button class="btn" data-action="intro-start">${state.trail.startedAt ? "View Map" : "Start and View Map"}</button>
      </section>
    `, "Case File");
  }

  function renderMap() {
    ensureSelectedLocation();
    const selected = getLocation(runtime.selectedLocationId);
    const progress = getProgress();
    return shell(`
      <section class="map-wrap">
        <div class="map-route-note">
          ${icon("compass")}
          <span>Visit clues in any order. Pins brighten when you are close enough to scan.</span>
        </div>
        <div class="map-stage" aria-label="Pirate map of Bidford-on-Avon">
          <img src="${TRAIL.map.asset}" alt="Illustrated pirate map of Bidford-on-Avon">
          ${TRAIL.locations.map((loc) => renderMapPin(loc)).join("")}
        </div>

        <div class="map-bottom-panel">
          <div class="panel-stats">
            <div class="panel-stat"><span>Clues found</span><strong>${progress.solved}/${TRAIL.locations.length}</strong></div>
            <div class="panel-stat"><span>False places left</span><strong>${progress.falseRemaining}</strong></div>
          </div>
          <div class="selected-preview">
            <div>
              <h2>${escapeHtml(selected.title)}</h2>
              <p>${escapeHtml(locationStateText(selected))}</p>
            </div>
            <button class="btn btn--small" data-action="open-location" data-id="${selected.id}">Open</button>
          </div>
          <div class="button-row button-row--inline">
            <button class="btn btn--ghost btn--small" data-nav="board">Deduction</button>
            <button class="btn btn--secondary btn--small ${isFinalReady() ? "" : "is-disabled"}" data-nav="final" ${isFinalReady() ? "" : "disabled"}>Final Answer</button>
          </div>
        </div>
      </section>
    `, "Pirate Map");
  }

  function renderMapPin(loc) {
    const classes = ["map-pin", getPinState(loc)];
    if (runtime.selectedLocationId === loc.id) classes.push("is-selected");
    return `
      <button class="${classes.join(" ")}" style="--pin-x:${loc.mapPoint.x}%;--pin-y:${loc.mapPoint.y}%;" data-action="select-location" data-id="${loc.id}" aria-label="${escapeHtml(loc.title)}">
        <span class="map-pin__shape">${loc.number}</span>
      </button>
    `;
  }

  function renderLocation() {
    const loc = getLocation(runtime.params.id) || getLocation(getDefaultLocationId());
    const distance = getDistanceLabel(loc);
    const status = getGpsStatus(loc);
    const unlocked = isUnlocked(loc.id);
    const solved = isSolved(loc.id);
    const canScan = canOpenScanner(loc);
    return shell(`
      <section class="stack stack--loose">
        <article class="location-card">
          <div>
            <span class="status-pill">${loc.number} of ${TRAIL.locations.length}</span>
            <h2 class="screen-title" style="margin-top: 8px">${escapeHtml(loc.title)}</h2>
          </div>
          <div class="location-hero" aria-hidden="true">${locationArt(loc.illustration)}</div>
          <div class="gps-status ${canScan ? "is-nearby" : ""}">
            <span class="scan-dot">${icon(canScan ? "check" : "pin")}</span>
            <div>
              <strong>${escapeHtml(status.title)}</strong>
              <span>${escapeHtml(status.detail)} Distance: ${distance}.</span>
            </div>
          </div>
          <div class="button-row">
            <button class="btn btn--secondary" data-action="check-location" data-id="${loc.id}">Check my location</button>
            ${solved || unlocked
              ? `<button class="btn" data-nav="clue" data-id="${loc.id}">View clue</button>`
              : `<button class="btn ${canScan ? "" : "is-disabled"}" data-action="open-scanner" data-id="${loc.id}" ${canScan ? "" : "disabled"}>Open scanner</button>`
            }
          </div>
        </article>

        ${runtime.gpsError ? `<div class="warning">${icon("warning")}<p>${escapeHtml(runtime.gpsError)}</p></div>` : ""}
        ${renderDevLocationPanel(loc)}
      </section>
    `, loc.shortTitle);
  }

  function renderScanner() {
    const loc = getLocation(runtime.params.id);
    if (!loc) return shell(`<div class="empty-card"><h1>Location missing</h1><p>Return to the map and choose a clue.</p></div>`);

    return `
      <main class="screen screen--scanner">
        <section class="scanner-shell">
          <div class="scanner-top">
            <button class="icon-button" data-nav="location" data-id="${loc.id}" aria-label="Cancel scanner">${icon("back")}</button>
            <h1>${escapeHtml(loc.title)}</h1>
            <button class="icon-button" data-action="logo-tap" aria-label="Captain's Trail logo">
              <img src="assets/generated/logo.svg" alt="" style="width: 30px; height: 30px">
            </button>
          </div>

          <div class="viewfinder">
            <video id="cameraView" autoplay playsinline muted></video>
            <div class="viewfinder__fallback" id="cameraFallback">
              <p>Opening camera...</p>
            </div>
            <div class="scan-frame"></div>
            <div class="scan-instruction">
              <strong>Hold steady</strong>
              <span>Fill the frame with the sign, plaque, or landmark. Camera frames stay on this device.</span>
            </div>
          </div>

          <div class="scanner-actions">
            <div id="scanResult" class="scan-result" aria-live="polite"></div>
            ${state.dev.enabled ? `<div class="debug-panel" id="scannerDebug">${renderScannerDebug(loc)}</div>` : ""}
            <button class="btn" data-action="capture-scan" data-id="${loc.id}">${icon("camera")} Capture</button>
            <div class="button-row button-row--inline">
              <button class="btn btn--ghost" data-action="retry-scanner" data-id="${loc.id}">Retry</button>
              <button class="btn btn--secondary" data-nav="location" data-id="${loc.id}">Cancel</button>
            </div>
            ${state.dev.enabled ? `<button class="btn btn--danger" data-action="dev-bypass-scanner" data-id="${loc.id}">Dev bypass scanner</button>` : ""}
          </div>

          <canvas id="captureCanvas" class="hidden-canvas"></canvas>
        </section>
      </main>
    `;
  }

  function renderClue() {
    const loc = getLocation(runtime.params.id);
    if (!loc) return shell(`<div class="empty-card"><h1>Clue missing</h1><p>Return to the map and choose a clue.</p></div>`);

    const unlocked = isUnlocked(loc.id) || isSolved(loc.id) || (state.dev.enabled && state.dev.bypassScanner);
    if (!unlocked) {
      return shell(`
        <section class="stack">
          <div class="empty-card">
            <h1>Clue locked</h1>
            <p>Check your location and scan the trigger object to unlock this clue.</p>
          </div>
          <button class="btn" data-nav="location" data-id="${loc.id}">Back to Location</button>
        </section>
      `, loc.shortTitle);
    }

    const hintVisible = Boolean(state.trail.hintsUsed[loc.id]);
    const solved = isSolved(loc.id);
    const solvedText = loc.eliminates
      ? `You eliminated: ${loc.eliminates}`
      : "This clue confirms the captain's final crossing.";

    return shell(`
      <section class="stack stack--loose">
        <article class="parchment clue-card">
          <div class="clue-title-row">
            <img src="assets/generated/clue-scroll.svg" alt="">
            <div>
              <span class="status-pill">${solved ? "Solved" : "Unlocked clue"}</span>
              <h2>${escapeHtml(loc.title)}</h2>
            </div>
          </div>
          <div class="riddle">${escapeHtml(loc.riddle)}</div>
          ${solved ? `<div class="scan-result is-visible is-success">${icon("check")}<strong>${escapeHtml(solvedText)}</strong></div>` : `
            <button class="btn btn--ghost" data-action="show-hint" data-id="${loc.id}">Show Hint</button>
            <div class="hint-box ${hintVisible ? "is-visible" : ""}" id="hintBox">${escapeHtml(loc.hint)}</div>
            <form class="stack" data-form="clue-answer" data-id="${loc.id}">
              <label class="sr-only" for="answer-${loc.id}">Answer</label>
              <input id="answer-${loc.id}" class="answer-input" name="answer" autocomplete="off" inputmode="text" placeholder="Type your answer">
              <p class="form-note" id="answerNote"></p>
              <button class="btn" type="submit">Submit Answer</button>
            </form>
          `}
        </article>
        <button class="btn btn--secondary" data-nav="map">Return to Map</button>
      </section>
    `, "Puzzle");
  }

  function renderEliminated() {
    const loc = getLocation(runtime.params.id);
    if (!loc) return shell(`<div class="empty-card"><h1>Result missing</h1><p>Return to the map.</p></div>`);
    const isElimination = Boolean(loc.eliminates);
    return shell(`
      <section class="stack stack--loose">
        <div class="completion-visual">
          <img src="${isElimination ? "assets/generated/success-badge.svg" : "assets/generated/compass.svg"}" alt="">
        </div>
        <article class="dark-panel stack">
          <h2>${isElimination ? "False trail struck off" : "Final crossing confirmed"}</h2>
          <p>${isElimination ? `You eliminated: ${escapeHtml(loc.eliminates)}` : "The captain's clues point back to stone over water."}</p>
        </article>
        <div class="eliminated-card ${isElimination ? "is-crossed" : ""}">
          <h2>${escapeHtml(isElimination ? loc.eliminates : TRAIL.correctFinalHidingPlace)}</h2>
        </div>
        <button class="btn" data-nav="map">Return to Map</button>
        ${isFinalReady() ? `<button class="btn btn--secondary" data-nav="final">Open Final Answer</button>` : ""}
      </section>
    `, "Result");
  }

  function renderBoard() {
    const remaining = getRemainingPlaces();
    const progress = getProgress();
    return shell(`
      <section class="stack stack--loose">
        <article class="dark-panel stack">
          <h2>Deduction Board</h2>
          <p>Cross out every false hiding place. When only one remains, the treasure can be opened.</p>
          <div class="panel-stats">
            <div class="panel-stat"><span>Clues solved</span><strong>${progress.solved}</strong></div>
            <div class="panel-stat"><span>False left</span><strong>${progress.falseRemaining}</strong></div>
          </div>
        </article>
        <article class="deduction-card">
          <ul class="deduction-list">
            ${TRAIL.possibleHidingPlaces.map((place, index) => {
              const out = state.trail.eliminated.includes(place);
              const remainingWinner = remaining.length === 1 && remaining[0] === place;
              return `
                <li class="deduction-item ${out ? "is-out" : ""} ${remainingWinner ? "is-remaining" : ""}">
                  <span class="mark">${index + 1}</span>
                  <strong>${escapeHtml(place)}</strong>
                </li>
              `;
            }).join("")}
          </ul>
        </article>
        ${isFinalReady()
          ? `<article class="dark-panel stack"><h2>Only one hiding place remains...</h2><p>${escapeHtml(TRAIL.correctFinalHidingPlace)} is the captain's last mark.</p><button class="btn" data-nav="final">Enter Final Answer</button></article>`
          : `<button class="btn btn--secondary" data-nav="map">Keep Searching</button>`
        }
      </section>
    `, "Deduction");
  }

  function renderFinalAnswer() {
    const ready = isFinalReady();
    const remaining = getRemainingPlaces();
    return shell(`
      <section class="stack stack--loose">
        <article class="parchment stack">
          <div class="completion-visual">
            <img src="assets/generated/chest-closed.svg" alt="">
          </div>
          <span class="status-pill">${ready ? "Final answer" : "Locked"}</span>
          <h2 class="screen-title">${ready ? escapeHtml(remaining[0]) : "The chest is still locked"}</h2>
          <p class="story-text">${ready ? "Type the remaining hiding place to open the captain's treasure." : "Eliminate all five false hiding places before trying the final answer."}</p>
          ${ready ? `
            <form class="stack" data-form="final-answer">
              <label class="sr-only" for="finalAnswer">Final answer</label>
              <input id="finalAnswer" class="answer-input" name="answer" autocomplete="off" placeholder="Type the final hiding place">
              <p class="form-note" id="finalNote"></p>
              <button class="btn" type="submit">Open Treasure</button>
            </form>
          ` : `<button class="btn btn--secondary" data-nav="board">View Deduction Board</button>`}
        </article>
      </section>
    `, "Final Answer");
  }

  function renderCompletion() {
    const stats = getCompletionStats();
    return shell(`
      <section class="stack stack--loose">
        <article class="parchment stack">
          <div class="completion-visual">
            <img src="assets/generated/chest-open.svg" alt="Open treasure chest">
          </div>
          <span class="status-pill status-pill--done">Trail complete</span>
          <h2 class="screen-title">Congratulations, Captain</h2>
          <p class="story-text">The lost captain's treasure has been opened at ${escapeHtml(TRAIL.correctFinalHidingPlace)}.</p>
        </article>
        <div class="grid-2">
          <div class="stat-card"><strong>Clues found</strong><span>${stats.cluesFound}</span></div>
          <div class="stat-card"><strong>Time taken</strong><span>${formatDuration(stats.timeMs)}</span></div>
          <div class="stat-card"><strong>Hints used</strong><span>${stats.hintsUsed}</span></div>
          <div class="stat-card"><strong>Completed</strong><span>${formatDate(stats.completedAt)}</span></div>
        </div>
        <div class="button-row">
          <button class="btn" data-nav="trophy">Add to Trophy Case</button>
          <button class="btn btn--secondary" data-action="share-result">Share Result</button>
          <button class="btn btn--ghost" data-action="play-again">Play Again</button>
        </div>
      </section>
    `, "Treasure Opened");
  }

  function renderTrophy() {
    const complete = Boolean(state.trail.completedAt);
    const stats = getCompletionStats();
    return shell(`
      <section class="stack stack--loose">
        <article class="dark-panel stack">
          <h2>Trophy Case</h2>
          <p>Your completed trails are stored on this device.</p>
        </article>
        <div class="trophy-grid">
          <div class="trophy-slot ${complete ? "" : "is-locked"}">
            <img src="assets/generated/trophy-medal.svg" alt="">
            <strong>${escapeHtml(TRAIL.name)}</strong>
            <span>${complete ? `Completed ${formatDate(stats.completedAt)}` : "Locked"}</span>
          </div>
          <div class="trophy-slot is-locked">
            <img src="assets/generated/trophy-medal.svg" alt="">
            <strong>Future Trail</strong>
            <span>Locked</span>
          </div>
          <div class="trophy-slot is-locked">
            <img src="assets/generated/trophy-medal.svg" alt="">
            <strong>River Legend</strong>
            <span>Locked</span>
          </div>
          <div class="trophy-slot is-locked">
            <img src="assets/generated/trophy-medal.svg" alt="">
            <strong>Village Secret</strong>
            <span>Locked</span>
          </div>
        </div>
        ${complete ? `<article class="parchment"><h2>${escapeHtml(TRAIL.name)}</h2><p class="story-text">Time: ${formatDuration(stats.timeMs)}. Clues: ${stats.cluesFound}. Hints: ${stats.hintsUsed}.</p></article>` : ""}
      </section>
    `, "Trophy Case");
  }

  function renderProfile() {
    const stats = getProfileStats();
    return shell(`
      <section class="stack stack--loose">
        <article class="parchment stack">
          <div class="clue-title-row">
            <img src="assets/generated/profile-avatar.svg" alt="">
            <div>
              <span class="status-pill">Profile</span>
              <h2>${escapeHtml(state.profile.name || "Captain")}</h2>
            </div>
          </div>
          <label for="playerName"><strong>Player name</strong></label>
          <input id="playerName" class="input" name="playerName" value="${escapeHtml(state.profile.name || "")}" autocomplete="name">
        </article>
        <div class="grid-2">
          <div class="stat-card"><strong>Trails completed</strong><span>${stats.trailsCompleted}</span></div>
          <div class="stat-card"><strong>Clues solved</strong><span>${stats.cluesSolved}</span></div>
          <div class="stat-card"><strong>Best time</strong><span>${stats.bestTimeMs ? formatDuration(stats.bestTimeMs) : "None yet"}</span></div>
          <div class="stat-card"><strong>Hints used</strong><span>${stats.hintsUsed}</span></div>
        </div>
        <button class="btn btn--danger" data-action="reset-all">Reset data</button>
      </section>
    `, "Profile");
  }

  function renderSettings() {
    return shell(`
      <section class="stack stack--loose">
        <article class="dark-panel stack">
          <h2>Settings</h2>
          <p class="privacy-note">This prototype stores progress only on your device.</p>
        </article>
        <div class="settings-list">
          ${settingRow("Sound", "Small UI sounds can be added later; the switch is saved now.", "sound", state.settings.sound)}
          ${settingRow("Vibration", "Use gentle haptic feedback on supported phones.", "vibration", state.settings.vibration)}
        </div>
        <article class="dark-panel stack">
          <h2>Permissions</h2>
          <p>Camera access is used only for local trigger matching. Location is used only on this device to unlock nearby scan points. Nothing is uploaded.</p>
        </article>
        ${state.dev.enabled ? renderDevSettingsPanel() : ""}
        <button class="btn btn--danger" data-action="reset-trail">Reset current trail</button>
      </section>
    `, "Settings");
  }

  function settingRow(title, detail, key, enabled) {
    return `
      <div class="setting-row">
        <div><strong>${title}</strong><span>${detail}</span></div>
        <button type="button" class="toggle ${enabled ? "is-on" : ""}" data-action="toggle-setting" data-key="${key}" aria-label="${title}"></button>
      </div>
    `;
  }

  function renderDevSettingsPanel() {
    return `
      <article class="debug-panel">
        <strong>Dev mode</strong>
        <div class="setting-row">
          <div><strong>Bypass GPS</strong><span>Locations count as nearby for testing.</span></div>
          <button class="toggle ${state.dev.bypassGps ? "is-on" : ""}" data-action="toggle-dev" data-key="bypassGps" aria-label="Bypass GPS"></button>
        </div>
        <div class="setting-row">
          <div><strong>Bypass scanner</strong><span>Unlock clues without matching a reference photo.</span></div>
          <button class="toggle ${state.dev.bypassScanner ? "is-on" : ""}" data-action="toggle-dev" data-key="bypassScanner" aria-label="Bypass scanner"></button>
        </div>
        <button class="btn btn--ghost btn--small" data-action="disable-dev">Hide dev mode</button>
      </article>
    `;
  }

  function renderDevLocationPanel(loc) {
    if (!state.dev.enabled) return "";
    const coords = runtime.currentPosition
      ? `${runtime.currentPosition.lat.toFixed(6)}, ${runtime.currentPosition.lng.toFixed(6)}`
      : "No GPS fix yet";
    return `
      <div class="debug-panel">
        <strong>Dev location tools</strong>
        <span>Expected trigger: <code>${escapeHtml(fileName(loc.triggerFile))}</code></span>
        <span>Full path: <code>${escapeHtml(loc.triggerFile)}</code></span>
        <span>Current GPS: <code>${escapeHtml(coords)}</code></span>
        <span>Target GPS: <code>${loc.gps.lat}, ${loc.gps.lng}</code></span>
        <span>Radius: ${loc.radiusM}m. Bypass GPS: ${state.dev.bypassGps ? "on" : "off"}.</span>
      </div>
    `;
  }

  function renderScannerDebug(loc) {
    const coords = runtime.currentPosition
      ? `${runtime.currentPosition.lat.toFixed(6)}, ${runtime.currentPosition.lng.toFixed(6)}`
      : "No GPS fix";
    const confidence = state.dev.lastConfidence == null ? "No scan yet" : `${state.dev.lastConfidence}/100`;
    return `
      <strong>Dev scanner</strong>
      <span>Expected: <code>${escapeHtml(fileName(loc.triggerFile))}</code></span>
      <span>Confidence: <code>${confidence}</code></span>
      <span>Threshold: <code>${TRAIL.matchThreshold}</code></span>
      <span>GPS: <code>${escapeHtml(coords)}</code></span>
    `;
  }

  function handleClick(event) {
    const button = event.target.closest("button, a");
    if (!button) return;

    const nav = button.dataset.nav;
    if (nav) {
      const params = button.dataset.id ? { id: button.dataset.id } : {};
      navigate(nav, params);
      return;
    }

    const action = button.dataset.action;
    if (!action) return;

    const id = button.dataset.id;
    if (action === "logo-tap") return handleLogoTap();
    if (action === "start-trail") return navigate("intro");
    if (action === "continue-trail") return navigate(state.trail.completedAt ? "completion" : "map");
    if (action === "intro-start") return startTrail();
    if (action === "select-location") return selectLocation(id);
    if (action === "open-location") return navigate("location", { id });
    if (action === "check-location") return checkLocation(id);
    if (action === "open-scanner") return navigate("scanner", { id });
    if (action === "capture-scan") return captureScan(id);
    if (action === "retry-scanner") return retryScanner(id);
    if (action === "dev-bypass-scanner") return unlockClue(id, true);
    if (action === "show-hint") return showHint(id);
    if (action === "share-result") return shareResult();
    if (action === "play-again") return playAgain();
    if (action === "reset-trail") return resetTrailWithConfirm();
    if (action === "reset-all") return resetAllWithConfirm();
    if (action === "toggle-setting") return toggleSetting(button.dataset.key);
    if (action === "toggle-dev") return toggleDevSetting(button.dataset.key);
    if (action === "disable-dev") return disableDevMode();
  }

  function handleSubmit(event) {
    const form = event.target;
    const formName = form.dataset.form;
    if (!formName) return;
    event.preventDefault();
    const answer = new FormData(form).get("answer") || "";

    if (formName === "clue-answer") {
      submitClueAnswer(form.dataset.id, answer, form);
    }

    if (formName === "final-answer") {
      submitFinalAnswer(answer, form);
    }
  }

  function handleChange(event) {
    if (event.target.name === "playerName") {
      state.profile.name = event.target.value.trim() || "Captain";
      saveState();
      showToast("Profile saved.");
    }
  }

  function handleLogoTap() {
    runtime.logoTaps += 1;
    clearTimeout(runtime.logoTapTimer);
    runtime.logoTapTimer = setTimeout(() => {
      runtime.logoTaps = 0;
    }, 2200);

    if (runtime.logoTaps >= DEV_TAP_TARGET) {
      state.dev.enabled = !state.dev.enabled;
      runtime.logoTaps = 0;
      saveState();
      showToast(state.dev.enabled ? "Dev mode enabled." : "Dev mode hidden.");
      render();
    }
  }

  function startTrail() {
    if (!state.trail.startedAt) {
      state.trail.startedAt = new Date().toISOString();
      saveState();
    }
    navigate("map");
  }

  function selectLocation(id) {
    runtime.selectedLocationId = id;
    render();
  }

  function checkLocation(id) {
    const loc = getLocation(id);
    if (!loc) return;

    if (!("geolocation" in navigator)) {
      runtime.gpsError = "This browser does not support location checks. Use dev mode for desktop testing.";
      render();
      return;
    }

    runtime.gpsError = "";
    showToast("Checking your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        runtime.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: Date.now()
        };
        const distance = distanceMeters(runtime.currentPosition, loc.gps);
        showToast(distance <= loc.radiusM ? "You are nearby. Scanner available." : `Too far away: ${Math.round(distance)}m from the target.`);
        render();
      },
      (error) => {
        runtime.gpsError = friendlyGeoError(error);
        render();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 }
    );
  }

  function unlockClue(id, fromDev = false) {
    const loc = getLocation(id);
    if (!loc) return;
    if (!state.trail.unlockedLocationIds.includes(id)) state.trail.unlockedLocationIds.push(id);
    if (!state.trail.startedAt) state.trail.startedAt = new Date().toISOString();
    saveState();
    vibrate(30);
    showToast(fromDev ? "Dev scanner bypass used." : "Object matched.");
    navigate("clue", { id });
  }

  function showHint(id) {
    if (!state.trail.hintsUsed[id]) {
      state.trail.hintsUsed[id] = true;
      saveState();
      vibrate(15);
    }
    render();
  }

  function submitClueAnswer(id, answer, form) {
    const loc = getLocation(id);
    if (!loc) return;
    const note = form.querySelector("#answerNote");
    if (answerMatches(answer, loc.acceptedAnswers)) {
      solveLocation(loc);
      if (note) {
        note.textContent = "Correct answer.";
        note.classList.add("is-good");
      }
      setTimeout(() => navigate("eliminated", { id: loc.id }), 380);
    } else if (note) {
      note.textContent = "Wrong answer. Check the clue and try again.";
      note.classList.remove("is-good");
      vibrate([30, 30, 30]);
    }
  }

  function solveLocation(loc) {
    if (!state.trail.solvedLocationIds.includes(loc.id)) state.trail.solvedLocationIds.push(loc.id);
    if (!state.trail.unlockedLocationIds.includes(loc.id)) state.trail.unlockedLocationIds.push(loc.id);
    if (loc.eliminates && !state.trail.eliminated.includes(loc.eliminates)) {
      state.trail.eliminated.push(loc.eliminates);
    }
    saveState();
    vibrate(50);
  }

  function submitFinalAnswer(answer, form) {
    const note = form.querySelector("#finalNote");
    if (!isFinalReady()) {
      if (note) note.textContent = "The chest is not ready yet.";
      return;
    }

    if (answerMatches(answer, TRAIL.finalAcceptedAnswers)) {
      completeTrail();
      if (note) {
        note.textContent = "Treasure opened.";
        note.classList.add("is-good");
      }
      setTimeout(() => navigate("completion"), 320);
    } else if (note) {
      note.textContent = "The lock does not turn. Try a close variant of the remaining place.";
      note.classList.remove("is-good");
      vibrate([40, 30, 40]);
    }
  }

  function completeTrail() {
    if (!state.trail.completedAt) {
      const completedAt = new Date().toISOString();
      const timeMs = Date.now() - new Date(state.trail.startedAt || completedAt).getTime();
      const stats = {
        cluesFound: state.trail.solvedLocationIds.length,
        timeMs,
        hintsUsed: Object.keys(state.trail.hintsUsed).length,
        completedAt
      };
      state.trail.completedAt = completedAt;
      state.trail.completionStats = stats;
      state.profile.stats.trailsCompleted += 1;
      state.profile.stats.cluesSolved += stats.cluesFound;
      state.profile.stats.hintsUsed += stats.hintsUsed;
      if (!state.profile.stats.bestTimeMs || timeMs < state.profile.stats.bestTimeMs) {
        state.profile.stats.bestTimeMs = timeMs;
      }
      saveState();
      vibrate([80, 60, 120]);
    }
  }

  function playAgain() {
    resetTrail(false);
    navigate("intro");
  }

  function resetTrailWithConfirm() {
    if (window.confirm("Reset current trail progress on this device?")) {
      resetTrail(false);
      showToast("Current trail reset.");
      navigate("home");
    }
  }

  function resetAllWithConfirm() {
    if (window.confirm("Reset all Captain's Trail data on this device?")) {
      state = defaultState();
      saveState();
      showToast("All data reset.");
      navigate("home");
    }
  }

  function resetTrail(keepCompletionInProfile) {
    const profile = state.profile;
    const settings = state.settings;
    const dev = state.dev;
    state = defaultState();
    state.profile = profile;
    state.settings = settings;
    state.dev = dev;
    if (!keepCompletionInProfile) saveState();
  }

  function toggleSetting(key) {
    if (!(key in state.settings)) return;
    state.settings[key] = !state.settings[key];
    saveState();
    render();
  }

  function toggleDevSetting(key) {
    if (!(key in state.dev)) return;
    state.dev[key] = !state.dev[key];
    saveState();
    render();
  }

  function disableDevMode() {
    state.dev.enabled = false;
    saveState();
    render();
  }

  async function shareResult() {
    const stats = getCompletionStats();
    const text = `I completed ${TRAIL.name} in ${formatDuration(stats.timeMs)} with ${stats.cluesFound} clues solved.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: TRAIL.appName, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showToast("Result copied.");
    } catch (error) {
      showToast("Share cancelled.");
    }
  }

  function getLocation(id) {
    return TRAIL.locations.find((loc) => loc.id === id);
  }

  function getDefaultLocationId() {
    const unsolved = TRAIL.locations.find((loc) => !state.trail.solvedLocationIds.includes(loc.id));
    return (unsolved || TRAIL.locations[0]).id;
  }

  function ensureSelectedLocation() {
    if (!runtime.selectedLocationId || !getLocation(runtime.selectedLocationId)) {
      runtime.selectedLocationId = runtime.params.id || getDefaultLocationId();
    }
  }

  function getTrailStatus() {
    if (state.trail.completedAt) return { label: "Completed", className: "status-pill--done" };
    if (state.trail.startedAt) return { label: "In progress", className: "status-pill--progress" };
    return { label: "Not started", className: "" };
  }

  function getProgress() {
    const falsePlaces = getFalsePlaces();
    const eliminatedFalse = state.trail.eliminated.filter((place) => falsePlaces.includes(place)).length;
    return {
      solved: state.trail.solvedLocationIds.length,
      eliminatedFalse,
      falseRemaining: Math.max(0, falsePlaces.length - eliminatedFalse)
    };
  }

  function getFalsePlaces() {
    return TRAIL.possibleHidingPlaces.filter((place) => place !== TRAIL.correctFinalHidingPlace);
  }

  function getRemainingPlaces() {
    return TRAIL.possibleHidingPlaces.filter((place) => !state.trail.eliminated.includes(place));
  }

  function isFinalReady() {
    const remaining = getRemainingPlaces();
    return remaining.length === 1 && normaliseAnswer(remaining[0]) === normaliseAnswer(TRAIL.correctFinalHidingPlace);
  }

  function isSolved(id) {
    return state.trail.solvedLocationIds.includes(id);
  }

  function isUnlocked(id) {
    return state.trail.unlockedLocationIds.includes(id);
  }

  function canOpenScanner(loc) {
    if (state.dev.enabled && state.dev.bypassGps) return true;
    if (!runtime.currentPosition) return false;
    return distanceMeters(runtime.currentPosition, loc.gps) <= loc.radiusM;
  }

  function getPinState(loc) {
    if (isSolved(loc.id)) return "is-completed";
    if (isUnlocked(loc.id)) return "is-unlocked";
    if (canOpenScanner(loc)) return "is-available";
    if (runtime.currentPosition && distanceMeters(runtime.currentPosition, loc.gps) <= loc.radiusM * 1.5) return "is-nearby";
    return "is-unvisited";
  }

  function locationStateText(loc) {
    if (isSolved(loc.id)) return loc.eliminates ? `Solved. Eliminated ${loc.eliminates}.` : "Solved. Final crossing confirmed.";
    if (isUnlocked(loc.id)) return "Clue unlocked. Solve the riddle.";
    if (canOpenScanner(loc)) return "Scanner available.";
    if (runtime.currentPosition) return "Too far away.";
    return "Check your location to unlock the scanner.";
  }

  function getGpsStatus(loc) {
    if (isSolved(loc.id)) return { title: "Clue solved", detail: "This location is complete." };
    if (isUnlocked(loc.id)) return { title: "View clue if unlocked", detail: "The scan is complete." };
    if (canOpenScanner(loc)) return { title: "Scanner available", detail: "You are inside the GPS radius." };
    if (runtime.currentPosition && distanceMeters(runtime.currentPosition, loc.gps) <= loc.radiusM * 1.5) {
      return { title: "You are nearby", detail: "Move a little closer to unlock the scanner." };
    }
    return { title: "Too far away", detail: "Check location when you reach the public clue area." };
  }

  function getDistanceLabel(loc) {
    if (state.dev.enabled && state.dev.bypassGps) return "0m (dev bypass)";
    if (!runtime.currentPosition) return "unknown";
    const distance = distanceMeters(runtime.currentPosition, loc.gps);
    return distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${Math.round(distance)}m`;
  }

  function distanceMeters(a, b) {
    const earth = 6371000;
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function toRad(value) {
    return value * Math.PI / 180;
  }

  function friendlyGeoError(error) {
    if (error.code === error.PERMISSION_DENIED) return "Location permission was blocked. Enable location in your browser settings, or use dev mode while testing.";
    if (error.code === error.POSITION_UNAVAILABLE) return "Your location is unavailable right now. Try stepping outside or checking mobile GPS.";
    if (error.code === error.TIMEOUT) return "Location check timed out. Try again with a clearer view of the sky.";
    return "Location check failed. Try again.";
  }

  async function startScanner(loc) {
    runtime.scanner = {
      locationId: loc.id,
      stream: null,
      referenceImage: null,
      referenceMissing: false
    };
    updateScannerResult("Loading scanner...", "neutral");

    const referencePromise = loadReferenceImage(loc.triggerFile)
      .then((image) => {
        if (!runtime.scanner || runtime.scanner.locationId !== loc.id) return;
        runtime.scanner.referenceImage = image;
        updateScannerResult("Reference ready. Hold steady and capture.", "neutral");
      })
      .catch(() => {
        if (!runtime.scanner || runtime.scanner.locationId !== loc.id) return;
        runtime.scanner.referenceMissing = true;
        updateScannerResult("Trigger image missing. Add this file to /assets/triggers/bidford/", "fail");
      });

    const cameraPromise = openCamera()
      .then((stream) => {
        if (!runtime.scanner || runtime.scanner.locationId !== loc.id) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        runtime.scanner.stream = stream;
        const video = document.getElementById("cameraView");
        const fallback = document.getElementById("cameraFallback");
        if (video) video.srcObject = stream;
        if (fallback) fallback.style.display = "none";
      })
      .catch((error) => {
        const fallback = document.getElementById("cameraFallback");
        if (fallback) fallback.innerHTML = `<p>${escapeHtml(friendlyCameraError(error))}</p>`;
        updateScannerResult(friendlyCameraError(error), "fail");
      });

    await Promise.allSettled([referencePromise, cameraPromise]);
    if (runtime.scanner && runtime.scanner.locationId === loc.id && runtime.scanner.referenceMissing) {
      updateScannerResult("Trigger image missing. Add this file to /assets/triggers/bidford/", "fail");
    }
    refreshScannerDebug(loc);
  }

  function stopScanner() {
    if (runtime.scanner && runtime.scanner.stream) {
      runtime.scanner.stream.getTracks().forEach((track) => track.stop());
    }
    runtime.scanner = null;
  }

  async function retryScanner(id) {
    const loc = getLocation(id);
    if (!loc) return;
    stopScanner();
    render();
  }

  async function captureScan(id) {
    const loc = getLocation(id);
    if (!loc) return;

    if (state.dev.enabled && state.dev.bypassScanner) {
      unlockClue(id, true);
      return;
    }

    if (!runtime.scanner) {
      updateScannerResult("Scanner is not ready yet.", "fail");
      return;
    }

    if (runtime.scanner.referenceMissing || !runtime.scanner.referenceImage) {
      updateScannerResult("Trigger image missing. Add this file to /assets/triggers/bidford/", "fail");
      refreshScannerDebug(loc);
      return;
    }

    const video = document.getElementById("cameraView");
    const canvas = document.getElementById("captureCanvas");
    if (!video || !canvas || !video.videoWidth) {
      updateScannerResult("Camera is still warming up. Try again in a moment.", "fail");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    updateScannerResult("Comparing local image features...", "neutral");

    try {
      const details = compareImages(canvas, runtime.scanner.referenceImage);
      const confidence = Math.round(details.confidence);
      state.dev.lastConfidence = confidence;
      saveState();
      refreshScannerDebug(loc, details);

      if (confidence >= (loc.matchThreshold || TRAIL.matchThreshold)) {
        updateScannerResult(`Object matched. Confidence ${confidence}/100.`, "success");
        setTimeout(() => unlockClue(id, false), 700);
      } else {
        const message = failureMessage(confidence);
        updateScannerResult(`${message}. Confidence ${confidence}/100.`, "fail");
        vibrate([35, 30, 35]);
      }
    } catch (error) {
      console.warn("Image comparison failed", error);
      updateScannerResult("Image comparison failed. Try again with better lighting.", "fail");
    }
  }

  function loadReferenceImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) reject(new Error("Reference image could not be read"));
        else resolve(image);
      };
      image.onerror = reject;
      image.src = `${src}?v=1`;
    });
  }

  function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.reject(new Error("getUserMedia unavailable"));
    }
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
  }

  function friendlyCameraError(error) {
    if (!window.isSecureContext && location.protocol !== "file:") {
      return "Camera access needs HTTPS. GitHub Pages uses HTTPS, so upload the app or test with a local HTTPS server.";
    }
    if (error && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
      return "Camera permission was blocked. Enable camera access in your browser settings.";
    }
    if (error && error.name === "NotFoundError") return "No camera was found on this device.";
    return "Camera access failed. Try another browser or use dev mode while testing.";
  }

  function updateScannerResult(message, type) {
    const result = document.getElementById("scanResult");
    if (!result) return;
    result.className = `scan-result is-visible ${type === "success" ? "is-success" : type === "fail" ? "is-fail" : ""}`;
    const badge = type === "success" ? "check" : type === "fail" ? "x" : "compass";
    result.innerHTML = `${icon(badge)}<strong>${escapeHtml(message)}</strong>`;
  }

  function refreshScannerDebug(loc, details) {
    if (!state.dev.enabled) return;
    const debug = document.getElementById("scannerDebug");
    if (!debug) return;
    const extra = details
      ? `<span>Hash: <code>${Math.round(details.hash)}</code>, edges: <code>${Math.round(details.edges)}</code>, colour: <code>${Math.round(details.color)}</code></span>`
      : "";
    debug.innerHTML = `${renderScannerDebug(loc)}${extra}`;
  }

  function failureMessage(confidence) {
    if (confidence < 34) return "Wrong object";
    if (confidence < 54) return "Try better lighting";
    return "Move closer";
  }

  function compareImages(captureCanvas, referenceImage) {
    const captureHash = dHash(captureCanvas);
    const referenceHash = dHash(referenceImage);
    const hash = (1 - hammingDistance(captureHash, referenceHash) / captureHash.length) * 100;
    const edges = edgeSimilarity(captureCanvas, referenceImage);
    const color = colorSimilarity(captureCanvas, referenceImage);
    const confidence = clamp(hash * .42 + edges * .34 + color * .24, 0, 100);
    return { confidence, hash, edges, color };
  }

  function dHash(source) {
    const { data } = imageData(source, 9, 8);
    const gray = [];
    for (let i = 0; i < data.length; i += 4) {
      gray.push(data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114);
    }
    const bits = [];
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        bits.push(gray[y * 9 + x] > gray[y * 9 + x + 1] ? 1 : 0);
      }
    }
    return bits;
  }

  function hammingDistance(a, b) {
    let distance = 0;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) distance += 1;
    }
    return distance;
  }

  function edgeSimilarity(a, b) {
    const grayA = grayscale(imageData(a, 48, 48).data);
    const grayB = grayscale(imageData(b, 48, 48).data);
    const edgeA = sobel(grayA, 48, 48);
    const edgeB = sobel(grayB, 48, 48);
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < edgeA.length; i += 1) {
      dot += edgeA[i] * edgeB[i];
      magA += edgeA[i] * edgeA[i];
      magB += edgeB[i] * edgeB[i];
    }
    if (!magA || !magB) return 0;
    return clamp((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100, 0, 100);
  }

  function colorSimilarity(a, b) {
    const histA = chromaHistogram(imageData(a, 36, 36).data);
    const histB = chromaHistogram(imageData(b, 36, 36).data);
    let intersection = 0;
    for (let i = 0; i < histA.length; i += 1) {
      intersection += Math.min(histA[i], histB[i]);
    }
    return clamp(intersection * 100, 0, 100);
  }

  function imageData(source, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  }

  function grayscale(data) {
    const gray = new Float32Array(data.length / 4);
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      gray[p] = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114;
    }
    return gray;
  }

  function sobel(gray, width, height) {
    const out = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = y * width + x;
        const gx =
          -gray[i - width - 1] + gray[i - width + 1] -
          2 * gray[i - 1] + 2 * gray[i + 1] -
          gray[i + width - 1] + gray[i + width + 1];
        const gy =
          -gray[i - width - 1] - 2 * gray[i - width] - gray[i - width + 1] +
          gray[i + width - 1] + 2 * gray[i + width] + gray[i + width + 1];
        out[i] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    return out;
  }

  function chromaHistogram(data) {
    const bins = new Float32Array(64);
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const sum = r + g + b + 1;
      const rb = Math.min(3, Math.floor((r / sum) * 4));
      const gb = Math.min(3, Math.floor((g / sum) * 4));
      const bb = Math.min(3, Math.floor((b / sum) * 4));
      bins[rb * 16 + gb * 4 + bb] += 1;
      total += 1;
    }
    if (!total) return bins;
    for (let i = 0; i < bins.length; i += 1) bins[i] /= total;
    return bins;
  }

  function normaliseAnswer(value) {
    return String(value)
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function answerMatches(answer, accepted) {
    const normal = normaliseAnswer(answer);
    return accepted.some((candidate) => normaliseAnswer(candidate) === normal);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getCompletionStats() {
    return state.trail.completionStats || {
      cluesFound: state.trail.solvedLocationIds.length,
      timeMs: state.trail.startedAt ? Date.now() - new Date(state.trail.startedAt).getTime() : 0,
      hintsUsed: Object.keys(state.trail.hintsUsed).length,
      completedAt: state.trail.completedAt || new Date().toISOString()
    };
  }

  function getProfileStats() {
    return {
      trailsCompleted: state.profile.stats.trailsCompleted,
      cluesSolved: state.profile.stats.cluesSolved + (state.trail.completedAt ? 0 : state.trail.solvedLocationIds.length),
      hintsUsed: state.profile.stats.hintsUsed + (state.trail.completedAt ? 0 : Object.keys(state.trail.hintsUsed).length),
      bestTimeMs: state.profile.stats.bestTimeMs
    };
  }

  function formatDuration(ms) {
    if (!ms || ms < 0) return "0m";
    const minutes = Math.max(1, Math.round(ms / 60000));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function formatDate(iso) {
    if (!iso) return "Not yet";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
  }

  function fileName(path) {
    return path.split("/").pop();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function vibrate(pattern) {
    if (state.settings.vibration && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }

  function showToast(message) {
    clearTimeout(runtime.toastTimer);
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    runtime.toastTimer = setTimeout(() => toast.remove(), 2600);
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch((error) => console.warn("Service worker registration failed", error));
    }
  }

  function locationArt(type) {
    const common = `
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4aa0a8"/><stop offset="1" stop-color="#123248"/></linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2e8194"/><stop offset="1" stop-color="#74c2c7"/></linearGradient>
      </defs>
      <rect width="360" height="190" fill="url(#sky)"/>
      <path d="M0 142c56-24 107-18 154-7 62 14 122 6 206-30v85H0z" fill="url(#water)"/>
      <path d="M0 160c60-13 106-9 151 1 57 13 123 12 209-11v40H0z" fill="#1a4e60" opacity=".6"/>
    `;
    const art = {
      bridge: `<path d="M42 116c50-30 106-30 158 0 43-26 82-27 118 0v21H42z" fill="#d8c8a5" stroke="#6b421f" stroke-width="7"/><path d="M75 137c7-27 29-27 36 0M154 137c7-27 29-27 36 0M232 137c7-27 29-27 36 0" fill="#215c70" stroke="#6b421f" stroke-width="6"/><path d="M40 102h280" stroke="#6b421f" stroke-width="8"/>`,
      church: `<path d="M128 130V74l40-28 42 28v56z" fill="#8b6740" stroke="#5c361b" stroke-width="7"/><path d="M170 130V44h35v86z" fill="#6f472a" stroke="#5c361b" stroke-width="7"/><path d="M188 19v25M175 32h26" stroke="#5c361b" stroke-width="7" stroke-linecap="round"/><path d="M0 142c88-20 178-24 360 0v48H0z" fill="#2c6d48"/>`,
      memorial: `<path d="M162 66h36v72h-36z" fill="#7a6c5f" stroke="#40342d" stroke-width="6"/><path d="M141 138h78v20h-78zM153 46h54v20h-54z" fill="#6a5b50" stroke="#40342d" stroke-width="6"/><path d="M180 23v24M168 35h24" stroke="#40342d" stroke-width="7" stroke-linecap="round"/><path d="M0 151h360v39H0z" fill="#3b6640"/>`,
      meadow: `<path d="M0 117c72-20 143-25 211-2 53 18 98 15 149 0v75H0z" fill="#3f8d4c"/><path d="M45 127c16-18 32-18 47 0M222 127c16-18 32-18 47 0" fill="none" stroke="#1e5f38" stroke-width="8" stroke-linecap="round"/><rect x="126" y="70" width="104" height="43" rx="7" fill="#f2d89d" stroke="#6b421f" stroke-width="6"/><path d="M141 88h73" stroke="#6b421f" stroke-width="6" stroke-linecap="round"/>`,
      river: `<path d="M0 113c61-24 120-15 173 5 66 25 119 16 187-22v94H0z" fill="url(#water)"/><path d="M99 86h146" stroke="#6b421f" stroke-width="8" stroke-linecap="round"/><path d="M121 74v33M222 74v33" stroke="#6b421f" stroke-width="7"/><circle cx="258" cy="80" r="16" fill="#d8a24b" stroke="#6b421f" stroke-width="5"/>`,
      street: `<path d="M0 146h360v44H0z" fill="#5f574e"/><path d="M70 84h68v62H70zM158 65h64v81h-64zM241 91h55v55h-55z" fill="#7b4a24" stroke="#5c361b" stroke-width="6"/><path d="M50 146c77-24 178-24 260 0" fill="none" stroke="#d8c8a5" stroke-width="18" stroke-linecap="round"/>`
    };
    return `<svg viewBox="0 0 360 190" role="img" aria-label="${escapeHtml(type)} illustration">${common}${art[type] || art.bridge}</svg>`;
  }

  function icon(name) {
    const paths = {
      home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" fill="currentColor"/>',
      map: '<path d="M4 5l5-2 6 2 5-2v16l-5 2-6-2-5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 3v16M15 5v16" stroke="currentColor" stroke-width="2"/>',
      board: '<path d="M5 4h14v16H5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 6H5a3 3 0 0 0 3 5M16 6h3a3 3 0 0 1-3 5M12 12v5M9 20h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      compass: '<path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor"/>',
      warning: '<path d="M12 3l10 18H2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      pin: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/>',
      check: '<path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>',
      x: '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>',
      camera: '<path d="M4 8h4l2-3h4l2 3h4v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="14" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
      back: '<path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    };
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.compass}</svg>`;
  }
})();
