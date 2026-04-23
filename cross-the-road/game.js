(function () {
  class CrossTheRoadGame extends MiniGameBase {
    constructor(root) {
      super(root, {
        title: "Cross the Road",
        source: "cross-the-road",
        instructions: "Cross to the top three times without getting hit. Use the arrows to move one tile at a time. A collision resets the whole run.",
        controlsHtml: `
          <div class="mg-controls is-wide">
            <button class="mg-button mg-control mg-left">◀</button>
            <button class="mg-button mg-control mg-up">▲</button>
            <button class="mg-button mg-control mg-down">▼</button>
            <button class="mg-button mg-control mg-right">▶</button>
          </div>
        `
      });
      this.leftBtn = this.root.querySelector(".mg-left");
      this.rightBtn = this.root.querySelector(".mg-right");
      this.upBtn = this.root.querySelector(".mg-up");
      this.downBtn = this.root.querySelector(".mg-down");
      this.bindStep(this.leftBtn, () => this.tryMove(-1, 0));
      this.bindStep(this.rightBtn, () => this.tryMove(1, 0));
      this.bindStep(this.upBtn, () => this.tryMove(0, -1));
      this.bindStep(this.downBtn, () => this.tryMove(0, 1));

      this.cols = 7;
      this.rows = 8;
      this.rowCars = [];
      this.crossings = 0;
      this.resetGame();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    bindStep(btn, fn) {
      const click = (event) => {
        event.preventDefault();
        if (this.state === "running") fn();
      };
      btn.addEventListener("click", click);
    }

    onResize() {
      this.cell = Math.min(72, Math.floor((Math.min(this.width - 40, 420)) / this.cols));
      this.gridWidth = this.cell * this.cols;
      this.gridHeight = this.cell * this.rows;
      this.gridX = Math.floor((this.width - this.gridWidth) / 2);
      this.gridY = Math.floor((this.height - this.gridHeight) / 2) - 12;
    }

    onKeyDown(event) {
      if (this.state !== "running") return;
      const k = event.key.toLowerCase();
      if (k === "arrowleft" || k === "a") { event.preventDefault(); this.tryMove(-1, 0); }
      if (k === "arrowright" || k === "d") { event.preventDefault(); this.tryMove(1, 0); }
      if (k === "arrowup" || k === "w") { event.preventDefault(); this.tryMove(0, -1); }
      if (k === "arrowdown" || k === "s") { event.preventDefault(); this.tryMove(0, 1); }
    }

    resetGame() {
      this.crossings = 0;
      this.player = { col: 3, row: 7 };
      this.rowCars = [];
      this.onResize();
      for (let row = 1; row <= 5; row += 1) {
        const dir = row % 2 === 0 ? 1 : -1;
        const cars = [];
        const speed = 70 + row * 18;
        const count = row === 3 ? 2 : 3;
        for (let i = 0; i < count; i += 1) {
          cars.push({
            x: this.gridX + ((i * 2.8 + row) % this.cols) * this.cell,
            width: this.cell * 0.9
          });
        }
        this.rowCars.push({ row, dir, speed, cars });
      }
      this.setStatus("Crossings 0 / 3", "Reach the top three times.");
    }

    tryMove(dx, dy) {
      this.player.col = this.clamp(this.player.col + dx, 0, this.cols - 1);
      this.player.row = this.clamp(this.player.row + dy, 0, this.rows - 1);
      if (this.player.row === 0) {
        this.crossings += 1;
        if (this.crossings >= 3) {
          this.win("Road mastered", "Three clean crossings. Tap the tick to return to the menu.");
          return;
        }
        this.player.col = 3;
        this.player.row = 7;
        this.showNote(`Crossing ${this.crossings} / 3`, 800);
      }
    }

    updateGame(dt) {
      for (const lane of this.rowCars) {
        for (const car of lane.cars) {
          car.x += lane.dir * lane.speed * dt;
          if (lane.dir > 0 && car.x > this.gridX + this.gridWidth + this.cell) {
            car.x = this.gridX - car.width - this.rand(0, this.cell * 2);
          } else if (lane.dir < 0 && car.x < this.gridX - car.width - this.cell) {
            car.x = this.gridX + this.gridWidth + this.rand(0, this.cell * 2);
          }
          const px = this.gridX + this.player.col * this.cell + this.cell * 0.15;
          const py = this.gridY + this.player.row * this.cell + this.cell * 0.15;
          const cx = car.x;
          const cy = this.gridY + lane.row * this.cell + this.cell * 0.18;
          if (
            px < cx + car.width &&
            px + this.cell * 0.7 > cx &&
            py < cy + this.cell * 0.64 &&
            py + this.cell * 0.7 > cy
          ) {
            this.failAndReset("Hit!", "A car caught you. Resetting to the beginning...");
            return;
          }
        }
      }
      this.setStatus(`Crossings ${this.crossings} / 3`, "Make it to the top row.");
    }

    renderGame(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = "#162330";
      ctx.fillRect(0, 0, this.width, this.height);

      for (let row = 0; row < this.rows; row += 1) {
        const y = this.gridY + row * this.cell;
        if (row === 0) ctx.fillStyle = "#2a6b38";
        else if (row >= 1 && row <= 5) ctx.fillStyle = row % 2 ? "#444b55" : "#3a414b";
        else ctx.fillStyle = "#254c73";
        ctx.fillRect(this.gridX, y, this.gridWidth, this.cell - 2);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      for (let c = 0; c <= this.cols; c += 1) {
        const x = this.gridX + c * this.cell;
        ctx.beginPath();
        ctx.moveTo(x, this.gridY);
        ctx.lineTo(x, this.gridY + this.gridHeight);
        ctx.stroke();
      }

      ctx.fillStyle = "#f5f2e8";
      for (const lane of this.rowCars) {
        for (let c = 0; c < this.cols; c += 1) {
          if (lane.row >= 1 && lane.row <= 5 && c < this.cols - 1) {
            const lineX = this.gridX + c * this.cell + this.cell * 0.88;
            const lineY = this.gridY + lane.row * this.cell + this.cell * 0.46;
            ctx.fillRect(lineX, lineY, this.cell * 0.4, 4);
          }
        }
        for (const car of lane.cars) {
          const y = this.gridY + lane.row * this.cell + this.cell * 0.18;
          ctx.fillStyle = lane.dir > 0 ? "#ff9d5a" : "#74d0ff";
          ctx.fillRect(car.x, y, car.width, this.cell * 0.64);
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(car.x + 8, y + 8, car.width - 16, 10);
        }
      }

      const px = this.gridX + this.player.col * this.cell + this.cell * 0.15;
      const py = this.gridY + this.player.row * this.cell + this.cell * 0.15;
      ctx.fillStyle = "#ffd45c";
      ctx.fillRect(px, py, this.cell * 0.7, this.cell * 0.7);
    }
  }

  function boot() {
    const root = document.getElementById("game-root");
    if (root) new CrossTheRoadGame(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();