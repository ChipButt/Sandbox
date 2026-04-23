Mini Game Library

This zip contains 10 self-contained arcade-style mini-game packages.

Each game has:
- index.html
- style.css
- base.js
- game.js

All packages:
- run on their own
- include a Return to menu button
- send postMessage events back to a parent app
- show a finish screen on success
- reset on failure

Parent app message format:
- source: unique game slug
- type: started | failed | won | exit
- reason: quit | win (only on exit)

Included games:
- Traffic Swerve (traffic-swerve) — Switch lanes and avoid traffic for 30 seconds.
- Cross the Road (cross-the-road) — Make three clean crossings through moving traffic.
- Reaction Rush (reaction-rush) — Hit good targets, avoid bad ones, and clear the score before time runs out.
- Safe Crack (safe-crack) — Time three lock-ins on the moving dial.
- Runner Lite (runner-lite) — Jump the obstacles and survive to the finish.
- Balance Beam (balance-beam) — Keep the wobble in the safe zone until the timer ends.
- Memory Path (memory-path) — Watch the route, then repeat it correctly.
- Catch Sort (catch-sort) — Catch the good drops and avoid the bad ones.
- Barrel Dodge (barrel-dodge) — Weave through bouncing barrels until the wave ends.
- Slingshot Shot (slingshot-shot) — Drag, aim, and fire to hit three targets.

Top-level launcher:
- open index.html in the root of the zip to test all games from one menu.

Added custom venue mini-games:
- clean-the-bus-game
- pick-the-weeds-game
