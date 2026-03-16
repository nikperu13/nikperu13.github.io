import type {
  PortfolioContent,
  PortfolioExperience,
  ResumeData,
  ResumeExperience,
} from "./types";

/**
 * Raw non-streaming Ollama response shape for `/api/generate`.
 */
type OllamaResponse = {
  response?: string;
};

/**
 * Narrow JSON contract expected back from the local model. The build sanitizes
 * and constrains this further before any content is rendered.
 */
type AiPortfolioPayload = {
  experience?: Array<{
    role?: string;
    company?: string;
    dateRange?: string;
    highlights?: string[];
  }>;
};

/**
 * Internal return shape for the enrichment stage.
 *
 * `debug` is intentionally not persisted into `resume.json`; it only exists so
 * the build script can print meaningful terminal diagnostics.
 */
type EnrichmentResult = Pick<ResumeData, "portfolio" | "ai"> & {
  debug: {
    mode: "off" | "auto" | "on";
    baseUrl: string;
    rawAiResponse: string | null;
  };
};

/**
 * Produces the constrained portfolio layer used by the homepage.
 *
 * Hero and project content stay deterministic. Optional AI is limited to
 * selecting and tightening the strongest experience bullets per role.
 */
export async function enrichResumeDataWithPortfolioContent(
  data: Omit<ResumeData, "portfolio" | "ai">,
): Promise<EnrichmentResult> {
  const fallback = buildDeterministicPortfolio(data);
  const config = getAiConfig();

  if (config.mode === "off") {
    return {
      portfolio: fallback,
      ai: {
        enabled: false,
        attempted: false,
        used: false,
        provider: "none",
        model: null,
        error: null,
      },
      debug: {
        mode: config.mode,
        baseUrl: config.baseUrl,
        rawAiResponse: null,
      },
    };
  }

  const available = await isOllamaAvailable(config.baseUrl, config.model);
  if (!available.ok) {
    if (config.mode === "on") {
      return {
        portfolio: fallback,
        ai: {
          enabled: true,
          attempted: true,
          used: false,
          provider: "ollama",
          model: config.model,
          error: available.error,
        },
        debug: {
          mode: config.mode,
          baseUrl: config.baseUrl,
          rawAiResponse: null,
        },
      };
    }

    return {
      portfolio: fallback,
      ai: {
        enabled: true,
        attempted: config.mode === "auto",
        used: false,
        provider: "ollama",
        model: config.model,
        error: available.error,
      },
      debug: {
        mode: config.mode,
        baseUrl: config.baseUrl,
        rawAiResponse: null,
      },
    };
  }

  try {
    const aiResult = await generatePortfolioWithOllama(data, config.baseUrl, config.model);
    const merged = mergePortfolio(fallback, aiResult.payload, data);

    return {
      portfolio: merged,
      ai: {
        enabled: true,
        attempted: true,
        used: true,
        provider: "ollama",
        model: config.model,
        error: null,
      },
      debug: {
        mode: config.mode,
        baseUrl: config.baseUrl,
        rawAiResponse: aiResult.raw,
      },
    };
  } catch (error) {
    return {
      portfolio: fallback,
      ai: {
        enabled: true,
        attempted: true,
        used: false,
        provider: "ollama",
        model: config.model,
        error: error instanceof Error ? error.message : String(error),
      },
      debug: {
        mode: config.mode,
        baseUrl: config.baseUrl,
        rawAiResponse: null,
      },
    };
  }
}

/**
 * Reads AI runtime configuration from environment variables.
 *
 * Modes:
 * - `off`: never call Ollama
 * - `auto`: try Ollama if available, otherwise fall back silently
 * - `on`: force an attempt, but still return deterministic content if it fails
 */
function getAiConfig(): {
  mode: "off" | "auto" | "on";
  model: string;
  baseUrl: string;
  debug: boolean;
} {
  const flag = (process.env.RESUME_AI || "auto").trim().toLowerCase();
  const model = process.env.OLLAMA_MODEL?.trim() || "llama3.2:3b";
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434";
  const debug = process.env.RESUME_AI_DEBUG === "1" || process.env.RESUME_AI_DEBUG === "true";
  const mode =
    flag === "1" || flag === "true" || flag === "on"
      ? "on"
      : flag === "off" || flag === "0" || flag === "false"
        ? "off"
        : "auto";

  return { mode, model, baseUrl, debug };
}

