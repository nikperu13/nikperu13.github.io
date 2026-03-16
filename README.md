# Nicolas Garcia Rosell | Portfolio

Static portfolio focused on SDET engineering, automation architecture, and release reliability.

## Overview

The site is framework-free on purpose:

- static HTML pages
- CSS-driven design system
- TypeScript for interaction and motion
- build-time resume parsing to keep homepage content aligned with the current resume

Current homepage structure:

- hero / introduction
- projects showcase
- experience
- contact

Project detail pages live under `projects/` and share the same theme, background, and motion system.

## Project Structure

```text
assets/
  css/
    gradient.css      shared background and particle-layer styling
    project.css       project page styling
    site.css          homepage styling
  img/
    profile/          hero portrait
    work/             source screenshots
    generated/        optimized/generated image output
  js/                 bundled browser output

projects/             static project detail pages
resume/               current resume source of truth

scripts/
  resume/             resume parsing + enrichment + HTML rendering

src/
  templates/          homepage HTML template
  ts/
    background/       particle background + parallax
    projects/         homepage project showcase behavior
    project.ts        project-page client behavior
    site.ts           homepage client behavior
    theme.ts          light/dark theme toggle
```

## Pages

- `index.html` -> homepage
- `projects/selenium-framework.html` -> Selenium framework case study
- `projects/playwright-framework.html` -> Playwright + API case study
- `projects/test-data-engine.html` -> test data orchestration case study

## UI / Interaction Notes

The current UI emphasizes:

- full-screen hero intro before projects
- fixed three-project showcase with active selection
- light/dark theme toggle
- shared particle-based animated background
- scroll reveal motion for homepage and project pages
- responsive layouts for desktop, intermediate, and mobile widths

## Resume Pipeline

The homepage is generated from the resume at build time.

Flow:

1. resolve the current resume from `resume/`
2. extract plain text from `.docx` or `.pdf`
3. parse structured resume data
4. optionally tighten experience bullets with local Ollama
5. write `data/resume.json`
6. render `index.html` from `src/templates/index.template.html`

Relevant files:

- [scripts/generate-resume-site.ts](scripts/generate-resume-site.ts)
- [scripts/resume/readResume.ts](scripts/resume/readResume.ts)
- [scripts/resume/parseResume.ts](scripts/resume/parseResume.ts)
- [scripts/resume/enrichPortfolio.ts](scripts/resume/enrichPortfolio.ts)
- [scripts/resume/renderSite.ts](scripts/resume/renderSite.ts)

### Resume File Rules

The build only reads resumes from the `resume/` folder.

Selection behavior:

- `resume/resume.pdf` or `resume/resume.docx` is preferred when present
- otherwise the build uses any `.pdf` / `.docx` in `resume/`
- if multiple files exist there, it chooses the most recently modified one

## Optional Local AI

AI is constrained on purpose.

What it can do:

- tighten and select the strongest experience bullets per role

What it does not control:

- layout
- hero structure
- project showcase structure
- general page design

Environment flags:

- `RESUME_AI=off` -> never call Ollama
- `RESUME_AI=auto` -> try Ollama, fall back silently
- `RESUME_AI=on` -> force an attempt, still fall back if unavailable
- `OLLAMA_MODEL=llama3.2:3b`
- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `RESUME_AI_DEBUG=1`

Example:

```bash
RESUME_AI=auto OLLAMA_MODEL=llama3.2:3b npm run build:resume
```

## Commands

Install dependencies:

```bash
npm install
```

Type-check:

```bash
npm run check:ts
```

Build browser bundles:

```bash
npm run build:ts
```

Watch browser bundles:

```bash
npm run watch:ts
```

Regenerate homepage from resume:

```bash
npm run build:resume
```

Optimize icons/images:

```bash
npm run build:assets
```

Full build:

```bash
npm run build
```

## Local Development

You can open `index.html` directly, but using a local static server is better for validating navigation, assets, and generated output.

## Current Theme System

The UI currently supports:

- `dark` -> forest-based dark theme
- `light` -> light background with green-led accents

The theme toggle persists to `localStorage` and reinitializes the background layer so particle colors update immediately.
