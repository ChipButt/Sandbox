(function () {
  class BarrelDodgeGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Barrel Dodge",
        source: "barrel-dodge",
        instructions: "Move left and right to dodge the barrels bouncing down the slope. Survive the full wave to win. A single hit resets the challenge.",
        controlsHtml: `
          <button class="mg-button mg-control mg-left">◀</button>
          <button class="mg-button mg-control mg-right">▶</button>
        `
      });
      this.leftBtn = this.root.querySelector(".mg-left");
      this.rightBtn = this.root.querySelector(".mg-right");
      this.leftPressed = false;
      this.rightPressed = false;
      this.bindHoldButton(this.leftBtn, (pressed) => this.leftPressed = pressed);
      this.bindHoldButton(this.rightBtn, (pressed) => this.rightPressed = pressed);
      this.resetGame();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    onKeyDown(event) {
      const k = event.key.toLowerCase();
      if (k === "arrowleft" || k === "a") { event.preventDefault(); this.leftPressed = true; }
      if (k === "arrowright" || k === "d") { event.preventDefault(); this.rightPressed = true; }
    }

    onKeyUp(event) {
      const k = event.key.toLowerCase();
      if (k === "arrowleft" || k === "a") this.leftPressed = false;
      if (k === "arrowright" || k === "d") this.rightPressed = false;
    }

    resetGame() {
      this.player = { x: this.width / 2, y: this.height - 120, r: 22 };
      this.barrels = [];
      this.spawnTimer = 0.5;
      this.elapsed = 0;
      this.goal = 24;
      this.spawned = 0;
      this.groundOffset = 0;
      this.setStatus("Wave 0 / 24", "Dodge every barrel in the wave.");
    }

    spawnBarrel() {
      this.barrels.push({
        x: this.rand(40, this.width - 40),
        y: -30,
        vx: this.rand(-120, 120),
        vy: this.rand(190, 260),
        r: this.rand(14, 18),
        spin: 0,
        spinSpeed: this.rand(-6, 6)
      });
      this.spawned += 1;
    }

    updateGame(dt) {
      const move = (this.rightPressed ? 1 : 0) - (this.leftPressed ? 1 : 0);
      this.player.x += move * 320 * dt;
      this.player.x = this.clamp(this.player.x, 26, this.width - 26);
      this.elapsed += dt;
      this.groundOffset += dt * 160;

      if (this.spawned < this.goal) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnBarrel();
          this.spawnTimer = this.rand(0.35, 0.75);
        }
      }

      for (const barrel of this.barrels) {
        barrel.x += barrel.vx * dt;
        barrel.y += barrel.vy * dt;
        barrel.spin += barrel.spinSpeed * dt;
        if (barrel.x < barrel.r || barrel.x > this.width - barrel.r) {
          barrel.vx *= -1;
          barrel.x = this.clamp(barrel.x, barrel.r, this.width - barrel.r);
        }
        if (barrel.y > this.height + 40) barrel.dead = true;

        const dx = barrel.x - this.player.x;
        const dy = barrel.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < barrel.r + this.player.r - 4) {
          this.failAndReset("Flattened", "A barrel clipped you. Resetting the wave...");
          return;
        }
      }

      this.barrels = this.barrels.filter(b => !b.dead);

      if (this.spawned >= this.goal && this.barrels.length === 0) {
        this.win("Wave cleared", "You dodged the whole barrel wave. Tap the tick to return to the menu.");
        return;
      }

      this.setStatus(`Wave ${Math.min(this.spawned, this.goal)} / ${this.goal}`, `Barrels on screen ${this.barrels.length}`);
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const bg = ctx.createLinearGradient(0, 0, 0, this.height);
      bg.addColorStop(0, "#22364c");
      bg.addColorStop(1, "#0a1017");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "#6f7c63";
      ctx.beginPath();
      ctx.moveTo(0, 120);
      ctx.lineTo(this.width, 60);
      ctx.lineTo(this.width, this.height);
      ctx.lineTo(0, this.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 12]);
      ctx.lineDashOffset = -(this.groundOffset % 22);
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 150 + i * 60);
        ctx.lineTo(this.width, 90 + i * 60);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const barrel of this.barrels) {
        ctx.save();
        ctx.translate(barrel.x, barrel.y);
        ctx.rotate(barrel.spin);
        ctx.fillStyle = "#8a5a32";
        ctx.beginPath();
        ctx.arc(0, 0, barrel.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3a2514";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, barrel.r * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-barrel.r, 0);
        ctx.lineTo(barrel.r, 0);
        ctx.moveTo(0, -barrel.r);
        ctx.lineTo(0, barrel.r);
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = "#8ff3b8";
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#101826";
      ctx.beginPath();
      ctx.arc(this.player.x - 7, this.player.y - 4, 3, 0, Math.PI * 2);
      ctx.arc(this.player.x + 7, this.player.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new BarrelDodgeGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();