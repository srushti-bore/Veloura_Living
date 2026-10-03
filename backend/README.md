# 🏛️ Veloura Living — Standalone Backend Service & Business Logic

This folder contains the complete, self-contained backend service for **Veloura Living — Luxury Furniture Intelligence Platform**, configured for deployment on **Render / Supabase PostgreSQL / Docker** per the normative SRS specification.

---

## 📂 Backend Architecture

```
backend/
├── src/
│   ├── api/                     # Unified API response and error handling
│   │   ├── response.ts
│   │   └── errorHandler.ts
│   ├── auth/                    # Web Crypto PBKDF2 hashing, JWT & RBAC guards
│   │   ├── password.ts
│   │   ├── jwt.ts
│   │   ├── rbac.ts
│   │   └── session.ts
│   ├── data/                    # Business Logic Stores & Authoritative Engines
│   │   ├── authStore.ts
│   │   ├── catalogStore.ts
│   │   ├── shoppingStore.ts
│   │   ├── pricingStore.ts
│   │   ├── orderStore.ts
│   │   ├── postPurchaseStore.ts
│   │   ├── cmsStore.ts
│   │   └── dbSeedData.ts
│   ├── db/                      # Relational Schema, Seed Data & Migrations
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   └── migrations/
│   ├── types/                   # TypeScript DTOs & Entity Definitions
│   │   ├── database.ts
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   └── server.ts                # Standalone HTTP/REST API Server (Port 5000)
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 🚀 Running the Backend Standalone

```powershell
# In the backend directory:
cd backend
npm install
npm start
```

Default standalone port: `http://localhost:5000`  
Render Deployment Target: Web Service with Node runtime or Docker.
