(function () {
  class RunnerLiteGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Runner Lite",
        source: "runner-lite",
        instructions: "Hold your nerve and jump the obstacles. Survive to 30 seconds to finish the run. Any collision resets the course.",
        controlsHtml: `
          <button class="mg-button mg-control mg-big mg-jump">Jump</button>
        `
      });
      this.jumpBtn = this.root.querySelector(".mg-jump");
      this.bindHoldButton(this.jumpBtn, (pressed) => {
        if (pressed) this.tryJump();
      });
      this.resetGame();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    onResize() {
      this.groundY = this.height - 150;
    }

    onKeyDown(event) {
      if (this.state !== "running") return;
      const k = event.key.toLowerCase();
      if (k === " " || k === "arrowup" || k === "w") {
        event.preventDefault();
        this.tryJump();
      }
    }

    resetGame() {
      this.onResize();
      this.runner = { x: 90, y: this.groundY, vy: 0, w: 44, h: 58 };
      this.obstacles = [];
      this.spawnTimer = 0.9;
      this.elapsed = 0;
      this.trackOffset = 0;
      this.setStatus("Run 30.0s", "Jump over the incoming obstacles.");
    }

    tryJump() {
      if (this.runner.y >= this.groundY - 2) {
        this.runner.vy = -520;
        this.flash("rgba(142,197,255,0.1)", 90);
      }
    }

    spawnObstacle() {
      const tall = Math.random() < 0.35;
      this.obstacles.push({
        x: this.width + 60,
        y: this.groundY + (tall ? -26 : 6),
        w: tall ? 32 : 48,
        h: tall ? 84 : 40,
        speed: this.rand(320, 420),
        color: tall ? "#ffd15c" : "#ff8c5a"
      });
    }

    updateGame(dt) {
      this.elapsed += dt;
      this.trackOffset += dt * 300;
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnObstacle();
        this.spawnTimer = this.rand(0.8, 1.4);
      }

      this.runner.vy += 1200 * dt;
      this.runner.y += this.runner.vy * dt;
      if (this.runner.y > this.groundY) {
        this.runner.y = this.groundY;
        this.runner.vy = 0;
      }

      for (const obs of this.obstacles) {
        obs.x -= obs.speed * dt;
      }
      this.obstacles = this.obstacles.filter(o => o.x > -120);

      for (const obs of this.obstacles) {
        if (
          this.runner.x < obs.x + obs.w &&
          this.runner.x + this.runner.w > obs.x &&
          this.runner.y < obs.y + obs.h &&
          this.runner.y + this.runner.h > obs.y
        ) {
          this.failAndReset("Trip!", "You clipped an obstacle. Resetting the run...");
          return;
        }
      }

      const remain = Math.max(0, 30 - this.elapsed);
      this.setStatus(`Run ${remain.toFixed(1)}s`, "Jump to stay alive.");

      if (this.elapsed >= 30) {
        this.win("Run complete", "You cleared the sprint. Tap the tick to return to the menu.");
      }
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);

      const sky = ctx.createLinearGradient(0, 0, 0, this.height);
      sky.addColorStop(0, "#254465");
      sky.addColorStop(1, "#101820");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "#2f5238";
      ctx.fillRect(0, this.groundY + this.runner.h - 8, this.width, this.height - (this.groundY + this.runner.h - 8));

      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 3;
      ctx.setLineDash([18, 18]);
      ctx.lineDashOffset = -(this.trackOffset % 36);
      ctx.beginPath();
      ctx.moveTo(0, this.groundY + this.runner.h + 14);
      ctx.lineTo(this.width, this.groundY + this.runner.h + 14);
      ctx.stroke();
      ctx.setLineDash([]);

      for (const obs of this.obstacles) {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      }

      ctx.fillStyle = "#8ff3b8";
      ctx.fillRect(this.runner.x, this.runner.y, this.runner.w, this.runner.h);
      ctx.fillStyle = "#101826";
      ctx.fillRect(this.runner.x + 8, this.runner.y + 10, 10, 10);
      ctx.fillRect(this.runner.x + 26, this.runner.y + 10, 10, 10);
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new RunnerLiteGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();