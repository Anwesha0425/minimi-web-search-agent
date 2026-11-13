/**
 * Session Management API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { MemoryStore } from '@/lib/memory/memory-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const store = MemoryStore.getInstance();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const session = store.getSession(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  const sessions = store.listSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const store = MemoryStore.getInstance();
  const body = await req.json().catch(() => ({}));

  if (body.action === 'reset_benchmarks') {
    store.resetToBenchmarks();
    return NextResponse.json({ success: true, message: 'Reset to hiring benchmark conversations.' });
  }

  const title = body.title || 'New Chat';
  const newSession = store.createSession(title);
  return NextResponse.json(newSession);
}

