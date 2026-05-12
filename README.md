# Knowledge Campus

Spatial, practical AI learning product. Think RPG-campus meets real-world AI skills — each wing is a guided route that turns curiosity into usable output.

## MVP — Agents Wing

The first playable wing: a four-room guided sequence that takes learners from diagnosis to a first practical AI artifact.

| Room | Purpose |
|------|---------|
| **Hall** | Orientation & diagnosis — enter with a real work problem |
| **Use Cases** | Anchor in real work — pick the lane that matches your output |
| **Agents** | Build the right mental model — prompt vs workflow vs agent |
| **Builder** | Leave with something usable — a reusable prompt, agent brief, or workflow |

Features:
- Guided route bar with progress tracking
- Room-by-room hotspot content panels
- Local progress persistence (localStorage)
- Responsive layout, works on mobile and desktop

## Tech stack

- **Next.js 15** (App Router, static export)
- **React 19**
- **Tailwind CSS 3**
- **Phaser 3** (ready for future tile-map integration)
- **TypeScript 5**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/wing/agents](http://localhost:3000/wing/agents) to see the Agents Wing.

## Build

```bash
npm run build
```

## Project structure

```
src/
  app/                    # Next.js App Router pages
    wing/agents/          # Agents Wing page
  components/wing/        # Wing UI components
  lib/
    content/              # Room content & types
    maps/                 # Map manifest & hotspot registry
    progress/             # Local progress store
assets/                   # Tilesets, characters, UI sprites
maps/                     # Tiled map templates
tilesets/                 # Tileset source docs
```

## Authoring pipeline

Content maps follow an RPG Maker-like pipeline: Tiled for spatial layout, Phaser for rendering, Next.js for the surrounding app shell. See `ASSET-PIPELINE.md` for details.

## License

Private — all rights reserved.
