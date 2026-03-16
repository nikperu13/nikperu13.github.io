import type { ResumeData } from "./types";

/**
 * Renders the static homepage template from the generated resume/portfolio
 * JSON. The site remains fully static; this step just resolves placeholders
 * before the page is served.
 */
export function renderTemplate(template: string, data: ResumeData): string {
  const replacements: Record<string, string> = {
    PAGE_TITLE: escapeHtml(`${data.name} | ${data.title}`),
    TITLE: escapeHtml(data.title),
    NAME: escapeHtml(data.name),
    SUMMARY: escapeHtml(data.portfolio.heroSummary),
    RESUME_HREF: "./" + encodeURI(data.sourceFile),
    HERO_PILLS: renderTagList(data.portfolio.heroPills),
    EXPERIENCE_CARDS: renderExperienceCards(data.portfolio.experience),
  };

  return template.replace(/{{([A-Z_]+)}}/g, (_, key: string) => replacements[key] ?? "");
}

/**
 * Shared renderer for chip/pill style lists used across hero, skills, and
 * derived projects.
 */
function renderTagList(items: string[]): string {
  return items.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function renderExperienceCards(experience: ResumeData["portfolio"]["experience"]): string {
  return experience
    .map(
      (entry) => `
            <article class="role-card">
              <div class="role-top">
                <div>
                  <div class="role-meta">${escapeHtml(entry.dateRange)}</div>
                  <h3>${escapeHtml(entry.role)}</h3>
                  <p class="org">${escapeHtml(entry.company)}</p>
                </div>
              </div>
              <p class="role-scope">${escapeHtml(buildRoleScope(entry))}</p>
              <ul>
                ${entry.highlights
                  .map((highlight) => `<li>${formatExperienceHighlight(highlight)}</li>`)
                  .join("")}
              </ul>
            </article>`,
    )
    .join("\n");
}

function buildRoleScope(entry: ResumeData["portfolio"]["experience"][number]): string {
  const role = entry.role.toLowerCase();

  if (role.includes("sr.") || role.includes("senior")) {
    return "Owned automation architecture, reliability, and delivery quality across large-scale integrated systems.";
  }

  if (role.includes("contract")) {
    return "Expanded automation coverage and stabilized release confidence during high-frequency product delivery.";
  }

  return "Delivered quality engineering improvements across integration-heavy systems and release workflows.";
}

function formatExperienceHighlight(value: string): string {
  const matches = Array.from(value.matchAll(DATA_POINT_PATTERN));
  if (matches.length === 0) {
    return escapeHtml(value);
  }

  let result = "";
  let cursor = 0;

  for (const match of matches) {
    const start = match.index ?? 0;
    const text = match[0];

    if (start < cursor) {
      continue;
    }

    result += escapeHtml(value.slice(cursor, start));
    result += `<strong>${escapeHtml(text.trim())}</strong>`;
    cursor = start + text.length;
  }

  result += escapeHtml(value.slice(cursor));
  return result;
}

const DATA_POINT_PATTERN =
  /(?:\([^()]*\d[^()]*\)|~?\d[\d,]*(?:\.\d+)?(?:\s*-\s*~?\d[\d,]*(?:\.\d+)?)?(?:\+|%|×|x)?(?:\s+to\s+~?\d[\d,]*(?:\.\d+)?(?:\+|%|×|x)?)?(?:\s+(?:enterprise applications|active integrations|UI\/mobile test cases|UI\/API scenarios|scenarios|engineering teams|test cases|lines|QAs))?)/g;

/**
 * Minimal escaping for the controlled HTML fragments emitted by the generator.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
