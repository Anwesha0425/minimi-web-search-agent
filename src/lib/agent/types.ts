/**
 * Core types for the Minimi Web Search Chat Agent
 */

export type Role = 'user' | 'assistant' | 'system';

export interface SearchSource {
  id: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
  score?: number;
}

export interface SearchQueryPlan {
  needsSearch: boolean;
  intent: 'diff_check' | 'fact_lookup' | 'freshness_verification' | 'conversational';
  temporalAnchor?: {
    rawPhrase: string;
    resolvedDate: string; // ISO date string (e.g. 2026-11-03)
    daysAgo?: number;
    description: string;
  };
  referencedEntities?: string[];
  queries: string[];
  rationale: string;
}

export interface HistoricalTurn {
  id: string;
  role: Role;
  content: string;
  timestamp: string; // ISO timestamp
  displayDate: string;
  extractedFacts?: string[];
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string; // ISO string
  displayDate: string;
  toolCalls?: {
    tool: 'web_search';
    queries: string[];
    sources: SearchSource[];
  };
  temporalContext?: {
    referenceDate?: string;
    baselineSummary?: string;
  };
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface AgentEvent {
  type: 'status' | 'plan' | 'search_start' | 'search_results' | 'token' | 'done' | 'error';
  payload?: any;
}
