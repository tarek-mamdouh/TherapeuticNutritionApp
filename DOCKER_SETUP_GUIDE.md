# Docker Setup Guide - Therapeutic Nutrition App

## Fixed Issues and Solutions

### Problem Solved
The original error was caused by `import.meta.dirname` incompatibility with Node.js 18. The solution uses Node.js 20 and proper Docker configuration.

### Error Fixed
```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
at Object.resolve (node:path:1115:7)
at <anonymous> (/app/vite.config.ts:21:17)
```

## Quick Start

### Development Setup
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your API keys
nano .env

# 3. Start development environment
./scripts/start-dev.sh

# 4. Access application
curl http://localhost:5000/health
```

### Production Setup
```bash
# 1. Configure environment
cp .env.example .env
# Edit with production values

# 2. Start production environment
./scripts/start-prod.sh

# 3. Access application
curl http://localhost/health
```

## Docker Files Created

### Development
- **Dockerfile.dev** - Development container with Node.js 20
- **docker-compose.dev.yml** - Simple development stack (app + PostgreSQL)
- **scripts/start-dev.sh** - Development startup script

### Production
- **Dockerfile** - Multi-stage production build
- **docker-compose.yml** - Full production stack (app + PostgreSQL + Redis + Nginx)
- **scripts/start-prod.sh** - Production startup script

## Environment Configuration

### Required API Keys
```env
OPENAI_API_KEY=sk-your_actual_openai_key
GEMINI_API_KEY=your_actual_gemini_key
PERPLEXITY_API_KEY=your_actual_perplexity_key
SESSION_SECRET=your_secure_session_secret
```

### Database Configuration
```env
PGDATABASE=nutrition_app_dev
PGUSER=nutrition_user
PGPASSWORD=nutrition_password
```

## Docker Commands

### Development
```bash
# Start development
docker-compose -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop development
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
# Start production
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop production
docker-compose down

# Clean up
docker-compose down -v && docker system prune -f
```

## Service Access Points

### Development Mode
- **Application**: http://localhost:5000
- **API Health**: http://localhost:5000/health
- **PostgreSQL**: localhost:5432

### Production Mode
- **Application**: http://localhost (via Nginx)
- **Direct App**: http://localhost:5000
- **Health Check**: http://localhost/health
- **HTTPS**: https://localhost (if SSL configured)

## Container Architecture

### Development Stack
```
┌─────────────────┐    ┌─────────────────┐
│   Node.js App   │◄──►│   PostgreSQL    │
│   Port: 5000    │    │   Port: 5432    │
│   Health: /health│    │                 │
└─────────────────┘    └─────────────────┘
```

### Production Stack
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Nginx    │◄──►│ Node.js App │◄──►│ PostgreSQL  │
│  Port: 80   │    │ Port: 5000  │    │ Port: 5432  │
│  Port: 443  │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                   ┌─────────────┐
                   │    Redis    │
                   │ Port: 6379  │
                   │ (Sessions)  │
                   └─────────────┘
```

## Health Monitoring

### Application Health Check
```bash
# Check application health
curl http://localhost:5000/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Container Health Status
```bash
# Check all container health
docker-compose ps

# Check specific container logs
docker-compose logs nutrition-app
```

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache app
```

#### API Key Issues
```bash
# Verify environment variables
docker-compose exec app env | grep API_KEY

# Test API connectivity
docker-compose exec app curl -s "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Database Connection Issues
```bash
# Check PostgreSQL health
docker-compose exec postgres pg_isready

# Test database connection
docker-compose exec app psql $DATABASE_URL -c "SELECT 1;"
```

### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :5000

# Kill conflicting processes
sudo fuser -k 5000/tcp
```

## Performance Optimization

### Memory Limits
Add to docker-compose.yml:
```yaml
services:
  app:
    mem_limit: 1g
    mem_reservation: 512m
```

### Build Optimization
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Multi-platform builds
docker buildx build --platform linux/amd64,linux/arm64 .
```

## Security Features

### Container Security
- Non-root user execution
- Multi-stage builds for minimal attack surface
- Health checks for monitoring
- Resource limits

### Network Security
- Internal Docker networks
- Rate limiting via Nginx
- Security headers configured

This setup provides a complete Docker solution that resolves the original vite.config.ts compatibility issues and provides both development and production environments.