# 🔐 Veloura Living — Patron Authentication Experience

This document details the quiet luxury modal authentication flow, security rules, and user state handling.

---

## 1. Auth Experience Principles

* **Unobtrusive**: Appears as a sleek 2-column glassmorphism modal (`AuthModal.tsx`) without breaking the shopper's current browsing or 3D configuration context.
* **Tabs**: Instant switching between `Sign In`, `Create Account (Sign Up)`, and `Forgot Password`.
* **Visual Anchor**: Left column features an architectural editorial image showcasing bespoke joinery with the quote:
  > *"Every piece tells a story of patience, materiality, and enduring quiet luxury."*

---

## 2. Security & Lockout Rules

* **Hashing**: PBKDF2 with 10,000 iterations & cryptographic salt.
* **JWT Lifecycle**: Access tokens (15-minute validity) & Refresh tokens (7-day validity).
* **Account Lockout**: 5 consecutive failed login attempts trigger an automated 15-minute security cooldown (AUTH-007).
* **Self-Service Recovery**: 30-minute time-limited cryptographic password reset tokens.
