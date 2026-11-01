# JanSathi AI API Specification

## General Conventions

- **Base URL**: `/api`
- **Data Format**: JSON (Content-Type: `application/json`)
- **Dates**: ISO-8601 UTC string format (e.g., `2026-10-31T16:50:00.000Z`)
- **Authentication**: JWT sent via HTTP Authorization header: `Authorization: Bearer <token>`
- **Request Tracking**: Every request accepts or generates a unique `X-Request-Id` header (max 64 characters, safe alphanumeric/hyphen/underscore), echoed in response headers and error envelopes.

## Response Structure

### Success Response

All successful responses return HTTP 2xx and adhere to:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... } // optional metadata, e.g. pagination
}
```

#### Paginated Lists

When a collection is paginated, `meta` contains:

```json
{
  "page": 1,
  "limit": 12,
  "total": 42,
  "totalPages": 4
}
```

### Error Response

All error responses return HTTP 4xx/5xx and adhere to:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [ ... ], // optional array or object for field-level validation errors
    "requestId": "c1f7a0b3-8fa2-4d22-83b6-12c8b9d8853f"
  }
}
```

## Error Codes & HTTP Status

| Code                     | HTTP Status | Description                                                      |
| ------------------------ | ----------- | ---------------------------------------------------------------- |
| `VALIDATION_ERROR`       | 400         | Request validation failure (e.g. invalid parameters or schema)   |
| `UNAUTHENTICATED`        | 401         | Missing or invalid authentication token                          |
| `FORBIDDEN`              | 403         | Insufficient role or access permissions / CORS origin rejection  |
| `NOT_FOUND`              | 404         | Resource not found                                               |
| `CONFLICT`               | 409         | Conflicting resource state (e.g. duplicate key)                  |
| `PAYLOAD_TOO_LARGE`      | 413         | Request payload exceeds maximum allowable size                   |
| `UNSUPPORTED_MEDIA_TYPE` | 415         | Unsupported file format or media type                            |
| `RATE_LIMITED`           | 429         | Rate limit exceeded                                              |
| `INTERNAL_ERROR`         | 500         | Unexpected internal server error                                 |
| `NOT_IMPLEMENTED`        | 501         | Feature or AI capability hook point not yet implemented          |
| `SERVICE_UNAVAILABLE`    | 503         | Dependent downstream service or database temporarily unavailable |

## Rate Limiting

The API enforces rate limits using standard IETF draft-7 headers:

- `RateLimit-Limit`: Maximum allowable requests in the current window.
- `RateLimit-Remaining`: Number of requests remaining in the current window.
- `RateLimit-Reset`: Seconds remaining until the rate limit window resets.

### Rate Limit Windows & Policies

- **Global**: 300 requests / 15 minutes (`RATE_LIMIT_GLOBAL_MAX`), health probes (`/api/health*`) are skipped
- **Authentication**: 10 requests / 15 minutes (`RATE_LIMIT_AUTH_MAX`)
- **AI Endpoints**: 20 requests / 1 minute (`RATE_LIMIT_AI_PER_MIN`), keyed by User ID or IP
- **Upload Endpoints**: 10 requests / 1 hour (`RATE_LIMIT_UPLOAD_PER_HOUR`), keyed by User ID or IP

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfterSeconds": 900
    },
    "requestId": "b0a5146c-c9d3-4a15-b930-b186b5ea3b11"
  }
}
```

## Endpoints

### 1. Health Liveness Probe

Retrieves the operational liveness of the API server process and database state.

- **Method**: `GET`
- **Path**: `/api/health`
- **Access**: Public
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "service": "jansathi-ai-server",
      "environment": "development",
      "database": "connected",
      "uptimeSeconds": 120,
      "timestamp": "2026-11-01T00:15:00.000Z"
    }
  }
  ```

### 2. Health Readiness Probe

Indicates whether the API server is ready to accept incoming traffic (requires operational database connection).

- **Method**: `GET`
- **Path**: `/api/health/ready`
- **Access**: Public
- **Response 200 OK (DB Connected)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ready",
      "service": "jansathi-ai-server",
      "database": "connected",
      "timestamp": "2026-11-01T00:15:00.000Z"
    }
  }
  ```
- **Response 503 SERVICE_UNAVAILABLE (DB Disconnected)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "SERVICE_UNAVAILABLE",
      "message": "Database is not ready",
      "details": {
        "database": "disconnected"
      },
      "requestId": "d820ef02-fa33-40a5-ae8d-71b569e2a6a1"
    }
  }
  ```

