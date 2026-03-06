"use strict";
/// <reference types="jquery" />
/** Returns a numeric document scrollTop value for strict TypeScript checks. */
function topbarGetDocumentScrollTop() {
    var _a;
    return (_a = $(document).scrollTop()) !== null && _a !== void 0 ? _a : 0;
}
/** Returns a numeric window width for strict TypeScript checks. */
function getWindowWidth() {
    var _a;
    return (_a = $(window).width()) !== null && _a !== void 0 ? _a : 0;
}
/** Returns a numeric window height for strict TypeScript checks. */
function getWindowHeight() {
    var _a;
    return (_a = $(window).height()) !== null && _a !== void 0 ? _a : 0;
}
/**
 * Initializes filtering behavior for portfolio/work grid items.
 */
function initGridFiltering() {
    const $grid = $(".gridder").isotope({
        itemSelector: ".grid-item",
        percentPosition: true,
    });
    $(".filterable-button").on("click", "button", function handleFilterClick() {
        var _a;
        const filterValue = (_a = $(this).attr("data-filter")) !== null && _a !== void 0 ? _a : "*";
        $grid.isotope({ filter: filterValue });
    });
}
/**
 * Initializes carousel behavior for testimonial sections.
 */
function initCarousel() {
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
function initUiEnhancements() {
    $(".vg-select").niceSelect();
    $('[data-toggle="tooltip"]').tooltip();
    new WOW().init();
}
/**
 * Handles visibility and click behavior of the "back to top" button.
 */
function initBackToTop() {
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
function topbarRegisterToggleSelectedPlugin() {
    $.fn.toggleSelected = function toggleSelected(options) {
        const defaults = {
            classes: "selected",
            itemSelector: this.children(),
        };
        const config = { ...defaults, ...(options !== null && options !== void 0 ? options : {}) };
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
    offsets: [],
    targets: [],
    stickyTop: 0,
    /**
     * Rebuilds cached section offsets so active menu highlighting stays accurate.
     */
    set() {
        var _a, _b;
        const windowTop = Math.floor(topbarGetDocumentScrollTop());
        this.offsets = [];
        this.targets = [];
        const offsetData = this.$sticky.data("offset");
        const measuredTop = (_b = (_a = this.$sticky.css("position", "absolute").offset()) === null || _a === void 0 ? void 0 : _a.top) !== null && _b !== void 0 ? _b : 0;
        this.stickyTop = typeof offsetData === "number" ? offsetData : measuredTop;
        const entries = [];
        this.$sticky.find(".navbar-nav .nav-link").each(function collectAnchorOffsets() {
            var _a, _b;
            const $el = $(this);
            const href = (_b = (_a = $el.data("target")) !== null && _a !== void 0 ? _a : $el.attr("href")) !== null && _b !== void 0 ? _b : "";
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
    update() {
        var _a;
        const windowTop = Math.floor(topbarGetDocumentScrollTop());
        const $stickyLinks = this.$sticky.find(".navbar-nav .nav-item").removeClass("active");
        let stickyPosition = "fixed";
        let currentIndex = 0;
        if (getWindowWidth() < 800 || getWindowHeight() < 500 || this.stickyTop > windowTop) {
            stickyPosition = "absolute";
            this.$sticky.removeClass("floating");
        }
        else {
            for (let i = this.offsets.length - 1; i >= 0; i -= 1) {
                const currentOffset = (_a = this.offsets[i]) !== null && _a !== void 0 ? _a : 0;
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
        }
        else {
            this.$sticky.addClass("floating");
        }
        $stickyLinks.eq(currentIndex).addClass("active");
    },
    /**
     * Binds resize/scroll listeners and performs initial calculation.
     */
    init() {
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
function initConfigAndAnchors() {
    $("#sideel").on("click", function toggleConfig() {
        $(this).parents(".config").toggleClass("active");
    });
    $("body").data("bodyClassList", "");
    $(".color-item").on("click", function applyColorClass() {
        var _a;
        const cls = (_a = $(this).data("class")) !== null && _a !== void 0 ? _a : "";
        $("body").attr("class", $("body").data("bodyClassList"));
        $("body").addClass(cls);
    });
    $("#change-page").on("change", function onPageChange() {
        var _a;
        const page = (_a = $(this).val()) !== null && _a !== void 0 ? _a : "";
        if (!page) {
            return;
        }
        window.location.assign(`${page}.html`);
    });
    $('[data-animate="scrolling"]').each(function bindScrollLink() {
        var _a, _b;
        const $self = $(this);
        const target = (_b = (_a = $self.data("target")) !== null && _a !== void 0 ? _a : $self.attr("href")) !== null && _b !== void 0 ? _b : "";
        $self.on("click", () => {
            var _a;
            const offsetTop = (_a = $(target).offset()) === null || _a === void 0 ? void 0 : _a.top;
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
function topbarInitCounters() {
    if ($(".section-counter").length === 0) {
        return;
    }
    $(".section-counter").waypoint(function onCounterWaypoint(direction) {
        if (direction !== "down" || $(this.element).hasClass("ftco-animated")) {
            return;
        }
        const commaStep = $.animateNumber.numberStepFactories.separator(",");
        $(".number").each(function animateCounter() {
            const $number = $(this);
            const value = Number($number.data("number"));
            $number.animateNumber({
                number: Number.isNaN(value) ? 0 : value,
                numberStep: commaStep,
            }, 5000);
        });
    }, { offset: "95%" });
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
