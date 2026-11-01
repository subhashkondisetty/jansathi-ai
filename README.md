# JanSathi AI (जन साथी AI / జన్ సాథీ AI / ஜன் சாதி AI)

> **Event**: FORGE '26 — Theme 1: "Civic Pulse"  
> **Problem Statement**: Bridging the critical civic information asymmetry in India by delivering verified, accessible, and transparent access to official government gazettes, welfare schemes, and circulars.  
> **Architecture**: MERN Stack Monorepo with Strict Non-AI Foundation Governance.

---

## 1. Project Overview & Problem Statement

Indian citizens frequently struggle to navigate the vast, fragmented landscape of government welfare programs, notifications, and gazettes. Misinformation, complex bureaucratic language, outdated eligibility criteria, and lack of regional language accessibility create severe barriers for eligible beneficiaries.

**JanSathi AI** solves this problem by providing a verified civic intelligence platform that indexes official gazettes and policy documents directly from authentic government portals, extracts text through deterministic OCR and parser pipelines, enforces rigorous cryptographic deduplication, and presents structured information in regional languages (English, Hindi, Telugu, Tamil).

### Civic Safety Philosophy (Non-AI Foundation Governance)

In strict compliance with FORGE '26 standards:

- **Zero Hallucination / Zero Fake Data**: The application produces zero synthetic scheme details, zero fabricated application deadlines, and zero canned AI responses.
- **Strict Non-AI Foundation**: All conversational RAG, eligibility evaluation, and fact-checking endpoints (`/api/ai/ask`, `/api/ai/eligibility`, `/api/verify/claim`) return HTTP 501 `NOT_IMPLEMENTED`. The frontend honestly informs citizens of planned capabilities while keeping authentic gazette texts and search results immediately accessible.

---

## 2. Implemented Features

### Citizen Portal

- **Document Catalog & Reader**: Browse, filter, and inspect verified government schemes and gazettes by state, category, and document type.
- **Extracted Text Reader**: Read authentic extracted OCR text pages directly from MongoDB (`/pages`), with full page pagination and token counts.
- **SHA-256 Verification**: Every document displays its cryptographic SHA-256 checksum for tamper-evident provenance.
- **Secure PDF Upload**: Citizen upload pipeline with `%PDF-` magic-byte verification, automatic temporary file cleanup, and background ingestion.
- **Full-Text Keyword Search**: High-performance MongoDB `$text` search over extracted chunks with textScore ranking and visibility shielding.
- **Multilingual Support**: Real-time language switching across English (`en`), Hindi (`hi`), Telugu (`te`), and Tamil (`ta`).
- **AI-Ready Citizen Interfaces**: Production-grade citizen pages for Civic Assistant (`/assistant`), Scheme Eligibility Evaluator (`/eligibility`), Document Explainer (`/explainer`), and Claim Verification (`/verify`), with transparent HTTP 501 handling and live backend probe polling.

### Administrative Control Center (`/admin/*`)

- **Executive Dashboard**: 100% database-backed metrics for corpus totals, document status breakdowns, ingestion queues, and official sources.
- **Document Editorial Management**: Edit metadata, inspect raw checksums, and perform non-optimistic document deletions with confirmation dialogs.
- **Ingestion Job Queue Monitor**: Track background crawler and upload jobs across all lifecycle states (`queued`, `running`, `succeeded`, `failed`, `skipped_duplicate`), inspect sanitized error logs, and trigger single-click manual retries for failed jobs.
- **Official Source Management**: Register and manage official government crawling sources with deep SSRF defense, active status toggles, and on-demand crawl triggers (HTTP 202).
- **Analytics & Telemetry**: Database-backed distribution charts separating public-ready documents from total corpus counts, and live system status probes (`/api/health`, `/api/health/ready`, `/api/ai/status`).

---

## 3. Technology Stack