### 3. Public Metadata Options

Retrieves selectable reference options and upload limits for clients.

- **Method**: `GET`
- **Path**: `/api/meta/options`
- **Access**: Public
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "languages": [...],
      "userCategories": [...],
      "educationLevels": [...],
      "incomeRanges": [...],
      "states": [...],
      "docTypes": [...],
      "docCategories": [...],
      "limits": {
        "maxUploadMb": 10,
        "maxPdfPages": 300
      }
    }
  }
  ```

### 4. Authentication Endpoints

#### Register Citizen

- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Body**: `{ "name": "...", "email": "...", "password": "...", "preferredLanguage": "en", "state": "Telangana", "userCategory": "farmer" }`
- **Response 201 Created**: `{ "success": true, "data": { "user": { ... }, "token": "..." } }`

#### Citizen / Admin Login

- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response 200 OK**: `{ "success": true, "data": { "user": { ... }, "token": "..." } }`

### 5. Document Management Endpoints

#### Upload Document

- **Method**: `POST`
- **Path**: `/api/documents/upload`
- **Access**: Authenticated (Rate limit: 10/hr)
- **Content-Type**: `multipart/form-data`
- **Body**: Form data containing `file` (PDF) and optional metadata fields (`title`, `issuingAuthority`, `sourceUrl`, `publishedAt`, `docType`, `category`, `language`, `visibility`).
- **Response 202 Accepted (New Document)**:
  ```json
  {
    "success": true,
    "data": {
      "duplicate": false,
      "document": { "id": "...", "title": "...", "status": "pending" },
      "job": { "id": "...", "status": "queued" }
    }
  }
  ```
- **Response 200 OK (Duplicate Document)**:
  ```json
  {
    "success": true,
    "data": {
      "duplicate": true,
      "document": { "id": "...", "title": "...", "status": "ready" }
    }
  }
  ```

#### List Documents

- **Method**: `GET`
- **Path**: `/api/documents`
- **Access**: Authenticated
- **Query Params**: `q`, `category`, `docType`, `issuingAuthority`, `language`, `status`, `publishedFrom`, `publishedTo`, `includeOlderVersions`, `scope` (`library`|`mine`|`all`), `sort`, `page`, `limit`
- **Response 200 OK**: Paginated array of documents excluding heavy extraction text.

#### Document Facets

- **Method**: `GET`
- **Path**: `/api/documents/facets`
- **Access**: Authenticated
- **Response 200 OK**: `{ "success": true, "data": { "total": 42, "categories": [...], "docTypes": [...], "issuingAuthorities": [...], "languages": [...] } }`

#### Get Document Detail

- **Method**: `GET`
- **Path**: `/api/documents/:id`
- **Access**: Authenticated (Owner, public ready, or admin metadata)
- **Response 200 OK**: `{ "success": true, "data": { "document": { ... }, "latestJob": { ... } } }`

#### Get Document Pages

- **Method**: `GET`
- **Path**: `/api/documents/:id/pages`
- **Access**: Authenticated (Ready documents: public for all, private strictly for owner)
- **Query Params**: `page` (default 1), `limit` (max 20, default 10)
- **Response 200 OK**: Paginated array of pages: `[{ pageNumber, sectionHeading, text, charCount, isEmpty }]`

#### Delete Document

- **Method**: `DELETE`
- **Path**: `/api/documents/:id`
- **Access**: Authenticated (Owner of private doc, or Admin)
- **Response 200 OK**: `{ "success": true, "data": { "deleted": true } }`

### 6. Admin Source & Document Management

- `POST /api/admin/sources`: Create official source endpoint.
- `GET /api/admin/sources`: List sources with filtering by `isActive`, `category`, `q`.
- `GET /api/admin/sources/:id`: Source details.
- `PUT /api/admin/sources/:id`: Update source attributes (URL immutable if documents exist).
- `PATCH /api/admin/sources/:id/status`: Toggle source active status.
- `DELETE /api/admin/sources/:id`: Delete source (409 CONFLICT if referenced by documents).
- `POST /api/admin/sources/:id/ingest`: Trigger immediate background ingestion job for an active source (202 Accepted).
- `PATCH /api/admin/documents/:id`: Update document metadata and propagate to chunks.

### 7. Admin Ingestion Job Monitoring & Retries

#### List Ingestion Jobs

- **Method**: `GET`
- **Path**: `/api/admin/ingestion-jobs`
- **Access**: Administrator (`admin` role required)
- **Query Params**: `page` (default 1), `limit` (max 100, default 20), `status`, `type`, `sourceId`, `documentId`, `sort` (default `-createdAt`)
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "...",
        "type": "upload",
        "status": "succeeded",
        "stage": "done",
        "attempts": 1,
        "stats": { "pageCount": 5, "chunkCount": 12, "durationMs": 450 }
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
  ```

