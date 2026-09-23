---
title: "An e-commerce operations agent, run from Telegram"
summary: "Built on OpenClaw, self-hosted, connected to Shopify, Google Drive, Notion, Trello and cron — reads orders, fulfils them by chat command, and sends a daily sales brief. No dashboard required."
status: prototype
statusLabel: "Working prototype — deployed, host currently paused"
stack:
  - "OpenClaw"
  - "Telegram (text + voice)"
  - "Shopify API"
  - "Google Drive API"
  - "Notion API"
  - "Trello API"
  - "Google Gemini Flash"
stats:
  - label: "Systems wired in"
    value: "6"
  - label: "Interface"
    value: "Telegram"
  - label: "Dashboards required"
    value: "0"
publishDate: 2026-09-21
tags: ["e-commerce", "agent", "openclaw"]
---

## The problem

Running a small e-commerce brand means a lot of small, repetitive, context-heavy tasks spread across different tools: tracking who ordered what and when for B2B reorders, checking recent Shopify orders and sales, marking orders fulfilled after posting them, and keeping production and inventory data current — all manual, all context-switching.

The goal: put one conversational interface in front of all of it, so these tasks happen by asking.

## What it does today

- **Shopify (read + write)** — pulls recent orders by country, gives a sales snapshot, and marks orders fulfilled directly from a Telegram message.
- **Daily morning brief** — a scheduled summary of the last day's / week's Shopify situation, sent automatically via cron.
- **Google Drive (read + write)** — reads and updates company files, including parsing vendor order-confirmation forms for B2B reorder tracking.
- **Notion (read + write)** — maintains a company knowledge base built by ingesting Drive into Notion.
- **Trello (write)** — updates and manages tasks.
- **Production sheet** — reads and appends new rows on instruction, replacing a manual update step.

## How it's built

Built on **OpenClaw** — an open-source, self-hosted, model-agnostic agent framework — running on a repurposed laptop as an always-on Linux server.

| Layer | Choice |
|---|---|
| Interface | Telegram (text + voice) |
| Reasoning | Model-agnostic — currently Google Gemini Flash, after testing OpenAI Codex and Claude (cost-driven decision) |
| Short-term memory | OpenClaw's built-in memory — `.md` instruction files defining what to persist and how to reason per task type |
| Long-term memory | A Notion knowledge base, built by ingesting Google Drive — a curated retrieval layer, deliberately not a formal vector-RAG pipeline |
| Custom build | A Shopify app built from scratch to give the agent authenticated store access |
| Skills | Community skills from openskills.org, downloaded and tuned |

## The honest part

WhatsApp access never worked; Telegram eventually did. But the real wall was agent quality — memory, skills, and reasoning. Out of the box the agent felt "stupid": it needed continuously more context and explicit rules on how to think about each task type. Adding those rules also pushed it toward overengineering simple tasks — a tuning trade-off still being worked out.

Getting an agent *connected* is the easy 20%. Getting it reliable and appropriately-scoped is the hard 80%.

## What's next

- Move hosting off the laptop to a low-cost, always-on cloud host
- Add guardrails and permission scoping before rolling out to other users
- Extend access to the co-founder and employees
- Add email integration, a working WhatsApp channel, and an inventory dashboard
