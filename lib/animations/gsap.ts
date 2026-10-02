import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export const animationPresets = {
  fadeInUp: (element: HTMLElement | string, delay: number = 0, yOffset: number = 24) => {
    if (typeof window === 'undefined') return;
    return gsap.fromTo(
      element,
      { opacity: 0, y: yOffset },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element as any,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  },

  staggerCards: (container: HTMLElement | string, cardsSelector: string = '.product-card-item') => {
    if (typeof window === 'undefined') return;
    return gsap.fromTo(
      cardsSelector,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container as any,
          start: 'top 85%',
        },
      }
    );
  },

  heroReveal: () => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof window === 'undefined') return;

    if (!document.querySelector('.hero-headline')) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (document.querySelector('.hero-visual-card')) {
      tl.fromTo('.hero-visual-card', { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' });
    }
    if (document.querySelector('.hero-eyebrow')) {
      tl.fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.7');
    }
    if (document.querySelector('.hero-headline')) {
      tl.fromTo('.hero-headline', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.5');
    }
    if (document.querySelector('.hero-subtext')) {
      tl.fromTo('.hero-subtext', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.75 }, '-=0.55');
    }
    if (document.querySelector('.hero-cta-primary')) {
      tl.fromTo('.hero-cta-primary', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.45');
    }
    if (document.querySelector('.hero-cta-secondary')) {
      tl.fromTo('.hero-cta-secondary', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.5');
    }
    if (document.querySelector('.hero-metrics')) {
      tl.fromTo('.hero-metrics', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
    }

    return tl;
  },

  initScrollSections: () => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof window === 'undefined') return;

    // Text elements with subtle restrained upward reveal (16px)
    const textEls = document.querySelectorAll('.scroll-reveal-text');
    textEls.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Image elements with subtle scale 1.02 -> 1
    const imgEls = document.querySelectorAll('.scroll-reveal-img');
    imgEls.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 1.02 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  },
};
