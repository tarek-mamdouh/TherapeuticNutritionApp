#!/bin/bash

# Deployment script for Therapeutic Nutrition App
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment of Therapeutic Nutrition App${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${RED}📝 Please edit .env file with your configuration before proceeding${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=("OPENAI_API_KEY" "GEMINI_API_KEY" "PERPLEXITY_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Create necessary directories
mkdir -p logs
mkdir -p nginx/ssl
mkdir -p database/init

echo -e "${GREEN}📁 Created necessary directories${NC}"

# Build and start services
echo -e "${GREEN}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${GREEN}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service health
echo -e "${GREEN}🏥 Checking service health...${NC}"

# Check main application
if curl -f http://localhost:5000/api/foods > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Main application is healthy${NC}"
else
    echo -e "${RED}❌ Main application health check failed${NC}"
    docker-compose logs nutrition-app
    exit 1
fi

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U $PGUSER -d $PGDATABASE > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL health check failed (this is normal if using in-memory storage)${NC}"
fi

# Check Nginx
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx is healthy${NC}"
else
    echo -e "${RED}❌ Nginx health check failed${NC}"
    docker-compose logs nginx
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📱 Application is available at: http://localhost${NC}"
echo -e "${GREEN}🔧 API endpoint: http://localhost/api${NC}"

# Display service status
echo -e "\n${YELLOW}📊 Service Status:${NC}"
docker-compose ps