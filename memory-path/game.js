(function () {
  class MemoryPathGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Memory Path",
        source: "memory-path",
        instructions: "Watch the route light up, then tap the tiles back in the same order. Clear three rounds to finish. A wrong tap resets the challenge.",
        controlsHtml: `<div style="padding:6px 10px;color:rgba(255,255,255,.72);font-size:13px;">Repeat the path using the grid.</div>`
      });

      this.stage.innerHTML = `<div class="mg-grid grid-4 memory-grid"></div>`;
      this.gridEl = this.stage.querySelector(".memory-grid");
      this.tiles = [];
      for (let i = 0; i < 16; i += 1) {
        const btn = document.createElement("button");
        btn.className = "mg-tile";
        btn.type = "button";
        btn.addEventListener("click", () => this.chooseTile(i));
        this.gridEl.appendChild(btn);
        this.tiles.push(btn);
      }
      this.resetGame();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    resetGame() {
      this.round = 1;
      this.sequence = [];
      this.inputIndex = 0;
      this.showing = false;
      this.showTimer = 0;
      this.showStep = 0;
      this.litIndex = -1;
      this.prepareRound(true);
      this.setStatus("Round 1 / 3", "Watch the path, then repeat it.");
    }

    prepareRound(initial) {
      const length = 3 + this.round;
      this.sequence = [];
      while (this.sequence.length < length) {
        const next = Math.floor(Math.random() * 16);
        if (this.sequence[this.sequence.length - 1] !== next) this.sequence.push(next);
      }
      this.inputIndex = 0;
      this.showing = true;
      this.showTimer = initial ? 0.8 : 0.5;
      this.showStep = -1;
      this.litIndex = -1;
      this.paint();
    }

    paint() {
      this.tiles.forEach((tile, index) => {
        tile.classList.remove("is-lit", "is-hit", "is-bad");
        if (index === this.litIndex) tile.classList.add("is-lit");
        if (!this.showing && index < this.inputIndex && this.sequence[index] === index) {}
      });
    }

    chooseTile(index) {
      if (this.state !== "running" || this.showing) return;
      const expected = this.sequence[this.inputIndex];
      if (index !== expected) {
        this.tiles[index].classList.add("is-bad");
        this.failAndReset("Wrong path", "That was the wrong tile. Resetting to round one...");
        return;
      }
      this.tiles[index].classList.add("is-hit");
      this.inputIndex += 1;
      this.flash("rgba(143,243,184,0.14)", 90);
      if (this.inputIndex >= this.sequence.length) {
        if (this.round >= 3) {
          this.win("Path remembered", "You cleared all three memory rounds. Tap the tick to return to the menu.");
          return;
        }
        this.round += 1;
        this.showNote(`Round ${this.round}`, 700);
        this.prepareRound(false);
      }
    }

    updateGame(dt) {
      if (this.showing) {
        this.showTimer -= dt;
        if (this.showTimer <= 0) {
          this.showStep += 1;
          if (this.showStep >= this.sequence.length * 2) {
            this.showing = false;
            this.litIndex = -1;
          } else {
            if (this.showStep % 2 === 0) {
              this.litIndex = this.sequence[this.showStep / 2];
              this.showTimer = 0.42;
            } else {
              this.litIndex = -1;
              this.showTimer = 0.18;
            }
          }
          this.paint();
        }
      }
      this.setStatus(`Round ${this.round} / 3`, this.showing ? "Watch carefully..." : `Step ${this.inputIndex + 1} / ${this.sequence.length}`);
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const bg = ctx.createLinearGradient(0, 0, 0, this.height);
      bg.addColorStop(0, "#1d2e42");
      bg.addColorStop(1, "#07111a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < 20; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 80 + i * 30);
        ctx.lineTo(this.width, 80 + i * 30);
        ctx.stroke();
      }
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new MemoryPathGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();