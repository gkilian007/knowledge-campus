/**
 * Minimal localStorage-backed progress store for the Knowledge Campus.
 * Persists completed room stops per wing so progress survives page refresh.
 */

const STORAGE_KEY = 'kc-progress:v1';

export type RoomId = 'hall' | 'use-cases' | 'agents' | 'builder';

interface WingProgress {
  completedRooms: RoomId[];
}

interface CampusProgress {
  [wingId: string]: WingProgress;
}

function read(): CampusProgress {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CampusProgress) : {};
  } catch {
    return {};
  }
}

function write(data: CampusProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function ensureWing(wingId: string): WingProgress {
  return { completedRooms: [] };
}

/** Mark a room as complete in a given wing. Idempotent. */
export function markRoomComplete(wingId: string, roomId: RoomId): void {
  const data = read();
  const wing = data[wingId] ?? ensureWing(wingId);
  if (!wing.completedRooms.includes(roomId)) {
    wing.completedRooms = [...wing.completedRooms, roomId];
  }
  data[wingId] = wing;
  write(data);
}

/** Returns true if the given room is marked complete in the wing. */
export function isRoomComplete(wingId: string, roomId: RoomId): boolean {
  const data = read();
  return data[wingId]?.completedRooms.includes(roomId) ?? false;
}

/** Returns all completed room IDs for the given wing. */
export function getCompletedRooms(wingId: string): RoomId[] {
  return read()[wingId]?.completedRooms ?? [];
}

/** Clear all progress (useful during development). */
export function clearAllProgress(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}