- **Runtime**: Node.js 20+ (ES Modules throughout).
- **Package Manager**: npm workspaces (`client`, `server`).
- **Frontend**: React 18, Vite 5, React Router 6, Tailwind CSS 3.4, Axios, Lucide Icons.
- **Backend**: Express 4, Mongoose 8, MongoDB Atlas, Zod 3, Pino 10, Multer 2, pdfjs-dist, Cheerio.
- **Security**: Helmet, CORS, express-mongo-sanitize, hpp, express-rate-limit, bcryptjs.
- **Testing & Quality**: Vitest 5 (156 unit tests across 14 suites), ESLint 9 (Flat Config), Prettier.

---

## 4. Repository Structure

```
Janshanti/
├── client/                     # Vite + React 18 Frontend Workspace
│   ├── public/                 # Static assets & web manifest
│   ├── src/
│   │   ├── components/         # Common, layout, navigation & admin components
│   │   ├── context/            # AuthContext, LanguageContext, OptionsContext, ToastContext
│   │   ├── hooks/              # Custom React hooks (useOptions, etc.)
│   │   ├── pages/              # Citizen pages & /pages/admin/ views
│   │   ├── services/           # api.js, authService, documentService, adminService, aiService
│   │   └── utils/              # Token storage & formatting helpers
│   ├── .env.example            # Client environment template
│   ├── package.json            # Client dependencies and scripts
│   ├── tailwind.config.js      # Civic palette and typography
│   ├── vercel.json             # Vercel SPA routing configuration
│   └── vite.config.js          # Vite config with /api proxy
├── server/                     # Node.js + Express 4 Backend Workspace
│   ├── scripts/                # Database maintenance (syncIndexes.js, createAdmin.js)
│   ├── src/
│   │   ├── config/             # env.js (Zod schema), db.js (Atlas connection)
│   │   ├── controllers/        # Express route controllers
│   │   ├── jobs/               # Background IngestionRunner daemon
│   │   ├── middleware/         # Security, auth, authorize, upload, rateLimiters, errorHandler
│   │   ├── models/             # 9 Mongoose data schemas (User, Document, Chunk, Job, etc.)
│   │   ├── routes/             # Express API route modules
│   │   ├── services/           # Ingestion, extraction, search, storage, and AI hook shells
│   │   ├── utils/              # Pino logger, ApiError, asyncHandler, response envelopes
│   │   └── validators/         # Zod validation schemas
│   ├── storage/                # Temporary local upload storage (gitignored)
│   ├── tests/                  # 14 Vitest unit test suites
│   ├── .env.example            # Server environment template
│   └── package.json            # Server dependencies and scripts
├── docs/                       # Technical Documentation
│   ├── ARCHITECTURE.md         # System architecture & Mermaid diagrams
│   ├── API.md                  # Authoritative API reference
│   ├── SECURITY.md             # Security controls & threat model
│   ├── DEPLOYMENT.md           # Atlas + Render + Vercel deployment guide
│   └── AI_INTEGRATION_CHECKLIST.md # Handover checklist for future AI enablement
├── .env.example                # Root monorepo environment template
├── .gitignore                  # Comprehensive git exclusion rules
├── eslint.config.js            # Unified ESLint 9 configuration
├── package.json                # Monorepo root workspace configuration
└── present.md                  # Project progress & milestone tracking
```

---

## 5. Prerequisites & Local Installation

### Prerequisites:

- **Node.js**: v20 or higher (`node -v`)
- **npm**: v10 or higher (`npm -v`)
- **MongoDB Atlas** or local MongoDB instance (`mongodb://127.0.0.1:27017/jansathi`)

### Installation:

```bash
# 1. Clone repository
git clone <repository_url>
cd Janshanti

# 2. Install monorepo dependencies across all workspaces
npm install

# 3. Configure local environment
cp .env.example .env
```

---

## 6. Environment Configuration

Configure `.env` in the repository root (see [`.env.example`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/.env.example) for detailed annotations):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jansathi
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_a_secure_random_string_of_at_least_32_characters
LOG_LEVEL=info
```

Generate a secure 32+ character hex string for `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 7. Development & Testing Commands

All commands can be run from the repository root:

