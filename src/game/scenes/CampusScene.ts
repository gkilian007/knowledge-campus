import Phaser from 'phaser';
import { GAME_CONFIG, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, PLAYER_SPEED, COLORS, PanelType, HotspotDef } from '../config/constants';

interface HotspotZone {
  rect: { x: number; y: number; width: number; height: number; contains: (px: number, py: number) => boolean };
  label: string;
  panel: PanelType;
  marker: Phaser.GameObjects.Rectangle;
  labelObj: Phaser.GameObjects.Text;
}

export class CampusScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Rectangle;
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

  // Socket connection (set from React layer)
  public socket: any = null;

  constructor() {
    super({ key: 'CampusScene' });
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

  private buildMap() {
    const mapW = MAP_WIDTH * TILE_SIZE;
    const mapH = MAP_HEIGHT * TILE_SIZE;

    // Floor
    const floor = this.add.rectangle(mapW / 2, mapH / 2, mapW, mapH, COLORS.floor);
    floor.setDepth(0);

    // Build collision map
    this.collisionMap = this.generateCollisionData();

    // Render walls and furniture
    this.renderTilemap();

    // Render hotspot zones
    this.renderHotspots();
  }

  private generateCollisionData(): number[][] {
    const W = MAP_WIDTH;
    const H = MAP_HEIGHT;
    const map: number[][] = Array.from({ length: H }, () => Array(W).fill(0));

    // Walls around perimeter
    for (let x = 0; x < W; x++) { map[0][x] = 1; map[H - 1][x] = 1; }
    for (let y = 0; y < H; y++) { map[y][0] = 1; map[y][W - 1] = 1; }

    // Horizontal divider row 7
    for (let x = 1; x < W - 1; x++) map[7][x] = 1;
    for (const dx of [5, 6, 7, 13, 14, 15, 21, 22, 23]) map[7][dx] = 0;

    // Horizontal divider row 14
    for (let x = 1; x < W - 1; x++) map[14][x] = 1;
    for (const dx of [7, 8, 9, 19, 20, 21]) map[14][dx] = 0;

    // Vertical walls between rooms
    for (let y = 8; y < 14; y++) { map[y][9] = 1; map[y][10] = 1; map[y][19] = 1; map[y][20] = 1; }
    // Doors between rooms
    map[11][9] = 0; map[11][10] = 0; map[11][19] = 0; map[11][20] = 0;

    // Desk collisions in builder area
    for (const x of [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23]) { map[18][x] = 1; map[20][x] = 1; }

    // Plants in hall
    map[3][2] = 1; map[3][27] = 1; map[5][2] = 1; map[5][27] = 1;

    // Use Cases room stations
    for (const x of [3, 5, 7]) { map[10][x] = 1; map[12][x] = 1; }

    // Agents room terminals
    for (const x of [12, 14, 16]) { map[10][x] = 1; map[12][x] = 1; }

    // Pomodoro couch
    for (const x of [23, 24, 25]) map[10][x] = 1;

    return map;
  }

  private renderTilemap() {
    const wallGraphics = this.add.graphics();
    wallGraphics.setDepth(1);

    const furnitureGraphics = this.add.graphics();
    furnitureGraphics.setDepth(2);

    const techXPositions = new Set([3, 5, 7, 12, 14, 16, 20, 21, 22, 23]);
    const techYPositions = new Set([10, 12, 18, 20]);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const cell = this.collisionMap[y][x];

        if (cell === 1) {
          const isPerimeter = (y === 0 || y === MAP_HEIGHT - 1 || x === 0 || x === MAP_WIDTH - 1);
          const isDivider = (y === 7 || y === 14 || x === 9 || x === 10 || x === 19 || x === 20);
          const isFurniture = !isPerimeter && !isDivider;

          if (isFurniture) {
            furnitureGraphics.fillStyle(COLORS.desk, 1);
            furnitureGraphics.fillRoundedRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8, 4);
            if (techYPositions.has(y) && techXPositions.has(x)) {
              furnitureGraphics.fillStyle(COLORS.monitor, 0.7);
              furnitureGraphics.fillRect(px + 12, py + 8, TILE_SIZE - 24, TILE_SIZE - 20);
            }
          } else {
            wallGraphics.fillStyle(COLORS.wall, 1);
            wallGraphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            wallGraphics.fillStyle(0x718096, 0.3);
            wallGraphics.fillRect(px, py, TILE_SIZE, 4);
          }
        }
      }
    }

    // Door indicators
    const doorPositions = [
      { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 },
      { x: 13, y: 7 }, { x: 14, y: 7 }, { x: 15, y: 7 },
      { x: 21, y: 7 }, { x: 22, y: 7 }, { x: 23, y: 7 },
      { x: 7, y: 14 }, { x: 8, y: 14 }, { x: 9, y: 14 },
      { x: 19, y: 14 }, { x: 20, y: 14 }, { x: 21, y: 14 },
      { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 19, y: 11 }, { x: 20, y: 11 },
    ];
    for (const door of doorPositions) {
      const px = door.x * TILE_SIZE;
      const py = door.y * TILE_SIZE;
      wallGraphics.fillStyle(COLORS.door, 1);
      wallGraphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      wallGraphics.lineStyle(2, 0xa0aec0, 0.5);
      wallGraphics.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }

    // Room labels
    const roomLabels = [
      { text: '🧭 HALL', x: 14, y: 2, color: '#2b6cb0' },
      { text: '📋 USE CASES', x: 5, y: 8, color: '#2f855a' },
      { text: '🤖 AGENTS', x: 14, y: 8, color: '#6b46c1' },
      { text: '🍅 FOCUS', x: 24, y: 8, color: '#c53030' },
      { text: '🔨 BUILDER LAB', x: 14, y: 16, color: '#c05621' },
    ];
    for (const rl of roomLabels) {
      const t = this.add.text(rl.x * TILE_SIZE, rl.y * TILE_SIZE, rl.text, {
        fontSize: '12px', fontFamily: 'Inter, sans-serif', color: rl.color, fontStyle: 'bold',
        backgroundColor: '#ffffff90', padding: { x: 4, y: 2 },
      });
      t.setDepth(3);
    }

    // Plants in hall
    this.addPlant(2, 3); this.addPlant(27, 3); this.addPlant(2, 5); this.addPlant(27, 5);

    // Reception desk
    const deskG = this.add.graphics();
    deskG.setDepth(2);
    deskG.fillStyle(COLORS.desk, 1);
    for (let x = 12; x <= 17; x++) {
      deskG.fillRoundedRect(x * TILE_SIZE + 4, 4 * TILE_SIZE + 8, TILE_SIZE - 8, TILE_SIZE - 12, 6);
    }
    this.add.text(13 * TILE_SIZE, 4 * TILE_SIZE + 14, '💬 Knowledge Campus', {
      fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#2d3748', fontStyle: 'bold',
    }).setDepth(3);
  }

  private addPlant(tx: number, ty: number) {
    const g = this.add.graphics();
    g.setDepth(3);
    g.fillStyle(0xc05621, 1);
    g.fillRoundedRect(tx * TILE_SIZE + 14, ty * TILE_SIZE + 28, 20, 16, 3);
    g.fillStyle(COLORS.plant, 1);
    g.fillCircle(tx * TILE_SIZE + 24, ty * TILE_SIZE + 22, 12);
    g.fillStyle(0x68d391, 0.7);
    g.fillCircle(tx * TILE_SIZE + 20, ty * TILE_SIZE + 18, 8);
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

      const marker = this.add.rectangle(px + pw / 2, py + ph / 2, pw - 8, ph - 8, COLORS.hotspot, 0.08);
      marker.setDepth(1);
      marker.setStrokeStyle(2, COLORS.hotspot, 0.3);

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

    const shadow = this.add.ellipse(0, 6, 24, 10, 0x1a202c, 0.2);
    shadow.setDepth(9);

    this.playerBody = this.add.rectangle(0, 0, 28, 36, COLORS.player, 1);
    this.playerBody.setDepth(10);

    const head = this.add.circle(0, -16, 10, 0x2b6cb0, 1);
    head.setDepth(10);

    const eyes = this.add.graphics();
    eyes.fillStyle(0xffffff, 1);
    eyes.fillCircle(-4, -17, 3); eyes.fillCircle(4, -17, 3);
    eyes.fillStyle(0x1a202c, 1);
    eyes.fillCircle(-3, -17, 1.5); eyes.fillCircle(5, -17, 1.5);
    eyes.setDepth(11);

    this.playerName = this.add.text(0, -32, 'You', {
      fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#2b6cb0',
      fontStyle: 'bold', backgroundColor: '#ffffffcc', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12);

    this.player = this.add.container(spawnX, spawnY, [shadow, this.playerBody, head, eyes, this.playerName]);
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

    // Nav buttons
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

    // Interaction hint
    const hint = this.add.text(this.scale.width - 16, this.scale.height - 16, 'WASD / Arrows to move · E to interact', {
      fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#718096',
      backgroundColor: '#ffffffaa', padding: { x: 6, y: 2 },
    });
    hint.setOrigin(1, 1).setDepth(100).setScrollFactor(0);
  }

  private createMobileControls() {
    const isMobile = this.scale.width < 768 || 'ontouchstart' in window;
    if (!isMobile) return;

    // Virtual joystick (bottom-left)
    const joyX = 80;
    const joyY = this.scale.height - 80;
    const joystickBase = this.add.circle(joyX, joyY, 40, 0x000000, 0.2);
    joystickBase.setStrokeStyle(2, 0xffffff, 0.4);
    joystickBase.setDepth(200).setScrollFactor(0).setInteractive();

    const joystickKnob = this.add.circle(joyX, joyY, 20, 0xffffff, 0.6);
    joystickKnob.setDepth(201).setScrollFactor(0);

    // Interact button (bottom-right)
    const interX = this.scale.width - 60;
    const interY = this.scale.height - 60;
    const interactBtn = this.add.circle(interX, interY, 28, 0xfbbf24, 0.7);
    interactBtn.setStrokeStyle(2, 0xf59e0b, 1);
    interactBtn.setDepth(200).setScrollFactor(0).setInteractive({ useHandCursor: true });
    interactBtn.on('pointerdown', () => this.handleInteract());

    this.add.text(interX, interY, 'E', {
      fontSize: '18px', fontFamily: 'Inter, sans-serif', color: '#1a202c', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    // Joystick touch
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

    if (vx < 0) this.playerBody.setScale(-1, 1);
    else if (vx > 0) this.playerBody.setScale(1, 1);

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
    if (this.moveBroadcastTimer % 6 !== 0) return; // Throttle to ~10Hz
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

  // Called from React layer when a remote player joins
  addRemotePlayer(id: string, name: string, x: number, y: number) {
    if (this.remotePlayers.has(id)) return;

    const shadow = this.add.ellipse(0, 6, 24, 10, 0x1a202c, 0.15);
    shadow.setDepth(9);
    const body = this.add.rectangle(0, 0, 28, 36, 0x9f7aea, 1);
    body.setDepth(10);
    const head = this.add.circle(0, -16, 10, 0x9f7aea, 1);
    head.setDepth(10);
    const label = this.add.text(0, -32, name, {
      fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#6b46c1',
      fontStyle: 'bold', backgroundColor: '#ffffffcc', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12);

    const container = this.add.container(x, y, [shadow, body, head, label]);
    container.setDepth(10);
    this.remotePlayers.set(id, container);

    this.updateOnlineCount();
  }

  // Called from React layer when a remote player moves
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

  // Called from React layer when a remote player leaves
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

  // Send chat message via socket
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
        hs.marker.setFillStyle(COLORS.hotspotActive, 0.12);
        if (dist < closestDist) { closest = hs; closestDist = dist; }
      } else {
        hs.marker.setFillStyle(COLORS.hotspot, 0.06);
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
