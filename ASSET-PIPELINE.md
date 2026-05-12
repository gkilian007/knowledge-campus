# Knowledge Campus Asset Pipeline

## Goal
Use a RPG Maker-like workflow where maps, rooms, barriers, and hotspots are authored visually instead of hardcoded.

## Authoring stack
- Tiled for maps, layers, collisions, and hotspot objects
- Phaser for runtime loading and interaction
- Next.js for surrounding UI, panels, and builder flow

## Asset ingestion
1. Drop original packs into `assets/raw/`
2. Normalize reusable tiles into `assets/tilesets/`
3. Move irregular props into `assets/objects/`
4. Move character sprites into `assets/characters/`
5. Keep UI images in `assets/ui/`

## Folder structure
- `assets/raw/` — untouched source packs
- `assets/tilesets/` — prepared tileset PNGs
- `assets/objects/` — irregular props and large objects
- `assets/characters/` — player/NPC sprites
- `assets/ui/` — in-world and shell UI assets
- `maps/` — `.tmx` and exported `.json`
- `tilesets/` — `.tsx` external tilesets

## Tiled conventions
- external tilesets in `tilesets/*.tsx`
- maps in `maps/*.tmx`
- export runtime JSON beside each source map
- required layers:
  - `ground`
  - `walls`
  - `furniture`
  - `collision`
  - `hotspots`
  - `transitions`

## Collision conventions
- repeated blockers use tile collision metadata where possible
- irregular blockers use rectangles/polygons in object layers
- do not hardcode barrier coordinates in Phaser unless fixing a temporary bug

## Hotspot conventions
Each hotspot object should include:
- `id`
- `roomId`
- `contentRef`
- `interactionType`
- optional `templateId`

## MVP maps
- hall
- corridor
- room 01 use cases
- room 02 agents
- room 03 builder

## First practical workflow
1. ingest packs into `assets/raw/`
2. prepare first reusable tileset image in `assets/tilesets/`
3. create `tilesets/campus-main.tsx` in Tiled
4. build `maps/agents-wing-hall.tmx`
5. build `maps/agents-wing-room-01.tmx`
6. export `.json` runtime maps
7. load them in Phaser and bind hotspot metadata to content panels
