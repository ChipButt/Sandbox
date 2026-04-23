(function () {
  "use strict";

  class MiniGameBase {
    constructor(root, options) {
      this.root = root;
      this.options = Object.assign({
        title: "Mini Game",
        source: "mini-game",
        instructions: "",
        controlsHtml: "",
        backgroundClass: ""
      }, options || {});
      this.destroyed = false;
      this.state = "idle";
      this.rafId = 0;
      this.lastTime = 0;
      this.cleanupFns = [];
      this.renderShell();
      this.cacheDom();
      this.bindCommon();
      this.resize();
    }

    renderShell() {
      this.root.innerHTML = `
        <div class="mg-shell ${this.options.backgroundClass}">
          <canvas class="mg-canvas" aria-label="${this.options.title}"></canvas>
          <div class="mg-stage"></div>

          <div class="mg-topbar">
            <button type="button" class="mg-button mg-exit">Return to menu</button>
            <div class="mg-status">
              <div class="mg-status-title">${this.options.title}</div>
              <div class="mg-status-main">Ready</div>
              <div class="mg-status-sub">Press Start when you're ready.</div>
            </div>
          </div>

          <div class="mg-note" hidden></div>
          <div class="mg-flash"></div>

          <div class="mg-overlay">
            <div class="mg-overlay-card">
              <h1 class="mg-overlay-title">${this.options.title}</h1>
              <p class="mg-overlay-copy">${this.options.instructions}</p>
              <div class="mg-overlay-actions">
                <button type="button" class="mg-button mg-start">Start</button>
              </div>
            </div>
          </div>

          <div class="mg-popup" hidden>
            <div class="mg-popup-card">
              <h2 class="mg-popup-title">Resetting</h2>
              <p class="mg-popup-copy">Back to the start...</p>
            </div>
          </div>

          <div class="mg-finish" hidden>
            <div class="mg-finish-card">
              <h2 class="mg-finish-title">Nice work</h2>
              <p class="mg-finish-copy">Mini-game complete.</p>
              <div class="mg-finish-actions">
                <button type="button" class="mg-button mg-finish-btn">✓ Return to menu</button>
              </div>
            </div>
          </div>

          <div class="mg-bottom">
            <div class="mg-controls">${this.options.controlsHtml || ""}</div>
          </div>
        </div>
      `;
    }

    cacheDom() {
      this.shell = this.root.querySelector(".mg-shell");
      this.canvas = this.root.querySelector(".mg-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.stage = this.root.querySelector(".mg-stage");
      this.exitBtn = this.root.querySelector(".mg-exit");
      this.startBtn = this.root.querySelector(".mg-start");
      this.finishBtn = this.root.querySelector(".mg-finish-btn");
      this.statusMainEl = this.root.querySelector(".mg-status-main");
      this.statusSubEl = this.root.querySelector(".mg-status-sub");
      this.noteEl = this.root.querySelector(".mg-note");
      this.flashEl = this.root.querySelector(".mg-flash");
      this.overlayEl = this.root.querySelector(".mg-overlay");
      this.popupEl = this.root.querySelector(".mg-popup");
      this.popupTitleEl = this.root.querySelector(".mg-popup-title");
      this.popupCopyEl = this.root.querySelector(".mg-popup-copy");
      this.finishEl = this.root.querySelector(".mg-finish");
      this.finishTitleEl = this.root.querySelector(".mg-finish-title");
      this.finishCopyEl = this.root.querySelector(".mg-finish-copy");
      this.controlsEl = this.root.querySelector(".mg-controls");
    }

    bindCommon() {
      this.handleResize = () => this.resize();
      this.handleKeyDown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          this.exit("quit");
          return;
        }
        if (this.onKeyDown) this.onKeyDown(event);
      };
      this.handleKeyUp = (event) => {
        if (this.onKeyUp) this.onKeyUp(event);
      };
      this.handleVisibility = () => {
        if (document.hidden && this.onVisibilityPause) {
          this.onVisibilityPause();
        }
      };

      window.addEventListener("resize", this.handleResize);
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);
      document.addEventListener("visibilitychange", this.handleVisibility);

      this.exitBtn.addEventListener("click", () => this.exit("quit"));
      this.startBtn.addEventListener("click", () => this.begin());
      this.finishBtn.addEventListener("click", () => this.exit("win"));
    }

    addCleanup(fn) {
      this.cleanupFns.push(fn);
    }

    bindHoldButton(button, onChange) {
      const setPressed = (pressed) => {
        onChange(pressed);
        button.classList.toggle("is-active", pressed);
      };
      const down = (event) => {
        event.preventDefault();
        if (button.setPointerCapture) {
          try { button.setPointerCapture(event.pointerId); } catch (e) {}
        }
        setPressed(true);
      };
      const up = () => setPressed(false);
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("pointerleave", up);
      button.addEventListener("lostpointercapture", up);
    }

    begin() {
      if (this.destroyed) return;
      this.overlayEl.hidden = true;
      this.finishEl.hidden = true;
      this.popupEl.hidden = true;
      this.noteEl.hidden = true;
      this.state = "running";
      this.lastTime = performance.now();
      if (this.resetGame) this.resetGame();
      if (this.onStart) this.onStart();
      this.postToParent("started", {});
      if (!this.rafId) {
        this.rafId = requestAnimationFrame((t) => this.loop(t));
      }
    }

    resize() {
      const rect = this.shell.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = Math.max(320, Math.round(rect.width));
      this.height = Math.max(480, Math.round(rect.height));
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this.onResize) this.onResize();
    }

    loop(timestamp) {
      if (this.destroyed) return;
      const dt = Math.min(0.033, (timestamp - this.lastTime) / 1000 || 0.016);
      this.lastTime = timestamp;
      if (this.state === "running" && this.updateGame) {
        this.updateGame(dt);
      }
      if (this.renderGame) {
        this.renderGame(this.ctx);
      } else {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    setStatus(main, sub) {
      this.statusMainEl.textContent = main;
      this.statusSubEl.textContent = sub;
    }

    showNote(text, ms) {
      this.noteEl.textContent = text;
      this.noteEl.hidden = false;
      clearTimeout(this.noteTimeout);
      if (ms) {
        this.noteTimeout = setTimeout(() => {
          this.noteEl.hidden = true;
        }, ms);
      }
    }

    flash(color, duration) {
      if (color) this.flashEl.style.background = color;
      this.flashEl.classList.add("is-on");
      clearTimeout(this.flashTimer);
      this.flashTimer = setTimeout(() => {
        this.flashEl.classList.remove("is-on");
      }, duration || 180);
    }

    failAndReset(title, copy, delay) {
      if (this.state !== "running") return;
      this.state = "resetting";
      this.popupTitleEl.textContent = title || "Failed";
      this.popupCopyEl.textContent = copy || "Resetting back to the start...";
      this.popupEl.hidden = false;
      const total = delay || 950;
      let flips = 0;
      clearInterval(this.failBlinkInterval);
      this.failBlinkInterval = setInterval(() => {
        this.flashEl.classList.toggle("is-on");
        flips += 1;
        if (flips > 6) {
          clearInterval(this.failBlinkInterval);
          this.flashEl.classList.remove("is-on");
        }
      }, 120);
      clearTimeout(this.failTimer);
      this.failTimer = setTimeout(() => {
        this.popupEl.hidden = true;
        this.flashEl.classList.remove("is-on");
        if (this.resetGame) this.resetGame();
        this.state = "running";
      }, total);
      this.postToParent("failed", { title, copy });
    }

    win(title, copy) {
      if (this.state === "won") return;
      this.state = "won";
      this.finishTitleEl.textContent = title || "Congratulations";
      this.finishCopyEl.textContent = copy || "You've completed the mini-game.";
      this.finishEl.hidden = false;
      this.postToParent("won", {});
    }

    postToParent(type, extra) {
      const payload = Object.assign({
        source: this.options.source,
        type
      }, extra || {});
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }
      if (typeof this.options.onEvent === "function") {
        this.options.onEvent(payload);
      }
    }

    exit(reason) {
      this.postToParent("exit", { reason });
      this.destroy();
      if (window.parent === window) {
        this.root.innerHTML = `
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#05070b;color:#f2f7ff;padding:24px;text-align:center;font-family:Trebuchet MS,Arial,sans-serif;">
            <div>
              <h2 style="margin:0 0 10px;">Mini-game closed</h2>
              <p style="margin:0;opacity:.84;">In your main app, this is where control would return to the parent menu.</p>
            </div>
          </div>
        `;
      }
    }

    destroy() {
      this.destroyed = true;
      cancelAnimationFrame(this.rafId);
      clearTimeout(this.noteTimeout);
      clearTimeout(this.flashTimer);
      clearTimeout(this.failTimer);
      clearInterval(this.failBlinkInterval);
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("keyup", this.handleKeyUp);
      document.removeEventListener("visibilitychange", this.handleVisibility);
      for (const fn of this.cleanupFns) {
        try { fn(); } catch (e) {}
      }
    }

    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    lerp(a, b, t) {
      return a + (b - a) * this.clamp(t, 0, 1);
    }

    rand(min, max) {
      return min + Math.random() * (max - min);
    }

    pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }
  }

  window.MiniGameBase = MiniGameBase;
})();