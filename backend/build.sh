#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Install TypeScript globally if not available
echo "🔧 Ensuring TypeScript is available..."
npm install -g typescript || echo "TypeScript already available"

# Build the application
echo "🏗️ Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"
