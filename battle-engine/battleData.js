export const TILE_SIZE = 48;
export const VIEWPORT_WIDTH_TILES = 8;
export const VIEWPORT_HEIGHT_TILES = 5;

export const TERRAIN = {
  grass: {
    id: 'grass',
    label: 'Grass',
    moveCost: 1,
    blocksMovement: false,
    blocksLineOfSight: false
  },
  dirt: {
    id: 'dirt',
    label: 'Dirt Path',
    moveCost: 1,
    blocksMovement: false,
    blocksLineOfSight: false
  },
  bush: {
    id: 'bush',
    label: 'Bushes',
    moveCost: 2,
    blocksMovement: false,
    blocksLineOfSight: false
  },
  rock: {
    id: 'rock',
    label: 'Rock',
    moveCost: Infinity,
    blocksMovement: true,
    blocksLineOfSight: true
  },
  tree: {
    id: 'tree',
    label: 'Tree',
    moveCost: Infinity,
    blocksMovement: true,
    blocksLineOfSight: true
  },
  water: {
    id: 'water',
    label: 'Water',
    moveCost: Infinity,
    blocksMovement: true,
    blocksLineOfSight: false
  },
  warning: {
    id: 'warning',
    label: 'Warning',
    moveCost: 1,
    blocksMovement: false,
    blocksLineOfSight: false
  }
};

function makeGrid(width, height, fill = 'grass') {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
}

function paint(grid, coords, type) {
  coords.forEach(([x, y]) => {
    if (grid[y] && grid[y][x]) grid[y][x] = type;
  });
}

function playerCombatants() {
  return [
    {
      id: 'derek',
      name: 'Derek',
      team: 'player',
      role: 'Frontline',
      sprite: 'D',
      spriteClass: 'warrior',
      x: 1,
      y: 2,
      maxHp: 24,
      hp: 24,
      ac: 13,
      initiativeBonus: 1,
      move: 3,
      attackName: 'Sword Slash',
      attackBonus: 4,
      range: 1,
      damageMin: 4,
      damageMax: 8,
      skills: [
        {
          id: 'shield-bash',
          name: 'Shield Bash',
          type: 'damage',
          target: 'enemy',
          range: 1,
          attackBonus: 3,
          damageMin: 2,
          damageMax: 5,
          effect: 'push'
        }
      ]
    },
    {
      id: 'nancy',
      name: 'Nancy',
      team: 'player',
      role: 'Support',
      sprite: 'N',
      spriteClass: 'mage',
      x: 1,
      y: 3,
      maxHp: 16,
      hp: 16,
      ac: 11,
      initiativeBonus: 2,
      move: 3,
      attackName: 'Spark Bolt',
      attackBonus: 4,
      range: 5,
      damageMin: 3,
      damageMax: 6,
      skills: [
        {
          id: 'healing-word',
          name: 'Healing Word',
          type: 'heal',
          target: 'ally',
          range: 5,
          healMin: 4,
          healMax: 8
        },
        {
          id: 'bright-spark',
          name: 'Bright Spark',
          type: 'damage',
          target: 'enemy',
          range: 5,
          attackBonus: 5,
          damageMin: 4,
          damageMax: 7
        }
      ]
    },
    {
      id: 'bob',
      name: 'Bob',
      team: 'player',
      role: 'Heavy',
      sprite: 'B',
      spriteClass: 'tank',
      x: 0,
      y: 4,
      maxHp: 30,
      hp: 30,
      ac: 12,
      initiativeBonus: -1,
      move: 2,
      attackName: 'Heavy Swing',
      attackBonus: 3,
      range: 1,
      damageMin: 6,
      damageMax: 10,
      skills: []
    },
    {
      id: 'jeff',
      name: 'Jeff',
      team: 'player',
      role: 'Ranged',
      sprite: 'J',
      spriteClass: 'rogue',
      x: 0,
      y: 1,
      maxHp: 18,
      hp: 18,
      ac: 12,
      initiativeBonus: 4,
      move: 4,
      attackName: 'Crossbow Shot',
      attackBonus: 5,
      range: 6,
      damageMin: 3,
      damageMax: 7,
      skills: [
        {
          id: 'quick-shot',
          name: 'Quick Shot',
          type: 'damage',
          target: 'enemy',
          range: 6,
          attackBonus: 6,
          damageMin: 2,
          damageMax: 5
        }
      ]
    }
  ];
}

