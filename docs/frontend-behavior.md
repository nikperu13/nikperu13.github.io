# Frontend Behavior Reference

## `src/ts/topbar-virtual.ts`

### `initGridFiltering`
Initializes Isotope on `.gridder` and filters items using buttons inside `.filterable-button`.

### `initCarousel`
Initializes Owl Carousel on `.testi-carousel`.

### `initUiEnhancements`
Enables Nice Select, Bootstrap tooltips, and WOW scroll animations.

### `initBackToTop`
Shows `.btn-back_to_top` after scrolling down and animates scroll-to-top on click.

### `registerToggleSelectedPlugin`
Adds `$.fn.toggleSelected`, allowing a container to assign one selected class among siblings.

### `stickyController`
Handles sticky navbar behavior:

- Caches section offsets from nav links.
- Switches between `absolute` and `fixed` mode based on viewport and scroll.
- Marks the current nav item as active.

### `initConfigAndAnchors`
Handles template config interactions:

- Theme color toggler (`.color-item`)
- Page switch dropdown (`#change-page`)
- Smooth scrolling links (`[data-animate="scrolling"]`)

### `initCounters`
Runs number animations in `.section-counter` when visible using Waypoints + animateNumber.

### Entry point
Runs all topbar initializers in jQuery document-ready.

## `src/ts/minibar-virtual.ts`

### `registerToggleSelectedPlugin`
Same selected-state plugin used by minibar pages.

### `initMainMenu`
Binds minibar menu links to smooth scrolling and active-state updates; auto-closes minibar on smaller viewports.

### `initSharedUiFeatures`
Initializes shared UI plugins and handlers (selects, tooltip, wow, back-to-top, grid filtering, carousel, theme switcher, page switch, smooth scrolling links).

### `initCounters`
Same counter behavior as topbar layout.

### Entry point
Runs all minibar initializers in jQuery document-ready.

## Dependencies required at runtime

- jQuery
- Bootstrap JS (tooltip)
- Isotope
- Owl Carousel
- Nice Select
- WOW
- Waypoints
- animateNumber

If any of these scripts fail to load, related features degrade gracefully only in some places; plugin initialization may throw if missing.
