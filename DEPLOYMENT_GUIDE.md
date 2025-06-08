# Deployment Guide - Therapeutic Nutrition Web App

## Quick Start with Docker

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum, 8GB recommended
- 10GB free disk space

### 1. Environment Setup
```bash
# Clone or prepare your project directory
cp .env.example .env

# Edit .env file with your API keys
nano .env
```

### 2. Configure API Keys
Add these required API keys to your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
SESSION_SECRET=your_super_secret_session_key
```

### 3. Deploy Application
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy with automated script
./scripts/deploy.sh

# Or manually with docker-compose
docker-compose up -d --build
```

### 4. Access Application
- **Main Application**: http://localhost
- **Direct API**: http://localhost:5000
- **Health Check**: http://localhost/health

## Development Setup

### Local Development
```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Or run locally
npm install
npm run dev
```

### Available Services
- **Main App**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379 (optional)
- **Nginx**: localhost:80

## Production Deployment

### Docker Hub Deployment
```bash
# Build and push to Docker Hub
./scripts/build-and-push.sh v1.0.0

# Pull and run from registry
docker pull tarekt7/therapeutic-nutrition-app:latest
docker run -d -p 5000:5000 \
  -e OPENAI_API_KEY=your_key \
  -e GEMINI_API_KEY=your_key \
  -e PERPLEXITY_API_KEY=your_key \
  tarekt7/therapeutic-nutrition-app:latest
```

### Server Deployment
```bash
# On your server
git clone <your-repo>
cd therapeutic-nutrition-app

# Configure environment
cp .env.example .env
# Edit .env with your production values

# Deploy
./scripts/deploy.sh
```

## Configuration Options

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for food recognition |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `PERPLEXITY_API_KEY` | Yes | Perplexity API key for chatbot |
| `SESSION_SECRET` | Yes | Session encryption secret |
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Application port (default: 5000) |

### Database Configuration
```env
# PostgreSQL (for future implementation)
DATABASE_URL=postgresql://user:pass@postgres:5432/nutrition_app
PGHOST=postgres
PGPORT=5432
PGUSER=nutrition_user
PGPASSWORD=nutrition_password
PGDATABASE=nutrition_app
```

## Service Management

### Docker Compose Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update services
docker-compose pull && docker-compose up -d

# Clean up
docker-compose down -v
docker system prune -f
```

### Individual Service Management
```bash
# Restart specific service
docker-compose restart nutrition-app

# Scale services
docker-compose up -d --scale nutrition-app=2

# View service status
docker-compose ps
```

## Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl http://localhost/health

# API endpoint test
curl http://localhost/api/foods

# Database health (if PostgreSQL is used)
docker-compose exec postgres pg_isready
```

### Log Management
```bash
# View application logs
docker-compose logs nutrition-app

# View all service logs
docker-compose logs -f

# Log rotation (recommended for production)
# Add to your system's logrotate configuration
```

### Backup Procedures
```bash
# Backup PostgreSQL data
docker-compose exec postgres pg_dump -U nutrition_user nutrition_app > backup.sql

# Backup application data
docker cp nutrition-app:/app/data ./backup/

# Backup volumes
docker run --rm -v nutrition_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs nutrition-app

# Verify environment variables
docker-compose config

# Check port conflicts
netstat -tulpn | grep :5000
```

#### API Key Issues
```bash
# Verify environment variables are loaded
docker-compose exec nutrition-app env | grep API_KEY

# Test API connectivity
docker-compose exec nutrition-app curl -s "https://api.openai.com/v1/models" -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Test connection
docker-compose exec nutrition-app psql $DATABASE_URL -c "SELECT 1;"
```

### Performance Optimization

#### Memory Usage
```bash
# Monitor container memory
docker stats

# Limit container memory
# Add to docker-compose.yml:
# mem_limit: 1g
# mem_reservation: 512m
```

#### Disk Usage
```bash
# Check disk usage
docker system df

# Clean unused resources
docker system prune -f

# Remove old images
docker image prune -a
```

## Security Considerations

### Production Security
1. Change default passwords
2. Use strong session secrets
3. Enable HTTPS with SSL certificates
4. Configure firewall rules
5. Regular security updates

### SSL Configuration
```bash
# Generate self-signed certificate (for testing)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# Uncomment HTTPS section in nginx/nginx.conf
```

## Scaling & High Availability

### Horizontal Scaling
```yaml
# docker-compose.override.yml
services:
  nutrition-app:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
```

### Load Balancing
```bash
# Use nginx upstream configuration
# Already configured in nginx/nginx.conf

# Add more app instances
docker-compose up -d --scale nutrition-app=3
```

## Migration from Development

### Data Migration
```bash
# Export development data
docker-compose -f docker-compose.dev.yml exec postgres pg_dump > dev-backup.sql

# Import to production
docker-compose exec postgres psql -U nutrition_user -d nutrition_app < dev-backup.sql
```

### Configuration Migration
```bash
# Copy production environment
cp .env.development .env.production

# Update production-specific values
# - Change SECRET keys
# - Update API endpoints
# - Configure production database
```

This deployment guide provides comprehensive instructions for deploying the Therapeutic Nutrition Web App in various environments, from development to production.