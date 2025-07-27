# Deployment Guide

This guide covers deploying the Collaborate project with frontend on Vercel and backend on Render.

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
     NEXT_PUBLIC_API_URL = https://your-backend-app.onrender.com/api
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

## 🌐 Backend Deployment (Render)

### Prerequisites
- GitHub repository
- Render account
- MongoDB Atlas database

### Steps

1. **Prepare MongoDB Database**
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Whitelist Render's IP addresses (or use 0.0.0.0/0 for all IPs)

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Select the backend folder (if prompted)

3. **Configure Build Settings**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Node Version**: 18.x

4. **Set Environment Variables in Render**
   Go to your service dashboard → Environment Variables and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collaborate
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-app.vercel.app
   SESSION_SECRET=collaborate-session-secret-change-in-production
   GITHUB_CLIENT_ID=your-github-client-id (optional)
   GITHUB_CLIENT_SECRET=your-github-client-secret (optional)
   GITHUB_TOKEN=your-github-personal-access-token (optional)
   ```

5. **Deploy**
   - Render will automatically build and deploy your backend
   - Your API will be available at `https://your-backend-app.onrender.com`

### Health Check
Your backend includes a health check endpoint at `/api/health` that Render uses to monitor your service.

## 🔄 Post-Deployment Steps

1. **Update Frontend Environment Variable**
   - After backend deployment, update `NEXT_PUBLIC_API_URL` in Vercel with your actual Render URL
   - Redeploy the frontend

2. **Test the Application**
   - Visit your Vercel frontend URL
   - Register a new account
   - Create a project
   - Verify all features work

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
   - Check that both URLs use HTTPS in production

2. **Database Connection Issues**
   - Verify MongoDB connection string is correct
   - Ensure database user has read/write permissions
   - Check IP whitelist includes Render's IPs

3. **Environment Variables**
   - Double-check all required environment variables are set
   - Ensure no typos in variable names
   - Verify sensitive values are not exposed in client-side code

4. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are listed in package.json
   - Verify Node.js version compatibility

### Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down may be slow (cold start)
- 750 hours per month limit

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
