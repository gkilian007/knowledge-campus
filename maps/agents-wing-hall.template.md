# agents-wing-hall.tmx template

## Goal
Create the first campus entry / hall map.

## Required layers
- `ground`
- `walls`
- `furniture`
- `collision`
- `hotspots`
- `transitions`

## Minimum composition
- exterior arrival zone
- entrance facade / threshold
- welcome sign or campus title zone
- corridor or portal leading toward the wing
- one intro hotspot object: `hall-intro-hotspot`

## Transition objects
Suggested object ids:
- `to-use-cases-room`
- `back-to-entry`

## Collision guidance
- outer walls: reusable tile collision where possible
- custom entrance edges: object rectangles/polygons
