# JanSathi AI — Security Architecture & Threat Model (`SECURITY.md`)

> **Project**: JanSathi AI (जन साथी AI)  
> **Theme**: FORGE '26 — Theme 1: Civic Pulse  
> **Repository Context**: MERN Monorepo with Non-AI Foundation Governance  
> **Document Status**: Production Security Documentation (Verified against source code)  
> **Notice**: This document outlines verified security controls, partial implementations, known limitations, and future hardening recommendations. It makes no claims of absolute invulnerability or third-party certification.

---

## 1. Executive Summary & Security Philosophy

JanSathi AI operates as a trusted civic information infrastructure. Because citizens rely on the platform for government gazette verification and welfare eligibility guidance, the system prioritizes **data integrity, non-repudiation, injection defense, SSRF mitigation, and user privacy**.

The architecture enforces a strict **zero-trust boundary** at the API gateway:

- Every route parameter, query string, and JSON payload is validated using Zod before reaching controllers.
- Public health probes are decoupled and rate-limit exempt to ensure telemetry availability without exposing authenticated routes.
- Destructive operations require server confirmation and are non-optimistic.
- Sensitive credentials, database connection strings, and tokens are redacted from logs and never transmitted in client bundles.

---

## 2. Implemented Security Controls (Verified Source Evidence)

### 2.1 Password Security & Constant-Time Login

