# JanSathi AI — Authoritative API Reference (`API.md`)

> **Project**: JanSathi AI (जन साथी AI)  
> **Theme**: FORGE '26 — Theme 1: Civic Pulse  
> **Base URL**: `/api`  
> **Data Format**: `application/json` (UTF-8)  
> **Authentication**: `Authorization: Bearer <jwt_token>`  
> **Request Tracing**: `X-Request-Id` (UUID echoed in all response headers and error objects)  
> **Authority**: Verified directly against Express router definitions in [`server/src/routes/`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/server/src/routes/).

---

## 1. Response Envelope Conventions

### 1.1 Success Response Envelope

All successful requests return HTTP status `200` or `201` with the unified JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... } // Included on paginated lists
}
```

#### Pagination Metadata Shape (`meta`)

```json
{
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5
}
```

### 1.2 Error Response Envelope

All client and server errors return HTTP `4xx` or `5xx` with the unified error envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable sanitized error description",
    "details": [{ "field": "email", "message": "Invalid email address format" }],
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 1.3 Standard Error Codes

| Code                     | HTTP Status | Description                                                               |
| :----------------------- | :---------: | :------------------------------------------------------------------------ |
| `VALIDATION_ERROR`       |     400     | Request parameters, query, or body failed Zod schema validation.          |
| `INVALID_ID`             |     400     | Malformed MongoDB ObjectId string.                                        |
| `SSRF_BLOCKED`           |     400     | Target URL/IP points to private, loopback, or cloud metadata address.     |
| `UNAUTHENTICATED`        |     401     | Missing, malformed, or expired Bearer token.                              |
| `TOKEN_EXPIRED`          |     401     | JWT expired (`err.name === 'TokenExpiredError'`).                         |
| `FORBIDDEN`              |     403     | Insufficient user role, document ownership violation, or CORS rejection.  |
| `NOT_FOUND`              |     404     | Resource does not exist.                                                  |
| `RESOURCE_CONFLICT`      |     409     | Duplicate unique key (e.g. email or SHA-256) or invalid state transition. |
| `PAYLOAD_TOO_LARGE`      |     413     | Upload or fetch stream exceeded allowable byte threshold.                 |
| `UNSUPPORTED_MEDIA_TYPE` |     415     | File extension or magic bytes `%PDF-` missing.                            |
| `RATE_LIMITED`           |     429     | Rate limit exceeded for window. Contains `retryAfterSeconds`.             |
| `INTERNAL_ERROR`         |     500     | Unhandled server error (details masked in production).                    |
| `NOT_IMPLEMENTED`        |     501     | Capability hook point reserved for AI integration phase.                  |
| `SERVICE_UNAVAILABLE`    |     503     | Database or dependent service disconnected.                               |

---

## 2. Health & Telemetry Endpoints

### `GET /api/health`

- **Description**: Lightweight liveness probe providing server uptime and memory utilization. Exempt from rate limiting.
- **Authentication**: None (Public).
- **Authorization**: None.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "timestamp": "2026-11-01T20:00:00.000Z",
      "uptime": 124.5,
      "environment": "development",
      "memory": {
        "rss": 84524288,
        "heapTotal": 45613056,
        "heapUsed": 32415120
      },
      "database": {
        "connected": true,
        "state": "connected"
      }
    }
  }
  ```

### `GET /api/health/ready`

