# JanSathi AI — Architectural Decision Records (`AI_TECHNOLOGY_DECISIONS.md`)

> **Project**: JanSathi AI (जन साथी AI)  
> **Hackathon**: FORGE '26 — Theme 1: Civic Pulse  
> **Milestone**: AI-01 — Architecture & Technology Selection (Final Corrected Specification)  
> **Status**: RATIFIED & SUPERSEDED DECISION HISTORY  
> **Version**: 3.0.0  
> **Author**: AI Solutions Architecture Team  
> **Date of Evaluation & Verification**: 2026-11-01

---

## Architectural Decision Records Ledger

| ADR ID        | Decision Title                                                                      | Status                                  | Technology / Architecture                                                                                      |
| :------------ | :---------------------------------------------------------------------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **ADR-01**    | Primary LLM: Gemini 1.5 Flash / Fallback: GPT-4o-mini                               | **SUPERSEDED**                          | Gemini 1.5 Flash (Retired) / GPT-4o-mini (Deprecated)                                                          |
| **ADR-01-R2** | Primary LLM Candidates: Gemini 3.8 Flash / Gemini 2.5 Flash / Fallback: GPT-6 Luna  | **Provisional / Requires Benchmarking** | Candidates preserved; no production provider hardcoded prior to empirical benchmarking                         |
| **ADR-02**    | Multilingual Embedding Model: `text-embedding-004`                                  | **SUPERSEDED**                          | `text-embedding-004` (Shut down Jan 14, 2026)                                                                  |
| **ADR-02-R2** | Multilingual Embedding Candidates: `gemini-embedding-2` vs `text-embedding-3-small` | **Provisional / Requires Benchmarking** | Candidates preserved; scoped to Milestone AI-03 (not AI-02)                                                    |
| **ADR-03**    | Vector Storage Engine & Indexing Topology                                           | **Approved**                            | MongoDB Atlas Vector Search on `DocumentChunk.embedding`                                                       |
| **ADR-04**    | Single-Pipeline Hybrid Search Merging                                               | **SUPERSEDED**                          | Assumed direct pipeline combination of `$text` and `$vectorSearch`                                             |
| **ADR-04-R2** | Parallel Dual-Query Retrieval & Application-Level RRF ($k=60$)                      | **Approved**                            | Separate queries, consistent filters, chunk deduplication, deterministic tie-breaking, document diversity      |
| **ADR-05**    | Unconditional 0.72 Cosine Threshold & Substring Check                               | **SUPERSEDED**                          | Fixed 0.72 threshold and naive substring validation                                                            |
| **ADR-05-R2** | Five-Stage Citation Validation, Probabilistic Entailment & Structured Abstention    | **Approved**                            | 5 stages, probabilistic entailment calibration, 5 machine-readable abstention reasons, exactly 500 items       |
| **ADR-06**    | Regex Masking & XML Delimiters as Complete Defense                                  | **SUPERSEDED**                          | Claimed complete anonymization and complete injection defense                                                  |
| **ADR-06-R2** | Layered Privacy Controls & Untrusted Content Isolation                              | **Approved**                            | Layered redaction checkpoints, multilingual detection, fail-closed behavior, untrusted content boundary        |
| **ADR-07-R1** | Deterministic Eligibility Engine & Versioned, Effective-Dated Rules                 | **Approved**                            | Versioned & effective-dated schema, freshness metadata, amendment uncertainty disclosure, statutory non-denial |

---

## ADR-01 (SUPERSEDED): Primary LLM: Gemini 1.5 Flash / Fallback: GPT-4o-mini

- **Original Status**: Accepted (2026-11-01)
- **Superseded By**: **ADR-01-R2**
- **Context & Reason for Supersession**: Official provider documentation confirms that `gemini-1.5-flash` is retired and must not be used for a new production integration. Furthermore, OpenAI announced the deprecation of `gpt-4o-mini` on October 14, 2026, with an API shutdown date of January 14, 2027. Neither model can serve as the primary or default fallback.

---

## ADR-01-R2: Primary LLM Candidates: Gemini 3.8 Flash / Gemini 2.5 Flash / Fallback: GPT-6 Luna