/**
 * Health check used before generation so normal builds do not block on a dead
 * or missing local AI service.
 */
async function isOllamaAvailable(
  baseUrl: string,
  model: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return { ok: false, error: `Ollama tags request failed with status ${response.status}` };
    }

    const body = (await response.json()) as { models?: Array<{ name?: string; model?: string }> };
    const availableModels = body.models ?? [];
    const hasModel = availableModels.some((entry) => entry.name === model || entry.model === model);

    if (!hasModel) {
      return { ok: false, error: `Ollama is reachable, but model "${model}" is not installed` };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Calls the local Ollama HTTP API for the constrained experience rewrite.
 */
async function generatePortfolioWithOllama(
  data: Omit<ResumeData, "portfolio" | "ai">,
  baseUrl: string,
  model: string,
): Promise<{ payload: AiPortfolioPayload; raw: string }> {
  const prompt = buildPrompt(data);
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const body = (await response.json()) as OllamaResponse;
  if (!body.response) {
    throw new Error("Ollama returned an empty response");
  }

  return {
    payload: JSON.parse(body.response) as AiPortfolioPayload,
    raw: body.response,
  };
}

/**
 * The prompt is intentionally narrow: it only allows the model to choose and
 * tighten the strongest existing bullets for each role.
 */
function buildPrompt(data: Omit<ResumeData, "portfolio" | "ai">): string {
  return [
    "You are refining resume bullet points for a portfolio experience section.",
    "Return JSON only.",
    "Constraints:",
    "- experience: keep the same number of roles as input.",
    "- For each role, return exactly 3 bullet points in highlights.",
    "- Only use facts already present in that role's input bullets.",
    "- Preserve metrics, counts, percentages, and technologies when present.",
    "- Prefer the strongest bullets based on impact, ownership, scale, reliability, and architecture.",
    "- Rewrite bullets to be concise and strong, maximum 22 words per bullet.",
    "- Do not invent employers, metrics, or technologies.",
    "- Do not add projects, summaries, pills, or any other sections.",
    "Input JSON:",
    JSON.stringify({
      experience: data.experience,
    }),
    "Output JSON shape:",
    JSON.stringify({
      experience: [
        {
          role: "string",
          company: "string",
          dateRange: "string",
          highlights: ["string", "string", "string"]
        }
      ]
    }),
  ].join("\n");
}

/**
 * Non-AI baseline used for reliability and as a guardrail against drift.
 */
function buildDeterministicPortfolio(
  data: Omit<ResumeData, "portfolio" | "ai">,
): PortfolioContent {
  return {
    heroSummary: buildHeroSummary(data),
    heroPills: selectHeroPills(data),
    experience: data.experience.map((entry) => ({
      company: entry.company,
      role: entry.role,
      dateRange: entry.dateRange,
      highlights: pickTopHighlights(entry.highlights, 3),
    })),
    projects: data.projects.map((project) => ({
      title: project.title,
      summary: shortenSentence(project.summary, 18),
      technologies: project.technologies.slice(0, 4),
    })),
  };
}

/**
 * Merges AI output onto the deterministic base after sanitizing length and
 * structure. The model can improve wording, but it does not own the shape.
 */
function mergePortfolio(
  fallback: PortfolioContent,
  aiPayload: AiPortfolioPayload,
  data: Omit<ResumeData, "portfolio" | "ai">,
): PortfolioContent {
  return {
    heroSummary: fallback.heroSummary,
    heroPills: fallback.heroPills,
    experience: mergeExperience(fallback.experience, aiPayload.experience, data.experience),
    projects: fallback.projects,
  };
}

/**
 * Keeps AI experience output aligned to the parsed role ordering instead of
 * letting the model add or remove sections.
 */
function mergeExperience(
  fallback: PortfolioExperience[],
  aiEntries: AiPortfolioPayload["experience"],
  original: ResumeExperience[],
): PortfolioExperience[] {
  if (!aiEntries || aiEntries.length === 0) {
    return fallback;
  }

  return fallback.map((entry, index) => {
    const candidate = aiEntries[index];
    const source = original[index];

    if (!candidate) {
      return entry;
    }

    const highlights = sanitizeHighlights(candidate.highlights, source?.highlights ?? entry.highlights, 3, 22);

    return {
      company: entry.company,
      role: entry.role,
      dateRange: entry.dateRange,
      highlights,
    };
  });
}

/**
 * Builds a homepage-friendly hero sentence from durable resume themes.
 */
function buildHeroSummary(data: Omit<ResumeData, "portfolio" | "ai">): string {
  const themes = [] as string[];

  if (hasTechnology(data, "Playwright") || hasTechnology(data, "Selenium")) {
    themes.push("UI/API automation systems");
  }
  if (data.experience.some((entry) => entry.highlights.some((item) => /parallel|scale/i.test(item)))) {
    themes.push("parallel-ready quality platforms");
  }
  if (data.experience.some((entry) => entry.highlights.some((item) => /flakiness|reliability|isolation/i.test(item)))) {
    themes.push("reliable release confidence");
  }

  const phrase = themes.slice(0, 3).join(", ");
  if (phrase) {
    return `I build ${phrase} for integration-heavy products.`;
  }

  return shortenSentence(data.summary, 28);
}

function hasTechnology(data: Omit<ResumeData, "portfolio" | "ai">, keyword: string): boolean {
  return data.technologies.some((item) => item.toLowerCase().includes(keyword.toLowerCase()));
}

function selectHeroPills(data: Omit<ResumeData, "portfolio" | "ai">): string[] {
  const concepts = data.skills.find((group) => /engineering concepts/i.test(group.category));
  if (concepts) {
    return concepts.items.slice(0, 4).map(formatPill);
  }

  return data.technologies.slice(0, 4).map(formatPill);
}

/**
 * Selects the most portfolio-worthy bullets by favoring impact, architecture,
 * and reliability language over low-signal narrative text.
 */
function pickTopHighlights(highlights: string[], limit: number): string[] {
  return [...highlights]
    .sort((left, right) => scoreHighlight(right) - scoreHighlight(left))
    .slice(0, limit)
    .map((item) => shortenSentence(item, 16));
}

function scoreHighlight(value: string): number {
  let score = 0;
  if (/\d/.test(value)) score += 3;
  if (/parallel|scale|architecture|framework|isolation|reliability|flakiness|automation/i.test(value)) score += 3;
  if (/led|designed|architected|increased|reduced|refactored|implemented|contributed/i.test(value)) score += 2;
  return score;
}

function sanitizeSentence(value: string | undefined, maxWords: number): string {
  if (!value) {
    return "";
  }

  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) {
    return "";
  }

  return shortenSentence(clean, maxWords);
}