- **Description**: Readiness probe verifying active MongoDB Atlas connection. Exempt from rate limiting.
- **Authentication**: None (Public).
- **Authorization**: None.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "READY",
      "database": "connected"
    }
  }
  ```
- **Error (503 Service Unavailable)**: Returned when `mongoose.connection.readyState !== 1`.

---

## 3. Authentication & User Profile Endpoints

### `POST /api/auth/register`

- **Description**: Registers a new citizen user account. Mass-assignment of administrative roles is blocked.
- **Rate Limit**: 10 requests / 15 minutes (`RATE_LIMIT_AUTH_MAX`).
- **Authentication**: None (Public).
- **Request Body**:
  ```json
  {
    "name": "Citizen User",
    "email": "citizen@example.gov.in",
    "password": "StrongPassword2026!",
    "preferredLanguage": "te" // Optional: 'en', 'hi', 'te', 'ta' (default 'en')
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "672533e49876543210abcdef",
        "name": "Citizen User",
        "email": "citizen@example.gov.in",
        "role": "citizen",
        "preferredLanguage": "te"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Errors**: `400 VALIDATION_ERROR`, `409 RESOURCE_CONFLICT` (email already exists).

### `POST /api/auth/login`

- **Description**: Authenticates user via email and password using constant-time dummy comparisons for non-existent accounts.
- **Rate Limit**: 10 requests / 15 minutes (`RATE_LIMIT_AUTH_MAX`).
- **Authentication**: None (Public).
- **Request Body**:
  ```json
  {
    "email": "citizen@example.gov.in",
    "password": "StrongPassword2026!"
  }
  ```
- **Response (200 OK)**: Same shape as registration.
- **Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED` ("Invalid email or password").

### `GET /api/users/profile`

- **Description**: Retrieves authenticated user profile.
- **Authentication**: Bearer JWT required.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "672533e49876543210abcdef",
      "name": "Citizen User",
      "email": "citizen@example.gov.in",
      "role": "citizen",
      "preferredLanguage": "te",
      "createdAt": "2026-11-01T10:00:00.000Z"
    }
  }
  ```

### `PATCH /api/users/profile`

- **Description**: Updates profile fields (name, preferredLanguage).
- **Authentication**: Bearer JWT required.
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "preferredLanguage": "hi"
  }
  ```
- **Response (200 OK)**: Returns updated user object.

### `POST /api/users/change-password`

- **Description**: Changes user password after verifying current password.
- **Authentication**: Bearer JWT required.
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPassword2026!",
    "newPassword": "NewStrongPassword2026!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Password updated successfully"
    }
  }
  ```

---

## 4. Metadata & Discovery Endpoints

### `GET /api/meta/options`

- **Description**: Public options and limit metadata for form popups, filters, and upload constraints.
- **Authentication**: None (Public).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "states": [{ "value": "central", "label": "Central / All India" }, ...],
      "documentTypes": [{ "value": "scheme", "label": "Government Scheme" }, ...],
      "categories": [{ "value": "agriculture", "label": "Agriculture" }, ...],
      "languages": [{ "value": "en", "label": "English" }, ...],
      "userCategories": [{ "value": "farmer", "label": "Farmer" }, ...],
      "educationLevels": [{ "value": "graduate", "label": "Graduate" }, ...],
      "incomeRanges": [{ "value": "below_1_lakh", "label": "Below ₹1,00,000" }, ...],
      "maxUploadMb": 10,
      "maxPdfPages": 300
    }
  }
  ```

---

## 5. Document Management Endpoints

### `POST /api/documents/upload`

- **Description**: Uploads a single PDF document (`multipart/form-data`) with `%PDF-` magic-byte verification, SHA-256 deduplication, and background ingestion queuing.
- **Rate Limit**: 10 uploads / 1 hour (`RATE_LIMIT_UPLOAD_PER_HOUR`).
- **Authentication**: Bearer JWT required.
- **Form Fields**:
  - `file` (File, required, `.pdf` only, max `MAX_UPLOAD_MB`)
  - `title` (String, required, 3-200 chars)
  - `state` (String, optional, default `'central'`)
  - `category` (String, optional, default `'general'`)
  - `documentType` (String, optional, default `'scheme'`)
  - `language` (String, optional, default `'en'`)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "document": {
        "id": "672544e49876543210abcdef",
        "title": "PM Kisan Guideline 2026",
        "status": "pending",
        "fileChecksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      "job": {
        "id": "672555e49876543210abcdef",
        "status": "queued",
        "jobType": "upload"
      }
    }
  }
  ```
