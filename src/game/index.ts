import Phaser from 'phaser';
import { GAME_CONFIG } from './config/constants';
import { CampusScene } from './scenes/CampusScene';

let gameInstance: Phaser.Game | null = null;
let campusScene: CampusScene | null = null;

export function createGame(parentId: string): Phaser.Game {
  if (gameInstance) {
    gameInstance.destroy(true);
  }

  const scene = new CampusScene();
  campusScene = scene;

  const config: Phaser.Types.Core.GameConfig = {
    ...GAME_CONFIG,
    parent: parentId,
    scene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}

export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
    campusScene = null;
  }
}

export function getCampusScene(): CampusScene | null {
  return campusScene;
}

export { CampusScene };
