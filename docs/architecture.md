# JanSathi AI — System Architecture (`ARCHITECTURE.md`)

> **Project**: JanSathi AI (जन साथी AI)  
> **Theme**: FORGE '26 — Theme 1: Civic Pulse  
> **Architecture Style**: Decoupled MERN Monorepo with Strict Non-AI Foundation Governance  
> **Verification**: Inspected and verified directly against repository codebase.

---

## 1. High-Level Architecture Overview

JanSathi AI connects Indian citizens to official government gazettes, schemes, and verification pipelines. The platform is architecturally partitioned into a mobile-first, responsive React 18 client and a hardened Node.js/Express 4 backend with MongoDB Atlas persistence.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 18 + Vite)"]
        UI_Citizen["Citizen Portal\n(/documents, /assistant, /eligibility, /explainer, /verify)"]
        UI_Admin["Admin Control Center\n(/admin/dashboard, /admin/jobs, /admin/sources, etc.)"]
        Contexts["Context Layer\n(AuthContext, OptionsContext, LanguageContext, ToastContext)"]
        AxiosClient["Central Axios Client\n(Bearer Interceptor, normalizeApiError)"]
    end

    subgraph Gateway["Express API Gateway & Security Pipeline"]
        MW_ReqId["1. Request ID (UUID)"]
        MW_Pino["2. HTTP Request Logger (Pino)"]
        MW_Helmet["3. Helmet (Strict CSP)"]
        MW_CORS["4. CORS (Origin Whitelist)"]
        MW_Sanitize["5. Mongo Sanitize & HPP"]
        MW_Rate["6. Rate Limiters (Global, Auth, AI, Upload)"]
        MW_Auth["7. Authentication (JWT HS256 + DB Hydration)"]
        MW_Role["8. RBAC (requireRole: admin, citizen)"]
        MW_Zod["9. Zod Schema Validation"]
    end

    subgraph CoreBackend["Backend Controllers & Non-AI Services"]
        Ctrl_Doc["Document & Upload Services\n(Multer, Magic Bytes, Deduplication)"]
        Ctrl_Admin["Admin & Source Services\n(Source CRUD, Job Management)"]
        Ctrl_Search["Search Service\n(MongoDB $text, textScore)"]
        Ctrl_History["User History Service\n(Conversations, Claims)"]
        Worker_Ingest["Background IngestionRunner Daemon\n(PDF/HTML Extraction, NFC Cleaner, Chunker)"]
    end

    subgraph AI_Hooks["AI Integration Hook Shells (HTTP 501 Stubs)"]
        Hook_RAG["ragService (501 NOT_IMPLEMENTED)"]
        Hook_Elig["eligibilityService (501 NOT_IMPLEMENTED)"]
        Hook_Verify["verificationService (501 NOT_IMPLEMENTED)"]
        Hook_Embed["embeddingService (501 NOT_IMPLEMENTED)"]
        Hook_AI["aiService (501 NOT_IMPLEMENTED)"]
    end

    subgraph Database["MongoDB Atlas (Cluster Persistence)"]
        DB_Users[("User")]
        DB_Docs[("Document")]
        DB_Pages[("DocumentPage")]
        DB_Chunks[("DocumentChunk\n($text Index)")]
        DB_Sources[("Source")]
        DB_Jobs[("IngestionJob\n(Atomic Claims)")]
        DB_Conv[("Conversation")]
        DB_Claim[("Claim")]
        DB_Audit[("AuditLog\n(180-day TTL)")]
    end

    UI_Citizen --> Contexts --> AxiosClient
    UI_Admin --> Contexts --> AxiosClient
    AxiosClient -->|"HTTP /api/*"| MW_ReqId --> MW_Pino --> MW_Helmet --> MW_CORS --> MW_Sanitize --> MW_Rate --> MW_Auth --> MW_Role --> MW_Zod

    MW_Zod --> Ctrl_Doc --> DB_Docs & DB_Pages & DB_Chunks
    MW_Zod --> Ctrl_Admin --> DB_Sources & DB_Jobs
    MW_Zod --> Ctrl_Search --> DB_Chunks
    MW_Zod --> Ctrl_History --> DB_Conv & DB_Claim
    MW_Zod -->|"AI Requests"| Hook_RAG & Hook_Elig & Hook_Verify
    Worker_Ingest -->|"Pulls queued jobs"| DB_Jobs
    Worker_Ingest -->|"Extracts & Chunks"| DB_Pages & DB_Chunks & DB_Docs