export function createForestRoadEncounter() {
  const width = 12;
  const height = 8;
  const terrain = makeGrid(width, height, 'grass');

  paint(terrain, [[0, 0], [1, 0], [2, 0], [0, 1], [10, 0], [11, 0], [11, 1]], 'tree');
  paint(terrain, [[4, 2], [4, 3], [4, 4], [7, 1], [7, 2]], 'rock');
  paint(terrain, [[2, 5], [3, 5], [4, 5], [5, 5]], 'bush');
  paint(terrain, [[9, 6], [10, 6], [11, 6], [10, 7], [11, 7]], 'water');

  for (let x = 0; x < width; x++) terrain[3][x] = terrain[3][x] === 'grass' ? 'dirt' : terrain[3][x];
  for (let x = 0; x < width; x++) terrain[4][x] = terrain[4][x] === 'grass' ? 'dirt' : terrain[4][x];

  const party = playerCombatants();

  return {
    id: 'forest-road-ambush',
    title: 'Forest Road Ambush',
    width,
    height,
    terrain,
    combatants: [
      ...party,
      {
        id: 'goblin-1',
        name: 'Goblin',
        team: 'enemy',
        role: 'Melee',
        sprite: 'G',
        spriteClass: 'goblin',
        x: 9,
        y: 2,
        maxHp: 12,
        hp: 12,
        ac: 11,
        initiativeBonus: 1,
        move: 3,
        attackName: 'Rusty Blade',
        attackBonus: 3,
        range: 1,
        damageMin: 2,
        damageMax: 5,
        skills: []
      },
      {
        id: 'goblin-archer',
        name: 'Goblin Archer',
        team: 'enemy',
        role: 'Ranged',
        sprite: 'A',
        spriteClass: 'archer',
        x: 10,
        y: 3,
        maxHp: 10,
        hp: 10,
        ac: 10,
        initiativeBonus: 3,
        move: 3,
        attackName: 'Shortbow',
        attackBonus: 4,
        range: 6,
        damageMin: 2,
        damageMax: 6,
        skills: []
      },
      {
        id: 'blue-slime',
        name: 'Blue Slime',
        team: 'enemy',
        role: 'Skirmisher',
        sprite: 'S',
        spriteClass: 'slime',
        x: 8,
        y: 5,
        maxHp: 14,
        hp: 14,
        ac: 9,
        initiativeBonus: 0,
        move: 2,
        attackName: 'Slap',
        attackBonus: 2,
        range: 1,
        damageMin: 1,
        damageMax: 4,
        skills: []
      }
    ]
  };
}

export function createSmallTavernEncounter() {
  const width = 8;
  const height = 5;
  const terrain = makeGrid(width, height, 'dirt');

  paint(terrain, [[3, 1], [3, 2]], 'rock');
  paint(terrain, [[5, 0], [6, 0]], 'bush');

  const party = playerCombatants();
  party[0].x = 0; party[0].y = 1;
  party[1].x = 0; party[1].y = 2;
  party[2].x = 0; party[2].y = 3;
  party[3].x = 1; party[3].y = 2;

  return {
    id: 'small-tavern-brawl',
    title: 'Small Tavern Brawl',
    width,
    height,
    terrain,
    combatants: [
      ...party,
      {
        id: 'goblin-bruiser-1',
        name: 'Bruiser',
        team: 'enemy',
        role: 'Melee',
        sprite: 'G',
        spriteClass: 'goblin',
        x: 5,
        y: 1,
        maxHp: 14,
        hp: 14,
        ac: 11,
        initiativeBonus: 1,
        move: 3,
        attackName: 'Bottle Smash',
        attackBonus: 3,
        range: 1,
        damageMin: 3,
        damageMax: 6,
        skills: []
      },
      {
        id: 'goblin-bruiser-2',
        name: 'Bruiser',
        team: 'enemy',
        role: 'Melee',
        sprite: 'G',
        spriteClass: 'goblin',
        x: 6,
        y: 2,
        maxHp: 14,
        hp: 14,
        ac: 11,
        initiativeBonus: 1,
        move: 3,
        attackName: 'Bottle Smash',
        attackBonus: 3,
        range: 1,
        damageMin: 3,
        damageMax: 6,
        skills: []
      }
    ]
  };
}
