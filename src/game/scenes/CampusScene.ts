import Phaser from 'phaser';
import { GAME_CONFIG, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, PLAYER_SPEED, PanelType, HotspotDef } from '../config/constants';

interface HotspotZone {
  rect: { x: number; y: number; width: number; height: number; contains: (px: number, py: number) => boolean };
  label: string;
  panel: PanelType;
  marker: Phaser.GameObjects.Rectangle;
  labelObj: Phaser.GameObjects.Text;
}

// Tile indices from Modern_Office_48x48.png (16 cols per row)
// Row 0-4: Walls
// Row 5-7: Chairs, plants, small items
// Row 5-9: Computers, monitors
// Row 10-13: Desks, sofas
// Row 15-17: Workstations with characters

// Room Builder Office (16 cols x 14 rows)
// Row 0-2: Wall outlines/structure
// Row 3-8: Wall fills (purple, gray, brick, wood)
// Row 9+: Floors

// A2_Floors: exterior floors (16x12)
// A4_Walls: exterior walls (16x15)

const TILE = {
  // Floor variants from Room Builder Office (row 9+)
  FLOOR_LIGHT: { key: 'room-builder', col: 0, row: 9 },
  FLOOR_WOOD: { key: 'room-builder', col: 12, row: 9 },
  FLOOR_RED: { key: 'room-builder', col: 8, row: 9 },
  FLOOR_STONE: { key: 'room-builder', col: 12, row: 9 },

  // Exterior floors from A2_Floors
  EX_FLOOR_BRICK: { key: 'ext-floors', col: 0, row: 0 },
  EX_FLOOR_GRASS: { key: 'ext-floors', col: 4, row: 4 },
  EX_FLOOR_ASPHALT: { key: 'ext-floors', col: 2, row: 2 },

  // Walls from Room Builder Office
  WALL_PURPLE: { key: 'room-builder', col: 0, row: 3 },
  WALL_GRAY: { key: 'room-builder', col: 0, row: 5 },
  WALL_BRICK: { key: 'room-builder', col: 0, row: 7 },
  WALL_WOOD: { key: 'room-builder', col: 12, row: 7 },

  // Exterior walls from A4_Walls
  EX_WALL: { key: 'ext-walls', col: 0, row: 0 },

  // Door from Room Builder
  DOOR: { key: 'room-builder', col: 8, row: 0 },

  // Office furniture from Modern_Office
  DESK: { key: 'office', col: 4, row: 10 },
  DESK_DARK: { key: 'office', col: 5, row: 10 },
  CHAIR: { key: 'office', col: 0, row: 5 },
  MONITOR: { key: 'office', col: 7, row: 5 },
  DUAL_MONITOR: { key: 'office', col: 8, row: 5 },
  PLANT: { key: 'office', col: 4, row: 5 },
  SOFA: { key: 'office', col: 0, row: 10 },
  BOOKSHELF: { key: 'office', col: 5, row: 9 },
  PRINTER: { key: 'office', col: 0, row: 8 },
  VENDING: { key: 'office', col: 0, row: 13 },
  COFFEE: { key: 'office', col: 3, row: 13 },

  // Character sprites
  PLAYER_SPRITE: 'player-sprite',
};

