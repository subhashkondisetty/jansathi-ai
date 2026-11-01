# JanSathi AI — Milestone AI-01 Architecture & Implementation Report (Final Corrected Specification)

> **Project**: JanSathi AI (जन साथी AI)  
> **Hackathon**: FORGE '26 — Theme 1: Civic Pulse  
> **Milestone**: AI-01 — Architecture & Technology Selection (Final Documentation Corrections)  
> **Status**: READY FOR AI-02 IMPLEMENTATION (PROVISIONAL TECHNOLOGY CHOICES RATIFIED)  
> **Version**: 3.0.0  
> **Date of Evaluation & Verification**: 2026-11-01  
> **Author**: AI Solutions Architecture Team

---

## 1. Executive Summary & Civic Pulse Theme Alignment

Under **FORGE '26 Theme 1: Civic Pulse**, **JanSathi AI (जन साथी AI)** delivers an **evidence-grounded, citation-validated, abstention-first Civic Intelligence Platform**. In public welfare administration, algorithmic hallucinations, fabricated cash benefits, or speculative eligibility promises cause catastrophic real-world harm to vulnerable citizens.

Following an exhaustive architectural review and deprecation audit against official provider documentation (checked November 1, 2026), this final specification establishes:

- Replacement of retired models (`gemini-1.5-flash`, `text-embedding-004`) and deprecated models (`gpt-4o-mini`).
- Preservation of candidate models (`gemini-3.8-flash`, `gemini-2.5-flash`, `gpt-6-luna`, `gemini-embedding-2`, `text-embedding-3-small`) as **provisional or benchmarking candidates**, without hardcoding any production provider prior to empirical testing.
- Alignment of the implementation roadmap with **ten distinct milestones**, explicitly scoping Knowledge Base verification to Milestone AI-02 and embedding integration to Milestone AI-03.
- Recognition that **citation entailment verification is probabilistic in nature** and requires calibrated empirical evaluation on an **exactly 500-item evaluation dataset**.
- Structured machine-readable abstention reasons (`NO_VERIFIED_SOURCE`, `INSUFFICIENT_EVIDENCE`, `SOURCE_STALE`, `CONFLICTING_SOURCES`, `CITATION_VERIFICATION_FAILED`) paired with dynamic citizen-facing explanations.
- A **layered privacy-control model** requiring redaction before persistence, logging, embedding generation, and transmission, with fail-closed behavior.
- Document freshness metadata (`lastCheckedAt`, `lastVerifiedAt`, `effectiveFrom`, `effectiveTo`, `stale` / `verification_required`) and clarification that `isLatest === true` represents database designation, requiring disclosure when amendment coverage is uncertain.
- Evaluation commitment for MongoDB `$text` sparse retrieval across English, Hindi, Telugu, and Tamil without assuming equivalent stemming or tokenization.
- Parallel dual-query retrieval implementation requirements including consistent filters, chunk deduplication, deterministic tie-breaking, and document diversity constraints.
- Strict preservation of HTTP 501 `NOT_IMPLEMENTED` contracts across all AI endpoints.

---

## 2. Corrected Candidate Selections & Status

No production provider or embedding model is hardcoded at this architectural phase:

| Role                              | Candidate Model            | Identifier               | Status                    | Official Documentation & Pricing Context                                                                                |
| :-------------------------------- | :------------------------- | :----------------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| **Primary LLM (Candidate A)**     | **Gemini 3.8 Flash**       | `gemini-3.8-flash`       | **Provisional**           | Active; 1M context; Promotional pricing thru 2026: $0.75/1M input, $3.75/1M output (including thinking tokens).         |
| **Primary LLM (Candidate B)**     | **Gemini 2.5 Flash**       | `gemini-2.5-flash`       | **Requires Benchmarking** | Active; 1M context; Lower cost baseline: $0.30/1M input, $2.50/1M output. Benchmark against 3.8 Flash.                  |
| **Fallback LLM**                  | **GPT-6 Luna**             | `gpt-6-luna`             | **Provisional**           | Active; 272K context; $0.10/1M input, $0.50/1M output. Documented successor to deprecated GPT-4o family.                |
| **Embedding Model (Candidate A)** | **Gemini Embedding 2**     | `gemini-embedding-2`     | **Provisional**           | Active; 8,192 tokens max; MRL dimensions (128–3,072); Asymmetric tasks; $0.20/1M tokens ($0.10 batch). Scoped to AI-03. |
| **Embedding Model (Candidate B)** | **Text-Embedding-3-Small** | `text-embedding-3-small` | **Requires Benchmarking** | Active; 8,191 tokens max; MRL dimensions (512 or 1,536); $0.02/1M tokens ($0.01 batch). Scoped to AI-03.                |

