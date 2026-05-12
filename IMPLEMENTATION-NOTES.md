# Knowledge Campus Implementation Notes

## Current state
The project is now anchored around a Tiled/Phaser authoring pipeline rather than hardcoded room definitions.

## Intentional priority order
1. ingest real asset packs
2. prepare first shared tileset
3. create hall + first rooms in Tiled
4. export JSON maps
5. load maps in Phaser
6. bind hotspots to content system
7. add builder/output flow around the spatial experience

## Important rule
Rooms, barriers, and hotspot placement should be authored visually whenever possible. Runtime code should interpret authored map data, not invent map structure ad hoc.
