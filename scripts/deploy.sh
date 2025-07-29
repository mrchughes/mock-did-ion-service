#!/bin/bash

# Mock DID:ION Service - Docker Deployment Script
# This script builds and deploys the service using Docker

set -e

echo "🐳 Deploying Mock DID:ION Service with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker version: $(docker --version)"
echo "✅ Docker Compose version: $(docker-compose --version)"

# Build the project first
echo "🔨 Building project..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker-compose build

# Start the service
echo "🚀 Starting Mock DID:ION Service..."
docker-compose up -d

# Wait for service to be ready
echo "⏳ Waiting for service to start..."
sleep 10

# Check if service is healthy
if curl -f http://localhost:3000/health &> /dev/null; then
    echo "✅ Mock DID:ION Service is running successfully!"
    echo ""
    echo "🌐 Service endpoints:"
    echo "   • Health check: http://localhost:3000/health"
    echo "   • API documentation: http://localhost:3000/"
    echo "   • Create DID: POST http://localhost:3000/did/create"
    echo "   • Resolve DID: GET http://localhost:3000/did/resolve/{did}"
    echo "   • Verify signature: POST http://localhost:3000/did/verify"
    echo ""
    echo "📋 Management commands:"
    echo "   • docker-compose logs -f    - View logs"
    echo "   • docker-compose stop       - Stop the service"
    echo "   • docker-compose down       - Stop and remove containers"
else
    echo "❌ Service failed to start properly. Check logs with: docker-compose logs"
    exit 1
fi
