# JanSathi AI — Project Progress & Architecture Status (`present.md`)

> **Event**: FORGE '26 — Theme 1: "Civic Pulse"  
> **Project**: JanSathi AI (Government-Information Assistant for Indian Citizens)  
> **Current Date**: November 1, 2026  
> **Current Milestone**: Phase 1, Phase 2, Phase 3 & Phase 4 Complete, Verified & Live Against MongoDB Atlas

---

## 1. Quick Access Links

| Service                            | URL                                                                              | Status     | Description                                                    |
| :--------------------------------- | :------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------- |
| **Frontend Client (Vite + React)** | [http://localhost:5173](http://localhost:5173)                                   | **LIVE**   | Citizen UI down to 360px viewport with Vite `/api` proxy       |
| **Backend Server (Express API)**   | [http://localhost:5000](http://localhost:5000)                                   | **LIVE**   | Node 20+ Express server with security middleware pipeline      |
| **Liveness Health Probe**          | [http://localhost:5000/api/health](http://localhost:5000/api/health)             | **200 OK** | Service uptime, ISO date, database connection check            |
| **Readiness Health Probe**         | [http://localhost:5000/api/health/ready](http://localhost:5000/api/health/ready) | **200 OK** | Readiness verification checking MongoDB Atlas connectivity     |
| **Public Meta Options**            | [http://localhost:5000/api/meta/options](http://localhost:5000/api/meta/options) | **200 OK** | Reference configuration arrays (languages, categories, states) |

---

## 2. Executive Summary

JanSathi AI is built on a production-grade, non-AI MERN monorepo foundation. In accordance with project architecture guidelines, all AI functionalities (LLM generation, vector embeddings, semantic search, RAG, multilingual translation, speech-to-text, and eligibility reasoning) are reserved for later phases through documented hook points that return `HTTP 501 NOT_IMPLEMENTED`. Absolutely zero fake, canned, or simulated AI data is permitted in the codebase.

Milestones completed to date:

- **Phase 1 (Monorepo Foundation)**: Workspaces, Vite proxy, Tailwind CSS 3, ESLint 9, Prettier, Express scaffolding (`309a4cc`).
- **Phase 2 (Server Core & Database Connection)**: MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, rate limiters, Zod validators (`60b0899`).
- **Phase 3 (Mongoose Models & Database Indexes)**: 9 domain schemas, 17 system enums, text search index, TTL audit log index, `syncIndexes.js` tooling (`6f7e073`).
- **Phase 4 (Authentication, Authorization & User Management)**: Complete JWT auth pipeline (HS256 pinned), bcrypt password hashing, constant-time dummy comparisons, role-based access control (`citizen`, `admin`), profile GET/PUT with strict validations, privacy-safe audit logging, reference metadata options, and admin provisioning CLI.

---

## 3. 13-Phase Milestone Roadmap

| Phase       | Milestone Name                    | Status                                | Key Highlights                                                                                                                       |
| :---------- | :-------------------------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1** | **Monorepo Foundation**           | **DONE & COMMITTED** (`309a4cc`)      | Workspaces (`client`, `server`), ESLint 9 flat config, Prettier, Vite, Tailwind CSS 3, Express scaffolding, `/api/health`            |
| **Phase 2** | **Server Core & DB Integration**  | **DONE & COMMITTED** (`60b0899`)      | MongoDB Atlas cluster connected, Pino logger + redaction, Helmet CSP, CORS allowlist, Rate limiters, Zod validators, Readiness probe |
| **Phase 3** | **Mongoose Models & DB Indexes**  | **DONE & COMMITTED** (`6f7e073`)      | 9 domain models, 17 system enums, text search index, TTL audit log index, `npm run db:sync-indexes` tooling                          |
| **Phase 4** | **Auth, Roles & User Management** | **DONE & VERIFIED** (Ready to Commit) | JWT HS256, bcryptjs, constant-time dummy hash, citizen registration/login, profile GET/PUT, admin CLI, audit logging                 |
| Phase 5     | Scheme Catalog Core & CRUD        | Pending                               | Scheme model, CRUD endpoints, categories, indexing, public search                                                                    |
| Phase 6     | Document Ingestion Pipeline       | Pending                               | PDF/HTML upload, metadata extraction, background job queue                                                                           |
| Phase 7     | Admin Governance & Review         | Pending                               | Document review, audit logs, scheme approval workflows                                                                               |
| Phase 8     | Citizen Portal UI                 | Pending                               | Scheme discovery, filtering, bookmarking, mobile-first design                                                                        |
| Phase 9     | AI Hook Architecture (Stubs)      | Pending                               | 501 NOT_IMPLEMENTED contracts for RAG, embeddings, and chat                                                                          |
| Phase 10    | Notifications & Civic Alerts      | Pending                               | Circulars, acts, notifications feeds, urgency tags                                                                                   |
| Phase 11    | Multilingual Meta Framework       | Pending                               | Language enums (`en`, `te`, `hi`, `ta`), UI localization scaffolding                                                                 |
| Phase 12    | Eligibility Checklist Engine      | Pending                               | Deterministic non-AI rule evaluator for scheme eligibility                                                                           |
| Phase 13    | Final Polish & Production Deploy  | Pending                               | Render/Atlas production build, Docker, demo script                                                                                   |

---

## 4. Phase 4 Architecture: Auth, Roles & Security

### A. Authentication & Cryptography Pipeline

1. **Password Hashing (`authService.js`)**:
   - `bcryptjs` with configurable work factor (`BCRYPT_ROUNDS=12`).
   - Timing attack protection: `DUMMY_PASSWORD_HASH` pre-computed with 12 rounds ensures constant-time execution during login attempts on non-existent user accounts.
2. **Token Management (`authService.js`)**:
   - Algorithms: Strictly pinned to `HS256` in both `signToken` and `verifyToken` to prevent algorithm substitution attacks (rejecting `none` or asymmetric public key attacks).
   - Issuer: Pinned to `jansathi-ai`.
   - Expiration: Configurable via `JWT_EXPIRES_IN` (defaults to `7d`).
   - Token payload: `{ sub: user.id, role: user.role }`.
3. **Authentication Middleware (`middleware/auth.js`)**:
   - Validates `Authorization: Bearer <token>` header.
   - Distinct error mapping: `TokenExpiredError` &rarr; `401 TOKEN_EXPIRED`, invalid tokens &rarr; `401 UNAUTHENTICATED`.
   - Re-loads the user from the database on every request (`select('-passwordHash')`) to enforce account revocation (`isActive: false`).
   - Hydrates `req.user = { id, role, preferredLanguage }`.
4. **Authorization Middleware (`middleware/authorize.js`)**:
   - Enforces role requirements (e.g. `requireRole('admin')`).
   - Rejects unauthorized users with `403 FORBIDDEN`.

### B. Endpoints & Features

1. **`POST /api/auth/register`**:
   - Accepts `{ name, email, password, preferredLanguage?, state?, userCategory? }`.
   - Enforces strict Zod schema; any extra field (such as `role`) is rejected with `400 VALIDATION_ERROR`.
   - Role is strictly hardcoded to `'citizen'`.
   - Returns `201 Created` with sanitized user object and JWT.
   - Duplicate email returns generic `409 CONFLICT`.
2. **`POST /api/auth/login`**:
   - Accepts `{ email, password }`.
   - Constant-time verification against user hash or dummy hash.
   - Inactive accounts or bad credentials return identical `401 INVALID_CREDENTIALS` (`"Invalid email or password"`).
   - Updates `lastLoginAt` and returns `200 OK` with user and token.
   - `authLimiter` applied with `skipSuccessfulRequests: true`.
3. **`GET /api/users/profile`**:
   - Protected by `authenticate`.
   - Returns 200 with clean user profile (passwordHash excluded).
4. **`PUT /api/users/profile`**:
   - Protected by `authenticate`.
   - Allows partial updates of citizen fields; `null` unsets optional fields.
   - Strict schema prevents updating immutable/protected keys (`email`, `role`, `passwordHash`, `isActive`).
   - Enforces state-district consistency: `district` requires `state` to be present.
5. **`GET /api/meta/options`**:
   - Public reference options (`languages`, `userCategories`, `educationLevels`, `incomeRanges`, `states`, `docTypes`, `docCategories`).
6. **`GET /api/admin/session`**:
   - Protected by router-level `authenticate` and `requireRole('admin')`.
   - Returns `{ id, role: 'admin' }`.
7. **Admin CLI (`scripts/createAdmin.js`)**:
   - CLI tool provisioned via `npm run create-admin -- ...` or direct invocation.
   - Reads `--email`, `--name`, `--password`, `--promote` flags or environment variables.
   - Refuses weak passwords and enforces full schema validation.
   - Silences internal connection logs to print **only** the generated or promoted user ID.

### C. Audit Logging (`services/auditService.js`)

- Logs `auth.register`, `auth.login`, `users.profile.update`, and `admin.session`.
- Safe guarantee: `logAudit` wraps database writes in `try/catch` and **never throws**.
- Privacy guarantee: Automatically strips sensitive keys (`password`, `token`, `secret`, `email`) from metadata. Failed logins record only generic reasons (`invalid_credentials`) without persisting submitted credentials.

---

## 5. Live Operational Status & Verification Matrix

Both development servers are active and connected in daemon mode:

- **Express Backend**: Listening on port `5000` (Node `--watch`)
- **Vite Frontend**: Serving on port `5173` (with dev proxy `/api` &rarr; `:5000`)
- **Database**: Connected to MongoDB Atlas cluster (`jansathi` database)

### Comprehensive Verification Matrix

| Test Suite / Target         | Verification Performed                                     | Expected Result                                       | Actual Result                               | Status   |
| :-------------------------- | :--------------------------------------------------------- | :---------------------------------------------------- | :------------------------------------------ | :------- |
| **Citizen Registration**    | `POST /api/auth/register`                                  | 201 Created, citizen role pinned, JWT returned        | `201 Created` with valid user and JWT       | **PASS** |
| **Duplicate Registration**  | `POST /api/auth/register` with existing email              | 409 CONFLICT                                          | Returns 409 `CONFLICT`                      | **PASS** |
| **Weak Password**           | `POST /api/auth/register` with password `<8 chars`         | 400 VALIDATION_ERROR with field details               | Returns 400 with password requirements      | **PASS** |
| **Role Tampering**          | `POST /api/auth/register` with `{"role": "admin"}`         | 400 VALIDATION_ERROR on strict schema                 | Returns 400 rejecting unrecognized role key | **PASS** |
| **Citizen Login**           | `POST /api/auth/login` with valid credentials              | 200 OK, JWT returned, `lastLoginAt` updated           | Returns 200 OK with token                   | **PASS** |
| **Wrong Password**          | `POST /api/auth/login` with wrong password                 | 401 INVALID_CREDENTIALS ("Invalid email or password") | Returns 401 with generic message            | **PASS** |
| **Unknown Account**         | `POST /api/auth/login` with unknown email                  | 401 INVALID_CREDENTIALS (constant timing)             | Returns identical 401 message               | **PASS** |
| **Unauthenticated Profile** | `GET /api/users/profile` without token                     | 401 UNAUTHENTICATED                                   | Returns 401 UNAUTHENTICATED                 | **PASS** |
| **Garbage Token**           | `GET /api/users/profile` with invalid JWT string           | 401 UNAUTHENTICATED                                   | Returns 401 UNAUTHENTICATED                 | **PASS** |
| **Expired Token**           | `GET /api/users/profile` with expired JWT                  | 401 TOKEN_EXPIRED                                     | Returns 401 with code `TOKEN_EXPIRED`       | **PASS** |
| **Profile Validation**      | `PUT /api/users/profile` with invalid state / unknown keys | 400 VALIDATION_ERROR                                  | Returns 400 with target and path details    | **PASS** |
| **State-District Rule**     | `PUT /api/users/profile` with district but null state      | 400 VALIDATION_ERROR                                  | Rejected with state requirement error       | **PASS** |
| **Valid Profile Update**    | `PUT /api/users/profile` with valid fields                 | 200 OK with updated user profile                      | Profile updated and persisted               | **PASS** |
| **NoSQL Injection Attempt** | `POST /api/auth/login` with `{"email":{"$gt":""}}`         | 400 VALIDATION_ERROR                                  | Rejected before query execution             | **PASS** |
| **Public Meta Options**     | `GET /api/meta/options`                                    | 200 OK with 7 reference arrays                        | Returns languages, states, categories, etc. | **PASS** |
| **Admin Provisioning CLI**  | `node scripts/createAdmin.js`                              | Prints ONLY the created user ID                       | Emitted 24-char ObjectId without log noise  | **PASS** |
| **Admin Promotion CLI**     | CLI with `--promote` flag on existing user                 | Promotes role to admin, prints user ID                | Updated user role to admin                  | **PASS** |
| **Admin Session (Admin)**   | `GET /api/admin/session` with admin token                  | 200 OK with `{ id, role: "admin" }`                   | Returns 200 OK                              | **PASS** |
| **Admin Session (Citizen)** | `GET /api/admin/session` with citizen token                | 403 FORBIDDEN                                         | Returns 403 `FORBIDDEN`                     | **PASS** |
| **Audit Log Privacy**       | Inspect MongoDB Atlas `AuditLog` collection                | Zero passwords or emails in logs                      | Confirmed zero credential leaks             | **PASS** |
| **Auth Rate Limiter**       | Burst failed logins exceeding threshold                    | 429 RATE_LIMITED with `retryAfterSeconds`             | Triggered 429 with standard envelope        | **PASS** |
| **Code Style & Format**     | `npm run format:check`                                     | Prettier compliance across all files                  | All files match Prettier code style         | **PASS** |
| **Static Code Analysis**    | `npm run lint`                                             | ESLint 9 zero errors/warnings                         | 0 errors, 0 warnings                        | **PASS** |

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
    ├── package.json                       # Server dependencies & scripts (Express, Mongoose, Zod, Pino, bcryptjs, jwt)
    ├── scripts/
    │   ├── createAdmin.js                 # Admin provisioning and promotion CLI script
    │   └── syncIndexes.js                 # Database index synchronization CLI tool
    ├── storage/                           # Local attachment storage (gitignored)
    └── src/
        ├── app.js                         # Express application factory with ordered middleware pipeline
        ├── server.js                      # Startup bootstrap, DB initialization, graceful shutdown
        ├── config/
        │   ├── constants.js               # 17 frozen domain enums, ERROR_CODES, PAGINATION, Indian states
        │   ├── db.js                      # Mongoose connector, retry backoff, DNS SRV resolution
        │   └── env.js                     # Zod-validated environment configuration (JWT, BCRYPT, TTL, RATE_LIMIT)
        ├── controllers/
        │   ├── adminController.js         # Admin session verification handler
        │   ├── authController.js          # Citizen registration and login handlers
        │   ├── healthController.js        # Liveness (/health) and readiness (/health/ready) handlers
        │   ├── metaController.js          # Metadata options handler (/meta/options)
        │   └── userController.js          # User profile retrieval and update handlers
        ├── jobs/.gitkeep                  # Background worker placeholders
        ├── middleware/
        │   ├── auth.js                    # JWT Bearer token authentication & user hydration middleware
        │   ├── authorize.js               # Role-based access control middleware (requireRole)
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
        │   ├── adminRoutes.js             # Protected admin router (/api/admin/session)
        │   ├── authRoutes.js              # Authentication router (/api/auth/register, /api/auth/login)
        │   ├── healthRoutes.js            # Health route definitions
        │   ├── index.js                   # Root API router mounting all modular routers
        │   ├── metaRoutes.js              # Metadata router (/api/meta/options)
        │   └── userRoutes.js              # Protected user profile router (/api/users/profile)
        ├── services/
        │   ├── auditService.js            # Zero-throw tamper-evident audit logging service
        │   ├── authService.js             # Bcrypt hashing, constant-time dummy comparisons & JWT tokens
        │   └── userService.js             # User registration, login, and profile business logic
        ├── utils/
        │   ├── ApiError.js                # Custom operational error class
        │   ├── asyncHandler.js            # Promise-resolving route controller wrapper
        │   ├── logger.js                  # Pino logger + Pino-HTTP with secrets redaction
        │   ├── modelHelpers.js            # Shared toJSONPlugin for schema transformations
        │   └── response.js                # Unified sendSuccess, sendPaginated, sendError helpers
        └── validators/
            ├── authValidators.js          # Zod validation schemas for register & login
            ├── common.js                  # Shared Zod validators (objectId, pagination, trimmedString)
            └── userValidators.js          # Zod validation schemas for user profile updates
```

---

## 7. Security & Privacy Audit

1. **Timing-Safe Authentication**:
   - For login requests with non-existent emails, `bcrypt.compare` executes against `DUMMY_PASSWORD_HASH` to guarantee identical processing duration and prevent account enumeration.
2. **Algorithm Pinning**:
   - JSON Web Tokens strictly enforce `HS256` in both signing and verification to protect against algorithm switching vulnerabilities.
3. **Audit Log Privacy**:
   - `AuditLog` metadata strips `password`, `token`, `secret`, `email`, and `authorization` keys.
   - Failed authentication attempts never record the attempted email address or password.
4. **Environment Isolation**:
   - Sensitive variables (`JWT_SECRET`, `MONGODB_URI`, `ADMIN_PASSWORD`) exist solely in the gitignored `.env` file.

---

## 8. Next Actions & Instructions

Phase 4 is complete and ready to be committed to the repository:

```bash
git add .
git commit -m "feat(phase-4): authentication, authorization, profile management, and admin cli"
```

To proceed to **Phase 5: Scheme Catalog Core & CRUD**, simply reply with:

> **`Phase 4 confirmed`**
