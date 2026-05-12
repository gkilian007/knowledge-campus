import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest } from 'next';

// In-memory state for the campus
interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  room: string;
  lastActive: number;
}

const players = new Map<string, PlayerState>();

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function initSocketServer(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/api/socketio',
  });

  io.on('connection', (socket) => {
    console.log(`[campus] Player connected: ${socket.id}`);

    // Send current players to new connection
    const playerList = Array.from(players.values());
    socket.emit('campus:players', playerList);

    // Player joins
    socket.on('campus:join', (data: { name: string }) => {
      const player: PlayerState = {
        id: socket.id,
        name: data.name || 'Explorer',
        x: 14 * 48 + 24,
        y: 5 * 48 + 24,
        room: 'hall',
        lastActive: Date.now(),
      };
      players.set(socket.id, player);
      socket.broadcast.emit('campus:player-joined', player);
      socket.emit('campus:you', player);
    });

    // Player moves
    socket.on('campus:move', (data: { x: number; y: number; room: string }) => {
      const player = players.get(socket.id);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.room = data.room;
        player.lastActive = Date.now();
        socket.broadcast.emit('campus:player-moved', {
          id: socket.id,
          x: data.x,
          y: data.y,
          room: data.room,
        });
      }
    });

    // Chat message
    socket.on('campus:chat', (data: { message: string }) => {
      const player = players.get(socket.id);
      if (player) {
        io?.emit('campus:chat-message', {
          id: socket.id,
          name: player.name,
          message: data.message,
          timestamp: Date.now(),
        });
      }
    });

    // Player disconnects
    socket.on('disconnect', () => {
      const player = players.get(socket.id);
      if (player) {
        players.delete(socket.id);
        socket.broadcast.emit('campus:player-left', socket.id);
      }
      console.log(`[campus] Player disconnected: ${socket.id}`);
    });
  });

  // Clean up inactive players every 30s
  setInterval(() => {
    const now = Date.now();
    for (const [id, player] of players.entries()) {
      if (now - player.lastActive > 60000) {
        players.delete(id);
        io?.emit('campus:player-left', id);
      }
    }
  }, 30000);

  return io;
}