---

## 3. Multilingual Embedding Evaluation & Invariants

- **`gemini-embedding-2`**: Multimodal support, 8,192-token context, native asymmetric task types (`RETRIEVAL_DOCUMENT` vs `RETRIEVAL_QUERY`), flexible dimensions (calibrated to 768 or 1536). Scoped to Milestone AI-03.
- **`text-embedding-3-small`**: Lower token cost ($0.02/1M), flexible dimension reduction (512 or 1536), requires cross-lingual benchmarking for Dravidian languages in Milestone AI-03.
- **Core Safety Invariant**: **Never mix vectors from incompatible models, versions, or dimensions in the same search index.**
- **Migration Strategy**: Blue-green re-indexing via parallel fields (`embedding_v2`) and secondary Atlas search indexes.

---

## 4. Multilingual Text-Search Limitations & Evaluation

- **Linguistic Reality**: Standard full-text search engines exhibit significant performance discrepancies across linguistic scripts. Standard stemmers support English, but Dravidian scripts (Telugu, Tamil) and Devanagari (Hindi) have complex agglutinative morphology and conjuncts that require dedicated language processing.
- **Evaluation Commitment**: MongoDB `$text` performance, tokenization, and retrieval quality **must be evaluated separately for English, Hindi, Telugu, and Tamil** on the 500-item evaluation dataset in Milestone AI-04.
- **Evidence-Based Search Evolution**: Equivalent stemming, tokenization, or retrieval quality across these languages is **not assumed**. No replacement search engine will be introduced without concrete empirical evidence demonstrating that MongoDB `$text` fails defined acceptance targets.

---

## 5. Document Freshness, Versioning & Supersession Specification

- **Semantics of `isLatest === true`**: Represents the database's internal current version designation, **NOT proof that no newer government amendment exists in the real world**.
- **Freshness Metadata Schema**:
  - `lastCheckedAt`: Timestamp when crawler endpoint was last contacted.
  - `lastVerifiedAt`: Timestamp when document validity was cryptographically confirmed.
  - `effectiveFrom`: Statutory commencement date.
  - `effectiveTo`: Statutory expiration date (null if active).
  - `verificationStatus`: Enumeration: `verified`, `stale`, `verification_required`.
  - `freshnessPolicy`: Source-specific verification interval (daily for gazettes, weekly for guidelines, monthly for static acts).
- **Amendment Uncertainty Disclosure Policy**: When amendment coverage is uncertain, or when a document's status is `stale` / `verification_required`, the assistant **must disclose this limitation clearly to the citizen and must not claim that no newer amendment exists**.

---

## 6. Parallel Dual-Query Retrieval & Implementation Requirements

In MongoDB Atlas, `$vectorSearch` is an aggregation stage that must be the **first stage** in an aggregation pipeline and cannot be combined directly with `$text` in that same pipeline.

JanSathi AI executes hybrid search as **two independent parallel queries** coordinated by `retrievalService.js`:

