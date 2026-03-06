/** Shared option shape for selected state toggling helpers. */
interface ToggleSelectedOptions {
  /** CSS class applied to the clicked element. */
  classes?: string;
  /** jQuery collection that should receive click handlers. */
  itemSelector?: JQuery<HTMLElement>;
}

/** Minimal isotope options used by this project. */
interface IsotopeOptions {
  itemSelector?: string;
  percentPosition?: boolean;
  filter?: string;
}

/** Minimal Owl Carousel options used by this project. */
interface OwlCarouselOptions {
  margin?: number;
  loop?: boolean;
  autoplay?: boolean;
  dots?: boolean;
  autoplayTimeout?: number;
  items?: number;
}

/** Minimal waypoint options used by this project. */
interface WaypointOptions {
  offset?: string | number;
}

interface JQuery<TElement = HTMLElement> {
  isotope(options?: IsotopeOptions): JQuery<TElement>;
  owlCarousel(options?: OwlCarouselOptions): JQuery<TElement>;
  niceSelect(): JQuery<TElement>;
  tooltip(): JQuery<TElement>;
  waypoint(
    handler: (this: { element: Element }, direction: "up" | "down") => void,
    options?: WaypointOptions
  ): JQuery<TElement>;
  animateNumber(
    options: { number: number; numberStep?: (now: number, tween: unknown) => void },
    duration?: number
  ): JQuery<TElement>;
  toggleSelected(options?: ToggleSelectedOptions): JQuery<TElement>;
}

interface JQueryStatic {
  animateNumber: {
    numberStepFactories: {
      separator: (separator: string) => (now: number, tween: unknown) => void;
    };
  };
}

/** Global WOW constructor provided by wow.min.js. */
declare class WOW {
  init(): void;
}
