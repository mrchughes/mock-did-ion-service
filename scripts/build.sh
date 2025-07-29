#!/bin/bash

# Mock DID:ION Service - Build Script
# This script builds the service for production deployment

set -e

echo "🚀 Building Mock DID:ION Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm test

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   • Run 'npm start' to start the service"
echo "   • Run 'docker-compose up' to start with Docker"
echo "   • The service will be available at http://localhost:3000"