1. Dense vector search aggregation executing `$vectorSearch` with metadata pre-filtering (top 20 candidates).
2. Sparse text search query executing `$text: { $search: query }` on `chunk_text_idx` (top 20 candidates).
3. **Consistent Applicable Filters**: The exact same metadata filters (`isLatest: true`, `visibility: 'public'`, category, docType) are applied to both queries.
4. **Chunk Deduplication**: Chunks appearing in both result sets are deduplicated by `_id`, combining their reciprocal rank scores.
5. **Deterministic Tie-Breaking**: Deterministic resolution: rank by dense vector score descending; if tied, rank by text score descending; if still tied, rank by chunk ObjectId string lexicographical order.
6. **Graceful Degraded Retrieval**: If either query returns zero results, the missing rank is treated as $\infty$, smoothly allowing single-mode candidates to populate the result list.
7. **Document Diversity Constraint**: No single `documentId` may contribute more than 2 chunks to the final 5 chunks (unless the user query specifically filtered for a single `documentId`).
8. **In-Memory Fusion**: Merged using **Reciprocal Rank Fusion (RRF, $k=60$)**:
   $$RRF(d) = \frac{1}{60 + r_{vector}(d)} + \frac{1}{60 + r_{text}(d)}$$

---

## 7. Five-Stage Citation Validation & Structured Abstention Policy

Exact substring verification does not prove that a citation supports an answer. Furthermore, **citation entailment verification is probabilistic in nature and requires calibrated empirical evaluation on the 500-item evaluation dataset**, rather than being treated as an infallible guarantee.

### 7.1 Five-Stage Citation Pipeline

1. **Document Identity Validation**: Confirm `documentId` exists in MongoDB with `status: 'ready'`.
2. **Page Identity Validation**: Confirm `pageNumber` exists within `DocumentPage` records.
3. **Excerpt Provenance Validation**: Verify authentic presence of the quoted excerpt on that specific `DocumentPage`.
4. **Claim-to-Evidence Support Validation (Entailment)**: Probabilistically evaluates whether the cited excerpt logically entails the claim made.
5. **Document Freshness and Supersession Validation**: Verifies `isLatest === true`, checks circular effective date, and ensures no subsequent amendment revokes the rule.

### 7.2 Structured Abstention Reasons & Dynamic User Explanations

If any factual assertion fails verification, or if entailment confidence falls below the calibrated cutoff, the system **abstains unconditionally** using structured reason codes with dynamically corresponding user explanations:

- `NO_VERIFIED_SOURCE`: _"No official government scheme, circular, or gazette notification matching this query was found in verified state or central records."_
- `INSUFFICIENT_EVIDENCE`: _"Official gazettes confirm the existence of this program, but published circulars currently indexed do not specify the exact criteria or deadline requested."_
- `SOURCE_STALE`: _"The governing circular for this scheme is currently pending freshness re-verification. We cannot confirm whether subsequent amendments have altered these conditions."_
- `CONFLICTING_SOURCES`: _"Conflicting official directives were found across department circulars regarding this condition. Please consult the competent authority directly."_
- `CITATION_VERIFICATION_FAILED`: _"Our automated verification system could not validate the factual claims against the cited official gazette pages. This response has been withheld for accuracy."_

---

## 8. Layered Privacy Protection & Untrusted Ingestion Architecture

### 8.1 Layered Privacy-Control Specification (Beyond Regex)

- Regex pattern matching is **one preliminary defense layer**, not complete anonymization.
- **Mandatory Redaction Checkpoints**: Redaction must occur **before database persistence, before application logging, before embedding generation, and before external provider transmission**.
- Raw citizen prompts, unredacted PII, and uploaded document contents are **strictly prohibited from application logs** (`logger.info`, `logger.error`, or `AuditLog`).
- **Multilingual PII Detection**: Accounts for Indic numeral representations (Devanagari, Telugu numerals), spelled-out numbers, and regional language identity prefixes across English, Hindi, Telugu, and Tamil.
- **Fail-Closed Behavior**: If an unclassifiable token sequence strongly indicative of structured personal identification cannot be confidently redacted, the system fails closed: transaction halts, sensitive data is discarded, and citizen is requested to re-submit inquiry without credentials.
- **Technical Controls vs Contractual Commitments**: In-memory scrubbing and technical controls do not replace contractual agreements; commercial enterprise zero-data-retention (ZDR) terms are strictly required.

### 8.2 Untrusted Content Boundary & Prompt-Injection Defense

