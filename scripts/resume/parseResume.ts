import type {
  ResumeExperience,
  ResumeProject,
  ResumeSkillGroup,
} from "./types";

type ParsedResumeData = Omit<import("./types").ResumeData, "portfolio" | "ai">;

/**
 * Maps common resume heading variants onto the sections the site understands.
 *
 * This keeps the parser resilient to normal resume editing without pretending
 * to be a general-purpose document understanding system.
 */
const sectionAliases: Record<string, string[]> = {
  summary: ["PROFESSIONAL SUMMARY", "SUMMARY", "PROFILE"],
  experience: ["PROFESSIONAL EXPERIENCE", "EXPERIENCE", "WORK EXPERIENCE"],
  skills: ["TECHNICAL SKILLS", "SKILLS", "CORE COMPETENCIES"],
  projects: ["PROJECTS", "SELECTED PROJECTS"],
  education: ["EDUCATION"],
};

/**
 * Converts raw resume text into structured data that later build stages can
 * use for deterministic rendering and optional AI enrichment.
 */
export function parseResume(rawText: string, sourceFile: string): ParsedResumeData {
  const lines = normalizeLines(rawText);
  const name = lines[0] ?? "";
  const title = lines[1] ?? "";
  const location = findLocation(lines);

  const summaryLines = getSection(lines, sectionAliases.summary, [
    ...sectionAliases.experience,
    ...sectionAliases.skills,
    ...sectionAliases.projects,
    ...sectionAliases.education,
  ]);
  const experienceLines = getSection(lines, sectionAliases.experience, [
    ...sectionAliases.skills,
    ...sectionAliases.projects,
    ...sectionAliases.education,
  ]);
  const skillLines = getSection(lines, sectionAliases.skills, [
    ...sectionAliases.projects,
    ...sectionAliases.education,
  ]);
  const projectLines = getSection(lines, sectionAliases.projects, sectionAliases.education);

  const skills = parseSkillGroups(skillLines);
  const technologies = unique(
    skills.flatMap((group) => group.items).filter((item) => !item.includes("&")),
  );
  const experience = parseExperience(experienceLines);
  const resumeProjects = parseProjects(projectLines, technologies);
  const projects = resumeProjects.length > 0 ? resumeProjects : inferProjects(experience, technologies);

  return {
    name,
    title,
    location,
    summary: summaryLines.join(" "),
    skills,
    technologies,
    experience,
    projects,
    sourceFile,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Normalizes the text stream so downstream heuristics operate on stable line
 * boundaries regardless of PDF/DOCX extraction quirks.
 */
function normalizeLines(rawText: string): string[] {
  return rawText
    .replace(/\r/g, "\n")
    .replace(/[\u2022\u25CF\u25AA]/g, "•")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\t+/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function findLocation(lines: string[]): string {
  for (const line of lines.slice(0, 6)) {
    if (/,\s*[A-Z]{2}$/.test(line)) {
      return line;
    }
  }

  return "";
}

/**
 * Returns the lines belonging to a section by scanning between known headings.
 */
function getSection(lines: string[], startHeadings: string[], endHeadings: string[]): string[] {
  const startIndex = lines.findIndex((line) => startHeadings.includes(line.toUpperCase()));
  if (startIndex === -1) {
    return [];
  }

  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && endHeadings.includes(line.toUpperCase()),
  );

  return lines.slice(startIndex + 1, endIndex === -1 ? lines.length : endIndex);
}

/**
 * Parses `Category: item, item, item` skill rows into structured groups.
 */
function parseSkillGroups(lines: string[]): ResumeSkillGroup[] {
  return lines
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return null;
      }

      const category = line.slice(0, separatorIndex).trim();
      const items = line
        .slice(separatorIndex + 1)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!category || items.length === 0) {
        return null;
      }

      return { category, items };
    })
    .filter((group): group is ResumeSkillGroup => group !== null);
}

/**
 * Interprets the experience section as alternating company / role / narrative
 * lines. This is heuristic, but it is easy to adjust as the resume evolves.
 */
