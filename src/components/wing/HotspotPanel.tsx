'use client';

import { useState, useEffect } from 'react';
import type { HotspotContent } from '@/lib/content/types';
import {
  markRoomComplete,
  isRoomComplete,
  type RoomId,
} from '@/lib/progress/progressStore';

const WING_ID = 'agents-wing';

const actionLabel: Record<string, (roomId?: string) => string> = {
  'mark-complete': () => 'Mark this stop complete',
  'open-builder': () => 'Open the builder →',
  'go-to-room': (roomId?: string) => {
    if (!roomId) return 'Continue onward →';
    const labels: Record<RoomId, string> = {
      hall: 'Arrival hall',
      'use-cases': 'Use cases room',
      agents: 'Agents room',
      builder: 'Builder room',
    };
    return `Go to ${labels[roomId as RoomId] ?? 'next room'} →`;
  },
};

interface HotspotPanelProps {
  hotspot: HotspotContent;
  onNavigate?: (roomId: RoomId) => void;
  onOpenBuilder?: () => void;
}

export function HotspotPanel({ hotspot, onNavigate, onOpenBuilder }: HotspotPanelProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isRoomComplete(WING_ID, hotspot.roomId as RoomId));
  }, [hotspot.roomId]);

  function handleMarkComplete() {
    markRoomComplete(WING_ID, hotspot.roomId as RoomId);
    setCompleted(true);
  }

  function handleAction(type: string, roomId?: string) {
    if (type === 'mark-complete') {
      handleMarkComplete();
    } else if (type === 'open-builder') {
      onOpenBuilder?.();
    } else if (type === 'go-to-room' && roomId) {
      onNavigate?.(roomId as RoomId);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-campus-blue">
            {hotspot.interactionType === 'builder' ? 'Builder room' : 'Room content'}
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-campus-ink">
            {hotspot.title}
          </h3>
        </div>
        {completed && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-campus-mint/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-campus-ink">
            ✓ Done
          </span>
        )}
      </div>

      {/* Body */}
      <p className="text-sm leading-6 text-campus-ink/75">{hotspot.body}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {hotspot.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-campus-ink/10 bg-white px-2.5 py-1 text-xs font-medium text-campus-ink/70"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      {hotspot.actions.length > 0 && (
        <div className="mt-1 flex flex-col gap-2">
          {hotspot.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleAction(action.type, action.roomId)}
              className="flex w-full items-center justify-between rounded-[18px] border border-campus-blue/30 bg-gradient-to-r from-campus-blue/8 to-campus-cyan/8 px-4 py-2.5 text-left text-sm font-medium text-campus-ink transition hover:border-campus-blue/60 hover:from-campus-blue/15 hover:to-campus-cyan/15 active:scale-[0.99]"
            >
              <span>{actionLabel[action.type]?.(action.roomId) ?? action.type}</span>
              <span className="text-campus-blue">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}