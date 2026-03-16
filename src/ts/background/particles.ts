import { tsParticles } from "@tsparticles/engine";
import { loadFull } from "tsparticles";

type ParticleLayer = {
  element: HTMLElement;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
};

let particlesLoaded = false;

function readParticleTheme(): {
  colors: string[];
  linkColor: string;
} {
  const styles = getComputedStyle(document.body);
  const particle1 = styles.getPropertyValue("--particle-1").trim() || "#46c56f";
  const particle2 = styles.getPropertyValue("--particle-2").trim() || "#8fd4a2";
  const particle3 = styles.getPropertyValue("--particle-3").trim() || "#f0c46e";
  const linkColor =
    styles.getPropertyValue("--particle-link").trim() || "#77d890";

  return {
    colors: [particle1, particle2, particle3],
    linkColor,
  };
}

export async function initParticles(
  root: HTMLElement,
  prefersReducedMotion: boolean,
): Promise<ParticleLayer | null> {
  const element = root.querySelector<HTMLElement>("[data-particle-layer]");
  if (!element) return null;

  if (!particlesLoaded) {
    await loadFull(tsParticles);
    particlesLoaded = true;
  }

  const theme = readParticleTheme();

  const container = await tsParticles.load({
    id: element.id || "background-particles",
    element,
    options: {
      fullScreen: { enable: false },
      fpsLimit: 60,
      background: { opacity: 0 },
      detectRetina: true,
      particles: {
        number: {
          value: prefersReducedMotion ? 12 : 18,
          density: { enable: true, width: 1280, height: 720 },
        },
        color: { value: theme.colors },
        links: {
          enable: true,
          distance: 150,
          opacity: 0.2,
          width: 1.2,
          color: theme.linkColor,
        },
        move: {
          enable: true,
          speed: prefersReducedMotion ? 0.18 : 0.34,
          direction: "none",
          outModes: { default: "out" },
        },
        opacity: {
          value: { min: 0.14, max: 0.34 },
        },
        size: {
          value: { min: 1.8, max: 4.8 },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
          resize: { enable: true },
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
    },
  });

  return {
    element,
    pause: () => {
      container?.pause();
    },
    resume: () => {
      container?.play();
    },
    destroy: () => {
      container?.destroy();
    },
  };
}
