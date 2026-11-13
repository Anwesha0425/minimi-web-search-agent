'use client';

import React, { useState, useEffect } from 'react';
import { Session } from '@/lib/agent/types';
import { SessionSidebar } from '@/components/SessionSidebar';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data: Session[] = await res.json();
        setSessions(data);
        if (!currentSessionId && data.length > 0) {
          setCurrentSessionId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleNewSession = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Research Chat' }),
      });
      if (res.ok) {
        const newSession: Session = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setInitialPrompt('');
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleResetBenchmarks = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_benchmarks' }),
      });
      if (res.ok) {
        await fetchSessions();
        setCurrentSessionId('benchmark-crm-shortlist');
      }
    } catch (err) {
      console.error('Failed to reset benchmarks:', err);
    }
  };

  const handleSelectScenario = (sessionId: string, promptText: string) => {
    setCurrentSessionId(sessionId);
    setInitialPrompt(promptText);
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs text-zinc-500">Initializing Minimi Agent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setInitialPrompt('');
        }}
        onNewSession={handleNewSession}
        onResetBenchmarks={handleResetBenchmarks}
      />

      {currentSession && (
        <ChatInterface
          key={currentSession.id}
          currentSession={currentSession}
          onRefreshSessions={fetchSessions}
          onSelectScenario={handleSelectScenario}
          initialPrompt={initialPrompt}
        />
      )}
    </div>
  );
}
