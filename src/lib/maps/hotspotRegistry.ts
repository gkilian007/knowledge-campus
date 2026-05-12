export interface CampusHotspotBinding {
  id: string;
  roomId: string;
  contentRef: string;
  interactionType: 'panel' | 'builder' | 'transition';
  templateId?: string;
}

export const HOTSPOT_REGISTRY: CampusHotspotBinding[] = [
  {
    id: 'hall-intro-hotspot',
    roomId: 'hall',
    contentRef: 'hall-intro',
    interactionType: 'panel',
  },
  {
    id: 'use-cases-main-hotspot',
    roomId: 'use-cases',
    contentRef: 'use-cases-three-paths',
    interactionType: 'panel',
  },
  {
    id: 'agents-main-hotspot',
    roomId: 'agents',
    contentRef: 'agents-chatbot-vs-agent',
    interactionType: 'panel',
  },
  {
    id: 'builder-main-hotspot',
    roomId: 'builder',
    contentRef: 'builder-first-output',
    interactionType: 'builder',
    templateId: 'content-assistant-basic',
  },
];
