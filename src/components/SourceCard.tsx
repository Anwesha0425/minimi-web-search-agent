import React from 'react';
import { SearchSource } from '@/lib/agent/types';
import { ExternalLink, Globe } from 'lucide-react';

interface SourceCardProps {
  source: SearchSource;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-200 shadow-sm text-left w-64 min-w-[16rem] flex-shrink-0"
    >
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Globe className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate flex-1">
            {source.domain}
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            [{source.id}]
          </span>
        </div>
        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug">
          {source.title}
        </h4>
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {source.snippet}
        </p>
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
        <span>{source.publishedDate || 'Verified Source'}</span>
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
      </div>
    </a>
  );
};

