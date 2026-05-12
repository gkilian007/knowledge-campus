'use client';

import { useEffect, useRef } from 'react';
import { createGame, destroyGame, getCampusScene } from '@/game';
import type { PanelType } from '@/game/config/constants';

interface GameCanvasProps {
  onPanelOpen?: (panel: PanelType) => void;
  onPanelClose?: () => void;
  onRoomChange?: (room: string) => void;
}

export function GameCanvas({ onPanelOpen, onPanelClose, onRoomChange }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      const game = createGame(containerRef.current.id);
      
      // Wire up scene callbacks after Phaser is ready
      const wireInterval = setInterval(() => {
        const scene = getCampusScene();
        if (scene) {
          scene.onPanelOpen = onPanelOpen;
          scene.onPanelClose = onPanelClose;
          scene.onRoomChange = onRoomChange;
          clearInterval(wireInterval);
        }
      }, 200);
    }, 100);

    return () => {
      clearTimeout(timer);
      destroyGame();
      initialized.current = false;
    };
  }, [onPanelOpen, onPanelClose, onRoomChange]);

  return (
    <div
      ref={containerRef}
      id="campus-game-container"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        background: '#f5f0e6',
      }}
    />
  );
}
