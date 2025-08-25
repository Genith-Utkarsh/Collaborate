Backend migration to Cloudflare Workers
--------------------------------------

The Node/Express + Mongo backend under `backend/` has been retired. The app now uses a Cloudflare Worker with Hono + Prisma Accelerate (Postgres) in `worker/`.

Key URLs:
- Health: GET https://collaborate-worker.buvautkarsh849.workers.dev/api/health
- API base: https://collaborate-worker.buvautkarsh849.workers.dev/api

Frontend must point NEXT_PUBLIC_API_URL to the Worker base URL (without trailing /api).
