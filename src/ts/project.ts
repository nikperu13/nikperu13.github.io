import gsap from "gsap";
import { initBackground } from "./background/background";
import { initThemeToggle } from "./theme";

(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const supportsCursorGlow =
    !prefersReducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const appBackground =
    document.querySelector<HTMLElement>("[data-app-background]");

  let backgroundController: { destroy: () => void } | null = null;
  const mountBackground = async () => {
    backgroundController?.destroy();
    backgroundController = await initBackground(appBackground, prefersReducedMotion);
  };

  initThemeToggle({
    onChange: () => {
      void mountBackground();
    },
  });

  void mountBackground();

  if (supportsCursorGlow) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    const moveGlowX = gsap.quickTo(glow, "x", {
      duration: 0.6,
      ease: "power3.out",
    });
    const moveGlowY = gsap.quickTo(glow, "y", {
      duration: 0.6,
      ease: "power3.out",
    });

    window.addEventListener("pointermove", (event) => {
      glow.classList.add("is-visible");
      moveGlowX(event.clientX);
      moveGlowY(event.clientY);
    });

    window.addEventListener("pointerleave", () => {
      glow.classList.remove("is-visible");
    });
  }

  const revealTargets = document.querySelectorAll<HTMLElement>(
    ".hero, .grid, .decisions, .links",
  );

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          target.classList.add("in");
          observer.unobserve(target);
        }
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.classList.add("reveal-init");
    target.style.setProperty("--reveal-delay", `${index * 70}ms`);
    observer.observe(target);
  });
})();
