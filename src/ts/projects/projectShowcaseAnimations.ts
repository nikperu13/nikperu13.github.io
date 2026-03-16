import gsap from "gsap";

type AnimationOptions = {
  prefersReducedMotion: boolean;
};

export function applyVisualSelection(
  slideNodes: HTMLElement[],
  selectedIndex: number,
): void {
  slideNodes.forEach((slide, index) => {
    const offset = index - selectedIndex;

    slide.classList.toggle("is-selected", index === selectedIndex);
    slide.classList.toggle("is-before", offset < 0);
    slide.classList.toggle("is-after", offset > 0);
    slide.classList.toggle("is-neighbor", Math.abs(offset) === 1);
    slide.classList.toggle("is-far", Math.abs(offset) > 1);
  });
}

export function commitContentSelection(
  detailNodes: HTMLElement[],
  selectedIndex: number,
  { prefersReducedMotion }: AnimationOptions,
): void {
  detailNodes.forEach((detail, index) => {
    detail.classList.toggle("is-selected", index === selectedIndex);
  });

  const activeDetail = detailNodes[selectedIndex];
  if (!activeDetail || prefersReducedMotion) return;

  const detailParts = activeDetail.querySelectorAll<HTMLElement>(
    "h3, .case-points > p, .chips, .links",
  );

  gsap.killTweensOf([activeDetail, ...detailParts]);
  gsap.fromTo(
    detailParts,
    {
      opacity: 0,
      y: 14,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.42,
      stagger: 0.045,
      ease: "power3.out",
      clearProps: "opacity,transform",
    },
  );
}

export function applyProjectShowcaseMotion(
  slideNodes: HTMLElement[],
  selectedIndex: number,
): void {
  slideNodes.forEach((slideNode, index) => {
    const imageNode = slideNode.querySelector<HTMLElement>("img");
    const titleNode =
      slideNode.querySelector<HTMLElement>(".project-stage-caption");
    if (!imageNode || !titleNode) return;

    const offset = index - selectedIndex;
    const abs = Math.abs(offset);

    const shiftX = 0;
    const scale = offset === 0 ? 1.1 : abs === 1 ? 0.94 : 0.88;
    const opacity = offset === 0 ? 1 : abs === 1 ? 0.72 : 0.56;
    const blur = offset === 0 ? 0 : abs === 1 ? 0.1 : 0.24;
    const parallaxX = 0;
    const imageScale = offset === 0 ? 1.05 : 1;
    const captionY = offset === 0 ? 0 : 5;

    slideNode.style.setProperty("--slide-shift-x", `${shiftX}px`);
    slideNode.style.setProperty("--slide-scale", scale.toFixed(3));
    slideNode.style.setProperty("--slide-opacity", opacity.toFixed(3));
    slideNode.style.setProperty("--slide-blur", `${blur.toFixed(2)}px`);
    slideNode.style.setProperty("--shot-parallax-x", `${parallaxX}px`);
    imageNode.style.setProperty("--shot-image-scale", imageScale.toFixed(3));
    titleNode.style.setProperty("--caption-offset-y", `${captionY}px`);
  });
}

export function bindActiveHover(
  slideNodes: HTMLElement[],
  { prefersReducedMotion }: AnimationOptions,
): void {
  const handleMove = (event: PointerEvent) => {
    if (prefersReducedMotion) return;
    const slide = event.currentTarget as HTMLElement;
    if (!slide.classList.contains("is-selected")) return;

    const shot = slide.querySelector<HTMLElement>(".project-shot-stage");
    const caption = slide.querySelector<HTMLElement>(".project-stage-caption");
    if (!shot || !caption) return;

    const rect = slide.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 8;

    gsap.to(shot, {
      x: offsetX,
      y: offsetY,
      duration: 0.32,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(caption, {
      x: offsetX * 0.42,
      y: offsetY * 0.42,
      duration: 0.32,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const reset = (slide: HTMLElement) => {
    const shot = slide.querySelector<HTMLElement>(".project-shot-stage");
    const caption = slide.querySelector<HTMLElement>(".project-stage-caption");
    if (!shot || !caption) return;

    gsap.to([shot, caption], {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
      clearProps: "x,y",
    });
  };

  slideNodes.forEach((slide) => {
    slide.addEventListener("pointermove", handleMove);
    slide.addEventListener("pointerleave", () => {
      reset(slide);
    });
  });
}