function shortenSentence(value: string, maxWords: number): string {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  if (words.length <= maxWords) {
    return value.trim();
  }

  const shortened = words.slice(0, maxWords).join(" ").replace(/[,:;]+$/, "");
  return `${shortened}.`;
}

function shortenPhrase(value: string, maxWords: number): string {
  return value.split(" ").slice(0, maxWords).join(" ").trim();
}

function formatPill(value: string): string {
  if (/deterministic/i.test(value) && /scalable/i.test(value)) {
    return "Deterministic Systems";
  }
  if (/parallel/i.test(value)) {
    return "Parallel Execution";
  }
  if (/test isolation/i.test(value)) {
    return "Test Isolation";
  }
  if (/domain modeling/i.test(value)) {
    return "Domain Modeling";
  }
  if (/api-based test data management/i.test(value)) {
    return "Dynamic Test Data";
  }
  if (/risk-based regression/i.test(value)) {
    return "Risk-Based Regression";
  }

  return shortenPhrase(value, 4);
}

function sanitizeHighlights(
  value: string[] | undefined,
  fallback: string[],
  requiredCount: number,
  maxWords: number,
): string[] {
  if (!value || value.length === 0) {
    return fallback;
  }

  const clean = value
    .slice(0, requiredCount)
    .map((item) => sanitizeSentence(item, maxWords))
    .filter(Boolean);

  return clean.length === requiredCount ? clean : fallback;
}
