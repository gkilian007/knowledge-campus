# Next Authoring Steps

## Immediate objective
Use the curated 48x48 set to start the first Tiled maps.

## Sequence
1. Open Tiled with project root at `projects/knowledge-campus/`
2. Create external tileset `tilesets/campus-main.tsx`
3. Add these source images first:
   - `assets/tilesets/exteriors-main/A2_Floors_MV_TILESET.png`
   - `assets/tilesets/exteriors-main/A2_Floors_MV_TILESET_2.png`
   - `assets/tilesets/exteriors-main/A4_Walls_MV_TILESET.png`
   - `assets/tilesets/office-main/Room_Builder_Office_48x48.png`
   - `assets/tilesets/office-main/Modern_Office_48x48.png`
4. Create `maps/agents-wing-hall.tmx`
5. Create `maps/agents-wing-room-01.tmx`
6. Add standard layers:
   - `ground`
   - `walls`
   - `furniture`
   - `collision`
   - `hotspots`
   - `transitions`
7. Export `.json` copies beside the `.tmx` maps

## Room-by-room asset usage

### Hall
Use mostly:
- `exteriors-main`
- light signage or transition accents from `office-main`

### Room 01 — Use Cases
Use mostly:
- `office-main`
- optional fillers from `interiors-support`

### Room 02 — Agents
Use mostly:
- `office-main`
- screens, desks, terminal-like furniture

### Room 03 — Builder
Use mostly:
- `office-main`
- `ui-main` accents for interactive station feeling

## Collision rule
- reusable walls/furniture: tile collision where practical
- irregular layout tweaks: object-layer collision
