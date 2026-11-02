# Handular — Living Architecture & Design Decisions

This document tracks all confirmed architectural decisions, stack selections, cost evaluations, and rejected alternatives for Handular.

> [!NOTE]
> The full, exhaustive screen-by-screen blueprint, UI component trees, and API catalogs are documented in the **Master Plan**:
> 👉 [master_plan_complete.md](file:///C:/Users/abundant/.gemini/antigravity/brain/41d5c01e-093c-427a-96da-bfaccf8a0cab/master_plan_complete.md)

---

## Guiding Principles
1. **100% Zero-Cost Free-Tier**: Every single component must run on rock-solid, reliable free tiers ($0/month).
2. **Decoupled Client & Server**: Standalone static React frontend (Vercel) + dedicated Node.js backend (Render).
3. **No Microservices**: Strict monolithic backend. No distributed network latency, no multi-service orchestration.
4. **Lean & Fast**: Low memory footprint to prevent free-tier crashes and cold start delays.
5. **Step-by-Step Rigor**: Each architectural layer is evaluated, challenged, and locked before moving to the next.

---

## Confirmed Infrastructure ($0 / Month)

| Component | Choice | Tier & Limits | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Hosting** | **Vercel** | Free Tier (Hobby) | Edge CDN, instant global loading, zero cold starts, automatic GitHub deployments. |
| **Backend API** | **Render** | Free Tier Web Service (Node.js) | 512MB RAM, free SSL, native Git push deploys. |
| **Database** | **Supabase (Prod) / Docker (Local)** | Free Tier (Managed PostgreSQL) / postgres:16-alpine | 500MB database, connection pooling, zero maintenance, instant GUI dashboard. |
| **Media & Images** | **Cloudinary** | Free Tier (25 Credits / mo) | Auto-compression, on-the-fly resizing/thumbnails for laptop & phone pictures, direct uploads. |
| **Auth** | **Supabase Auth** | Free Tier (50,000 MAUs) | Built into Supabase DB, secure JWT generation, ready-made React auth hooks. |
| **AI - Audio** | **Cloudflare Workers AI** | Free Tier (10k Neurons/day) | Edge GPU Whisper transcription for seller voice notes. |
| **AI - Vision** | **Google Gemini Flash** | Free Tier (1,500 req/day) | Multimodal visual inspection, condition analysis, specs stickers OCR. |
| **AI - Text & JSON** | **Groq (Llama 3.3 70B)** | Free Tier (14.4k req/day) | Sub-second LPU text extraction and guaranteed JSON schema output. |

---

## Decision Log

### 1. Architecture Model
* **Status**: **LOCKED**
* **Verdict**: Single monolithic backend + standalone React SPAs.
* **Rejected**:
  - *Microservices*: Premature complexity, network overhead, multiple deployment costs.
  - *NestJS / SSR*: Unnecessary bloat, heavy idle RAM (150–250MB) risking Render 512MB limit, slow cold starts.

---

### 2. Frontend Framework & Language
* **Status**: **LOCKED**
* **Verdict**: **React + TypeScript (via Vite)**
* **Rationale**: 
  - TypeScript provides autocomplete and compile-time verification for complex hardware specifications (laptops, phones, conditions, warranty, pricing).
  - Deploys as pure static Single Page Applications (SPAs) on Vercel with zero server overhead.
* **Rejected**:
  - *Plain JavaScript*: Higher likelihood of runtime typos in nested product schemas and offer payloads.

---

### 3. Backend Engine & Language
* **Status**: **LOCKED**
* **Verdict**: **Fastify + TypeScript (Node.js)**
* **Rationale**:
  - Native first-class TypeScript integration without monkey-patching.
  - Built-in high-speed JSON Schema validation (`Ajv`) and fast serialization.
  - Ultra-low memory footprint (~25–35MB idle), preserving over 450MB on Render's 512MB free tier.
  - Blazing fast boot time (~90ms), mitigating cold starts when Render spins up from sleep.
  - Long-Term Support (LTS) backed by core Node.js leadership.
* **Rejected**:
  - *Express*: Slower evolution, higher memory usage, callback-era architecture, clunky TypeScript typing.

---

### 4. Database Access & ORM (PostgreSQL on Supabase)
* **Status**: **LOCKED**
* **Verdict**: **Prisma ORM**
* **Rationale**:
  - Intuitive, highly readable declarative data modeling in `schema.prisma`.
  - Built-in migration engine (`prisma migrate`) with clear rollback & history tracking.
  - `prisma studio` provides a visual database browser for quick manual inspection and debugging.
  - Strong relation navigation (`include`, `select`) for matching buyer requests to seller offers.
* **Implementation Note for Supabase**:
  - Will configure Supabase's transaction connection pooler (port 6543) for application queries to prevent connection exhaustion on the free tier, and direct connection (port 5432) for running migrations.
* **Rejected**:
  - *Drizzle ORM*: Decided in favor of Prisma's simpler DSL and developer familiarity.

---

### 5. Background Queue & Pipeline Processing ($0 Zero-Redis)
* **Status**: **LOCKED**
* **Verdict**: **PostgreSQL-Backed State Machine Pipeline (using Prisma & Supabase)**
* **Rationale**:
  - **ACID Transaction Guarantee**: Creating buyer requests and scheduling seller broadcasts happen in the same DB transaction. No risk of missing or orphan jobs.
  - **Step-by-Step Resumability**: If an external API (like Gemini vision or WhatsApp) temporarily fails, the pipeline remembers the exact step and resumes without re-uploading media or re-calling APIs.
  - **Full UI Observability**: Pipeline stages (`RECEIVED` -> `MEDIA_UPLOADED` -> `AI_PARSED` -> `OFFER_CREATED`) are directly queryable by the React staff dashboard.
  - **Zero Cost & Zero Maintenance**: Runs 100% inside the existing Supabase PostgreSQL instance. No extra accounts (Upstash), no separate Redis bill.
* **Rejected**:
  - *Redis + BullMQ*: Dual-write consistency risks, extra account/infrastructure, opaque state stored in RAM.
  - *In-Memory Queue (p-queue)*: Risk of permanent job loss when Render sleeps or reboots.

---

### 6. Messaging Channels & Ingestion Architecture
* **Status**: **LOCKED**
* **Verdict**: **Dual Provider Strategy via Provider Adapter Pattern**
  - **WhatsApp**: **Evolution API** (Self-hosted WhatsApp Web/Baileys gateway; scans QR code, $0 Meta fees, no pre-approved template friction).
  - **Telegram**: **grammY** (Pure TypeScript, native 1-line Fastify webhook adapter, automatic rate-limit retries, typed photo/media streaming).
* **Architecture Pattern**:
  - Fastify implements a normalized `MessagingAdapter` interface (`sendMessage`, `parseWebhook`).
  - Core pipeline operates independently of whether messages arrive via WhatsApp or Telegram.
  - Telegram can also be leveraged as a $0 mobile alert channel with interactive buttons for staff offer reviews.
* **Rejected**:
  - *Meta Cloud API (Day 1)*: Required business verification and rigid message template pre-approvals for outbound broadcasts.
  - *Telegraf / node-telegram-bot-api*: Outdated callback/Express patterns, inferior TypeScript typing.

---

### 7. AI Processing Pipeline ($0 Multi-Model Strategy)
* **Status**: **LOCKED**
* **Verdict**: **Specialized Free-Tier Trio**
  1. **Audio (Voice Notes)**: **Cloudflare Workers AI (`@cf/openai/whisper`)** (Free edge GPUs, 10k Neurons/day).
  2. **Vision (Device Photos & OCR)**: **Google Gemini Flash (AI Studio)** (Free 1,500 req/day for condition assessment & sticker OCR).
  3. **Text & Structured JSON**: **Groq (Llama 3.3 70B)** (Free 14.4k req/day on ultra-fast LPUs for instant schema output & confidence scoring).
* **Rationale**:
  - Zero single-vendor lock-in.
  - Maximizes individual free quotas across 3 independent cloud providers.
  - Sub-second pipeline execution speed.

---

### 8. Staff Authentication & Admin Security
* **Status**: **LOCKED**
* **Verdict**: **Supabase Auth (JWT + RBAC)**
* **Rationale**:
  - Free up to 50,000 monthly active users.
  - Generates secure JWTs; Fastify verifies tokens using `@fastify/jwt` in protected routes.
  - React dashboard uses `@supabase/supabase-js` for ready-made login, session refresh, and token management.
  - Role-based access control (`ADMIN` vs `STAFF`) stored in the user profile table.
* **Rejected**:
  - *Custom Fastify JWT*: Unnecessary custom boilerplate for password hashing, resets, and token rotation.
  - *Clerk*: Extra third-party account when Supabase already includes auth for free.

---

### 9. Workspace & Frontend Isolation Model
* **Status**: **LOCKED**
* **Verdict**: **Three-Folder Decoupled Architecture (`client/`, `admin/`, `api/`)**
* **Structure**:
  - `client/` $\rightarrow$ React + TypeScript + Vite (Student requests, offer comparisons, mobile-first, deployed to Vercel Project 1).
  - `admin/` $\rightarrow$ React + TypeScript + Vite (Staff review queues, seller directories, data tables, deployed to Vercel Project 2, protected behind Supabase Auth & Cloudflare Zero Trust).
  - `api/` $\rightarrow$ Fastify + Prisma + TypeScript (Single monolithic backend deployed to Render).
* **Rationale**:
  - Physical security isolation for the internal admin dashboard.
  - Independent release cycles: UI updates to the staff review queue never touch or break public student traffic.
  - Zero monorepo tooling bloat: Each folder is self-contained with its own clean dependencies and native Vercel/Render root directory support.
* **Rejected**:
  - *Single Unified Frontend*: Blurs security boundaries, risks exposing admin logic in client bundles, and causes bundle bloat on mobile student phones.
  - *Turborepo Monorepo*: Added unnecessary configuration complexity for a lean team.

---

### 10. Frontend Styling & UI Component System (Both Client & Admin)
* **Status**: **LOCKED**
* **Verdict**: **Tailwind CSS + shadcn/ui + Lucide Icons (Cloudflare Design Tokens)**
* **Aesthetic Standard**:
  - Whisper-thin `1px` translucent borders (`border-neutral-200/80`); zero harsh solid black lines.
  - `rounded-2xl` (16px) curvature for cards and search containers; `rounded-xl` for buttons.
  - Flat electric blue primary buttons (`#0051c3`) with zero 3D bevels or heavy drop-shadows.
  - Soft gray pill buttons (`bg-neutral-100`) for secondary actions.
* **Rejected**:
  - *Material UI (MUI) / Ant Design*: Heavy runtime CSS-in-JS, high bundle weight, slower mobile performance.

---

### 11. Core Domain Data Model & Entity Schemas (Prisma)
* **Status**: **LOCKED**
* **Verdict**: **7-Entity Architecture with PostgreSQL JSONB Dynamic Specs**
  1. `Seller`: Contact, verification status, product categories (`LAPTOPS`, `PHONES`), rating, completed deals.
  2. `BuyerRequest`: Student details, category, budget, target specifications, public token for sharing.
  3. `RequestBroadcast`: Distribution audit log tracking which sellers received the request and delivery status.
  4. `InboundBatch`: 45-second debouncer window, raw webhook capture, media references, and state machine tracker.
  5. `Offer`: Structured product specs (`specs: Json`), Cloudinary AVIF photos, AI confidence score, publication status.
  6. `ReviewTask`: Human-in-the-loop queue for low-confidence AI offers or missing prices.
  7. `DealOutcome`: Post-sourcing follow-up, final closing price, seller reliability feedback.

---

### 12. Inbound Message Debouncing (Native Burst-Handling)
* **Status**: **LOCKED**
* **Verdict**: **45-Second Inbound Silence Window**
* **Rationale**:
  - Prevents fragmented AI calls when sellers send text, photos, and voice notes across multiple separate messages.
  - Groups all incoming media into a single batch before executing the AI pipeline.

---

### 13. Dynamic Device Specs (JSONB)
* **Status**: **LOCKED**
* **Verdict**: **Postgres `specs: Json` Column on `Offer`**
* **Rationale**:
  - Allows adding MacBooks, ThinkPads, iPhones, and Android phones with their distinct spec attributes without altering tables or running database migrations.

---

### 14. Media AVIF Compression Pipeline
* **Status**: **LOCKED**
* **Verdict**: **Cloudinary Dynamic AVIF Pipeline (`f_avif,q_auto:good,w_1200`)**
* **Rationale**:
  - Compresses raw 8MB mobile camera photos to ~120KB AVIF files on the fly.
  - Keeps Cloudinary storage and bandwidth comfortably within the free 25 credits/month tier.

---

### 15. Master Plan Implementation & Verification
* **Status**: **LOCKED & VERIFIED**
* **Verdict**: Completed full end-to-end implementation across `client/`, `admin/`, and `api/`.
* **Details**:
  - **Local Database**: PostgreSQL 16 Alpine running in Docker container `handular-postgres` on port `5432`, schema pushed via Prisma.
  - **Backend API**: Fastify monolith running on port `3001` with modular routes for student requests, admin operations, WhatsApp/Telegram webhooks, in-memory 45-second message debouncing, and multimodal AI extraction.
  - **Client SPA (`client/`)**: 4 screens fully implemented with the Cloudflare UI Design System (Screen C1 Guided Request Wizard, Screen C2 Offer Showcase, Screen C3 Deal Confirmed, Screen C4 Live Request Tracker). Tested and built into production assets (`dist/`).
  - **Admin SPA (`admin/`)**: 5 screens fully implemented with Cloudflare sidebar navigation and styling (Screen A1 Command Center, Screen A2 Staff Review Queue, Screen A3 Sourcing Board, Screen A4 Verified Vendors, Screen A5 Settlement & Escrow). Tested and built into production assets (`dist/`).
