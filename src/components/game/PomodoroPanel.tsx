'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PomodoroPanelProps {
  onClose: () => void;
}

type TimerMode = 'focus' | 'break';

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
};

export function PomodoroPanel({ onClose }: PomodoroPanelProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        // Timer finished
        setRunning(false);
        if (mode === 'focus') {
          setSessions(s => s + 1);
          // Auto-switch to break
          setMode('break');
          return DURATIONS.break;
        } else {
          setMode('focus');
          return DURATIONS.focus;
        }
      }
      return prev - 1;
    });
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  const toggleTimer = () => setRunning(!running);

  const resetTimer = () => {
    setRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / DURATIONS[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-slate-200 bg-white shadow-2xl pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            🍅 Focus Timer
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="px-5 flex gap-2">
          <button
            onClick={() => switchMode('focus')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'focus' ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Focus (25min)
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'break' ? 'bg-green-100 text-green-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Break (5min)
          </button>
        </div>

        {/* Timer display */}
        <div className="p-8 text-center">
          <div className="relative w-48 h-48 mx-auto">
            {/* Progress ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke={mode === 'focus' ? '#ef4444' : '#22c55e'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${progress * 565.49} 565.49`}
                className="transition-all duration-1000"
              />
            </svg>
            {/* Time */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-mono font-bold text-slate-800">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 rounded-xl font-medium transition ${
              running
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            ↺
          </button>
        </div>

        {/* Sessions */}
        {sessions > 0 && (
          <div className="px-5 pb-4 text-center text-sm text-slate-400">
            Sessions completed: {sessions}
          </div>
        )}
      </div>
    </div>
  );
}
