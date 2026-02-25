---
title: "I built an open-source alternative to $300/mo SEO tools"
published: false
description: "SEOBot: keyword research, AI content generation, technical audit, and one-click publishing — all free, all local."
tags: opensource, seo, ai, webdev
cover_image: 
---

I was spending $200+/month on SEO tools. Ahrefs for keyword research, Surfer for content optimization, Jasper for AI writing. Three subscriptions, three dashboards, and I was still copy-pasting between them.

So I built SEOBot — an open-source toolkit that handles the whole SEO workflow in one place.

## What it does

**Keyword Research** — Type a seed keyword, get 50+ long-tail suggestions via Google Suggest (recursive 2-level expansion). Automatically clustered by semantic similarity. Zero API cost.

**AI Content Generation** — Pick a keyword → get 3 title suggestions → generate a full SEO-optimized article with real-time scoring (keyword density, heading structure, readability). Costs about $0.01 per article via OpenAI API.

**Technical SEO Audit** — Paste any URL, get an 18-point analysis across meta tags, content quality, security, mobile-friendliness, and performance. Visual score with actionable recommendations.

**One-Click Publishing** — Push to Dev.to, WordPress, Twitter/X, or export as Markdown. Credentials stay in your browser.

## What it doesn't do (yet)

I want to be upfront:

- No backlink data (we don't crawl the web like Ahrefs)
- No keyword volume numbers (Google Suggest gives you real queries but not search volume)
- No rank tracking (yet)
- AI content needs human editing — it's a strong first draft, not a final product

These are on the roadmap. But even without them, the current feature set covers the daily SEO workflow for indie hackers and small teams.

## Tech stack

- Next.js 14 + TypeScript + Tailwind + shadcn/ui
- OpenAI GPT-4o-mini for content generation
- Client-side only — your data never leaves your machine

## Try it

```bash
git clone https://github.com/George3307/seobot.git
cd seobot && npm install && npm run dev
```

Keyword research and audit work **without any API key**. Content generation needs an OpenAI key (set `OPENAI_API_KEY`).

## Why open source?

I believe the best SEO tool is one you control. No monthly bill that goes up. No feature gates. No "upgrade to see this keyword." Fork it, customize it, self-host it.

If SEOBot is useful to you:
- ⭐ [Star it on GitHub](https://github.com/George3307/seobot) — helps others find it
- 🐛 [Open an issue](https://github.com/George3307/seobot/issues) — tell me what feature you need most
- 🔧 PRs welcome — check the [roadmap](https://github.com/George3307/seobot#roadmap)

MIT licensed. Free forever.
