# Minimi Web Search Chat Agent

> **State-of-the-art Web Search Chat Agent with Deterministic Temporal Grounding & Episodic Memory**  
> Built for the Minimi Hiring Challenge.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure API keys
cp .env.example .env
# Edit .env with your TAVILY_API_KEY and OPENAI_API_KEY (optional, fallback included!)

# 3. Start the Web Chat Interface
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quick Test & CLI

You can also run automated verification tests or chat directly in your terminal:

```bash
# Run the complete automated test suite (verifies temporal engine, planner, search & diffing)
npm test

# Run interactive terminal chat REPL
npm run cli
```

---

## 🎯 Evaluator Benchmark Scenarios

The test dataset challenges can be tested with **1-click** directly from the UI or typed into the chat / CLI:

| Benchmark Query | Architectural Challenge | How Minimi Handles It |
|---|---|---|
| **Query 1**: *"On Monday we shortlisted 5 CRM tools for a 20-person sales team. Has any of them changed pricing or shipped something big since?"* | Temporal anchoring + entity extraction from memory + changelog diffing. | Recalls the 5 CRMs (HubSpot, Pipedrive, Close, Zoho, Salesforce) shortlisted on Monday Nov 10, searches product release notes & pricing pages in parallel, and presents a delta breakdown. |
| **Query 2**: *"What did I ask you on 3 November? Is your answer still correct today?"* | Exact temporal date recall + freshness verification. | Matches exact calendar timestamp (3 November 2026), recalls the original question (frontier reasoning models & DeepSeek-R1), runs live search on current model status, and validates accuracy. |
| **Query 3**: *"Last Tuesday I asked you about Postgres hosting. Has any pricing changed since then?"* | Relative date resolution ("last Tuesday") + baseline vs live pricing comparison. | Resolves relative calendar anchor to Tuesday Nov 4, pulls previous baseline tiers (Neon, Supabase, AWS Aurora, Crunchy Bridge), and synthesizes a pricing delta table. |

---

## 🛠️ Architecture Highlights

For the in-depth architectural breakdown, see **[DESIGN.md](./DESIGN.md)**.

* **Single Tool: Web Search**: Multi-provider search engine supporting **Tavily AI Search** (primary for dense AI snippets), **Brave Search**, **Serper**, and a **zero-config DuckDuckGo fallback** (so the project runs out of the box with zero external keys required).
* **Deterministic Temporal Grounding**: Converts relative markers (*"on Monday"*, *"last Tuesday"*, *"3 November"*) into exact ISO timestamps to avoid calendar hallucinations.
* **Two-Stage Temporal Diffing**: Separates historical baseline claims from live web evidence to highlight what changed vs what stayed identical.
* **Perplexity-Style Citations & UX**: Real-time SSE streaming, collapsible search activity accordions, query tags, and inline citations (`[1]`, `[2]`).

---

## 🔑 Environment Variables (`.env.example`)

All keys are optional. If no keys are specified, the agent runs using DuckDuckGo search fallback and deterministic grounded synthesis.

```bash
# Web Search Tool (Choose Tavily, Brave, or Serper)
TAVILY_API_KEY=your_key_here

# LLM Inference (OpenAI, Groq, Gemini, Anthropic, or local Ollama)
OPENAI_API_KEY=your_key_here
LLM_MODEL=gpt-4o-mini
```

---

## 📂 Project Structure

```
minimi/
├── DESIGN.md                 # Required 1-page architecture design doc
├── README.md                 # Project documentation & setup instructions
├── .env.example              # Documented environment variables
├── package.json              # Scripts: dev, build, start, cli, test
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── data/
│   └── conversations.json    # Persisted episodic conversation store
└── src/
    ├── app/                  # Next.js App Router (UI & API routes)
    │   ├── api/chat/route.ts # SSE streaming chat endpoint
    │   ├── api/sessions/     # Session management & benchmark reset
    │   ├── layout.tsx        # App root layout
    │   └── page.tsx          # Main chat application page
    ├── components/           # React UI components
    │   ├── ChatInterface.tsx # Streaming chat container
    │   ├── MessageItem.tsx   # Markdown & citation rendering
    │   ├── SearchActivity.tsx# Perplexity-style search accordion
    │   ├── SourceCard.tsx    # Source preview card
    │   ├── ScenarioSelector.tsx # 1-click hiring benchmark test pills
    │   └── SessionSidebar.tsx# History sidebar with timestamps
    ├── lib/
    │   ├── agent/            # Core Agent Engine
    │   │   ├── orchestrator.ts# Master loop (Planner -> Search -> Synthesis)
    │   │   ├── temporal.ts   # Deterministic date & diff resolution
    │   │   ├── planner.ts    # Adaptive search query decomposition
    │   │   ├── synthesizer.ts# Grounded prompt building & citation rules
    │   │   └── types.ts      # TypeScript interfaces
    │   ├── tools/            # Web Search Tool (1 tool)
    │   │   ├── web-search.ts # Concurrent search & ranking
    │   │   └── search-providers.ts # Tavily, Brave, Serper, DuckDuckGo
    │   ├── memory/           # Memory & Benchmark Seeds
    │   │   ├── memory-store.ts # Chronological conversation store
    │   │   └── benchmark-seeds.ts # Pre-loaded test scenarios
    │   └── llm/              # Unified LLM provider (OpenAI, Gemini, Claude, Groq)
    │       └── provider.ts
    ├── cli.ts                # Interactive CLI tool (npm run cli)
    └── test/                 # Automated test suite (npm test)
        └── run-tests.ts
```

---

## 📜 License

MIT License. Built for the Minimi hiring challenge.
