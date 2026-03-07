import { mkdir, readdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import sharp from "sharp";

const sourceDir = resolve("assets/img/work");
const outputDir = resolve("assets/img/generated/work");

async function main() {
  await mkdir(outputDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const inputPath = join(sourceDir, entry.name);
    const ext = extname(entry.name).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) continue;

    const base = basename(entry.name, ext);
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const outputPath = join(outputDir, `${base}.webp`);

    await image
      .rotate()
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath);

    console.log(
      `Generated ${relative(process.cwd(), outputPath)} (${metadata.width}x${metadata.height})`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
