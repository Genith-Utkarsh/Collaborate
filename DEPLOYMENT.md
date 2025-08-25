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
- GitHub repository
- Cloudflare account
- Prisma Accelerate Postgres database URL

### Steps

1. **Configure wrangler**
   - Edit `worker/wrangler.toml` with your `DATABASE_URL` and `JWT_SECRET`.
   - Optional: login with `npx wrangler login`.

2. **Deploy to Cloudflare**
   - From the `worker` folder run: `npm run deploy`.
   - You will get a Workers URL like:
     - https://collaborate-worker.buvautkarsh849.workers.dev

3. **Environment Variables**
   If you need to rotate or manage secrets, use `wrangler secret put`.

### Health Check
Your backend includes a health check endpoint at `/api/health` that returns a simple JSON status.

## 🔄 Post-Deployment Steps

1. **Update Frontend Environment Variable**
   - After backend deployment, update `NEXT_PUBLIC_API_URL` in Vercel with your Workers URL
   - Redeploy the frontend

2. **Test the Application**
   - Visit your Vercel frontend URL
   - Register a new account
   - Create a project
   - Verify all features work

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - The Worker uses permissive CORS for now. For production, restrict origins to your Vercel domain.

2. **Database Connection Issues**
   - Verify Prisma Accelerate `DATABASE_URL` is correct and active
   - Ensure the API key has access to the database

3. **Environment Variables**
   - Double-check all required environment variables are set
   - Ensure no typos in variable names
   - Verify sensitive values are not exposed in client-side code

4. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are listed in package.json
   - Verify Node.js version compatibility

### Vercel Free Tier Limitations
- 100GB bandwidth per month
- 10GB storage
- Serverless function execution time limits

## 📝 Maintenance

### Updating the Application
1. Make changes to your code
2. Push to GitHub
3. Both Vercel and Render will auto-deploy the changes

### Monitoring
- Use Vercel Analytics for frontend performance
- Use Render's built-in metrics for backend monitoring
- Set up MongoDB Atlas monitoring for database performance

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to GitHub
   - Use strong, unique values for JWT_SECRET and SESSION_SECRET
   - Rotate secrets regularly

2. **Database Security**
   - Use MongoDB Atlas IP whitelist
   - Create dedicated database users with minimal permissions
   - Enable MongoDB encryption at rest

3. **API Security**
   - Rate limiting is already configured
   - CORS is properly configured for your domains
   - Input validation is implemented

## 📊 Performance Optimization

1. **Frontend**
   - Next.js automatic optimizations are enabled
   - Static assets are served via Vercel's CDN
   - Image optimization is built-in

2. **Backend**
   - Database indexes are properly configured
   - API responses are optimized
   - Caching headers are set appropriately

---

🎉 **Congratulations!** Your Collaborate application is now deployed and ready for users!
