#!/usr/bin/env python3
"""Generate a Tiled-compatible JSON map for Knowledge Campus Hall.
48x48 tiles, 30x30 grid. Uses Modern Office tileset.
This builds a Pokémon-style campus interior with:
- Entry hall / lobby
- Workstation areas
- Interactive zones (Pomodoro, Chat, Tasks, AI Lab, Library)
- Collision walls
- Object layer for hotspots
"""

import json

W, H = 30, 30
TILE = 48

# Tile IDs from Modern_Office_48x48 (columns 16 per row at 768px wide)
# First tileset tile index starts at 1 (Tiled convention)
# We'll use simple floor/wall/object tiles programmatically

# Build floor layer - all 0s (transparent, we'll paint a floor color via code)
floor = [0] * (W * H)

# Build wall/collision layer
# 1 = wall/collision, 0 = walkable
collision = [0] * (W * H)

# Walls around perimeter
for x in range(W):
    collision[x] = 1  # top
    collision[(H-1)*W + x] = 1  # bottom
for y in range(H):
    collision[y*W] = 1  # left
    collision[y*W + W-1] = 1  # right

# Interior walls to create rooms
# Hall area: rows 1-6, columns 1-28 (open lobby)
# Wing divider: row 7, columns 1-28 (wall with doors)
for x in range(1, W-1):
    collision[7*W + x] = 1

# Door openings in divider (3 tiles wide each)
for dx in [5, 6, 7]:
    collision[7*W + dx] = 0  # left door
for dx in [13, 14, 15]:
    collision[7*W + dx] = 0  # center door
for dx in [21, 22, 23]:
    collision[7*W + dx] = 0  # right door

# Work area north divider: row 14, columns 1-28
for x in range(1, W-1):
    collision[14*W + x] = 1
# Doors
for dx in [7, 8, 9]:
    collision[14*W + dx] = 0
for dx in [19, 20, 21]:
    collision[14*W + dx] = 0

# Vertical walls for room divisions (below divider)
# Room A: cols 1-9, rows 8-13 (Use Cases room)
for y in range(8, 14):
    collision[y*W + 9] = 1

# Room B: cols 10-19, rows 8-13 (Agents room)
for y in range(8, 14):
    collision[y*W + 10] = 1  # left wall of Room B
    collision[y*W + 19] = 1  # right wall of Room B

# Room C: cols 20-28, rows 8-13 (Pomodoro / Break room)
for y in range(8, 14):
    collision[y*W + 20] = 1  # left wall

# Doors between rooms B and C
collision[11*W + 10] = 0  # door from A to B (top)
collision[11*W + 19] = 0  # door from B to C (top)

# Large room below: rows 15-28, cols 1-28 (AI Lab / Builder)
# Add some internal furniture collision (desks, tables)
# Desk rows in the builder area
for x in range(4, 8):
    collision[18*W + x] = 1
    collision[20*W + x] = 1
for x in range(12, 16):
    collision[18*W + x] = 1
    collision[20*W + x] = 1
for x in range(20, 24):
    collision[18*W + x] = 1
    collision[20*W + x] = 1

# Plants / decorations in hall (collision only)
collision[3*W + 2] = 1
collision[3*W + 27] = 1
collision[5*W + 2] = 1
collision[5*W + 27] = 1

# Furniture in rooms
# Use Cases room: 3 stations
for x in [3, 5, 7]:
    collision[10*W + x] = 1
    collision[12*W + x] = 1

# Agents room: terminals
for x in [12, 14, 16]:
    collision[10*W + x] = 1
    collision[12*W + x] = 1

# Pomodoro room: couch area
for x in [23, 24, 25]:
    collision[10*W + x] = 1

# Build furniture layer (visual decorations on top of floor)
# Using tile index 0 = empty, specific tiles for furniture
# We'll use a simple convention: the game renders these as colored rects if no tileset is loaded
furniture = [0] * (W * H)

# Hall decorations
# Reception desk in hall
for x in [12, 13, 14, 15, 16, 17]:
    furniture[4*W + x] = 2  # desk tile

# Plant positions
furniture[3*W + 2] = 3
furniture[3*W + 27] = 3
furniture[5*W + 2] = 3
furniture[5*W + 27] = 3

# Workstation monitors in rooms
# Use Cases room
for x in [3, 5, 7]:
    furniture[10*W + x] = 4  # monitor
    furniture[12*W + x] = 4

# Agents room
for x in [12, 14, 16]:
    furniture[10*W + x] = 4
    furniture[12*W + x] = 4

