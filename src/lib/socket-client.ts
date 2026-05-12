'use client';

import { io, Socket } from 'socket.io-client';

interface RemotePlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  room: string;
}

interface ChatMessage {
  id: string;
  name: string;
  message: string;
  timestamp: number;
}

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io({
    path: '/api/socketio',
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[campus] Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('[campus] Disconnected from server');
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export type { RemotePlayer, ChatMessage };
