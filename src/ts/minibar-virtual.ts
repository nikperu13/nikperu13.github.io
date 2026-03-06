/// <reference types="jquery" />

/** Returns a numeric document scrollTop value for strict TypeScript checks. */
function minibarGetDocumentScrollTop(): number {
  return $(document).scrollTop() ?? 0;
}

/**
 * Registers a jQuery plugin that marks one item as selected and clears siblings.
 */
function minibarRegisterToggleSelectedPlugin(): void {
  $.fn.toggleSelected = function toggleSelected(options?: ToggleSelectedOptions): JQuery {
    const defaults: Required<ToggleSelectedOptions> = {
      classes: "selected",
      itemSelector: this.children() as JQuery<HTMLElement>,
    };

    const config = { ...defaults, ...(options ?? {}) };

    return this.each(function setupSelectedState() {
      config.itemSelector.on("click", function onItemClick() {
        const $self = $(this);
        $self.addClass(config.classes);
        $self.siblings().removeClass(config.classes);
      });
    });
  };
}

/**
 * Binds smooth-scrolling behavior for minibar navigation links.
 */
function initMainMenu(): void {
  const $mainMenu = $(".main-menu");

  $mainMenu.each(function bindMainMenu() {
    const $menu = $(this);
    const $menuLinks = $menu.find(".menu-link");

    $menuLinks.on("click", function onMenuClick(event) {
      const $self = $(this);
      const target = $self.attr("href") ?? "";
      const targetOffset = $(target).offset()?.top;
      const windowWidth = $(window).width() ?? 0;

      if (target.charAt(0) === "#") {
        event.preventDefault();
        $self.parent().addClass("active");
        $self.parent().siblings().removeClass("active");
      }

      if (typeof targetOffset === "number") {
        $("body, html").animate({ scrollTop: targetOffset }, 1000);
      }

      if (windowWidth < 600) {
        setTimeout(() => {
          $(".minibar").slideUp();
        }, 500);
      }

      return false;
    });
  });
}

/**
 * Enables template-level plugins and click handlers used on minibar pages.
 */
function initSharedUiFeatures(): void {
  $(".vg-select").niceSelect();
  $('[data-toggle="tooltip"]').tooltip();
  new WOW().init();

  const $backTop = $(".btn-back_to_top");
  $(window).on("scroll", () => {
    if (minibarGetDocumentScrollTop() > 400) {
      $backTop.css("visibility", "visible");
      return;
    }

    $backTop.css("visibility", "hidden");
  });

  $backTop.on("click", () => {
    $("html").animate({ scrollTop: 0 }, 1000);
    return false;
  });

  const $grid = $(".gridder").isotope({
    itemSelector: ".grid-item",
    percentPosition: true,
  });

  $(".filterable-button").on("click", "button", function onFilterClick() {
    const filterValue = $(this).attr("data-filter") ?? "*";
    $grid.isotope({ filter: filterValue });
  });

  $(".testi-carousel").owlCarousel({
    margin: 0,
    loop: true,
    autoplay: true,
    dots: false,
    autoplayTimeout: 4000,
    items: 1,
  });

  $(".toggle-menu").on("click", () => {
    $(".minibar").slideToggle();
  });

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
 * Initializes animated number counters when sections enter the viewport.
 */
function minibarInitCounters(): void {
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
 * Entry point for minibar layout behavior.
 */
$(function bootstrapMinibarScripts() {
  minibarRegisterToggleSelectedPlugin();
  initMainMenu();
  $('[data-toggle="selected"]').toggleSelected();
  initSharedUiFeatures();
  minibarInitCounters();
});