- A dedicated `system_instruction` parameter alone does not guarantee protection against prompt injection.
- **Untrusted Data Boundary**: All external content—citizen input, uploaded PDFs, crawled HTML, and OCR text—is classified as **Untrusted Data**.
- System instructions explicitly command the model never to follow instructions embedded in retrieved content.
- Strict tool/action allowlists, strict JSON Schema validation, and automated red-team security tests in Milestone AI-09 using malicious instructions embedded in gazette PDFs.

---

## 9. Deterministic Eligibility Reasoning Architecture

- **Versioned, Effective-Dated, Source-Linked Rules Schema**:
  All eligibility criteria evaluated by the deterministic engine record:
  `ruleId`, `schemeId`, `version`, `effectiveFrom`, `effectiveTo`, `sourceDocumentId`, `sourcePageNumber`, `officialCircularRef`, `criterionAttribute`, `operator`, and `thresholdValue`.
- **Deterministic Rule Engine**: Hard demographic bounds are evaluated strictly by deterministic code against versioned criteria matrices.
- **LLM Reasoning Layer**: Explains criteria, translates terminology, and drafts advisory summaries.
- **Incomplete / Conflicting Data**: Missing attributes produce `insufficient_information`. Rule conflicts produce `uncertainty`.
- **Statutory Non-Denial Policy**: No automated denials; no binding benefit guarantees. Every evaluation concludes with the mandatory statutory disclaimer and links to official evidence.

---

## 10. Evaluation Methodology & Benchmark Specification

- **Exactly 500-Item Evaluation Dataset**: Balanced across 10 categories (50 items each): English (50), Hindi (50), Telugu (50), Tamil (50), Cross-Language (50), Exact Scheme Names (50), GO Numbers (50), Outdated Circulars (50), Contradictory Documents (50), and Unverifiable Distractors (50). Total = 500 items.
- **Proposed Acceptance Targets (Not Achieved Claims)**:
  - Recall@5 $\ge 85\%$
  - Precision@5 $\ge 70\%$
  - Mean Reciprocal Rank (MRR) $\ge 0.75$
  - Citation Precision $\ge 95\%$
  - Citation Completeness $100\%$
  - Unsupported-Claim Rate $\le 1\%$
  - Abstention Accuracy $\ge 98\%$
- **Methodology Protocol**: Structured ground-truth schema, independent double annotation, Cohen's Kappa ($\kappa \ge 0.85$) with expert adjudication, 60/40 tuning/evaluation holdout split, and mandatory per-language reporting. Measured results will only be reported after actual benchmark execution.

---

## 11. Updated Operational Cost Model (10,000 Queries)

_The previous $5.41 flat operational cost claim is **REVOKED**._

| Cost Category          | Option A: Gemini 3.8 Flash (Promo)                                            | Option B: Gemini 2.5 Flash                             | Option C: GPT-6 Luna                                                              |
| :--------------------- | :---------------------------------------------------------------------------- | :----------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **Input Tokens (35M)** | $35\text{M} \times \$0.75/\text{M} = \mathbf{\$26.25}$                        | $35\text{M} \times \$0.30/\text{M} = \mathbf{\$10.50}$ | $35\text{M} \times \$0.10/\text{M} = \mathbf{\$3.50}$                             |
| **Output Tokens (6M)** | $6\text{M} \times \$3.75/\text{M} = \mathbf{\$22.50}$*                        | $6\text{M} \times \$2.50/\text{M} = \mathbf{\$15.00}$  | $6\text{M} \times \$0.50/\text{M} = \mathbf{\$3.00}$                              |
| **Embeddings (0.5M)**  | $0.5\text{M} \times \$0.20/\text{M} = \mathbf{\$0.10}$ (`gemini-embedding-2`) | $0.5\text{M} \times \$0.20/\text{M} = \mathbf{\$0.10}$ | $0.5\text{M} \times \$0.02/\text{M} = \mathbf{\$0.01}$ (`text-embedding-3-small`) |
| **Total Model Cost**   | **$48.85 USD**                                                                | **$25.60 USD**                                         | **$6.51 USD**                                                                     |

_Infrastructure costs (MongoDB Atlas M10 cluster ~$58/mo, compute ~$7–$25/mo, Redis ~$10/mo, logging ~$15/mo) scale dynamically with deployment tier._

