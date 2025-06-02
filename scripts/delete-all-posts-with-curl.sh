#!/bin/bash

# Configuration variables
EMAIL="admin@example.com"  # Use your admin credentials
PASSWORD="admin123"        # Use your admin password
API_BASE_URL="http://localhost:8888"  # Change this to your deployed URL if needed

# Color codes for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting blog post deletion via curl${NC}"
echo "------------------------------------"

# Step 1: Login to get auth token
echo -e "${BLUE}Step 1: Logging in to get auth token${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/.netlify/functions/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract the token from the response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get auth token. Response:${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo -e "${GREEN}Successfully logged in and got auth token${NC}"

# Step 2: List all blog posts
echo -e "\n${BLUE}Step 2: Fetching all blog posts${NC}"
POSTS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/.netlify/functions/blog" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Check if the response contains data
if ! echo $POSTS_RESPONSE | grep -q '"success":true'; then
  echo -e "${RED}Failed to get blog posts. Response:${NC}"
  echo $POSTS_RESPONSE
  exit 1
fi

# Extract post slugs from the response
POST_SLUGS=$(echo $POSTS_RESPONSE | grep -o '"slug":"[^"]*' | grep -o '[^"]*$')

if [ -z "$POST_SLUGS" ]; then
  echo -e "${GREEN}No blog posts found to delete.${NC}"
  exit 0
fi

# Count posts
POST_COUNT=$(echo "$POST_SLUGS" | wc -l)
echo -e "${GREEN}Found $POST_COUNT blog posts to delete${NC}"

# Step 3: Delete each blog post
echo -e "\n${BLUE}Step 3: Deleting all blog posts${NC}"
for SLUG in $POST_SLUGS; do
  echo -n "Deleting post with slug '$SLUG'... "
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE_URL/.netlify/functions/blog/$SLUG" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  if echo $DELETE_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}Success${NC}"
  else
    echo -e "${RED}Failed${NC}"
    echo $DELETE_RESPONSE
  fi
done

echo -e "\n${GREEN}Deletion process completed!${NC}"
