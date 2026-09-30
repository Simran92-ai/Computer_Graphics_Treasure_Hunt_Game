# TREASURE HUNT

A 2D canvas adventure built with plain HTML5, CSS and vanilla JavaScript — no frameworks, no build step, no dependencies.

Explore six themed maps, collect clues and keys, dodge patrolling hazards and monsters, unlock sealed rooms and reach the treasure — alone against the clock, or racing an A* pathfinding computer opponent.

## How to run

1. Unzip the project.
2. Open `index.html` in any modern browser (double-click works — the code uses plain `<script>` tags, not ES modules, so it runs fine straight from disk).

Optional: serve it locally instead, e.g. `python3 -m http.server` and visit `http://localhost:8000`.

## Controls

| Key | Action |
|---|---|
| `W` / `↑` | Move up |
| `S` / `↓` | Move down |
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `M` | Switch world (Mirror World map only) |
| `P` / `Esc` | Pause / resume |

## Gameplay

- **Collectibles:** Coins +10, Clues +50, Keys +100 (unlock doors), Checkpoints +75 (set your respawn point).
- **Fair key rule:** a key only becomes collectible once you've found the clue — the computer opponent follows the same rule.
- **Hazards:** hazard tiles cost 25 health; patrolling obstacles cost 25; **monsters cost 45**.
- **Lives:** 3 lives. At 0 health you respawn at your last checkpoint; at 0 lives it's game over.
- **Hints:** four paid tiers (Basic Direction, Navigation, Advanced Path, Key/Clue Location) with a cooldown.
- **Modes:** Time Challenge, or Compete with Computer.
- **Difficulty:** Easy (2:30), Medium (1:40), Hard (1:15) — also tunes the opponent's speed and reaction time.

## Maps

Lost Jungle · Haunted Mansion · Pirate Island · City Detective · Abandoned Space Station · Mirror World (two switchable dimensions).

Every map has multiple patrolling hazards, including at least two monsters.

## Project structure

```
treasure-hunt/
├── index.html              Markup only; loads CSS and every JS module
├── css/
│   └── style.css           All styling
├── js/
│   ├── main.js             Entry point: boot, global handlers, auto-pause
│   ├── game.js             Game loop, start/stop/pause, win/lose flow
│   ├── gameState.js        Central run state + tuning constants + reset
│   ├── player.js           Player entity, input, per-frame update
│   ├── computerOpponent.js A*-driven AI racer
│   ├── pathfinding.js      A* search
│   ├── collision.js        Tile collision + movement helper
│   ├── animation.js        Water shimmer, monster blob, win-scene trophy
│   ├── camera.js           Camera position (zoom, clamp to map)
│   ├── renderer.js         All canvas drawing + minimap
│   ├── score.js            Score helpers + persistent best scores
│   ├── hints.js            Hint panel and hint tiers
│   ├── timer.js            Countdown tick + mm:ss formatting
│   ├── ui.js               Settings, screens, HUD, map cards, results
│   ├── collectibles.js     Tile pickups, hazards, doors, objectives
│   ├── obstacles.js        Patrolling hazards and monsters
│   └── maps.js             Tile constants + all map definitions
├── assets/
│   ├── images/             (reserved — see note below)
│   └── sprites/            (reserved — see note below)
└── README.md
```

### Architecture

All modules attach to a single global namespace, `TH` (e.g. `TH.Player`, `TH.Renderer`), and are loaded in dependency order by `index.html`. Shared run data lives in one place — `TH.GameState.State` — so modules don't keep private copies that drift out of sync.

Rough dependency flow:

```
maps ─► pathfinding, collision
gameState ─► (state used by everything below)
player / computerOpponent / obstacles ─► collision, collectibles, score
renderer ─► camera, animation, maps, gameState
ui ─► score, timer, hints, animation
game ─► orchestrates all of the above
main ─► boots the app
```

Note: `main.js` is loaded **last** (not first as in the folder listing) because it needs every other module to exist before it boots.

### About the `assets/` folders

The game is drawn entirely with the Canvas 2D API (characters, monsters, tiles, the win-screen trophy), so there are currently no image files to load — which keeps it instant to start and fully self-contained. `assets/images/` and `assets/sprites/` are kept as reserved locations for future art (e.g. swapping the procedural characters for sprite sheets).

## Enhancements in this version

- **Best scores** — the best score for each map / mode / difficulty is saved in `localStorage`, shown on the map-select cards and on the results screen, with a "New Best!" marker.
- **Auto-pause** — the game pauses automatically when you switch browser tabs, so the clock, monsters and AI don't keep running unseen.
- **More monsters** — every map now has at least two.
- **Cleaner results screen** — scrollable, contained buttons, and a minimal trophy icon on victory. A loss to the computer now reads "THE COMPUTER WON" instead of "TIME UP".
- **Simplified menus** — removed the duplicate "Map Selection" entry and the unused Sound/Music toggles.

## Ideas for later

- Sprite-sheet art loaded from `assets/sprites/`
- Sound effects and music (would bring the Sound/Music settings back)
- Touch / on-screen joystick controls for mobile
- More maps and a level editor