#### Get Ingestion Job Details

- **Method**: `GET`
- **Path**: `/api/admin/ingestion-jobs/:id`
- **Access**: Administrator
- **Response 200 OK**: Detailed job record populated with source name/url and document title/status.

#### Retry Ingestion Job

- **Method**: `POST`
- **Path**: `/api/admin/ingestion-jobs/:id/retry`
- **Access**: Administrator
- **Response 200 OK**: Resets job state to `queued`, attempts to `0`, increments `manualRetries`, resets document to `pending`, and kicks the runner.
- **Response 409 CONFLICT**: Returned if the target job is not in `failed` status.

---

### 8. Document Keyword Search

#### Keyword Search Across Civic Chunks

- **Method**: `GET`
- **Path**: `/api/search`
- **Access**: Authenticated
- **Privacy Guarantee**: Search queries are strictly never stored, logged, or tracked in the database.
- **Query Params**:
  - `q` (required, 2-200 chars): Query keyword string.
  - `category` (optional): Filter by document category (`DOC_CATEGORIES`).
  - `docType` (optional): Filter by document type (`DOC_TYPES`).
  - `issuingAuthority` (optional): Filter by issuing authority string.
  - `language` (optional): Filter by document language.
  - `documentId` (optional): Scope search to specific document ObjectId.
  - `publishedFrom` (optional): ISO date string.
  - `publishedTo` (optional): ISO date string.
  - `includeOlderVersions` (optional, boolean): Include deprecated version chunks (default `false`).
  - `page` (optional, integer, default 1).
  - `limit` (optional, integer, default 8, max 20).
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": [
      {
        "chunkId": "6ae6c227f169df653a0dbb70",
        "documentId": "6ae6c226f169df653a0dbb5e",
        "score": 1.452,
        "snippet": "...National Scholarship Scheme 2026. Financial assistance of Rs 50,000 per annum for meritorious students...",
        "title": "National Scholarship Guidelines 2026",
        "issuingAuthority": "Ministry of Social Justice",
        "sourceUrl": "https://scholarships.gov.in/guidelines.pdf",
        "category": "scholarship",
        "docType": "scheme",
        "language": "en",
        "pageStart": 1,
        "pageEnd": 1,
        "sectionHeading": "Eligibility Overview",
        "publishedAt": "2026-08-15T00:00:00.000Z",
        "lastUpdatedAt": null,
        "fetchedAt": "2026-11-01T04:37:59.216Z",
        "version": 1,
        "isLatest": true
      }
    ],
    "meta": {
      "page": 1,
      "limit": 8,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

---

### 9. Conversation History

#### Create Conversation

- **Method**: `POST`
- **Path**: `/api/history`
- **Access**: Authenticated
- **Body**:
  ```json
  {
    "title": "Scholarship Eligibility Inquiry",
    "mode": "ask",
    "language": "en",
    "documentId": "6ae6c226f169df653a0dbb5e"
  }
  ```
- **Response 201 Created**: Returns the initialized Conversation object with empty `messages` array.

#### List User Conversations

- **Method**: `GET`
- **Path**: `/api/history`
- **Access**: Authenticated (User-scoped)
- **Query Params**: `mode` (`ask`|`eligibility`|`document`), `page` (default 1), `limit` (default 20, max 100)
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "6724c3a19ab1234567890abc",
        "title": "Scholarship Eligibility Inquiry",
        "mode": "ask",
        "language": "en",
        "documentId": "6ae6c226f169df653a0dbb5e",
        "messageCount": 2,
        "lastMessagePreview": "What is the annual income limit for the scheme?",
        "createdAt": "2026-11-01T05:00:00.000Z",
        "updatedAt": "2026-11-01T05:01:30.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### Get Conversation Details

- **Method**: `GET`
- **Path**: `/api/history/:id`
- **Access**: Authenticated (Owner-only; 404 for other users' IDs)
- **Response 200 OK**: Complete conversation document including all messages and citation arrays.

#### Append User Message

- **Method**: `POST`
- **Path**: `/api/history/:id/messages`
- **Access**: Authenticated (Owner-only)
- **Constraint**: Role is strictly forced to `"user"`; client cannot pass role or citations. Hard limit of 200 messages per conversation.
- **Body**:
  ```json
  {
    "content": "Can final year students apply for this grant?"
  }
  ```
- **Response 200 OK**: Updated Conversation document.
- **Response 409 CONFLICT**: Returned when the 200-message limit is reached.

#### Delete Conversation

- **Method**: `DELETE`
- **Path**: `/api/history/:id`
- **Access**: Authenticated (Owner-only)
- **Audit**: Emits `history.delete` audit record.
- **Response 200 OK**: `{ "success": true, "data": { "deleted": true } }`

#### Clear All Conversations

- **Method**: `DELETE`
- **Path**: `/api/history`
- **Access**: Authenticated
- **Audit**: Emits `history.clear` audit record with `deletedCount`.
- **Response 200 OK**: `{ "success": true, "data": { "deletedCount": 4 } }`

---

### 10. AI Hook Architecture & Response Contract

In Phase 7, all AI generative and inference endpoints authenticate, rate-limit, and validate request payloads, before delegating to service shells that throw `NotImplementedError`, returning HTTP `501 NOT_IMPLEMENTED`. Absolutely zero mock or fake data is returned.

#### Capability Status Probe

- **Method**: `GET`
- **Path**: `/api/ai/status`
- **Access**: Authenticated
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "connected": false,
      "features": {
        "ask": false,
        "eligibility": false,
        "verify": false
      }
    }
  }
  ```

#### AI Question-Answering Shell

- **Method**: `POST`
- **Path**: `/api/ai/ask`
- **Access**: Authenticated (Rate limited via user-keyed `aiLimiter`)
- **Request Body**:
  ```json
  {
    "question": "What is the family income limit for the National Scholarship Scheme?",
    "language": "en",
    "conversationId": "6724c3a19ab1234567890abc",
    "documentId": "6ae6c226f169df653a0dbb5e",
    "filters": {
      "category": "scholarship",
      "docType": "scheme",
      "issuingAuthority": "Ministry of Social Justice"
    }
  }
  ```
- **Phase 7 Response 501 NOT_IMPLEMENTED**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "ragService.answerQuestion is not implemented yet"
    }
  }
  ```