export class CampusScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Sprite;
  private playerName!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private collisionMap: number[][] = [];
  private hotspots: HotspotZone[] = [];
  private activePanel: PanelType | null = null;
  private proximityHotspot: HotspotZone | null = null;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private roomTitle!: Phaser.GameObjects.Text;
  private onlineIndicator!: Phaser.GameObjects.Text;
  private joystickDir = { x: 0, y: 0 };
  private joystickActive = false;
  private remotePlayers = new Map<string, Phaser.GameObjects.Container>();
  private moveBroadcastTimer = 0;

  public onPanelOpen?: (panel: PanelType) => void;
  public onPanelClose?: () => void;
  public onRoomChange?: (room: string) => void;
  public onChatMessage?: (msg: { name: string; message: string; timestamp: number }) => void;
  public onOnlineCount?: (count: number) => void;
  public socket: any = null;

  constructor() {
    super({ key: 'CampusScene' });
  }

  preload() {
    // Detect basePath from window location (works for GitHub Pages, Vercel, and local)
    const basePath = typeof window !== 'undefined'
      ? (window.location.pathname.startsWith('/knowledge-campus') ? '/knowledge-campus' : '')
      : '';

    // Load tileset images as spritesheets
    this.load.spritesheet('office', `${basePath}/assets/tilesets/office-main/Modern_Office_48x48.png`, {
      frameWidth: 48, frameHeight: 48,
    });
    this.load.spritesheet('room-builder', `${basePath}/assets/tilesets/office-main/Room_Builder_Office_48x48.png`, {
      frameWidth: 48, frameHeight: 48,
    });
    this.load.spritesheet('office-shadow', `${basePath}/assets/tilesets/office-main/Modern_Office_Black_Shadow_48x48.png`, {
      frameWidth: 48, frameHeight: 48,
    });
    this.load.spritesheet('ext-floors', `${basePath}/assets/tilesets/exteriors-main/A2_Floors_MV_TILESET.png`, {
      frameWidth: 48, frameHeight: 48,
    });
    this.load.spritesheet('ext-floors-2', `${basePath}/assets/tilesets/exteriors-main/A2_Floors_MV_TILESET_2.png`, {
      frameWidth: 48, frameHeight: 48,
    });
    this.load.spritesheet('ext-walls', `${basePath}/assets/tilesets/exteriors-main/A4_Walls_MV_TILESET.png`, {
      frameWidth: 48, frameHeight: 48,
    });
    this.load.spritesheet('interiors', `${basePath}/assets/tilesets/interiors-support/Interiors_free_48x48.png`, {
      frameWidth: 48, frameHeight: 48,
    });
    this.load.spritesheet('room-builder-free', `${basePath}/assets/tilesets/interiors-support/Room_Builder_free_48x48.png`, {
      frameWidth: 48, frameHeight: 48,
    });

    // Character sprites (Adam as default player)
    this.load.spritesheet('player-idle', `${basePath}/assets/characters/interiors-free/Adam_16x16.png`, {
      frameWidth: 16, frameHeight: 16,
    });
    this.load.spritesheet('player-run', `${basePath}/assets/characters/interiors-free/Adam_run_16x16.png`, {
      frameWidth: 16, frameHeight: 16,
    });

    // Remote player sprite (Alex)
    this.load.spritesheet('remote-idle', `${basePath}/assets/characters/interiors-free/Alex_16x16.png`, {
      frameWidth: 16, frameHeight: 16,
    });
  }

  private frameIndex(key: string, col: number, row: number): number {
    const framesPerRow = key === 'room-builder-free' ? 17 : 16;
    return row * framesPerRow + col;
  }

  create() {
    this.buildMap();
    this.createPlayer();
    this.setupInput();
    this.createHUD();
    this.createMobileControls();
    this.setupCamera();
    this.detectRoom();
  }

  private placeTile(x: number, y: number, key: string, col: number, row: number, depth: number = 0) {
    const frame = this.frameIndex(key, col, row);
    const sprite = this.add.sprite(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, key, frame);
    sprite.setDepth(depth);
    sprite.setOrigin(0.5, 0.5);
    // Scale 16x16 character sprites up to 48x48
    if (key.includes('player') || key.includes('remote')) {
      sprite.setScale(3, 3);
    }
    return sprite;
  }

  private buildMap() {
    const mapW = MAP_WIDTH * TILE_SIZE;
    const mapH = MAP_HEIGHT * TILE_SIZE;

    // Background fill
    const floor = this.add.rectangle(mapW / 2, mapH / 2, mapW, mapH, 0xf5f0e6);
    floor.setDepth(0);

    // Build collision map
    this.collisionMap = this.generateCollisionData();

    // Place real tiles
    this.renderRealTilemap();
    this.renderHotspots();
  }

  private generateCollisionData(): number[][] {
    const W = MAP_WIDTH;
    const H = MAP_HEIGHT;
    const map: number[][] = Array.from({ length: H }, () => Array(W).fill(0));

    // Perimeter walls
    for (let x = 0; x < W; x++) { map[0][x] = 1; map[H - 1][x] = 1; }
    for (let y = 0; y < H; y++) { map[y][0] = 1; map[y][W - 1] = 1; }

    // Hall / corridor divider at row 7
    for (let x = 1; x < W - 1; x++) map[7][x] = 1;
    // Doors from hall to rooms
    for (const dx of [5, 6, 7, 13, 14, 15, 21, 22, 23]) map[7][dx] = 0;

    // Second divider at row 14
    for (let x = 1; x < W - 1; x++) map[14][x] = 1;
    for (const dx of [7, 8, 9, 19, 20, 21]) map[14][dx] = 0;

    // Vertical walls between top rooms (rows 8-13)
    for (let y = 8; y < 14; y++) { map[y][9] = 1; map[y][10] = 1; map[y][19] = 1; map[y][20] = 1; }
    // Doors between rooms
    map[11][9] = 0; map[11][10] = 0; map[11][19] = 0; map[11][20] = 0;

    // Desk collisions in builder area
    for (const x of [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23]) { map[18][x] = 1; map[20][x] = 1; }

    // Hall decorative collisions
    map[3][2] = 1; map[3][27] = 1; map[5][2] = 1; map[5][27] = 1;

    // Use Cases room stations
    for (const x of [3, 5, 7]) { map[10][x] = 1; map[12][x] = 1; }

    // Agents room terminals
    for (const x of [12, 14, 16]) { map[10][x] = 1; map[12][x] = 1; }

    // Pomodoro couch area
    for (const x of [23, 24, 25]) map[10][x] = 1;

    return map;
  }

  private renderRealTilemap() {
    // ========== HALL (rows 1-6) — Exterior-style entrance ==========
    // Hall floor — brick pavement from exterior pack
    for (let y = 1; y <= 6; y++) {
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        this.placeTile(x, y, 'ext-floors', 0, 0, 0);
      }
    }

    // Grass accents at hall edges
    for (let y = 1; y <= 2; y++) {
      this.placeTile(1, y, 'ext-floors', 4, 4, 0);
      this.placeTile(MAP_WIDTH - 2, y, 'ext-floors', 4, 4, 0);
    }

    // Reception desk area (center of hall, row 4-5)
    for (let x = 12; x <= 17; x++) {
      this.placeTile(x, 4, 'office', 4, 10, 2);
    }
    // Computer on reception desk
    this.placeTile(14, 3, 'office', 7, 5, 3);
    // Plant behind reception
    this.placeTile(18, 3, 'office', 4, 5, 3);
    this.placeTile(11, 3, 'office', 4, 5, 3);

    // Hall label
    this.add.text(13 * TILE_SIZE, 1.5 * TILE_SIZE, '🧭 HALL', {
      fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#2b6cb0', fontStyle: 'bold',
      backgroundColor: '#ffffffdd', padding: { x: 6, y: 3 },
    }).setDepth(4);

    this.add.text(12 * TILE_SIZE, 4 * TILE_SIZE + TILE_SIZE * 0.6, '💬 Knowledge Campus', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#2d3748', fontStyle: 'bold',
      backgroundColor: '#ffffffcc', padding: { x: 4, y: 2 },
    }).setDepth(4);

    // ========== DIVIDER WALLS (row 7) — Office walls ==========
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (this.collisionMap[7][x] === 1) {
        this.placeTile(x, 7, 'room-builder', 0, 3, 1);
      } else {
        // Door tiles
        this.placeTile(x, 7, 'room-builder', 8, 0, 1);
      }
    }

    // ========== USE CASES ROOM (rows 8-13, cols 1-8) ==========
    // Floor — light floor from room builder
    for (let y = 8; y <= 13; y++) {
      for (let x = 1; x <= 8; x++) {
        if (this.collisionMap[y][x] === 0) {
          this.placeTile(x, y, 'room-builder', 0, 9, 0);
        }
      }
    }

    // Walls for use cases room
    for (let y = 8; y <= 13; y++) {
      if (this.collisionMap[y][9] === 1) this.placeTile(9, y, 'room-builder', 0, 3, 1);
      if (this.collisionMap[y][10] === 1) this.placeTile(10, y, 'room-builder', 1, 3, 1);
    }
    // Door gap
    this.placeTile(9, 11, 'room-builder', 8, 0, 1);
    this.placeTile(10, 11, 'room-builder', 8, 0, 1);

    // Use Cases label
    this.add.text(2 * TILE_SIZE, 8 * TILE_SIZE + 4, '📋 USE CASES', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#2f855a', fontStyle: 'bold',
      backgroundColor: '#ffffffdd', padding: { x: 4, y: 2 },
    }).setDepth(4);

    // Use Cases stations — desks with monitors
    for (const x of [3, 5, 7]) {
      this.placeTile(x, 10, 'office', 4, 10, 2);  // desk
      this.placeTile(x, 9, 'office', 7, 5, 3);     // monitor
      this.placeTile(x, 12, 'office', 0, 5, 2);    // chair
    }

    // ========== AGENTS ROOM (rows 8-13, cols 11-18) ==========
    for (let y = 8; y <= 13; y++) {
      for (let x = 11; x <= 18; x++) {
        if (this.collisionMap[y][x] === 0) {
          this.placeTile(x, y, 'room-builder', 0, 9, 0);
        }
      }
    }

    // Walls for agents room
    for (let y = 8; y <= 13; y++) {
      if (this.collisionMap[y][19] === 1) this.placeTile(19, y, 'room-builder', 0, 3, 1);
      if (this.collisionMap[y][20] === 1) this.placeTile(20, y, 'room-builder', 1, 3, 1);
    }
    this.placeTile(19, 11, 'room-builder', 8, 0, 1);
    this.placeTile(20, 11, 'room-builder', 8, 0, 1);

    // Agents label
    this.add.text(12 * TILE_SIZE, 8 * TILE_SIZE + 4, '🤖 AGENTS', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#6b46c1', fontStyle: 'bold',
      backgroundColor: '#ffffffdd', padding: { x: 4, y: 2 },
    }).setDepth(4);

    // Agents terminals — dual monitors
    for (const x of [12, 14, 16]) {
      this.placeTile(x, 10, 'office', 4, 10, 2);  // desk
      this.placeTile(x, 9, 'office', 8, 5, 3);     // dual monitor
      this.placeTile(x, 12, 'office', 0, 5, 2);    // chair
    }

    // ========== FOCUS / POMODORO ROOM (rows 8-13, cols 21-27) ==========
    for (let y = 8; y <= 13; y++) {
      for (let x = 21; x <= MAP_WIDTH - 2; x++) {
        if (this.collisionMap[y][x] === 0) {
          this.placeTile(x, y, 'room-builder', 0, 9, 0);
        }
      }
    }

    // Focus label
    this.add.text(22 * TILE_SIZE, 8 * TILE_SIZE + 4, '🍅 FOCUS', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#c53030', fontStyle: 'bold',
      backgroundColor: '#ffffffdd', padding: { x: 4, y: 2 },
    }).setDepth(4);

    // Sofa area
    this.placeTile(23, 10, 'office', 0, 10, 2);
    this.placeTile(24, 10, 'office', 1, 10, 2);
    this.placeTile(25, 10, 'office', 2, 10, 2);
    // Coffee machine
    this.placeTile(26, 9, 'office', 3, 13, 3);
    // Bookshelf
    this.placeTile(21, 9, 'office', 5, 9, 3);

    // ========== DIVIDER WALLS (row 14) ==========
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (this.collisionMap[14][x] === 1) {
        this.placeTile(x, 14, 'room-builder', 0, 3, 1);
      } else {
        this.placeTile(x, 14, 'room-builder', 8, 0, 1);
      }
    }

    // ========== BUILDER LAB (rows 15-28) ==========
    for (let y = 15; y <= MAP_HEIGHT - 2; y++) {
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        if (this.collisionMap[y][x] === 0) {
          this.placeTile(x, y, 'room-builder', 0, 9, 0);
        }
      }
    }

    // Builder label
    this.add.text(6 * TILE_SIZE, 15 * TILE_SIZE + 4, '🔨 BUILDER LAB', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#c05621', fontStyle: 'bold',
      backgroundColor: '#ffffffdd', padding: { x: 4, y: 2 },
    }).setDepth(4);

    // Builder workstations
    for (const x of [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23]) {
      this.placeTile(x, 18, 'office', 4, 10, 2);  // desk row 1
      this.placeTile(x, 17, 'office', 7, 5, 3);   // monitor
      this.placeTile(x, 20, 'office', 4, 10, 2);  // desk row 2
      this.placeTile(x, 19, 'office', 7, 5, 3);   // monitor
    }

    // Printer area
    this.placeTile(2, 16, 'office', 0, 8, 3);
    this.placeTile(3, 16, 'office', 1, 8, 3);

    // Vending machine
    this.placeTile(MAP_WIDTH - 3, 16, 'office', 0, 13, 3);
    this.placeTile(MAP_WIDTH - 3, 17, 'office', 1, 13, 3);

    // ========== PERIMETER WALLS ==========
    // Top wall
    for (let x = 0; x < MAP_WIDTH; x++) {
      this.placeTile(x, 0, 'room-builder', 0, 3, 1);
    }
    // Bottom wall
    for (let x = 0; x < MAP_WIDTH; x++) {
      this.placeTile(x, MAP_HEIGHT - 1, 'room-builder', 0, 3, 1);
    }
    // Left wall
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.placeTile(0, y, 'room-builder', 0, 3, 1);
    }
    // Right wall
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.placeTile(MAP_WIDTH - 1, y, 'room-builder', 0, 3, 1);
    }

    // Decorative plants in hall corners
    this.placeTile(2, 3, 'office', 4, 5, 3);
    this.placeTile(27, 3, 'office', 4, 5, 3);
    this.placeTile(2, 5, 'office', 4, 5, 3);
    this.placeTile(27, 5, 'office', 4, 5, 3);
  }

  private renderHotspots() {
    const hotspotDefs: HotspotDef[] = [
      { x: 12, y: 5, width: 6, height: 2, label: 'Welcome to Knowledge Campus', action: 'open-panel', panel: 'welcome' },
      { x: 2, y: 9, width: 7, height: 4, label: 'AI Use Cases', action: 'open-panel', panel: 'use-cases' },
      { x: 11, y: 9, width: 8, height: 4, label: 'Understanding AI Agents', action: 'open-panel', panel: 'agents' },
      { x: 22, y: 9, width: 6, height: 4, label: 'Focus Timer', action: 'open-panel', panel: 'pomodoro' },
      { x: 4, y: 17, width: 20, height: 6, label: 'AI Builder Lab', action: 'open-panel', panel: 'builder' },
      { x: 24, y: 3, width: 3, height: 2, label: 'Community Chat', action: 'open-panel', panel: 'chat' },
    ];

    for (const def of hotspotDefs) {
      const px = def.x * TILE_SIZE;
      const py = def.y * TILE_SIZE;
      const pw = def.width * TILE_SIZE;
      const ph = def.height * TILE_SIZE;

      const marker = this.add.rectangle(px + pw / 2, py + ph / 2, pw - 8, ph - 8, 0xfbbf24, 0.08);
      marker.setDepth(1);
      marker.setStrokeStyle(2, 0xfbbf24, 0.3);

      const labelObj = this.add.text(px + 8, py + ph - 22, `[E] ${def.label}`, {
        fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#b7791f',
        backgroundColor: '#ffffffcc', padding: { x: 4, y: 2 },
      });
      labelObj.setDepth(5);
      labelObj.setVisible(false);

      const zone: HotspotZone = {
        rect: {
          x: px, y: py, width: pw, height: ph,
          contains: (ptx: number, pty: number) => ptx >= px && ptx <= px + pw && pty >= py && pty <= py + ph,
        },
        label: def.label,
        panel: def.panel,
        marker,
        labelObj,
      };
      this.hotspots.push(zone);
    }
  }

  private createPlayer() {
    const spawnX = 14 * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = 5 * TILE_SIZE + TILE_SIZE / 2;

    const shadow = this.add.ellipse(0, 10, 28, 12, 0x1a202c, 0.2);
    shadow.setDepth(9);

    this.playerBody = this.add.sprite(0, 0, 'player-idle', 0);
    this.playerBody.setScale(3, 3);
    this.playerBody.setDepth(10);

    this.playerName = this.add.text(0, -32, 'You', {
      fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#2b6cb0',
      fontStyle: 'bold', backgroundColor: '#ffffffcc', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12);

    this.player = this.add.container(spawnX, spawnY, [shadow, this.playerBody, this.playerName]);
    this.player.setDepth(10);
    this.player.setSize(28, 36);

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(24, 24);
    body.setOffset(-12, -4);
    body.setMaxVelocity(PLAYER_SPEED, PLAYER_SPEED);
  }

  private setupInput() {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKey.on('down', () => this.handleInteract());

    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => this.closePanel());
  }

  private handleInteract() {
    if (this.activePanel) { this.closePanel(); return; }
    if (this.proximityHotspot) this.openPanel(this.proximityHotspot.panel);
  }

  private openPanel(panel: PanelType) {
    this.activePanel = panel;
    this.onPanelOpen?.(panel);
  }

  private closePanel() {
    if (this.activePanel) { this.activePanel = null; this.onPanelClose?.(); }
  }

  public closePanelFromReact() { this.activePanel = null; }

  private createHUD() {
    this.roomTitle = this.add.text(16, 16, 'Knowledge Campus · Hall', {
      fontSize: '16px', fontFamily: 'Inter, sans-serif', color: '#2d3748',
      fontStyle: 'bold', backgroundColor: '#ffffffdd', padding: { x: 8, y: 4 },
    });
    this.roomTitle.setDepth(100).setScrollFactor(0);

    this.onlineIndicator = this.add.text(16, 42, '● 1 online', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#48bb78',
      backgroundColor: '#ffffffcc', padding: { x: 6, y: 2 },
    });
    this.onlineIndicator.setDepth(100).setScrollFactor(0);

    const buttons = [
      { label: '📋 Tasks', x: 16 },
      { label: '📓 Diary', x: 96 },
      { label: '💬 Chat', x: 176 },
      { label: '🎵 Music', x: 256 },
      { label: '🍅 Focus', x: 336 },
      { label: '✕ Exit', x: 416 },
    ];
    buttons.forEach((btn, i) => {
      const bg = this.add.rectangle(btn.x + 32, 74, 64, 28, 0xffffff, 0.9);
      bg.setStrokeStyle(1, 0xa0aec0, 0.5);
      bg.setDepth(100).setScrollFactor(0);

      const text = this.add.text(btn.x + 4, 64, btn.label, {
        fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#2d3748',
      });
      text.setDepth(101).setScrollFactor(0);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        if (i === 2) this.openPanel('chat');
        else if (i === 4) this.openPanel('pomodoro');
      });
    });

    const hint = this.add.text(this.scale.width - 16, this.scale.height - 16, 'WASD / Arrows to move · E to interact', {
      fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#718096',
      backgroundColor: '#ffffffaa', padding: { x: 6, y: 2 },
    });
    hint.setOrigin(1, 1).setDepth(100).setScrollFactor(0);
  }

  private createMobileControls() {
    const isMobile = this.scale.width < 768 || 'ontouchstart' in window;
    if (!isMobile) return;

    const joyX = 80;
    const joyY = this.scale.height - 80;
    const joystickBase = this.add.circle(joyX, joyY, 40, 0x000000, 0.2);
    joystickBase.setStrokeStyle(2, 0xffffff, 0.4);
    joystickBase.setDepth(200).setScrollFactor(0).setInteractive();

    const joystickKnob = this.add.circle(joyX, joyY, 20, 0xffffff, 0.6);
    joystickKnob.setDepth(201).setScrollFactor(0);

    const interX = this.scale.width - 60;
    const interY = this.scale.height - 60;
    const interactBtn = this.add.circle(interX, interY, 28, 0xfbbf24, 0.7);
    interactBtn.setStrokeStyle(2, 0xf59e0b, 1);
    interactBtn.setDepth(200).setScrollFactor(0).setInteractive({ useHandCursor: true });
    interactBtn.on('pointerdown', () => this.handleInteract());

    this.add.text(interX, interY, 'E', {
      fontSize: '18px', fontFamily: 'Inter, sans-serif', color: '#1a202c', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && pointer.x < 160 && pointer.y > this.scale.height - 160) {
        const dx = pointer.x - joyX;
        const dy = pointer.y - joyY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          this.joystickDir.x = dx / dist;
          this.joystickDir.y = dy / dist;
          this.joystickActive = true;
          joystickKnob.x = joyX + (dx / dist) * 25;
          joystickKnob.y = joyY + (dy / dist) * 25;
        }
      }
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 160) {
        this.joystickDir.x = 0; this.joystickDir.y = 0;
        this.joystickActive = false;
        joystickKnob.x = joyX; joystickKnob.y = joyY;
      }
    });
  }

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
  }

  update() {
    if (!this.player) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (this.cursors?.left.isDown || this.wasd?.A.isDown) vx = -1;
    else if (this.cursors?.right.isDown || this.wasd?.D.isDown) vx = 1;
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) vy = -1;
    else if (this.cursors?.down.isDown || this.wasd?.S.isDown) vy = 1;

    if (this.joystickActive) {
      if (Math.abs(this.joystickDir.x) > 0.1) vx = this.joystickDir.x;
      if (Math.abs(this.joystickDir.y) > 0.1) vy = this.joystickDir.y;
    }

    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len; vy /= len;
    }

    body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
    this.handleTileCollisions(body);

    // Flip sprite based on direction
    if (vx < 0) this.playerBody.setFlipX(true);
    else if (vx > 0) this.playerBody.setFlipX(false);

    // Walking animation: bounce
    if (vx !== 0 || vy !== 0) {
      this.playerBody.y = Math.sin(this.time.now / 100) * 2;
    } else {
      this.playerBody.y = 0;
    }

    this.checkHotspotProximity();
    this.detectRoom();
    this.broadcastPosition();
  }

  private broadcastPosition() {
    if (!this.socket?.connected) return;
    this.moveBroadcastTimer++;
    if (this.moveBroadcastTimer % 6 !== 0) return;
    this.socket.emit('campus:move', {
      x: this.player.x,
      y: this.player.y,
      room: this.getCurrentRoom(),
    });
  }

  private getCurrentRoom(): string {
    const py = this.player.y;
    const px = this.player.x;
    const ty = Math.floor(py / TILE_SIZE);
    if (ty >= 8 && ty <= 13) {
      const tx = Math.floor(px / TILE_SIZE);
      if (tx >= 1 && tx <= 9) return 'use-cases';
      else if (tx >= 10 && tx <= 19) return 'agents';
      else if (tx >= 20 && tx <= 28) return 'pomodoro';
    } else if (ty >= 15) return 'builder';
    return 'hall';
  }

  addRemotePlayer(id: string, name: string, x: number, y: number) {
    if (this.remotePlayers.has(id)) return;

    const shadow = this.add.ellipse(0, 10, 28, 12, 0x1a202c, 0.15);
    shadow.setDepth(9);
    const body = this.add.sprite(0, 0, 'remote-idle', 0);
    body.setScale(3, 3);
    body.setDepth(10);
    const label = this.add.text(0, -32, name, {
      fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#6b46c1',
      fontStyle: 'bold', backgroundColor: '#ffffffcc', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12);

    const container = this.add.container(x, y, [shadow, body, label]);
    container.setDepth(10);
    this.remotePlayers.set(id, container);

    this.updateOnlineCount();
  }

  moveRemotePlayer(id: string, x: number, y: number) {
    const container = this.remotePlayers.get(id);
    if (container) {
      this.tweens.add({
        targets: container,
        x, y,
        duration: 100,
        ease: 'Linear',
      });
    }
  }

  removeRemotePlayer(id: string) {
    const container = this.remotePlayers.get(id);
    if (container) {
      container.destroy();
      this.remotePlayers.delete(id);
    }
    this.updateOnlineCount();
  }

  private updateOnlineCount() {
    const count = 1 + this.remotePlayers.size;
    this.onlineIndicator?.setText(`● ${count} online`);
    this.onOnlineCount?.(count);
  }

  sendChatMessage(message: string) {
    if (this.socket?.connected) {
      this.socket.emit('campus:chat', { message });
    }
  }

  private handleTileCollisions(body: Phaser.Physics.Arcade.Body) {
    const px = this.player.x;
    const py = this.player.y;
    const halfW = 12;
    const halfH = 12;

    const checkPoints = [
      { x: px - halfW, y: py - halfH },
      { x: px + halfW, y: py - halfH },
      { x: px - halfW, y: py + halfH },
      { x: px + halfW, y: py + halfH },
    ];

    for (const pt of checkPoints) {
      const tx = Math.floor(pt.x / TILE_SIZE);
      const ty = Math.floor(pt.y / TILE_SIZE);
      if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT) continue;
      if (this.collisionMap[ty][tx] === 1) {
        const tileCenterX = tx * TILE_SIZE + TILE_SIZE / 2;
        const tileCenterY = ty * TILE_SIZE + TILE_SIZE / 2;
        const dx = px - tileCenterX;
        const dy = py - tileCenterY;

        if (Math.abs(dx) > Math.abs(dy)) {
          body.setVelocityX(0);
          if (dx > 0) this.player.x = (tx + 1) * TILE_SIZE + halfW;
          else this.player.x = tx * TILE_SIZE - halfW;
        } else {
          body.setVelocityY(0);
          if (dy > 0) this.player.y = (ty + 1) * TILE_SIZE + halfH;
          else this.player.y = ty * TILE_SIZE - halfH;
        }
      }
    }
  }

  private checkHotspotProximity() {
    const px = this.player.x;
    const py = this.player.y;
    let closest: HotspotZone | null = null;
    let closestDist = Infinity;

    for (const hs of this.hotspots) {
      const centerX = hs.rect.x + hs.rect.width / 2;
      const centerY = hs.rect.y + hs.rect.height / 2;
      const dist = Phaser.Math.Distance.Between(px, py, centerX, centerY);
      const isNear = dist < Math.max(hs.rect.width, hs.rect.height) * 0.8;

      hs.labelObj.setVisible(isNear);
      if (isNear) {
        hs.marker.setFillStyle(0xf59e0b, 0.12);
        if (dist < closestDist) { closest = hs; closestDist = dist; }
      } else {
        hs.marker.setFillStyle(0xfbbf24, 0.06);
      }
    }

    this.proximityHotspot = closest;
  }

  private detectRoom() {
    const py = this.player.y;
    const px = this.player.x;
    const ty = Math.floor(py / TILE_SIZE);

    let room = 'hall';
    if (ty >= 8 && ty <= 13) {
      const tx = Math.floor(px / TILE_SIZE);
      if (tx >= 1 && tx <= 9) room = 'use-cases';
      else if (tx >= 10 && tx <= 19) room = 'agents';
      else if (tx >= 20 && tx <= 28) room = 'pomodoro';
    } else if (ty >= 15) {
      room = 'builder';
    }

    this.roomTitle?.setText(`Knowledge Campus · ${room.charAt(0).toUpperCase() + room.slice(1)}`);
    this.onRoomChange?.(room);
  }
}
