#!/bin/bash

# Production readiness check script
echo "🔍 Checking production readiness..."

errors=0

# Check required files exist
echo "📋 Checking required deployment files..."

files=(
    "frontend/vercel.json"
    "frontend/.env.example"
    "backend/.env.example"
    "backend/render.yaml"
    "DEPLOYMENT.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        errors=$((errors + 1))
    fi
done

# Check package.json scripts
echo ""
echo "📦 Checking package.json scripts..."

# Frontend scripts
if grep -q '"build"' frontend/package.json && grep -q '"start"' frontend/package.json; then
    echo "✅ Frontend build/start scripts"
else
    echo "❌ Frontend missing build/start scripts"
    errors=$((errors + 1))
fi

# Backend scripts
if grep -q '"build"' backend/package.json && grep -q '"start"' backend/package.json; then
    echo "✅ Backend build/start scripts"
else
    echo "❌ Backend missing build/start scripts"
    errors=$((errors + 1))
fi

# Check environment variable examples
echo ""
echo "🔐 Checking environment variable templates..."

if grep -q "NEXT_PUBLIC_API_URL" frontend/.env.example; then
    echo "✅ Frontend environment template"
else
    echo "❌ Frontend environment template incomplete"
    errors=$((errors + 1))
fi

if grep -q "MONGODB_URI" backend/.env.example && grep -q "JWT_SECRET" backend/.env.example; then
    echo "✅ Backend environment template"
else
    echo "❌ Backend environment template incomplete"
    errors=$((errors + 1))
fi

# Check for sensitive files that shouldn't be committed
echo ""
echo "🔒 Checking for sensitive files..."

sensitive_files=(
    ".env"
    "backend/.env"
    "frontend/.env"
)

for file in "${sensitive_files[@]}"; do
    if [ -f "$file" ]; then
        echo "⚠️  Warning: $file should not be committed (add to .gitignore)"
    fi
done

# Summary
echo ""
if [ $errors -eq 0 ]; then
    echo "🎉 Production readiness check passed!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Review DEPLOYMENT.md for detailed instructions"
    echo "2. Set up MongoDB Atlas database"
    echo "3. Push code to GitHub"
    echo "4. Deploy backend to Render"
    echo "5. Deploy frontend to Vercel"
    echo "6. Configure environment variables"
else
    echo "❌ Production readiness check failed with $errors errors"
    echo "Please fix the issues above before deploying"
    exit 1
fi
