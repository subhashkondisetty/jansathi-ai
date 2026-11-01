# JanSathi AI — Project Progress & Architecture Status (`present.md`)

> **Event**: FORGE '26 — Theme 1: "Civic Pulse"  
> **Project**: JanSathi AI (Government-Information Assistant for Indian Citizens)  
> **Current Date**: November 1, 2026  
> **Current Milestone**: Phase 13 (Deployment + Documentation + AI Integration Checklist) — READY FOR DEPLOYMENT CONFIGURATION

---

## 1. Quick Access Links

| Service                            | URL                                                                              | Status     | Description                                                                   |
| :--------------------------------- | :------------------------------------------------------------------------------- | :--------- | :---------------------------------------------------------------------------- |
| **Frontend Client (Vite + React)** | [http://localhost:5173](http://localhost:5173)                                   | **LIVE**   | Citizen UI down to 360px viewport with Vite `/api` proxy                      |
| **Backend Server (Express API)**   | [http://localhost:5000](http://localhost:5000)                                   | **LIVE**   | Node 20+ Express server with security middleware pipeline                     |
| **Liveness Health Probe**          | [http://localhost:5000/api/health](http://localhost:5000/api/health)             | **200 OK** | Service uptime, ISO date, database connection check                           |
| **Readiness Health Probe**         | [http://localhost:5000/api/health/ready](http://localhost:5000/api/health/ready) | **200 OK** | Readiness verification checking MongoDB Atlas connectivity                    |
| **Public Meta Options & Limits**   | [http://localhost:5000/api/meta/options](http://localhost:5000/api/meta/options) | **200 OK** | Reference configuration arrays + upload limits (`maxUploadMb`, `maxPdfPages`) |
| **AI Capability Readiness Probe**  | [http://localhost:5000/api/ai/status](http://localhost:5000/api/ai/status)       | **200 OK** | AI readiness status check (connected: false, all feature flags false)         |
| **Keyword Search Endpoint**        | [http://localhost:5000/api/search](http://localhost:5000/api/search)             | **200 OK** | Full-text search with snippet extraction and visibility protection            |

---

## 2. Executive Summary

JanSathi AI is built on a production-grade, non-AI MERN monorepo foundation. In accordance with project architecture guidelines, all AI functionalities (LLM generation, vector embeddings, semantic search, RAG, multilingual translation, speech-to-text, and eligibility reasoning) are reserved for later phases through documented hook points that return `HTTP 501 NOT_IMPLEMENTED`. Absolutely zero fake, canned, or simulated AI data is permitted in the codebase.

Milestones completed to date:

- **Phase 1 (Monorepo Foundation)**: Workspaces, Vite proxy, Tailwind CSS 3, ESLint 9, Prettier, Express scaffolding (`309a4cc`).
- **Phase 2 (Server Core & Database Connection)**: MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, rate limiters, Zod validators (`60b0899`).
- **Phase 3 (Mongoose Models & Database Indexes)**: 9 domain schemas, 17 system enums, text search index, TTL audit log index, `syncIndexes.js` tooling (`6f7e073`).
- **Phase 4 (Authentication, Authorization & User Management)**: JWT HS256 pipeline, bcrypt password hashing, constant-time dummy comparisons, role-based access (`citizen`, `admin`), profile GET/PUT, audit logging, admin CLI (`d674275`).
- **Phase 5 (Source Management, Secure PDF Upload & Catalog Core)**: Complete official source CRUD (SSRF mitigation, private IP blocking), Multer disk storage, `%PDF-` magic-byte verification, SHA-256 deduplication, background `IngestionJob` queuing, catalog listing with safe regex escaping, public facets aggregation, and granular page access permissions (`35e281e`).
- **Phase 6 (Document Ingestion Pipeline & Background Processing)**: Background `IngestionRunner` daemon with atomic locking and concurrency bounding; `pdfjs-dist` text extraction; Cheerio HTML section parsing; `textCleaner` NFC normalization and de-hyphenation; `chunkingService` deterministic sentence chunking with overlap and denormalized metadata; bounded exponential backoff retries; admin source ingest trigger (`POST /api/admin/sources/:id/ingest`) and job management/retry endpoints (`/api/admin/ingestion-jobs`) (`b90c45a`).
- **Phase 7 (Retrieval Service, Conversation History & AI Hook Shells)**: Text retrieval swap point (`retrievalService`) with MongoDB textScore search, snippet generation, and visibility shielding; `GET /api/search` with privacy guarantees; user-scoped conversation history (`conversationService`, `/api/history`) with 200-message ceiling and audit logging; AI hook shells (`aiService`, `ragService`, `embeddingService`, `eligibilityService`, `verificationService`) returning standardized `501 NOT_IMPLEMENTED` with zero phantom records; complete AI response contract defined (`f9c903a`). Followed by comprehensive Step 2 security hardening (JWT secret length >= 32, production MONGODB_URI guard, globalLimiter health probe bypass, CastError parameter masking, and 11000 duplicate key privacy).

---

## 3. 13-Phase Milestone Roadmap

| Phase        | Milestone Name                          | Status                                 | Key Highlights                                                                                                                                                                                         |
| :----------- | :-------------------------------------- | :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1**  | **Monorepo Foundation**                 | **DONE & COMMITTED** (`309a4cc`)       | Workspaces (`client`, `server`), ESLint 9 flat config, Prettier, Vite, Tailwind CSS 3, Express scaffolding, `/api/health`                                                                              |
| **Phase 2**  | **Server Core & DB Integration**        | **DONE & COMMITTED** (`60b0899`)       | MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, Rate limiters, Zod validators, Readiness probe                                                                   |
| **Phase 3**  | **Mongoose Models & DB Indexes**        | **DONE & COMMITTED** (`6f7e073`)       | 9 domain models, 17 system enums, text search index, TTL audit log index, `npm run db:sync-indexes` tooling                                                                                            |
| **Phase 4**  | **Auth, Roles & User Management**       | **DONE & COMMITTED** (`d674275`)       | JWT HS256, bcryptjs, constant-time dummy hash, citizen registration/login, profile GET/PUT, admin CLI, audit logging                                                                                   |
| **Phase 5**  | **Source CRUD, Upload & Catalog**       | **DONE & COMMITTED** (`35e281e`)       | Multer upload, magic bytes, SHA-256 dedupe, catalog listing, facets aggregation, source CRUD, SSRF prevention                                                                                          |
| **Phase 6**  | **Document Ingestion Pipeline**         | **DONE & COMMITTED** (`b90c45a`)       | Background IngestionRunner, pdfjs extraction, HTML Cheerio parsing, NFC cleaner, chunking with overlap, bounded retries, job APIs                                                                      |
| **Phase 7**  | **Retrieval, History & AI Shells**      | **DONE & COMMITTED** (`f9c903a`)       | retrievalService text search swap point, GET /api/search, /api/history session management, AI hook shells (501), AI CONTRACT spec                                                                      |
| **Phase 8**  | **Frontend Foundation & Design**        | **DONE & VERIFIED**                    | React 18, React Router 6, Tailwind 3.4, accessible design system, AuthContext, OptionsContext, LanguageSelector, safe token storage, AdminRoute, honest civic placeholders                             |
| **Phase 9**  | **Document Library & PDF Viewer**       | **DONE (Manual Verification Pending)** | Citizen document search, filtering, pagination, extracted text reader (/pages), SHA-256 verification, multipart PDF upload with deduplication                                                          |
| **Phase 10** | **Conversational AI & Eligibility**     | **DONE (Manual Verification Pending)** | Multilingual AI-ready citizen pages (Assistant, Eligibility, Explainer, Verify) with HTTP 501 transparency and zero fake responses                                                                     |
| **Phase 11** | **Admin Control & Analytics Dashboard** | **DONE & VERIFIED**                    | Production admin interface: Dashboard, Documents, Jobs, Sources, Users, Analytics, System Status; 100% database-backed metrics                                                                         |
| **Phase 12** | **Tests & Security Hardening**          | **READY FOR USER MANUAL VERIFICATION** | 155 Vitest unit tests (14 suites), Zod ObjectId route parameter validation, path traversal defense, deep SSRF protection, CORS & rate limit hardening, zero secret leakage                             |
| **Phase 13** | **Deployment + Docs + AI Checklist**    | **READY FOR DEPLOYMENT CONFIGURATION** | Production config hardening, Vercel SPA rewrites (vercel.json), Atlas/Render/Vercel deployment runbooks, 5 docs (API, ARCHITECTURE, SECURITY, DEPLOYMENT, AI_INTEGRATION_CHECKLIST), 156 tests passing |

---

## 4. Phase 6 Architecture: Non-AI Ingestion Pipeline

### A. Background Ingestion Runner (`jobs/ingestionRunner.js`)

- Runs as an in-process background worker daemon without external queue dependencies (no Redis).
- Atomically claims queued jobs via `findOneAndUpdate` on `{ status: 'queued', nextRunAt: { $lte: new Date() } }` with `status: 'running'`, `lockedAt`, and attempt increments.
- Enforces concurrency bounds (`INGESTION_CONCURRENCY=1` default).
- On server startup, automatically scans for and recovers stale jobs stuck in `running` beyond `INGESTION_STALE_MINUTES=10`.
- Supports immediate proactive runner kicks (`ingestionRunner.kick()`) upon job enqueueing.
- Graceful shutdown handles in-flight jobs up to a 10-second timeout.

### B. Extraction & Ingestion Engine (`services/ingestionService.js`)

- Idempotent execution: purges existing `DocumentPage` and `DocumentChunk` records for the target document at the beginning of each attempt.
- PDF extraction (`services/pdfService.js`): Uses `pdfjs-dist` legacy build in Node with standard font mapping and worker isolation. Extracts line breaks based on vertical coordinate shifts and enforces `MAX_PDF_PAGES=300`.
- HTML extraction (`services/htmlService.js`): Parses pages via Cheerio, removes navigation/footer boilerplate, and partitions content into pages based on `h1`-`h3` section headers.
- Text cleaning (`services/textCleaner.js`): Preserves Indic scripts (Telugu, Devanagari, Tamil) via Unicode NFC normalization, strips unprintable control characters, de-hyphenates line-break Latin words, strips standalone page number lines, and conservatively eliminates headers/footers repeated on > 50% of pages in documents with at least 4 pages.
- Language identification (`utils/scriptDetect.js`): Determines language (`te`, `hi`, `ta`, `en`, or `unknown`) using Unicode block ratios.
- OCR evaluation: When > 80% of pages are empty, flags document as `needs_ocr` and job as `failed` with code `OCR_REQUIRED` when `ENABLE_OCR=false`.
- Storage optimization: Permanently unlinks stored temporary PDFs upon successful ingestion unless `KEEP_UPLOADED_FILES=true`.

### C. Chunking & Metadata Enrichment (`services/chunkingService.js`)

- Splits text across paragraph and sentence boundaries (including `.`, `!`, `?`, and Devanagari danda `।`).
- Packs sentences into target chunks (`CHUNK_TARGET_CHARS=1000`, `CHUNK_MAX_CHARS=1500`) with context overlap (`CHUNK_OVERLAP_CHARS=150`).
- Merges fragments (< 100 characters) into adjacent chunks.
- Denormalizes document metadata (title, authority, category, language, checksum, version) onto every chunk record for fast search retrieval without joins.

### D. Safe Source Fetching (`services/fetchService.js`)

- Connects only to active official sources.
- Custom DNS lookup enforces SSRF mitigation across IPv4, IPv6, loopback, link-local, and cloud metadata (`169.254.169.254`) ranges at the socket connection level.
- Restricts redirects to at most 3 hops within the pinned source hostname.
- Size ceiling caps streams at `MAX_FETCH_MB=25`.
- Captures `Last-Modified` HTTP headers and updates source fetch tracking.

### E. Bounded Retries & Administrative Controls

- Error classification separates transient retriable errors (network timeouts, 429, 5xx) from non-retriable failures (SSRF, corrupt PDF, encrypted PDF, OCR required).
- Retriable errors trigger exponential backoff ($5000 \times 2^{\text{attempt}-1} + \text{jitter}$) up to `INGESTION_MAX_ATTEMPTS=3`.
- Administrative APIs:
  - `POST /api/admin/sources/:id/ingest`: Trigger immediate background ingestion.
  - `GET /api/admin/ingestion-jobs`: Paginated listing with filtering and populated references.
  - `GET /api/admin/ingestion-jobs/:id`: Detailed job inspect endpoint.
  - `POST /api/admin/ingestion-jobs/:id/retry`: Manual retry for failed jobs (409 on non-failed).

---

## 5. Live Operational Status & Verification Matrix

Both development servers are active and connected in daemon mode:

- **Express Backend**: Listening on port `5000` (Node `--watch`)
- **Vite Frontend**: Serving on port `5173` (with dev proxy `/api` &rarr; `:5000`)
- **Database**: Connected to MongoDB Atlas cluster (`jansathi` database)

### Comprehensive Verification Matrix

| Test Suite / Target          | Verification Performed                        | Expected Result                                     | Actual Result                             | Status   |
| :--------------------------- | :-------------------------------------------- | :-------------------------------------------------- | :---------------------------------------- | :------- |
| **Unit Tests: ScriptDetect** | Vitest suite (`scriptDetect.test.js`)         | Accurate language classification (te, hi, ta)       | 25/25 tests passing                       | **PASS** |
| **Unit Tests: TextCleaner**  | Vitest suite (`textCleaner.test.js`)          | NFC normalisation, de-hyphenation, header trim      | All cleaning assertions passing           | **PASS** |
| **Unit Tests: Chunking**     | Vitest suite (`chunkingService.test.js`)      | Sentence split, overlap context, metadata copy      | Deterministic chunk bounds verified       | **PASS** |
| **Upload Pipeline**          | Upload text PDF via citizen account           | Queued &rarr; Running &rarr; Succeeded &rarr; Ready | Document ready, pageCount=1, chunkCount=1 | **PASS** |
| **Page Retrieval**           | `GET /api/documents/:id/pages`                | 200 OK with extracted page array                    | Extracted text verified                   | **PASS** |
| **Scanned PDF Evaluation**   | Upload empty/scanned PDF (`ENABLE_OCR=false`) | Fails with `OCR_REQUIRED`, doc `needs_ocr`          | Document status updated to `needs_ocr`    | **PASS** |
| **Admin Jobs Listing**       | `GET /api/admin/ingestion-jobs?status=failed` | 200 OK with paginated failed jobs                   | Found and populated jobs                  | **PASS** |
| **Manual Job Retry**         | `POST /api/admin/ingestion-jobs/:id/retry`    | 200 OK, job requeued, document pending              | State reset, attempts set to 0            | **PASS** |
| **Invalid Retry Attempt**    | Retry succeeded job                           | 409 CONFLICT                                        | Rejected with 409 CONFLICT                | **PASS** |
| **SSRF Source Block**        | Create source with `169.254.169.254`          | 400 VALIDATION_ERROR                                | Rejected before creation                  | **PASS** |
| **Unreachable Source Retry** | Trigger ingest for `https://example.invalid`  | Bounded retry scheduled with exponential delay      | Recorded attempt=1, nextRunAt scheduled   | **PASS** |
| **Code Style & Format**      | `npm run format:check`                        | Prettier compliance across all files                | All files match Prettier code style       | **PASS** |
| **Static Code Analysis**     | `npm run lint`                                | ESLint 9 zero errors/warnings                       | 0 errors, 0 warnings                      | **PASS** |

---

## 6. Complete Codebase Inventory

```
jansathi-ai/
├── .editorconfig                          # Global 2-space indentation & LF line endings
├── .env                                   # Root environment file (gitignored, contains Atlas URI & JWT secret)
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
│   ├── api-specification.md               # API protocol, error envelope, and endpoint specifications
│   └── architecture.md                    # System architecture, pipeline diagrams, and retry specifications
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
    ├── package.json                       # Server dependencies & scripts (Express, Mongoose, Zod, Pino, Multer, pdfjs, cheerio)
    ├── vitest.config.js                   # Vitest unit test runner configuration
    ├── scripts/
    │   ├── createAdmin.js                 # Admin provisioning and promotion CLI script
    │   └── syncIndexes.js                 # Database index synchronization CLI tool
    ├── storage/                           # Local attachment storage (gitignored)
    │   └── uploads/                       # Document storage directory
    │       └── tmp/                       # Staging directory for Multer uploads
    ├── tests/
    │   └── unit/
    │       ├── chunkingService.test.js    # Unit tests for chunk bounds, overlap, sentence splitting
    │       ├── scriptDetect.test.js       # Unit tests for Indic and English script detection
    │       └── textCleaner.test.js        # Unit tests for NFC normalization and de-hyphenation
    └── src/
        ├── app.js                         # Express application factory with ordered middleware pipeline
        ├── server.js                      # Startup bootstrap, DB initialization, IngestionRunner lifecycle
        ├── config/
        │   ├── constants.js               # 17 frozen domain enums, ERROR_CODES, PAGINATION, Indian states
        │   ├── db.js                      # Mongoose connector, retry backoff, DNS SRV resolution
        │   └── env.js                     # Zod-validated environment configuration (Ingestion vars included)
        ├── controllers/
        │   ├── adminController.js         # Admin session verification handler
        │   ├── authController.js          # Citizen registration and login handlers
        │   ├── documentController.js      # PDF upload, document listing, facets, and lifecycle handlers
        │   ├── healthController.js        # Liveness (/health) and readiness (/health/ready) handlers
        │   ├── ingestionController.js     # Admin IngestionJob tracking, inspection, and manual retry handlers
        │   ├── metaController.js          # Metadata options handler (/meta/options) with upload limits
        │   ├── sourceController.js        # Admin source CRUD and ingestion trigger handlers
        │   └── userController.js          # User profile retrieval and update handlers
        ├── jobs/
        │   └── ingestionRunner.js         # Background worker claiming jobs, atomic locking, stale recovery
        ├── middleware/
        │   ├── auth.js                    # JWT Bearer token authentication & user hydration middleware
        │   ├── authorize.js               # Role-based access control middleware (requireRole)
        │   ├── errorHandler.js            # Central error mapper (Zod, Mongoose, JWT, 413, 415, 500)
        │   ├── notFound.js                # 404 route fallback handler
        │   ├── rateLimiters.js            # Global, Auth, AI, and Upload rate limiters
        │   ├── requestId.js               # Safe X-Request-Id UUID generator and header echo
        │   ├── security.js                # Helmet CSP, CORS allowlist, Mongo sanitize, HPP
        │   ├── upload.js                  # Multer disk staging + PDF %PDF- magic-byte verification
        │   └── validate.js                # Zod request validation with safe request assignment
        ├── models/
        │   ├── AuditLog.js                # Immutable audit events with pre-save scrub & TTL index
        │   ├── Claim.js                   # Scheme claim application model
        │   ├── Conversation.js            # Citizen conversation history model
        │   ├── Document.js                # Government schemes, acts, circulars, storage & dedupe index
        │   ├── DocumentChunk.js           # Text chunks with compound text index (AI hooks reserved)
        │   ├── DocumentPage.js            # Granular document page model
        │   ├── IngestionJob.js            # Asynchronous ingestion status tracking
        │   ├── Source.js                  # Government portal and gazette sources
        │   ├── User.js                    # Citizens and administrators with roles
        │   └── index.js                   # Barrel export for all 9 models
        ├── routes/
        │   ├── adminRoutes.js             # Protected admin router (/sources, /documents, /ingestion-jobs)
        │   ├── authRoutes.js              # Authentication router (/api/auth/register, /api/auth/login)
        │   ├── documentRoutes.js          # Document catalog router (/upload, /facets, /:id, /pages)
        │   ├── healthRoutes.js            # Health route definitions
        │   ├── index.js                   # Root API router mounting all modular routers
        │   ├── metaRoutes.js              # Metadata router (/api/meta/options)
        │   └── userRoutes.js              # Protected user profile router (/api/users/profile)
        ├── services/
        │   ├── auditService.js            # Zero-throw tamper-evident audit logging service
        │   ├── authService.js             # Bcrypt hashing, constant-time dummy comparisons & JWT tokens
        │   ├── chunkingService.js         # Text chunking, sentence splitting, context overlap
        │   ├── documentService.js         # PDF upload, dedupe, catalog listing, facets & lifecycle
        │   ├── fetchService.js            # Safe source fetching, custom DNS lookup, SSRF prevention
        │   ├── fileStorageService.js      # Secure disk storage, path resolution, UUID names, readFile
        │   ├── htmlService.js             # Cheerio HTML section and heading parsing
        │   ├── ingestionQueueService.js   # Background IngestionJob creation & runner kicking
        │   ├── ingestionService.js        # Full ingestion orchestration, extraction, cleaning, chunking
        │   ├── ocrService.js              # Optional experimental OCR fallback
        │   ├── pdfService.js              # pdfjs-dist line-ordered extraction & page metadata
        │   ├── sourceService.js           # Source CRUD, SSRF prevention, URL normalization
        │   ├── textCleaner.js             # NFC normalization, control char stripping, de-hyphenation
        │   └── userService.js             # User registration, login, and profile business logic
        ├── utils/
        │   ├── ApiError.js                # Custom operational error class
        │   ├── asyncHandler.js            # Promise-resolving route controller wrapper
        │   ├── checksum.js                # File and buffer SHA-256 hash calculator
        │   ├── logger.js                  # Pino logger + Pino-HTTP with secrets redaction
        │   ├── modelHelpers.js            # Shared toJSONPlugin for schema transformations
        │   ├── response.js                # Unified sendSuccess, sendPaginated, sendError helpers
        │   ├── safeFilename.js            # Sanitizes filenames and extracts clean document titles
        │   ├── scriptDetect.js            # Unicode script frequency language detector
        │   └── storage.js                 # Storage utilities
        └── validators/
            ├── authValidators.js          # Zod validation schemas for register & login
            ├── common.js                  # Shared Zod validators (objectId, pagination, trimmedString)
            ├── documentValidators.js      # Zod validation schemas for upload, list, pages & patch
            ├── ingestionValidators.js     # Zod validation schemas for ingestion job querying & retries
            ├── sourceValidators.js        # Zod validation schemas for source CRUD & SSRF prevention
            └── userValidators.js          # Zod validation schemas for user profile updates
```

---

## 7. Security & Privacy Audit

1. **Worker Isolation & Concurrency**:
   - Background worker utilizes atomic document updates (`findOneAndUpdate`) with `lockedAt` timestamps. No two workers can ever claim the same job.
   - Concurrency is bounded to `INGESTION_CONCURRENCY` to protect server CPU and memory.
2. **SSRF Mitigation at Socket Level**:
   - `fetchService` resolves DNS prior to opening TCP connections and rejects private/loopback/link-local/cloud-metadata addresses.
   - Redirects are capped at 3 hops and pinned strictly to the initial source hostname.
3. **Data Integrity & Confidentiality**:
   - Temporary PDF upload files are purged from disk upon successful extraction unless `KEEP_UPLOADED_FILES=true`.
   - Extracted document text is never printed to logs; logs contain only identifiers, stage names, counts, and execution durations.
4. **Resilient Retry Policy**:
   - Transient failures back off exponentially with random jitter up to 3 attempts.
   - Non-retriable failures (corrupt PDF, password-protected PDF, SSRF violation) fail immediately without consuming worker cycles.

---

## 8. Milestone Status & Verification

Phase 11 (Admin Panel + Analytics) implementation and automated verification are complete. The administrative interface is fully operational and grounded strictly in verified backend APIs:

1. **Dedicated Administrative Shell**: Responsive sidebar (`AdminSidebar`), top navigation (`AdminHeader`) with citizen portal return switcher, mobile drawer support, and accessible layout (`AdminLayout`) guarded by verified `/api/admin/session` token and admin role check (`AdminRoute`).
2. **Authentic Database-Backed Telemetry**:
   - Total document counts query `GET /api/documents?scope=all` with `limit=1` pagination metadata (`meta.total`) without excessive downloading.
   - Public-ready facets (`GET /api/documents/facets`) are clearly labeled and separated from overall corpus counts.
   - Ingestion jobs query `GET /api/admin/ingestion-jobs` across all supported statuses (`queued`, `running`, `succeeded`, `failed`, `skipped_duplicate`).
   - Official sources query `GET /api/admin/sources` with active/inactive counts.
   - Honest user management disclosure on `AdminUsersPage` clearly explaining API unavailability with zero fake user records.
   - Genuine system telemetry on `AdminSystemStatusPage` probing `/api/health`, `/api/health/ready`, and `/api/ai/status`.
3. **Operational Capabilities**:
   - Single-click manual retry for failed ingestion jobs (`POST /api/admin/ingestion-jobs/:id/retry`) with 409 conflict handling and real state refresh.
   - Document metadata editorial updates (`PATCH /api/admin/documents/:id`) and deletion (`DELETE /api/documents/:id`) with non-optimistic confirmation dialogs.
   - Official source creation and editing validated against backend Zod schema (`sourceUrlSchema`) with active status toggling and manual crawl triggers (`POST /api/admin/sources/:id/ingest`).
4. **Multilingual Localization**: Complete native translations across English (`en`), Telugu (`te`), Hindi (`hi`), and Tamil (`ta`).
5. **Strict Scope Discipline**: Zero backend source files were modified in Phase 11. All 74 Vitest tests pass, ESLint reports 0 errors and 0 warnings, Prettier passes, and the Vite production build succeeds cleanly.

---

## 9. Phase 12 Architecture: Tests + Security Hardening

> **Milestone Status**: `READY FOR USER MANUAL VERIFICATION`  
> **Automated Test Results**: 155/155 passed across 14 Vitest suites (0 failing)  
> **Regression Verification**: `eslint .` (0 errors, 0 warnings), `prettier --check .` (100% compliant), `vite build` (6.21s clean build)  
> **Manual Verification Note**: Phase 9 and Phase 10 manual verification remain pending as designated. Phase 11 is verified. Phase 12 is ready for user manual verification.

### A. Security Audit & Concrete Remediation

1. **Route Parameter Validation for MongoDB ObjectIds (`SEC-01`)**:
   - Gaps identified: `GET /api/documents/:id`, `GET /api/documents/:id/pages`, `DELETE /api/documents/:id`, `GET/PUT/PATCH/DELETE /api/admin/sources/:id`, and `PATCH /api/admin/documents/:id` lacked Zod parameter schemas, allowing malformed IDs to hit Mongoose directly and cause `CastError`.
   - Fix implemented: Added `documentIdParamSchema` in `documentValidators.js` and `sourceIdParamSchema` in `sourceValidators.js` using `common.objectId`. Applied `validate({ params: ... })` across all routes. All parameterized endpoints now reject malformed ObjectIds with HTTP 400 `VALIDATION_ERROR` before controller logic runs.
2. **Deep SSRF Defense Expansion (`SEC-02`)**:
   - Expanded `isDisallowedHostname` in `sourceValidators.js` to unconditionally reject:
     - Localhost and loopback: `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, `::`.
     - Cloud metadata: `169.254.169.254`, `metadata.google.internal`, `instance-data`.
     - IPv6 link-local and unique-local: `fe80:`, `fc00:`, `fd` (with colons).
     - IPv4-mapped IPv6: `::ffff:`.
     - IPv4 private, loopback, link-local, carrier-grade NAT (`100.64.0.0/10`), and multicast/reserved (`>= 224`).
   - Network layer defense (`fetchService.js`): Socket-level DNS lookup (`createSafeLookup`) inspects every resolved IP against `isDisallowedIp` before opening TCP connections. Hostname pinning blocks cross-domain redirects, max redirects is capped at 3, and byte size is capped at 25MB.
3. **Path Traversal Protection (`SEC-03`)**:
   - Hardened `resolveSafePath` in `fileStorageService.js` to immediately detect and reject directory separators (`/`, `\\`) and traversal sequences (`..`) in stored file names with HTTP 400 `VALIDATION_ERROR`.
4. **Secret Hygiene & Error Data Masking (`SEC-04`)**:
   - Verified that production error handler suppresses raw stack traces, masks internal 500 error messages to `'Internal server error'`, masks CastError input values, and suppresses MongoDB 11000 duplicate keys without leaking user email.
   - Verified that Vite production client bundle contains zero leaked database connection URIs, JWT secrets, or environment credentials.

### B. Comprehensive Vitest Test Suite (155 Tests across 14 Suites)

| Suite File                         | Tests | Focus Area & Verified Contracts                                                                                                                                                                                                     |
| :--------------------------------- | :---- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authHardening.test.js`            | 23    | Password/email schemas, registration strictness (rejects mass-assignment `role`), JWT expiry (`TOKEN_EXPIRED`), invalid signatures, missing tokens, inactive user accounts, and `requireRole` authorization gating                  |
| `documentSecurity.test.js`         | 21    | `documentIdParamSchema` validation, `%PDF-` magic-byte verification (415 on non-PDF with temp file deletion), path traversal prevention (`resolveSafePath`, `sanitizeOriginalFilename`), metadata constraints, and ownership gating |
| `adminOperationsHardening.test.js` | 18    | `sourceIdParamSchema` validation, `retryIngestionJob` status gating (409 on non-failed jobs), inactive source ingest block (400), and deep SSRF defenses (cloud metadata, private IPs, IPv4-mapped IPv6)                            |
| `healthAndAiContracts.test.js`     | 11    | `/api/health` 200 liveness, `/api/health/ready` 200/503 readiness, `isHealthCheckRequest` rate limiting skip logic without false positives, and AI 501 `NOT_IMPLEMENTED` contracts                                                  |
| `errorSanitization.test.js`        | 8     | CastError input masking, 11000 duplicate key privacy, production 500 message masking, 501 contract preservation, and CORS policy enforcement                                                                                        |
| `apiContractCorrections.test.js`   | 12    | `sendPaginated` empty bounds, validation error details `{ field, message }`, envSchema validation, upload errors                                                                                                                    |
| `chunkingService.test.js`          | 11    | Sentence splitting, overlap context, metadata propagation                                                                                                                                                                           |
| `textCleaner.test.js`              | 14    | NFC normalization, control character stripping, de-hyphenation                                                                                                                                                                      |
| `scriptDetect.test.js`             | 25    | Indic (te, hi, ta) and English script detection                                                                                                                                                                                     |
| `aiShells.test.js`                 | 5     | Service-level 501 `NotImplementedError` throwing                                                                                                                                                                                    |
| `aiValidators.test.js`             | 3     | AI request schema validations                                                                                                                                                                                                       |
| `historyValidators.test.js`        | 2     | Conversation history schemas                                                                                                                                                                                                        |
| `retrievalSnippet.test.js`         | 1     | Retrieval search snippet extraction                                                                                                                                                                                                 |
| `searchValidators.test.js`         | 1     | Search query validation                                                                                                                                                                                                             |

---

## 10. Phase 13 Architecture: Deployment, Documentation & AI Integration Handover

### A. Executive Milestone Summary

Phase 13 completes the final non-AI foundation milestone of JanSathi AI. It prepares the monorepo for production deployment across Render, Vercel, and MongoDB Atlas, fortifies production configuration validation, establishes complete and verified technical documentation, and provides an actionable engineering handover checklist for future AI enablement while strictly maintaining non-AI governance.

### B. Production Configuration & Deployment Hardening

1. **JWT Secret Guard in Production**: Enhanced `server/src/config/env.js` `superRefine` validation to strictly reject known development secrets (`jansathi-development-secret-jwt-key-2026`, `dev-secret-change-me`) when `NODE_ENV === 'production'`.
2. **Standardized Environment Templates**: Created safe `.env.example` templates at root, `client/.env.example`, and `server/.env.example` with zero exposed credentials, instructions on generating cryptographically secure 32+ character hex secrets, and secure MongoDB Atlas configuration instructions.
3. **MongoDB Atlas Network Security**: Documented policy restricting network access to known application egress IPs or private networking (AWS VPC Peering / PrivateLink). Clarified dynamic egress IP limitations on shared PaaS tiers and explicitly noted that strong passwords never make unrestricted network access safe.
4. **Render npm Workspace Configuration**: Verified that Render must be deployed from the repository root (Root Directory: `.`) with `npm ci --workspace=server --include-workspace-root` and start command `npm run start` to preserve the authoritative root `package-lock.json`.
5. **Health Check Architecture**: Documented liveness (`/api/health`) versus readiness (`/api/health/ready`), recommending `/api/health/ready` for Render's zero-downtime deployment health check to ensure traffic is only routed after MongoDB connection is confirmed.
6. **Safer Admin Provisioning**: Documented password injection procedure using `read -s` to prevent secret leakage in `.bash_history` and process listings.
7. **Vercel SPA Routing Configuration**: Created `client/vercel.json` with clean URL rewrites routing all SPA paths (`/`, `/documents`, `/assistant`, `/eligibility`, `/explainer`, `/verify`, `/admin/*`) to `/index.html` while preserving direct access to `/assets/*` and file extensions.

### C. Complete Technical Documentation Suite

1. **[`README.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/README.md)**: Comprehensive project overview, problem statement, features, architecture, monorepo directory tree, local setup, development commands, test execution, API overview, and deployment summary.
2. **[`docs/ARCHITECTURE.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/ARCHITECTURE.md)**: Verified system architecture, client contexts and route guards, backend middleware pipeline, 9 Mongoose data schemas, entity-relationship diagrams, IngestionRunner state machine, and error handling architecture.
3. **[`docs/API.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/API.md)**: Authoritative API reference documenting every implemented route, authentication/authorization requirements, request schemas, response envelopes, standard error codes, and HTTP 501 AI contract shells.
4. **[`docs/SECURITY.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/SECURITY.md)**: Threat model and security reference covering bcrypt hashing (12 rounds), constant-time dummy comparisons, HS256 JWT lifecycle, RBAC, Zod validation, PDF magic bytes (`%PDF-`), temporary storage cleanup, path traversal prevention, deep SSRF defense, CORS allowlist, Helmet CSP, and Pino redaction.
5. **[`docs/DEPLOYMENT.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/DEPLOYMENT.md)**: Step-by-step production runbooks for MongoDB Atlas, Render backend web service, and Vercel frontend, including health checks, post-deployment smoke tests, and rollback procedures.
6. **[`docs/AI_INTEGRATION_CHECKLIST.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/AI_INTEGRATION_CHECKLIST.md)**: Practical engineering handover guide for future AI enablement covering hybrid retrieval, dense embeddings, grounded RAG, deterministic criteria tables, stance classification, prompt injection defenses, PII filtering, circuit breakers, and "AI-Day" feature flag activation.

### D. Automated Quality Gates Status

- **Backend Vitest Unit Tests**: 156 passed across 14 test suites in `server` workspace (100% pass rate in < 2.0s).
- **Frontend Verification**: Clean Vite production build in 5.17s; 0 ESLint errors/warnings; 100% Prettier compliance across all client source files. (Zero automated frontend unit test runner configured; client UI tested via browser).
- **ESLint**: 0 errors, 0 warnings across all workspaces.
- **Prettier**: 100% code style compliance.
- **Secret Hygiene**: Zero database URIs, JWT secrets, or cloud credentials in build output or logs.
- **AI Endpoints**: All AI endpoints (`/api/ai/ask`, `/api/ai/eligibility`, `/api/verify/claim`) strictly return HTTP 501 `NOT_IMPLEMENTED`.

### E. Manual Verification Tracking Across All Phases

| Phase     | Title                                      | Status           | Manual Verification State                                                            |
| :-------- | :----------------------------------------- | :--------------- | :----------------------------------------------------------------------------------- |
| Phase 1–7 | Server Core, Schemas, Ingestion, AI Shells | Done & Committed | Automated verification complete; committed in early milestones.                      |
| Phase 8   | Frontend Foundation & Design System        | Done & Verified  | Automated verification complete; verified.                                           |
| Phase 9   | Document Library & Extracted Text Reader   | Done             | Automated verification complete; **User Manual Verification Pending**.               |
| Phase 10  | AI-Ready Citizen Pages (501 UI)            | Done             | Automated verification complete; **User Manual Verification Pending**.               |
| Phase 11  | Admin Panel & Analytics Dashboard          | Done & Verified  | Automated & manual verification verified.                                            |
| Phase 12  | Tests & Security Hardening                 | Done             | Automated verification complete (155 tests); **Ready for User Manual Verification**. |
| Phase 13  | Deployment + Docs + AI Checklist           | Done             | Automated verification complete (156 tests); **Ready for Deployment Configuration**. |