- **Errors**: `400 VALIDATION_ERROR`, `409 RESOURCE_CONFLICT` (duplicate PDF checksum), `413 PAYLOAD_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE`.

### `GET /api/documents`

- **Description**: Lists documents with search, state, category, language, and status filtering.
- **Authentication**: Optional. Citizens see public `ready` documents plus their own pending uploads. Administrators using `scope=all` view all documents.
- **Query Parameters**:
  - `page` (Integer, default 1)
  - `limit` (Integer, default 10, max 50)
  - `search` (String, optional)
  - `state` (String, optional)
  - `category` (String, optional)
  - `documentType` (String, optional)
  - `language` (String, optional)
  - `status` (String, optional: `'ready'`, `'pending'`, `'processing'`, `'failed'`, `'needs_ocr'`)
  - `scope` (String, optional: `'all'` — requires admin role)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [ ... ],
    "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
  }
  ```

### `GET /api/documents/facets`

- **Description**: Aggregates distribution facets across **public ready documents** only.
- **Authentication**: None (Public).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "states": [{ "_id": "central", "count": 10 }],
      "categories": [{ "_id": "agriculture", "count": 6 }],
      "types": [{ "_id": "scheme", "count": 8 }],
      "languages": [{ "_id": "en", "count": 12 }],
      "total": 12
    }
  }
  ```

### `GET /api/documents/:id`

- **Description**: Retrieves single document metadata by ObjectId.
- **Authentication**: Optional (Enforces public visibility rules for non-owners).
- **Parameters**: `id` (24-hex ObjectId, validated via `documentIdParamSchema`).
- **Response (200 OK)**: Returns document object.
- **Errors**: `400 VALIDATION_ERROR` (malformed ID), `404 NOT_FOUND`.

### `GET /api/documents/:id/pages`

- **Description**: Returns extracted OCR text pages for a document with pagination.
- **Authentication**: Optional (Enforces visibility rules).
- **Parameters**: `id` (24-hex ObjectId).
- **Query Parameters**: `page` (default 1), `limit` (default 5, max 50).
- **Response (200 OK)**: Returns `{ pages: [ { pageNumber, text, tokenCount } ], meta }`.

### `DELETE /api/documents/:id`

- **Description**: Deletes a document and its associated pages, chunks, and storage files.
- **Authentication**: Bearer JWT required (Owner citizen or Admin).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Document and associated data deleted successfully"
    }
  }
  ```
- **Errors**: `403 FORBIDDEN` (ownership check failure), `404 NOT_FOUND`.

---

## 6. Keyword Search Endpoint

### `GET /api/search`

- **Description**: Full-text search over indexed document chunks using MongoDB `$text` search with textScore ranking and visibility filtering.
- **Authentication**: Optional.
- **Query Parameters**:
  - `q` (String, required, 2-200 chars)
  - `state` (String, optional)
  - `category` (String, optional)
  - `limit` (Integer, default 10, max 50)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "results": [
        {
          "chunkId": "672566e49876543210abcdef",
          "documentId": "672544e49876543210abcdef",
          "documentTitle": "PM Kisan Guideline 2026",
          "text": "Beneficiaries will receive ₹6000 annually...",
          "score": 1.75,
          "pageNumber": 2
        }
      ],
      "total": 1
    }
  }
  ```

---

## 7. Citizen History Endpoints

All endpoints require `authenticate`:

- `GET /api/history/conversations`: Lists user conversations.
- `GET /api/history/conversations/:id`: Returns conversation messages (max 200).
- `DELETE /api/history/conversations/:id`: Deletes conversation.
- `GET /api/history/claims`: Lists user claim verification queries.
- `GET /api/history/claims/:id`: Returns claim verification detail.

---

## 8. Administrative Control Endpoints

All endpoints require `authenticate` and `requireRole('admin')`:

### `GET /api/admin/session`

- **Description**: Validates admin session token. Returns `{ user: { id, email, name, role } }`.

