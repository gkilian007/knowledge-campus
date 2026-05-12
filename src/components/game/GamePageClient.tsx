'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { InteractivePanel } from '@/components/game/InteractivePanel';
import { PomodoroPanel } from '@/components/game/PomodoroPanel';
import { ChatPanel } from '@/components/game/ChatPanel';
import { connectSocket, disconnectSocket, getSocket, type ChatMessage } from '@/lib/socket-client';
import type { PanelType } from '@/game/config/constants';
import { getCampusScene } from '@/game';

export function GamePageClient() {
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [currentRoom, setCurrentRoom] = useState('hall');
  const [onlineCount, setOnlineCount] = useState(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Connect socket on mount
  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('campus:join', { name: 'Explorer' });

      // Wire socket events to the Phaser scene
      const wireScene = () => {
        const scene = getCampusScene();
        if (scene) {
          scene.socket = socket;

          socket.on('campus:player-joined', (player: any) => {
            scene.addRemotePlayer(player.id, player.name, player.x, player.y);
          });

          socket.on('campus:player-moved', (data: any) => {
            scene.moveRemotePlayer(data.id, data.x, data.y);
          });

          socket.on('campus:player-left', (id: string) => {
            scene.removeRemotePlayer(id);
          });

          socket.on('campus:chat-message', (msg: ChatMessage) => {
            setChatMessages(prev => [...prev.slice(-50), msg]);
          });

          socket.on('campus:players', (players: any[]) => {
            for (const p of players) {
              if (p.id !== socket.id) {
                scene.addRemotePlayer(p.id, p.name, p.x, p.y);
              }
            }
          });
        }
      };

      // Small delay for scene to be ready
      setTimeout(wireScene, 500);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const handlePanelOpen = useCallback((panel: PanelType) => {
    setActivePanel(panel);
  }, []);

  const handlePanelClose = useCallback(() => {
    setActivePanel(null);
  }, []);

  const handleRoomChange = useCallback((room: string) => {
    setCurrentRoom(room);
  }, []);

  const handleOnlineCount = useCallback((count: number) => {
    setOnlineCount(count);
  }, []);

  const handleSendChat = useCallback((message: string) => {
    const scene = getCampusScene();
    scene?.sendChatMessage(message);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f5f0e6]">
      {/* Game canvas */}
      <GameCanvas
        onPanelOpen={handlePanelOpen}
        onPanelClose={handlePanelClose}
        onRoomChange={handleRoomChange}
      />

      {/* Connection status */}
      <div className="fixed top-2 right-2 z-50">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          socketConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {socketConnected ? `● ${onlineCount} online` : '○ Connecting...'}
        </div>
      </div>

      {/* Pomodoro panel (special, with timer) */}
      {activePanel === 'pomodoro' && (
        <PomodoroPanel onClose={handlePanelClose} />
      )}

      {/* Chat panel (special, with messages) */}
      {activePanel === 'chat' && (
        <ChatPanel
          messages={chatMessages}
          onSend={handleSendChat}
          onClose={handlePanelClose}
        />
      )}

      {/* Generic interactive panels */}
      {activePanel && activePanel !== 'pomodoro' && activePanel !== 'chat' && (
        <InteractivePanel panel={activePanel} onClose={handlePanelClose} />
      )}
    </div>
  );
}
