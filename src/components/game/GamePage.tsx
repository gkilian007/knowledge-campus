'use client';

import { useState, useCallback } from 'react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { InteractivePanel } from '@/components/game/InteractivePanel';
import type { PanelType } from '@/game/config/constants';

export function GamePage() {
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [currentRoom, setCurrentRoom] = useState('hall');

  const handlePanelOpen = useCallback((panel: PanelType) => {
    setActivePanel(panel);
  }, []);

  const handlePanelClose = useCallback(() => {
    setActivePanel(null);
  }, []);

  const handleRoomChange = useCallback((room: string) => {
    setCurrentRoom(room);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f5f0e6]">
      {/* Game canvas (full screen behind everything) */}
      <GameCanvas
        onPanelOpen={handlePanelOpen}
        onPanelClose={handlePanelClose}
        onRoomChange={handleRoomChange}
      />

      {/* Interactive panel overlay */}
      {activePanel && (
        <InteractivePanel
          panel={activePanel}
          onClose={handlePanelClose}
        />
      )}
    </div>
  );
}
