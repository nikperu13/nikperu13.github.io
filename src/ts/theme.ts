const STORAGE_KEY = "portfolio-theme";
const THEMES = ["dark", "light"] as const;

type ThemeName = (typeof THEMES)[number];

const THEME_LABELS: Record<ThemeName, string> = {
  dark: "Dark",
  light: "Light",
};

type ThemeToggleOptions = {
  onChange?: (theme: ThemeName) => void;
};

function isTheme(value: string | null | undefined): value is ThemeName {
  return !!value && THEMES.includes(value as ThemeName);
}

function normalizeTheme(value: string | null | undefined): ThemeName | null {
  if (!value) return null;
  if (value === "forest") return "dark";
  if (isTheme(value)) return value;
  return null;
}

function getStoredTheme(): ThemeName | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return normalizeTheme(value);
  } catch {
    return null;
  }
}

function persistTheme(theme: ThemeName): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures; the body dataset remains the source of truth.
  }
}

function applyTheme(theme: ThemeName): void {
  document.body.dataset.theme = theme;
}

function getCurrentTheme(): ThemeName {
  const bodyTheme = document.body.dataset.theme;
  return normalizeTheme(bodyTheme) ?? "dark";
}

function updateButtons(theme: ThemeName): void {
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.dataset.themeValue = theme;
    button.innerHTML = `<span>Theme</span><strong>${THEME_LABELS[theme]}</strong>`;
    button.setAttribute("aria-label", `Switch color theme. Current theme: ${THEME_LABELS[theme]}`);
  });
}

export function initThemeToggle(options: ThemeToggleOptions = {}): ThemeName {
  const initialTheme = getStoredTheme() ?? getCurrentTheme();
  applyTheme(initialTheme);
  updateButtons(initialTheme);

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    if (button.dataset.themeBound === "true") return;
    button.dataset.themeBound = "true";

    button.addEventListener("click", () => {
      const currentTheme = getCurrentTheme();
      const currentIndex = THEMES.indexOf(currentTheme);
      const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];

      applyTheme(nextTheme);
      persistTheme(nextTheme);
      updateButtons(nextTheme);
      options.onChange?.(nextTheme);
    });
  });

  return initialTheme;
}
