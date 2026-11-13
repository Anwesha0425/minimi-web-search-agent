/**
 * Automated Verification & Benchmark Test Suite
 * Run with: npm test
 */

import { TemporalResolver } from '../lib/agent/temporal';
import { QueryPlanner } from '../lib/agent/planner';
import { WebSearchTool } from '../lib/tools/web-search';
import { MemoryStore } from '../lib/memory/memory-store';
import { AgentOrchestrator } from '../lib/agent/orchestrator';

async function runTests() {
  console.log('========================================================');
  console.log('       RUNNING MINIMI AGENT TEST SUITE & BENCHMARKS     ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
      passed++;
    } else {
      console.error(`  \x1b[31m✘ FAIL:\x1b[0m ${message}`);
      failed++;
    }
  }

  // 1. TEMPORAL RESOLVER TESTS
  console.log('\x1b[1m[1] Testing Deterministic Temporal Grounding\x1b[0m');
  const baseDate = new Date('2026-11-13T10:00:00Z'); // Thursday Nov 13, 2026
  const temporal = new TemporalResolver(baseDate);

  const anchors1 = temporal.extractTemporalAnchors('What did I ask you on 3 November?');
  assert(anchors1.length > 0, 'Extracts "3 November" anchor');
  assert(anchors1[0]?.resolvedDate === '2026-11-03', 'Resolves "3 November" to 2026-11-03');

  const anchors2 = temporal.extractTemporalAnchors('On Monday we shortlisted 5 CRM tools');
  assert(anchors2.length > 0, 'Extracts "On Monday" anchor');
  assert(anchors2[0]?.resolvedDate === '2026-11-09' || anchors2[0]?.resolvedDate === '2026-11-10', 'Resolves "Monday" to recent Monday');

  const anchors3 = temporal.extractTemporalAnchors('Has any pricing changed since last Tuesday?');
  assert(anchors3.some((a) => a.type === 'since_marker'), 'Detects "since" delta marker');

  // 2. QUERY PLANNER TESTS
  console.log('\n\x1b[1m[2] Testing Adaptive Query Planner\x1b[0m');
  const planner = new QueryPlanner(temporal);

  const planGreeting = planner.plan('Hello there!', []);
  assert(planGreeting.needsSearch === false, 'Trivial greetings skip web search (saves latency)');

  const planCRM = planner.plan(
    'On Monday we shortlisted 5 CRM tools for a 20-person sales team. Has any of them changed pricing or shipped something big since?',
    []
  );
  assert(planCRM.needsSearch === true, 'CRM query flags needsSearch = true');
  assert(planCRM.intent === 'diff_check', 'CRM query correctly classified as diff_check');
  assert(planCRM.queries.length >= 2, 'Decomposes into multiple targeted queries');

  const planPG = planner.plan(
    'Last Tuesday I asked you about Postgres hosting. Has any pricing changed since then?',
    []
  );
  assert(planPG.intent === 'diff_check', 'Postgres query classified as diff_check');
  assert(planPG.queries.some((q) => q.toLowerCase().includes('postgres')), 'Queries target Postgres hosting');

  // 3. MEMORY STORE & BENCHMARK SEEDS
  console.log('\n\x1b[1m[3] Testing Episodic Memory & Benchmark Retrieval\x1b[0m');
  const store = MemoryStore.getInstance();
  const sessions = store.listSessions();
  assert(sessions.length >= 3, 'Pre-loaded benchmark sessions present in memory store');

  const crmMatches = store.findRelevantHistoricalTurns('CRM tools 20-person sales team');
  assert(crmMatches.length > 0, 'Retrieves Monday CRM shortlist turn from history');
  assert(Boolean(crmMatches[0]?.assistantTurn?.content?.includes('HubSpot')), 'Historical turn contains CRM shortlist details');

  const nov3Matches = store.findRelevantHistoricalTurns('What did I ask you on 3 November');
  assert(nov3Matches.length > 0, 'Retrieves November 3 historical turn');

  // 4. WEB SEARCH TOOL (Concurrent execution, deduplication & fallback)
  console.log('\n\x1b[1m[4] Testing Web Search Tool\x1b[0m');
  const searchTool = new WebSearchTool();
  console.log(`  Active Search Provider: ${searchTool.getActiveProviderName()}`);

  const searchOutcome = await searchTool.searchMulti(['Postgres hosting pricing 2026', 'Neon Postgres update']);
  assert(searchOutcome.sources.length > 0, 'Web Search returns structured sources');
  assert(Boolean(searchOutcome.sources[0]?.url), 'Source has valid URL');
  assert(Boolean(searchOutcome.sources[0]?.domain), 'Source has parsed domain');
  assert(searchOutcome.sources[0]?.id === 1, 'Sources correctly re-indexed with citation IDs');

  // 5. END-TO-END AGENT ORCHESTRATION
  console.log('\n\x1b[1m[5] Testing End-to-End Agent Orchestrator Stream\x1b[0m');
  const orchestrator = new AgentOrchestrator('2026-11-13');
  let tokenCount = 0;
  let receivedPlan = false;
  let receivedSources = false;
  let fullText = '';

  for await (const event of orchestrator.chatStream(
    'test-session',
    'On Monday we shortlisted 5 CRM tools for a 20-person sales team. Has any of them changed pricing or shipped something big since?'
  )) {
    if (event.type === 'plan') receivedPlan = true;
    if (event.type === 'search_results') receivedSources = true;
    if (event.type === 'token') {
      tokenCount++;
      fullText += event.payload.token;
    }
  }

  assert(receivedPlan, 'Orchestrator emitted search plan');
  assert(receivedSources, 'Orchestrator emitted search results');
  assert(tokenCount > 10, `Streamed generated tokens (${tokenCount} tokens received)`);
  assert(fullText.includes('[1]'), 'Generated text contains grounded inline citation [1]');

  console.log('\n--------------------------------------------------------');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
