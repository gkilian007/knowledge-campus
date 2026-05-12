# Knowledge Campus Asset Selection

## Current source packs

### 1. Modern Office Revamped v1.2
Best fit for:
- agents wing interior rooms
- desks, screens, chairs, office props
- modern practical AI / workspace vibe

Key useful files observed:
- `Modern_Office_48x48.png`
- `1_Room_Builder_Office/Room_Builder_Office_48x48.png`
- `2_Modern_Office_Black_Shadow/Modern_Office_Black_Shadow_48x48.png`
- `3_Modern_Office_Shadowless/Modern_Office_Shadowless_48x48.png`
- `4_Modern_Office_singles/48x48/*.png`

Recommendation:
Use this as the **primary pack** for room authoring inside the Agents Wing.

---

### 2. Modern Interiors Free v2.2
Best fit for:
- secondary interior support
- lightweight character sprites
- filler assets for room variety

Key useful files observed:
- `Modern tiles_Free/Interiors_free/48x48/Interiors_free_48x48.png`
- `Modern tiles_Free/Interiors_free/48x48/Room_Builder_free_48x48.png`
- `Modern tiles_Free/Characters_free/*.png`

Recommendation:
Use as **support pack**, not as the main backbone.

---

### 3. Modern Exteriors RPG Maker MV
Best fit for:
- hall exterior / campus entrance / facade
- outdoor transitions and exterior framing
- street props and door transitions

Key useful files observed:
- `A2_Floors_MV_TILESET.png`
- `A2_Floors_MV_TILESET_2.png`
- `A4_Walls_MV_TILESET.png`
- `Tileset_*_MV.png`
- animation props like doors, lamps, boxes, dumpsters

Recommendation:
Use this as the **exterior pack** for campus entry and outer framing.

---

### 4. Modern User Interface
Best fit for:
- in-world UI decoration
- panel accents
- icons
- portrait generator if needed later

Key useful files observed:
- `16x16/Modern_UI_Style_1.png`
- `16x16/Modern_UI_Style_2.png`
- `32x32/Modern_UI_Style_1_32x32.png`
- `48x48/Modern_UI_Style_1_48x48.png`
- `Modern_UI_Gamepad*`

Recommendation:
Use selectively for **overlay/UI polish**, not as the main spatial pack.

---

## MVP-first asset strategy

### Primary visual backbone
- **Interior rooms:** Modern Office Revamped 48x48
- **Exterior/hall framing:** Modern Exteriors RPG Maker MV
- **Support/filler:** Modern Interiors Free 48x48
- **UI polish:** Modern User Interface

## Tile-size decision

### Recommended working tile size for MVP
**48x48**

Why:
- all 4 packs expose usable 48x48 variants or RPG Maker-friendly sources
- easiest path to visually rich rooms quickly
- best balance between clarity and authoring speed for the first slice

## First rooms to build with this selection
1. Hall / campus entry
   - exteriors pack + some office signage feel
2. Use Cases room
   - modern office pack
3. Agents room
   - modern office pack
4. Builder room
   - modern office pack + UI accents

## Collision recommendation by pack

### Modern Office
- walls, desks, shelves, sofas: tile collision or blocking object rectangles
- irregular furniture clusters: object-layer collision

### Modern Exteriors
- walls, fences, facades, street blockers: tile collision where reusable
- custom entrance geometry: object-layer collision

### Modern Interiors Free
- mostly support / filler pieces; use object-layer collision when unsure

### Modern UI
- usually non-collidable decorative/overlay material

## Immediate next practical step
1. prepare a first combined working set under `assets/tilesets/`
2. create `tilesets/campus-main.tsx`
3. build `agents-wing-hall.tmx`
4. build `agents-wing-room-01.tmx`
5. add hotspot object conventions directly in Tiled
