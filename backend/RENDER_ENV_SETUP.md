# Environment Variables Setup for Render

## Required Environment Variables

Add these in your Render dashboard under **Environment**:

### Core Variables
```
MONGODB_URI=mongodb+srv://buvautkarsh849:uX4uz86UqjbWECW4@cluster0.g427upx.mongodb.net/collaborate
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-vercel-app.vercel.app
SESSION_SECRET=collaborate-session-secret-change-in-production
```

### Optional (for GitHub OAuth)
```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_TOKEN=your-github-personal-access-token
```

## How to Add on Render

1. Go to your Render dashboard
2. Select your backend service
3. Click on **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable one by one
6. Click **Manual Deploy** to redeploy

## Security Notes

⚠️ For production, generate new secrets:
- JWT_SECRET: Use a random 256-bit string
- SESSION_SECRET: Use another random string
- Consider creating a new MongoDB user for production

## Health Check

Your service has a health check endpoint at `/api/health` that works even without database connection.
