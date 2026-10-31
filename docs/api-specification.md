# JanSathi AI API Specification

## General Conventions

- **Base URL**: `/api`
- **Data Format**: JSON (Content-Type: `application/json`)
- **Dates**: ISO-8601 UTC string format (e.g., `2026-10-31T16:50:00.000Z`)
- **Authentication**: JWT sent via HTTP Authorization header: `Authorization: Bearer <token>`

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
  "limit": 10,
  "total": 42,
  "totalPages": 5
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
    "details": [ ... ] // optional array or object for field-level validation errors
  }
}
```

## Error Codes & HTTP Status

| Code                     | HTTP Status | Description                                                      |
| ------------------------ | ----------- | ---------------------------------------------------------------- |
| `VALIDATION_ERROR`       | 400         | Request validation failure (e.g. invalid parameters or schema)   |
| `UNAUTHENTICATED`        | 401         | Missing or invalid authentication token                          |
| `FORBIDDEN`              | 403         | Insufficient role or access permissions                          |
| `NOT_FOUND`              | 404         | Resource not found                                               |
| `CONFLICT`               | 409         | Conflicting resource state (e.g. duplicate key)                  |
| `PAYLOAD_TOO_LARGE`      | 413         | Request payload exceeds maximum allowable size                   |
| `UNSUPPORTED_MEDIA_TYPE` | 415         | Unsupported file format or media type                            |
| `RATE_LIMITED`           | 429         | Rate limit exceeded                                              |
| `INTERNAL_ERROR`         | 500         | Unexpected internal server error                                 |
| `NOT_IMPLEMENTED`        | 501         | Feature or AI capability hook point not yet implemented          |
| `SERVICE_UNAVAILABLE`    | 503         | Dependent downstream service or database temporarily unavailable |

## Endpoints

### 1. Health Check

Retrieves the operational status of the API server.

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
      "uptimeSeconds": 120,
      "timestamp": "2026-10-31T16:50:00.000Z"
    }
  }
  ```
