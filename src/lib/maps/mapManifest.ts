export interface CampusMapDefinition {
  id: string;
  title: string;
  tmxPath: string;
  jsonPath: string;
  kind: 'hall' | 'room' | 'corridor';
  roomId?: string;
}

export const CAMPUS_MAPS: CampusMapDefinition[] = [
  {
    id: 'agents-wing-hall',
    title: 'Agents Wing Hall',
    tmxPath: 'maps/agents-wing-hall.tmx',
    jsonPath: 'maps/agents-wing-hall.json',
    kind: 'hall',
  },
  {
    id: 'agents-wing-room-01',
    title: 'Use Cases Room',
    tmxPath: 'maps/agents-wing-room-01.tmx',
    jsonPath: 'maps/agents-wing-room-01.json',
    kind: 'room',
    roomId: 'use-cases',
  },
  {
    id: 'agents-wing-room-02',
    title: 'Agents Room',
    tmxPath: 'maps/agents-wing-room-02.tmx',
    jsonPath: 'maps/agents-wing-room-02.json',
    kind: 'room',
    roomId: 'agents',
  },
  {
    id: 'agents-wing-room-03',
    title: 'Builder Room',
    tmxPath: 'maps/agents-wing-room-03.tmx',
    jsonPath: 'maps/agents-wing-room-03.json',
    kind: 'room',
    roomId: 'builder',
  },
];
