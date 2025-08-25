# Deployment Guide

This guide covers deploying the Collaborate project with frontend on Vercel and backend on Cloudflare Workers (Prisma Accelerate).

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository
- Vercel account

### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Set Environment Variables in Vercel**
   - Go to your project dashboard → Settings → Environment Variables
   - Add these variables:
     ```
   NEXT_PUBLIC_API_URL = https://<your-worker>.<your-account>.workers.dev
     ```

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Your app will be available at `https://your-app.vercel.app`

### Local Development
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Backend Deployment (Cloudflare Workers)

### Prerequisites
# Deployment Guide

This guide covers deploying the Collaborate project with frontend on Vercel and backend on Cloudflare Workers (Prisma Accelerate with PostgreSQL).

## Frontend on Vercel

1. Push code to GitHub.
2. In Vercel, import the repo and set env var:
   - NEXT_PUBLIC_API_URL = https://<your-worker>.<your-account>.workers.dev
3. Deploy.

## Backend on Cloudflare Workers

1. Configure database and secrets in `worker/wrangler.toml`:
   - DATABASE_URL = Prisma Accelerate Postgres URL
   - JWT_SECRET = a strong secret
2. Deploy from the worker folder:
   - npm ci
   - npm run deploy
3. Health check: GET /api/health

## Post-deploy

- Update Vercel env and redeploy frontend.
- Test: register, login, create/list projects.

## Notes

- The legacy `backend/` folder (Mongo/Render) is no longer used. You can archive or remove it later.
- CORS is permissive for now; restrict origins in `worker/src/index.ts` for production.
   - Create a project