```bash
# Start both Backend API and Frontend Vite client concurrently:
npm run dev

# Start individual workspaces:
npm run dev:server    # Backend API on http://localhost:5000
npm run dev:client    # Frontend Client on http://localhost:5173

# Run backend automated unit test suite (156 Vitest tests in server workspace):
npm test

# Static code analysis (both client and server):
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix

# Code formatting check (all workspace files):
npm run format:check  # Prettier verification
npm run format        # Prettier auto-format

# Frontend production build:
npm run build         # Vite production bundle in client/dist/

# Database index synchronization:
npm run --workspace=server db:sync-indexes

# Bootstrap initial administrator account (safe secret injection without command history logging):
read -s -p "Enter Admin Password: " ADMIN_PASS; echo ""; ADMIN_PASSWORD="$ADMIN_PASS" npm run --workspace=server create-admin -- --email="admin@jansathi.gov.in" --name="System Administrator"; unset ADMIN_PASS
```

---

## 8. API Overview

The backend exposes authenticated and public endpoints under `/api`:

| Method   | Path                       | Auth / Role    | Description                                                   |
| :------- | :------------------------- | :------------- | :------------------------------------------------------------ |
| `GET`    | `/api/health`              | Public         | Liveness probe (uptime, memory, DB status)                    |
| `GET`    | `/api/health/ready`        | Public         | Readiness probe (MongoDB Atlas connection check)              |
| `POST`   | `/api/auth/register`       | Public         | Citizen registration                                          |
| `POST`   | `/api/auth/login`          | Public         | User authentication (returns Bearer JWT)                      |
| `GET`    | `/api/meta/options`        | Public         | Reference configuration arrays & upload limits                |
| `GET`    | `/api/documents`           | Public / Admin | Document library with search, filtering, and pagination       |
| `GET`    | `/api/documents/facets`    | Public         | Aggregated facets across public ready documents               |
| `GET`    | `/api/documents/:id`       | Public         | Document metadata by ObjectId                                 |
| `GET`    | `/api/documents/:id/pages` | Public         | Extracted OCR text pages                                      |
| `POST`   | `/api/documents/upload`    | Authenticated  | Secure PDF upload with magic bytes & deduplication            |
| `DELETE` | `/api/documents/:id`       | Owner / Admin  | Delete document and associated pages/chunks                   |
| `GET`    | `/api/search`              | Public         | Keyword search over document chunks via `$text`               |
| `GET`    | `/api/admin/*`             | Admin          | Administrative sessions, jobs, sources, and documents         |
| `POST`   | `/api/ai/ask`              | Authenticated  | AI assistant hook shell (Returns 501 `NOT_IMPLEMENTED`)       |
| `POST`   | `/api/ai/eligibility`      | Authenticated  | Scheme eligibility hook shell (Returns 501 `NOT_IMPLEMENTED`) |
| `POST`   | `/api/verify/claim`        | Authenticated  | Claim verification hook shell (Returns 501 `NOT_IMPLEMENTED`) |

For the complete API contract, request schemas, and error shapes, refer to [`docs/API.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/API.md).

---

## 9. Production Deployment Overview

JanSathi AI is prepared for production deployment across:

- **MongoDB Atlas**: Managed replica set database cluster.
- **Render**: Node.js 20+ web service running the Express API.
- **Vercel**: Static web hosting for the Vite React client with SPA rewrites (`client/vercel.json`).

For full step-by-step instructions, environment checklists, and rollback plans, refer to [`docs/DEPLOYMENT.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/DEPLOYMENT.md).

---

## 10. Known Limitations & Roadmap

1. **AI Inference Status**: Conversational Q&A, eligibility reasoning, and circular verification return HTTP 501 `NOT_IMPLEMENTED`. The underlying pipeline handover checklist is documented in [`docs/AI_INTEGRATION_CHECKLIST.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/AI_INTEGRATION_CHECKLIST.md).
2. **In-Process Background Daemon**: Ingestion jobs are coordinated via MongoDB atomic status locks inside the server process. Multi-instance cluster scaling will benefit from an external Redis/BullMQ queue.
3. **Local OCR Overhead**: Client-uploaded PDF text extraction runs via `pdfjs-dist`. Scanned image-only PDFs are flagged as `needs_ocr`; fallback local OCR via `tesseract.js` is disabled by default to conserve server resources.
