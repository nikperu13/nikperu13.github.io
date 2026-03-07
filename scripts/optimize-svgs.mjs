import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { optimize } from "svgo";

const rootDir = resolve("assets");

async function walkSvgFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name === "icons") {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...(await walkSvgFiles(fullPath)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".svg")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const svgFiles = await walkSvgFiles(rootDir);

  for (const file of svgFiles) {
    const input = await readFile(file, "utf8");
    const result = optimize(input, {
      path: file,
      multipass: true,
      plugins: [
        "preset-default",
        {
          name: "removeViewBox",
          active: false,
        },
      ],
    });

    if ("data" in result && result.data !== input) {
      await writeFile(file, result.data, "utf8");
      console.log(`Optimized ${file}`);
    } else {
      const fileStat = await stat(file);
      console.log(`Skipped ${file} (${fileStat.size} bytes)`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