#### AI Eligibility Check Shell

- **Method**: `POST`
- **Path**: `/api/ai/eligibility`
- **Access**: Authenticated (Rate limited via user-keyed `aiLimiter`)
- **Request Body**:
  ```json
  {
    "query": "scholarships for undergraduate students",
    "documentIds": ["6ae6c226f169df653a0dbb5e"],
    "applicant": {
      "educationLevel": "undergraduate",
      "courseOrOccupation": "B.Tech Computer Science",
      "state": "Telangana",
      "district": "Hyderabad",
      "userCategory": "student",
      "annualFamilyIncomeRange": "1_to_2_5_lakh",
      "socialCategory": "General"
    },
    "language": "en"
  }
  ```
- **Phase 7 Response 501 NOT_IMPLEMENTED**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "eligibilityService.checkEligibility is not implemented yet"
    }
  }
  ```

#### Civic Claim Verification Shell

- **Method**: `POST`
- **Path**: `/api/verify/claim`
- **Access**: Authenticated (Rate limited via user-keyed `aiLimiter`)
- **Request Body**:
  ```json
  {
    "claim": "The government is giving Rs 10,000 to all college students under a new 2026 circular.",
    "language": "en"
  }
  ```
- **Phase 7 Response 501 NOT_IMPLEMENTED**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "verificationService.verifyClaim is not implemented yet"
    }
  }
  ```

