/// <reference types="jquery" />

/** Returns a numeric document scrollTop value for strict TypeScript checks. */
function topbarGetDocumentScrollTop(): number {
  return $(document).scrollTop() ?? 0;
}

/** Returns a numeric window width for strict TypeScript checks. */
function getWindowWidth(): number {
  return $(window).width() ?? 0;
}

/** Returns a numeric window height for strict TypeScript checks. */
function getWindowHeight(): number {
  return $(window).height() ?? 0;
}

/**
 * Initializes filtering behavior for portfolio/work grid items.
 */
function initGridFiltering(): void {
  const $grid = $(".gridder").isotope({
    itemSelector: ".grid-item",
    percentPosition: true,
  });

  $(".filterable-button").on("click", "button", function handleFilterClick() {
    const filterValue = $(this).attr("data-filter") ?? "*";
    $grid.isotope({ filter: filterValue });
  });
}

/**
 * Initializes carousel behavior for testimonial sections.
 */
function initCarousel(): void {
  $(".testi-carousel").owlCarousel({
    margin: 0,
    loop: true,
    autoplay: true,
    autoplayTimeout: 4000,
    items: 1,
  });
}

/**
 * Enables third-party UI enhancements used by the template.
 */
function initUiEnhancements(): void {
  $(".vg-select").niceSelect();
  $('[data-toggle="tooltip"]').tooltip();
  new WOW().init();
}

/**
 * Handles visibility and click behavior of the "back to top" button.
 */
function initBackToTop(): void {
  const $backTop = $(".btn-back_to_top");

  $(window).on("scroll", () => {
    if (topbarGetDocumentScrollTop() > 400) {
      $backTop.css("visibility", "visible");
      return;
    }

    $backTop.css("visibility", "hidden");
  });

  $backTop.on("click", () => {
    $("html").animate({ scrollTop: 0 }, 1000);
    return false;
  });
}

/**
 * Registers a reusable jQuery plugin that toggles an active/selected class
 * across sibling elements.
 */
function topbarRegisterToggleSelectedPlugin(): void {
  $.fn.toggleSelected = function toggleSelected(options?: ToggleSelectedOptions): JQuery {
    const defaults: Required<ToggleSelectedOptions> = {
      classes: "selected",
      itemSelector: this.children() as JQuery<HTMLElement>,
    };

    const config = { ...defaults, ...(options ?? {}) };

    return this.each(function applyToggleSelected() {
      const $items = config.itemSelector;

      $items.on("click", function onItemClick() {
        const $self = $(this);
        $self.addClass(config.classes);
        $self.siblings().removeClass(config.classes);
      });
    });
  };
}

/**
 * Sticky navigation controller used by the topbar layout.
 */
