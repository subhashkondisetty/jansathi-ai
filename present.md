# JanSathi AI — Project Progress & Architecture Status (`present.md`)

> **Event**: FORGE '26 — Theme 1: "Civic Pulse"  
> **Project**: JanSathi AI (Government-Information Assistant for Indian Citizens)  
> **Current Date**: November 1, 2026  
> **Current Milestone**: Phase 1 & Phase 2 Complete, Verified & Live

---

## 1. Executive Summary

JanSathi AI is built as a production-grade, non-AI MERN monorepo foundation. All AI functionalities (LLM generation, vector embeddings, semantic search, RAG, multilingual translation, speech-to-text, and eligibility reasoning) are reserved for later phases through documented hook points that return `HTTP 501 NOT_IMPLEMENTED`.

Up to this point, **Phase 1 (Monorepo Foundation)** and **Phase 2 (Server Core & Database Integration)** are fully implemented, verified with live end-to-end integration tests, and connected to **MongoDB Atlas**.

---

## 2. 13-Phase Milestone Roadmap

| Phase       | Milestone Name                   | Status                           | Key Highlights                                                                                                                       |
| ----------- | -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Phase 1** | **Monorepo Foundation**          | **DONE & COMMITTED** (`309a4cc`) | Workspaces (`client`, `server`), ESLint 9 flat config, Prettier, Vite, Tailwind CSS 3, Express scaffolding, `/api/health`            |
| **Phase 2** | **Server Core & DB Integration** | **DONE & VERIFIED**              | MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, Rate limiters, Zod validators, Readiness probe |
| Phase 3     | Authentication & User Model      | Pending                          | Mongoose User model, bcrypt, JWT auth, role-based access (`citizen`, `admin`)                                                        |
| Phase 4     | Scheme Catalog Core              | Pending                          | Scheme model, CRUD, categories, indexing, public search                                                                              |
| Phase 5     | Document Ingestion Pipeline      | Pending                          | PDF/HTML upload, metadata extraction, background job queue                                                                           |
| Phase 6     | Admin Governance & Review        | Pending                          | Document review, audit logs, scheme approval workflows                                                                               |
| Phase 7     | Citizen Portal UI                | Pending                          | Scheme discovery, filtering, bookmarking, mobile-first design                                                                        |
| Phase 8     | AI Hook Architecture (Stubs)     | Pending                          | 501 NOT_IMPLEMENTED contracts for RAG, embeddings, and chat                                                                          |
| Phase 9     | Notifications & Civic Alerts     | Pending                          | Circulars, acts, notifications feeds, urgency tags                                                                                   |
| Phase 10    | Multilingual Meta Framework      | Pending                          | Language enums (`en`, `te`, `hi`, `ta`), UI localization scaffolding                                                                 |
| Phase 11    | Eligibility Checklist Engine     | Pending                          | Deterministic non-AI rule evaluator for scheme eligibility                                                                           |
| Phase 12    | End-to-End Testing & Auditing    | Pending                          | Vitest + Supertest integration tests, OWASP security audit                                                                           |
| Phase 13    | Final Polish & Production Deploy | Pending                          | Render/Atlas production build, Docker, demo script                                                                                   |

---

## 3. Current Architecture & Technology Stack

### A. Repository & Workspaces

- **Monorepo Manager**: npm workspaces (`workspaces: ["client", "server"]`)
- **Runtime Target**: Node.js &ge; 20 (Tested on Node v24.18.0)
- **Module System**: Pure ES Modules (`"type": "module"` on both client and server)
- **Environment Strategy**: Single root `.env` (gitignored) with validated schema in `server/src/config/env.js` and public template in `.env.example`.

### B. Backend (`server/`)