function parseExperience(lines: string[]): ResumeExperience[] {
  const entries: ResumeExperience[] = [];
  let currentCompany = "";
  let currentRole: ResumeExperience | null = null;

  for (const line of lines) {
    if (isRoleLine(line)) {
      if (currentRole) {
        entries.push(currentRole);
      }

      const [role, dateRange] = line.split("|").map((part) => part.trim());
      currentRole = {
        company: currentCompany,
        role,
        dateRange,
        highlights: [],
      };
      continue;
    }

    if (looksLikeNarrative(line)) {
      currentRole?.highlights.push(cleanBullet(line));
      continue;
    }

    currentCompany = line;
  }

  if (currentRole) {
    entries.push(currentRole);
  }

  return entries;
}

function isRoleLine(line: string): boolean {
  return line.includes("|") && /\b(?:19|20)\d{2}\b|present|current/i.test(line);
}

/**
 * Narrative lines are treated as bullets even when extraction strips the
 * original bullet glyphs from the source document.
 */
function looksLikeNarrative(line: string): boolean {
  return line.startsWith("•") || /[.!?]$/.test(line) || line.split(" ").length >= 8;
}

/**
 * Parses an explicit projects section when the resume has one. If not, the
 * build falls back to inferring portfolio initiatives from experience.
 */
function parseProjects(lines: string[], technologies: string[]): ResumeProject[] {
  const projects: ResumeProject[] = [];
  let currentProject: ResumeProject | null = null;

  for (const line of lines) {
    if (looksLikeProjectHeading(line)) {
      if (currentProject) {
        projects.push(currentProject);
      }

      currentProject = {
        title: line,
        summary: "",
        technologies: pickTechnologiesFromText(line, technologies),
        source: "resume",
      };
      continue;
    }

    if (!currentProject) {
      continue;
    }

    const summary = cleanBullet(line);
    currentProject.summary = currentProject.summary
      ? `${currentProject.summary} ${summary}`
      : summary;

    const derivedTechnologies = pickTechnologiesFromText(summary, technologies);
    currentProject.technologies = unique([
      ...currentProject.technologies,
      ...derivedTechnologies,
    ]);
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects.filter((project) => project.summary || project.technologies.length > 0);
}

function looksLikeProjectHeading(line: string): boolean {
  return !looksLikeNarrative(line) && !isRoleLine(line) && line.split(" ").length <= 7;
}

/**
 * Generates portfolio-friendly project entries from experience highlights when
 * the resume does not provide a dedicated projects section.
 */
function inferProjects(
  experience: ResumeExperience[],
  technologies: string[],
): ResumeProject[] {
  const allHighlights = experience.flatMap((entry) => entry.highlights);
  const inferred = [
    {
      title: "Parallel Automation Platform",
      match: /parallel|automation framework|driver isolation/i,
      summary:
        "Layered UI and API automation platform designed for deterministic parallel execution across integrated enterprise applications.",
      technologies: pickTechnologies(technologies, [
        "Java",
        "Selenium",
        "Rest Assured",
        "GitLab",
      ]),
    },
    {
      title: "API-Driven Test Data Pipeline",
      match: /dynamic test data|api-driven|orchestration/i,
      summary:
        "Runtime data creation and workflow orchestration to reduce flakiness and keep regression runs isolated across environments.",
      technologies: pickTechnologies(technologies, [
        "Rest Assured",
        "Postman",
        "JavaScript",
        "TypeScript",
      ]),
    },
    {
      title: "Mobile Automation and CI Enablement",
      match: /mobile automation|gitlab regression pipelines|ci infrastructure/i,
      summary:
        "Mobile automation architecture and scheduled regression execution aligned with existing CI/CD delivery flow.",
      technologies: pickTechnologies(technologies, [
        "Appium",
        "GitLab",
        "Docker",
      ]),
    },
  ];

  return inferred
    .filter((project) => allHighlights.some((highlight) => project.match.test(highlight)))
    .map((project) => ({
      title: project.title,
      summary: project.summary,
      technologies: project.technologies,
      source: "inferred" as const,
    }));
}

/**
 * Prefers technologies already visible in the parsed skills section so derived
 * content stays grounded in declared tooling rather than inferred buzzwords.
 */
function pickTechnologies(technologies: string[], preferred: string[]): string[] {
  const selected = preferred.filter((item) => technologies.includes(item));
  return selected.length > 0 ? selected : technologies.slice(0, 4);
}

function pickTechnologiesFromText(text: string, technologies: string[]): string[] {
  const lowerText = text.toLowerCase();
  return technologies.filter((technology) => lowerText.includes(technology.toLowerCase()));
}

function cleanBullet(line: string): string {
  return line.replace(/^•\s*/, "").trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
