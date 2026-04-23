(function () {
  class ReactionRushGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Reaction Rush",
        source: "reaction-rush",
        instructions: "Tap the glowing target before it disappears. Avoid the red decoy. Score 12 hits before time runs out. Three strikes resets the round.",
        controlsHtml: `<div style="padding:6px 10px;color:rgba(255,255,255,.72);font-size:13px;">Tap the active tile in the grid.</div>`
      });

      this.stage.innerHTML = `
        <div class="mg-grid grid-3 reaction-grid"></div>
      `;
      this.gridEl = this.stage.querySelector(".reaction-grid");
      this.cells = [];
      for (let i = 0; i < 9; i += 1) {
        const btn = document.createElement("button");
        btn.className = "mg-tile";
        btn.type = "button";
        btn.textContent = "•";
        btn.addEventListener("click", () => this.hitCell(i));
        this.gridEl.appendChild(btn);
        this.cells.push(btn);
      }
      this.resetGame();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    resetGame() {
      this.score = 0;
      this.strikes = 0;
      this.timeLeft = 25;
      this.activeIndex = -1;
      this.activeType = "good";
      this.activeTimer = 0;
      this.spawnNow();
      this.paintGrid();
      this.setStatus("Score 0 / 12", "Three strikes resets the round.");
    }

    spawnNow() {
      this.activeIndex = Math.floor(Math.random() * this.cells.length);
      this.activeType = Math.random() < 0.22 ? "bad" : "good";
      this.activeTimer = this.rand(0.5, 1.0);
      this.paintGrid();
    }

    paintGrid() {
      this.cells.forEach((cell, index) => {
        cell.classList.remove("is-lit", "is-bad", "is-hit");
        cell.textContent = "";
        if (index === this.activeIndex) {
          if (this.activeType === "good") {
            cell.classList.add("is-lit");
            cell.textContent = "✓";
          } else {
            cell.classList.add("is-bad");
            cell.textContent = "✕";
          }
        }
      });
    }

    hitCell(index) {
      if (this.state !== "running") return;
      if (index !== this.activeIndex) {
        this.strikes += 1;
        this.flash("rgba(255,82,82,0.18)", 140);
      } else if (this.activeType === "good") {
        this.score += 1;
        this.cells[index].classList.add("is-hit");
        this.flash("rgba(143,243,184,0.16)", 110);
      } else {
        this.strikes += 1;
        this.flash("rgba(255,82,82,0.18)", 140);
      }

      if (this.score >= 12) {
        this.win("Targets cleared", "You smashed the reaction challenge. Tap the tick to return to the menu.");
        return;
      }
      if (this.strikes >= 3) {
        this.failAndReset("Too many misses", "Three strikes. Resetting the round...");
        return;
      }
      this.spawnNow();
    }

    updateGame(dt) {
      this.timeLeft -= dt;
      this.activeTimer -= dt;

      if (this.activeTimer <= 0) {
        if (this.activeType === "good") {
          this.strikes += 1;
        }
        if (this.strikes >= 3) {
          this.failAndReset("Too many misses", "You ran out of chances. Resetting the round...");
          return;
        }
        this.spawnNow();
      }

      if (this.timeLeft <= 0) {
        this.failAndReset("Out of time", "You didn't clear enough targets in time. Resetting...");
        return;
      }

      this.setStatus(
        `Score ${this.score} / 12`,
        `Time ${this.timeLeft.toFixed(1)}s • Strikes ${this.strikes} / 3`
      );
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const bg = ctx.createLinearGradient(0, 0, 0, this.height);
      bg.addColorStop(0, "#18263a");
      bg.addColorStop(1, "#08111a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < 18; i += 1) {
        ctx.fillRect(0, 86 + i * 28, this.width, 1);
      }
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new ReactionRushGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();