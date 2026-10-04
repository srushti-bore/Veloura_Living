# 🏛️ Veloura Living — Production Runbook & Deployment Manual
**Document Reference:** `docs/Veloura-Living_SRS_Final.md` (DEP-001 to DEP-007, OBS, SEC, NFR-REL-004)  
**Version:** 1.1.0  
**Last Updated:** 03 October 2026  

---

## 1. Production Architecture Overview

```text
User / Browser
      │
      ▼
Vercel (Frontend & Edge SSR)
  ├── Next.js 16 (App Router) + React 19 + Turbopack
  ├── Two-State Architectural Glassmorphism Header
  ├── 300-Frame Day/Night Comparison Slider & Three.js Canvas
  └── 42 REST API Routes
      │
      ├── Supabase PostgreSQL (Port 5432 / Transaction Pooler on 6543)
      ├── Supabase Storage (Public bucket: Catalog/CMS, Private bucket: Invoices/Returns)
      ├── Razorpay Gateway (UPI, Cards, Net Banking & HMAC Webhook Signatures)
      ├── Google Gemini AI (Spatial Consultant, Review Sentiment, Restock Velocity)
      └── Gmail SMTP / Resend (Transactional Lifecycle Notifications)
      │
Render / Docker (Standalone Backend API)
  └── Node.js REST Microservice (Port 5000)
```

---

## 2. Environment Variables Specification (DEP-003)

| Variable | Scope | Description | Sample Production Value |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Frontend | Canonical storefront URL | `https://veloura-living.vercel.app` |
| `DATABASE_URL` | Both | Supabase PostgreSQL Connection URL | `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:6543/postgres` |
| `JWT_SECRET` | Both | 256-bit cryptographically secure secret | `veloura_master_jwt_secret_hex_string_2026` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Frontend | Razorpay Public Key ID | `rzp_live_xxxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay Private Secret Key | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | Webhook HMAC verification secret | `whsec_xxxxxxxxxxxxxxxxxxxx` |
| `GEMINI_API_KEY` | Both | Google Gemini AI Suite API Key | `AIzaSyxxxxxxxxxxxxxxxxxxxxxxx` |
| `SMTP_HOST` | Both | Transactional SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Both | SMTP SSL/TLS port | `587` |
| `SMTP_USER` | Both | SMTP authorized username | `concierge@velouraliving.com` |
| `SMTP_PASS` | Both | SMTP App-specific password | `xxxx xxxx xxxx xxxx` |
| `BUSINESS_GSTIN` | Both | Registered Business GSTIN | `27AABCV1234F1Z5` |

---

## 3. Database Migration & Seeding Runbook (Phase 1, DEP-001)

1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Execute migration script:
   ```sql
   -- Run: supabase/migrations/20261002000001_foundation_schema.sql
   ```
3. Execute seed script:
   ```sql
   -- Run: db/seed.sql
   ```
4. Verify table indexes:
   ```sql
   SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';
   ```

---

## 4. Disaster Recovery & Backup Strategy (NFR-REL-004)

- **Recovery Point Objective (RPO):** **24 Hours** (Automated daily point-in-time Supabase snapshot).
- **Recovery Time Objective (RTO):** **4 Hours** (Documented cold restore procedure).
- **Restore Procedure:**
  1. Navigate to Supabase Dashboard > Database > Backups.
  2. Select the latest 24-hour backup point.
  3. Click "Restore to New Project" or "Restore In-Place".
  4. Update `DATABASE_URL` in Vercel & Render project settings.
  5. Run `GET /api/health` to confirm connectivity.

---

## 5. Deployment Commands & Verification (DEP-001, DEP-004)

```powershell
# 1. Run Automated Test Suite:
npm.cmd test

# 2. Production Next.js Build:
npm.cmd run build

# 3. Standalone Backend Build:
cd backend
npm.cmd run build

# 4. Standalone Backend Docker Build:
docker build -t veloura-backend ./backend
docker run -p 5000:5000 veloura-backend
```
