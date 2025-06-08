#!/bin/bash

# Production startup script for Therapeutic Nutrition App

set -e

echo "🚀 Starting Therapeutic Nutrition App in Production Mode"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Please edit .env file with your API keys before continuing"
    exit 1
fi

# Validate required environment variables
required_vars=("OPENAI_API_KEY" "GEMINI_API_KEY" "PERPLEXITY_API_KEY" "SESSION_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] && ! grep -q "^${var}=" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   %s\n' "${missing_vars[@]}"
    echo "Please update your .env file"
    exit 1
fi

# Create SSL directory if it doesn't exist
mkdir -p nginx/ssl

# Build and start production environment
echo "🔨 Building production environment..."
docker-compose down
docker-compose up --build -d

echo "✅ Production environment started!"
echo ""
echo "🌐 Application: http://localhost"
echo "🔒 HTTPS: https://localhost (if SSL configured)"
echo "📊 Health Check: http://localhost/health"
echo ""
echo "📋 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"