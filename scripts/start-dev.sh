#!/bin/bash

# Development startup script for Therapeutic Nutrition App

set -e

echo "🚀 Starting Therapeutic Nutrition App in Development Mode"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Please edit .env file with your API keys before continuing"
    exit 1
fi

# Check for required API keys
if grep -q "your_.*_api_key_here\|sk-your_openai_api_key_here" .env; then
    echo "⚠️  Warning: Please update your API keys in the .env file"
    echo "   Required keys: OPENAI_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY"
fi

# Build and start development environment
echo "🔨 Building development environment..."
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d

echo "✅ Development environment started!"
echo ""
echo "📱 Application: http://localhost:5000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "📊 Health Check: http://localhost:5000/health"
echo ""
echo "📋 View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "🛑 Stop: docker-compose -f docker-compose.dev.yml down"