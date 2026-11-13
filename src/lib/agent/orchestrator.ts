/**
 * Master Agent Orchestrator
 * Coordinates temporal resolution, memory retrieval, search planning, execution, and synthesis.
 */

import { WebSearchTool } from '../tools/web-search';
import { MemoryStore } from '../memory/memory-store';
import { LLMProvider, LLMMessage } from '../llm/provider';
import { TemporalResolver } from './temporal';
import { QueryPlanner } from './planner';
import { Synthesizer } from './synthesizer';
import { Message, SearchSource, AgentEvent, SearchQueryPlan } from './types';

export class AgentOrchestrator {
  private webSearch: WebSearchTool;
  private memory: MemoryStore;
  private llm: LLMProvider;
  private temporal: TemporalResolver;
  private planner: QueryPlanner;
  private synthesizer: Synthesizer;

  constructor(overrideDate?: string) {
    this.temporal = new TemporalResolver(overrideDate);
    this.webSearch = new WebSearchTool();
    this.memory = MemoryStore.getInstance();
    this.llm = new LLMProvider();
    this.planner = new QueryPlanner(this.temporal);
    this.synthesizer = new Synthesizer(this.temporal);
  }

  public getStatus() {
    return {
      currentDate: this.temporal.formatCurrentDateTime(),
      searchProvider: this.webSearch.getActiveProviderName(),
      llmProvider: this.llm.getActiveProviderName(),
    };
  }

  /**
   * Main agent execution generator / stream
   */
  public async *chatStream(
    sessionId: string,
    userPrompt: string
  ): AsyncGenerator<AgentEvent, { responseText: string; sources: SearchSource[] }, unknown> {
    const session = this.memory.getSession(sessionId) || this.memory.createSession();
    const now = this.temporal.getBaseDate();

    // 1. Record User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: now.toISOString(),
      displayDate: this.temporal.formatCurrentDateTime(),
    };
    this.memory.addMessage(session.id, userMsg);

    yield {
      type: 'status',
      payload: { message: 'Analyzing query intent & temporal references...' },
    };

    // 2. Resolve Temporal References & Retrieve Historical Context
    const temporalAnchors = this.temporal.extractTemporalAnchors(userPrompt);
    const targetDateISO = temporalAnchors[0]?.resolvedDate;

    const historicalMatches = this.memory.findRelevantHistoricalTurns(
      userPrompt,
      session.id,
      targetDateISO
    );
    const bestHistoricalContext = historicalMatches[0];

    // 3. Plan Search Queries
    const plan: SearchQueryPlan = this.planner.plan(
      userPrompt,
      session.messages,
      bestHistoricalContext
    );

    yield {
      type: 'plan',
      payload: plan,
    };

    let sources: SearchSource[] = [];

    // 4. Execute Web Search if needed
    if (plan.needsSearch && plan.queries.length > 0) {
      yield {
        type: 'search_start',
        payload: {
          queries: plan.queries,
          provider: this.webSearch.getActiveProviderName(),
        },
      };

      const searchOutcome = await this.webSearch.searchMulti(plan.queries, 6);
      sources = searchOutcome.sources;

      yield {
        type: 'search_results',
        payload: {
          queries: plan.queries,
          sources,
          provider: searchOutcome.providerUsed,
        },
      };
    }

    yield {
      type: 'status',
      payload: { message: 'Synthesizing grounded answer with source citations...' },
    };

    // 5. Build Grounded Prompt
    const promptMessages = this.synthesizer.buildPrompt({
      userPrompt,
      plan,
      sources,
      recentMessages: session.messages,
      historicalContext: bestHistoricalContext,
    });

    // 6. Stream LLM Tokens
    let fullResponse = '';

    // Create a queue for streaming tokens across the async generator
    const tokenQueue: string[] = [];
    let isStreamDone = false;
    let streamError: Error | null = null;
    let notifyResolver: (() => void) | null = null;

    const streamPromise = this.llm.streamChat(
      promptMessages,
      {
        onToken: (tok) => {
          tokenQueue.push(tok);
          if (notifyResolver) {
            notifyResolver();
            notifyResolver = null;
          }
        },
        onComplete: (full) => {
          fullResponse = full;
          isStreamDone = true;
          if (notifyResolver) {
            notifyResolver();
            notifyResolver = null;
          }
        },
        onError: (err) => {
          streamError = err;
          isStreamDone = true;
          if (notifyResolver) {
            notifyResolver();
            notifyResolver = null;
          }
        },
      },
      0.2
    );

    while (!isStreamDone || tokenQueue.length > 0) {
      if (tokenQueue.length > 0) {
        const token = tokenQueue.shift()!;
        yield {
          type: 'token',
          payload: { token },
        };
      } else if (!isStreamDone) {
        await new Promise<void>((resolve) => {
          notifyResolver = resolve;
        });
      }
    }

    await streamPromise;

    if (streamError) {
      yield {
        type: 'error',
        payload: { message: (streamError as Error).message },
      };
    }

    // 7. Save Assistant Message into MemoryStore
    const assistantMsg: Message = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: fullResponse,
      timestamp: this.temporal.getBaseDate().toISOString(),
      displayDate: this.temporal.formatCurrentDateTime(),
      toolCalls:
        sources.length > 0
          ? {
              tool: 'web_search',
              queries: plan.queries,
              sources,
            }
          : undefined,
    };
    this.memory.addMessage(session.id, assistantMsg);

    yield {
      type: 'done',
      payload: { fullResponse, sources },
    };

    return { responseText: fullResponse, sources };
  }
}
