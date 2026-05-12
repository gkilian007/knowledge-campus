# Phaser map runtime notes

## Intended responsibility
This folder will load exported Tiled JSON maps and bind map objects to the educational hotspot system.

## First runtime path
1. load `maps/agents-wing-hall.json`
2. create collision from `collision` layer
3. inspect `hotspots` object layer
4. match object ids against `src/lib/maps/hotspotRegistry.ts`
5. open the relevant panel or builder action

## Important constraint
Phaser should interpret authored map data. It should not become the place where room geometry is manually rebuilt.
