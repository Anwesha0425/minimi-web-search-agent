import React from 'react';
import { Session } from '@/lib/agent/types';
import { MessageSquare, Plus, RotateCcw, Search, Sparkles, Terminal } from 'lucide-react';

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onResetBenchmarks: () => void;
  activeProviderName?: string;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onResetBenchmarks,
  activeProviderName = 'Web Search (Tavily/DDG)',
}) => {
  return (
    <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950 flex flex-col h-full flex-shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
            M
          </div>
          <div>
            <h1 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              Minimi Agent
            </h1>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              1 Tool: Web Search
            </p>
          </div>
        </div>
        <button
          onClick={onNewSession}
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
          title="Start New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Conversations & History
        </div>

        {sessions.map((s) => {
          const isSelected = s.id === currentSessionId;
          const isBenchmark = s.id.startsWith('benchmark-');

          return (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/60 dark:border-blue-900/40 shadow-sm'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {isBenchmark ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              )}
              <span className="truncate flex-1">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info & Benchmark Reset */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate font-medium">{activeProviderName}</span>
        </div>

        <button
          onClick={onResetBenchmarks}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Benchmark Seeds</span>
        </button>
      </div>
    </aside>
  );
};