```

---

## 2. Frontend Architecture (React 18 + Vite)

### 2.1 Workspace Structure (`client/`)

- **Build Tool**: Vite 5 with `@vitejs/plugin-react` and Tailwind CSS 3.4.
- **Client Entry**: [`client/src/main.jsx`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/src/main.jsx) renders `<App />` wrapped in `<BrowserRouter>`, `<ToastProvider>`, `<AuthProvider>`, `<LanguageProvider>`, and `<OptionsProvider>`.
- **Routing**: React Router 6 in [`client/src/App.jsx`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/src/App.jsx).

### 2.2 Context Layer

1. **`AuthContext`**: Manages user authentication state, token storage via `tokenStorage.js`, login, registration, and logout. Decoupled from Axios via `setUnauthorizedHandler`.
2. **`LanguageContext`**: Provides instant UI translation across English (`en`), Hindi (`hi`), Telugu (`te`), and Tamil (`ta`).
3. **`OptionsContext`**: Fetches and caches system configuration metadata from `/api/meta/options` (states, categories, document types, income brackets, upload limits).
4. **`ToastContext`**: Accessible alert toast notifications with keyboard dismissal.

### 2.3 Route Guarding

- **`ProtectedRoute`**: Inspects `isAuthenticated`; redirects unauthenticated citizens to `/login?redirect=...`.
- **`AdminRoute`**: Inspects `isAuthenticated` and verifies `user.role === 'admin'`. Non-admins are redirected with security toast warnings.
- **`AdminLayout`**: Dedicated administrative shell featuring desktop fixed sidebar (`lg:pl-64`), mobile overlay drawer (`AdminSidebar`), administrative topbar (`AdminHeader`), `<Outlet />`, and return switcher to the citizen portal.

### 2.4 Error Handling & HTTP Client

- **`client/src/services/api.js`**: Central Axios instance configured with `timeout: 20000` and `baseURL: import.meta.env.VITE_API_BASE_URL || '/api'`.
- **Request Interceptor**: Injects `Authorization: Bearer <token>` on every outgoing request.
- **Response Interceptor**: Intercepts HTTP 401 on non-login endpoints, clears local credentials, and dispatches the global unauthorized handler.
- **`normalizeApiError(err)`**: Normalizes Axios exceptions, network drops, rate limits (extracting `Retry-After`), and HTTP 501 `NOT_IMPLEMENTED` envelopes into a predictable UI model.

---

## 3. Backend Architecture (Node.js + Express 4)

### 3.1 Request Lifecycle & Middleware Pipeline

Every incoming HTTP request flows sequentially through the following pipeline defined in [`server/src/app.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/app.js):

1. **`requestId`**: Generates or forwards a unique `X-Request-Id` for end-to-end tracing.
2. **`httpLogger`**: Structured Pino HTTP logging with sensitive token/password redaction and query string stripping.
3. **`helmetMiddleware`**: Sets strict JSON API Content-Security-Policy and Cross-Origin Resource Policy.
4. **`corsMiddleware`**: Enforces strict origin matching against `CLIENT_ORIGIN` for browser requests.
5. **`express.json`**: Parses JSON payloads up to `BODY_LIMIT` (default 100kb). URL-encoded parsing is disabled.
6. **`sanitizeMiddleware`**: Strips forbidden MongoDB query characters (`$` and `.`).
7. **`hppMiddleware`**: Prevents HTTP Parameter Pollution.
8. **`globalLimiter`**: 300 requests / 15 minutes window; skips `/api/health*` telemetry probes.
9. **Route Controllers**: Express router hierarchy dispatching to controllers.
10. **`notFound`**: Catches unmapped routes, returning HTTP 404 `NOT_FOUND`.
11. **`errorHandler`**: Centralized error boundary masking internal errors, transforming Mongoose errors, and logging errors with full request context.

---

## 4. Database Models & Relationships

JanSathi AI utilizes 9 Mongoose schemas in MongoDB Atlas:

```mermaid
erDiagram
    User ||--o{ Document : "uploads"
    User ||--o{ Conversation : "owns"
    User ||--o{ Claim : "submits"
    User ||--o{ AuditLog : "triggers"

    Source ||--o{ IngestionJob : "spawns"
    Source ||--o{ Document : "originates"

    Document ||--o{ IngestionJob : "processed_by"
    Document ||--o{ DocumentPage : "contains"
    Document ||--o{ DocumentChunk : "partitions"

    User {
        ObjectId _id PK
        string email UK
        string passwordHash
        string role "citizen | admin"
        string preferredLanguage
        boolean isActive
    }

    Document {
        ObjectId _id PK
        string title
        string state
        string category
        string documentType
        string status "pending | processing | ready | failed | needs_ocr"
        string fileChecksum UK
        ObjectId uploadedBy FK
        ObjectId sourceId FK
    }

    DocumentPage {
        ObjectId _id PK
        ObjectId documentId FK
        number pageNumber
        string text
        number tokenCount
    }

    DocumentChunk {
        ObjectId _id PK
        ObjectId documentId FK
        ObjectId pageId FK
        string text "Indexed via textScore"
        number chunkIndex
        object metadata
    }

    Source {
        ObjectId _id PK
        string name
        string url UK
        string state
        string category
        string sourceType "pdf | html"
        boolean isActive
    }

    IngestionJob {
        ObjectId _id PK
        ObjectId sourceId FK
        ObjectId documentId FK
        string status "queued | running | succeeded | failed | skipped_duplicate"
        string jobType "upload | source_fetch"
        number attempts
        date lockedAt
    }

    Conversation {
        ObjectId _id PK
        ObjectId userId FK
        string title
        array messages "Max 200 messages"
    }

    Claim {
        ObjectId _id PK
        ObjectId userId FK
        string claimText
        string status "unverified"
        array citations
    }

    AuditLog {
        ObjectId _id PK
        ObjectId userId FK
        string action
        string resourceType
        string ipAddress
        date createdAt "TTL: 180 days"
    }
```

