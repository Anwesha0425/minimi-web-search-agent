/**
 * Standalone Web Search API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebSearchTool } from '@/lib/tools/web-search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  const tool = new WebSearchTool();
  const results = await tool.searchMulti([q]);
  return NextResponse.json(results);
}