- **Web Framework**: Express 4.21 with strict middleware execution order:
  $$\text{requestId} \rightarrow \text{httpLogger} \rightarrow \text{helmet} \rightarrow \text{cors} \rightarrow \text{body parser (100kb)} \rightarrow \text{mongoSanitize} \rightarrow \text{hpp} \rightarrow \text{globalLimiter} \rightarrow \text{routes} \rightarrow \text{notFound} \rightarrow \text{errorHandler}$$
- **Database**: MongoDB Atlas Cluster via Mongoose 8.24 with bounded retry (3 attempts, exponential backoff) and custom public DNS resolver fallback (`8.8.8.8`, `1.1.1.1`) to guarantee Windows/ISP SRV record resolution.
- **Security & Hardening**:
  - Helmet with strict Content Security Policy for JSON APIs.
  - CORS origin allowlist parsing comma-separated origins from `CLIENT_ORIGIN`.
  - NoSQL injection prevention via `express-mongo-sanitize`.
  - HTTP Parameter Pollution protection via `hpp`.
  - Draft-7 standard rate limit headers via `express-rate-limit`.
- **Logging**: Pino 10 + Pino-HTTP with automatic redaction of `authorization`, `cookie`, `password`, `token`, and sensitive request bodies; pretty-printed in development via `pino-pretty`.
- **Validation**: Zod 3.24 with field-level error formatting and safe Express request assignment.

### C. Frontend (`client/`)

- **Framework**: React 18.3 + React DOM 18.3
- **Build System**: Vite 5.4 with dev proxy forwarding `/api` &rarr; `http://localhost:5000`
- **Routing**: React Router 6.28
- **Styling**: Tailwind CSS 3.4 + PostCSS + Autoprefixer (mobile-first down to 360px viewport)
- **Networking**: Axios 1.7 instance with automatic 20s timeout and JSON headers

---

## 4. Complete Codebase Inventory

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
├── present.md                             # Current project summary and milestone tracker
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
    ├── package.json                       # Server dependencies (Express, Mongoose, Zod, Pino, Helmet)
    ├── scripts/.gitkeep                   # CLI/utility script placeholders
    ├── storage/.gitkeep                   # Local attachment storage (gitignored)
    └── src/
        ├── app.js                         # Express application factory with ordered middleware pipeline
        ├── server.js                      # Startup bootstrap, DB initialization, graceful shutdown
        ├── config/
        │   ├── constants.js               # Frozen enums, ERROR_CODES, and PAGINATION constraints
        │   ├── db.js                      # Mongoose connector, retry backoff, DNS SRV resolution
        │   └── env.js                     # Zod-validated environment configuration
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
        ├── models/.gitkeep                # Mongoose model placeholders (Phase 3+)
        ├── routes/
        │   ├── healthRoutes.js            # Health route definitions
        │   └── index.js                   # Root API router mounting /health
        ├── services/.gitkeep              # Business service layer placeholders
        ├── utils/
        │   ├── ApiError.js                # Custom operational error class
        │   ├── asyncHandler.js            # Promise-resolving route controller wrapper
        │   ├── logger.js                  # Pino logger + Pino-HTTP with secrets redaction
        │   └── response.js                # Unified sendSuccess, sendPaginated, sendError helpers
        └── validators/
            └── common.js                  # Shared Zod validators (objectId, pagination, trimmedString)
