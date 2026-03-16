import fs from "node:fs/promises";
import path from "node:path";

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const resumeDir = "resume";
const supportedResumeExtensions = new Set([".pdf", ".docx"]);

/**
 * Finds the current resume file present in the repository.
 *
 * - any single `.pdf` / `.docx` inside `resume/`
 * - if multiple files exist there, prefer canonical names first, then newest
 */
export async function resolveResumePath(repoRoot: string): Promise<string> {
  const resumeDirectoryPath = path.join(repoRoot, resumeDir);
  const resumeDirectoryCandidate = await resolveResumeFromDirectory(resumeDirectoryPath);
  if (resumeDirectoryCandidate) {
    return resumeDirectoryCandidate;
  }

  throw new Error(
    `No resume file found. Checked "${resumeDir}/" for any .pdf or .docx file.`,
  );
}

async function resolveResumeFromDirectory(resumeDirectoryPath: string): Promise<string | null> {
  let entries: string[];

  try {
    entries = await fs.readdir(resumeDirectoryPath);
  } catch {
    return null;
  }

  const resumeFiles = await Promise.all(
    entries
      .filter((entry) => supportedResumeExtensions.has(path.extname(entry).toLowerCase()))
      .map(async (entry) => {
        const fullPath = path.join(resumeDirectoryPath, entry);
        const stats = await fs.stat(fullPath);
        return stats.isFile()
          ? {
              name: entry,
              path: fullPath,
              modifiedAt: stats.mtimeMs,
            }
          : null;
      }),
  );

  const validFiles = resumeFiles.filter(
    (entry): entry is NonNullable<typeof entry> => entry !== null,
  );

  if (validFiles.length === 0) {
    return null;
  }

  const canonical = validFiles.find((entry) => /^resume\.(pdf|docx)$/i.test(entry.name));
  if (canonical) {
    return canonical.path;
  }

  validFiles.sort((left, right) => right.modifiedAt - left.modifiedAt);
  return validFiles[0].path;
}

/**
 * Extracts plain text from the resume file using the appropriate local parser.
 *
 * - DOCX -> `mammoth`
 * - PDF -> `pdf-parse`
 */
export async function readResumeText(resumePath: string): Promise<string> {
  const extension = path.extname(resumePath).toLowerCase();

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ path: resumePath });
    return result.value;
  }

  if (extension === ".pdf") {
    const buffer = await fs.readFile(resumePath);
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error(`Unsupported resume format: ${extension}`);
}
