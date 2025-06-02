#!/bin/bash

# Configuration variables
API_BASE_URL="http://localhost:8888"  # Change this to your deployed URL if needed

# Color codes for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting blog post deletion using direct Redis access${NC}"
echo "------------------------------------"

# Use the existing script to delete all blog posts
echo -e "${BLUE}Running manage-blog-posts.js with delete-all command${NC}"
NODE_RESULT=$(node "/Users/mehdinabhani/Downloads/project 2/scripts/manage-blog-posts.js" delete-all)

echo "$NODE_RESULT"
echo -e "\n${GREEN}Blog deletion process completed!${NC}"