# Pomodoro room - couch
for x in [23, 24, 25]:
    furniture[10*W + x] = 5  # couch

# Builder room desks
for x in [5, 6, 7, 13, 14, 15, 21, 22, 23]:
    furniture[19*W + x] = 4

# Build hotspot objects
hotspots = []

# Hall intro hotspot
hotspots.append({
    "id": 1,
    "name": "hall-intro-hotspot",
    "type": "hotspot",
    "x": 12 * TILE,
    "y": 5 * TILE,
    "width": 6 * TILE,
    "height": 2 * TILE,
    "properties": {
        "label": "Welcome to Knowledge Campus",
        "action": "open-panel",
        "panel": "welcome"
    }
})

# Use Cases room hotspot
hotspots.append({
    "id": 2,
    "name": "use-cases-main-hotspot",
    "type": "hotspot",
    "x": 2 * TILE,
    "y": 9 * TILE,
    "width": 7 * TILE,
    "height": 4 * TILE,
    "properties": {
        "label": "AI Use Cases",
        "action": "open-panel",
        "panel": "use-cases"
    }
})

# Agents room hotspot
hotspots.append({
    "id": 3,
    "name": "agents-main-hotspot",
    "type": "hotspot",
    "x": 11 * TILE,
    "y": 9 * TILE,
    "width": 8 * TILE,
    "height": 4 * TILE,
    "properties": {
        "label": "Understanding AI Agents",
        "action": "open-panel",
        "panel": "agents"
    }
})

# Pomodoro hotspot
hotspots.append({
    "id": 4,
    "name": "pomodoro-hotspot",
    "type": "hotspot",
    "x": 22 * TILE,
    "y": 9 * TILE,
    "width": 6 * TILE,
    "height": 4 * TILE,
    "properties": {
        "label": "Focus Timer",
        "action": "open-panel",
        "panel": "pomodoro"
    }
})

# Builder room hotspot
hotspots.append({
    "id": 5,
    "name": "builder-main-hotspot",
    "type": "hotspot",
    "x": 4 * TILE,
    "y": 17 * TILE,
    "width": 20 * TILE,
    "height": 6 * TILE,
    "properties": {
        "label": "AI Builder Lab",
        "action": "open-panel",
        "panel": "builder"
    }
})

# Chat hotspot (in hall, near entrance)
hotspots.append({
    "id": 6,
    "name": "chat-hotspot",
    "type": "hotspot",
    "x": 24 * TILE,
    "y": 3 * TILE,
    "width": 3 * TILE,
    "height": 2 * TILE,
    "properties": {
        "label": "Community Chat",
        "action": "open-panel",
        "panel": "chat"
    }
})

# Spawn point
spawn = {
    "id": 10,
    "name": "player-spawn",
    "type": "spawn",
    "x": 14 * TILE,
    "y": 5 * TILE,
    "width": TILE,
    "height": TILE,
    "properties": {}
}

map_data = {
    "compressionlevel": -1,
    "height": H,
    "infinite": False,
    "layers": [
        {
            "data": floor,
            "height": H,
            "id": 1,
            "name": "floor",
            "opacity": 1,
            "type": "tilelayer",
            "visible": True,
            "width": W,
            "x": 0,
            "y": 0
        },
        {
            "data": furniture,
            "height": H,
            "id": 3,
            "name": "furniture",
            "opacity": 1,
            "type": "tilelayer",
            "visible": True,
            "width": W,
            "x": 0,
            "y": 0
        },
        {
            "data": collision,
            "height": H,
            "id": 2,
            "name": "collision",
            "opacity": 0.4,
            "type": "tilelayer",
            "visible": False,
            "width": W,
            "x": 0,
            "y": 0
        },
        {
            "draworder": "topdown",
            "id": 5,
            "name": "hotspots",
            "objects": hotspots + [spawn],
            "opacity": 1,
            "type": "objectgroup",
            "visible": True,
            "x": 0,
            "y": 0
        }
    ],
    "nextlayerid": 6,
    "nextobjectid": 20,
    "orientation": "orthogonal",
    "renderorder": "right-down",
    "tiledversion": "1.11",
    "tileheight": TILE,
    "tilesets": [],
    "tilewidth": TILE,
    "type": "map",
    "version": "1.11",
    "width": W
}

with open("maps/campus-hall.json", "w") as f:
    json.dump(map_data, f, indent=2)

print("Map generated: campus-hall.json")
