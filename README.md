# A Place in the Sun - Reusable Basic Island Template

Open `index.html` in a browser to run the playable island.

This is designed as a drop-in game folder:

- `assets/sheets/` keeps the original uploaded tile sheets.
- `assets/tiles/` contains cropped 48px game-ready tiles used by the map.
- `maps/island.map.json` stores map metadata and quest hook points.
- `src/main.js` contains the self-contained renderer, movement, collision, camera, animation, and interaction logic.

Controls:

- Move: WASD or Arrow Keys
- Interact: E or Enter

Quest hook examples are included for:

- Dock arrival
- Central clearing
- Cave entrance
- Cliff lookout

This folder can be copied into any future build as a starter island module.
