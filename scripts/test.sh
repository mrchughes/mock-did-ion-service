#!/bin/bash

# Mock DID:ION Service - Test Script
# This script runs all tests and generates coverage reports

set -e

echo "🧪 Running Mock DID:ION Service tests..."

# Check if the project is built
if [ ! -d "dist" ]; then
    echo "📦 Building project first..."
    npm run build
fi

# Run unit tests
echo "🔬 Running unit tests..."
npm test

# Run integration tests (if they exist)
if [ -f "test/integration.test.ts" ]; then
    echo "🔗 Running integration tests..."
    npm run test -- --testPathPattern=integration
fi

# Generate coverage report
echo "📊 Generating coverage report..."
npm test -- --coverage

echo "✅ All tests completed successfully!"
echo ""
echo "📋 Test results:"
echo "   • Coverage report: coverage/lcov-report/index.html"
echo "   • Run 'npm run test:watch' for continuous testing during development"
