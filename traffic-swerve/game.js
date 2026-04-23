(function () {
  class TrafficSwerveGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Traffic Swerve",
        source: "traffic-swerve",
        instructions: "Survive the traffic rush for 30 seconds. Move left and right to dodge incoming cars. If you crash, the run flashes and restarts from the beginning.",
        controlsHtml: `
          <button class="mg-button mg-control mg-left">◀</button>
          <div class="mg-wheel-mini"><div class="mg-wheel-mini-core"></div></div>
          <button class="mg-button mg-control mg-right">▶</button>
        `
      });
      this.leftBtn = this.root.querySelector(".mg-left");
      this.rightBtn = this.root.querySelector(".mg-right");
      this.leftPressed = false;
      this.rightPressed = false;
      this.bindHoldButton(this.leftBtn, (pressed) => this.leftPressed = pressed);
      this.bindHoldButton(this.rightBtn, (pressed) => this.rightPressed = pressed);
      this.lanes = 3;
      this.roadTop = 90;
      this.roadBottom = this.height - 110;
      this.resetGame();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    onResize() {
      this.roadTop = 90;
      this.roadBottom = this.height - 110;
    }

    onKeyDown(event) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        this.leftPressed = true;
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        this.rightPressed = true;
      }
    }

    onKeyUp(event) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        this.leftPressed = false;
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        this.rightPressed = false;
      }
    }

    onVisibilityPause() {
      this.leftPressed = false;
      this.rightPressed = false;
    }

    resetGame() {
      this.playerLane = 1;
      this.targetLane = 1;
      this.playerX = 0;
      this.elapsed = 0;
      this.spawnTimer = 0;
      this.roadOffset = 0;
      this.obstacles = [];
      this.canMove = true;
      this.updatePlayerX(true);
      this.setStatus("Survive 30s", "Stay on the road and miss every car.");
    }

    laneX(lane) {
      const roadCenter = this.width / 2;
      const roadWidth = Math.min(this.width * 0.72, 340);
      const laneWidth = roadWidth / this.lanes;
      return roadCenter - roadWidth / 2 + laneWidth * lane + laneWidth / 2;
    }

    updatePlayerX(force) {
      const tx = this.laneX(this.playerLane);
      this.playerX = force ? tx : this.lerp(this.playerX, tx, 0.24);
    }

    spawnObstacle() {
      const lane = Math.floor(Math.random() * this.lanes);
      const speed = this.rand(280, 420);
      this.obstacles.push({
        lane,
        y: -80,
        w: 48,
        h: 78,
        speed,
        color: this.pick(["#ff8c5a", "#58c0ff", "#ffd15c", "#c48bff"])
      });
    }

    updateGame(dt) {
      this.elapsed += dt;
      this.roadOffset += dt * 380;
      if (this.leftPressed && this.playerLane > 0 && this.canMove) {
        this.playerLane -= 1;
        this.canMove = false;
      }
      if (this.rightPressed && this.playerLane < this.lanes - 1 && this.canMove) {
        this.playerLane += 1;
        this.canMove = false;
      }
      if (!this.leftPressed && !this.rightPressed) {
        this.canMove = true;
      }
      this.updatePlayerX(false);

      this.spawnTimer -= dt;
      const spawnGap = Math.max(0.33, 0.74 - this.elapsed * 0.01);
      if (this.spawnTimer <= 0) {
        this.spawnObstacle();
        this.spawnTimer = spawnGap;
      }

      for (const obs of this.obstacles) {
        obs.y += obs.speed * dt;
      }
      this.obstacles = this.obstacles.filter(obs => obs.y < this.height + 120);

      const playerY = this.height - 170;
      for (const obs of this.obstacles) {
        const ox = this.laneX(obs.lane);
        if (Math.abs(ox - this.playerX) < 38 && Math.abs((obs.y + obs.h / 2) - (playerY + 32)) < 58) {
          this.failAndReset("Crash!", "You clipped another car. Resetting back to the start...");
          return;
        }
      }

      const remain = Math.max(0, 30 - this.elapsed);
      this.setStatus(`Survive ${remain.toFixed(1)}s`, "Left and right to dodge traffic.");

      if (this.elapsed >= 30) {
        this.win("Road cleared", "You made it through the traffic. Tap the tick to return to the menu.");
      }
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);

      const roadCenter = this.width / 2;
      const roadWidth = Math.min(this.width * 0.72, 340);
      const laneWidth = roadWidth / this.lanes;

      const sky = ctx.createLinearGradient(0, 0, 0, this.height * 0.45);
      sky.addColorStop(0, "#284b73");
      sky.addColorStop(1, "#152434");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = "#174a28";
      ctx.fillRect(0, this.roadTop, this.width, this.roadBottom - this.roadTop + 120);

      ctx.fillStyle = "#444d59";
      ctx.fillRect(roadCenter - roadWidth / 2, this.roadTop, roadWidth, this.roadBottom - this.roadTop + 60);

      ctx.fillStyle = "#db4d4d";
      ctx.fillRect(roadCenter - roadWidth / 2 - 12, this.roadTop, 12, this.roadBottom - this.roadTop + 60);
      ctx.fillRect(roadCenter + roadWidth / 2, this.roadTop, 12, this.roadBottom - this.roadTop + 60);

      ctx.strokeStyle = "#f5f2e8";
      ctx.lineWidth = 4;
      ctx.setLineDash([24, 20]);
      const dashOffset = this.roadOffset % 44;
      ctx.lineDashOffset = dashOffset;
      for (let i = 1; i < this.lanes; i += 1) {
        const x = roadCenter - roadWidth / 2 + laneWidth * i;
        ctx.beginPath();
        ctx.moveTo(x, this.roadTop);
        ctx.lineTo(x, this.roadBottom + 60);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const obs of this.obstacles) {
        const x = this.laneX(obs.lane);
        ctx.fillStyle = obs.color;
        ctx.fillRect(x - obs.w / 2, obs.y, obs.w, obs.h);
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fillRect(x - obs.w / 2 + 8, obs.y + 10, obs.w - 16, 12);
      }

      const playerY = this.height - 170;
      ctx.fillStyle = "#d93f3f";
      ctx.fillRect(this.playerX - 28, playerY, 56, 86);
      ctx.fillStyle = "rgba(255,255,255,0.24)";
      ctx.fillRect(this.playerX - 18, playerY + 10, 36, 14);
      ctx.fillStyle = "#101826";
      ctx.fillRect(this.playerX - 22, playerY + 64, 16, 12);
      ctx.fillRect(this.playerX + 6, playerY + 64, 16, 12);
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new TrafficSwerveGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();