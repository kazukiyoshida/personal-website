# Agent Development Guide

A file for [guiding coding agents](https://agents.md/).

## Commands

- **Dev server:** `npm run dev` (Astro dev server, default port 4321)
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Type check:** `npx tsc --noEmit`

## Tech Stack

- **Framework:** Astro 4.x (Island Architecture)
- **UI:** React 18 (hydrated with `client:load`)
- **Styling:** Tailwind CSS 3 + custom CSS (Terminal Noir design system)
- **State:** nanostores + @nanostores/react
- **Content:** Astro Content Collections (Markdown)
- **Syntax Highlighting:** Shiki (github-dark)

## Directory Structure

- `src/pages/` — Astro file-based routing (index, about, blog/[slug])
- `src/components/` — React components (islands) and Astro components
- `src/content/blog/{slug}/` — Blog posts (ja.md, en.md, zh.md per post)
- `src/content/config.ts` — Content Collection schema
- `src/layouts/` — Astro layout (Layout.astro)
- `src/lib/` — Shared logic (blog-data.ts, i18n.ts)
- `src/styles/` — Global CSS (Terminal Noir design system)
- `public/images/` — Static images (sidebar bg, blog post images)
- `docs/` — Design notes and work log

## Blog Post Structure

Each blog post lives in `src/content/blog/{slug}/` with 3 files:
- `ja.md` — Japanese (primary)
- `en.md` — English translation
- `zh.md` — Chinese translation

Frontmatter schema:
```yaml
---
title: "記事タイトル"
date: "YYYY-MM-DD"
tags: ["Tag1", "Tag2"]
excerpt: "記事の概要"
lang: "ja"        # ja | en | zh
postSlug: "slug"  # shared across languages
draft: false      # optional, hides from listing
---
```

When adding a new post, also add its metadata to `src/lib/blog-data.ts`.

## Design System

- Theme: "Terminal Noir" — dark terminal aesthetic with amber accent
- Fonts: JetBrains Mono (headings/code), IBM Plex Sans JP (body)
- Accent color: oklch(0.73 0.17 65) (amber)
- Layout: Fixed left sidebar (280px) + scrollable right content
- Markdown styles: `.prose` class in global.css
