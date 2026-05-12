import type { HotspotContent } from './types';

export const AGENTS_WING_CONTENT: HotspotContent[] = [
  {
    id: 'hall-intro-hotspot',
    roomId: 'hall',
    title: 'Welcome to Knowledge Campus',
    summary: 'This is a spatial practical AI learning environment, not a theory course.',
    body: 'The goal is simple: enter with a real work problem and leave with something useful. In this first wing, you will move from orientation to practical outcomes through a small number of focused rooms.',
    interactionType: 'panel',
    tags: ['hall', 'intro'],
    actions: [{ type: 'mark-complete' }, { type: 'go-to-room', roomId: 'use-cases' }],
  },
  {
    id: 'use-cases-main-hotspot',
    roomId: 'use-cases',
    title: 'Three practical launch paths',
    summary: 'The MVP focuses on content, research, and personal ops automation.',
    body: 'This room is here to anchor the experience in real work. The first path helps with communication and content. The second helps with research and synthesis. The third helps turn recurring tasks into repeatable personal operations.',
    interactionType: 'panel',
    tags: ['use-cases', 'content', 'research', 'ops'],
    actions: [{ type: 'mark-complete' }, { type: 'go-to-room', roomId: 'agents' }],
  },
  {
    id: 'agents-main-hotspot',
    roomId: 'agents',
    title: 'Chatbot vs workflow vs agent',
    summary: 'The distinction matters because it changes what you should build.',
    body: 'A chatbot answers prompts. A workflow follows a fixed path. An agent can inspect context, use tools, and complete bounded tasks. Most users should start with prompt systems and workflows, then graduate into agent behavior where it actually helps.',
    interactionType: 'panel',
    tags: ['agents', 'mental-model', 'tool-use'],
    actions: [{ type: 'mark-complete' }, { type: 'go-to-room', roomId: 'builder' }],
  },
  {
    id: 'builder-main-hotspot',
    roomId: 'builder',
    title: 'Build your first useful output',
    summary: 'This room connects the spatial learning flow to a practical deliverable.',
    body: 'The MVP outcome should be tangible: a reusable prompt, a mini-agent instruction set, or a simple workflow. The point is not maximum complexity. The point is that the player leaves with something they can actually use.',
    interactionType: 'builder',
    tags: ['builder', 'outcome', 'practical'],
    actions: [{ type: 'mark-complete' }, { type: 'open-builder', templateId: 'content-assistant-basic' }],
  },
];

export function getHotspotContentById(id: string) {
  return AGENTS_WING_CONTENT.find((item) => item.id === id) ?? null;
}
