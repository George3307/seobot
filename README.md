<p align="center">
  <h1 align="center">🔍 SEOBot</h1>
  <p align="center"><strong>Open-source AI SEO toolkit — research, write, audit, publish. All in one.</strong></p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#roadmap">Roadmap</a> •
    <a href="#self-host">Self-Host</a>
  </p>
</p>

---

**SEOBot** is a free, open-source AI-powered SEO toolkit. No subscriptions, no limits, no vendor lock-in. Bring your own OpenAI key and run it locally or deploy anywhere.

> 💡 **Why SEOBot?** Tools like Ahrefs ($99/mo), Surfer ($89/mo), and Jasper ($49/mo) charge hundreds per month. SEOBot gives you 80% of the functionality for the cost of your OpenAI API calls (~$0.01/article).

## Features

### 📊 Keyword Research
- Enter a seed keyword → auto-expand via Google Suggest (2-level recursive)
- Smart clustering by semantic similarity
- Export results as CSV
- **Zero API cost** — uses Google's public autocomplete

### ✍️ AI Content Generator
- 3-step workflow: **Keyword → Outline → Full Article**
- 3 AI-generated title suggestions per keyword
- SEO scoring with pass/warn/fail indicators (keyword density, headings, readability)
- English & Chinese (中文) support
- Copy to clipboard or export as Markdown

### 🔍 Technical SEO Audit
- Comprehensive 18-point analysis across 5 categories:
  - **Meta Tags**: Title, description, OG tags, Twitter card, canonical, robots, structured data
  - **Content**: H1, word count, heading hierarchy, image alt text, internal/external links
  - **Security**: HTTPS, mixed content detection
  - **Mobile**: Viewport, language attribute
  - **Performance**: Load time, page size
- Visual score (0-100) with per-category breakdowns
- Heading structure visualization

### 📤 One-Click Publish
- **Dev.to** — Publish or save as draft with your API key
- **WordPress** — Post to any WordPress site via REST API
- **Twitter/X** — Share article summaries
- **Markdown** — Export for static site generators (Hugo, Astro, Jekyll)
- Credentials saved locally (never leaves your browser)

## Quick Start

```bash
git clone https://github.com/George3307/seobot.git
cd seobot
npm install
```

Set your OpenAI API key (required for content generation only):
```bash
export OPENAI_API_KEY=your_key_here
```

```bash
npm run dev
# Open http://localhost:3000
```

> Keyword research and SEO audit work **without any API key**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| AI | OpenAI GPT-4o-mini |
| Language | TypeScript |
| Deployment | Vercel / Docker / Any Node.js server |

## Roadmap

- [x] Keyword research (Google Suggest expansion + clustering)
- [x] AI content generation with SEO scoring
- [x] Technical SEO audit (18 checks)
- [x] Multi-platform publishing (Dev.to, WordPress, Twitter, Markdown)
- [ ] Rank tracking (daily keyword position monitoring)
- [ ] SERP analysis (competitor content scoring)
- [ ] Internal link optimization suggestions
- [ ] Programmatic SEO (template-based bulk generation)
- [ ] Backlink analysis
- [ ] Google Search Console integration
- [ ] Docker image for one-command deploy
- [ ] Chrome extension

## Self-Host

Standard Next.js app. Deploy anywhere:

```bash
# Docker (coming soon)
docker run -e OPENAI_API_KEY=sk-xxx -p 3000:3000 seobot

# Vercel
vercel deploy

# PM2
npm run build && pm2 start npm --name seobot -- start
```

## Cost Comparison

| Tool | Monthly Cost | What You Get |
|------|-------------|--------------|
| Ahrefs | $99-999 | Full SEO suite |
| Surfer SEO | $89-299 | Content optimization |
| Jasper AI | $49-125 | AI writing |
| **SEOBot** | **$0 + API** | Keyword research + AI content + audit + publish |

> Average OpenAI API cost: ~$0.01 per article generated

## Contributing

PRs welcome! Check the [roadmap](#roadmap) above for what's next, or open an issue.

## Support the Project

If SEOBot saves you money, consider supporting development:

- ⭐ **Star this repo** — helps others find it
- 🐛 **Report bugs** — open an issue
- 🔧 **Contribute** — PRs welcome
- ☕ **Buy me a coffee** — [buymeacoffee.com/george3307](https://buymeacoffee.com/george3307)

## License

MIT

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/George3307">George3307</a> ✳️
  <br/>
  <sub>If this saves you money, ⭐ the repo!</sub>
</p>
