# Side Scroller — Phaser 4

A side-scrolling game built with Phaser 4 and Vite + TypeScript.

## Stack

- **Phaser 4** — game framework
- **Vite** — dev server and bundler
- **TypeScript** — type-safe game code

## Commands

```
npm run dev      # start dev server at http://localhost:3000
npm run build    # type-check + production build → dist/
npm run preview  # preview production build
```

## Project structure

```
src/
  main.ts              # Phaser.Game config + scene list
  scenes/
    PreloadScene.ts    # procedural texture generation + asset loading
    GameScene.ts       # main gameplay (player, platforms, coins, physics)
    UIScene.ts         # HUD overlay (score, help text)
```

All game assets are generated procedurally in `PreloadScene` via `this.make.graphics()` — no external image files required.

## Controls

| Input | Action |
|---|---|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Arrow Up / W / Space | Jump (press again mid-air for double jump) |

## Phaser 4 Skills

These AI skills ship with `phaser@4` and are automatically available. Reference the relevant skill when asking Claude for help with any Phaser subsystem.

| Skill | Path | When to use |
|---|---|---|
| `game-setup-and-config` | `node_modules/phaser/skills/game-setup-and-config/SKILL.md` | `new Phaser.Game`, `GameConfig`, renderer, pixel art, FPS |
| `scenes` | `node_modules/phaser/skills/scenes/SKILL.md` | Scene lifecycle, transitions, parallel scenes, SceneManager |
| `sprites-and-images` | `node_modules/phaser/skills/sprites-and-images/SKILL.md` | Sprites, images, textures, tint, alpha, origin, depth |
| `physics-arcade` | `node_modules/phaser/skills/physics-arcade/SKILL.md` | Arcade physics, velocity, gravity, colliders, overlap, groups |
| `physics-matter` | `node_modules/phaser/skills/physics-matter/SKILL.md` | Matter.js physics, constraints, compound bodies |
| `input-keyboard-mouse-touch` | `node_modules/phaser/skills/input-keyboard-mouse-touch/SKILL.md` | Keyboard, mouse, touch, pointer, gamepad |
| `cameras` | `node_modules/phaser/skills/cameras/SKILL.md` | Camera follow, shake, fade, zoom, viewports, minimap |
| `animations` | `node_modules/phaser/skills/animations/SKILL.md` | Sprite animations, spritesheets, atlases, AnimationManager |
| `loading-assets` | `node_modules/phaser/skills/loading-assets/SKILL.md` | Loader plugin, images, audio, JSON, tilemaps, progress |
| `graphics-and-shapes` | `node_modules/phaser/skills/graphics-and-shapes/SKILL.md` | Graphics object, shapes, gradients, generated textures |
| `tweens` | `node_modules/phaser/skills/tweens/SKILL.md` | Tweens, easing, chains, stagger, yoyo, TweenManager |
| `particles` | `node_modules/phaser/skills/particles/SKILL.md` | Particle emitters, zones, gravity wells, effects |
| `tilemaps` | `node_modules/phaser/skills/tilemaps/SKILL.md` | Tiled JSON maps, layers, tile collision, tile properties |
| `text-and-bitmaptext` | `node_modules/phaser/skills/text-and-bitmaptext/SKILL.md` | Text, BitmapText, fonts, word wrap, styling |
| `audio-and-sound` | `node_modules/phaser/skills/audio-and-sound/SKILL.md` | SoundManager, music, spatial audio, Web Audio API |
| `groups-and-containers` | `node_modules/phaser/skills/groups-and-containers/SKILL.md` | Groups, containers, object pooling, batch ops |
| `events-system` | `node_modules/phaser/skills/events-system/SKILL.md` | EventEmitter, scene events, custom events |
| `time-and-timers` | `node_modules/phaser/skills/time-and-timers/SKILL.md` | TimerEvent, delayedCall, looping timers, Clock |
| `filters-and-postfx` | `node_modules/phaser/skills/filters-and-postfx/SKILL.md` | Bloom, blur, glow, color matrix, custom shaders |
| `geometry-and-math` | `node_modules/phaser/skills/geometry-and-math/SKILL.md` | Vector2, Rectangle, Circle, distance, angle, lerp, random |
| `scale-and-responsive` | `node_modules/phaser/skills/scale-and-responsive/SKILL.md` | ScaleManager, FIT/RESIZE modes, fullscreen, resize |
| `render-textures` | `node_modules/phaser/skills/render-textures/SKILL.md` | RenderTexture, DynamicTexture, snapshot, off-screen draw |
| `actions-and-utilities` | `node_modules/phaser/skills/actions-and-utilities/SKILL.md` | Align, grid layout, batch group operations |
| `game-object-components` | `node_modules/phaser/skills/game-object-components/SKILL.md` | Transform, Alpha, Tint, Origin, Depth, Flip, Mask mixins |
| `data-manager` | `node_modules/phaser/skills/data-manager/SKILL.md` | setData/getData, data change events, state on game objects |
| `curves-and-paths` | `node_modules/phaser/skills/curves-and-paths/SKILL.md` | Splines, bezier curves, path followers |
| `v4-new-features` | `node_modules/phaser/skills/v4-new-features/SKILL.md` | Filters, RenderNodes, SpriteGPULayer, Gradient, Noise, new tint modes |
| `v3-to-v4-migration` | `node_modules/phaser/skills/v3-to-v4-migration/SKILL.md` | Breaking changes, pipeline → render node, FX → filters, migration checklist |
