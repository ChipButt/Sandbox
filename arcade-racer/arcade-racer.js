(function () {
  "use strict";

  class ArcadeRacerGame {
    constructor(root, options = {}) {
      this.root = root;
      this.options = options;
      this.destroyed = false;

      this.trackPieces = [
        { length: 900, curve: 0.0 },
        { length: 900, curve: 0.68 },
        { length: 700, curve: 0.0 },
        { length: 1100, curve: -0.82 },
        { length: 900, curve: 0.0 },
        { length: 900, curve: 0.58 },
        { length: 700, curve: 0.0 },
        { length: 1150, curve: -0.94 },
        { length: 1100, curve: 0.0 },
      ];

      this.trackLength = this.trackPieces.reduce((sum, piece) => sum + piece.length, 0);
      this.lookAhead = 3600;
      this.baseSpeed = 180;
      this.maxSpeed = 430;
      this.speed = this.baseSpeed;
      this.distance = 0;
      this.playerOffset = 0;
      this.lateralVelocity = 0;
      this.steerValue = 0;
      this.steerTarget = 0;
      this.pointerSteer = 0;
      this.pointerActive = false;
      this.turnLeftPressed = false;
      this.turnRightPressed = false;
      this.accelPressed = false;
      this.keys = { left: false, right: false, accel: false };
      this.state = "countdown";
      this.messageTimeout = 0;
      this.crashTimer = 0;
      this.countdownTimer = 3;
      this.countdownDisplay = "3";
      this.flashVisible = false;
      this.rafId = 0;
      this.lastTime = 0;
      this.resizeQueued = false;

      this.renderShell();
      this.cacheDom();
      this.bindEvents();
      this.resize();
      this.updateUi();
      this.postToParent("ready", { trackLength: this.trackLength });
      this.start();
    }

    renderShell() {
      this.root.innerHTML = `
        <div class="ar-game">
          <canvas class="ar-canvas" aria-label="Arcade racer game"></canvas>

          <div class="ar-topbar">
            <button type="button" class="ar-button ar-exit">Return to menu</button>
            <div class="ar-status">
              <div class="ar-status-row">
                <span>Progress</span>
                <span class="ar-progress-text">0%</span>
              </div>
              <div class="ar-meter">
                <div class="ar-meter-fill"></div>
              </div>
              <div class="ar-status-row">
                <span class="ar-state-text">Race starting</span>
                <span class="ar-speed-text">180 mph</span>
              </div>
            </div>
          </div>

          <div class="ar-crash-flash"></div>

          <div class="ar-message" hidden>
            <div class="ar-message-inner">
              <h2 class="ar-message-title">Crash!</h2>
              <p class="ar-message-copy">Resetting back to the start...</p>
            </div>
          </div>

          <div class="ar-countdown">
            <div class="ar-countdown-inner">3</div>
          </div>

          <div class="ar-win-screen" hidden>
            <div class="ar-win-inner">
              <h2 class="ar-win-title">Congratulations, you've won the race</h2>
              <p class="ar-win-copy">Tap the tick button to return back to the menu.</p>
              <div class="ar-win-actions">
                <button type="button" class="ar-button ar-finish">✓ Return to menu</button>
              </div>
            </div>
          </div>

          <div class="ar-bottom">
            <div class="ar-wheel-panel">
              <div class="ar-controls-caption">
                <span>Steer</span>
                <span>Drag wheel or use arrows</span>
              </div>
              <div class="ar-wheel-row">
                <button type="button" class="ar-button ar-turn ar-left" aria-label="Steer left">◀</button>
                <div class="ar-wheel-wrap">
                  <div class="ar-wheel" aria-label="Steering wheel" role="slider" aria-valuemin="-1" aria-valuemax="1" aria-valuenow="0">
                    <div class="ar-wheel-core"></div>
                  </div>
                </div>
                <button type="button" class="ar-button ar-turn ar-right" aria-label="Steer right">▶</button>
              </div>
            </div>

            <div class="ar-pedal-panel">
              <button type="button" class="ar-throttle" aria-label="Accelerate">Accel</button>
            </div>
          </div>
        </div>
      `;
    }

    cacheDom() {
      this.gameEl = this.root.querySelector(".ar-game");
      this.canvas = this.root.querySelector(".ar-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.exitBtn = this.root.querySelector(".ar-exit");
      this.progressText = this.root.querySelector(".ar-progress-text");
      this.progressFill = this.root.querySelector(".ar-meter-fill");
      this.stateText = this.root.querySelector(".ar-state-text");
      this.speedText = this.root.querySelector(".ar-speed-text");
      this.messageEl = this.root.querySelector(".ar-message");
      this.messageTitleEl = this.root.querySelector(".ar-message-title");
      this.messageCopyEl = this.root.querySelector(".ar-message-copy");
      this.countdownEl = this.root.querySelector(".ar-countdown");
      this.countdownValueEl = this.root.querySelector(".ar-countdown-inner");
      this.winEl = this.root.querySelector(".ar-win-screen");
      this.finishBtn = this.root.querySelector(".ar-finish");
      this.flashEl = this.root.querySelector(".ar-crash-flash");
      this.wheelEl = this.root.querySelector(".ar-wheel");
      this.leftBtn = this.root.querySelector(".ar-left");
      this.rightBtn = this.root.querySelector(".ar-right");
      this.throttleBtn = this.root.querySelector(".ar-throttle");
    }

    bindEvents() {
      this.onResize = () => this.resize();
      this.onKeyDown = (event) => this.handleKey(event, true);
      this.onKeyUp = (event) => this.handleKey(event, false);
      this.onVisibility = () => {
        if (document.hidden && this.state === "running") {
          this.accelPressed = false;
          this.keys.accel = false;
          this.keys.left = false;
          this.keys.right = false;
          this.turnLeftPressed = false;
          this.turnRightPressed = false;
          this.pointerActive = false;
          this.pointerSteer = 0;
        }
      };

      window.addEventListener("resize", this.onResize);
      window.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("keyup", this.onKeyUp);
      document.addEventListener("visibilitychange", this.onVisibility);

      this.exitBtn.addEventListener("click", () => this.exit("quit"));
      this.finishBtn.addEventListener("click", () => this.exit("win"));

      this.bindHoldButton(this.leftBtn, (pressed) => { this.turnLeftPressed = pressed; });
      this.bindHoldButton(this.rightBtn, (pressed) => { this.turnRightPressed = pressed; });
      this.bindHoldButton(this.throttleBtn, (pressed) => {
        this.accelPressed = pressed;
        this.throttleBtn.classList.toggle("is-active", pressed);
      });

      this.wheelEl.addEventListener("pointerdown", (event) => this.startWheelControl(event));
      this.wheelEl.addEventListener("pointermove", (event) => this.moveWheelControl(event));
      this.wheelEl.addEventListener("pointerup", () => this.endWheelControl());
      this.wheelEl.addEventListener("pointercancel", () => this.endWheelControl());
      this.wheelEl.addEventListener("pointerleave", () => {
        if (!this.pointerActive) {
          this.pointerSteer = 0;
        }
      });
    }

    bindHoldButton(button, onChange) {
      const setPressed = (pressed) => {
        onChange(pressed);
        button.classList.toggle("is-active", pressed);
      };

      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        setPressed(true);
      });

      const release = () => setPressed(false);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
      button.addEventListener("lostpointercapture", release);
    }

    startWheelControl(event) {
      event.preventDefault();
      this.pointerActive = true;
      this.wheelEl.setPointerCapture(event.pointerId);
      this.updateWheelFromPointer(event);
    }

    moveWheelControl(event) {
      if (!this.pointerActive) {
        return;
      }
      this.updateWheelFromPointer(event);
    }

    endWheelControl() {
      this.pointerActive = false;
      this.pointerSteer = 0;
    }

    updateWheelFromPointer(event) {
      const rect = this.wheelEl.getBoundingClientRect();
      const ratio = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerSteer = this.clamp(ratio, -1, 1);
    }

    handleKey(event, pressed) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Escape"].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        this.keys.left = pressed;
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        this.keys.right = pressed;
      }
      if (event.key === "ArrowUp" || event.key === " " || event.key.toLowerCase() === "w") {
        this.keys.accel = pressed;
      }
      if (pressed && event.key === "Escape") {
        this.exit("quit");
      }
    }

    resize() {
      const rect = this.gameEl.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = Math.max(320, Math.round(rect.width));
      this.height = Math.max(480, Math.round(rect.height));
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.horizonY = this.height * 0.26;
    }

    start() {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }

    loop = (timestamp) => {
      if (this.destroyed) {
        return;
      }

      const dt = Math.min(0.033, (timestamp - this.lastTime) / 1000 || 0.016);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();
      this.rafId = window.requestAnimationFrame(this.loop);
    };

    update(dt) {
      if (this.state === "countdown") {
        this.countdownTimer -= dt;
        if (this.countdownTimer <= 0) {
          this.state = "running";
          this.countdownEl.hidden = true;
          this.postToParent("started", {});
        } else {
          const shown = Math.max(1, Math.ceil(this.countdownTimer));
          this.countdownDisplay = String(shown);
          this.countdownValueEl.textContent = this.countdownDisplay;
        }
      }

      if (this.state === "crashed") {
        this.crashTimer -= dt;
        this.flashVisible = Math.floor(this.crashTimer * 12) % 2 === 0;
        this.flashEl.classList.toggle("is-visible", this.flashVisible);

        if (this.crashTimer <= 0) {
          this.resetRace();
        }
        this.updateUi();
        return;
      }

      if (this.state === "won") {
        this.speed = this.lerp(this.speed, 0, dt * 1.6);
        this.updateUi();
        return;
      }

      const buttonSteer = (this.turnRightPressed ? 1 : 0) - (this.turnLeftPressed ? 1 : 0);
      const keySteer = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
      let requestedSteer = this.pointerActive ? this.pointerSteer : 0;
      requestedSteer += buttonSteer * 0.9;
      requestedSteer += keySteer * 0.9;
      this.steerTarget = this.clamp(requestedSteer, -1, 1);

      if (!this.pointerActive && !buttonSteer && !keySteer) {
        this.pointerSteer = 0;
      }

      this.steerValue = this.lerp(this.steerValue, this.steerTarget, dt * 8.5);
      this.wheelEl.style.transform = `rotate(${(this.steerValue * 110).toFixed(1)}deg)`;
      this.wheelEl.setAttribute("aria-valuenow", this.steerValue.toFixed(2));

      const accelerating = this.accelPressed || this.keys.accel;
      const targetSpeed = accelerating ? this.maxSpeed : this.baseSpeed;
      this.speed = this.lerp(this.speed, targetSpeed, dt * (accelerating ? 2.2 : 1.3));

      const curveNow = this.getCurveAt(this.distance + 120);
      const steeringPower = 1.95 * (0.45 + (this.speed / this.maxSpeed) * 0.75);
      this.lateralVelocity += this.steerValue * steeringPower * dt;
      this.lateralVelocity -= curveNow * 0.95 * (this.speed / this.maxSpeed) * dt;
      this.lateralVelocity *= Math.pow(0.08, dt);
      this.playerOffset += this.lateralVelocity * dt;
      this.playerOffset = this.clamp(this.playerOffset, -1.6, 1.6);

      if (this.state === "running") {
        this.distance += this.speed * dt;

        if (Math.abs(this.playerOffset) > 1.02) {
          this.triggerCrash();
          return;
        }

        if (this.distance >= this.trackLength) {
          this.finishRace();
          return;
        }
      }

      this.updateUi();
    }

    triggerCrash() {
      this.state = "crashed";
      this.crashTimer = 1.0;
      this.speed = 0;
      this.messageTitleEl.textContent = "Crash!";
      this.messageCopyEl.textContent = "You went off the track. Resetting back to the start...";
      this.messageEl.hidden = false;
      this.messageEl.classList.add("is-visible");
      this.postToParent("crash", { distance: Math.round(this.distance) });
      this.updateUi();
    }

    resetRace() {
      this.distance = 0;
      this.speed = this.baseSpeed;
      this.playerOffset = 0;
      this.lateralVelocity = 0;
      this.steerValue = 0;
      this.steerTarget = 0;
      this.pointerSteer = 0;
      this.turnLeftPressed = false;
      this.turnRightPressed = false;
      this.accelPressed = false;
      this.flashVisible = false;
      this.flashEl.classList.remove("is-visible");
      this.messageEl.classList.remove("is-visible");
      this.messageEl.hidden = true;
      this.countdownTimer = 3;
      this.countdownDisplay = "3";
      this.countdownValueEl.textContent = this.countdownDisplay;
      this.countdownEl.hidden = false;
      this.state = "countdown";
      this.updateUi();
    }

    finishRace() {
      this.state = "won";
      this.distance = this.trackLength;
      this.winEl.hidden = false;
      this.postToParent("won", { distance: Math.round(this.distance) });
      this.updateUi();
    }

    updateUi() {
      const progress = this.clamp(this.distance / this.trackLength, 0, 1);
      this.progressFill.style.width = `${(progress * 100).toFixed(1)}%`;
      this.progressText.textContent = `${Math.round(progress * 100)}%`;
      this.speedText.textContent = `${Math.round(this.speed)} mph`;

      if (this.state === "countdown") {
        this.stateText.textContent = "Race starting";
      } else if (this.state === "crashed") {
        this.stateText.textContent = "Resetting";
      } else if (this.state === "won") {
        this.stateText.textContent = "Finished";
      } else {
        this.stateText.textContent = "On track";
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const horizon = this.horizonY;

      ctx.clearRect(0, 0, w, h);

      this.drawSky(ctx, w, h, horizon);
      this.drawRoad(ctx, w, h, horizon);
      this.drawDashboard(ctx, w, h);
    }

    drawSky(ctx, w, h, horizon) {
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, "#345d8a");
      sky.addColorStop(0.7, "#2a4362");
      sky.addColorStop(1, "#1c2e44");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, horizon + 2);

      ctx.fillStyle = "rgba(255, 229, 145, 0.9)";
      ctx.beginPath();
      ctx.arc(w * 0.78, horizon * 0.26, Math.max(20, w * 0.04), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#162331";
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(w * 0.12, horizon * 0.64);
      ctx.lineTo(w * 0.28, horizon);
      ctx.lineTo(w * 0.42, horizon * 0.56);
      ctx.lineTo(w * 0.62, horizon);
      ctx.lineTo(w * 0.78, horizon * 0.6);
      ctx.lineTo(w, horizon);
      ctx.closePath();
      ctx.fill();
    }

    drawRoad(ctx, w, h, horizon) {
      const rowHeight = 3;
      let bend = 0;

      for (let y = Math.floor(horizon); y < h; y += rowHeight) {
        const depth = (y - horizon) / (h - horizon);
        const sampleDistance = this.distance + Math.pow(depth, 2.15) * this.lookAhead;
        const curve = this.getCurveAt(sampleDistance);
        bend += curve * (0.0022 + depth * 0.0058);

        const roadHalfWidth = this.lerp(w * 0.06, w * 0.47, depth);
        const cameraShift = this.playerOffset * w * 0.42 * Math.pow(depth, 1.2);
        const roadCenter = w * 0.5 + bend * w * 0.34 - cameraShift;
        const rumbleWidth = roadHalfWidth * 0.14;
        const leftEdge = roadCenter - roadHalfWidth;
        const rightEdge = roadCenter + roadHalfWidth;

        const grassBand = (Math.floor(sampleDistance / 130) % 2 === 0) ? "#1c5e33" : "#216d3b";
        const rumbleBand = (Math.floor(sampleDistance / 90) % 2 === 0) ? "#f6f3eb" : "#dd4d4d";
        const roadBand = (Math.floor(sampleDistance / 170) % 2 === 0) ? "#565f6f" : "#505868";

        ctx.fillStyle = grassBand;
        ctx.fillRect(0, y, w, rowHeight + 1);

        ctx.fillStyle = rumbleBand;
        ctx.fillRect(leftEdge - rumbleWidth, y, rumbleWidth, rowHeight + 1);
        ctx.fillRect(rightEdge, y, rumbleWidth, rowHeight + 1);

        ctx.fillStyle = roadBand;
        ctx.fillRect(leftEdge, y, roadHalfWidth * 2, rowHeight + 1);

        const laneDash = Math.floor((sampleDistance + this.distance * 0.9) / 170) % 2 === 0;
        if (laneDash && depth > 0.12) {
          const markerWidth = this.lerp(2, 10, depth);
          const markerHeight = rowHeight + 1;
          ctx.fillStyle = "rgba(245, 245, 245, 0.95)";
          ctx.fillRect(roadCenter - markerWidth / 2, y, markerWidth, markerHeight);
        }
      }
    }

    drawDashboard(ctx, w, h) {
      const carVisible = this.state !== "crashed" || this.flashVisible;
      const dashTop = h * 0.78;
      const hoodTop = h * 0.82;

      ctx.fillStyle = "rgba(7, 10, 15, 0.86)";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, dashTop + 16);
      ctx.lineTo(w * 0.12, dashTop);
      ctx.lineTo(w * 0.88, dashTop);
      ctx.lineTo(w, dashTop + 16);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(w * 0.18, h * 0.81, w * 0.64, 3);

      if (carVisible) {
        ctx.fillStyle = this.state === "crashed" ? "#ffd2d2" : "#d83e3e";
        ctx.beginPath();
        ctx.moveTo(w * 0.26, h);
        ctx.lineTo(w * 0.34, hoodTop);
        ctx.lineTo(w * 0.66, hoodTop);
        ctx.lineTo(w * 0.74, h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        ctx.beginPath();
        ctx.moveTo(w * 0.38, hoodTop + 12);
        ctx.lineTo(w * 0.5, hoodTop + 4);
        ctx.lineTo(w * 0.62, hoodTop + 12);
        ctx.lineTo(w * 0.6, hoodTop + 20);
        ctx.lineTo(w * 0.4, hoodTop + 20);
        ctx.closePath();
        ctx.fill();
      }

      const dialY = h * 0.86;
      ctx.fillStyle = "rgba(143, 243, 184, 0.95)";
      for (let i = 0; i < 6; i += 1) {
        ctx.fillRect(w * 0.28 + i * (w * 0.055), dialY, w * 0.032, 8);
      }
    }

    getCurveAt(distance) {
      let travelled = 0;
      let previousCurve = 0;

      for (let i = 0; i < this.trackPieces.length; i += 1) {
        const piece = this.trackPieces[i];
        const nextTravel = travelled + piece.length;
        if (distance <= nextTravel) {
          const t = this.clamp((distance - travelled) / piece.length, 0, 1);
          return this.easeInOut(previousCurve, piece.curve, t);
        }
        travelled = nextTravel;
        previousCurve = piece.curve;
      }

      return 0;
    }

    easeInOut(from, to, t) {
      const eased = t * t * (3 - 2 * t);
      return from + (to - from) * eased;
    }

    lerp(from, to, amount) {
      return from + (to - from) * this.clamp(amount, 0, 1);
    }

    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    exit(reason) {
      if (this.destroyed) {
        return;
      }
      this.postToParent("exit", { reason });
      if (typeof this.options.onExit === "function") {
        this.options.onExit({ reason });
      }
      this.destroy();
    }

    postToParent(type, extra = {}) {
      const payload = {
        source: "arcade-racer",
        type,
        ...extra,
      };

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }

      if (typeof this.options.onEvent === "function") {
        this.options.onEvent(payload);
      }
    }

    destroy() {
      this.destroyed = true;
      window.cancelAnimationFrame(this.rafId);
      window.removeEventListener("resize", this.onResize);
      window.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("keyup", this.onKeyUp);
      document.removeEventListener("visibilitychange", this.onVisibility);
      this.root.innerHTML = "";
    }
  }

  function bootStandalone() {
    const root = document.getElementById("arcade-racer-root");
    if (!root) {
      return;
    }

    if (window.__arcadeRacerGame && typeof window.__arcadeRacerGame.destroy === "function") {
      window.__arcadeRacerGame.destroy();
    }

    window.__arcadeRacerGame = new ArcadeRacerGame(root, {
      onExit: () => {
        if (window.parent === window) {
          root.innerHTML = `
            <div style="
              width:100%;height:100%;display:flex;align-items:center;justify-content:center;
              background:#05070b;color:#f2f6ff;font-family:Courier New,monospace;padding:20px;text-align:center;
            ">
              <div>
                <h2 style="margin:0 0 10px;">Mini-game closed</h2>
                <p style="margin:0;opacity:0.85;">In your main app, this is where your own code would take back over.</p>
              </div>
            </div>
          `;
        }
      },
    });
  }

  window.ArcadeRacerGame = ArcadeRacerGame;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootStandalone, { once: true });
  } else {
    bootStandalone();
  }
})();
