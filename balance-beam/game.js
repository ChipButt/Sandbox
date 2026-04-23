(function () {
  class BalanceBeamGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Balance Beam",
        source: "balance-beam",
        instructions: "Keep the weight balanced in the centre. Use left and right to correct the wobble. Stay inside the limits for 25 seconds.",
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

    onVisibilityPause() {
      this.leftPressed = false;
      this.rightPressed = false;
    }

    resetGame() {
      this.balance = 0;
      this.velocity = 0;
      this.elapsed = 0;
      this.driftSeed = Math.random() * 1000;
      this.setStatus("Hold 25.0s", "Keep the wobble inside the red limits.");
    }

    updateGame(dt) {
      this.elapsed += dt;
      const drift = Math.sin(this.elapsed * 2.1 + this.driftSeed) * 0.6 + Math.cos(this.elapsed * 3.9) * 0.28;
      this.velocity += drift * dt * 0.9;
      if (this.leftPressed) this.velocity -= 2.6 * dt;
      if (this.rightPressed) this.velocity += 2.6 * dt;
      this.velocity *= Math.pow(0.12, dt);
      this.balance += this.velocity * 42 * dt;
      this.balance = this.clamp(this.balance, -100, 100);

      const remain = Math.max(0, 25 - this.elapsed);
      this.setStatus(`Hold ${remain.toFixed(1)}s`, `Balance ${Math.round(this.balance)}%`);

      if (Math.abs(this.balance) >= 88) {
        this.failAndReset("Tipped over", "You lost the balance. Resetting the challenge...");
        return;
      }

      if (this.elapsed >= 25) {
        this.win("Perfect balance", "You kept it together. Tap the tick to return to the menu.");
      }
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const bg = ctx.createLinearGradient(0, 0, 0, this.height);
      bg.addColorStop(0, "#23384f");
      bg.addColorStop(1, "#0c1219");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);

      const beamY = this.height * 0.55;
      const beamX = this.width / 2;
      const beamW = Math.min(420, this.width * 0.76);
      const angle = (this.balance / 100) * 0.42;

      ctx.save();
      ctx.translate(beamX, beamY);
      ctx.rotate(angle);

      ctx.fillStyle = "#765337";
      ctx.fillRect(-beamW / 2, -10, beamW, 20);

      ctx.fillStyle = "#ff7373";
      ctx.fillRect(-beamW / 2, -16, 24, 32);
      ctx.fillRect(beamW / 2 - 24, -16, 24, 32);

      ctx.fillStyle = "#8ff3b8";
      ctx.fillRect(-32, -24, 64, 48);
      ctx.fillStyle = "#101826";
      ctx.fillRect(-10, -8, 20, 16);

      ctx.restore();

      ctx.fillStyle = "#2e3948";
      ctx.beginPath();
      ctx.moveTo(beamX, beamY + 14);
      ctx.lineTo(beamX - 46, beamY + 120);
      ctx.lineTo(beamX + 46, beamY + 120);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(this.width * 0.12, this.height * 0.78, this.width * 0.76, 18);
      ctx.fillStyle = "#ff7373";
      ctx.fillRect(this.width * 0.12, this.height * 0.78, this.width * 0.1, 18);
      ctx.fillRect(this.width * 0.78, this.height * 0.78, this.width * 0.1, 18);
      ctx.fillStyle = "#8ff3b8";
      const markerX = this.width * 0.5 + (this.balance / 100) * (this.width * 0.28);
      ctx.fillRect(markerX - 8, this.height * 0.77, 16, 20);
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new BalanceBeamGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();