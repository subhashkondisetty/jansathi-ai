# JanSathi AI — Production Deployment Guide (`DEPLOYMENT.md`)

> **Project**: JanSathi AI (जन साथी AI)  
> **Theme**: FORGE '26 — Theme 1: Civic Pulse  
> **Deployment Architecture**: Vercel (Frontend SPA) + Render (Backend Web Service) + MongoDB Atlas (Database Cluster)  
> **Governance Notice**: This guide details the manual production deployment procedure for system operators. No automated deployment actions or account creations are performed by this assistant.

---

## 1. Deployment Topology & Prerequisites

JanSathi AI operates on a modern, decoupled production topology:

- **Database**: MongoDB Atlas M0 (Free Tier) or M10+ Replica Set.
- **Backend API**: Render Web Service (Node.js 20+ runtime).
- **Frontend SPA**: Vercel Git-integrated Deployment (Vite static build with SPA rewrites).

### Operator Prerequisites:

1. GitHub/GitLab account hosting the JanSathi AI repository.
2. Verified MongoDB Atlas account ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)).
3. Render account ([render.com](https://render.com)).
4. Vercel account ([vercel.com](https://vercel.com)).
5. Terminal with Node.js 20+ and OpenSSL installed locally.

---

## 2. Step 1: MongoDB Atlas Database Setup

### 2.1 Cluster Creation

1. Log in to the MongoDB Atlas dashboard.
2. Create a new project named `JanSathi-Production`.
3. Deploy a cluster (e.g., M0 Free or dedicated M10) in an AWS/GCP region closest to your target audience (e.g. `ap-south-1` Mumbai).

### 2.2 Dedicated Database User Creation

1. Navigate to **Security** -> **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password (SCRAM-SHA-256)**.
4. Set a dedicated username (e.g., `jansathi_app_user`).
5. Generate a cryptographically secure password (save securely in your password manager).
6. Under **Database User Privileges**, select **Built-in Role** -> **Read and write to any database** (or restrict to `jansathi` database: `readWrite@jansathi`).

### 2.3 Network Access Configuration

1. Navigate to **Security** -> **Network Access**.
2. Click **Add IP Address**.
3. **Recommended Production Configuration**: Restrict network access to known application egress IPs or utilize a dedicated private networking solution (such as AWS VPC Peering, AWS PrivateLink, or GCP Private Service Connect) between your cluster and hosting provider.
4. **Dynamic Egress IP Considerations**:
   - Standard hobby or shared tiers on PaaS providers (such as Render basic web services) utilize dynamic egress IP pools shared across the cloud provider's region.
   - If dedicated static outbound IPs or VPC Peering are unavailable on your hosting tier, restricting access by IP may require updating whitelisted ranges when provider subnets change.
   - _Security Notice_: Never assume that strong database passwords or SCRAM-SHA-256 authentication render unrestricted network access (`0.0.0.0/0`) safe. Open network access exposes database listeners to brute-force attempts and denial-of-service vectors. Always restrict network boundaries wherever provider capabilities permit.

### 2.4 Obtain Connection URI

1. Click **Database** -> **Connect** -> **Drivers** (Node.js 6.7+).
2. Copy the SRV connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/jansathi?retryWrites=true&w=majority
   ```
3. Replace `<username>` and `<password>` with the credentials created in Step 2.2.

---

## 3. Step 2: Render Backend Web Service Deployment

### 3.1 Create Web Service on Render (npm Workspace Configuration)

In an npm workspaces monorepo, the single authoritative `package-lock.json` lives at the repository root. Setting Render's Root Directory to `server` will bypass this lockfile and can cause dependency resolution inconsistencies. Deploy from the repository root:

1. Log in to Render and click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `jansathi-api`
   - **Region**: Matching your Atlas region (e.g., `Singapore` or `Frankfurt`).
   - **Branch**: `master` (or production branch).
   - **Root Directory**: Leave blank or set to `.` (Repository root).
   - **Runtime**: `Node`
   - **Build Command**: `npm ci --workspace=server --include-workspace-root`
   - **Start Command**: `npm run start` (executes `npm run start --workspace=server` from root)
   - **Plan Type**: `Starter` or above (with dedicated outbound IP where available)

### 3.2 Configure Backend Environment Variables

In the Render dashboard, navigate to **Environment** and add the following secret keys:

| Key                          | Example / Description                                               | Requirement                                                       |
| :--------------------------- | :------------------------------------------------------------------ | :---------------------------------------------------------------- |
| `NODE_ENV`                   | `production`                                                        | **Required**                                                      |
| `PORT`                       | `10000` (Render sets `PORT` automatically, but Express respects it) | **Required**                                                      |
| `MONGODB_URI`                | `mongodb+srv://.../jansathi?retryWrites=true&w=majority`            | **Required** (Remote Atlas URI)                                   |
| `JWT_SECRET`                 | 64-char hex generated via `openssl rand -hex 32`                    | **Required** (>= 32 chars)                                        |
| `CLIENT_ORIGIN`              | `https://jansathi.vercel.app` (Your Vercel URL)                     | **Required**                                                      |
| `TRUST_PROXY`                | `1`                                                                 | **Required** (Enables accurate IP resolution behind Render proxy) |
| `LOG_LEVEL`                  | `info`                                                              | Optional (default: `info`)                                        |
| `BODY_LIMIT`                 | `100kb`                                                             | Optional (default: `100kb`)                                       |
| `RATE_LIMIT_GLOBAL_MAX`      | `300`                                                               | Optional (default: `300`)                                         |
| `RATE_LIMIT_AUTH_MAX`        | `10`                                                                | Optional (default: `10`)                                          |
| `RATE_LIMIT_AI_PER_MIN`      | `20`                                                                | Optional (default: `20`)                                          |
| `RATE_LIMIT_UPLOAD_PER_HOUR` | `10`                                                                | Optional (default: `10`)                                          |
| `MAX_UPLOAD_MB`              | `10`                                                                | Optional (default: `10`)                                          |
| `AUTO_INDEX`                 | `false`                                                             | Recommended in production (use `db:sync-indexes`)                 |
| `INGESTION_WORKER_ENABLED`   | `true`                                                              | Optional (default: `true`)                                        |
| `INGESTION_CONCURRENCY`      | `1`                                                                 | Optional (default: `1`)                                           |

### 3.3 Configure Health Check (`/api/health` vs `/api/health/ready`)

Under **Advanced Settings** on Render:

- **Health Check Path**: `/api/health/ready`

#### Rationale: Liveness vs. Readiness Probe

- **`/api/health` (Liveness)**: Evaluates whether the Node.js Express process is running. Always returns HTTP 200 `status: 'ok'` even if the database is disconnected.
- **`/api/health/ready` (Readiness)**: Evaluates active database connectivity via `mongoose.connection.readyState === 1`. Returns HTTP 200 `status: 'ready'` when connected, and HTTP 503 `SERVICE_UNAVAILABLE` when disconnected.
- **Why Render needs `/api/health/ready`**: Render uses the health check path during zero-downtime deployment to decide when a newly booted instance is ready to receive public traffic. Pointing to `/api/health/ready` ensures that a container with invalid database credentials or a network partition is not promoted to production, preventing public-facing downtime.

### 3.4 Seed Database Indexes & Admin Account (Safe Secret Injection)

Once deployed, open the Render **Shell** tab:

1. **Build text search and TTL indexes**:
   ```bash
   npm run --workspace=server db:sync-indexes
   ```
2. **Provision the initial system administrator (Safe Secret-Injection)**:
   Do not pass passwords directly in command text or shell arguments to prevent credential logging in `.bash_history` and `ps` process tables:
   ```bash
   read -s -p "Enter Initial Admin Password: " ADMIN_PASS
   echo ""
   ADMIN_PASSWORD="$ADMIN_PASS" npm run --workspace=server create-admin -- --email="admin@jansathi.gov.in" --name="System Administrator"
   unset ADMIN_PASS
   ```

---

## 4. Step 3: Vercel Frontend Deployment

### 4.1 Import Project into Vercel

1. Log in to Vercel and click **Add New...** -> **Project**.
2. Select your repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `client`.
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4.2 Configure Frontend Environment Variables

In the Vercel project configuration, add:

| Key                 | Value                                   | Description                                         |
| :------------------ | :-------------------------------------- | :-------------------------------------------------- |
| `VITE_API_BASE_URL` | `https://jansathi-api.onrender.com/api` | Your Render public backend API URL with `/api` path |

### 4.3 Verify SPA Routing Configuration

Confirm that [`client/vercel.json`](file:///c:/Users/SUBHASH/OneDrive/Desktop/Janshanti/client/vercel.json) is present in the repository with the rewrite rule:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/((?!api/|assets/|.*\\.[a-zA-Z0-9]+$).*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures direct URLs (e.g. `https://jansathi.vercel.app/assistant`, `/admin/documents`) resolve cleanly to `index.html` without 404 errors.

---

## 5. Post-Deployment Verification (Smoke Test Suite)

Execute the following verification checks against your deployed URLs:

```bash
# 1. Verify Backend Liveness Probe
curl -i https://jansathi-api.onrender.com/api/health
# Expected: HTTP 200 OK with status: "UP", database.connected: true

# 2. Verify Backend Readiness Probe
curl -i https://jansathi-api.onrender.com/api/health/ready
# Expected: HTTP 200 OK with status: "READY"

# 3. Verify Options & System Metadata
curl -i https://jansathi-api.onrender.com/api/meta/options
# Expected: HTTP 200 OK with states, categories, and limits

# 4. Verify AI Status Contract (Preserves non-AI governance)
curl -i https://jansathi-api.onrender.com/api/ai/status
# Expected: HTTP 200 OK with connected: false, all feature flags false

# 5. Verify CORS Policy Rejection
curl -i -H "Origin: https://malicious-site.com" https://jansathi-api.onrender.com/api/meta/options
# Expected: HTTP 403 Forbidden with "CORS request from origin blocked by policy"

# 6. Verify Frontend Routing in Browser
# Navigate to:
#   - https://jansathi.vercel.app/ (Home)
#   - https://jansathi.vercel.app/documents (Catalog)
#   - https://jansathi.vercel.app/assistant (Civic AI Assistant - 501 card)
#   - https://jansathi.vercel.app/login (Authentication)
# Refresh the page on /assistant to verify that SPA rewrites work cleanly.
```

---

## 6. Rollback Considerations & Disaster Recovery

1. **Frontend Rollback (Vercel)**:
   - In the Vercel Dashboard, go to **Deployments**.
   - Locate the previous successful deployment.
   - Click the three dots (`...`) -> **Promote to Production**. Instant rollback takes effect in < 5 seconds.
2. **Backend Rollback (Render)**:
   - In the Render Dashboard, go to **Events** / **Deploys**.
   - Select the last stable build commit.
   - Click **Rollback to this deploy**.
3. **Database Point-in-Time Recovery (MongoDB Atlas)**:
   - Atlas Replica Sets support Continuous Cloud Backups.
   - If data corruption occurs, navigate to **Backup** -> **Restore** -> **Point-in-Time Restore** to recover database state to a specific minute.