### Status

- Primary Candidate A (`gemini-3.8-flash`): **Provisional**
- Primary Candidate B (`gemini-2.5-flash`): **Requires Benchmarking**
- Fallback Candidate (`gpt-6-luna`): **Provisional**
- **Governance Constraint**: No production LLM provider is hardcoded at this architectural phase. Selection remains open to empirical benchmarking in Milestone AI-05 and AI-06.

### Context & Problem Statement

JanSathi AI requires high-fidelity civic reasoning, native structured output enforcement (`responseSchema`), large context capacity to process extensive gazettes, and low latency across four languages (English, Hindi, Telugu, Tamil). Upstream provider dependencies must be decoupled via a provider-agnostic adapter.

### Decision

1. **Primary Candidates**: Evaluate **Google Gemini 3.8 Flash** (`gemini-3.8-flash`) as the primary candidate and **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) as a cost-efficient alternative.
2. **Fallback Candidate**: Evaluate **OpenAI GPT-6 Luna** (`gpt-6-luna`), OpenAI's documented successor to the deprecated `gpt-4o` / `gpt-4o-mini` family.
3. **Structured Output Enforcement**: Enforce strict JSON Schema validation (`responseSchema` in Gemini, strict `json_schema` in OpenAI).
4. **Empirical Benchmarking Protocol**: Final provider lock will be determined in Milestone AI-05 / AI-06 through empirical evaluation against the 500-item JanSathi Indic Civic Dataset.
5. **Endpoint Contract Preservation**: All AI endpoints strictly preserve their HTTP 501 `NOT_IMPLEMENTED` status until backend implementations are verified in subsequent phases.

### Evaluation Matrix (Verified as of November 1, 2026)

- **Gemini 3.8 Flash**: Active; 1M context; Promotional pricing through Dec 31, 2026: $0.75 / 1M input, $3.75 / 1M output (including internal thinking tokens). Standard pricing from Jan 1, 2027: $1.50 input / $7.50 output.
- **Gemini 2.5 Flash**: Active; 1M context; $0.30 / 1M input, $2.50 / 1M output.
- **GPT-6 Luna**: Active; 272K context; $0.10 / 1M input, $0.50 / 1M output.

### Trade-offs & Rationale

- Gemini provides a 1M token context window, essential for ingesting full gazettes and circular amendments.
- Thinking tokens in Gemini 3.8 Flash are billed as output tokens; reasoning budgets must be explicitly capped.

---

## ADR-02 (SUPERSEDED): Multilingual Embedding Model: `text-embedding-004`

- **Original Status**: Accepted (2026-11-01)
- **Superseded By**: **ADR-02-R2**
- **Context & Reason for Supersession**: Official Gemini API deprecation documentation confirms that `text-embedding-004` was officially shut down on **January 14, 2026**. API calls to this model return 404/Not Found.

---

## ADR-02-R2: Multilingual Embedding Candidates: `gemini-embedding-2` vs `text-embedding-3-small`

### Status

- Candidate A (`gemini-embedding-2`): **Provisional**
- Candidate B (`text-embedding-3-small`): **Requires Benchmarking**
- **Milestone Ownership**: Embedding integration is explicitly scoped to **Milestone AI-03** (not AI-02).
- **Governance Constraint**: No embedding model is hardcoded at this architectural phase. Selection remains open to empirical benchmarking in Milestone AI-03.

### Context & Problem Statement

The embedding model must map citizen queries in colloquial regional languages (Hindi, Telugu, Tamil) to formal administrative circulars in English or state gazettes. Dimensions must be compatible with MongoDB Atlas Vector Search memory limits.

### Decision

1. Evaluate **Google `gemini-embedding-2`** as the leading candidate:
   - Supports 8,192 input tokens.
   - Flexible output dimensions from 128 to 3,072 (via Matryoshka Representation Learning).
   - Asymmetric task types: `RETRIEVAL_DOCUMENT` for circular chunks and `RETRIEVAL_QUERY` for citizen questions.
   - Standard pricing: $0.20 per 1M tokens ($0.10 per 1M tokens on Batch API).
