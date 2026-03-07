import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  BadgeCheck,
  Github,
  Linkedin,
  Mail,
  Phone,
} from "lucide";

const spritePath = resolve("assets/icons/lucide-sprite.svg");

const icons = [
  { id: "badge-check", icon: BadgeCheck },
  { id: "github", icon: Github },
  { id: "linkedin", icon: Linkedin },
  { id: "mail", icon: Mail },
  { id: "phone", icon: Phone },
];

function iconNodeToSymbol(id, icon) {
  const nodes = icon
    .map(([tag, attrs]) => {
      const attrString = Object.entries(attrs)
        .map(([key, value]) => `${key}="${String(value)}"`)
        .join(" ");
      return `<${tag} ${attrString}></${tag}>`;
    })
    .join("");

  return `<symbol id="${id}" viewBox="0 0 24 24">${nodes}</symbol>`;
}

async function main() {
  await mkdir(dirname(spritePath), { recursive: true });

  const sprite = [
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
    ...icons.map(({ id, icon }) => iconNodeToSymbol(id, icon)),
    "</svg>",
    "",
  ].join("\n");

  await writeFile(spritePath, sprite, "utf8");
  console.log(`Wrote ${spritePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
