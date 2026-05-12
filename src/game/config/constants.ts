// Phaser game configuration
// Using numeric constants instead of Phaser.* to avoid SSR/import-time issues.
// Phaser constants: AUTO=0, RESIZE=2, CENTER_BOTH=2

export const PHASER_AUTO = 0;
export const PHASER_SCALE_RESIZE = 2;
export const PHASER_SCALE_CENTER_BOTH = 2;

export const GAME_CONFIG = {
  type: PHASER_AUTO,
  scale: {
    mode: PHASER_SCALE_RESIZE,
    autoCenter: PHASER_SCALE_CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: undefined as any,
};

export const TILE_SIZE = 48;
export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 30;

// Movement
export const PLAYER_SPEED = 200;

// Colors
export const COLORS = {
  floor: 0xf5f0e6,
  wall: 0x4a5568,
  desk: 0x8b6914,
  plant: 0x48bb78,
  monitor: 0x3182ce,
  couch: 0xb7791f,
  player: 0x2b6cb0,
  hotspot: 0xfbbf24,
  hotspotActive: 0xf59e0b,
  shadow: 0x1a202c,
  door: 0xf5f0e6,
};

// Room names for the HUD
export const ROOM_NAMES: Record<string, string> = {
  hall: 'Knowledge Campus · Hall',
  'use-cases': 'Use Cases Room',
  agents: 'Agents Room',
  pomodoro: 'Focus Zone',
  builder: 'Builder Lab',
  chat: 'Community Chat',
};

// Interactive panel types
export type PanelType = 'welcome' | 'use-cases' | 'agents' | 'pomodoro' | 'builder' | 'chat';

export interface HotspotDef {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  action: string;
  panel: PanelType;
}
