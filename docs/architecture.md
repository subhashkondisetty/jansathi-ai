# JanSathi AI Architecture

JanSathi AI is built as a modular MERN-stack monorepo designed to empower Indian citizens with accurate, transparent access to government schemes, notifications, and eligibility criteria. The architecture separates concerns between a mobile-first, responsive React 18 client and a robust Node.js/Express 4 backend with MongoDB Atlas persistence. Non-AI workflows (authentication, scheme discovery, document ingestion, and administrative oversight) form the bedrock of the platform, with well-defined hook points prepared for AI, translation, RAG, and vector search capabilities in subsequent phases.

---

## 1. Document Ingestion Pipeline Architecture

The ingestion pipeline (`services/ingestionService.js`, `jobs/ingestionRunner.js`) operates asynchronously without external dependencies (no Redis), coordinating work through atomic MongoDB status claims.

```mermaid
flowchart TD
    A["Trigger: PDF Upload (Citizen) or Source Ingest (Admin)"] --> B["Create IngestionJob (status: queued)"]
    B --> C["Runner: Atomically claim job (findOneAndUpdate)"]
    C --> D{"Job Type"}

    D -->|"upload"| E["Read stored PDF from disk"]
    D -->|"source_fetch"| F["fetchService: SSRF check, DNS lookup, max 3 redirects"]

    F --> G["Compute Checksum & Dedupe / Versioning"]
    G -->|"Identical duplicate"| H["skipped_duplicate (update fetchedAt)"]
    G -->|"New version / initial"| I["Extract Content"]

    E --> I{"Extraction Service"}
    I -->|"PDF"| J["pdfService: pdfjs-dist line ordering"]
    I -->|"HTML"| K["htmlService: Cheerio heading segmentation"]

    J --> L{"Empty page ratio > 80%?"}
    L -->|"Yes & ENABLE_OCR=false"| M["Fail: OCR_REQUIRED (needs_ocr)"]
    L -->|"Yes & ENABLE_OCR=true"| N["ocrService: tesseract.js fallback"]
    L -->|"No"| O["textCleaner: NFC normalisation & de-hyphenation"]
    N --> O
    K --> O

    O --> P["scriptDetect: Identify language (te, hi, ta, en, unknown)"]
    P --> Q["chunkingService: Sentence split, overlap, denormalized metadata"]
    Q --> R["Batch Insert: DocumentPage & DocumentChunk (batch size 200)"]
    R --> S["Update Document: status: ready, extraction stats"]
    S --> T["Complete Job: status: succeeded, stage: done"]
```

---

## 2. Ingestion Job State Machine

```mermaid
stateDiagram-v2
    [*] --> queued: Enqueued via Upload or Admin Trigger
    queued --> running: IngestionRunner atomic claim
    running --> fetching: Source jobs only
    fetching --> extracting: Bytes retrieved
    extracting --> cleaning: Pages extracted
    cleaning --> chunking: Text normalized
    chunking --> storing: Chunks generated
    storing --> succeeded: Pages & chunks inserted (batches of 200)

    running --> skipped_duplicate: Content checksum matches existing document
    running --> queued: Transient error (attempts < maxAttempts, exponential backoff)
    running --> failed: Non-retriable error OR attempts >= maxAttempts

    failed --> queued: Admin manual retry (/ingestion-jobs/:id/retry)
    succeeded --> [*]
    skipped_duplicate --> [*]
```

---

## 3. Error Classification & Retry Policy

| Error Code / Scenario                                      | Retriable? | Policy & Backoff Behavior                                                                  | Target Document Status           |
| :--------------------------------------------------------- | :--------- | :----------------------------------------------------------------------------------------- | :------------------------------- |
| **Network timeout / DNS drop** (`ETIMEDOUT`, `ECONNRESET`) | **Yes**    | Exponential backoff ($5000 \times 2^{\text{attempt}-1} + \text{jitter}$), up to 3 attempts | Remains `processing` until retry |
| **HTTP 429 / 5xx**                                         | **Yes**    | Requeued with backoff delay                                                                | Remains `processing` until retry |
| **Database transient**                                     | **Yes**    | Requeued with backoff delay                                                                | Remains `processing` until retry |
| **SSRF Blocked** (`SSRF_BLOCKED`)                          | **No**     | Immediate failure, logged to security audit                                                | `failed`                         |
| **HTTP 404 / 410 / 403**                                   | **No**     | Immediate failure                                                                          | `failed`                         |
| **Corrupt PDF** (`PDF_CORRUPT`)                            | **No**     | Immediate failure                                                                          | `failed`                         |
| **Encrypted PDF** (`PDF_ENCRYPTED`)                        | **No**     | Immediate failure                                                                          | `failed`                         |
| **Exceeded Pages** (`PDF_TOO_MANY_PAGES`)                  | **No**     | Immediate failure                                                                          | `failed`                         |
| **Scanned Image** (`OCR_REQUIRED`)                         | **No**     | Immediate failure                                                                          | `needs_ocr`                      |
| **Unsupported Content** (`UNSUPPORTED_CONTENT`)            | **No**     | Immediate failure                                                                          | `failed`                         |
| **Max Retries Exceeded**                                   | **No**     | Marked `failed` with code `MAX_RETRIES_EXCEEDED`                                           | `failed`                         |

