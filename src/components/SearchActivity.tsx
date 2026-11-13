import React, { useState } from 'react';
import { SearchSource } from '@/lib/agent/types';
import { ChevronDown, ChevronRight, Search, Layers } from 'lucide-react';
import { SourceCard } from './SourceCard';

interface SearchActivityProps {
  queries: string[];
  sources: SearchSource[];
  isSearching?: boolean;
}

export const SearchActivity: React.FC<SearchActivityProps> = ({
  queries,
  sources,
  isSearching = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (queries.length === 0 && sources.length === 0 && !isSearching) {
    return null;
  }

  return (
    <div className="mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isSearching ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {isSearching
              ? 'Searching the live web...'
              : `Searched web (${queries.length} ${queries.length === 1 ? 'query' : 'queries'}, ${sources.length} sources found)`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="text-[11px]">{isOpen ? 'Hide' : 'Show sources'}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
          {/* Query tags */}
          {queries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Queries:
              </span>
              {queries.map((q, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50"
                >
                  "{q}"
                </span>
              ))}
            </div>
          )}

          {/* Sources horizontal carousel */}
          {sources.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
              {sources.map((src) => (
                <SourceCard key={src.id} source={src} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

