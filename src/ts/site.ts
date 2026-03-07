import { animate as animeAnimate, splitText, stagger } from "animejs";
import gsap from "gsap";
import { inView, scroll } from "motion";

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
type CounterConfig = {
  from: number;
  to: number;
  format: (value: number) => string;
};

(() => {
  // Reduced-motion users should still get functional UI without pointer/scroll
  // driven animation flourishes.
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const navToggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.querySelector<HTMLElement>(".nav");
  const brand = document.querySelector<HTMLElement>(".brand");
  const progress = document.querySelector<HTMLElement>(".scroll-progress span");
  const header = document.querySelector<HTMLElement>(".site-header");
  const hero = document.querySelector<HTMLElement>(".hero");

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

  const sectionLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".nav a[data-section]"),
  );
  const sections = sectionLinks
    .map((link) => {
      const id = link.getAttribute("data-section");
      return id ? document.getElementById(id) : null;
    })
    .filter(
      (section): section is HTMLElement => section instanceof HTMLElement,
    );

  /**
   * Marks the nav item for the section currently closest to the user's reading
   * position rather than relying on the very top edge of the viewport.
   */
  function setActiveLink(): void {
    const headerHeight = header ? header.offsetHeight : 0;
    const marker = Math.max(
      headerHeight + 24,
      Math.round(window.innerHeight * 0.36),
    );
    let activeId = "";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) {
        activeId = section.id;
      }
    });

    if (!activeId && sections.length > 0) {
      activeId = sections[sections.length - 1].id;
      for (let i = 0; i < sections.length; i += 1) {
        if (sections[i].getBoundingClientRect().top > marker) {
          activeId = i === 0 ? sections[0].id : sections[i - 1].id;
          break;
        }
      }
    }

    sectionLinks.forEach((link) => {
      const isActive = link.getAttribute("data-section") === activeId;
      link.classList.toggle("active", isActive);
    });
  }

  let ticking = false;

  /**
   * Scroll events can fire very frequently. Batch the nav recalculation into a
   * single animation frame so the DOM work stays predictable.
   */
  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      setActiveLink();
      ticking = false;
    });
  }

  setActiveLink();
  window.addEventListener("scroll", onScroll, { passive: true });

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

  const titleSplitters = new WeakMap<HTMLElement, HTMLElement[]>();
  const sectionTitles =
    document.querySelectorAll<HTMLElement>(".section-head h2");

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

  const impactValues = document.querySelectorAll<HTMLElement>(".impact-value");

  /**
   * Supported metric formats are intentionally narrow because the page uses a
   * small set of copy patterns today.
   *
   * Examples:
   * - `99%`
   * - `~80%`
   * - `6-7x`
   * - `7x`
   */
  function parseCounterText(text: string): CounterConfig | null {
    const clean = text.replace(/\s+/g, "");
    let match = clean.match(/^~?(\d+)%$/);
    if (match) {
      return {
        from: 0,
        to: Number(match[1]),
        format: (value) => (clean.startsWith("~") ? "~" : "") + value + "%",
      };
    }

    match = clean.match(/^(\d+)-(\d+)x$/i);
    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      return {
        from: start,
        to: end,
        format: (value) => start + "-" + value + "x",
      };
    }

    match = clean.match(/^(\d+)x$/i);
    if (match) {
      return {
        from: 0,
        to: Number(match[1]),
        format: (value) => value + "x",
      };
    }

    return null;
  }

  function animateCounter(el: HTMLElement, config: CounterConfig | null): void {
    if (!config || el.dataset.counted === "true") return;

    // Tween a plain object, then project the rounded value back into the DOM.
    const state = { value: config.from };
    el.dataset.counted = "true";
    el.classList.add("counting");

    gsap.to(state, {
      value: config.to,
      duration: 0.98,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => {
        el.textContent = config.format(Math.round(state.value));
      },
      onComplete: () => {
        el.textContent = config.format(config.to);
        el.classList.remove("counting");
      },
    });
  }

  const spotlightCards =
    document.querySelectorAll<HTMLElement>(".project-card");

  if (!prefersReducedMotion) {
    // Project cards expose CSS custom properties used by the spotlight overlay.
    spotlightCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        gsap.to(card, {
          "--spot-x": x.toFixed(2) + "%",
          "--spot-y": y.toFixed(2) + "%",
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
      card.addEventListener("pointerenter", () => {
        card.classList.add("spotlight-on");
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("spotlight-on");
      });
    });

    if (hero) {
      // The hero glow layers read these custom properties from CSS.
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(hero, {
          "--hero-shift-x": (nx * 18).toFixed(1) + "px",
          "--hero-shift-y": (ny * 16).toFixed(1) + "px",
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
      hero.addEventListener("pointerleave", () => {
        gsap.to(hero, {
          "--hero-shift-x": "0px",
          "--hero-shift-y": "0px",
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    }
  }

  const revealTargets = document.querySelectorAll<HTMLElement>(
    ".card, .panel, .project-card, .role-card, .contact-card, .section-head",
  );

  /**
   * Shared "reveal once" behavior:
   * - initial hidden state comes from CSS via `.reveal-pending`
   * - `motion.inView()` removes the pending state once visible
   * - section headers additionally trigger word-stagger animation
   */
  revealTargets.forEach((el, idx) => {
    el.classList.add("reveal");
    el.classList.add("reveal-pending");
    el.style.setProperty("--reveal-delay", (idx % 6) * 50 + "ms");

    inView(
      el,
      (element) => {
        const target = element as HTMLElement;
        target.classList.add("in");
        target.classList.remove("reveal-pending");
        if (target.classList.contains("section-head")) {
          animateSectionTitle(target);
        }
      },
      { amount: 0.15, margin: "0px 0px -8% 0px" },
    );
  });

  impactValues.forEach((value) => {
    const tile = value.closest<HTMLElement>(".impact-tile");
    if (!tile) {
      animateCounter(value, parseCounterText(value.textContent ?? ""));
      return;
    }

    tile.classList.add("reveal");
    tile.classList.add("reveal-pending");

    inView(
      tile,
      (element) => {
        const target = element as HTMLElement;
        target.classList.add("in");
        target.classList.remove("reveal-pending");
        animateCounter(value, parseCounterText(value.textContent ?? ""));
      },
      { amount: 0.2, margin: "0px 0px -8% 0px" },
    );
  });

  window.setTimeout(() => {
    // Fail-safe: never leave content hidden if an observer callback is missed.
    revealTargets.forEach((el) => {
      if (el.classList.contains("reveal-pending")) {
        el.classList.remove("reveal-pending");
        if (el.classList.contains("section-head")) {
          animateSectionTitle(el);
        }
      }
    });

    impactValues.forEach((value) => {
      const tile = value.closest<HTMLElement>(".impact-tile");
      if (tile && tile.classList.contains("reveal-pending")) {
        tile.classList.remove("reveal-pending");
        animateCounter(value, parseCounterText(value.textContent ?? ""));
      }
    });
  }, 1400);
})();
