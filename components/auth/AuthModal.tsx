'use client';

import React from 'react';
import { AuthExperience } from './AuthExperience';

export { AuthExperience };

/**
 * 🏛️ Veloura Living — Master Luxury Authentication Modal
 * Adheres strictly to the specification in prompt/veloura-auth-experience.md:
 * - Solid cream/ivory surface with warm brown typography
 * - High-end split lifestyle interior photograph
 * - Strictly NO glassmorphism / frosted glass cards
 * - Reusable across initial entry, header profile click, and protected account flows
 */
export function AuthModal() {
  return <AuthExperience />;
}
