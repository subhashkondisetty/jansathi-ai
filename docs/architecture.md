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