### `GET /api/admin/ingestion-jobs`

- **Description**: Lists ingestion jobs with filtering by `status` (`queued`, `running`, `succeeded`, `failed`, `skipped_duplicate`) and `jobType`. Returns `{ jobs, meta }`.

### `GET /api/admin/ingestion-jobs/:id`

- **Description**: Retrieves single ingestion job details and error log.

### `POST /api/admin/ingestion-jobs/:id/retry`

- **Description**: Retries a failed crawler/upload job.
- **Constraint**: Only jobs with `status === 'failed'` can be retried. Active or succeeded jobs return HTTP 409 `RESOURCE_CONFLICT`.
- **Response (200 OK)**: Returns updated job in `queued` state.

### `GET /api/admin/sources`

- **Description**: Lists official government gazette sources. Returns `{ sources, meta }`.

### `POST /api/admin/sources`

- **Description**: Registers a new official source. Validated with deep SSRF checks (protocol, private IP, metadata, loopback).
- **Request Body**: `{ name, sourceUrl, state, category, sourceType, updateFrequencyDays }`.
- **Response (201 Created)**: Returns source object.

### `GET /api/admin/sources/:id`

- **Description**: Retrieves official source details.

### `PUT /api/admin/sources/:id`

- **Description**: Updates source metadata.

### `PATCH /api/admin/sources/:id/status`

- **Description**: Toggles source active status (`{ isActive: boolean }`).

### `DELETE /api/admin/sources/:id`

- **Description**: Deletes an official source.

### `POST /api/admin/sources/:id/ingest`

- **Description**: Triggers an on-demand crawl job for an official source.
- **Constraint**: Source must be `isActive === true`. Inactive sources return HTTP 400 `VALIDATION_ERROR`.
- **Response (202 Accepted)**: Returns queued job object.

### `PATCH /api/admin/documents/:id`

- **Description**: Updates document metadata (title, state, category, status).

### `GET /api/admin/users` — **NOT IMPLEMENTED**

- **Status**: Not implemented in the current backend architecture. Disclosed honestly on `AdminUsersPage.jsx`.

---

## 9. AI Interaction & Verification Endpoints (501 Handover Contracts)

All endpoints require `authenticate` and enforce `createAiLimiter()` (20 req/min):

### `GET /api/ai/status`

- **Description**: AI capability readiness probe.
- **Response (200 OK)**:
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

### `POST /api/ai/ask`

- **Description**: Citizen conversational assistant hook shell.
- **Contract Schema**: `askAiSchema`: `{ question: string (3-1000 chars), language?: string, conversationId?: string, documentId?: string, filters?: object }`.
- **Current Behavior**: Calls `ragService.answerQuestion()`, which throws `NotImplementedError`.
- **Response (HTTP 501 NOT_IMPLEMENTED)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "AI citizen assistant pipeline is not yet implemented",
      "requestId": "..."
    }
  }
  ```

### `POST /api/ai/eligibility`

- **Description**: Scheme eligibility evaluator hook shell.
- **Contract Schema**: `eligibilityCheckSchema`: `{ query: string (3-500 chars), documentIds?: string[], applicant: object, language?: string }`.
- **Current Behavior**: Calls `eligibilityService.checkEligibility()`, throwing `NotImplementedError`.
- **Response (HTTP 501 NOT_IMPLEMENTED)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "AI scheme eligibility evaluation is not yet implemented",
      "requestId": "..."
    }
  }
  ```

### `POST /api/verify/claim`

- **Description**: Government rumor and circular verification hook shell.
- **Contract Schema**: `verifyClaimSchema`: `{ claim: string (10-2000 chars), language?: string }`.
- **Current Behavior**: Calls `verificationService.verifyClaim()`, throwing `NotImplementedError`.
- **Response (HTTP 501 NOT_IMPLEMENTED)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "Claim verification pipeline is not yet implemented",
      "requestId": "..."
    }
  }
  ```
