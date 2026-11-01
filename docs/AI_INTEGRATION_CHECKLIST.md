# JanSathi AI — AI Integration Handover Checklist (`AI_INTEGRATION_CHECKLIST.md`)

> **Project**: JanSathi AI (जन साथी AI)  
> **Theme**: FORGE '26 — Theme 1: Civic Pulse  
> **Status**: Architectural Handover Document for Future "AI-Day" Deployment  
> **Governance Notice**: In Phase 13, all AI endpoints continue returning HTTP 501 `NOT_IMPLEMENTED`. Zero hallucinated, canned, or synthetic responses are permitted. This checklist governs the engineering requirements for when AI model inference is integrated.

---

## 1. Architectural Handover Status

JanSathi AI was designed with stable hook interfaces so that AI capabilities can be plugged in without changing database schemas, API routes, or client interfaces.

### Existing Foundation (Phase 1–12):

- **API Endpoints**: `/api/ai/ask`, `/api/ai/eligibility`, `/api/ai/status`, `/api/verify/claim` are fully registered, rate-limited, authenticated, and validated via Zod.
- **Service Shells**:
  - [`server/src/services/ragService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/ragService.js)
  - [`server/src/services/eligibilityService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/eligibilityService.js)
  - [`server/src/services/verificationService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/verificationService.js)
  - [`server/src/services/embeddingService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/embeddingService.js)
  - [`server/src/services/aiService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/aiService.js)
  - [`server/src/services/retrievalService.js`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/services/retrievalService.js)
- **Frontend Pages**:
  - [`client/src/pages/AssistantPage.jsx`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/src/pages/AssistantPage.jsx)
  - [`client/src/pages/EligibilityPage.jsx`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/src/pages/EligibilityPage.jsx)
  - [`client/src/pages/ExplainerPage.jsx`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/src/pages/ExplainerPage.jsx)
  - [`client/src/pages/VerifyClaimPage.jsx`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/src/pages/VerifyClaimPage.jsx)
  - Shared [`client/src/components/common/AIUnavailableState.jsx`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/src/components/common/AIUnavailableState.jsx) handles HTTP 501 transparently with query echoing and live probe polling.

---

## 2. Mandatory Civic Safety Principles (Zero Hallucination)

Any model integration must adhere strictly to these non-negotiable civic guidelines:

1. **No Fabricated Schemes or Benefits**: The model must never invent welfare benefits, cash incentives, or eligibility criteria. If a scheme is not grounded in an indexed document, the model must explicitly respond: _"No official government scheme matching this query was found in verified gazettes."_
2. **No Fabricated Deadlines**: The model must never generate speculative application deadlines. Deadlines must cite the exact page and circular date.
3. **No Fabricated Eligibility Decisions**: The system cannot issue binding denials or approvals. All outputs must be accompanied by the statutory disclaimer: _"This evaluation is an informational advisory based on published criteria and does not constitute an official government benefit determination."_
4. **No Fabricated Claim Verifications**: In fact-checking workflows, rumors must never be labeled "Debunked" or "Verified" without direct contradiction or affirmation from an official PIB or ministry circular. Unverified claims must remain marked `unverified`.
5. **Mandatory Citations**: Every factual claim must include a verified citation containing `documentId`, `documentTitle`, `pageNumber`, and `quoteExcerpt`.

---

## 3. Component Handover Checklists

### 3.1 Civic Assistant (`POST /api/ai/ask`)

- [ ] **Dual-Stage Retrieval**:
  - Replace text-only search in `retrievalService.js` with hybrid search: MongoDB `$text` + Atlas Vector Search (`$vectorSearch`) using Reciprocal Rank Fusion (RRF).
- [ ] **Dense Embeddings**:
  - Connect `embeddingService.js` to an embedding model (e.g. `text-embedding-004` or sovereign open-weights embedding model) with 768 or 1536 dimensions.
  - Generate embeddings for chunks during ingestion (`jobs/ingestionRunner.js`) and persist in `DocumentChunk.embedding`.
- [ ] **Grounded RAG Pipeline**:
  - In `ragService.js`, retrieve top-k chunks ($k \approx 5$).
  - Construct prompt containing retrieved chunk excerpts, user language preference, and conversation context.
  - Require structured JSON response matching the production contract:
    ```typescript
    {
      summary: string;
      eligibility?: string[];
      benefits?: string[];
      documentsRequired?: string[];
      applicationProcess?: string[];
      deadlines?: string[];
      citations: Array<{
        documentId: string;
        documentTitle: string;
        pageNumber: number;
        excerpt: string;
      }>;
      confidenceScore: number;
    }
    ```
- [ ] **Conversation History Persistence**:
  - Append citizen inquiry and model response to `Conversation` model (maintaining the 200-message ceiling).

### 3.2 Scheme Eligibility Evaluator (`POST /api/ai/eligibility`)

- [ ] **Deterministic Criteria Table Matching**:
  - In `eligibilityService.js`, fetch target scheme documents specified in `documentIds` (or retrieve via `query`).
  - Compare applicant demographic attributes (`state`, `userCategory`, `educationLevel`, `annualFamilyIncomeRange`, `courseOrOccupation`, `socialCategory`) against extracted rule matrices.
- [ ] **Multi-Rule Evaluation Output**:
  - Return structured assessment:
    ```typescript
    {
      overallStatus: 'likely_eligible' | 'conditionally_eligible' | 'not_eligible' | 'insufficient_information';
      criteriaBreakdown: Array<{
        criterion: string;
        met: boolean | 'unknown';
        applicantValue: string;
        requiredCondition: string;
        sourceCitation: { documentTitle: string; pageNumber: number };
      }>;
      nextSteps: string[];
      statutoryDisclaimer: string;
    }
    ```
- [ ] **Non-Denial Safeguard**: Explicitly handle missing information gracefully without issuing false rejections.

### 3.3 Document Explainer (`/explainer/:documentId`)

- [ ] **Sovereign Gazette Summarization**:
  - Connect `ExplainerPage.jsx` action to `ragService.js` with explicit `documentId`.
  - Ingest extracted OCR text from `DocumentPage` records directly into prompt context.
  - Distinguish genuine extracted OCR text from AI-generated plain-language summaries.
  - Highlight key civic clauses (entitlements, grievance redressal officers, cutoff dates).

### 3.4 Government Claim Verification (`POST /api/verify/claim`)

- [ ] **Stance Classification Pipeline**:
  - In `verificationService.js`, extract factual assertions from citizen-submitted rumor text.
  - Query indexed official gazettes, press releases (PIB), and circulars.
  - Classify stance: `supported`, `contradicted`, or `unverified`.
- [ ] **Evidence & Audit Trail**:
  - Store verification record in `Claim` collection with citizen user ID, claim text, stance verdict, reasoning, and citation array.
  - Return:
    ```typescript
    {
      claimText: string;
      verdict: 'supported' | 'contradicted' | 'unverified';
      explanation: string;
      verifiedSources: Array<{
        title: string;
        issuingAuthority: string;
        date: string;
        url?: string;
        pageNumber?: number;
      }>;
      disclaimer: string;
    }
    ```

---

## 4. AI Security & Guardrails Checklist

- [ ] **Prompt Injection Defense**:
  - Separate system instructions from untrusted citizen input using clear delimiters (`<citizen_inquiry>` / `</citizen_inquiry>`).
  - Strip control tokens and instruction-override phrases (`Ignore previous instructions`, `You are now in developer mode`).
- [ ] **PII Protection & Redaction**:
  - Pre-filter inquiries to detect and mask Indian Personally Identifiable Information:
    - Aadhaar numbers (12-digit format `\b\d{4}\s\d{4}\s\d{4}\b`).
    - PAN numbers (`\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b`).
    - Bank Account & IFSC codes.
  - Never store raw citizen identifiers in conversation history or embeddings.
- [ ] **Audit Logging & Telemetry**:
  - Record model invocation metrics: prompt token count, completion token count, inference latency, and safety evaluation scores in `AuditLog`.
- [ ] **Model Failure & Circuit Breakers**:
  - Wrap LLM client calls in bounded timeouts (max 15 seconds).
  - Implement automatic circuit breakers: if upstream model inference errors or times out 5 consecutive times, fallback cleanly to `AIUnavailableState` without crashing the Express server.
- [ ] **Rate & Usage Ceilings**:
  - Preserve `RATE_LIMIT_AI_PER_MIN=20` per user.
  - Enforce global daily token quotas to prevent API billing spikes.
- [ ] **Multilingual Integrity**:
  - Verify that translated responses in Hindi, Telugu, and Tamil preserve accurate terminology for official welfare scheme names and legal definitions.

---

## 5. Enabling AI on "AI-Day" (Deployment Step)

When models are provisioned and tested:

1. Update `ragService.js`, `eligibilityService.js`, and `verificationService.js` to return `true` from `isAvailable()`.
2. `GET /api/ai/status` will automatically return:
   ```json
   {
     "connected": true,
     "features": {
       "ask": true,
       "eligibility": true,
       "verify": true
     }
   }
   ```
3. The frontend `AIUnavailableState` component will automatically switch to the interactive conversational interface across all four citizen pages.
