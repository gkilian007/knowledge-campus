export type HotspotInteractionType = 'panel' | 'builder' | 'transition';

export interface HotspotAction {
  type: 'mark-complete' | 'open-builder' | 'go-to-room';
  templateId?: string;
  roomId?: string;
}

export interface HotspotContent {
  id: string;
  roomId: string;
  title: string;
  summary: string;
  body: string;
  interactionType: HotspotInteractionType;
  tags: string[];
  actions: HotspotAction[];
}
