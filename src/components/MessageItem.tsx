import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, SearchSource } from '@/lib/agent/types';
import { SearchActivity } from './SearchActivity';
import { Bot, User, Clock } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  liveSources?: SearchSource[];
  liveQueries?: string[];
  isGenerating?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  liveSources,
  liveQueries,
  isGenerating = false,
}) => {
  const isUser = message.role === 'user';
  const sources = message.toolCalls?.sources || liveSources || [];
  const queries = message.toolCalls?.queries || liveQueries || [];

  return (
    <div
      className={`py-6 px-4 md:px-8 border-b border-zinc-100 dark:border-zinc-800/80 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-zinc-50/50 dark:bg-zinc-900/30'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-semibold shadow-sm ${
            isUser
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/10'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header with Role and Exact Timestamp */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {isUser ? 'You' : 'Minimi Agent'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              <Clock className="w-3 h-3" />
              <span>{message.displayDate || 'Just now'}</span>
            </div>
          </div>

          {/* Assistant Search Activity Accordion */}
          {!isUser && (queries.length > 0 || sources.length > 0 || isGenerating) && (
            <SearchActivity
              queries={queries}
              sources={sources}
              isSearching={isGenerating && sources.length === 0}
            />
          )}

          {/* Rendered Text */}
          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-3">
                    <table {...props} className="min-w-full text-xs divide-y divide-zinc-200 dark:divide-zinc-800" />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th {...props} className="px-3 py-2 text-left font-semibold bg-zinc-100 dark:bg-zinc-800" />
                ),
                td: ({ node, ...props }) => (
                  <td {...props} className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {isGenerating && !message.content && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 italic py-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Grounding facts and writing answer...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

