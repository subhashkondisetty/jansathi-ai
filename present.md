# JanSathi AI — Project Progress & Architecture Status (`present.md`)

> **Event**: FORGE '26 — Theme 1: "Civic Pulse"  
> **Project**: JanSathi AI (Government-Information Assistant for Indian Citizens)  
> **Current Date**: November 1, 2026  
> **Current Milestone**: Phase 1, Phase 2 & Phase 3 Complete, Verified & Live Against MongoDB Atlas

---

## 1. Quick Access Links

| Service                            | URL                                                                              | Status     | Description                                                |
| :--------------------------------- | :------------------------------------------------------------------------------- | :--------- | :--------------------------------------------------------- |
| **Frontend Client (Vite + React)** | [http://localhost:5173](http://localhost:5173)                                   | **LIVE**   | Citizen UI down to 360px viewport with Vite `/api` proxy   |
| **Backend Server (Express API)**   | [http://localhost:5000](http://localhost:5000)                                   | **LIVE**   | Node 20+ Express server with security middleware pipeline  |
| **Liveness Health Probe**          | [http://localhost:5000/api/health](http://localhost:5000/api/health)             | **200 OK** | Service uptime, ISO date, database connection check        |
| **Readiness Health Probe**         | [http://localhost:5000/api/health/ready](http://localhost:5000/api/health/ready) | **200 OK** | Readiness verification checking MongoDB Atlas connectivity |

---

## 2. Executive Summary

JanSathi AI is built on a production-grade, non-AI MERN monorepo foundation. In accordance with project architecture guidelines, all AI functionalities (LLM generation, vector embeddings, semantic search, RAG, multilingual translation, speech-to-text, and eligibility reasoning) are reserved for later phases through documented hook points that return `HTTP 501 NOT_IMPLEMENTED`. Absolutely zero fake, canned, or simulated AI data is permitted in the codebase.

Up to this point:

- **Phase 1 (Monorepo Foundation)**: Fully implemented and committed (`309a4cc`).
- **Phase 2 (Server Core & Database Connection)**: Fully implemented and committed (`60b0899`). Connected to live MongoDB Atlas cluster with automatic DNS SRV resolution.
- **Phase 3 (Mongoose Models & Database Indexes)**: Fully implemented and verified. All 9 domain schemas created, system enums frozen, indexes synced live against MongoDB Atlas, model validations tested, and zero lint/format errors.

---

## 3. 13-Phase Milestone Roadmap

| Phase       | Milestone Name                   | Status                                | Key Highlights                                                                                                                       |
| :---------- | :------------------------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1** | **Monorepo Foundation**          | **DONE & COMMITTED** (`309a4cc`)      | Workspaces (`client`, `server`), ESLint 9 flat config, Prettier, Vite, Tailwind CSS 3, Express scaffolding, `/api/health`            |
| **Phase 2** | **Server Core & DB Integration** | **DONE & COMMITTED** (`60b0899`)      | MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, Rate limiters, Zod validators, Readiness probe |
| **Phase 3** | **Mongoose Models & DB Indexes** | **DONE & VERIFIED** (Ready to Commit) | 9 domain models, 17 system enums, text search index, TTL audit log index, `npm run db:sync-indexes` tooling                          |
| Phase 4     | Scheme Catalog Core & CRUD       | Pending                               | Scheme model, CRUD endpoints, categories, indexing, public search                                                                    |
| Phase 5     | Document Ingestion Pipeline      | Pending                               | PDF/HTML upload, metadata extraction, background job queue                                                                           |
| Phase 6     | Admin Governance & Review        | Pending                               | Document review, audit logs, scheme approval workflows                                                                               |
| Phase 7     | Citizen Portal UI                | Pending                               | Scheme discovery, filtering, bookmarking, mobile-first design                                                                        |
| Phase 8     | AI Hook Architecture (Stubs)     | Pending                               | 501 NOT_IMPLEMENTED contracts for RAG, embeddings, and chat                                                                          |
| Phase 9     | Notifications & Civic Alerts     | Pending                               | Circulars, acts, notifications feeds, urgency tags                                                                                   |
| Phase 10    | Multilingual Meta Framework      | Pending                               | Language enums (`en`, `te`, `hi`, `ta`), UI localization scaffolding                                                                 |
| Phase 11    | Eligibility Checklist Engine     | Pending                               | Deterministic non-AI rule evaluator for scheme eligibility                                                                           |
| Phase 12    | End-to-End Testing & Auditing    | Pending                               | Vitest + Supertest integration tests, OWASP security audit                                                                           |
| Phase 13    | Final Polish & Production Deploy | Pending                               | Render/Atlas production build, Docker, demo script                                                                                   |

---

## 4. Phase 3 Architecture: Models & Indexes

### A. Data Models (`server/src/models/`)

All 9 Mongoose models implement `timestamps: true` and the shared `toJSONPlugin` (`_id` mapped to `id`, `__v` stripped, sensitive/internal fields scrubbed):

1. **`User`** (`User.js`):
   - Fields: `name`, `email` (unique, lowercase), `passwordHash`, `role` (`citizen`, `reviewer`, `admin`, `superadmin`), `preferredLanguage`, `phone`, `isActive`, `lastLoginAt`.
   - Index: Unique index on `email`.
2. **`Source`** (`Source.js`):
   - Fields: `name`, `url` (unique), `sourceType` (`central_portal`, `state_portal`, `gazette`, `ministry_site`), `crawlFrequency`, `isActive`, `lastScrapedAt`.
   - Index: Unique index on `url`, compound index `{ sourceType: 1, isActive: 1 }`.
3. **`Document`** (`Document.js`):
   - Fields: `title`, `documentType` (`scheme`, `act`, `rule`, `circular`, `notification`, `guideline`), `sourceId` (ref: Source), `ministry`, `department`, `state` (36 States/UTs or national), `status` (`draft`, `published`, `archived`), `tags`, `publishedAt`.
   - Indexes: `{ documentType: 1, status: 1 }`, `{ state: 1, publishedAt: -1 }`, `{ tags: 1 }`.
4. **`DocumentPage`** (`DocumentPage.js`):
   - Fields: `documentId` (ref: Document), `pageNumber`, `rawText`, `status` (`pending`, `processed`, `failed`).
   - Index: Compound unique `{ documentId: 1, pageNumber: 1 }`.
5. **`DocumentChunk`** (`DocumentChunk.js`):
   - Fields: `documentId` (ref: Document), `pageId` (ref: DocumentPage), `chunkIndex`, `text`, `sectionTitle`, `tokenCount`, `metadata`.
   - **Text Index**: `chunk_text_idx` on `{ text: "text", sectionTitle: "text" }` with `weights: { sectionTitle: 5, text: 1 }` for non-AI keyword search.
   - **AI-DAY Reservation**: Prominent header and schema comment blocks documenting future vector embedding field additions (`embedding: [Number]`) and Atlas Vector Search index.
6. **`IngestionJob`** (`IngestionJob.js`):
   - Fields: `documentId` (ref: Document), `status` (`queued`, `processing`, `completed`, `failed`), `attemptCount`, `errorDetails`, `startedAt`, `completedAt`.
   - Index: Compound `{ status: 1, createdAt: -1 }`.
7. **`Conversation`** (`Conversation.js`):
   - Fields: `userId` (ref: User, optional for guests), `title`, `language`, `messages` (subdocument array: `role`, `content`, `timestamp`), `isActive`.
   - Index: `{ userId: 1, updatedAt: -1 }`.
8. **`Claim`** (`Claim.js`):
   - Fields: `citizenId` (ref: User), `schemeId` (ref: Document), `status` (`draft`, `submitted`, `under_review`, `approved`, `rejected`), `evidenceDocuments`, `verificationNotes`.
   - Index: Compound `{ citizenId: 1, status: 1 }`.
9. **`AuditLog`** (`AuditLog.js`):
   - Fields: `actorId` (ref: User), `actorRole`, `action`, `resourceType`, `resourceId`, `metadata`, `ipAddress`, `userAgent`, `createdAt`.
   - **Security**: Pre-save hook automatically sanitizes `metadata` by stripping sensitive keys (`password`, `token`, `secret`, `authorization`, `creditCard`).
   - **TTL Index**: Automatic document expiration index on `{ createdAt: 1 }` expiring after `AUDIT_LOG_TTL_DAYS` (default 180 days).

### B. Index Synchronization Tooling

- Script: `server/scripts/syncIndexes.js`
- NPM Command: `npm run db:sync-indexes -w server`
- Safely connects to Atlas, executes `Model.syncIndexes()` sequentially across all 9 models, logs created and dropped indexes with Pino, and exits cleanly.

---

## 5. Live Operational Status & Verification Matrix

Both development servers are active and connected in daemon mode:

- **Express Backend**: Listening on port `5000` (Node `--watch`)
- **Vite Frontend**: Serving on port `5173` (with dev proxy `/api` &rarr; `:5000`)
- **Database**: Connected to MongoDB Atlas cluster (`jansathi` database)

### Comprehensive Verification Matrix

| Test Suite / Target           | Verification Performed                     | Expected Result                                 | Actual Result                          | Status   |
| :---------------------------- | :----------------------------------------- | :---------------------------------------------- | :------------------------------------- | :------- |
| **Backend Liveness**          | `GET /api/health`                          | 200 OK, `database: "connected"`                 | `200 OK` (Uptime: 347s+, DB connected) | **PASS** |
| **Frontend HTTP**             | `GET /` on `:5173`                         | 200 OK HTML payload                             | `200 OK` HTML rendered                 | **PASS** |
| **Atlas DB Connectivity**     | SRV lookup with custom DNS fallback        | Clean handshake with replica set                | Connected without ECONNREFUSED         | **PASS** |
| **Mongoose Models Indexing**  | `npm run db:sync-indexes -w server`        | All 9 collections indexed on Atlas              | All 9 collections synchronized         | **PASS** |
| **Text Index Creation**       | `DocumentChunk.syncIndexes()`              | `chunk_text_idx` created on text + sectionTitle | Index confirmed in collection indexes  | **PASS** |
| **TTL Index Creation**        | `AuditLog.syncIndexes()`                   | TTL index expiring at 180 days                  | `createdAt_1` TTL index active         | **PASS** |
| **Sensitive Field Stripping** | `AuditLog` pre-save hook                   | Scrub passwords/tokens in metadata              | Subdocuments sanitized before save     | **PASS** |
| **Model Enum Validation**     | `new User({ role: "invalid" }).validate()` | `ValidationError` on bad enum                   | Rejected with valid path error         | **PASS** |
| **Model Valid Instantiation** | Valid instances of all 9 models            | Zero validation errors                          | All 9 models passed validation         | **PASS** |
| **Code Style & Format**       | `npm run format:check`                     | Prettier compliance across all files            | All files match Prettier code style    | **PASS** |
| **Static Code Analysis**      | `npm run lint`                             | ESLint 9 zero errors/warnings                   | 0 errors, 0 warnings                   | **PASS** |
| **Frontend Bundle Build**     | `npm run build`                            | Clean Vite production distribution              | Bundled client in 3.20s                | **PASS** |

---

## 6. Complete Codebase Inventory

```
jansathi-ai/
├── .editorconfig                          # Global 2-space indentation & LF line endings
├── .env                                   # Root environment file (gitignored, contains Atlas URI)
├── .env.example                           # Documented public template for environment variables
├── .gitignore                             # Excludes node_modules, .env*, dist, storage, logs
├── .nvmrc                                 # Node.js version lock (20)
├── .prettierignore                        # Prettier exclusions
├── .prettierrc                            # Prettier rules (singleQuote, semi, printWidth: 100)
├── eslint.config.js                       # ESLint 9 flat config (React hooks, Node globals, no-console)
├── package.json                           # Root workspace configuration and scripts
├── present.md                             # Current project summary, localhost links, and milestone tracker
├── README.md                              # Project overview, prerequisites, and setup instructions
├── docs/
│   ├── api-specification.md               # API protocol, error envelope, and rate limiting specs
│   └── architecture.md                    # System architecture and domain intent overview
├── client/
│   ├── index.html                         # Mobile-first HTML viewport
│   ├── package.json                       # Client dependencies (React 18, Vite, Tailwind, Axios)
│   ├── postcss.config.js                  # Tailwind PostCSS runner
│   ├── tailwind.config.js                 # Tailwind CSS 3 content configuration
│   ├── vite.config.js                     # Vite dev proxy (/api -> localhost:5000)
│   └── src/
│       ├── App.jsx                        # Responsive health dashboard with live DB status
│       ├── index.css                      # Tailwind base, components, and utilities
│       ├── main.jsx                       # React root bootstrap
│       ├── components/.gitkeep            # UI component placeholders
│       ├── context/.gitkeep               # State management placeholders
│       ├── hooks/.gitkeep                 # Custom hook placeholders
│       ├── pages/.gitkeep                 # Route view placeholders
│       ├── services/
│       │   └── api.js                     # Configured Axios client instance
│       └── utils/.gitkeep                 # Client utility placeholders
└── server/
    ├── package.json                       # Server dependencies & scripts (Express, Mongoose, Zod, Pino)
    ├── scripts/
    │   └── syncIndexes.js                 # Database index synchronization CLI tool
    ├── storage/                           # Local attachment storage (gitignored)
    └── src/
        ├── app.js                         # Express application factory with ordered middleware pipeline
        ├── server.js                      # Startup bootstrap, DB initialization, graceful shutdown
        ├── config/
        │   ├── constants.js               # 17 frozen domain enums, ERROR_CODES, PAGINATION, Indian states
        │   ├── db.js                      # Mongoose connector, retry backoff, DNS SRV resolution
        │   └── env.js                     # Zod-validated environment configuration (AUTO_INDEX, TTL)
        ├── controllers/
        │   └── healthController.js        # Liveness (/health) and readiness (/health/ready) handlers
        ├── jobs/.gitkeep                  # Background worker placeholders
        ├── middleware/
        │   ├── errorHandler.js            # Central error mapper (Zod, Mongoose, JWT, 413, 500)
        │   ├── notFound.js                # 404 route fallback handler
        │   ├── rateLimiters.js            # Global, Auth, AI, and Upload rate limiters
        │   ├── requestId.js               # Safe X-Request-Id UUID generator and header echo
        │   ├── security.js                # Helmet CSP, CORS allowlist, Mongo sanitize, HPP
        │   └── validate.js                # Zod request validation with safe request assignment
        ├── models/
        │   ├── AuditLog.js                # Immutable audit events with pre-save scrub & TTL index
        │   ├── Claim.js                   # Scheme claim application model
        │   ├── Conversation.js            # Citizen conversation history model
        │   ├── Document.js                # Government schemes, acts, and circulars
        │   ├── DocumentChunk.js           # Text chunks with compound text index (AI hooks reserved)
        │   ├── DocumentPage.js            # Granular document page model
        │   ├── IngestionJob.js            # Asynchronous ingestion status tracking
        │   ├── Source.js                  # Government portal and gazette sources
        │   ├── User.js                    # Citizens and administrators with roles
        │   └── index.js                   # Barrel export for all 9 models
        ├── routes/
        │   ├── healthRoutes.js            # Health route definitions
        │   └── index.js                   # Root API router mounting /health
        ├── services/.gitkeep              # Business service layer placeholders
        ├── utils/
        │   ├── ApiError.js                # Custom operational error class
        │   ├── asyncHandler.js            # Promise-resolving route controller wrapper
        │   ├── logger.js                  # Pino logger + Pino-HTTP with secrets redaction
        │   ├── modelHelpers.js            # Shared toJSONPlugin for schema transformations
        │   └── response.js                # Unified sendSuccess, sendPaginated, sendError helpers
        └── validators/
            └── common.js                  # Shared Zod validators (objectId, pagination, trimmedString)
```

---

## 7. Security & Privacy Audit

1. **Credentials Management**:
   - The MongoDB Atlas URI remains exclusively in the local `.env` file.
   - Git tracking check confirmed `.env` is absent from git indexing (`git ls-files | Select-String "env"` lists only `.env.example` and `server/src/config/env.js`).
2. **Audit Log Privacy**:
   - The `AuditLog` schema enforces an automated pre-save sanitization routine that strips `password`, `token`, `secret`, `authorization`, and `creditCard` from any audit metadata.
   - `AuditLog` records automatically expire after 180 days via a MongoDB native TTL index, complying with privacy retention limits.
3. **AI Search Boundaries**:
   - `DocumentChunk` strictly utilizes MongoDB's native full-text index (`chunk_text_idx`) for keyword search.
   - No mock embeddings or uncalibrated vector fields are stored.

---

## 8. Next Actions & Instructions

Phase 3 is complete and ready to be committed to the repository:

```bash
git add .
git commit -m "feat(phase-3): mongoose models, text search index, and sync-indexes tooling"
```

To proceed to **Phase 4: Scheme Catalog Core & CRUD**, simply reply with:

> **`Phase 3 confirmed`**
