/**
 * Grounded Synthesis & Diff Engine
 * Builds structured prompts for the LLM ensuring strict source citation [n],
 * temporal diffing, and baseline comparison.
 */

import { SearchSource, SearchQueryPlan, Message } from './types';
import { LLMMessage } from '../llm/provider';
import { TemporalResolver } from './temporal';

export class Synthesizer {
  private temporal: TemporalResolver;

  constructor(temporal: TemporalResolver) {
    this.temporal = temporal;
  }

  public buildPrompt(params: {
    userPrompt: string;
    plan: SearchQueryPlan;
    sources: SearchSource[];
    recentMessages: Message[];
    historicalContext?: { matchedTurn?: Message; assistantTurn?: Message };
  }): LLMMessage[] {
    const { userPrompt, plan, sources, recentMessages, historicalContext } = params;

    const systemPrompt = `You are a world-class Web Search Chat Agent designed to provide fast, hyper-accurate, and deeply grounded answers.

TEMPORAL CONTEXT:
* Current Time: ${this.temporal.getSystemTemporalContext()}
* All relative temporal expressions (e.g. "today", "yesterday", "since Monday", "last Tuesday") must be anchored against this current time.

CORE OPERATING PRINCIPLES:
1. STRICT GROUNDING & INLINE CITATIONS:
   * Every factual claim derived from web search MUST be cited with its corresponding index marker, e.g. [1], [2].
   * Never invent URLs or cite numbers not present in the provided search evidence.

2. TEMPORAL DIFFING & CONVERSATIONAL RECALL:
   * When the user asks about prior conversations (e.g. "On Monday we shortlisted...", "What did I ask on 3 November?", "Has pricing changed since then?"):
     a) Explicitly reference what was discussed on that past date.
     b) Compare it with the current facts obtained from web search today.
     c) Clearly state what changed (deltas, pricing adjustments, new feature releases) and what remained unchanged.

3. TONE & STRUCTURE:
   * Be direct, organized, objective, and pleasant to talk to.
   * Use clean markdown formatting (bullet points, bold text for key metrics, comparison tables if appropriate).`;

    let contextBlock = '';

    // If historical turn was found, inject it
    if (historicalContext?.matchedTurn) {
      contextBlock += `\n### RELEVANT HISTORICAL CONVERSATION MEMORY:
* Prior Message Date: ${historicalContext.matchedTurn.displayDate} (ISO: ${historicalContext.matchedTurn.timestamp})
* User Said: "${historicalContext.matchedTurn.content}"\n`;

      if (historicalContext.assistantTurn) {
        contextBlock += `* Assistant Answered on ${historicalContext.assistantTurn.displayDate}:
"""
${historicalContext.assistantTurn.content}
"""\n`;
      }
    }

    // Inject search evidence
    if (sources.length > 0) {
      contextBlock += `\n### LIVE WEB SEARCH EVIDENCE (Citations [1] to [${sources.length}]):\n`;
      for (const s of sources) {
        contextBlock += `[${s.id}] Title: ${s.title}
Source URL: ${s.url}
Domain: ${s.domain}
${s.publishedDate ? `Date: ${s.publishedDate}\n` : ''}Snippet: ${s.snippet}\n\n`;
      }
    }

    const messages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

    // Include recent session messages for flow
    const historySlice = recentMessages.slice(-4);
    for (const m of historySlice) {
      if (m.content !== userPrompt) {
        messages.push({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        });
      }
    }

    // Final user turn with grounded context
    const finalUserContent = contextBlock
      ? `${contextBlock}\n---\nUSER INSTRUCTION: ${userPrompt}\nProvide a complete, grounded response adhering to citations and temporal diffing.`
      : userPrompt;

    messages.push({ role: 'user', content: finalUserContent });

    return messages;
  }
}
