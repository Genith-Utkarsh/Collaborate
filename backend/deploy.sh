#!/bin/bash

# Backend deployment script for Render
echo "🚀 Deploying Collaborate Backend to Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building TypeScript..."
npm run build

# Verify build
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Dist folder created with compiled JavaScript"
else
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo "📝 Make sure to set the following environment variables in Render:"
echo "   - MONGODB_URI: Your MongoDB connection string"
echo "   - JWT_SECRET: A secure random string"
echo "   - FRONTEND_URL: Your Vercel frontend URL"
echo "   - All other environment variables from .env.example"
echo ""
echo "🌐 Ready for Render deployment!"
