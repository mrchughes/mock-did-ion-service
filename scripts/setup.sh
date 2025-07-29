#!/bin/bash

# Mock DID:ION Service - Development Setup Script
# This script sets up the development environment

set -e

echo "🛠️  Setting up Mock DID:ION Service development environment..."

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
npm install

# Run initial build
echo "🔨 Building project..."
npm run build

echo "✅ Development environment setup completed!"
echo ""
echo "📋 Available commands:"
echo "   • npm run dev       - Start development server with hot reload"
echo "   • npm run build     - Build for production"
echo "   • npm run start     - Start production server"
echo "   • npm run test      - Run tests"
echo "   • npm run lint      - Run linter"
echo ""
echo "🌐 The service will be available at:"
echo "   • Development: http://localhost:3000"
echo "   • Health check: http://localhost:3000/health"
