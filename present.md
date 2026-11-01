# JanSathi AI — Project Progress & Architecture Status (`present.md`)

> **Event**: FORGE '26 — Theme 1: "Civic Pulse"  
> **Project**: JanSathi AI (Government-Information Assistant for Indian Citizens)  
> **Current Date**: November 1, 2026  
> **Current Milestone**: Phase 1, Phase 2, Phase 3, Phase 4 & Phase 5 Complete, Verified & Live Against MongoDB Atlas

---

## 1. Quick Access Links

| Service                            | URL                                                                              | Status     | Description                                                                   |
| :--------------------------------- | :------------------------------------------------------------------------------- | :--------- | :---------------------------------------------------------------------------- |
| **Frontend Client (Vite + React)** | [http://localhost:5173](http://localhost:5173)                                   | **LIVE**   | Citizen UI down to 360px viewport with Vite `/api` proxy                      |
| **Backend Server (Express API)**   | [http://localhost:5000](http://localhost:5000)                                   | **LIVE**   | Node 20+ Express server with security middleware pipeline                     |
| **Liveness Health Probe**          | [http://localhost:5000/api/health](http://localhost:5000/api/health)             | **200 OK** | Service uptime, ISO date, database connection check                           |
| **Readiness Health Probe**         | [http://localhost:5000/api/health/ready](http://localhost:5000/api/health/ready) | **200 OK** | Readiness verification checking MongoDB Atlas connectivity                    |
| **Public Meta Options & Limits**   | [http://localhost:5000/api/meta/options](http://localhost:5000/api/meta/options) | **200 OK** | Reference configuration arrays + upload limits (`maxUploadMb`, `maxPdfPages`) |

---

## 2. Executive Summary

JanSathi AI is built on a production-grade, non-AI MERN monorepo foundation. In accordance with project architecture guidelines, all AI functionalities (LLM generation, vector embeddings, semantic search, RAG, multilingual translation, speech-to-text, and eligibility reasoning) are reserved for later phases through documented hook points that return `HTTP 501 NOT_IMPLEMENTED`. Absolutely zero fake, canned, or simulated AI data is permitted in the codebase.

Milestones completed to date:

- **Phase 1 (Monorepo Foundation)**: Workspaces, Vite proxy, Tailwind CSS 3, ESLint 9, Prettier, Express scaffolding (`309a4cc`).
- **Phase 2 (Server Core & Database Connection)**: MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, rate limiters, Zod validators (`60b0899`).
- **Phase 3 (Mongoose Models & Database Indexes)**: 9 domain schemas, 17 system enums, text search index, TTL audit log index, `syncIndexes.js` tooling (`6f7e073`).
- **Phase 4 (Authentication, Authorization & User Management)**: JWT HS256 pipeline, bcrypt password hashing, constant-time dummy comparisons, role-based access (`citizen`, `admin`), profile GET/PUT, audit logging, admin CLI (`d674275`).
- **Phase 5 (Source Management, Secure PDF Upload & Catalog Core)**: Complete official source CRUD (SSRF mitigation, private IP blocking), Multer disk storage, `%PDF-` magic-byte verification, SHA-256 deduplication, background `IngestionJob` queuing, catalog listing with safe regex escaping, public facets aggregation, and granular page access permissions.

---

## 3. 13-Phase Milestone Roadmap

| Phase       | Milestone Name                    | Status                           | Key Highlights                                                                                                                       |
| :---------- | :-------------------------------- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1** | **Monorepo Foundation**           | **DONE & COMMITTED** (`309a4cc`) | Workspaces (`client`, `server`), ESLint 9 flat config, Prettier, Vite, Tailwind CSS 3, Express scaffolding, `/api/health`            |
| **Phase 2** | **Server Core & DB Integration**  | **DONE & COMMITTED** (`60b0899`) | MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, Rate limiters, Zod validators, Readiness probe |
| **Phase 3** | **Mongoose Models & DB Indexes**  | **DONE & COMMITTED** (`6f7e073`) | 9 domain models, 17 system enums, text search index, TTL audit log index, `npm run db:sync-indexes` tooling                          |
| **Phase 4** | **Auth, Roles & User Management** | **DONE & COMMITTED** (`d674275`) | JWT HS256, bcryptjs, constant-time dummy hash, citizen registration/login, profile GET/PUT, admin CLI, audit logging                 |
| **Phase 5** | **Source CRUD, Upload & Catalog** | **DONE & COMMITTED** (`35e281e`) | Multer upload, magic bytes, SHA-256 dedupe, catalog listing, facets aggregation, source CRUD, SSRF prevention                        |
| Phase 6     | Document Ingestion Pipeline       | Pending                          | PDF/HTML text extraction, section chunking, ingestion queue worker                                                                   |
| Phase 7     | Admin Governance & Review         | Pending                          | Document review, audit logs, scheme approval workflows                                                                               |
| Phase 8     | Citizen Portal UI                 | Pending                          | Scheme discovery, filtering, bookmarking, mobile-first design                                                                        |
| Phase 9     | AI Hook Architecture (Stubs)      | Pending                          | 501 NOT_IMPLEMENTED contracts for RAG, embeddings, and chat                                                                          |
| Phase 10    | Notifications & Civic Alerts      | Pending                          | Circulars, acts, notifications feeds, urgency tags                                                                                   |
| Phase 11    | Multilingual Meta Framework       | Pending                          | Language enums (`en`, `te`, `hi`, `ta`), UI localization scaffolding                                                                 |
| Phase 12    | Eligibility Checklist Engine      | Pending                          | Deterministic non-AI rule evaluator for scheme eligibility                                                                           |
| Phase 13    | Final Polish & Production Deploy  | Pending                          | Render/Atlas production build, Docker, demo script                                                                                   |

---

## 4. Phase 5 Architecture: Source Management & Document Storage

### A. Source Management (`services/sourceService.js`)

- Full administrative CRUD for official government portals (`POST`, `GET`, `PUT`, `DELETE /api/admin/sources`).
- SSRF prevention: Rejects URLs with embedded credentials (`user:pass@`), `localhost`, and IP literals in private/loopback/link-local ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`).
- Referential integrity: Prevents deletion or URL modification of sources that have associated documents (`409 CONFLICT`).

### B. Secure PDF Ingestion Pipeline (`services/documentService.js`, `middleware/upload.js`)

1. **Multipart Handling**: Multer streams file to `STORAGE_DIR/tmp` under temporary random names.
2. **Magic-Byte Inspection**: Reads first 1024 bytes to verify `%PDF-` header. Deletes file and returns `415 UNSUPPORTED_MEDIA_TYPE` if corrupted or spoofed (e.g. `.txt` renamed to `.pdf`).
3. **Cryptographic Checksumming**: Streams file into SHA-256 digest via `crypto.createHash('sha256')`.
4. **Deduplication Engine**:
   - `scopeKey`: `'public'` for public documents, `'user:<id>'` for private citizen uploads.
   - If duplicate found in `pending`/`processing`/`ready`: deletes temp file, returns `200 OK` with existing document.
   - If citizen uploads identical public document: returns `200 OK` with `{ duplicate: true, reason: 'already_in_library' }`.
   - If existing document is `failed`/`needs_ocr`: reuses document record, moves new file, resets status to `pending`, and queues fresh `IngestionJob` (`202 Accepted`).
5. **Path Traversal Protection**: Final stored names are strictly `crypto.randomUUID() + '.pdf'`. Paths are resolved and verified against `STORAGE_DIR`. Original client filename is sanitized (control chars and path separators stripped) and used only for display.
6. **Ingestion Job Queuing**: Creates `IngestionJob` with `type: 'upload'`, `status: 'queued'`, `stage: 'queued'`.

### C. Catalog Queries & Access Control

- **Scoping**:
  - `scope=library`: Public ready documents.
  - `scope=mine`: User's own uploads (all statuses).
  - `scope=all`: Admin only (rejection `403 FORBIDDEN` for citizens).
- **Regex Safety**: All substring search inputs (`q`) are escaped using `escapeRegex` to prevent ReDoS.
- **Privacy Enforcement**:
  - Citizens requesting another user's private document receive `404 NOT_FOUND` (preventing document ID enumeration).
  - Admins querying private documents receive sanitized metadata only (`storage` filename and extraction text omitted).
  - Admins querying `/documents/:id/pages` for private citizen documents receive `403 FORBIDDEN` (admins cannot inspect private citizen pages).

---

## 5. Live Operational Status & Verification Matrix

Both development servers are active and connected in daemon mode:

- **Express Backend**: Listening on port `5000` (Node `--watch`)
- **Vite Frontend**: Serving on port `5173` (with dev proxy `/api` &rarr; `:5000`)
- **Database**: Connected to MongoDB Atlas cluster (`jansathi` database)

### Comprehensive Verification Matrix

| Test Suite / Target          | Verification Performed                                 | Expected Result                        | Actual Result                                  | Status   |
| :--------------------------- | :----------------------------------------------------- | :------------------------------------- | :--------------------------------------------- | :------- |
| **Source Creation**          | `POST /api/admin/sources`                              | 201 Created with valid URL             | Returns `201 Created` with source document     | **PASS** |
| **Duplicate Source URL**     | `POST /api/admin/sources` duplicate URL                | 409 CONFLICT                           | Returns 409 `CONFLICT`                         | **PASS** |
| **SSRF Localhost Block**     | `POST /api/admin/sources` with `http://localhost:8080` | 400 VALIDATION_ERROR                   | Rejected before database query                 | **PASS** |
| **Source Status Toggle**     | `PATCH /api/admin/sources/:id/status`                  | 200 OK with `isActive: false`          | Updated and verified                           | **PASS** |
| **Upload Wrong Field**       | `POST /api/documents/upload` with field `document`     | 400 VALIDATION_ERROR                   | Returns 400 with field message                 | **PASS** |
| **Magic Byte Failure**       | Upload `.txt` file renamed to `.pdf`                   | 415 UNSUPPORTED_MEDIA_TYPE             | File deleted from temp, returned 415           | **PASS** |
| **Public Doc Validation**    | Admin uploads public doc without issuingAuthority      | 400 VALIDATION_ERROR                   | Rejected with required field list              | **PASS** |
| **Citizen PDF Upload**       | Citizen uploads valid PDF                              | 202 Accepted, pending doc + queued job | Document and IngestionJob created              | **PASS** |
| **Checksum Deduplication**   | Upload same PDF file again                             | 200 OK `{ duplicate: true, document }` | Returns original document                      | **PASS** |
| **Admin Public Upload**      | Admin uploads complete public document                 | 202 Accepted with public visibility    | Document and IngestionJob created              | **PASS** |
| **Regex Query Safety**       | `GET /api/documents?q=(.*`                             | 200 OK without regex errors            | Safely escaped, returns results                | **PASS** |
| **Private Doc Isolation**    | Citizen 2 requests Citizen 1's private doc             | 404 NOT_FOUND                          | Returns 404 (prevents enumeration)             | **PASS** |
| **Admin Private Inspection** | Admin requests Citizen 1's private doc                 | 200 OK metadata only                   | Metadata returned, file details scrubbed       | **PASS** |
| **Private Pages Protection** | Admin requests Citizen 1's private doc pages           | 403 FORBIDDEN                          | Access denied (admin cannot read private text) | **PASS** |
| **Owner Pages Retrieval**    | Citizen 1 requests own document pages                  | 200 OK with page list                  | Returns page array with pagination meta        | **PASS** |
| **Document Deletion**        | Owner deletes own document                             | 200 OK, stored file unlinked           | File removed from disk, pages/chunks purged    | **PASS** |
| **Metadata Options Limits**  | `GET /api/meta/options`                                | 200 OK with `limits` object            | Returns `maxUploadMb: 10`, `maxPdfPages: 300`  | **PASS** |
| **Source Deletion**          | `DELETE /api/admin/sources/:id`                        | 200 OK `{ deleted: true }`             | Source deleted cleanly                         | **PASS** |
| **Code Style & Format**      | `npm run format:check`                                 | Prettier compliance across all files   | All files match Prettier code style            | **PASS** |
| **Static Code Analysis**     | `npm run lint`                                         | ESLint 9 zero errors/warnings          | 0 errors, 0 warnings                           | **PASS** |

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
    ├── package.json                       # Server dependencies & scripts (Express, Mongoose, Zod, Pino, Multer)
    ├── scripts/
    │   ├── createAdmin.js                 # Admin provisioning and promotion CLI script
    │   └── syncIndexes.js                 # Database index synchronization CLI tool
    ├── storage/                           # Local attachment storage (gitignored)
    │   └── uploads/                       # Document storage directory
    │       └── tmp/                       # Staging directory for Multer uploads
    └── src/
        ├── app.js                         # Express application factory with ordered middleware pipeline
        ├── server.js                      # Startup bootstrap, DB initialization, graceful shutdown
        ├── config/
        │   ├── constants.js               # 17 frozen domain enums, ERROR_CODES, PAGINATION, Indian states
        │   ├── db.js                      # Mongoose connector, retry backoff, DNS SRV resolution
        │   └── env.js                     # Zod-validated environment configuration (JWT, STORAGE_DIR, UPLOAD)
        ├── controllers/
        │   ├── adminController.js         # Admin session verification handler
        │   ├── authController.js          # Citizen registration and login handlers
        │   ├── documentController.js      # PDF upload, document listing, facets, and lifecycle handlers
        │   ├── healthController.js        # Liveness (/health) and readiness (/health/ready) handlers
        │   ├── metaController.js          # Metadata options handler (/meta/options) with upload limits
        │   ├── sourceController.js        # Admin source CRUD handlers
        │   └── userController.js          # User profile retrieval and update handlers
        ├── jobs/.gitkeep                  # Background worker placeholders
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
        │   ├── adminRoutes.js             # Protected admin router (/sources, /documents/:id, /session)
        │   ├── authRoutes.js              # Authentication router (/api/auth/register, /api/auth/login)
        │   ├── documentRoutes.js          # Document catalog router (/upload, /facets, /:id, /pages)
        │   ├── healthRoutes.js            # Health route definitions
        │   ├── index.js                   # Root API router mounting all modular routers
        │   ├── metaRoutes.js              # Metadata router (/api/meta/options)
        │   └── userRoutes.js              # Protected user profile router (/api/users/profile)
        ├── services/
        │   ├── auditService.js            # Zero-throw tamper-evident audit logging service
        │   ├── authService.js             # Bcrypt hashing, constant-time dummy comparisons & JWT tokens
        │   ├── documentService.js         # PDF upload, dedupe, catalog listing, facets & lifecycle
        │   ├── fileStorageService.js      # Secure disk storage, path resolution, UUID names
        │   ├── ingestionQueueService.js   # Background IngestionJob creation & queuing
        │   ├── sourceService.js           # Source CRUD, SSRF prevention, URL normalization
        │   └── userService.js             # User registration, login, and profile business logic
        ├── utils/
        │   ├── ApiError.js                # Custom operational error class
        │   ├── asyncHandler.js            # Promise-resolving route controller wrapper
        │   ├── checksum.js                # File and buffer SHA-256 hash calculator
        │   ├── logger.js                  # Pino logger + Pino-HTTP with secrets redaction
        │   ├── modelHelpers.js            # Shared toJSONPlugin for schema transformations
        │   ├── response.js                # Unified sendSuccess, sendPaginated, sendError helpers
        │   ├── safeFilename.js            # Sanitizes filenames and extracts clean document titles
        │   └── storage.js                 # Storage utilities
        └── validators/
            ├── authValidators.js          # Zod validation schemas for register & login
            ├── common.js                  # Shared Zod validators (objectId, pagination, trimmedString)
            ├── documentValidators.js      # Zod validation schemas for upload, list, pages & patch
            ├── sourceValidators.js        # Zod validation schemas for source CRUD & SSRF prevention
            └── userValidators.js          # Zod validation schemas for user profile updates
```

---

## 7. Security & Privacy Audit

1. **Path Traversal & Storage Isolation**:
   - Files are stored using random UUIDs (`<uuid>.pdf`). Client filenames are never used for filesystem operations.
   - `resolveSafePath` enforces that all paths resolve strictly within `STORAGE_DIR`.
2. **File Content Validation**:
   - Files undergo strict extension check (`.pdf`), MIME type check (`application/pdf`), and binary magic-byte inspection (`%PDF-` in first 1024 bytes). Non-PDF files are deleted from temporary staging immediately and rejected with `415 UNSUPPORTED_MEDIA_TYPE`.
3. **SSRF Mitigation**:
   - Source URLs reject private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `127.0.0.0/8`, `::1`), `localhost`, and embedded credentials.
4. **Data Isolation & Enumeration Protection**:
   - Private citizen documents return `404 NOT_FOUND` to other citizens, preventing ID harvesting.
   - Administrators cannot view private citizen document parsed pages (`403 FORBIDDEN`).
   - All free-text search queries (`q`) are escaped before regex matching to prevent ReDoS attacks.

---

## 8. Next Actions & Instructions

Phase 5 has been verified and committed to master (`35e281e`):

```bash
git log -1 --oneline
# 35e281e feat(phase-5): source crud, secure pdf upload, deduplication, and document catalog
```

To proceed to **Phase 6: Document Ingestion Pipeline & Background Processing**, simply reply with:

> **`Phase 5 confirmed`**
