# campus-main.tsx template notes

Create this file in Tiled as an **external tileset**.

## Root project
Open Tiled with project root:
- `projects/knowledge-campus/`

## First source images to add
1. `assets/tilesets/exteriors-main/A2_Floors_MV_TILESET.png`
2. `assets/tilesets/exteriors-main/A2_Floors_MV_TILESET_2.png`
3. `assets/tilesets/exteriors-main/A4_Walls_MV_TILESET.png`
4. `assets/tilesets/office-main/Room_Builder_Office_48x48.png`
5. `assets/tilesets/office-main/Modern_Office_48x48.png`
6. `assets/tilesets/office-main/Modern_Office_Black_Shadow_48x48.png`
7. `assets/tilesets/office-main/Modern_Office_Shadowless_48x48.png`
8. `assets/tilesets/interiors-support/Room_Builder_free_48x48.png`
9. `assets/tilesets/interiors-support/Interiors_free_48x48.png`

## Working assumptions
- tile size: `48x48`
- tileset mode: external/shared
- collision metadata should live here when a blocking tile is reused across many rooms

## First collision candidates
- wall sections
- large desks
- shelves
- sofa blocks
- facade blockers
