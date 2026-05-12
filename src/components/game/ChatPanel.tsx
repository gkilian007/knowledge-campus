'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/socket-client';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, onSend, onClose }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white shadow-2xl pointer-events-auto flex flex-col" style={{ maxHeight: '70vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            💬 Community Chat
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              No messages yet. Say something! 👋
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                {msg.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-slate-700">{msg.name}</span>
                  <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-600 break-words">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