---

### 11. Authoritative AI Response Contract (Production Schema)

When AI services are implemented in subsequent phases, responses will conform to the following contract (all fields camelCase; all responses wrapped in `{success:true, data}`):

#### Data Types

- **Citation**: `{ id: "c1", documentId, chunkId, title, issuingAuthority, sourceUrl, pageStart, pageEnd, sectionHeading|null, publishedAt|null, lastUpdatedAt|null, fetchedAt, quote }` _(quote = short verbatim excerpt, max 300 chars)_
- **Section**: `{ text, bullets: string[], status: "confirmed"|"not_found"|"conflicting"|"unverified", citationIds: string[] }`

#### Endpoint Contracts

1. **POST /api/ai/ask response data**:

   ```typescript
   {
     conversationId: string;
     messageId: string;
     language: string;
     answer: {
       summary: Section;
       eligibility: Section | null;
       benefits: Section | null;
       documents: Section | null;
       deadline: Section | null;
       applicationProcess: Section | null;
       limitations: string[];
     };
     citations: Citation[];
     relatedQuestions: string[];
     retrieval: {
       strategy: "text" | "vector" | "hybrid";
       resultCount: number;
     };
     disclaimer: string;
   }
   ```

   _(The UI derives official sources exclusively from `citations`)_

2. **POST /api/ai/eligibility response data**:

   ```typescript
   {
     language: string;
     results: Array<{
       documentId: string | null;
       schemeTitle: string;
       sourceUrl: string | null;
       overall: "likely_match" | "possible_match" | "not_match" | "insufficient_information";
       criteria: Array<{
         id: string;
         requirement: string;
         status: "match" | "no_match" | "unknown";
         applicantValue: string | number | null;
         reason: string;
         citationIds: string[];
       }>;
       deadline: {
         text: string | null;
         status: "confirmed" | "not_confirmed";
         citationIds: string[];
       };
       notes: string[];
     }>;
     citations: Citation[];
     disclaimer: string;
   }
   ```

   _(Never claim guaranteed eligibility; always declare official criteria)_

3. **POST /api/verify/claim response data**:

   ```typescript
   {
     claimId: string;
     assessment: "supported" | "contradicted" | "unverified";
     explanation: string;
     evidence: Array<{
       citationId: string;
       stance: "supports" | "contradicts" | "related";
     }>;
     citations: Citation[];
     limitations: string[];
     disclaimer: string;
   }
   ```

4. **GET /api/ai/status response data**:

   ```typescript
   {
     connected: boolean;
     features: {
       ask: boolean;
       eligibility: boolean;
       verify: boolean;
     }
   }
   ```

   _(Derived from each service's `isAvailable()`; all false in Phase 7)_

5. **501 Error Envelope (Universal Unimplemented Body)**:
   ```json
   {
     "success": false,
     "error": {
       "code": "NOT_IMPLEMENTED",
       "message": "<service>.<method> is not implemented yet"
     }
   }
   ```

---

### 12. How the Frontend Should Treat 501 Responses

The React frontend UI must gracefully handle HTTP 501 `NOT_IMPLEMENTED` responses as standard anticipated lifecycle states:

1. **Feature Detection via Status Probe**: The client should invoke `GET /api/ai/status` on mount or view load. If `connected === false` or a specific feature flag (`features.ask`, `features.eligibility`, `features.verify`) is `false`, the UI displays an informative "Coming Soon in AI Integration" badge or friendly explanation rather than treating it as a system outage.
2. **Explicit 501 Catching in API Wrappers**: Client Axios services should intercept responses where `error.response?.status === 501`. Instead of generic toast errors, render an accessible Banner/Alert explaining that AI reasoning for this module is currently in progress.
3. **Disabled Input States**: When an AI service is not available, form submission buttons may be decorated with a tooltip or descriptive aria-label indicating that non-AI search (`/api/search`) and official document downloads (`/api/documents`) remain fully functional.
4. **No Broken Conversation State**: Because 501 responses guarantee that nothing is persisted server-side (no phantom conversations or dummy claims are created), the frontend state remains clean and uncorrupted.