---

## 12. Correct Milestone Ownership & Phased Roadmap

The implementation roadmap aligns strictly with 10 sequential milestones. Embedding integration is explicitly scoped to Milestone AI-03 (not AI-02):

```
AI-01: Architecture & Technology Selection (CURRENT - FINAL CORRECTION)
  │
  ▼
AI-02: Official Government Knowledge Base & Source Verification
  - Verification of official gazette crawler endpoints (.gov.in / .nic.in)
  - Implementation of document freshness metadata (lastCheckedAt, lastVerifiedAt)
  - Stale document policies and amendment uncertainty disclosures
  │
  ▼
AI-03: Embedding Integration & Cross-Lingual Embedding Benchmarking
  - Implement embeddingService.js with candidate models (gemini-embedding-2 vs text-embedding-3-small)
  - Add DocumentChunk.embedding vector field & Atlas Search Index
  - Implement blue-green migration metadata and batch embedding worker
  │
  ▼
AI-04: Retrieval Pipeline & Hybrid-Search Evaluation
  - Implement parallel dual-query retrieval (Atlas $vectorSearch + MongoDB $text)
  - Implement in-memory Reciprocal Rank Fusion (RRF, k=60) with deduplication & diversity
  - Evaluate MongoDB $text performance across English, Hindi, Telugu, and Tamil
  │
  ▼
AI-05: Civic Assistant with Citations
  - Implement ragService.js and aiService.js with candidate primary LLM
  - Implement 5-stage citation validation and structured abstention reasons
  - Connect AssistantPage.jsx UI
  │
  ▼
AI-06: Eligibility Assistant & Relevant LLM Evaluation
  - Implement deterministic rules engine with versioned, effective-dated rules
  - Wire natural language explainer and versioned evidence links
  - Connect EligibilityPage.jsx with applicant profile evaluator
  │
  ▼
AI-07: Document Explainer
  - Implement plain-language legal clause summarizer from DocumentPage OCR text
  - Connect ExplainerPage.jsx UI
  │
  ▼
AI-08: Claim Verification
  - Implement verificationService.js stance classifier (supported/contradicted/unverified)
  - Connect VerifyClaimPage.jsx with official PIB/gazette evidence generator
  │
  ▼
AI-09: AI Security & Evaluation
  - Execute 500-item evaluation dataset across English, Hindi, Telugu, and Tamil
  - Calibrate similarity and probabilistic entailment thresholds
  - Execute adversarial prompt injection security testing on gazette documents
  │
  ▼
AI-10: Integration Testing & Deployment
  - Comprehensive end-to-end regression testing across all 10 milestones
  - Verify circuit breakers and enable live status in GET /api/ai/status
```

---

## 13. Quality Gates & Verification

- **Documentation Deliverables Updated**:
  1. [`docs/AI_ARCHITECTURE.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/AI_ARCHITECTURE.md) (v3.0.0)
  2. [`docs/AI_TECHNOLOGY_DECISIONS.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/AI_TECHNOLOGY_DECISIONS.md) (v3.0.0)
  3. [`docs/AI_IMPLEMENTATION_REPORT.md`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/docs/AI_IMPLEMENTATION_REPORT.md) (v3.0.0)
  4. Interactive Artifact: [AI Implementation Report](file:///C:/Users/SUBHASH/.gemini/antigravity/brain/3d728559-f3e2-42a3-a69a-f1e322e843d0/ai_implementation_report.md)
- **Code Integrity**: 0 backend/frontend code files modified, 0 dependencies installed, 0 git commits created. All AI endpoints preserve HTTP 501 `NOT_IMPLEMENTED`.
- **Code Style**: `npm run format:check` $\rightarrow$ **100% Prettier compliant**
- **Linting**: `npm run lint` $\rightarrow$ **0 ESLint errors / 0 warnings**
- **Test Suite**: `npm test` $\rightarrow$ **156 passed (14 test files, 0 failures)**

---

Final Status: **READY FOR AI-02 IMPLEMENTATION**
