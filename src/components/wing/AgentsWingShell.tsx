'use client';

import { useState, useEffect } from 'react';
import { AGENTS_WING_CONTENT } from '@/lib/content/agentsWingContent';
import { CAMPUS_MAPS } from '@/lib/maps/mapManifest';
import {
  markRoomComplete,
  isRoomComplete,
  getCompletedRooms,
  type RoomId,
} from '@/lib/progress/progressStore';
import { GuidedRouteBar, type GuidedRouteStep } from './GuidedRouteBar';
import { HotspotPanel } from './HotspotPanel';

const roomOrder = ['hall', 'use-cases', 'agents', 'builder'] as const;

const roomMeta: Record<RoomId, { eyebrow: string; title: string; stage: string; note: string }> = {
  hall: {
    eyebrow: 'Arrival hall',
    title: 'Orientation & diagnosis',
    stage: 'Start here',
    note: 'Enter with a real work problem and get clear on where AI should help first.',
  },
  'use-cases': {
    eyebrow: 'Room 01',
    title: 'Use cases room',
    stage: 'Anchor in real work',
    note: 'Choose the lane that matches the kind of output you actually need.',
  },
  agents: {
    eyebrow: 'Room 02',
    title: 'Agents room',
    stage: 'Build the right mental model',
    note: 'Understand when a prompt, workflow, or agent is the right level of complexity.',
  },
  builder: {
    eyebrow: 'Room 03',
    title: 'Builder room',
    stage: 'Leave with something usable',
    note: 'Finish with a reusable prompt, mini-agent brief, or simple workflow idea.',
  },
};

const mapTitleByRoomId = new Map(
  CAMPUS_MAPS.filter((map) => map.roomId).map((map) => [map.roomId, map.title]),
);

function buildRouteSteps(
  activeRoom: RoomId,
  completedRooms: RoomId[],
): GuidedRouteStep[] {
  return roomOrder.map((roomId, index) => {
    let state: GuidedRouteStep['state'];
    if (completedRooms.includes(roomId)) {
      state = 'complete';
    } else if (roomId === activeRoom) {
      state = 'current';
    } else {
      state = 'upcoming';
    }
    return {
      id: roomId,
      title: roomMeta[roomId].title,
      label: roomMeta[roomId].stage,
      note: roomMeta[roomId].note,
      state,
    };
  });
}

