import {
  TILE_SIZE,
  VIEWPORT_WIDTH_TILES,
  VIEWPORT_HEIGHT_TILES,
  TERRAIN
} from './battleData.js';

const PLAYER_TEAM = 'player';
const ENEMY_TEAM = 'enemy';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function positionKey(x, y) {
  return `${x},${y}`;
}

function parsePositionKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

function cloneEncounter(encounter) {
  return JSON.parse(JSON.stringify(encounter));
}

export class BattleEngine {
  constructor({ root, encounter, onBattleEnd = () => {} }) {
    if (!root) throw new Error('BattleEngine requires a root element.');
    if (!encounter) throw new Error('BattleEngine requires an encounter object.');

    this.root = root;
    this.encounter = cloneEncounter(encounter);
    this.onBattleEnd = onBattleEnd;

    this.tileSize = TILE_SIZE;
    this.viewWidth = VIEWPORT_WIDTH_TILES;
    this.viewHeight = VIEWPORT_HEIGHT_TILES;

    this.cameraX = 0;
    this.cameraY = 0;
    this.round = 1;
    this.activeIndex = 0;
    this.mode = 'idle';
    this.selectedSkill = null;
    this.reachableTiles = new Map();
    this.targetableTiles = new Set();
    this.battleEnded = false;
    this.enemyThinking = false;

    this.turnState = {
      moved: false,
      acted: false,
      dashed: false
    };

    this.combatants = this.encounter.combatants.map((c) => ({
      ...c,
      hp: Number(c.hp ?? c.maxHp),
      maxHp: Number(c.maxHp),
      alive: true,
      guarding: false,
      initiative: 0,
      initiativeRoll: 0
    }));

    this.ui = {};
  }

  start() {
    this.root.innerHTML = '';
    this.root.classList.add('battle-root--active');
    this.rollInitiative();
    this.buildUI();
    this.log(`${this.encounter.title} begins!`);
    this.log(`Initiative: ${this.combatants.map((c) => `${c.name} ${c.initiative}`).join(' > ')}`);
    this.beginTurn();
  }

  destroy() {
    this.root.innerHTML = '';
    this.root.classList.remove('battle-root--active');
  }

