#!/bin/bash
# filepath: /Users/mehdinabhani/Downloads/project 2/scripts/seed-blog-posts.sh

# Configuration variables
API_BASE_URL="http://localhost:8888"  # Change this to your deployed URL if needed

# Color codes for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting blog post seeding process${NC}"
echo "------------------------------------"

# Run the Node.js seed script
echo -e "${BLUE}Running seed-blog-posts.js${NC}"
NODE_RESULT=$(node "/Users/mehdinabhani/Downloads/project 2/scripts/seed-blog-posts.js")

echo "$NODE_RESULT"
echo -e "\n${GREEN}Blog post seeding process completed!${NC}"
