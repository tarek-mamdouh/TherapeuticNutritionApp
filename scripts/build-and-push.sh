#!/bin/bash

# Build and push Docker image to registry
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Default values
DOCKER_USERNAME=${DOCKER_USERNAME:-tarekt7}
DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME:-therapeutic-nutrition-app}
VERSION=${1:-latest}

echo -e "${GREEN}🔨 Building Docker image...${NC}"

# Build the image
docker build -t $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$VERSION .
docker build -t $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:latest .

echo -e "${GREEN}✅ Image built successfully${NC}"

# Login to Docker Hub
echo -e "${YELLOW}🔐 Logging into Docker Hub...${NC}"
echo "dckr_pat_IdNBykadvzhMViD54az19MHtDrg" | docker login -u $DOCKER_USERNAME --password-stdin

echo -e "${GREEN}🚀 Pushing image to registry...${NC}"

# Push the images
docker push $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$VERSION
docker push $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:latest

echo -e "${GREEN}✅ Image pushed successfully!${NC}"
echo -e "${GREEN}📦 Image: $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$VERSION${NC}"

# Clean up local images (optional)
read -p "Do you want to remove local images to save space? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker rmi $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:$VERSION
    docker rmi $DOCKER_USERNAME/$DOCKER_IMAGE_NAME:latest
    echo -e "${GREEN}🧹 Local images removed${NC}"
fi