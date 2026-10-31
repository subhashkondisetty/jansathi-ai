# JanSathi AI

JanSathi AI is a civic information assistant for Indian citizens, providing reliable discovery of government schemes, notifications, and eligibility guidelines (FORGE '26, Theme 1: "Civic Pulse").

> Note: Non-AI MERN foundational architecture. AI integration points return `HTTP 501 NOT_IMPLEMENTED` until subsequent phases.

## Prerequisites

- **Node.js**: v20 or higher (v24 supported)
- **npm**: v10 or higher
- **MongoDB Atlas** (required starting in Phase 2)

## Setup & Running

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

3. **Start development mode (Client & Server):**

   ```bash
   npm run dev
   ```
   - Client dev server: [http://localhost:5173](http://localhost:5173)
   - Server API: [http://localhost:5000/api](http://localhost:5000/api)
   - Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

4. **Lint and Format:**
   ```bash
   npm run lint
   npm run format:check
   ```