2. Evaluate **OpenAI `text-embedding-3-small`** as an alternative candidate:
   - Supports 8,191 input tokens.
   - Supports dimension reduction to 512 or 1,536.
   - Pricing: $0.02 per 1M tokens ($0.01 per 1M tokens on Batch API).
3. **Core Safety Invariant**: **Never mix vectors from incompatible models, versions, or dimensions in the same search index.**

### Migration Strategy for Embedding Model Changes

1. Store model metadata on every chunk:
   ```javascript
   {
     embedding: [Number],
     embeddingModel: String,    // "gemini-embedding-2"
     embeddingDim: Number,      // 768
     embeddingVersion: Number   // 1
   }
   ```
2. When upgrading models, compute new embeddings into a parallel field `embedding_v2` using a background worker.
3. Build a new Atlas search index `vector_index_v2`.
4. Switch application queries to `vector_index_v2` only when 100% of chunks are populated.
5. Safely drop deprecated vector fields.

---

## ADR-03: Vector Storage Engine & Indexing Topology

### Status

**Approved**

### Context & Problem Statement

JanSathi AI already persists documents, chunks, and metadata in MongoDB Atlas. Introducing vector search must avoid distributed dual-store split-brain states and excessive hosting costs.

### Decision

Adopt **MongoDB Atlas Vector Search** directly within the existing `DocumentChunk` collection.

- Vector field: `DocumentChunk.embedding` (Array of Floats).
- Dimension: Configured to chosen candidate dimension (768 or 1536).
- Metric: `cosine`.
- Pre-filtering: Indexes filter fields (`isLatest`, `visibility`, `category`, `docType`, `ownerId`).

### Verification Findings

- **Transactional Consistency**: Deleting a document or superseding an older revision (`isLatest: false`) atomically updates the chunk and vector, eliminating orphan vector risks.
- **Backup & Recovery**: Standard Atlas snapshots cover documents, metadata, and vectors in a single consistent state.

---

## ADR-04 (SUPERSEDED): Single-Pipeline Hybrid Search Merging

- **Original Status**: Accepted (2026-11-01)
- **Superseded By**: **ADR-04-R2**
- **Context & Reason for Supersession**: The previous architecture assumed MongoDB `$text` and `$vectorSearch` could be combined inside a single aggregation pipeline. In MongoDB Atlas, `$vectorSearch` must be the first stage in an aggregation pipeline and cannot be combined directly with a `$text` stage in that same pipeline.

---

## ADR-04-R2: Parallel Dual-Query Retrieval, Implementation Details & Sparse Evaluation

### Status

**Approved**

### Context & Problem Statement

Government circulars contain both exact statutory codes (_"G.O.Ms.No. 45"_, _"PM-KISAN"_) and conceptual/multilingual prose. Full-text search and vector search must be executed and merged without pipeline syntax incompatibilities, while recognizing the linguistic limitations of sparse text search.

### Decision

1. **Parallel Dual-Query Execution**: Execute hybrid search as **two independent parallel queries** coordinated by `retrievalService.js`:
   - Dense Vector Aggregation: `$vectorSearch` as stage 1 with metadata pre-filtering (top 20 candidates).
   - Sparse Text Query: `$text: { $search: query }` on `chunk_text_idx` (top 20 candidates).
2. **Implementation Requirements**:
   - **Consistent Applicable Filters**: The exact same filter criteria (`isLatest: true`, `visibility: 'public'`, category, docType) must be applied to both queries.
   - **Chunk Deduplication**: Chunks appearing in both result sets must be deduplicated by `_id`, combining their reciprocal rank scores.
   - **Deterministic Tie-Breaking**: When two candidate chunks have identical RRF scores, tie-break deterministically: rank by dense vector score descending; if tied, rank by text score descending; if still tied, rank by chunk ObjectId string lexicographical order.
   - **Handling Missing or Empty Result Sets**: If either query returns zero results, the missing rank is treated as $\infty$, smoothly allowing single-mode candidates to populate the result list without runtime failure.
   - **Document Diversity Limit**: When selecting the final 5 chunks, no single `documentId` may contribute more than 2 chunks (unless the user query specifically filtered for a single `documentId`), preventing one lengthy circular from monopolizing the context window.
   - **Application-Level Fusion**: Merge candidates in Node.js memory using **Reciprocal Rank Fusion (RRF)** with smoothing constant $k = 60$:
     $$RRF(d) = \frac{1}{60 + r_{vector}(d)} + \frac{1}{60 + r_{text}(d)}$$
