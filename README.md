# The Place On The Sun - Drop-in Tactical Battle Engine

This package is a standalone vanilla HTML/CSS/JS battle prototype for a Game Boy-style RPG with D&D-inspired tactical combat.

It is designed as a contained battle module, so your overworld can stay separate. When an encounter starts, you pause the overworld, show the battle screen, run this engine, then return to the overworld when the battle ends.

## What this includes

- Fixed 48x48 battle tiles.
- Fixed visible battle view of 8 tiles wide by 5 tiles tall.
- Larger battle arenas behind the screen.
- Camera scrolling across bigger arenas.
- Initiative order rolled at battle start.
- Up to 4 party members by default.
- Multiple enemies.
- Player movement.
- Dash action.
- Melee and ranged attacks.
- Simple skills, including damage and healing examples.
- Guard action.
- Simple enemy AI:
  - attack if in range;
  - otherwise move toward nearest player;
  - attack after moving if possible.
- Obstacles and terrain types:
  - normal ground;
  - difficult terrain;
  - blocked terrain;
  - line-of-sight blocking terrain.
- Two demo encounters:
  - Forest Road Ambush, a 12x8 scrolling arena;
  - Small Tavern Brawl, an 8x5 fixed arena.

## File structure

```text
place-on-the-sun-battle-engine/
├── index.html
├── README.md
└── battle-engine/
    ├── BattleEngine.js
    ├── battleData.js
    └── battle.css
```

## How to test it locally

Because this uses JavaScript modules, open it through a local server rather than double-clicking `index.html`.

From the package folder, run:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## How to drop it into the main game

Copy this folder into your game project:

```text
battle-engine/
```

Then add the stylesheet to your game page:

```html
<link rel="stylesheet" href="./battle-engine/battle.css" />
```

Add a battle container somewhere in your HTML:

```html
<section id="battleRoot" class="battle-root"></section>
```

Import and start the battle engine from your game script:

```js
import { BattleEngine } from './battle-engine/BattleEngine.js';
import { createForestRoadEncounter } from './battle-engine/battleData.js';

const battleRoot = document.getElementById('battleRoot');

function startEncounter() {
  // 1. Pause overworld input here.
  // 2. Hide or dim overworld here if needed.

  const battle = new BattleEngine({
    root: battleRoot,
    encounter: createForestRoadEncounter(),
    onBattleEnd: (result) => {
      console.log(result);

      // 3. Award XP/gold/items here.
      // 4. Remove enemies from the overworld here if victory.
      // 5. Return to overworld input here.
    }
  });

  battle.start();
}
```

## How the camera works

The battle view is always 8x5 tiles.

The arena can be bigger than that.

Example:

```js
{
  width: 12,
  height: 8,
  terrain: [...]
}
```

The engine keeps tile size and sprite size fixed. It moves the camera instead of shrinking the map.

## How to create a new encounter

Add a new function in `battleData.js`:

```js
export function createShipDeckEncounter() {
  const width = 16;
  const height = 6;
  const terrain = makeGrid(width, height, 'dirt');

  return {
    id: 'ship-deck-fight',
    title: 'Ship Deck Fight',
    width,
    height,
    terrain,
    combatants: [
      // party members and enemies here
    ]
  };
}
```

Each combatant needs:

```js
{
  id: 'unique-id',
  name: 'Derek',
  team: 'player', // or 'enemy'
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
  skills: []
}
```

## Replacing placeholder letters with real sprites

Right now, units use letter placeholders such as `D`, `N`, `B`, `J`, `G`, `A`, and `S`.

Later, replace the `.battle-unit` CSS with background images.

Example:

```css
.unit-warrior {
  background-image: url('../assets/sprites/derek-battle.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  color: transparent;
}
```

The engine itself does not care whether a combatant is displayed as a letter, emoji, or sprite image.

## Recommended next upgrade path

Build this in stages:

1. Connect battle start/end to the overworld.
2. Replace placeholder units with proper 48px sprites.
3. Add character-specific attacks.
4. Add boss warning tiles.
5. Add status effects.
6. Add XP, gold, and item rewards.
7. Add encounter triggers on the overworld map.

## Important design choice

This is not full D&D rules. It is a practical Game Boy-style tactical RPG system with D&D flavour.

That is deliberate. It keeps the game playable, readable, and actually buildable.
