import fs from "node:fs/promises";
import path from "node:path";

import { enrichResumeDataWithPortfolioContent } from "./resume/enrichPortfolio";
import { parseResume } from "./resume/parseResume";
import { readResumeText, resolveResumePath } from "./resume/readResume";
import { renderTemplate } from "./resume/renderSite";

const repoRoot = process.cwd();

const templatePath = path.join(repoRoot, "src", "templates", "index.template.html");
const outputHtmlPath = path.join(repoRoot, "index.html");
const outputDataPath = path.join(repoRoot, "data", "resume.json");

/**
 * Build-time entrypoint for the resume-driven homepage generation flow.
 *
 * Pipeline:
 * 1. locate the current resume file in the repository
 * 2. extract plain text from PDF/DOCX
 * 3. parse structured resume data
 * 4. optionally enrich that data into concise portfolio copy
 * 5. emit JSON for inspection/debugging
 * 6. render the static homepage from the HTML template
 */
async function main(): Promise<void> {
  const resumePath = await resolveResumePath(repoRoot);
  const rawText = await readResumeText(resumePath);
  const parsedData = parseResume(rawText, path.relative(repoRoot, resumePath));
  const enrichment = await enrichResumeDataWithPortfolioContent(parsedData);
  const { debug, ...resumeArtifacts } = enrichment;
  const data = {
    ...parsedData,
    ...resumeArtifacts,
  };

  await fs.mkdir(path.dirname(outputDataPath), { recursive: true });
  await fs.writeFile(outputDataPath, JSON.stringify(data, null, 2) + "\n", "utf8");

  const template = await fs.readFile(templatePath, "utf8");
  const html = renderTemplate(template, data);
  await fs.writeFile(outputHtmlPath, html, "utf8");

  logAiStatus(data.ai, debug);

  console.log(
    `Generated ${path.relative(repoRoot, outputDataPath)} and ${path.relative(repoRoot, outputHtmlPath)} from ${path.relative(repoRoot, resumePath)}`,
  );
}

/**
 * Keeps build output explicit so local AI behavior is visible in terminal logs
 * without requiring the user to inspect the generated JSON artifact.
 */
function logAiStatus(
  ai: {
    enabled: boolean;
    attempted: boolean;
    used: boolean;
    provider: "none" | "ollama";
    model: string | null;
    error: string | null;
  },
  debug: {
    mode: "off" | "auto" | "on";
    baseUrl: string;
    rawAiResponse: string | null;
  },
): void {
  if (!ai.enabled) {
    console.log("[resume-ai] disabled");
    return;
  }

  if (ai.used) {
    console.log(`[resume-ai] using ${ai.provider}:${ai.model} via ${debug.baseUrl} (mode=${debug.mode})`);

    if (process.env.RESUME_AI_DEBUG === "1" || process.env.RESUME_AI_DEBUG === "true") {
      console.log("[resume-ai] raw model response:");
      console.log(debug.rawAiResponse ?? "<empty>");
    }

    return;
  }

  if (ai.attempted) {
    console.log(
      `[resume-ai] fallback to deterministic summaries; ${ai.provider}:${ai.model ?? "n/a"} unavailable (${ai.error ?? "unknown error"})`,
    );
    return;
  }

  console.log(`[resume-ai] skipped remote generation in mode=${debug.mode}`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