3. **Multilingual Text-Search Limitations & Evaluation Commitment**:
   - MongoDB `$text` performance, tokenization, and stemming **must be evaluated separately for English, Hindi, Telugu, and Tamil** on the 500-item evaluation dataset in Milestone AI-04.
   - Equivalent stemming, tokenization, or retrieval quality across these languages is **not assumed**.
   - No replacement search engine (e.g. Elasticsearch, Meilisearch) will be introduced without concrete empirical evidence demonstrating that MongoDB `$text` fails defined acceptance targets.

---

## ADR-05 (SUPERSEDED): Unconditional 0.72 Cosine Threshold & Substring Check

- **Original Status**: Accepted (2026-11-01)
- **Superseded By**: **ADR-05-R2**
- **Context & Reason for Supersession**: Hardcoding an unconditional 0.72 cosine threshold without empirical testing risks false rejections on colloquial queries and false acceptances on distractors. Furthermore, verifying that an excerpt is a verbatim substring of a page does NOT prove that the excerpt logically supports the model's claim.

---

## ADR-05-R2: Five-Stage Citation Validation, Probabilistic Entailment & Structured Abstention Reasons

### Status

**Approved**

### Context & Problem Statement

Citizens rely on JanSathi AI for statutory rights. The system must verify that citations are authentic, current, and logically support the claims made, under an evidence-grounded, citation-validated, abstention-first policy.

### Decision

1. **Revoke Unconditional 0.72 Threshold**: Thresholds will be calibrated using precision-recall curves from the exactly 500-item evaluation dataset.
2. **Implement Five-Stage Citation Validation**:
   - **Stage 1 (Document Identity)**: Verify `documentId` exists in MongoDB with `status: 'ready'`.
   - **Stage 2 (Page Identity)**: Verify `pageNumber` exists within `DocumentPage` records.
   - **Stage 3 (Excerpt Provenance)**: Verify verbatim presence of the excerpt on that specific `DocumentPage`.
   - **Stage 4 (Claim-to-Evidence Support / Entailment)**: Evaluates whether the cited excerpt logically entails the claim made. **Entailment verification is probabilistic in nature and requires calibrated empirical evaluation on the 500-item evaluation dataset, rather than being treated as an infallible guarantee.**
   - **Stage 5 (Document Freshness & Supersession)**: Confirm `isLatest === true`, check circular effective date, and verify no superseding circular revokes the clause.
3. **Structured Abstention Policy & Dynamic Explanations**:
   If reliable evidence is insufficient or any validation stage fails, the system **abstains unconditionally** using structured machine-readable reason codes:
   - `NO_VERIFIED_SOURCE`
   - `INSUFFICIENT_EVIDENCE`
   - `SOURCE_STALE`
   - `CONFLICTING_SOURCES`
   - `CITATION_VERIFICATION_FAILED`
     Citizen-facing explanations must **dynamically correspond to the specific abstention reason code**, rather than outputting a single static sentence.
