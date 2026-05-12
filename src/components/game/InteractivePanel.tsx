'use client';

import { PanelType } from '@/game/config/constants';

interface InteractivePanelProps {
  panel: PanelType;
  onClose: () => void;
}

const PANEL_CONTENT: Record<PanelType, { title: string; emoji: string; body: string; actions: string[] }> = {
  welcome: {
    title: 'Welcome to Knowledge Campus',
    emoji: '🧭',
    body: 'A spatial RPG-campus where you learn practical AI skills by exploring rooms and interacting with stations. Walk around, discover zones, and level up your AI knowledge.',
    actions: ['Explore the Hall', 'Enter Use Cases Room', 'Start the Agents Wing'],
  },
  'use-cases': {
    title: 'AI Use Cases',
    emoji: '📋',
    body: 'Three real-world paths where AI creates value: Content & Communication, Research & Synthesis, and Personal Ops Automation. Each station shows how AI fits into your actual work.',
    actions: ['Content & Communication →', 'Research & Synthesis →', 'Personal Ops →'],
  },
  agents: {
    title: 'Understanding AI Agents',
    emoji: '🤖',
    body: 'The key distinction: Chatbots answer questions. Workflows chain steps. Agents make decisions and use tools autonomously. Knowing which to use is the difference between a toy and a tool.',
    actions: ['Chatbot vs Workflow vs Agent', 'When to delegate to an agent', 'Build your first agent brief'],
  },
  pomodoro: {
    title: 'Focus Timer',
    emoji: '🍅',
    body: 'Start a focused work session. 25 minutes of deep focus, then a 5-minute break. Walk away from this zone to end the session — or stay and stay focused.',
    actions: ['Start 25 min focus', 'Start 50 min deep work', 'Custom time'],
  },
  builder: {
    title: 'AI Builder Lab',
    emoji: '🔨',
    body: 'The practical output room. Take what you learned and turn it into something usable: a reusable prompt, an agent brief, or a simple workflow design you can implement today.',
    actions: ['Build a Prompt Template', 'Design an Agent Brief', 'Create a Workflow'],
  },
  chat: {
    title: 'Community Chat',
    emoji: '💬',
    body: 'Talk with other learners exploring the campus. Share discoveries, ask questions, or find a study partner for the Agents Wing.',
    actions: ['General Chat', 'Agents Wing Discussion', 'Find a Study Partner'],
  },
};

export function InteractivePanel({ panel, onClose }: InteractivePanelProps) {
  const content = PANEL_CONTENT[panel];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-4 pointer-events-none sm:items-center sm:pb-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-slate-200 bg-white shadow-2xl pointer-events-auto animate-in">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <span className="text-3xl">{content.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 leading-tight">
              {content.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-3">
          <p className="text-sm leading-relaxed text-slate-600">
            {content.body}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          {content.actions.map((action, i) => (
            <button
              key={i}
              onClick={onClose}
              className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-200 transition flex items-center justify-between group"
            >
              <span>{action}</span>
              <span className="text-slate-400 group-hover:text-slate-600 transition">→</span>
            </button>
          ))}
        </div>

        {/* Hint */}
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-400 text-center">
            Press ESC or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
