/**
 * Pre-seeded Benchmark Conversations corresponding to the hiring challenge test dataset.
 * Allows evaluators to immediately test temporal recall, delta-checking, and diff queries.
 */

import { Session } from '../agent/types';

export const BENCHMARK_SESSIONS: Session[] = [
  {
    id: 'benchmark-crm-shortlist',
    title: 'CRM Shortlist (20-Person Sales Team)',
    createdAt: '2026-11-10T09:30:00.000Z',
    updatedAt: '2026-11-10T09:35:00.000Z',
    messages: [
      {
        id: 'crm-msg-1',
        role: 'user',
        content: 'We need to shortlist 5 CRM tools for our 20-person sales team. We need strong pipeline tracking, email sequencing, and solid mobile apps. Can you compare them with exact pricing for 20 seats?',
        timestamp: '2026-11-10T09:30:00.000Z',
        displayDate: 'Monday, November 10, 2026, 9:30 AM',
      },
      {
        id: 'crm-msg-2',
        role: 'assistant',
        content: `Here is the shortlist of **5 CRM tools** tailored for your 20-person sales team as of Monday, November 10, 2026:

### 1. HubSpot Sales Hub (Professional)
* **Pricing**: $90/seat/month billed annually ($1,800/month for 20 seats).
* **Key Strengths**: Best-in-class inbound integration, automated email sequences, and built-in calling.
* **Fit for 20 seats**: Ideal if your team does heavy multi-channel outbound and inbound marketing.

### 2. Pipedrive (Advanced / Professional)
* **Pricing**: Advanced is $29/seat/month ($580/mo for 20 seats); Professional is $59/seat/month ($1,180/mo for 20 seats).
* **Key Strengths**: Visual pipeline management, intuitive drag-and-drop UX, high sales adoption.
* **Fit for 20 seats**: Fast onboarding with minimal training required.

### 3. Close CRM (Professional)
* **Pricing**: Startup tier is $49/seat/mo; Professional is $99/seat/mo ($1,980/mo for 20 seats).
* **Key Strengths**: Built-in Power Dialer, SMS, and bi-directional email sync designed for high-velocity inside sales.
* **Fit for 20 seats**: Superior for aggressive outbound calling reps.

### 4. Zoho CRM (Enterprise)
* **Pricing**: Standard is $14/seat/mo; Professional is $23/seat/mo; Enterprise is $40/seat/mo ($800/mo for 20 seats).
* **Key Strengths**: Incredible value, Zia AI assistant, deep workflow customization.
* **Fit for 20 seats**: Budget-conscious teams wanting enterprise-grade customization.

### 5. Salesforce Sales Cloud (Enterprise Starter)
* **Pricing**: Pro Suite is $100/seat/mo ($2,000/mo for 20 seats).
* **Key Strengths**: Ecosystem dominance, limitless integrations, and standard reporting.
* **Fit for 20 seats**: Companies preparing for rapid enterprise expansion.`,
        timestamp: '2026-11-10T09:32:00.000Z',
        displayDate: 'Monday, November 10, 2026, 9:32 AM',
        temporalContext: {
          referenceDate: '2026-11-10',
          baselineSummary: 'Shortlisted 5 CRMs (HubSpot, Pipedrive, Close, Zoho, Salesforce) for 20 seats with specific pricing on Monday Nov 10, 2026.',
        },
      },
    ],
  },
  {
    id: 'benchmark-nov3-query',
    title: 'Nov 3: AI Reasoning Models & DeepSeek',
    createdAt: '2026-11-03T14:15:00.000Z',
    updatedAt: '2026-11-03T14:18:00.000Z',
    messages: [
      {
        id: 'nov3-msg-1',
        role: 'user',
        content: 'What are the leading frontier reasoning models available right now, and what is the status of open-source reasoning models like DeepSeek-R1?',
        timestamp: '2026-11-03T14:15:00.000Z',
        displayDate: 'Sunday, November 3, 2026, 2:15 PM',
      },
      {
        id: 'nov3-msg-2',
        role: 'assistant',
        content: `As of **November 3, 2026**, here is the status of leading frontier reasoning models:

1. **OpenAI o1 & o3 series**: OpenAI's reasoning models utilize test-time compute reinforcement learning to think through complex math, coding, and science problems prior to producing an output.
2. **DeepSeek-R1**: DeepSeek released DeepSeek-R1-Lite-Preview and preview research on reasoning using pure reinforcement learning without supervised fine-tuning, demonstrating competitive performance with o1-preview on competitive programming benchmarks.
3. **Anthropic Claude 3.5 Sonnet**: Anthropic's flagship model leading across code generation and tool usage benchmarks.
4. **Google Gemini 2.0 / Flash Thinking**: Google's multimodal thinking models incorporating native multimodal reasoning.`,
        timestamp: '2026-11-03T14:16:30.000Z',
        displayDate: 'Sunday, November 3, 2026, 2:16 PM',
        temporalContext: {
          referenceDate: '2026-11-03',
          baselineSummary: 'Answered query regarding frontier reasoning models (OpenAI o1/o3, DeepSeek-R1 status, Claude 3.5, Gemini Thinking) on 3 November 2026.',
        },
      },
    ],
  },
  {
    id: 'benchmark-postgres-hosting',
    title: 'Postgres Hosting Comparison (Last Tuesday)',
    createdAt: '2026-11-04T16:00:00.000Z',
    updatedAt: '2026-11-04T16:05:00.000Z',
    messages: [
      {
        id: 'pg-msg-1',
        role: 'user',
        content: 'What are the best modern Postgres hosting providers for a fast-growing SaaS application? Can you break down their pricing models?',
        timestamp: '2026-11-04T16:00:00.000Z',
        displayDate: 'Tuesday, November 4, 2026, 4:00 PM',
      },
      {
        id: 'pg-msg-2',
        role: 'assistant',
        content: `Here is a breakdown of the top **Postgres hosting options** for modern SaaS applications as of Tuesday, November 4, 2026:

### 1. Neon Serverless Postgres
* **Architecture**: Serverless with separation of storage and compute.
* **Pricing**:
  * **Free Tier**: 0.5 GB storage, shared compute.
  * **Launch Plan**: $19/month, includes 10 GB storage and 100 compute hours.
  * **Scale Plan**: $69/month, includes 50 GB storage and 750 compute hours, with scale-to-zero capabilities.

### 2. Supabase
* **Architecture**: Managed Postgres on AWS with batteries-included BaaS (Auth, Realtime, Storage).
* **Pricing**:
  * **Free Tier**: 500 MB database, shared compute.
  * **Pro Plan**: $25/month + compute add-ons (Micro compute included, Small compute is +$10/mo, Medium +$40/mo).
  * **Team Plan**: $599/month for enterprise collaboration and SOC2 compliance.

### 3. AWS Aurora Serverless v2 (PostgreSQL)
* **Architecture**: Enterprise-grade multi-AZ replication.
* **Pricing**: Billed per ACU (Aurora Capacity Unit) at ~$0.12 per ACU-hour + $0.10/GB-month storage. Typically ranges from $90 to $300+/month for production workloads.

### 4. Crunchy Bridge
* **Architecture**: Pure enterprise Postgres managed by core PostgreSQL contributors.
* **Pricing**: Starter instances from $35/month; Production high-availability clusters start at $145/month.`,
        timestamp: '2026-11-04T16:03:00.000Z',
        displayDate: 'Tuesday, November 4, 2026, 4:03 PM',
        temporalContext: {
          referenceDate: '2026-11-04',
          baselineSummary: 'Detailed Postgres hosting comparison (Neon $19/$69, Supabase $25 Pro, AWS Aurora, Crunchy Bridge) provided on Tuesday, Nov 4, 2026.',
        },
      },
    ],
  },
];

