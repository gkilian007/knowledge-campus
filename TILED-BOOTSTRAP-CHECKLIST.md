# Tiled Bootstrap Checklist

## Before opening Tiled
- curated 48x48 set exists in `assets/tilesets/`
- support UI exists in `assets/ui/ui-main/`
- hotspot registry exists in `src/lib/maps/hotspotRegistry.ts`
- map manifest exists in `src/lib/maps/mapManifest.ts`

## First session in Tiled
1. create/open project at `projects/knowledge-campus/`
2. create external tileset `tilesets/campus-main.tsx`
3. create `maps/agents-wing-hall.tmx`
4. create `maps/agents-wing-room-01.tmx`
5. create `maps/agents-wing-room-02.tmx`
6. create `maps/agents-wing-room-03.tmx`
7. export `.json` versions beside each `.tmx`

## Object naming to respect
- `hall-intro-hotspot`
- `use-cases-main-hotspot`
- `agents-main-hotspot`
- `builder-main-hotspot`

## Standard layers to respect
- `ground`
- `walls`
- `furniture`
- `collision`
- `hotspots`
- `transitions`
