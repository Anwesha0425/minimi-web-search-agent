'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, Session, SearchSource } from '@/lib/agent/types';
import { MessageItem } from './MessageItem';
import { ScenarioSelector } from './ScenarioSelector';
import { Send, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface ChatInterfaceProps {
  currentSession: Session;
  onRefreshSessions: () => void;
  onSelectScenario: (sessionId: string, promptText: string) => void;
  initialPrompt?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentSession,
  onRefreshSessions,
  onSelectScenario,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>(currentSession.messages || []);
  const [input, setInput] = useState(initialPrompt || '');
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [liveQueries, setLiveQueries] = useState<string[]>([]);
  const [liveSources, setLiveSources] = useState<SearchSource[]>([]);
  const [streamingText, setStreamingText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(currentSession.messages || []);
  }, [currentSession.id, currentSession.messages]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      inputRef.current?.focus();
    }
  }, [initialPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, statusMessage]);

  const handleSubmit = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || input).trim();
    if (!textToSend || isStreaming) return;

    setInput('');
    setIsStreaming(true);
    setStatusMessage('Analyzing query & temporal context...');
    setLiveQueries([]);
    setLiveSources([]);
    setStreamingText('');

    // Optimistically append user message
    const tempUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      displayDate: 'Just now',
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message: textToSend,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to send message: HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let capturedSources: SearchSource[] = [];
      let capturedQueries: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const event = JSON.parse(trimmed.slice(6));

              if (event.type === 'status') {
                setStatusMessage(event.payload.message);
              } else if (event.type === 'plan') {
                if (event.payload.queries) {
                  capturedQueries = event.payload.queries;
                  setLiveQueries(capturedQueries);
                }
              } else if (event.type === 'search_start') {
                setStatusMessage('Executing live web search across sources...');
              } else if (event.type === 'search_results') {
                capturedSources = event.payload.sources;
                setLiveSources(capturedSources);
                setStatusMessage(`Retrieved ${capturedSources.length} verified sources`);
              } else if (event.type === 'token') {
                setStatusMessage('');
                accumulatedText += event.payload.token;
                setStreamingText(accumulatedText);
              } else if (event.type === 'done') {
                setIsStreaming(false);
                const finalAssistantMsg: Message = {
                  id: `asst-${Date.now()}`,
                  role: 'assistant',
                  content: accumulatedText || event.payload.fullResponse,
                  timestamp: new Date().toISOString(),
                  displayDate: 'Just now',
                  toolCalls:
                    capturedSources.length > 0
                      ? {
                          tool: 'web_search',
                          queries: capturedQueries,
                          sources: capturedSources,
                        }
                      : undefined,
                };
                setMessages((prev) => [...prev, finalAssistantMsg]);
                setStreamingText('');
                setLiveSources([]);
                setLiveQueries([]);
                onRefreshSessions();
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', trimmed, e);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setStatusMessage(`Error: ${err.message}`);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Session Header */}
      <header className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-10">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{currentSession.title}</span>
            {currentSession.id.startsWith('benchmark-') && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                Test Benchmark
              </span>
            )}
          </h2>
          <p className="text-[11px] text-zinc-400">
            {messages.length} messages in conversation context
          </p>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              What do you want to explore or verify?
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mb-6 leading-relaxed">
              Equipped with 1 tool: <strong>Web Search</strong>. Grounded in deterministic temporal context, episodic memory, and real-time diffing.
            </p>

            <ScenarioSelector onSelectScenario={onSelectScenario} />
          </div>
        ) : (
          <div className="pb-8">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {/* Currently Streaming Message */}
            {isStreaming && (
              <MessageItem
                message={{
                  id: 'streaming-asst',
                  role: 'assistant',
                  content: streamingText,
                  timestamp: new Date().toISOString(),
                  displayDate: 'Now',
                }}
                liveSources={liveSources}
                liveQueries={liveQueries}
                isGenerating={true}
              />
            )}

            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input Bar & Status Indicator */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          {/* Status Message */}
          {statusMessage && (
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 animate-fadeIn">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="relative rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or check changes since a prior date (e.g. 'Has any pricing changed since last Tuesday?')..."
              rows={2}
              className="w-full px-4 py-3 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3 h-3 text-blue-500" />
                <span>Search Tool: Active</span>
              </div>
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isStreaming}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-medium text-xs shadow-sm transition-all"
              >
                <span>Search & Answer</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