---

## 4. Where AI Plugs In (AI Integration Architecture)

JanSathi AI was architected from inception as a decoupled, modular system where the core non-AI MERN data layer functions independently. In Phase 7, stable hook shells and interfaces are established across six services. When AI capabilities are enabled on "AI-Day", they replace these stubs without modifying database schemas, API routes, or client-facing contracts.

```mermaid
flowchart TD
    subgraph Client["Citizen & Admin Client"]
        A1["GET /api/search"]
        A2["POST /api/ai/ask"]
        A3["POST /api/ai/eligibility"]
        A4["POST /api/verify/claim"]
        A5["GET /api/history"]
    end

    subgraph Security["API Gateway & Middleware"]
        B1["authenticate (JWT HS256)"]
        B2["createAiLimiter (User-keyed Rate Limit)"]
        B3["validate (Zod Strict Schemas)"]
    end

    subgraph Services["Core & AI Hook Services"]
        C1["retrievalService\n(Text Search -> Vector Swap Point)"]
        C2["ragService\n(Grounding & Synthesis)"]
        C3["eligibilityService\n(Multi-Rule Evaluator)"]
        C4["verificationService\n(Stance Classifier)"]
        C5["conversationService\n(Session & Message Limits)"]
        C6["aiService & embeddingService\n(LLM & Embedding Models)"]
    end

    subgraph Storage["MongoDB Atlas"]
        D1[("DocumentChunk\n(text index + Atlas Vector Search)")]
        D2[("Conversation\n(max 200 messages)")]
        D3[("Claim\n(verification records)")]
        D4[("AuditLog\n(tamper-evident TTL logs)")]
    end

    A1 --> B1 --> C1 --> D1
    A5 --> B1 --> C5 --> D2

    A2 --> B1 --> B2 --> B3 --> C2
    A3 --> B1 --> B2 --> B3 --> C3
    A4 --> B1 --> B2 --> B3 --> C4

    C2 --> C1
    C2 --> C6
    C2 --> C5
    C3 --> C1
    C3 --> C6
    C4 --> C1
    C4 --> C6
    C4 --> D3
```

### Specific Component Plug-In Points:

1. **`retrievalService` (Search Swap Point)**:
   - **Current (Phase 7)**: MongoDB `$text` search over `DocumentChunk` with `score: { $meta: 'textScore' }`, metadata filtering, and strict visibility scoping.
   - **AI-Day Swap**: Incorporates `$vectorSearch` alongside `$text` to perform Reciprocal Rank Fusion (RRF) hybrid retrieval. The external interface `retrieve({ query, filters, limit, user })` remains identical.
2. **`embeddingService`**:
   - **Current (Phase 7)**: Shell exporting `embedTexts()` and `embedQuery()`, throwing `NotImplementedError`.
   - **AI-Day Swap**: Generates dense vectors (e.g. 768-dim `text-embedding-004`) for background chunks during the `chunking` ingestion stage and for queries in `retrievalService`.
3. **`aiService`**:
   - **Current (Phase 7)**: Shell exporting `generateStructured()` and `translate()`.
   - **AI-Day Swap**: Connects to the LLM runtime with forced JSON Schema validation (`responseSchema`) and few-shot civic system prompts.
4. **`ragService`**:
   - **Current (Phase 7)**: Shell throwing `NotImplementedError('ragService.answerQuestion')`.
   - **AI-Day Swap**: Retrieves relevant chunks, verifies grounding against source URLs, builds structured answer sections (`summary`, `eligibility`, `benefits`, `documents`, `deadline`, `applicationProcess`), and appends to `conversationService`.
5. **`eligibilityService`**:
   - **Current (Phase 7)**: Shell throwing `NotImplementedError('eligibilityService.checkEligibility')`.
   - **AI-Day Swap**: Extracts structured eligibility clauses from official scheme documents and evaluates applicant attributes against them.
6. **`verificationService`**:
   - **Current (Phase 7)**: Shell throwing `NotImplementedError('verificationService.verifyClaim')`.
   - **AI-Day Swap**: Evaluates public claims against official circulars, determines factual stance (`supported`, `contradicted`, `unverified`), and saves audit records to `claimService`.
