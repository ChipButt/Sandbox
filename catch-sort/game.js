(function () {
  class CatchSortGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Catch Sort",
        source: "catch-sort",
        instructions: "Slide the basket left and right. Catch 12 stars and avoid the bombs. Three bad catches resets the round.",
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
      this.player = { x: this.width / 2, y: this.height - 150, w: 100, h: 20 };
      this.items = [];
      this.spawnTimer = 0.3;
      this.good = 0;
      this.bad = 0;
      this.setStatus("Caught 0 / 12", "Avoid bombs. Three bad catches resets the round.");
    }

    spawnItem() {
      this.items.push({
        x: this.rand(30, this.width - 30),
        y: -20,
        r: 16,
        speed: this.rand(160, 260),
        type: Math.random() < 0.24 ? "bad" : "good"
      });
    }

    updateGame(dt) {
      const move = (this.rightPressed ? 1 : 0) - (this.leftPressed ? 1 : 0);
      this.player.x += move * 320 * dt;
      this.player.x = this.clamp(this.player.x, 58, this.width - 58);

      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnItem();
        this.spawnTimer = this.rand(0.3, 0.65);
      }

      for (const item of this.items) item.y += item.speed * dt;
      const catchTop = this.player.y - 16;
      this.items = this.items.filter((item) => {
        if (
          item.x > this.player.x - this.player.w / 2 &&
          item.x < this.player.x + this.player.w / 2 &&
          item.y + item.r > catchTop &&
          item.y - item.r < this.player.y + this.player.h
        ) {
          if (item.type === "good") {
            this.good += 1;
            this.flash("rgba(143,243,184,0.14)", 80);
            if (this.good >= 12) {
              this.win("Catch complete", "You caught enough good drops. Tap the tick to return to the menu.");
            }
          } else {
            this.bad += 1;
            this.flash("rgba(255,82,82,0.18)", 100);
            if (this.bad >= 3) {
              this.failAndReset("Wrong catch", "Too many bombs landed in the basket. Resetting...");
            }
          }
          return false;
        }
        return item.y < this.height + 40;
      });

      this.setStatus(`Caught ${this.good} / 12`, `Bad catches ${this.bad} / 3`);
    }

    renderStar(ctx, x, y, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i += 1) {
        const a = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
        const a2 = a + Math.PI / 5;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.lineTo(x + Math.cos(a2) * (r * 0.45), y + Math.sin(a2) * (r * 0.45));
      }
      ctx.closePath();
      ctx.fill();
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      const bg = ctx.createLinearGradient(0, 0, 0, this.height);
      bg.addColorStop(0, "#183250");
      bg.addColorStop(1, "#08111a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "#224a27";
      ctx.fillRect(0, this.height - 120, this.width, 120);

      for (const item of this.items) {
        if (item.type === "good") {
          this.renderStar(ctx, item.x, item.y, item.r, "#ffd45c");
        } else {
          ctx.fillStyle = "#ff7373";
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#101826";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(item.x - 6, item.y - 6);
          ctx.lineTo(item.x + 6, item.y + 6);
          ctx.moveTo(item.x + 6, item.y - 6);
          ctx.lineTo(item.x - 6, item.y + 6);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#8ec5ff";
      ctx.fillRect(this.player.x - this.player.w / 2, this.player.y, this.player.w, this.player.h);
      ctx.fillStyle = "#5b87b0";
      ctx.fillRect(this.player.x - this.player.w / 2 + 8, this.player.y - 10, this.player.w - 16, 10);
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new CatchSortGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();