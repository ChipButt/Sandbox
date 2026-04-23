(function () {
  class SlingshotShotGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Slingshot Shot",
        source: "slingshot-shot",
        instructions: "Pull back the shot, aim, and release. Hit three targets before you run out of five shots. A failed attempt resets the whole challenge.",
        controlsHtml: `
          <div style="padding:6px 10px;color:rgba(255,255,255,.72);font-size:13px;">Drag on the slingshot to aim, then release.</div>
        `
      });
      this.dragging = false;
      this.resetGame();
      this.bindPointer();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    onResize() {
      this.anchor = { x: 100, y: this.height - 170 };
    }

    bindPointer() {
      const down = (event) => {
        if (this.state !== "running") return;
        const pos = this.canvasPoint(event);
        const dx = pos.x - this.anchor.x;
        const dy = pos.y - this.anchor.y;
        if (Math.sqrt(dx * dx + dy * dy) < 56 && !this.projectile.flying) {
          this.dragging = true;
          this.projectile.dragX = pos.x;
          this.projectile.dragY = pos.y;
        }
      };
      const move = (event) => {
        if (!this.dragging) return;
        const pos = this.canvasPoint(event);
        const dx = pos.x - this.anchor.x;
        const dy = pos.y - this.anchor.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const max = 90;
        const scale = dist > max ? max / dist : 1;
        this.projectile.dragX = this.anchor.x + dx * scale;
        this.projectile.dragY = this.anchor.y + dy * scale;
      };
      const up = () => {
        if (!this.dragging) return;
        this.dragging = false;
        const dx = this.anchor.x - this.projectile.dragX;
        const dy = this.anchor.y - this.projectile.dragY;
        this.projectile.flying = true;
        this.projectile.x = this.anchor.x;
        this.projectile.y = this.anchor.y;
        this.projectile.vx = dx * 3.4;
        this.projectile.vy = dy * 3.4;
        this.shotsUsed += 1;
      };
      this.canvas.addEventListener("pointerdown", down);
      this.canvas.addEventListener("pointermove", move);
      this.canvas.addEventListener("pointerup", up);
      this.canvas.addEventListener("pointercancel", up);
      this.addCleanup(() => {
        this.canvas.removeEventListener("pointerdown", down);
        this.canvas.removeEventListener("pointermove", move);
        this.canvas.removeEventListener("pointerup", up);
        this.canvas.removeEventListener("pointercancel", up);
      });
    }

    canvasPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    resetProjectile() {
      this.projectile = {
        x: this.anchor.x,
        y: this.anchor.y,
        r: 12,
        vx: 0,
        vy: 0,
        flying: false,
        dragX: this.anchor.x,
        dragY: this.anchor.y
      };
      this.dragging = false;
    }

    resetGame() {
      this.onResize();
      this.shotsUsed = 0;
      this.hits = 0;
      this.target = {
        x: this.width - 120,
        y: this.height - 230,
        r: 28,
        vx: -70
      };
      this.resetProjectile();
      this.setStatus("Hits 0 / 3", "Five shots total. Drag and release to fire.");
    }

    onKeyDown(event) {
      if (this.state !== "running") return;
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        if (!this.projectile.flying) this.resetProjectile();
      }
    }

    spawnNextTarget() {
      this.target = {
        x: this.width - this.rand(90, 160),
        y: this.rand(160, this.height - 260),
        r: this.rand(24, 32),
        vx: this.pick([-90, -70, 70, 95])
      };
    }

    updateGame(dt) {
      if (this.target) {
        this.target.x += this.target.vx * dt;
        if (this.target.x < this.width * 0.46 + this.target.r || this.target.x > this.width - this.target.r - 24) {
          this.target.vx *= -1;
        }
      }

      if (this.projectile.flying) {
        this.projectile.vy += 560 * dt;
        this.projectile.x += this.projectile.vx * dt;
        this.projectile.y += this.projectile.vy * dt;

        const dx = this.projectile.x - this.target.x;
        const dy = this.projectile.y - this.target.y;
        if (Math.sqrt(dx * dx + dy * dy) < this.projectile.r + this.target.r) {
          this.hits += 1;
          this.flash("rgba(143,243,184,0.18)", 120);
          if (this.hits >= 3) {
            this.win("Bullseye", "You hit all three targets. Tap the tick to return to the menu.");
            return;
          }
          this.spawnNextTarget();
          this.resetProjectile();
        } else if (
          this.projectile.x > this.width + 60 ||
          this.projectile.y > this.height + 60 ||
          this.projectile.x < -60
        ) {
          if (this.shotsUsed >= 5) {
            this.failAndReset("Out of shots", "You missed too many targets. Resetting the challenge...");
            return;
          }
          this.resetProjectile();
        }
      }

      this.setStatus(`Hits ${this.hits} / 3`, `Shots ${this.shotsUsed} / 5`);
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const bg = ctx.createLinearGradient(0, 0, 0, this.height);
      bg.addColorStop(0, "#1d3150");
      bg.addColorStop(1, "#08111a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "#2d5735";
      ctx.fillRect(0, this.height - 120, this.width, 120);

      ctx.strokeStyle = "#6a4f36";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(this.anchor.x - 22, this.anchor.y + 56);
      ctx.lineTo(this.anchor.x - 4, this.anchor.y - 38);
      ctx.lineTo(this.anchor.x + 14, this.anchor.y + 56);
      ctx.stroke();

      const slingX = this.dragging ? this.projectile.dragX : (this.projectile.flying ? this.projectile.x : this.anchor.x);
      const slingY = this.dragging ? this.projectile.dragY : (this.projectile.flying ? this.projectile.y : this.anchor.y);

      ctx.strokeStyle = "#f2f7ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.anchor.x - 4, this.anchor.y - 26);
      ctx.lineTo(slingX, slingY);
      ctx.lineTo(this.anchor.x + 14, this.anchor.y - 26);
      ctx.stroke();

      if (this.target) {
        ctx.fillStyle = "#ff7373";
        ctx.beginPath();
        ctx.arc(this.target.x, this.target.y, this.target.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff4e6";
        ctx.beginPath();
        ctx.arc(this.target.x, this.target.y, this.target.r * 0.62, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff7373";
        ctx.beginPath();
        ctx.arc(this.target.x, this.target.y, this.target.r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ffd45c";
      const px = this.dragging ? this.projectile.dragX : this.projectile.x;
      const py = this.dragging ? this.projectile.dragY : this.projectile.y;
      ctx.beginPath();
      ctx.arc(px, py, this.projectile.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new SlingshotShotGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();