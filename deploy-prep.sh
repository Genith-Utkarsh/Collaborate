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
echo "2. 🌐 Deploy Backend to Render:"
echo "   - Go to render.com"
echo "   - Create new Web Service"
echo "   - Connect GitHub repo"
echo "   - Use build command: npm install && npm run build"
echo "   - Use start command: npm start"
echo "   - Set environment variables from backend/.env.example"
echo ""
echo "3. ⚡ Deploy Frontend to Vercel:"
echo "   - Go to vercel.com"
echo "   - Import GitHub repo"
echo "   - Set NEXT_PUBLIC_API_URL to your Render backend URL + /api"
echo ""
echo "4. 🔄 Update CORS:"
echo "   - Add your Vercel URL to FRONTEND_URL in Render environment variables"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