- **Algorithm & Work Factor**: Passwords are encrypted using `bcryptjs` with configurable salt rounds (`BCRYPT_ROUNDS`, default: `12`, clamped between 4 and 16). Evidence: [`server/src/services/authService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/authService.js#L20-L23).
- **Constant-Time Dummy Comparison**: To mitigate account enumeration via timing analysis, when a non-existent email address attempts authentication, the server executes a pre-computed 12-round dummy bcrypt comparison (`DUMMY_PASSWORD_HASH`). Evidence: [`server/src/services/authService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/authService.js#L13) and [`server/src/controllers/authController.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/controllers/authController.js#L35-L42).

### 2.2 JWT Authentication & Lifecycle

- **Algorithm & Signature**: Tokens are signed strictly with HMAC-SHA256 (`HS256`) and a pinned issuer (`issuer: 'jansathi-ai'`). Verification explicitly rejects algorithms other than `HS256` to prevent algorithm confusion attacks (`none` or asymmetric confusion). Evidence: [`server/src/services/authService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/authService.js#L44-L64).
- **Secret Hardening**:
  - Minimum length of 32 characters enforced via Zod `envSchema.JWT_SECRET.min(32)`.
  - In production (`NODE_ENV === 'production'`), startup validation strictly rejects the known default development secrets (`jansathi-development-secret-jwt-key-2026`, `dev-secret-change-me`). Evidence: [`server/src/config/env.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/config/env.js#L129-L138).
- **Subject & Database Hydration**: On every authenticated request, `authenticate` middleware decodes the JWT subject (`sub`), queries the database for the active user record (`User.findById`), strips `passwordHash`, and verifies `user.isActive === true`. Deactivated accounts immediately return HTTP 401 `UNAUTHENTICATED`. Evidence: [`server/src/middleware/auth.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/auth.js#L40-L45).

### 2.3 Role-Based Access Control (RBAC)

- **Role Enforcement**: Implemented in [`server/src/middleware/authorize.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/authorize.js#L13-L22). Restricts routes to specified roles (e.g. `requireRole('admin')`). Unauthorized roles receive HTTP 403 `FORBIDDEN`.
- **Administrative Boundary**: All `/api/admin/*` routes are protected by `router.use(authenticate, requireRole('admin'))`. Evidence: [`server/src/routes/adminRoutes.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/routes/adminRoutes.js#L44).
- **Document Ownership Gating**: Citizen document deletion enforces ownership: citizens may only delete documents where `uploadedBy === req.user.id`; administrators have system-wide deletion rights. Evidence: [`server/src/controllers/documentController.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/controllers/documentController.js#L201-L208).

### 2.4 Strict Schema Validation (Zod)

- **Centralized Validation Middleware**: [`server/src/middleware/validate.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/validate.js) validates `body`, `query`, and `params` against strict Zod schemas, returning standardized HTTP 400 `VALIDATION_ERROR` responses with field-level details.
- **ObjectId Route Parameter Hardening**: Hexadecimal 24-character MongoDB ObjectIds are strictly enforced on all `:id` parameters via `documentIdParamSchema` and `sourceIdParamSchema`, preventing unhandled casting exceptions or injection strings from reaching the database. Evidence: [`server/src/validators/documentValidators.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/validators/documentValidators.js) and [`server/src/validators/sourceValidators.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/validators/sourceValidators.js).

### 2.5 PDF Upload Security & File Handling

- **MIME & Extension Whitelisting**: Accepts only `.pdf` extension with `application/pdf` or `application/x-pdf` MIME types. Evidence: [`server/src/middleware/upload.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/upload.js#L26-L37).
- **Magic-Byte Header Verification**: In addition to MIME checks, `verifyPdfMagicBytes` reads the first 1024 bytes of the disk file and confirms the presence of `%PDF-`. Files failing this check are unlinked immediately and rejected with HTTP 415 `UNSUPPORTED_MEDIA_TYPE`. Evidence: [`server/src/middleware/upload.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/upload.js#L104-L134).
- **Size & Page Limits**: Enforces `MAX_UPLOAD_MB` (default 10MB) via Multer `limits.fileSize` and `MAX_PDF_PAGES` (default 300 pages) in `pdfService.js`.
- **Temporary Storage Isolation**: Uploads land in a dedicated `storage/tmp` directory with UUID-based filenames (`tmp_<uuid>.pdf`). Stored PDFs are permanently unlinked upon successful text extraction unless `KEEP_UPLOADED_FILES=true`. Evidence: [`server/src/services/fileStorageService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/fileStorageService.js#L54-L62).
- **Path Traversal Mitigation**: `resolveSafePath` detects and rejects directory separators (`/`, `\\`) and traversal sequences (`..`) in `storedName`, returning HTTP 400 `VALIDATION_ERROR` and logging security warnings. Evidence: [`server/src/services/fileStorageService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/fileStorageService.js#L73-L86).

### 2.6 Server-Side Request Forgery (SSRF) Mitigations

- **Source URL Validation**: When administrators register official crawling sources (`POST /api/admin/sources`), `sourceUrlSchema` validates that the URL uses `http:` or `https:`, contains no embedded credentials, and does not resolve to disallowed hostnames. Evidence: [`server/src/validators/sourceValidators.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/validators/sourceValidators.js#L30-L75).
- **Disallowed IP & Hostname Filtering**: Rejects loopback (`127.0.0.0/8`, `::1`), RFC 1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), Carrier-Grade NAT (`100.64.0.0/10`), link-local / cloud metadata (`169.254.0.0/16`, `169.254.169.254`, `metadata.google.internal`, `instance-data`), IPv6 unique local (`fc00::/7`, `fe80::/10`), and IPv4-mapped IPv6 (`::ffff:127.0.0.1` and WHATWG hex variants).
- **Socket-Level DNS Guard**: During official source crawling, `fetchSource` uses `createSafeLookup` to intercept DNS resolution for both HTTP and HTTPS agents via `dns.lookup({ all: true })`. Every resolved IP address is verified against `isDisallowedIp` before initiating the TCP socket connection. Evidence: [`server/src/services/fetchService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/fetchService.js#L74-L115).
- **Redirect Pinning & Hop Limits**: Follows a maximum of 3 manual redirects (`maxHops = 3`). Redirect destinations must remain on the exact initial source hostname (`currentParsed.hostname.toLowerCase() === sourceHostname`), completely blocking redirect-based SSRF into private networks. Evidence: [`server/src/services/fetchService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/fetchService.js#L157-L164).

### 2.7 Network & Protocol Protections

- **CORS Allowlist**: `corsMiddleware` parses `CLIENT_ORIGIN` into an explicit whitelist. Browser origins not matching the whitelist receive HTTP 403 `FORBIDDEN`. Server-to-server requests without browser origin headers (curl, mobile) are permitted. Evidence: [`server/src/middleware/security.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/security.js#L25-L42).
- **Helmet Security Headers**: Strict Content-Security-Policy (`defaultSrc: ["'none'"]`, `baseUri: ["'none'"]`, `frameAncestors: ["'none'"]`) and Cross-Origin Resource Policy (`policy: 'cross-origin'`). Evidence: [`server/src/middleware/security.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/security.js#L8-L18).
- **HTTP Parameter Pollution (HPP)**: Express middleware `hpp()` active on all incoming requests to prevent query parameter array injection attacks. Evidence: [`server/src/middleware/security.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/security.js#L50).
- **NoSQL Query Sanitization**: `express-mongo-sanitize({ replaceWith: '_' })` strips prohibited MongoDB operator characters (`$` and `.`) from request bodies and query parameters. Evidence: [`server/src/middleware/security.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/security.js#L45-L47).
- **Multi-Tier Rate Limiting**:
  - Global: 300 requests / 15 minutes (`RATE_LIMIT_GLOBAL_MAX`), with health probes (`/api/health*`) skipped.
  - Authentication: 10 requests / 15 minutes (`RATE_LIMIT_AUTH_MAX`).
  - AI Interactivity: 20 requests / 1 minute (`RATE_LIMIT_AI_PER_MIN`), keyed by User ID or IP.
  - PDF Upload: 10 requests / 1 hour (`RATE_LIMIT_UPLOAD_PER_HOUR`), keyed by User ID or IP.
  - Evidence: [`server/src/middleware/rateLimiters.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/rateLimiters.js).

### 2.8 Logging & Data Privacy

- **Pino Structured Redaction**: Redacts sensitive properties before logs are written: `authorization`, `cookie`, `password`, `token`, `refreshToken`, and nested body/header variants. Evidence: [`server/src/utils/logger.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/utils/logger.js#L9-L26).
- **Production Error Sanitization**: In production (`NODE_ENV === 'production'`), unhandled errors return generic messages (`Internal server error`) without stack traces or server paths. Database `CastError` exceptions are masked into HTTP 400 `INVALID_ID`, and duplicate key errors (code `11000`) return HTTP 409 `RESOURCE_CONFLICT` without exposing indexed values. Evidence: [`server/src/middleware/errorHandler.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/middleware/errorHandler.js).

---

## 3. Partially Implemented Controls

| Control                             | Current State                                                                                                                              | Nuance / Caveat                                                                                                                                                                                                                                         |
| :---------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Token Invalidation / Revocation** | Client-side token purge (`tokenStorage.removeToken()`) upon receiving HTTP 401; immediate database deactivation (`user.isActive = false`). | The server is **stateless** with regard to active tokens. It does not maintain an active token revocation blocklist (e.g. Redis). A valid JWT remains cryptographically verifiable until expiry unless the user account is deactivated in the database. |
| **Audit Logging**                   | High-value actions (login failures, document uploads, source modifications) create `AuditLog` documents with a 180-day MongoDB TTL index.  | Read-only operations (`GET /api/documents`, `GET /api/search`) are intentionally omitted from audit tables to avoid database exhaustion.                                                                                                                |
| **OCR Security**                    | OCR evaluation flags documents requiring OCR when > 80% of pages are empty.                                                                | Local OCR via `tesseract.js` is disabled by default (`ENABLE_OCR=false`) to preserve server resources and avoid native binary memory overhead in serverless/container environments.                                                                     |

---

## 4. Known Limitations

1. **In-Process Ingestion Daemon**: The background crawler and extraction pipeline (`IngestionRunner`) runs inside the Node.js process using atomic MongoDB locking. While bounded and concurrent, horizontal scaling across multiple instances requires configuring distinct worker nodes or migrating to a dedicated queue (e.g. BullMQ / Redis) in enterprise deployments.
2. **Local Storage of Auth Tokens**: The frontend stores JWTs in browser `localStorage`. While wrapped in safe exception handlers and guarded by strict Content-Security-Policy against XSS, `localStorage` remains accessible to script executions within the origin compared to `HttpOnly` SameSite cookies.
3. **No Database Encryption at Rest**: Encryption at rest is governed by MongoDB Atlas underlying storage infrastructure (AWS EBS / GCP Persistent Disk encryption), not application-level field encryption.
4. **No Rate-Limit Sharing Across Instances**: Rate limiting uses in-memory tracking (`express-rate-limit` default memory store). In multi-instance deployments behind load balancers, rate limits apply per-instance unless backed by an external Redis store.

---

## 5. Recommended Future Improvements

1. **HttpOnly Cookie Authentication**: Migrate JWT storage from `localStorage` to `HttpOnly`, `Secure`, `SameSite=Strict` cookies with CSRF double-submit tokens.
2. **Distributed Redis Rate Limiter**: Replace memory stores in `express-rate-limit` with `rate-limit-redis` for cluster-wide enforcement.
3. **Automated Token Revocation List**: Introduce a low-latency Redis blocklist for immediate token revocation upon password change or admin kick.
4. **ClamAV Antivirus Pipeline**: Add streaming antivirus inspection for uploaded PDF files before temporary disk persistence.
5. **Content-Security-Policy Reporting**: Configure a CSP reporting URI (`report-to` / `report-uri`) to collect real-time client violation telemetry.
