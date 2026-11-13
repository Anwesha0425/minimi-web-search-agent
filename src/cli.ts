#!/usr/bin/env node
/**
 * Interactive CLI for Minimi Web Search Agent
 * Run with: npm run cli
 */

import readline from 'readline';
import { AgentOrchestrator } from './lib/agent/orchestrator';

async function main() {
  const orchestrator = new AgentOrchestrator();
  const status = orchestrator.getStatus();

  console.log('\n======================================================');
  console.log('       MINIMI WEB SEARCH CHAT AGENT (CLI MODE)        ');
  console.log('======================================================');
  console.log(` System Date:   ${status.currentDate}`);
  console.log(` Search Tool:   ${status.searchProvider}`);
  console.log(` LLM Engine:    ${status.llmProvider}`);
  console.log('------------------------------------------------------');
  console.log('Try typing:');
  console.log(' 1. "On Monday we shortlisted 5 CRM tools for a 20-person sales team. Has any of them changed pricing or shipped something big since?"');
  console.log(' 2. "What did I ask you on 3 November? Is your answer still correct today?"');
  console.log(' 3. "Last Tuesday I asked you about Postgres hosting. Has any pricing changed since then?"');
  console.log('Type "exit" or "quit" to close.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const sessionId = `cli-${Date.now()}`;

  const promptUser = () => {
    rl.question('\x1b[36mYou > \x1b[0m', async (input) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log('\nGoodbye!\n');
        rl.close();
        process.exit(0);
      }

      console.log('\n\x1b[90m[Agent: Thinking & Grounding...]\x1b[0m');

      try {
        let firstToken = true;
        for await (const event of orchestrator.chatStream(sessionId, trimmed)) {
          if (event.type === 'status') {
            process.stdout.write(`\r\x1b[90m⏳ ${event.payload.message}\x1b[0m`);
          } else if (event.type === 'plan') {
            if (event.payload.queries && event.payload.queries.length > 0) {
              console.log(`\n\x1b[34m🔍 Planned Search Queries:\x1b[0m`);
              event.payload.queries.forEach((q: string, i: number) => {
                console.log(`   ${i + 1}. "${q}"`);
              });
            }
          } else if (event.type === 'search_results') {
            console.log(`\x1b[32m✔ Retrieved ${event.payload.sources.length} sources.\x1b[0m\n`);
          } else if (event.type === 'token') {
            if (firstToken) {
              console.log('\x1b[35mMinimi Agent > \x1b[0m');
              firstToken = false;
            }
            process.stdout.write(event.payload.token);
          }
        }
        console.log('\n');
      } catch (err: any) {
        console.error(`\n\x1b[31mError: ${err.message}\x1b[0m\n`);
      }

      promptUser();
    });
  };

  promptUser();
}

main().catch(console.error);

