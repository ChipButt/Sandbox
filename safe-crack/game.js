(function () {
  class SafeCrackGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Safe Crack",
        source: "safe-crack",
        instructions: "Press Lock In when the moving marker lands inside the green sweet spot. Nail three lock-ins before you reach three misses.",
        controlsHtml: `
          <button class="mg-button mg-control mg-big mg-lock">Lock In</button>
        `
      });
      this.lockBtn = this.root.querySelector(".mg-lock");
      this.lockBtn.addEventListener("click", () => this.tryLock());
      this.resetGame();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    onKeyDown(event) {
      if (this.state !== "running") return;
      if (event.key === " " || event.key === "Enter" || event.key === "ArrowUp") {
        event.preventDefault();
        this.tryLock();
      }
    }

    resetGame() {
      this.marker = 0.12;
      this.direction = 1;
      this.speed = 0.72;
      this.successes = 0;
      this.misses = 0;
      this.pickZone();
      this.setStatus("Successes 0 / 3", "Press when the marker hits the green zone.");
    }

    pickZone() {
      const width = Math.max(0.12, 0.22 - this.successes * 0.03);
      const start = this.rand(0.08, 0.92 - width);
      this.zone = { start, width };
    }

    tryLock() {
      if (this.state !== "running") return;
      const inZone = this.marker >= this.zone.start && this.marker <= this.zone.start + this.zone.width;
      if (inZone) {
        this.successes += 1;
        this.flash("rgba(143,243,184,0.16)", 130);
        if (this.successes >= 3) {
          this.win("Safe opened", "Three perfect lock-ins. Tap the tick to return to the menu.");
          return;
        }
        this.speed += 0.12;
        this.pickZone();
        this.showNote(`Lock ${this.successes} / 3`, 700);
      } else {
        this.misses += 1;
        this.flash("rgba(255,82,82,0.18)", 130);
        if (this.misses >= 3) {
          this.failAndReset("Lock slipped", "Too many misses. Resetting the safe...");
          return;
        }
      }
    }

    updateGame(dt) {
      this.marker += this.direction * this.speed * dt;
      if (this.marker >= 1) {
        this.marker = 1;
        this.direction = -1;
      } else if (this.marker <= 0) {
        this.marker = 0;
        this.direction = 1;
      }
      this.setStatus(`Successes ${this.successes} / 3`, `Misses ${this.misses} / 3`);
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const centerX = this.width / 2;
      const centerY = this.height * 0.48;
      const radius = Math.min(this.width, this.height) * 0.25;

      const bg = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius * 1.4);
      bg.addColorStop(0, "#283b55");
      bg.addColorStop(1, "#0a1018");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "#1c2633";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 18;
      ctx.strokeStyle = "#405067";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#7ad6a2";
      ctx.beginPath();
      const startA = Math.PI + this.zone.start * Math.PI;
      const endA = Math.PI + (this.zone.start + this.zone.width) * Math.PI;
      ctx.arc(centerX, centerY, radius, startA, endA);
      ctx.stroke();

      ctx.strokeStyle = "#f2f7ff";
      ctx.lineWidth = 6;
      for (let i = 0; i <= 10; i += 1) {
        const a = Math.PI + (i / 10) * Math.PI;
        const x1 = centerX + Math.cos(a) * (radius - 14);
        const y1 = centerY + Math.sin(a) * (radius - 14);
        const x2 = centerX + Math.cos(a) * (radius + 18);
        const y2 = centerY + Math.sin(a) * (radius + 18);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      const markerAngle = Math.PI + this.marker * Math.PI;
      ctx.strokeStyle = "#ffd45c";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(markerAngle) * (radius + 8), centerY + Math.sin(markerAngle) * (radius + 8));
      ctx.stroke();

      ctx.fillStyle = "#101826";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f2f7ff";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#f2f7ff";
      ctx.font = "700 28px Trebuchet MS, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LOCK", centerX, centerY + radius + 66);
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new SafeCrackGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();