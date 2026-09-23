---
title: "An AI agent that runs e-commerce ops from Telegram"
summary: "A self-hosted agent wired into Shopify, Google Drive, Notion, and Trello — controlled entirely by text or voice, built for my own company."
status: "Working prototype — deployed and used by the founder. Not yet production-hardened or rolled out to the wider team."
tags: ["OpenClaw", "Telegram", "Shopify", "Google Drive", "Notion", "Trello"]
publishDate: 2026-09-21
---

A self-hosted, model-agnostic AI agent I built and deployed inside my own company (Silk Route, a premium instant-chai brand) to run real operational tasks across Shopify, Google Drive, Notion, and Trello — controlled from Telegram by text or voice.

## The problem

Running a small e-commerce brand means a lot of small, repetitive, context-heavy tasks that live in different tools and eat founder time:

- **"Who ordered what, and when?"** B2B reorder tracking meant manually digging through order-confirmation forms for each vendor, stored across Google Drive — slow, and easy to let reorder timing slip.
- **Shopify housekeeping.** Checking the last 10–15 orders, which countries they came from, and pulling a quick read on recent sales meant logging into Shopify and clicking around every time.
- **Order fulfilment.** After physically posting an order, marking it "fulfilled" meant opening Shopify and clicking through the order — a context switch every single time.
- **Operational data spread thin.** Production and inventory data lived in sheets; company knowledge lived across Drive with no single "where is everything" index.

The goal: put a single conversational interface in front of all of it, so these tasks happen by asking — and start improving the B2B sales/reorder flow along the way.

## What it does today

Plain-English capabilities, controlled entirely from **Telegram** (text or voice command):

- **Shopify (read + write):** pulls recent orders, breaks them down by country, and gives an at-a-glance read on recent sales. Can mark orders as fulfilled directly from a Telegram message instead of clicking through Shopify.
- **Daily morning brief:** a scheduled summary of the last day's/week's Shopify situation, delivered automatically (via cron).
- **Google Drive (read + write):** all company data lives here; the agent reads and updates files end-to-end — including parsing vendor order-confirmation forms to answer "who ordered when" for reorder tracking.
- **Notion (read + write):** maintains a company knowledge base and reads/writes structured notes.
- **Trello (write):** updates and manages tasks.
- **Production sheet:** reads the sheet and appends new rows on instruction, replacing a manual update step.
- **Web search:** available for pulling in outside context.

## How it's built

Built on **OpenClaw** — an open-source, self-hosted, model-agnostic agent framework — running on a repurposed laptop as an always-on Linux server.

Flow, end to end:

- **Interface:** Telegram (text + voice) → OpenClaw agent loop.
- **Reasoning:** OpenClaw routes to a swappable LLM provider (see model note below).
- **Tools/actions:** Shopify, Google Drive, Notion, Trello, web search, and scheduled (cron) tasks, wired in as skills.
- **Short-term memory:** OpenClaw's built-in memory — a set of `.md` instruction files defining what to persist and rules for how the agent should reason about different task types.
- **Long-term "company memory":** a Notion knowledge base, built by ingesting all of Google Drive into Notion, so Notion becomes a structured directory of what lives where and how the company works. This is a curated retrieval layer — deliberately not a formal vector-RAG pipeline — that keeps company context alive across sessions.
- **Custom Shopify app:** built specifically to give the agent authenticated API access to the store.

| Layer | Choice |
|---|---|
| Agent framework | OpenClaw (open-source, self-hosted) |
| Host | Repurposed laptop → Linux, always-on server |
| Interface | Telegram (text + voice) |
| LLM | Model-agnostic; currently Google Gemini Flash (cost-driven) |
| Actions/tools | Shopify, Google Drive, Notion, Trello, web search, cron |
| Short-term memory | OpenClaw built-in (`.md` rules) |
| Long-term memory | Notion knowledge base (ingested from Google Drive) |
| Skills | Community skills from openskills.org, downloaded and tuned |

### Model choice — a cost/capability trade-off

Started on an OpenAI (Codex) model, tried Claude (strong, but API cost was too high for always-on use), and settled on Google Gemini Flash as the cheapest capable option. Because OpenClaw is model-agnostic, swapping providers was a config change — which made it possible to treat model selection as an ongoing cost/quality decision rather than a lock-in.

## What I built myself vs. used off-the-shelf

Being precise here, because it's the honest version an interviewer will probe:

**Did myself:**
- Wiped and set up the laptop; installed Linux from scratch.
- Followed the OpenClaw setup procedure and got the framework running.
- Connected API keys to the LLM providers myself.
- Built a custom Shopify app to give the agent store access.
- Sourced community skills, installed and tuned them.
- Iterated heavily on memory rules, context, and task-routing instructions.

**Did not do (deliberately, yet):**
- No custom RAG pipeline, no LangChain, no n8n, no heavy custom programming.

This is a "systems integrator / builder-operator" profile rather than a from-scratch-framework-author one — which is exactly the shape of forward-deployed and enablement work: land in a real environment, wire real tools together, make them work.

## Hardest problems & what I learned

The honest engineering story — and the most relevant part for AI-deployment roles:

- **Channel integration was fiddly.** WhatsApp access never worked; Telegram eventually did.
- **The real wall was agent quality** — memory, skills, and reasoning. Out of the box the agent felt "stupid": it needed continuously more context, better memory, and explicit rules on how to think about each task type.
- **Rules cut both ways.** Adding task-reasoning rules to make it smarter also pushed it toward overengineering simple tasks — a genuine tuning trade-off I'm still learning to balance.
- **Model swaps were part of the fix**, not just a cost lever — capability and cost had to be balanced together.

**Key takeaway:** getting an agent *connected* is the easy 20%. Getting it *reliable, appropriately-scoped, and genuinely useful* — memory, context, guardrails, right-sized behaviour — is the hard 80%. That gap is the actual job.

## Current status & path to production

**Where it is:** deployed and founder-used prototype, currently paused (host laptop is off).

**To make it production-grade and prove real impact:**

1. **Reliability + always-on hosting** — move off the laptop to a low-cost cloud host (target under $10/month).
2. **Guardrails & permissions** — the agent has write access to live systems (Shopify orders, Drive, Notion); multi-user rollout needs proper scoping and safety rails.
3. **Multi-user access** — give the co-founder and employees their own nodes/access.
4. **Then measure** — only with stable, multi-user production use can real time-saved/impact be assessed.

**Wishlist:** email integration, a working WhatsApp channel, an inventory dashboard, and a more robust approach to memory + skill quality.
