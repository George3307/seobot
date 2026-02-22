# 🔍 SEOBot — Open Source AI SEO Tool

> Keyword research, AI content generation, and technical SEO audit — all in one tool.

**[GitHub](https://github.com/George3307/seobot)** 

## Features

### 📊 Keyword Research
- Enter a seed keyword → expand via Google Suggest (2-level recursive)
- Automatic clustering by semantic similarity
- Export results as CSV

### ✍️ AI Content Generator
- Input keyword → generate SEO-optimized outline (3 title suggestions)
- Generate full article from outline (English & Chinese)
- Built-in SEO scoring: keyword density, headings, readability
- Export as Markdown

### 🔍 Technical SEO Audit
- Input any URL → instant analysis
- Checks: title tag, meta description, H1 tags, HTTPS, viewport, lang attribute
- Pass/Warn/Fail indicators

## Quick Start

```bash
git clone https://github.com/George3307/seobot.git
cd seobot
npm install
```

Set your OpenAI API key (required for content generation):
```bash
export OPENAI_API_KEY=your_key_here
```

```bash
npm run dev
# Open http://localhost:3000
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4o-mini
- **Language**: TypeScript

## Roadmap

- [ ] Rank tracking (daily keyword position monitoring)
- [ ] Internal link optimization
- [ ] Programmatic SEO (template-based bulk page generation)
- [ ] Backlink analysis
- [ ] Google Search Console integration
- [ ] Multi-language expansion
- [ ] Self-hosted Docker image

## Self-Host

This is a standard Next.js app. Deploy anywhere:
- Vercel (recommended)
- Docker
- Any Node.js server

## Contributing

PRs welcome! Check the roadmap above for what's next.

## License

MIT

---

Built by [George3307](https://github.com/George3307) ✳️