4. **Evaluation Dataset Specification (Exactly 500 Items)**:
   - Balanced distribution of exactly 50 items per category ($10 \times 50 = 500$): English (50), Hindi (50), Telugu (50), Tamil (50), Cross-Language (50), Exact Scheme Names (50), GO Numbers (50), Outdated Circulars (50), Contradictory Documents (50), Unverifiable Distractors (50).
   - Annotation guidelines with ground-truth schema, inter-annotator agreement (Cohen's Kappa $\ge 0.85$), senior expert adjudication, 60/40 tuning/evaluation split, and per-language reporting.
   - Stated metric targets are **proposed acceptance targets**, NOT achieved results.

---

## ADR-06 (SUPERSEDED): Regex Masking & XML Delimiters as Complete Defense

- **Original Status**: Accepted (2026-11-01)
- **Superseded By**: **ADR-06-R2**
- **Context & Reason for Supersession**: Presenting regex masking as complete anonymization and XML tags as complete prompt-injection defense was overly optimistic. Regex has false negatives/positives, and XML delimiters do not prevent indirect prompt injection from crawled web content or malicious PDFs.

---

## ADR-06-R2: Layered Privacy Controls & Untrusted Content Isolation

### Status

**Approved**

### Context & Problem Statement

Indian citizen privacy (DPDP Act 2023) and system integrity must be protected against accidental PII disclosure and adversarial prompt injection.

### Decision

1. **Layered Privacy-Control Specification**:
   - Regex pattern matching is **one preliminary defense layer**, not complete anonymization.
   - Redaction must occur **before database persistence, before application logging, before embedding generation, and before external provider transmission**.
   - Raw citizen prompts, unredacted PII, and uploaded document contents are **strictly prohibited from application logs**.
   - Multilingual PII detection must account for Indic numeral representations (Devanagari, Telugu), spelled-out numbers, and regional language identity prefixes across English, Hindi, Telugu, and Tamil.
   - **Fail-Closed Behavior**: If an unclassifiable token sequence strongly indicative of structured personal identification cannot be confidently redacted, the system fails closed: transaction halts, sensitive data is discarded, and citizen is requested to re-submit inquiry without credentials.
   - **Technical Controls vs Contractual Commitments**: Technical controls (in-memory redaction, ephemeral processing) are strictly distinguished from contractual commitments (commercial enterprise zero-data-retention agreements). Both are required.
2. **Untrusted Content Boundary & Prompt-Injection Defense**:
   - A dedicated `system_instruction` parameter alone does not guarantee protection against prompt injection.
   - All external content—citizen input, uploaded PDFs, crawled HTML, and OCR text—is classified as **Untrusted Data**.
   - System instructions explicitly command the model never to follow instructions embedded in retrieved content.
   - Strict tool/action allowlists, strict JSON Schema validation, and automated red-team security tests in Milestone AI-09 using malicious instructions embedded in gazette PDFs.

---

## ADR-07-R1: Deterministic Eligibility Engine & Versioned, Effective-Dated Rules

### Status

**Approved**

### Context & Problem Statement

Evaluating citizen eligibility for government welfare requires explainability and determinism. Generative models must not make autonomous eligibility decisions.

### Decision

1. **Versioned, Effective-Dated, Source-Linked Rules Schema**:
   All eligibility rules evaluated by the deterministic engine must record:
   - `ruleId`: Unique string identifier.
   - `schemeId`: Document reference ObjectId.
   - `version`: Rule version number (incremented on amendment).
   - `effectiveFrom`: Statutory effective start date.
   - `effectiveTo`: Statutory end date (or null if currently active).
   - `sourceDocumentId`: Verified ObjectId of the gazette circular.
   - `sourcePageNumber`: Specific page number in `DocumentPage`.
   - `officialCircularRef`: Administrative reference code (e.g. "G.O.Ms.No. 45").
   - `criterionAttribute`: Specific demographic field evaluated.
   - `operator` & `thresholdValue`: Hard deterministic boundary condition.
2. **Document Freshness Metadata & Amendment Uncertainty Policy**:
   - Verification metadata includes `lastCheckedAt`, `lastVerifiedAt`, `verificationStatus` (`verified`, `stale`, `verification_required`), and source-specific `freshnessPolicy`.
   - **Semantics of `isLatest === true`**: Represents the database's internal current version designation, NOT proof that no newer government amendment exists in the real world.
   - When amendment coverage is uncertain or a document is flagged `stale` / `verification_required`, the assistant **must disclose this limitation clearly to the citizen and must not claim that no newer amendment exists**.
3. **Execution Separation & Non-Denial Policy**:
   - Hard demographic bounds are evaluated strictly by deterministic code against versioned criteria matrices.
   - The LLM is confined strictly to natural language explanation, terminology translation, and next-steps guidance.
   - Missing attributes produce `insufficient_information`. Rule conflicts produce `uncertainty`.
   - No automated denials; no binding benefit guarantees. Every evaluation concludes with the mandatory statutory disclaimer.