const stickyController = {
  $sticky: $(".sticky"),
  offsets: [] as number[],
  targets: [] as string[],
  stickyTop: 0,

  /**
   * Rebuilds cached section offsets so active menu highlighting stays accurate.
   */
  set(): void {
    const windowTop = Math.floor(topbarGetDocumentScrollTop());
    this.offsets = [];
    this.targets = [];

    const offsetData = this.$sticky.data("offset");
    const measuredTop = this.$sticky.css("position", "absolute").offset()?.top ?? 0;
    this.stickyTop = typeof offsetData === "number" ? offsetData : measuredTop;

    const entries: Array<[number, string]> = [];

    this.$sticky.find(".navbar-nav .nav-link").each(function collectAnchorOffsets() {
      const $el = $(this);
      const href = ($el.data("target") as string | undefined) ?? $el.attr("href") ?? "";

      if (!/^#./.test(href)) {
        return;
      }

      const $target = $(href);
      if (!$target.length || !$target.is(":visible")) {
        return;
      }

      const top = $target[0].getBoundingClientRect().top + windowTop;
      entries.push([top, href]);
    });

    entries.sort((a, b) => a[0] - b[0]);
    entries.forEach((entry) => {
      this.offsets.push(entry[0]);
      this.targets.push(entry[1]);
    });
  },

  /**
   * Updates sticky position and active nav state according to scroll position.
   */
  update(): void {
    const windowTop = Math.floor(topbarGetDocumentScrollTop());
    const $stickyLinks = this.$sticky.find(".navbar-nav .nav-item").removeClass("active");

    let stickyPosition: "fixed" | "absolute" = "fixed";
    let currentIndex = 0;

    if (getWindowWidth() < 800 || getWindowHeight() < 500 || this.stickyTop > windowTop) {
      stickyPosition = "absolute";
      this.$sticky.removeClass("floating");
    } else {
      for (let i = this.offsets.length - 1; i >= 0; i -= 1) {
        const currentOffset = this.offsets[i] ?? 0;
        const nextOffset = this.offsets[i + 1];

        if (windowTop >= currentOffset - 2 && (nextOffset === undefined || windowTop <= nextOffset + 2)) {
          currentIndex = i;
          break;
        }
      }
    }

    this.$sticky.css({ position: stickyPosition });

    if (stickyPosition === "absolute") {
      this.$sticky.removeClass("floating");
    } else {
      this.$sticky.addClass("floating");
    }

    $stickyLinks.eq(currentIndex).addClass("active");
  },

  /**
   * Binds resize/scroll listeners and performs initial calculation.
   */
  init(): void {
    $(window).on("resize", () => {
      this.set();
      this.update();
    });

    $(window).on("scroll", () => {
      this.update();
    });

    $(window).trigger("resize");
  },
};

/**
 * Initializes color switcher and animated page scrolling links.
 */
function initConfigAndAnchors(): void {
  $("#sideel").on("click", function toggleConfig() {
    $(this).parents(".config").toggleClass("active");
  });

  $("body").data("bodyClassList", "");

  $(".color-item").on("click", function applyColorClass() {
    const cls = ($(this).data("class") as string | undefined) ?? "";
    $("body").attr("class", $("body").data("bodyClassList"));
    $("body").addClass(cls);
  });

  $("#change-page").on("change", function onPageChange() {
    const page = ($(this).val() as string | undefined) ?? "";
    if (!page) {
      return;
    }

    window.location.assign(`${page}.html`);
  });

  $('[data-animate="scrolling"]').each(function bindScrollLink() {
    const $self = $(this);
    const target = ($self.data("target") as string | undefined) ?? $self.attr("href") ?? "";

    $self.on("click", () => {
      const offsetTop = $(target).offset()?.top;
      if (typeof offsetTop === "number") {
        $("body, html").animate({ scrollTop: offsetTop }, 1000);
      }
      return false;
    });
  });
}

/**
 * Initializes animated counters when counter sections enter the viewport.
 */
function topbarInitCounters(): void {
  if ($(".section-counter").length === 0) {
    return;
  }

  $(".section-counter").waypoint(
    function onCounterWaypoint(direction) {
      if (direction !== "down" || $(this.element).hasClass("ftco-animated")) {
        return;
      }

      const commaStep = $.animateNumber.numberStepFactories.separator(",");

      $(".number").each(function animateCounter() {
        const $number = $(this);
        const value = Number($number.data("number"));

        $number.animateNumber(
          {
            number: Number.isNaN(value) ? 0 : value,
            numberStep: commaStep,
          },
          5000
        );
      });
    },
    { offset: "95%" }
  );
}

/**
 * Entry point for topbar layout behavior.
 */
$(function bootstrapTopbarScripts() {
  initGridFiltering();
  initCarousel();
  initUiEnhancements();
  initBackToTop();
  topbarRegisterToggleSelectedPlugin();
  $('[data-toggle="selected"]').toggleSelected();

  if ($(".navbar").hasClass("sticky")) {
    stickyController.init();
  }

  initConfigAndAnchors();
  topbarInitCounters();
});
