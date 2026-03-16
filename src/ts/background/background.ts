import { initParticles } from "./particles";
import { initParallax } from "./parallax";

type BackgroundController = {
  destroy: () => void;
};

export async function initBackground(
  root: HTMLElement | null,
  prefersReducedMotion: boolean,
): Promise<BackgroundController | null> {
  if (!root) return null;

  const particles = await initParticles(root, prefersReducedMotion);
  const parallaxLayers = [particles]
    .filter((layer): layer is NonNullable<typeof layer> => layer !== null)
    .map((layer) => ({ element: layer.element }));
  const parallax = initParallax(parallaxLayers, prefersReducedMotion);

  const handleVisibilityChange = () => {
    if (document.hidden) {
      particles?.pause();
    } else {
      particles?.resume();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  handleVisibilityChange();

  return {
    destroy: () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      parallax.destroy();
      particles?.destroy();
    },
  };
}
