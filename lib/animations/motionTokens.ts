/**
 * Veloura Living — Master Motion Design Tokens
 * As specified in Veloura_Living_FINAL_Design.md (Section 43)
 */

export const motionTokens = {
  ease: {
    luxury: 'power3.out',
    smooth: 'power2.out',
    reveal: 'power4.out',
    editorial: 'expo.out',
    inOut: 'power2.inOut',
    bounceSubtle: 'back.out(1.2)',
  },

  duration: {
    micro: 0.2,
    short: 0.4,
    medium: 0.8,
    long: 1.4,
    cinematic: 2.0,
  },

  scene: {
    scrub: 1.2,
    pinDistance: 250,
  },

  stagger: {
    fast: 0.05,
    normal: 0.08,
    editorial: 0.12,
  },

  hoverScale: 1.02,
} as const;

export default motionTokens;
