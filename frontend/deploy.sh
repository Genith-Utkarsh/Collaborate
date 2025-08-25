#!/bin/bash

# Frontend deployment script for Vercel
echo "🚀 Deploying Collaborate Frontend to Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building the application..."
npm run build

# Run linting
echo "🔍 Running linter..."
npm run lint

echo "✅ Build completed successfully!"
echo "📝 Make sure to set the following environment variables in Vercel:"
echo "   - NEXT_PUBLIC_API_URL: Your Cloudflare Worker base URL (no trailing /api)"
echo ""
echo "🌐 Deploy command: vercel --prod"