```

---

## 5. Live Operational Status & Verification Matrix

Both development servers are currently active and running in background daemon mode:

- **Express Backend**: Listening on port `5000` (Node `--watch`)
- **Vite Frontend**: Serving on port `5173` (with dev proxy `/api` &rarr; `:5000`)
- **Database**: Connected to MongoDB Atlas cluster (`jansathi` database)

### Tested Scenarios & Proof of Correctness

| Test Case                     | Method & Path                                              | Expected Result                                     | Verified Actual Result                                            | Status   |
| ----------------------------- | ---------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| **Liveness Probe**            | `GET /api/health`                                          | 200 OK with `database: "connected"`, `status: "ok"` | Returns live uptime, UTC ISO date, and `"connected"`              | **PASS** |
| **Readiness Probe (DB Up)**   | `GET /api/health/ready`                                    | 200 OK with `ready: true`, `database: "connected"`  | Returns 200 OK                                                    | **PASS** |
| **Readiness Probe (DB Down)** | `GET /api/health/ready`                                    | 503 SERVICE_UNAVAILABLE                             | Returns 503 with standard error envelope                          | **PASS** |
| **Malformed JSON**            | `POST /api/health` with invalid JSON                       | 400 VALIDATION_ERROR                                | Returns 400 with `code: "VALIDATION_ERROR"` & `requestId`         | **PASS** |
| **Route 404 Fallback**        | `GET /api/unknown/endpoint`                                | 404 NOT_FOUND                                       | Returns 404 with structured JSON                                  | **PASS** |
| **Payload Size Exceeded**     | `POST /api/health` with >100KB body                        | 413 PAYLOAD_TOO_LARGE                               | Returns 413 with `code: "PAYLOAD_TOO_LARGE"`                      | **PASS** |
| **CORS Allowed Origin**       | `OPTIONS /api/health` with `Origin: http://localhost:5173` | 204 No Content, header echoed                       | `Access-Control-Allow-Origin: http://localhost:5173`              | **PASS** |
| **CORS Blocked Origin**       | `GET /api/health` with `Origin: http://malicious.com`      | 403 FORBIDDEN                                       | Returns 403 with `code: "FORBIDDEN"` & `requestId`                | **PASS** |
| **Rate Limiter (Burst)**      | 320 requests in sequence                                   | 429 RATE_LIMITED after limit                        | First 429 returned at request #298 with `retryAfterSeconds`       | **PASS** |
| **Log Secrets Redaction**     | `Authorization: Bearer <secret>`                           | Credentials censored                                | Grep across log yielded 0 occurrences; replaced with `[REDACTED]` | **PASS** |
| **Zod Query Validation**      | `validate({ query: paginationQuery })`                     | Coerces strings to integers                         | `{ page: "2", limit: "20" }` &rarr; `{ page: 2, limit: 20 }`      | **PASS** |
| **Zod Field Errors**          | `validate` with invalid input                              | 400 with field-level details                        | Returns `[{ target: "body", path: "name", message: "..." }]`      | **PASS** |
| **Linter Check**              | `npm run lint`                                             | 0 errors, 0 warnings                                | Clean exit (code 0)                                               | **PASS** |
| **Formatter Check**           | `npm run format:check`                                     | All files match Prettier                            | Clean exit (code 0)                                               | **PASS** |
| **Frontend Production Build** | `npm run build`                                            | 0 build errors                                      | Vite bundled client in 3.20s                                      | **PASS** |

---

## 6. Security & Privacy Audit

1. **Credentials Management**:
   - The MongoDB Atlas URI with database username and password is stored solely in the local `.env` file.
   - Verified that `.env` is absent from git tracking (`git ls-files .env` yields empty).
2. **Logging Hygiene**:
   - Pino redaction rules automatically scrub authorization headers, session cookies, passwords, tokens, and refresh tokens before emitting logs.
   - Request URLs logged by `pino-http` strip query parameters to avoid logging query parameters.
3. **Database Injection Protection**:
   - All incoming bodies and query parameters are stripped of `$` and `.` operators via `express-mongo-sanitize`.
4. **Header Hardening**:
   - Helmet sets strict Content Security Policy directives disabling default script execution and disabling `iframe` embedding (`frameAncestors: ["'none'"]`).

---

## 7. Next Actions

The codebase is in a stable, verified state and ready to be committed:

```bash
git add .
git commit -m "feat(phase-2): server core, security middleware, and mongodb atlas connection"
```

Once you reply with:

> **`Phase 2 confirmed`**

we will transition directly into **Phase 3: Authentication & User Model** (citizen/admin schemas, password hashing, JWT generation, and protected route middlewares).
