# AI Mart Pro — AI-Powered Multi-Vendor E-Commerce Platform

**A full-stack Final Year Project implementation based on the supplied 60-page AI Mart Pro SRS.**

Four user roles: **Customer, Vendor, Administrator, Delivery Agent**. Responsive frontend, REST API, PostgreSQL database, protected AI service, demo data, model-training/evaluation scripts and smoke tests.

> **Honest scope:** This is a runnable academic application, **not** a hosted live shop and **not** a payment processing service. It requires local setup and dependencies. The two supplied ML models are trained/evaluated on **synthetic or tiny illustrative data**, so predictions are **estimates**, not demonstrated real-world accuracy. Full integration testing requires PostgreSQL and JavaScript dependencies. See `docs/SRS_COVERAGE.md`.

## Technology

- `apps/web` — Next.js 15, React 19, TypeScript, Tailwind CSS, reusable UI controls and Recharts.
- `apps/api` — Node.js, Express, JWT in HTTP-only cookies, bcrypt, Zod, Prisma, PostgreSQL, ownership checks and transaction-safe checkout.
- `services/ai` — FastAPI, scikit-learn, NumPy, Pandas, versioned model files, real synthetic-dataset evaluation metrics.
- Product images — S3-compatible object storage in production, validated local upload fallback in development.
- External product intelligence — disabled until an administrator configures a strict public-domain allowlist; private or local IP addresses rejected.

## Quick start — Windows, macOS or Linux

**Prerequisites:** Node.js 20.9+ (Node 22 recommended), npm, Python 3.11–3.13, PostgreSQL 16 (or Docker Desktop for the database).

1. Extract the ZIP and open the `ai-mart-pro` folder in VS Code / a terminal.
2. Start PostgreSQL. Easiest route if Docker Desktop is installed:

   ```bash
   docker compose up -d postgres
   ```

   Or configure your own running PostgreSQL database (create an empty database named `aimart`).
3. Create environment files by copying examples:

   **Windows PowerShell**
   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/web/.env.example apps/web/.env.local
   Copy-Item services/ai/.env.example services/ai/.env
   ```

   **macOS / Linux**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   cp services/ai/.env.example services/ai/.env
   ```

   Ensure `AI_SERVICE_KEY` matches in the API and AI `.env` files. **Replace `JWT_SECRET` with 32+ unpredictable characters** before starting; change shared secrets before deploying publicly.
4. Install frontend/backend JavaScript dependencies, create schema and demo data:

   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

   If the migration command cannot prompt in your environment, use `npm run db:push` for first local setup. For tracked team schema changes, prefer Prisma migrations.
5. Install Python AI dependencies and run service (new terminal):

   ```bash
   cd services/ai
   python -m pip install -r requirements.txt
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

   Trained **demonstration** model artifacts are supplied in `services/ai/models`. Regenerate with `python train.py` to reproduce the synthetic evaluation.
6. Start backend (new terminal, from project root):

   ```bash
   npm run dev:api
   ```

7. Start frontend (new terminal, from project root):

   ```bash
   npm run dev:web
   ```

8. Open **http://localhost:3000**. Backend health at http://localhost:4000/health, AI health at http://localhost:8000/health.

**Tip:** Registration allows Customer or Vendor. Admin and Delivery accounts are seeded for the university demonstration and should never be publicly registrable.

### One-command Docker setup (optional)

If Docker Desktop is installed, `docker compose up --build` can build PostgreSQL, AI, API and UI together. Open `http://localhost:3000`. This requires internet to download base images and packages. These Docker deployment definitions are supplied as a convenience and were not run in the authoring environment.

## Demo login accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@aimart.test` | `Demo12345!` |
| Vendor | `vendor@aimart.test` | `Demo12345!` |
| Admin | `admin@aimart.test` | `Demo12345!` |
| Delivery | `delivery@aimart.test` | `Demo12345!` |

All demo accounts and 18 sample products are created with `npm run db:seed`. Sample orders and reviews are also seeded to populate charts and sentiment analysis. **Do not use these accounts/passwords on the public internet.**

## Where to click to test

- **Customer:** Shop → product detail → Add to cart → Checkout with COD → My Orders → Track status. Compare products via *Add to compare* → `/compare`. Wishlist and verified reviews are also available.
- **Vendor:** `/vendor` → sales analytics; `/vendor/products` → create/edit product and upload images; `/vendor/orders` → mark order items confirmed, packed and shipped; `/vendor/insights` → sales prediction and inventory guidance; `/vendor/reviews` → sentiment; `/vendor/intelligence` → safe external URL analysis (requires domain allowlist).
- **Admin:** `/admin` → analytics; `/admin/users` → roles/suspension; `/admin/categories` → category creation; `/admin/reports` → moderation; `/admin/orders` → assign deliveries; `/admin/audit` → audit trail.
- **Delivery:** `/delivery` → assigned job → picked up → in transit → delivered (or failed). The seeded delivery agent receives no initial assignments until Admin creates one.

## Tests

- AI service (in `services/ai`): `python -m pytest -q tests/test_api.py` (install `pytest` and `httpx` if not available).
- Backend JS syntax: `node --check apps/api/src/server.js`
- Basic integration smoke (all services must be running and demo data seeded): `node scripts/smoke.mjs`.
- Frontend production build: `npm run build:web`.

The authorship environment ran **AI tests (4 passed)**, Node syntax checks, and TypeScript transpilation syntax checks. Full browser / database integration and production builds could not be executed in the available environment because the npm registry was unreachable and PostgreSQL/Docker were not available. **These must be run on your computer.**

## Folder structure

```text
ai-mart-pro/
  apps/
    web/              Next.js UI / reusable product + dashboard components
    api/              Express routes, Prisma models, upload and security code
  services/ai/        FastAPI + trained demonstration models + training + tests
  scripts/            SVG art generation + smoke tests
  docs/               Architecture, API, requirement coverage & limitations
  docker-compose.yml
  README.md
```

## Configuration and deployment

- `apps/api/.env`: DB URL, JWT secret, CORS origin, AI service address/key, optional S3 and product URL allowlist.
- `apps/web/.env.local`: frontend API proxy. `NEXT_PUBLIC_API_URL=/backend` proxies same-origin requests to the Express service through the Next.js rewrite; `API_REWRITE_TARGET=http://localhost:4000` during local development.
- `services/ai/.env`: `AI_SERVICE_KEY` matching the API service. This is a **server-to-server secret**.
- For public production, set HTTPS, proper secure secrets, real managed DB with backups, protected storage, and a permanent backend/AI host. Deploy the Next.js app on a suitable Next.js host and change the proxy destination to the public API address at **build time**.
- Payment methods COD and bank transfer create **records only**, and never transfer money. No real courier integration exists. Public product intelligence needs domain allowlist configuration. Optional customer segmentation / anomaly flags are explicitly **not included**.

See `docs/ARCHITECTURE.md` and `docs/SRS_COVERAGE.md` for details.
