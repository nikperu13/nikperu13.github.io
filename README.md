# Nicolas Garcia Rosell | SDET Portfolio

Portfolio focused on automation framework engineering, CI scalability, and release reliability.

## Pages

- `index.html` -> main landing page (hero, philosophy, project portfolio, experience, contact)
- `projects/selenium-framework.html` -> parallel Selenium framework case study
- `projects/playwright-framework.html` -> Playwright + API architecture case study
- `projects/test-data-engine.html` -> test data orchestration case study

## Highlights Included

- Impact strip with measurable outcomes (`98% coverage`, `6-7x faster regression`, `~80% flakiness reduction`)
- Engineering philosophy section for deterministic quality principles
- Project case studies with architecture, outcomes, and engineering tradeoff decisions
- Experience section condensed to high-signal delivery metrics
- Contact section with direct email + phone links

## Tech Stack

- HTML5
- CSS3 (`assets/css/site.css`, `assets/css/project.css`)
- TypeScript source (`src/ts/site.ts`) compiled to JavaScript output (`assets/js/site.js`)
- Build-time resume pipeline (`scripts/generate-resume-site.ts` -> `data/resume.json` -> `index.html`)
- Inline SVG icons (no icon-font dependency)
- Separate TypeScript configs for browser code (`tsconfig.app.json`) and Node build scripts (`tsconfig.scripts.json`)

## Local Run

Open `index.html` directly in your browser, or run a local static server from repo root.

## TypeScript Workflow

- Install dependencies: `npm install`
- Type-check only: `npm run check:ts`
- Build JS output: `npm run build:ts`
- Watch while editing: `npm run watch:ts`
- Regenerate resume-driven homepage data: `npm run build:resume`
- Full build: `npm run build`

## Resume Pipeline

The homepage stays static, but selected content is generated at build time from the resume file in the repository.

Flow:

- resume file (`resume/resume.pdf`, `resume/resume.docx`, or the current root resume file)
- parsing step (`scripts/resume/readResume.ts`, `scripts/resume/parseResume.ts`)
- optional local AI enrichment (`scripts/resume/enrichPortfolio.ts`)
- structured data output (`data/resume.json`)
- static rendering (`src/templates/index.template.html` -> `index.html`)

### Optional Local AI

The build can optionally use a local Ollama model to rewrite parsed resume data into short portfolio-style copy while keeping the same page structure.

- default behavior: `RESUME_AI=auto` behavior, which tries local Ollama and silently falls back
- disable AI entirely: `RESUME_AI=off npm run build:resume`
- force an Ollama attempt: `RESUME_AI=on npm run build:resume`
- choose a model explicitly: `OLLAMA_MODEL=llama3.2:3b RESUME_AI=auto npm run build:resume`
- optional custom server URL: `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- print raw model output for debugging: `RESUME_AI_DEBUG=1 RESUME_AI=auto npm run build:resume`

Recommended setup:

- install Ollama locally
- pull a small local model such as `llama3.2:3b`
- keep the fallback path in place so builds do not fail when AI is unavailable
