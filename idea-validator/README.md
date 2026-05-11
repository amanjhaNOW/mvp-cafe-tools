# 🚀 Startup Idea Validator

**Validate your startup idea before writing a single line of code.**

A free, instant startup idea validation tool that generates comprehensive reports including market sizing, competitor analysis, customer personas, revenue models, MVP scope, and a build-or-kill verdict.

## What It Does

Enter a one-line startup idea and get:

| Section | What You Get |
|---------|-------------|
| **🎯 Build vs Don't Build Verdict** | Confidence score (0-100) with reasoning |
| **📊 Market Size (TAM/SAM/SOM)** | Estimated total, serviceable, and obtainable market |
| **⚔️ Competitive Landscape** | Top 5 competitors with pricing and weaknesses |
| **👥 Customer Personas** | 3 detailed personas with pain points, budgets, and channels |
| **💰 Revenue Models** | 4 monetization strategies with pricing benchmarks |
| **🛠️ MVP Scope** | 3-5 must-build features with rationale |
| **⏱️ Build Estimate** | Timeline and cost for solo, team, and mvp.cafe builds |

## How It Works

- **Smart keyword analysis** — detects industry categories (AI, SaaS, fintech, health, etc.)
- **Context-aware generation** — competitors, personas, and models match the idea's domain
- **Deterministic randomness** — same idea always produces the same report (seeded RNG)
- **No API keys needed** — runs entirely in the browser as a single HTML file

## Tech Stack

- Single HTML file (~63KB) — no build tools, no dependencies
- Vanilla JavaScript with seeded PRNG for deterministic outputs
- Google Fonts (Inter + Playfair Display)
- CSS animations and responsive design
- Dark theme with gold accents (#c4a574)

## Design

- **Background:** #0a0a0a (near-black)
- **Text:** #ffffff (white) / #999999 (dim)
- **Accent:** #c4a574 (warm gold)
- **Fonts:** Playfair Display (headings), Inter (body)
- **Mobile-responsive** — works on all screen sizes
- **Smooth animations** — cards fade in sequentially

## Demo Mode

Currently runs in demo mode with a sophisticated keyword-matching engine that generates plausible, industry-specific reports. Covers 15+ industry verticals:

AI, SaaS, Marketplace, E-commerce, Fintech, Health, Education, Food, Pets, Real Estate, HR, Social, Logistics, Sustainability, B2B

## Future: AI Mode

The architecture is ready for a real AI backend:
1. Replace the demo engine with an OpenAI API call (via Cloudflare Worker proxy)
2. Feed the idea + structured prompt → get JSON response
3. Render using the same UI components

## Deployment

It's a single HTML file. Deploy anywhere:

```bash
# Netlify
netlify deploy --dir=.

# Vercel
vercel .

# GitHub Pages
# Just push index.html to a repo with Pages enabled

# Or literally just open the file
open index.html
```

## Built By

[mvp.cafe](https://mvp.cafe) — We help founders ship MVPs fast.

---

*Part of the Overnight Builds series — shipping one tool per night.*
