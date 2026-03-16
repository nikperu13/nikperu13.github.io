import { animate as animeAnimate, splitText, stagger } from "animejs";
import gsap from "gsap";
import { inView, scroll } from "motion";
import { initBackground } from "./background/background";
import { initProjectShowcase } from "./projects/projectShowcase";
import { initThemeToggle } from "./theme";

/**
 * Main client-side behavior for the portfolio landing page.
 *
 * This file intentionally keeps the site in "plain web app" territory:
 * - HTML owns structure/content
 * - CSS owns default visual states
 * - this script wires interaction and motion on top
 *
 * Library ownership:
 * - `motion`: viewport observation and scroll progress
 * - `gsap`: value tweening and pointer-driven polish
 * - `animejs`: text splitting and staggered heading reveals
 *
 * The goal is to keep interactions declarative from the markup side while
 * avoiding framework overhead for a mostly static site.
 */
(() => {
  // Reduced-motion users should still get functional UI without pointer/scroll
  // driven animation flourishes.
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const supportsCursorGlow =
    !prefersReducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const navToggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.querySelector<HTMLElement>(".nav");
  const brand = document.querySelector<HTMLElement>(".brand");
  const appBackground =
    document.querySelector<HTMLElement>("[data-app-background]");
  const progress = document.querySelector<HTMLElement>(".scroll-progress span");
  const header = document.querySelector<HTMLElement>(".site-header");
  const projectShowcase =
    document.querySelector<HTMLElement>("[data-project-showcase]");
  const projectSlides = document.querySelectorAll<HTMLElement>(
    "[data-project-slide]",
  );
  const hero = document.querySelector<HTMLElement>(".hero");

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

  if (projectShowcase && projectSlides.length > 0) {
    void initProjectShowcase(projectShowcase, { prefersReducedMotion });
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (progress) {
    // `motion.scroll()` gives a normalized 0..1 value for the full page.
    scroll((value: number) => {
      progress.style.transform = "scaleX(" + value.toFixed(3) + ")";
    });
  }

  if (brand && !prefersReducedMotion) {
    // Small click accent for the header brand. GSAP handles repeated clicks
    // more cleanly than a CSS class toggle because we can cancel/restart.
    brand.addEventListener("click", () => {
      gsap.killTweensOf(brand);
      gsap.fromTo(
        brand,
        { scale: 1 },
        {
          scale: 1.08,
          duration: 0.24,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          overwrite: true,
          clearProps: "transform",
        },
      );
    });
  }

  if (hero && !prefersReducedMotion) {
    const heroTargets = hero.querySelectorAll<HTMLElement>(
      ".hero-orb, .hero-identity-copy, .hero-signal-grid, .hero-stat, .hero-intro, h1, .hero-role, .hero-snippet, .hero-actions, .hero-scroll",
    );

    gsap.set(heroTargets, {
      opacity: 0,
      y: 26,
      willChange: "transform,opacity",
    });

    gsap.set(hero.querySelector(".hero-orb"), {
      scale: 0.94,
      y: 18,
    });

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(hero.querySelector(".hero-orb"), {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
      })
      .to(
        hero.querySelectorAll<HTMLElement>(".hero-identity-copy, .hero-signal-grid, .hero-stat"),
        {
          opacity: 1,
          y: 0,
          duration: 0.62,
          stagger: 0.08,
        },
        "-=0.42",
      )
      .to(
        hero.querySelectorAll<HTMLElement>(".hero-intro, h1, .hero-role, .hero-snippet, .hero-actions, .hero-scroll"),
        {
          opacity: 1,
          y: 0,
          duration: 0.66,
          stagger: 0.08,
        },
        "-=0.48",
      );
  }

  const titleSplitters = new WeakMap<HTMLElement, HTMLElement[]>();
  const sectionTitles =
    document.querySelectorAll<HTMLElement>(".section-head h2");
  const compactView = window.matchMedia("(max-width: 860px)").matches;
  const shortViewport = window.matchMedia("(max-height: 900px)").matches;

  /**
   * Convert section titles into addressable word nodes once so reveal
   * animations can be targeted without rebuilding the DOM repeatedly.
   */
  sectionTitles.forEach((title) => {
    if (title.dataset.splitDone === "true") return;
    const splitter = splitText(title, {
      words: { class: "title-word" },
      chars: false,
      lines: false,
    });
    titleSplitters.set(title, splitter.words as HTMLElement[]);
    title.dataset.splitDone = "true";
  });

  function animateSectionTitle(sectionHead: HTMLElement): void {
    if (sectionHead.dataset.titleAnimated === "true") return;
    const title = sectionHead.querySelector<HTMLElement>("h2");
    const words = title ? titleSplitters.get(title) : null;
    if (!title || !words || words.length === 0) return;

    sectionHead.dataset.titleAnimated = "true";

    if (prefersReducedMotion) {
      words.forEach((word) => {
        word.style.opacity = "1";
        word.style.transform = "none";
      });
      return;
    }

    animeAnimate(words, {
      translateY: [10, 0],
      opacity: [0, 1],
      delay: stagger(58),
      duration: 420,
      ease: "outQuad",
    });
  }

  const revealTargets = document.querySelectorAll<HTMLElement>(
    ".card, .panel, .project-roulette, .role-card, .section-head:not(.project-head)",
  );

  /**
   * Shared viewport reveal behavior:
   * - initial hidden state is applied only when JS is running
   * - `motion.inView()` toggles `.in` on enter/leave for a softer flow effect
   * - section headers still animate their title words once on first entry
   */
  revealTargets.forEach((el, idx) => {
    el.classList.add("reveal");
    el.classList.add("reveal-init");
    const isProjectBlock = el.classList.contains("project-roulette");
    el.style.setProperty("--reveal-delay", isProjectBlock ? "0ms" : (idx % 6) * 70 + "ms");

    inView(
      el,
      (element) => {
        const target = element as HTMLElement;
        target.classList.add("in");
        if (target.classList.contains("section-head")) {
          animateSectionTitle(target);
        }
        if (target.classList.contains("project-roulette")) {
          const projectHead = target.querySelector<HTMLElement>(".project-head");
          if (projectHead) {
            animateSectionTitle(projectHead);
          }
        }

        if (target.classList.contains("project-roulette")) {
          return;
        }

        if (prefersReducedMotion) return;

        return () => {
          target.classList.remove("in");
        };
      },
      isProjectBlock
        ? {
            amount: compactView || shortViewport ? 0.1 : 0.24,
            margin:
              compactView || shortViewport
                ? "0px 0px -2% 0px"
                : "0px 0px -8% 0px",
          }
        : {
            amount: compactView ? 0.12 : 0.22,
            margin: compactView ? "0px 0px -4% 0px" : "0px 0px -10% 0px",
          },
    );
  });

})();