export function AgentsWingShell() {
  const [activeRoom, setActiveRoom] = useState<RoomId>('hall');
  const [completedRooms, setCompletedRooms] = useState<RoomId[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    setCompletedRooms(getCompletedRooms('agents-wing'));
  }, []);

  function handleRoomComplete(roomId: RoomId) {
    markRoomComplete('agents-wing', roomId);
    setCompletedRooms(getCompletedRooms('agents-wing'));
  }

  function handleNavigate(roomId: RoomId) {
    setActiveRoom(roomId);
    setBuilderOpen(false);
  }

  function handleOpenBuilder() {
    setActiveRoom('builder');
    setBuilderOpen(true);
  }

  const activeHotspot = AGENTS_WING_CONTENT.find((c) => c.roomId === activeRoom) ?? null;
  const routeSteps = buildRouteSteps(activeRoom, completedRooms);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.2),transparent_28%),radial-gradient(circle_at_top_right,rgba(36,75,255,0.09),transparent_26%),linear-gradient(180deg,#f9f6f0_0%,#f7f4ee_38%,#f3efe7_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Header section */}
        <section className="overflow-hidden rounded-[36px] border border-campus-ink/10 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-campus-blue">
                Knowledge Campus · Interior wing
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-campus-ink sm:text-5xl">
                Agents Wing
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-campus-ink/70 sm:text-lg">
                This is the first real interior route: a calm guided sequence that turns AI curiosity into a practical
                next move. You move from diagnosis to use cases, from use cases to agent thinking, and from there into
                a first useful build.
              </p>
            </div>

            <div className="rounded-[28px] border border-campus-blue/20 bg-campus-paper/90 p-5 shadow-inner shadow-white/60">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-campus-blue/80">What this wing is for</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-campus-ink/70">
                <p>Not a theory maze. A compact route for people who want clearer decisions and better output.</p>
                <p>Each room answers one practical question before handing you off to the next.</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-campus-ink/70">
                <span className="rounded-full border border-campus-ink/10 bg-white px-3 py-1.5">Practical AI framing</span>
                <span className="rounded-full border border-campus-ink/10 bg-white px-3 py-1.5">Room-by-room guidance</span>
                <span className="rounded-full border border-campus-ink/10 bg-white px-3 py-1.5">Tangible outcome path</span>
              </div>
            </div>
          </div>
        </section>

        {/* Route progress bar */}
        <GuidedRouteBar steps={routeSteps} />

        {/* Main content: rooms + hotspot panel */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.7fr)]">
          {/* Room cards */}
          <div className="grid gap-4">
            {roomOrder.map((roomId, index) => {
              const content = AGENTS_WING_CONTENT.find((c) => c.roomId === roomId);
              if (!content) return null;
              const isActive = roomId === activeRoom;
              const completed = completedRooms.includes(roomId);
              const mapTitle =
                roomId === 'hall' ? 'Agents Wing Hall' : mapTitleByRoomId.get(roomId) ?? 'Mapped room';

              return (
                <article
                  key={roomId}
                  onClick={() => handleNavigate(roomId)}
                  className={`group cursor-pointer rounded-[30px] border p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition sm:p-7 ${
                    isActive
                      ? 'border-campus-blue/50 bg-white/90 shadow-[0_20px_56px_rgba(36,75,255,0.14)]'
                      : completed
                        ? 'border-campus-mint/40 bg-white/80'
                        : 'border-campus-ink/10 bg-white/80 hover:-translate-y-0.5 hover:shadow-[0_22px_56px_rgba(15,23,42,0.12)]'
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                            isActive
                              ? 'bg-campus-blue text-white'
                              : completed
                                ? 'bg-campus-mint/30 text-campus-ink'
                                : 'bg-campus-blue/10 text-campus-blue'
                          }`}
                        >
                          {roomMeta[roomId].eyebrow}
                        </span>
                        <span className="text-sm font-medium text-campus-ink/50">{mapTitle}</span>
                        {completed && (
                          <span className="text-xs font-medium text-campus-mint" aria-label="Completed">
                            ✓
                          </span>
                        )}
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-campus-ink">{roomMeta[roomId].title}</h2>
                      <p className="mt-3 text-base leading-7 text-campus-ink/75">{content.body}</p>
                    </div>

                    <div className="w-full max-w-[220px] rounded-[24px] border border-campus-ink/10 bg-campus-paper/85 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-campus-ink/50">Route position</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-campus-ink">0{index + 1}</p>
                      <p className="mt-2 text-sm leading-6 text-campus-ink/70">{roomMeta[roomId].stage}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                    <div className="rounded-[24px] border border-campus-ink/10 bg-campus-paper/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-campus-ink/50">Room prompt</p>
                      <p className="mt-3 text-lg font-medium text-campus-ink">{content.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {content.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-campus-ink/10 bg-white px-2.5 py-1 text-xs font-medium text-campus-ink/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-campus-blue/20 bg-[linear-gradient(180deg,rgba(36,75,255,0.05),rgba(125,211,252,0.08))] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-campus-blue/80">Why it matters</p>
                      <p className="mt-3 text-sm leading-6 text-campus-ink/75">{roomMeta[roomId].note}</p>
                      <ul className="mt-4 space-y-2 text-sm text-campus-ink/70">
                        {content.actions.map((action, actionIndex) => (
                          <li key={`${roomId}-${action.type}-${actionIndex}`} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-campus-blue" />
                            <span>
                              {action.type === 'mark-complete'
                                ? 'Mark this stop complete when the idea feels clear.'
                                : action.type === 'go-to-room' && action.roomId
                                  ? `Continue onward to ${roomMeta[action.roomId as RoomId].title}.`
                                  : 'Open the builder and turn the lesson into a usable first artifact.'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Hotspot / content panel — sticky sidebar */}
          <aside className="h-fit sticky top-8 rounded-[30px] border border-campus-ink/10 bg-white/70 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
            {activeHotspot ? (
              <>
                {builderOpen && activeRoom === 'builder' ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-campus-blue">Builder room</p>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-campus-ink">
                        {activeHotspot.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-6 text-campus-ink/75">{activeHotspot.body}</p>
                    <div className="rounded-[20px] border border-campus-blue/20 bg-gradient-to-br from-campus-blue/10 to-campus-cyan/10 p-4 text-sm text-campus-ink/75">
                      Builder flow is not yet wired — the template is <code className="text-campus-blue">content-assistant-basic</code>.
                      Continue exploring the wing and check back soon.
                    </div>
                    <button
                      onClick={() => setBuilderOpen(false)}
                      className="flex w-full items-center justify-between rounded-[18px] border border-campus-ink/20 bg-white px-4 py-2.5 text-sm font-medium text-campus-ink/70 transition hover:border-campus-ink/40 hover:text-campus-ink"
                    >
                      <span>Back to room content</span>
                      <span>←</span>
                    </button>
                  </div>
                ) : (
                  <HotspotPanel
                    hotspot={activeHotspot}
                    onNavigate={handleNavigate}
                    onOpenBuilder={handleOpenBuilder}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3 text-sm text-campus-ink/50">
                <p>Select a room to see its content here.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}