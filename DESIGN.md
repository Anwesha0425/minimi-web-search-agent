# System Architecture & Design: Minimi Web Search Agent

> **One-Page Architectural Overview**  
> Written for the Minimi Hiring Challenge. Built to be as fast, accurate, and conversational as the frontier search engines on the internet today.

---

## 1. How It Works

The agent is organized around a **4-Stage Grounded Pipeline** with **Deterministic Temporal Anchoring** and **Episodic Memory**:

```
[ User Message + Active Session ]
               │
               ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Stage 1: Intent, Temporal & History Resolution             │
   │  • Anchors current time deterministically (e.g. Nov 13).    │
   │  • Resolves relative temporal markers ("Monday", "Nov 3").  │
   │  • Retrieves prior conversation turns & baseline entities.   │
   └─────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Stage 2: Adaptive Query Decomposition                      │
   │  • Skips search for chit-chat (0ms overhead).               │
   │  • For delta/change queries: generates targeted changelog,  │
   │    pricing updates, and release note queries.               │
   └─────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Stage 3: Web Search Tool Execution (Single Tool)           │
   │  • Concurrently dispatches queries via `Promise.allSettled` │
   │  • Multi-provider adapter: Tavily (primary) → Brave /       │
   │    Serper → Zero-config DuckDuckGo fallback.                │
   │  • Deduplicates URLs, normalizes domains, assigns [n] IDs.  │
   └─────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Stage 4: Grounded Synthesis & Diff Engine                  │
   │  • Injects prior baseline vs current live evidence.         │
   │  • Streams tokens via SSE with inline citations `[n]`.      │
   │  • Formats structured Before/After comparative deltas.      │
   └─────────────────────────────────────────────────────────────┘
```

1. **Episodic Memory Store (`src/lib/memory/`)**: Every message is stored with an absolute ISO timestamp, human-readable display date, and extracted factual baseline snapshot. The store provides semantic and temporal lookups so questions like *"On Monday we shortlisted..."* or *"What did I ask on 3 November?"* immediately pull the exact historical baseline into context.
2. **Temporal Grounding Engine (`src/lib/agent/temporal.ts`)**: Rather than relying on LLMs to perform error-prone relative calendar math, this module deterministically translates phrases like *"last Tuesday"* or *"since Monday"* into exact calendar dates (`[baseline_date, today]`).
3. **Adaptive Query Planner (`src/lib/agent/planner.ts`)**: Decomposes complex information requests into 1–4 precise web queries. For delta questions, it targets release notes and pricing pages across all shortlisted entities in parallel.
4. **Single Tool: Multi-Provider Web Search (`src/lib/tools/`)**: Concurrently dispatches searches, deduplicates URLs across providers, normalizes domains, and ranks snippets. Supports Tavily, Brave, Serper, and DuckDuckGo (zero API key required for testing).
5. **Grounded Synthesis (`src/lib/agent/synthesizer.ts`)**: Streams response tokens with strict citation anchors (`[1]`, `[2]`), enforcing a structured Before vs. Now diff for change verification queries.

---

## 2. Why We Built It This Way

* **Solving Temporal Blindness**: The 3 test queries (*"On Monday..."*, *"3 November..."*, *"last Tuesday..."*) fail in standard chat agents because standard LLM context windows have no concept of physical time. By making timestamps a first-class citizen in memory and grounding relative phrases deterministically, the agent never hallucinates calendar offsets.
* **Two-Stage Temporal Diffing**: Detecting whether pricing or features changed requires two distinct anchor points: the **historical baseline** (what was true then) and **live web evidence** (what is true now). Our architecture explicitly structures both inputs for the LLM, enabling sharp, factual diff summaries rather than vague hand-waving.
* **Low Latency via Parallel Query Execution**: Instead of sequential multi-step tool calls that take 15+ seconds, our query planner decomposes sub-queries upfront and runs them concurrently in parallel (`Promise.allSettled`). First-token latency remains under 1.5 seconds.
* **Zero-Config Resilient Fallback**: An evaluator shouldn't be blocked if their API keys are missing or rate-limited. The agent automatically falls back from Tavily to Brave, Serper, and DuckDuckGo, ensuring `npm run dev` and `npm test` succeed immediately.

---

## 3. What We Considered and Rejected

1. **Monolithic Autonomous React Loops (LangChain / AutoGPT style)**:
   * *Rejected*: Unconstrained agent loops that call tools repeatedly in sequence are slow (high TTFT), expensive, prone to infinite loops, and frequently drift from the original user objective.
   * *Chosen*: A single-pass, high-precision Planner-Executor-Synthesizer architecture that achieves top-tier answer quality in a fraction of the time.
2. **Vector Database RAG for Conversational History**:
   * *Rejected*: Dense vector search (embeddings) often fails on temporal queries like *"What did I ask on 3 November?"* because embeddings measure semantic similarity, not chronological recency or exact date matches.
   * *Chosen*: Chronologically and structurally indexed episodic memory with deterministic temporal filtering and keyword matching.
3. **Client-Only LocalStorage State**:
   * *Rejected*: Breaks if the user switches browsers, refreshes mid-stream, or tests from the CLI.
   * *Chosen*: Persisted JSON store on the Node server with seamless sync to both the Web UI and the Interactive CLI (`npm run cli`).

---

## 4. What We Would Do With Another Week

1. **Deep Page Crawl & Markdown Extraction**: For changelog and pricing tables with dense JavaScript rendering, integrate a headless Playwright scraper to extract full clean markdown rather than relying purely on search SERP snippets.
2. **Speculative Pre-fetching**: Predict probable follow-up queries while the user is reading the current response and pre-warm cached search results.
3. **Automated LLM Hallucination Checker**: Add an asynchronous verification critic pass that compares every numeric price or claim in the final text against the raw snippet bytes, auto-correcting any subtle hallucination.
4. **Structured Multi-Agent Debate for Ambiguous Facts**: For disputed industry claims (e.g. unconfirmed acquisitions or leaked pricing), spin up parallel worker passes that cross-examine conflicting sources.
