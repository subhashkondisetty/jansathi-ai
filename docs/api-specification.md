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

- **Global**: 300 requests / 15 minutes (`RATE_LIMIT_GLOBAL_MAX`)
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
- `PATCH /api/admin/documents/:id`: Update document metadata and propagate to chunks.
