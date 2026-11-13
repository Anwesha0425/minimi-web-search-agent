import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ScenarioSelectorProps {
  onSelectScenario: (sessionId: string, promptText: string) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onSelectScenario }) => {
  const scenarios = [
    {
      sessionId: 'benchmark-crm-shortlist',
      title: 'CRM Shortlist Changes',
      badge: 'Monday → Today',
      prompt:
        'On Monday we shortlisted 5 CRM tools for a 20-person sales team. Has any of them changed pricing or shipped something big since?',
      desc: 'Tests episodic recall of 5 CRM tools shortlisted on Monday and runs targeted search on changelogs & pricing updates.',
    },
    {
      sessionId: 'benchmark-nov3-query',
      title: '3 November Question Recall',
      badge: 'Nov 3 → Today',
      prompt: 'What did I ask you on 3 November? Is your answer still correct today?',
      desc: 'Tests exact temporal recall of query on 3 November regarding reasoning models and verifies current correctness via search.',
    },
    {
      sessionId: 'benchmark-postgres-hosting',
      title: 'Postgres Hosting Pricing Diff',
      badge: 'Last Tuesday → Today',
      prompt: 'Last Tuesday I asked you about Postgres hosting. Has any pricing changed since then?',
      desc: 'Tests relative date resolution ("last Tuesday") and synthesizes a pricing delta comparison table.',
    },
  ];

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Evaluation Benchmark Scenarios (Hiring Test Dataset)
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => onSelectScenario(sc.sessionId, sc.prompt)}
            className="flex flex-col justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500/50 hover:shadow-md transition-all text-left group"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  {sc.badge}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1 leading-snug">
                {sc.title}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                "{sc.prompt}"
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

