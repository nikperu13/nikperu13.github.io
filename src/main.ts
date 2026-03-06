import './styles.css';
import { createIcons, Github, Linkedin, Mail, Phone, Settings } from 'lucide';
import gsap from 'gsap';
import Lenis from 'lenis';

function initLucideIcons(): void {
  createIcons({
    icons: {
      github: Github,
      linkedin: Linkedin,
      mail: Mail,
      phone: Phone,
      settings: Settings,
    },
    attrs: {
      width: '18',
      height: '18',
      strokeWidth: '2',
    },
  });
}

function initLenisScroll(): void {
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    syncTouch: false,
  });

  function raf(time: number): void {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function animatePageEntry(): void {
  gsap.from('.navbar', {
    y: -18,
    opacity: 0,
    duration: 0.55,
    ease: 'power2.out',
  });

  gsap.from('.caption-header', {
    y: 22,
    opacity: 0,
    duration: 0.65,
    delay: 0.08,
    ease: 'power2.out',
  });

  gsap.from('.stack-pill', {
    y: 10,
    opacity: 0,
    duration: 0.4,
    stagger: 0.04,
    delay: 0.2,
    ease: 'power1.out',
  });

  gsap.from('.contact-card', {
    y: 14,
    opacity: 0,
    duration: 0.45,
    stagger: 0.08,
    delay: 0.15,
    ease: 'power1.out',
  });
}

function initSdetToggleAnimation(): void {
  const trigger = document.getElementById('nav-sdet-toggle');
  if (!trigger) {
    return;
  }

  trigger.addEventListener('click', () => {
    gsap.fromTo(
      trigger,
      {
        scale: 1,
        rotate: 0,
      },
      {
        scale: 1.08,
        rotate: -4,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      }
    );

    gsap.fromTo(
      trigger,
      {
        boxShadow: '0 0 0 0 rgba(245,231,161,0.0)',
      },
      {
        boxShadow: '0 0 0 10px rgba(245,231,161,0.28)',
        duration: 0.24,
        yoyo: true,
        repeat: 1,
        ease: 'power1.out',
      }
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  initLenisScroll();
  animatePageEntry();
  initSdetToggleAnimation();
});