---

## 5. Ingestion Pipeline & Background Worker

### 5.1 Ingestion State Machine

The background worker (`jobs/ingestionRunner.js`) operates without external queue services (no Redis), coordinating tasks atomically through MongoDB:

```mermaid
stateDiagram-v2
    [*] --> queued: PDF Upload or Admin Source Ingest
    queued --> running: IngestionRunner atomic claim (findOneAndUpdate)
    running --> fetching: Source jobs only (SSRF check + DNS Guard)
    fetching --> extracting: Bytes retrieved
    extracting --> cleaning: Text extracted via pdfjs / Cheerio
    cleaning --> chunking: Unicode NFC normalized & de-hyphenated
    chunking --> storing: Chunks created with target 1000 chars + overlap
    storing --> succeeded: DocumentPage & DocumentChunk batch inserted (batch size 200)

    running --> skipped_duplicate: SHA-256 matches existing document
    running --> queued: Transient error (attempts < maxAttempts, backoff delay)
    running --> failed: Fatal error OR attempts >= maxAttempts
    failed --> queued: Admin manual retry (/ingestion-jobs/:id/retry)
    succeeded --> [*]
    skipped_duplicate --> [*]
```

### 5.2 Key Ingestion Pipeline Components:

- **`services/pdfService.js`**: `pdfjs-dist` text extraction with line break reconstruction and `MAX_PDF_PAGES=300` limit.
- **`services/htmlService.js`**: Cheerio HTML parser segmenting content into pages via `h1`-`h3` section headers.
- **`services/textCleaner.js`**: Preserves Indic scripts (Telugu, Devanagari, Tamil) with Unicode NFC normalization, strips unprintable control codes, and removes repeated headers/footers.
- **`services/chunkingService.js`**: Sentence-aware deterministic chunking with configurable overlap (`CHUNK_TARGET_CHARS=1000`, `CHUNK_MAX_CHARS=1500`, `CHUNK_OVERLAP_CHARS=150`).
- **`services/fetchService.js`**: SSRF defense with socket-level DNS verification, max 3 manual redirects, and domain pinning.

---

## 6. AI Integration Architecture (Future "AI-Day" Handover)

JanSathi AI was designed with stable hook shells so that AI capabilities can be plugged in without changing database schemas, client-facing routes, or security middleware.

| Hook Component                        | Current Phase 13 Status                                                                       | Future "AI-Day" Replacement                                                                                                                                 |
| :------------------------------------ | :-------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`services/retrievalService.js`**    | Functional: MongoDB `$text` search over `DocumentChunk` with `score: { $meta: 'textScore' }`. | Hybrid Search: Combines `$vectorSearch` with `$text` using Reciprocal Rank Fusion (RRF). Interface `retrieve({ query, filters, limit })` remains identical. |
| **`services/embeddingService.js`**    | Shell: Throws `NotImplementedError`.                                                          | Embeddings: Generates dense vectors (e.g. 768-dim) for background chunks during ingestion and user queries during retrieval.                                |
| **`services/aiService.js`**           | Shell: Throws `NotImplementedError`.                                                          | LLM Runtime: Calls LLM with forced JSON schema validation and few-shot civic system prompts.                                                                |
| **`services/ragService.js`**          | Shell: Throws `NotImplementedError`.                                                          | Grounding & Synthesis: Synthesizes retrieved gazette chunks, verifies source URLs, and appends messages to `Conversation`.                                  |
| **`services/eligibilityService.js`**  | Shell: Throws `NotImplementedError`.                                                          | Criteria Evaluator: Matches applicant demographic attributes against structured criteria extracted from schemes.                                            |
| **`services/verificationService.js`** | Shell: Throws `NotImplementedError`.                                                          | Stance Classifier: Classifies citizen rumors against official circulars (`supported`, `contradicted`, `unverified`) and logs to `Claim`.                    |
