import gsap from "gsap";

type ParallaxLayer = {
  element: HTMLElement;
};

type ParallaxController = {
  destroy: () => void;
};

export function initParallax(
  layers: ParallaxLayer[],
  prefersReducedMotion: boolean,
): ParallaxController {
  if (prefersReducedMotion || layers.length === 0) {
    return { destroy: () => undefined };
  }

  const particleLayer = layers[0]?.element;
  const moveParticlesX = particleLayer
    ? gsap.quickTo(particleLayer, "x", { duration: 1.1, ease: "power3.out" })
    : null;
  const moveParticlesY = particleLayer
    ? gsap.quickTo(particleLayer, "y", { duration: 1.1, ease: "power3.out" })
    : null;

  const handlePointerMove = (event: PointerEvent) => {
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;

    moveParticlesX?.(nx * 14);
    moveParticlesY?.(ny * 10);
  };

  const handlePointerLeave = () => {
    moveParticlesX?.(0);
    moveParticlesY?.(0);
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

  return {
    destroy: () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      gsap.set(
        layers.map((layer) => layer.element),
        { clearProps: "x,y" },
      );
    },
  };
}