  rollInitiative() {
    this.combatants.forEach((combatant) => {
      combatant.initiativeRoll = rollDie(20);
      combatant.initiative = combatant.initiativeRoll + Number(combatant.initiativeBonus || 0);
    });

    this.combatants.sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (b.initiativeBonus || 0) - (a.initiativeBonus || 0);
    });
  }

  buildUI() {
    this.root.innerHTML = `
      <div class="battle-shell">
        <header class="battle-topbar">
          <div>
            <p class="battle-kicker">Tactical Battle</p>
            <h2 class="battle-title"></h2>
          </div>
          <div class="battle-round"></div>
        </header>

        <section class="battle-main">
          <aside class="battle-side battle-side--left">
            <h3>Initiative</h3>
            <ol class="initiative-list"></ol>
          </aside>

          <section class="battle-center">
            <div class="battle-camera-readout"></div>
            <div class="battle-grid-wrap">
              <div class="battle-edge battle-edge--north">▲</div>
              <div class="battle-edge battle-edge--south">▼</div>
              <div class="battle-edge battle-edge--west">◀</div>
              <div class="battle-edge battle-edge--east">▶</div>
              <div class="battle-grid" role="grid" aria-label="Battle grid"></div>
            </div>
          </section>

          <aside class="battle-side battle-side--right">
            <h3>Party</h3>
            <div class="party-list"></div>
            <h3>Enemies</h3>
            <div class="enemy-list"></div>
          </aside>
        </section>

        <footer class="battle-bottom-panel">
          <section class="active-panel">
            <div class="active-name"></div>
            <div class="active-stats"></div>
          </section>

          <section class="action-panel">
            <button type="button" data-action="move">Move</button>
            <button type="button" data-action="attack">Attack</button>
            <button type="button" data-action="skill">Skill</button>
            <button type="button" data-action="dash">Dash</button>
            <button type="button" data-action="guard">Guard</button>
            <button type="button" data-action="end">End Turn</button>
            <button type="button" data-action="cancel">Cancel</button>
          </section>

          <section class="skill-panel" hidden></section>
          <section class="battle-log" aria-live="polite"></section>
        </footer>
      </div>
    `;

    this.ui.title = this.root.querySelector('.battle-title');
    this.ui.round = this.root.querySelector('.battle-round');
    this.ui.grid = this.root.querySelector('.battle-grid');
    this.ui.initiativeList = this.root.querySelector('.initiative-list');
    this.ui.partyList = this.root.querySelector('.party-list');
    this.ui.enemyList = this.root.querySelector('.enemy-list');
    this.ui.activeName = this.root.querySelector('.active-name');
    this.ui.activeStats = this.root.querySelector('.active-stats');
    this.ui.actionPanel = this.root.querySelector('.action-panel');
    this.ui.skillPanel = this.root.querySelector('.skill-panel');
    this.ui.log = this.root.querySelector('.battle-log');
    this.ui.cameraReadout = this.root.querySelector('.battle-camera-readout');
    this.ui.edgeNorth = this.root.querySelector('.battle-edge--north');
    this.ui.edgeSouth = this.root.querySelector('.battle-edge--south');
    this.ui.edgeWest = this.root.querySelector('.battle-edge--west');
    this.ui.edgeEast = this.root.querySelector('.battle-edge--east');

    this.ui.title.textContent = this.encounter.title;
    this.ui.grid.style.width = `${this.viewWidth * this.tileSize}px`;
    this.ui.grid.style.height = `${this.viewHeight * this.tileSize}px`;
    this.ui.grid.style.gridTemplateColumns = `repeat(${this.viewWidth}, ${this.tileSize}px)`;
    this.ui.grid.style.gridTemplateRows = `repeat(${this.viewHeight}, ${this.tileSize}px)`;

    this.ui.actionPanel.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button || this.battleEnded || this.enemyThinking) return;
      this.handleActionButton(button.dataset.action);
    });
  }

  get activeCombatant() {
    return this.combatants[this.activeIndex];
  }

  getTerrainAt(x, y) {
    const id = this.encounter.terrain[y]?.[x] || 'grass';
    return TERRAIN[id] || TERRAIN.grass;
  }

  getCombatantAt(x, y) {
    return this.combatants.find((c) => c.alive && c.x === x && c.y === y);
  }

  isInsideMap(x, y) {
    return x >= 0 && y >= 0 && x < this.encounter.width && y < this.encounter.height;
  }

  isOccupied(x, y, ignoreId = null) {
    return this.combatants.some((c) => c.alive && c.id !== ignoreId && c.x === x && c.y === y);
  }

  canEnterTile(x, y, mover = null) {
    if (!this.isInsideMap(x, y)) return false;
    const terrain = this.getTerrainAt(x, y);
    if (terrain.blocksMovement) return false;
    if (this.isOccupied(x, y, mover?.id)) return false;
    return true;
  }

  livingTeam(team) {
    return this.combatants.filter((c) => c.alive && c.team === team);
  }

  enemiesOf(combatant) {
    return this.combatants.filter((c) => c.alive && c.team !== combatant.team);
  }

  alliesOf(combatant) {
    return this.combatants.filter((c) => c.alive && c.team === combatant.team);
  }

  beginTurn() {
    if (this.battleEnded) return;
    this.clearModes();

    if (!this.activeCombatant || !this.activeCombatant.alive) {
      this.advanceTurn();
      return;
    }

    const actor = this.activeCombatant;
    actor.guarding = false;
    this.turnState = {
      moved: false,
      acted: false,
      dashed: false
    };

    this.centerCameraOn(actor.x, actor.y);
    this.log(`--- Round ${this.round}: ${actor.name}'s turn ---`);
    this.render();

    if (actor.team === ENEMY_TEAM) {
      this.enemyThinking = true;
      this.setButtonsDisabled(true);
      setTimeout(() => this.runEnemyTurn(actor), 450);
    } else {
      this.enemyThinking = false;
      this.setButtonsDisabled(false);
    }
  }

  advanceTurn() {
    if (this.battleEnded) return;

    this.activeIndex += 1;
    if (this.activeIndex >= this.combatants.length) {
      this.activeIndex = 0;
      this.round += 1;
    }

    this.beginTurn();
  }

  setButtonsDisabled(disabled) {
    this.ui.actionPanel.querySelectorAll('button').forEach((button) => {
      button.disabled = disabled;
    });
  }

  handleActionButton(action) {
    const actor = this.activeCombatant;
    if (!actor || actor.team !== PLAYER_TEAM || !actor.alive) return;

    switch (action) {
      case 'move':
        if (this.turnState.moved || this.turnState.dashed) {
          this.log(`${actor.name} has already moved this turn.`);
          return;
        }
        this.enterMoveMode(actor.move, false);
        break;
      case 'dash':
        if (this.turnState.moved || this.turnState.acted || this.turnState.dashed) {
          this.log(`${actor.name} cannot dash now.`);
          return;
        }
        this.enterMoveMode(actor.move * 2, true);
        break;
      case 'attack':
        if (this.turnState.acted || this.turnState.dashed) {
          this.log(`${actor.name} has already used an action.`);
          return;
        }
        this.enterAttackMode(actor);
        break;
      case 'skill':
        if (this.turnState.acted || this.turnState.dashed) {
          this.log(`${actor.name} has already used an action.`);
          return;
        }
        this.showSkillPanel(actor);
        break;
      case 'guard':
        if (this.turnState.acted || this.turnState.dashed) {
          this.log(`${actor.name} has already used an action.`);
          return;
        }
        this.clearModes();
        actor.guarding = true;
        this.turnState.acted = true;
        this.log(`${actor.name} guards and will take reduced damage until their next turn.`);
        this.endTurnIfComplete(true);
        break;
      case 'end':
        this.clearModes();
        this.advanceTurn();
        break;
      case 'cancel':
        this.clearModes();
        this.render();
        break;
      default:
        break;
    }
  }

  clearModes() {
    this.mode = 'idle';
    this.selectedSkill = null;
    this.reachableTiles.clear();
    this.targetableTiles.clear();
    if (this.ui.skillPanel) {
      this.ui.skillPanel.hidden = true;
      this.ui.skillPanel.innerHTML = '';
    }
  }

  enterMoveMode(movePoints, isDash) {
    const actor = this.activeCombatant;
    this.clearModes();
    this.mode = isDash ? 'dash' : 'move';
    this.reachableTiles = this.findReachableTiles(actor, movePoints);
    this.log(`${actor.name}: choose a tile to ${isDash ? 'dash' : 'move'} to.`);
    this.render();
  }

  enterAttackMode(actor) {
    this.clearModes();
    this.mode = 'attack';
    this.targetableTiles = this.findTargetableTiles(actor, {
      target: 'enemy',
      range: actor.range,
      requiresLineOfSight: actor.range > 1
    });
    this.log(`${actor.name}: choose a target for ${actor.attackName}.`);
    this.render();
  }

  enterSkillMode(actor, skill) {
    this.clearModes();
    this.mode = 'skill';
    this.selectedSkill = skill;
    this.targetableTiles = this.findTargetableTiles(actor, {
      target: skill.target,
      range: skill.range,
      requiresLineOfSight: skill.type === 'damage' && skill.range > 1
    });
    this.log(`${actor.name}: choose a target for ${skill.name}.`);
    this.render();
  }

  showSkillPanel(actor) {
    if (!actor.skills || actor.skills.length === 0) {
      this.log(`${actor.name} has no skills available yet.`);
      return;
    }

    this.ui.skillPanel.hidden = false;
    this.ui.skillPanel.innerHTML = actor.skills.map((skill) => {
      const label = skill.type === 'heal'
        ? `${skill.name} - heal ${skill.healMin}-${skill.healMax}`
        : `${skill.name} - range ${skill.range}`;

      return `<button type="button" data-skill-id="${skill.id}">${label}</button>`;
    }).join('');

    this.ui.skillPanel.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const skill = actor.skills.find((s) => s.id === button.dataset.skillId);
        if (skill) this.enterSkillMode(actor, skill);
      });
    });
  }

  findReachableTiles(actor, maxMove) {
    const frontier = [{ x: actor.x, y: actor.y, cost: 0 }];
    const reached = new Map();
    reached.set(positionKey(actor.x, actor.y), 0);

    while (frontier.length > 0) {
      frontier.sort((a, b) => a.cost - b.cost);
      const current = frontier.shift();
      const neighbours = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const next of neighbours) {
        if (!this.isInsideMap(next.x, next.y)) continue;
        if (!this.canEnterTile(next.x, next.y, actor)) continue;

        const terrain = this.getTerrainAt(next.x, next.y);
        const nextCost = current.cost + terrain.moveCost;
        const key = positionKey(next.x, next.y);

        if (nextCost > maxMove) continue;
        if (!reached.has(key) || nextCost < reached.get(key)) {
          reached.set(key, nextCost);
          frontier.push({ x: next.x, y: next.y, cost: nextCost });
        }
      }
    }

    reached.delete(positionKey(actor.x, actor.y));
    return reached;
  }

  findTargetableTiles(actor, config) {
    const targets = config.target === 'ally'
      ? this.alliesOf(actor).filter((c) => c.id !== actor.id && c.hp < c.maxHp)
      : this.enemiesOf(actor);

    const valid = new Set();
    for (const target of targets) {
      const inRange = distance(actor, target) <= config.range;
      const hasLineOfSight = !config.requiresLineOfSight || this.hasLineOfSight(actor.x, actor.y, target.x, target.y);
      if (inRange && hasLineOfSight) valid.add(positionKey(target.x, target.y));
    }

    return valid;
  }

  hasLineOfSight(x0, y0, x1, y1) {
    const points = this.getLinePoints(x0, y0, x1, y1);
    for (const point of points.slice(1, -1)) {
      const terrain = this.getTerrainAt(point.x, point.y);
      if (terrain.blocksLineOfSight) return false;
    }
    return true;
  }

  getLinePoints(x0, y0, x1, y1) {
    const points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0;
    let y = y0;

    while (true) {
      points.push({ x, y });
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return points;
  }

  handleCellClick(x, y) {
    if (this.battleEnded || this.enemyThinking) return;

    const actor = this.activeCombatant;
    if (!actor || actor.team !== PLAYER_TEAM) return;

    const key = positionKey(x, y);

    if (this.mode === 'move' || this.mode === 'dash') {
      if (!this.reachableTiles.has(key)) {
        this.log('That tile is not reachable this turn.');
        return;
      }

      actor.x = x;
      actor.y = y;
      if (this.mode === 'dash') {
        this.turnState.dashed = true;
        this.turnState.moved = true;
        this.turnState.acted = true;
        this.log(`${actor.name} dashes to a new position and uses their action.`);
      } else {
        this.turnState.moved = true;
        this.log(`${actor.name} moves to a new position.`);
      }

      this.clearModes();
      this.centerCameraOn(actor.x, actor.y);
      this.render();
      this.endTurnIfComplete(this.turnState.dashed);
      return;
    }

    if (this.mode === 'attack') {
      const target = this.getCombatantAt(x, y);
      if (!target || !this.targetableTiles.has(key)) {
        this.log('That target is not valid for this attack.');
        return;
      }
      this.performAttack(actor, target, {
        name: actor.attackName,
        attackBonus: actor.attackBonus,
        damageMin: actor.damageMin,
        damageMax: actor.damageMax
      });
      return;
    }

    if (this.mode === 'skill') {
      const target = this.getCombatantAt(x, y);
      if (!target || !this.targetableTiles.has(key)) {
        this.log('That target is not valid for this skill.');
        return;
      }
      this.performSkill(actor, target, this.selectedSkill);
    }
  }

  performAttack(actor, target, attackConfig) {
    this.clearModes();
    this.centerCameraBetween(actor, target);

    const attackRoll = rollDie(20);
    const total = attackRoll + Number(attackConfig.attackBonus || 0);

    if (attackRoll === 1 || total < target.ac) {
      this.log(`${actor.name} uses ${attackConfig.name} on ${target.name}. Miss! (${total} vs AC ${target.ac})`);
    } else {
      let damage = rollBetween(attackConfig.damageMin, attackConfig.damageMax);
      if (target.guarding) {
        damage = Math.ceil(damage / 2);
        this.log(`${target.name} is guarding and reduces the damage.`);
      }

      target.hp = Math.max(0, target.hp - damage);
      this.log(`${actor.name} uses ${attackConfig.name} on ${target.name} for ${damage} damage.`);
      if (target.hp <= 0) this.defeatCombatant(target);
    }

    this.turnState.acted = true;
    this.render();
    this.checkBattleEnd();
    this.endTurnIfComplete(true);
  }

  performSkill(actor, target, skill) {
    this.clearModes();
    this.centerCameraBetween(actor, target);

    if (skill.type === 'heal') {
      const amount = rollBetween(skill.healMin, skill.healMax);
      const before = target.hp;
      target.hp = Math.min(target.maxHp, target.hp + amount);
      this.log(`${actor.name} uses ${skill.name}. ${target.name} heals ${target.hp - before} HP.`);
    }

    if (skill.type === 'damage') {
      this.performAttack(actor, target, {
        name: skill.name,
        attackBonus: skill.attackBonus ?? actor.attackBonus,
        damageMin: skill.damageMin,
        damageMax: skill.damageMax
      });
      return;
    }

    this.turnState.acted = true;
    this.render();
    this.checkBattleEnd();
    this.endTurnIfComplete(true);
  }

  defeatCombatant(combatant) {
    combatant.alive = false;
    combatant.hp = 0;
    this.log(`${combatant.name} is defeated.`);
  }

  checkBattleEnd() {
    if (this.livingTeam(PLAYER_TEAM).length === 0) {
      this.endBattle('defeat');
      return true;
    }

    if (this.livingTeam(ENEMY_TEAM).length === 0) {
      this.endBattle('victory');
      return true;
    }

    return false;
  }

  endBattle(result) {
    this.battleEnded = true;
    this.clearModes();
    this.render();
    this.setButtonsDisabled(true);
    this.log(result === 'victory' ? 'Victory! All enemies are defeated.' : 'Defeat. The party has fallen.');
    this.onBattleEnd({ result, round: this.round, combatants: this.combatants });
  }

  endTurnIfComplete(force = false) {
    if (this.battleEnded) return;
    if (force || (this.turnState.moved && this.turnState.acted)) {
      setTimeout(() => this.advanceTurn(), 500);
    }
  }

  runEnemyTurn(actor) {
    if (this.battleEnded || !actor.alive) {
      this.enemyThinking = false;
      this.advanceTurn();
      return;
    }

    const enemies = this.enemiesOf(actor);
    if (enemies.length === 0) {
      this.checkBattleEnd();
      return;
    }

    const attackable = enemies
      .filter((target) => distance(actor, target) <= actor.range)
      .filter((target) => actor.range <= 1 || this.hasLineOfSight(actor.x, actor.y, target.x, target.y))
      .sort((a, b) => a.hp - b.hp);

    if (attackable.length > 0) {
      const target = attackable[0];
      this.performAttack(actor, target, {
        name: actor.attackName,
        attackBonus: actor.attackBonus,
        damageMin: actor.damageMin,
        damageMax: actor.damageMax
      });
      this.enemyThinking = false;
      return;
    }

    const nearest = enemies.sort((a, b) => distance(actor, a) - distance(actor, b))[0];
    this.moveEnemyTowards(actor, nearest);

    const nowAttackable = distance(actor, nearest) <= actor.range && (actor.range <= 1 || this.hasLineOfSight(actor.x, actor.y, nearest.x, nearest.y));
    if (nowAttackable) {
      this.performAttack(actor, nearest, {
        name: actor.attackName,
        attackBonus: actor.attackBonus,
        damageMin: actor.damageMin,
        damageMax: actor.damageMax
      });
    } else {
      this.log(`${actor.name} moves closer.`);
      this.render();
      this.enemyThinking = false;
      setTimeout(() => this.advanceTurn(), 500);
    }
  }

  moveEnemyTowards(actor, target) {
    const path = this.findPath(actor, target);
    if (path.length <= 1) return;

    const steps = Math.min(actor.move, path.length - 1);
    const destination = path[steps];
    actor.x = destination.x;
    actor.y = destination.y;
    this.centerCameraOn(actor.x, actor.y);
  }

  findPath(actor, target) {
    const startKey = positionKey(actor.x, actor.y);
    const queue = [{ x: actor.x, y: actor.y }];
    const cameFrom = new Map();
    cameFrom.set(startKey, null);

    while (queue.length > 0) {
      const current = queue.shift();

      if (distance(current, target) <= Math.max(1, actor.range)) {
        return this.reconstructPath(cameFrom, positionKey(current.x, current.y));
      }

      const neighbours = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const next of neighbours) {
        const key = positionKey(next.x, next.y);
        if (cameFrom.has(key)) continue;
        if (!this.canEnterTile(next.x, next.y, actor)) continue;

        cameFrom.set(key, positionKey(current.x, current.y));
        queue.push(next);
      }
    }

    return [{ x: actor.x, y: actor.y }];
  }

  reconstructPath(cameFrom, endKey) {
    const path = [];
    let currentKey = endKey;

    while (currentKey !== null) {
      path.push(parsePositionKey(currentKey));
      currentKey = cameFrom.get(currentKey);
    }

    return path.reverse();
  }

  centerCameraOn(x, y) {
    const maxX = Math.max(0, this.encounter.width - this.viewWidth);
    const maxY = Math.max(0, this.encounter.height - this.viewHeight);

    this.cameraX = clamp(Math.round(x - this.viewWidth / 2), 0, maxX);
    this.cameraY = clamp(Math.round(y - this.viewHeight / 2), 0, maxY);
  }

  centerCameraBetween(a, b) {
    this.centerCameraOn(Math.round((a.x + b.x) / 2), Math.round((a.y + b.y) / 2));
  }

  render() {
    this.renderTopbar();
    this.renderGrid();
    this.renderInitiative();
    this.renderCombatantLists();
    this.renderActivePanel();
    this.updateActionButtons();
  }

  renderTopbar() {
    this.ui.round.textContent = `Round ${this.round}`;
    this.ui.cameraReadout.textContent = `Visible view: ${this.viewWidth}x${this.viewHeight} tiles | Arena: ${this.encounter.width}x${this.encounter.height} tiles | Camera: ${this.cameraX}, ${this.cameraY}`;

    this.ui.edgeNorth.classList.toggle('is-visible', this.cameraY > 0);
    this.ui.edgeSouth.classList.toggle('is-visible', this.cameraY + this.viewHeight < this.encounter.height);
    this.ui.edgeWest.classList.toggle('is-visible', this.cameraX > 0);
    this.ui.edgeEast.classList.toggle('is-visible', this.cameraX + this.viewWidth < this.encounter.width);
  }

  renderGrid() {
    this.ui.grid.innerHTML = '';

    for (let viewY = 0; viewY < this.viewHeight; viewY += 1) {
      for (let viewX = 0; viewX < this.viewWidth; viewX += 1) {
        const mapX = this.cameraX + viewX;
        const mapY = this.cameraY + viewY;
        const terrain = this.getTerrainAt(mapX, mapY);
        const combatant = this.getCombatantAt(mapX, mapY);
        const key = positionKey(mapX, mapY);

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `battle-tile terrain-${terrain.id}`;
        cell.setAttribute('role', 'gridcell');
        cell.dataset.x = String(mapX);
        cell.dataset.y = String(mapY);
        cell.title = `${terrain.label} (${mapX}, ${mapY})`;

        if (this.reachableTiles.has(key)) cell.classList.add('is-reachable');
        if (this.targetableTiles.has(key)) cell.classList.add('is-targetable');

        if (combatant) {
          const unit = document.createElement('span');
          unit.className = `battle-unit team-${combatant.team} unit-${combatant.spriteClass || 'default'}`;
          unit.textContent = combatant.sprite || combatant.name.slice(0, 1);
          unit.title = `${combatant.name}: ${combatant.hp}/${combatant.maxHp} HP`;
          if (combatant.id === this.activeCombatant?.id) unit.classList.add('is-active');
          if (combatant.guarding) unit.classList.add('is-guarding');
          cell.appendChild(unit);
        }

        cell.addEventListener('click', () => this.handleCellClick(mapX, mapY));
        this.ui.grid.appendChild(cell);
      }
    }
  }

  renderInitiative() {
    this.ui.initiativeList.innerHTML = this.combatants.map((c, index) => {
      const activeClass = index === this.activeIndex ? 'is-active' : '';
      const deadClass = c.alive ? '' : 'is-defeated';
      return `
        <li class="initiative-item ${activeClass} ${deadClass}">
          <span>${c.name}</span>
          <small>${c.initiative}</small>
        </li>
      `;
    }).join('');
  }

  renderCombatantLists() {
    this.ui.partyList.innerHTML = this.combatants
      .filter((c) => c.team === PLAYER_TEAM)
      .map((c) => this.combatantCardHTML(c))
      .join('');

    this.ui.enemyList.innerHTML = this.combatants
      .filter((c) => c.team === ENEMY_TEAM)
      .map((c) => this.combatantCardHTML(c))
      .join('');
  }

  combatantCardHTML(c) {
    const hpPercent = Math.max(0, Math.round((c.hp / c.maxHp) * 100));
    const activeClass = c.id === this.activeCombatant?.id ? 'is-active' : '';
    const deadClass = c.alive ? '' : 'is-defeated';
    return `
      <article class="combatant-card ${activeClass} ${deadClass}">
        <div class="combatant-card__top">
          <strong>${c.name}</strong>
          <span>${c.role || ''}</span>
        </div>
        <div class="hp-bar" aria-label="${c.name} HP">
          <span style="width: ${hpPercent}%"></span>
        </div>
        <small>HP ${c.hp}/${c.maxHp} | AC ${c.ac} | Move ${c.move}</small>
      </article>
    `;
  }

  renderActivePanel() {
    const actor = this.activeCombatant;
    if (!actor) return;

    this.ui.activeName.textContent = actor.alive
      ? `${actor.name}'s turn`
      : `${actor.name} is defeated`;

    this.ui.activeStats.textContent = `HP ${actor.hp}/${actor.maxHp} | AC ${actor.ac} | Move ${actor.move} | Attack: ${actor.attackName} range ${actor.range}`;
  }

  updateActionButtons() {
    const actor = this.activeCombatant;
    const isPlayer = actor?.team === PLAYER_TEAM && actor.alive && !this.enemyThinking && !this.battleEnded;

    const buttons = this.ui.actionPanel.querySelectorAll('button[data-action]');
    buttons.forEach((button) => {
      const action = button.dataset.action;
      let disabled = !isPlayer;

      if (isPlayer) {
        if (action === 'move') disabled = this.turnState.moved || this.turnState.dashed;
        if (action === 'attack') disabled = this.turnState.acted || this.turnState.dashed;
        if (action === 'skill') disabled = this.turnState.acted || this.turnState.dashed || !actor.skills?.length;
        if (action === 'dash') disabled = this.turnState.moved || this.turnState.acted || this.turnState.dashed;
        if (action === 'guard') disabled = this.turnState.acted || this.turnState.dashed;
        if (action === 'cancel') disabled = this.mode === 'idle';
        if (action === 'end') disabled = false;
      }

      button.disabled = disabled;
    });
  }

  log(message) {
    if (!this.ui.log) return;
    const entry = document.createElement('p');
    entry.textContent = message;
    this.ui.log.prepend(entry);

    const entries = [...this.ui.log.querySelectorAll('p')];
    entries.slice(14).forEach((node) => node.remove());
  }
}
