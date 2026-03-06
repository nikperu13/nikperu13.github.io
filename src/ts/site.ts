/**
 * Portfolio site interaction layer.
 *
 * This file centralizes all non-trivial client-side behavior for the landing
 * page so the HTML can stay declarative and the CSS can stay presentation-only.
 *
 * Current responsibilities:
 * - handle mobile navigation open/close state
 * - keep the sticky nav synced with the section currently in view
 * - render the header scroll progress indicator
 * - attach one-off motion accents (brand pulse, hero parallax, card spotlight)
 * - progressively reveal sections/cards as they enter the viewport
 * - animate impact metrics once they become visible
 *
 * Design constraints:
 * - no framework/runtime dependency
 * - graceful no-op behavior when a target element is missing
 * - reduced-motion users should not get pointer or scroll-driven motion
 * - reveal effects must never leave content hidden if observation fails
 */

type CounterConfig = {
  from: number;
  to: number;
  format: (v: number) => string;
};

(() => {
  // Respect OS-level reduced-motion preference before attaching visual effects.
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const navToggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.querySelector<HTMLElement>(".nav");
  const brand = document.querySelector<HTMLElement>(".brand");
  const progress = document.querySelector<HTMLElement>(".scroll-progress span");
  const header = document.querySelector<HTMLElement>(".site-header");
  const hero = document.querySelector<HTMLElement>(".hero");

  /**
   * Navigation behavior:
   * - toggles the mobile nav tray
   * - collapses the tray after selecting a link
   * - keeps `aria-expanded` aligned with the visible state
   */
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
   * Updates the active nav link based on a viewport marker rather than the
   * literal top edge of the window.
   *
   * Using a marker below the sticky header produces a better UX: the active
   * state follows the section a user is actually reading, not the section that
   * technically starts first in the document flow.
   *
   * The fallback branch handles edge cases near the bottom of the page or when
   * a section is too short to satisfy the main overlap condition.
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

  /**
   * Maps document scroll progress into the thin header progress rail.
   *
   * The rail is normalized against the full scrollable height so it stays
   * accurate regardless of screen size or content length.
   */
  function updateProgress(): void {
    if (!progress) return;
    const doc = document.documentElement;
    const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const ratio = Math.min(window.scrollY / scrollable, 1);
    progress.style.transform = "scaleX(" + ratio.toFixed(3) + ")";
  }

  let ticking = false;

  /**
   * Batches scroll-driven UI updates into a single animation frame.
   *
   * This avoids doing multiple layout-sensitive operations for every native
   * `scroll` event and keeps the nav/progress feedback smooth.
   */
  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      setActiveLink();
      updateProgress();
      ticking = false;
    });
  }

  setActiveLink();
  updateProgress();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (brand) {
    /**
     * Gives the brand pill a small pulse on click.
     *
     * This keeps the header from feeling static without introducing continuous
     * animation that would compete with the main content.
     */
    brand.addEventListener("click", () => {
      brand.classList.remove("is-bouncing");
      window.requestAnimationFrame(() => {
        brand.classList.add("is-bouncing");
      });
    });
  }

  /**
   * Splits section headings into per-word spans so CSS can reveal them with a
   * staggered delay.
   *
   * The dataset guard prevents duplicate span-wrapping if the script is re-run
   * during local development.
   */
  const sectionTitles =
    document.querySelectorAll<HTMLElement>(".section-head h2");
  sectionTitles.forEach((title) => {
    if (title.dataset.splitDone === "true") return;
    const words = title.textContent?.trim().split(/\s+/) ?? [];
    title.innerHTML = words
      .map(
        (word, idx) =>
          '<span class="title-word" style="--word-delay:' +
          idx * 58 +
          'ms">' +
          word +
          "</span>",
      )
      .join(" ");
    title.dataset.splitDone = "true";
  });

  const impactValues = document.querySelectorAll<HTMLElement>(".impact-value");

  /**
   * Converts the display text from an impact tile into an animation plan.
   *
   * Supported display formats intentionally match the copy style used on the
   * page today:
   * - `99%`
   * - `~80%`
   * - `6-7x`
   * - `7x`
   *
   * Returning `null` keeps the caller safe if a future metric uses a format
   * that should not be animated.
   */
  function parseCounterText(text: string): CounterConfig | null {
    const clean = text.replace(/\s+/g, "");
    let match = clean.match(/^~?(\d+)%$/);
    if (match) {
      return {
        from: 0,
        to: Number(match[1]),
        format: (v) => (clean.startsWith("~") ? "~" : "") + v + "%",
      };
    }

    match = clean.match(/^(\d+)-(\d+)x$/i);
    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      return {
        from: start,
        to: end,
        format: (v) => start + "-" + v + "x",
      };
    }

    match = clean.match(/^(\d+)x$/i);
    if (match) {
      return {
        from: 0,
        to: Number(match[1]),
        format: (v) => v + "x",
      };
    }
    return null;
  }

  /**
   * Animates a metric tile from its configured start value to its final value.
   *
   * The `data-counted` flag ensures each metric runs once. The easing curve is
   * intentionally front-loaded so the motion feels responsive rather than slow.
   */
  function animateCounter(el: HTMLElement, config: CounterConfig | null): void {
    if (!config || el.dataset.counted === "true") return;
    const counterConfig = config;
    el.dataset.counted = "true";
    const duration = 980;
    const start = performance.now();
    el.classList.add("counting");

    function tick(now: number): void {
      const progressRatio = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const value = Math.round(
        counterConfig.from + (counterConfig.to - counterConfig.from) * eased,
      );
      el.textContent = counterConfig.format(value);
      if (progressRatio < 1) {
        window.requestAnimationFrame(tick);
      } else {
        el.classList.remove("counting");
      }
    }

    window.requestAnimationFrame(tick);
  }

  /**
   * Project card spotlight:
   * tracks pointer position and feeds CSS custom properties used by the radial
   * highlight overlay. This is desktop polish only and is skipped for reduced
   * motion users.
   */
  const spotlightCards =
    document.querySelectorAll<HTMLElement>(".project-card");
  if (!prefersReducedMotion) {
    spotlightCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--spot-x", x.toFixed(2) + "%");
        card.style.setProperty("--spot-y", y.toFixed(2) + "%");
      });
      card.addEventListener("pointerenter", () => {
        card.classList.add("spotlight-on");
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("spotlight-on");
      });
    });

    /**
     * Hero parallax:
     * shifts the hero glow layers a small amount based on pointer position.
     * The movement stays intentionally shallow so the effect reads as depth,
     * not as a hero banner gimmick.
     */
    if (hero) {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty("--hero-shift-x", (nx * 18).toFixed(1) + "px");
        hero.style.setProperty("--hero-shift-y", (ny * 16).toFixed(1) + "px");
      });
      hero.addEventListener("pointerleave", () => {
        hero.style.setProperty("--hero-shift-x", "0px");
        hero.style.setProperty("--hero-shift-y", "0px");
      });
    }
  }

  /**
   * Shared reveal targets for "enter once" animation.
   *
   * These elements all use the same visibility lifecycle:
   * hidden in the pending state, revealed once when observed, then left alone.
   */
  const revealTargets = document.querySelectorAll<HTMLElement>(
    ".card, .panel, .project-card, .role-card, .contact-card, .section-head",
  );

  if ("IntersectionObserver" in window && revealTargets.length > 0) {
    /**
     * Reveal observer:
     * - removes pending state when a target becomes visible
     * - marks the target as revealed
     * - starts impact counters for visible metric tiles
     */
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          entry.target.classList.remove("reveal-pending");
          if (entry.target.classList.contains("impact-tile")) {
            const valueEl =
              entry.target.querySelector<HTMLElement>(".impact-value");
            if (valueEl) {
              animateCounter(
                valueEl,
                parseCounterText(valueEl.textContent ?? ""),
              );
            }
          }
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    revealTargets.forEach((el, idx) => {
      el.classList.add("reveal");
      el.classList.add("reveal-pending");
      el.style.setProperty("--reveal-delay", (idx % 6) * 50 + "ms");
      observer.observe(el);
    });

    impactValues.forEach((value) => {
      const tile = value.closest<HTMLElement>(".impact-tile");
      if (tile) {
        tile.classList.add("reveal");
        tile.classList.add("reveal-pending");
        observer.observe(tile);
      } else {
        animateCounter(value, parseCounterText(value.textContent ?? ""));
      }
    });

    /**
     * Fail-safe:
     * if an observer callback is missed because of fast scrolling or layout
     * timing, remove the pending state anyway so content is never stranded in a
     * hidden state. Any untouched impact counters are started here as well.
     */
    window.setTimeout(() => {
      revealTargets.forEach((el) => {
        if (el.classList.contains("reveal-pending")) {
          el.classList.remove("reveal-pending");
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
  }
})();
