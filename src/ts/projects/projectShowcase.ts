import {
  applyProjectShowcaseMotion,
  applyVisualSelection,
  bindActiveHover,
  commitContentSelection,
} from "./projectShowcaseAnimations";

type ProjectShowcaseOptions = {
  prefersReducedMotion: boolean;
};

export function initProjectShowcase(
  root: HTMLElement,
  { prefersReducedMotion }: ProjectShowcaseOptions,
): void {
  const compactView = window.matchMedia(
    "(max-width: 1280px), (max-height: 900px)",
  ).matches;
  const slideNodes = Array.from(
    root.querySelectorAll<HTMLElement>("[data-project-slide]"),
  );
  const detailNodes = Array.from(
    root.parentElement?.querySelectorAll<HTMLElement>("[data-project-detail]") ?? [],
  );

  if (slideNodes.length === 0) return;

  let selectedIndex = slideNodes.findIndex((slide) =>
    slide.classList.contains("is-selected")
  );

  if (selectedIndex < 0) {
    selectedIndex = 0;
  }

  let stageNavigationUnlockedAt = performance.now();

  const commitState = (index: number) => {
    applyVisualSelection(slideNodes, index);
    commitContentSelection(detailNodes, index, { prefersReducedMotion });
    applyProjectShowcaseMotion(slideNodes, index);
    selectedIndex = index;
    stageNavigationUnlockedAt = performance.now();
  };

  const selectProject = (index: number) => {
    if (index === selectedIndex) return;
    commitState(index);
  };

  bindActiveHover(slideNodes, { prefersReducedMotion });
  commitState(selectedIndex);

  if (compactView) {
    return;
  }

  slideNodes.forEach((slide, index) => {
    const stageLink = slide.querySelector<HTMLAnchorElement>(".project-shot-stage");

    slide.addEventListener("click", () => {
      selectProject(index);
    });

    slide.addEventListener("focusin", () => {
      selectProject(index);
    });

    stageLink?.addEventListener("click", (event) => {
      const justSelected = performance.now() - stageNavigationUnlockedAt < 380;
      if (!slide.classList.contains("is-selected") || justSelected || index !== selectedIndex) {
        event.preventDefault();
        event.stopPropagation();
        selectProject(index);
      }
    });
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectProject(Math.max(0, selectedIndex - 1));
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectProject(Math.min(slideNodes.length - 1, selectedIndex + 1));
    }
    if (event.key === "Home") {
      event.preventDefault();
      selectProject(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      selectProject(slideNodes.length - 1);
    }
  });
}
