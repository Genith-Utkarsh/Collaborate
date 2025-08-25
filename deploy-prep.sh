#!/bin/bash

# Complete deployment preparation script
echo "🚀 Preparing Collaborate for Deployment..."

# Check if we're in the root directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install frontend dependencies
echo "Frontend dependencies..."
cd frontend
npm ci
cd ..

# Install backend dependencies  
echo "Backend dependencies..."
cd backend
npm ci
cd ..

echo "🔨 Building applications..."

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Build backend
echo "Building backend..."
cd backend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"  
    exit 1
fi
cd ..

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next steps for deployment:"
echo ""
echo "1. 🔗 Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. 🌐 Deploy Backend to Cloudflare Workers:"
echo "   - cd worker && npm run deploy"
echo "   - Note the Workers URL (e.g., https://<name>.<account>.workers.dev)"
echo ""
echo "3. ⚡ Deploy Frontend to Vercel:"
echo "   - Go to vercel.com"
echo "   - Import GitHub repo"
echo "   - Set NEXT_PUBLIC_API_URL to your Worker base URL (no trailing /api)"
echo ""
echo "4. 🔄 Update CORS:"
echo "   - CORS is permissive by default; consider restricting origin to your Vercel domain in worker/src/index.ts"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
