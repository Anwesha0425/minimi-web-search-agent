/**
 * The Web Search Tool
 * The core, single tool powering the agent.
 * Implements concurrent query execution, provider fallback, deduplication, and ranking.
 */

import { SearchSource } from '../agent/types';
import {
  SearchProvider,
  TavilyProvider,
  BraveProvider,
  SerperProvider,
  DuckDuckGoFallbackProvider,
} from './search-providers';

export class WebSearchTool {
  public readonly name = 'web_search';
  public readonly description =
    'Searches the live web for up-to-date facts, pricing changes, software releases, and temporal diffs.';

  private providers: SearchProvider[];

  constructor() {
    this.providers = [
      new TavilyProvider(),
      new BraveProvider(),
      new SerperProvider(),
      new DuckDuckGoFallbackProvider(),
    ];
  }

  /**
   * Returns the primary active provider name
   */
  public getActiveProviderName(): string {
    const active = this.providers.find((p) => p.isAvailable());
    return active ? active.name : 'DuckDuckGo Fallback';
  }

  /**
   * Executes a single search query against the first available provider
   */
  public async searchSingle(query: string, maxResults = 5): Promise<SearchSource[]> {
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          const results = await provider.search(query, maxResults);
          if (results && results.length > 0) {
            return results;
          }
        } catch (err: any) {
          console.warn(`Provider ${provider.name} failed for query "${query}": ${err.message}. Trying next.`);
        }
      }
    }
    return [];
  }

  /**
   * Concurrently executes multiple queries, deduplicates URLs, and assigns unique citation IDs
   */
  public async searchMulti(queries: string[], maxTotalResults = 8): Promise<{
    queries: string[];
    sources: SearchSource[];
    providerUsed: string;
  }> {
    if (!queries || queries.length === 0) {
      return { queries: [], sources: [], providerUsed: this.getActiveProviderName() };
    }

    // Run parallel searches with Promise.allSettled
    const searchPromises = queries.map((q) => this.searchSingle(q, 4));
    const settled = await Promise.allSettled(searchPromises);

    const rawSources: SearchSource[] = [];
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        rawSources.push(...outcome.value);
      }
    }

    // Deduplicate by URL and clean domain
    const seenUrls = new Set<string>();
    const deduplicated: SearchSource[] = [];

    for (const item of rawSources) {
      if (!item.url) continue;
      const normalizedUrl = item.url.replace(/\/+$/, '').toLowerCase();
      if (!seenUrls.has(normalizedUrl)) {
        seenUrls.add(normalizedUrl);
        deduplicated.push(item);
      }
    }

    // Cap to maxTotalResults and re-index citation IDs (1, 2, 3...)
    const finalSources = deduplicated.slice(0, maxTotalResults).map((source, idx) => ({
      ...source,
      id: idx + 1,
    }));

    return {
      queries,
      sources: finalSources,
      providerUsed: this.getActiveProviderName(),
    };
  }
}

