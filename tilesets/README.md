# Tilesets

This folder stores external Tiled `.tsx` tileset definitions.

## First target
Create `campus-main.tsx` in Tiled and bind it to the first prepared tileset image under `assets/tilesets/`.

## Notes
- prefer shared external tilesets over embedded tilesets
- keep collision metadata in the tileset when a blocking object is reused across many rooms
- keep room-specific adjustments in map object layers
