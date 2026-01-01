#!/bin/bash

set -e

API_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Testing Friendlines API...${NC}"
echo ""

# Test 1: Create a user
echo -e "${YELLOW}Test 1: Creating a user...${NC}"
USER_RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg"
  }')

USER_ID=$(echo $USER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo -e "${RED}✗ Failed to create user${NC}"
  echo $USER_RESPONSE
  exit 1
else
  echo -e "${GREEN}✓ User created with ID: $USER_ID${NC}"
fi
echo ""

# Test 2: Get all users
echo -e "${YELLOW}Test 2: Getting all users...${NC}"
USERS_RESPONSE=$(curl -s "$API_URL/users")
USER_COUNT=$(echo $USERS_RESPONSE | grep -o '"id"' | wc -l)

if [ "$USER_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Found $USER_COUNT user(s)${NC}"
else
  echo -e "${RED}✗ No users found${NC}"
  exit 1
fi
echo ""

# Test 3: Get specific user
echo -e "${YELLOW}Test 3: Getting user by ID...${NC}"
USER_DETAIL=$(curl -s "$API_URL/users/$USER_ID")

if echo $USER_DETAIL | grep -q "$USER_ID"; then
  echo -e "${GREEN}✓ User retrieved successfully${NC}"
else
  echo -e "${RED}✗ Failed to retrieve user${NC}"
  exit 1
fi
echo ""

# Test 4: Create a newsflash
echo -e "${YELLOW}Test 4: Creating a newsflash...${NC}"
NEWSFLASH_RESPONSE=$(curl -s -X POST "$API_URL/newsflashes" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"headline\": \"My first post!\",
    \"subHeadline\": \"This is a test post\"
  }")

NEWSFLASH_ID=$(echo $NEWSFLASH_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$NEWSFLASH_ID" ]; then
  echo -e "${RED}✗ Failed to create newsflash${NC}"
  echo $NEWSFLASH_RESPONSE
  exit 1
else
  echo -e "${GREEN}✓ Newsflash created with ID: $NEWSFLASH_ID${NC}"
fi
echo ""

# Test 5: Get all newsflashes
echo -e "${YELLOW}Test 5: Getting all newsflashes...${NC}"
NEWSFLASHES_RESPONSE=$(curl -s "$API_URL/newsflashes")
NEWSFLASH_COUNT=$(echo $NEWSFLASHES_RESPONSE | grep -o '"id"' | wc -l)

if [ "$NEWSFLASH_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Found $NEWSFLASH_COUNT newsflash(es)${NC}"
else
  echo -e "${RED}✗ No newsflashes found${NC}"
  exit 1
fi
echo ""

# Test 6: Get newsflashes by userId
echo -e "${YELLOW}Test 6: Getting newsflashes by userId...${NC}"
USER_NEWSFLASHES=$(curl -s "$API_URL/newsflashes?userId=$USER_ID")

if echo $USER_NEWSFLASHES | grep -q "$NEWSFLASH_ID"; then
  echo -e "${GREEN}✓ User newsflashes retrieved successfully${NC}"
else
  echo -e "${RED}✗ Failed to retrieve user newsflashes${NC}"
  exit 1
fi
echo ""

echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Summary:"
echo "  - User ID: $USER_ID"
echo "  - Newsflash ID: $NEWSFLASH_ID"
echo "  - Total Users: $USER_COUNT"
echo "  - Total Newsflashes: $NEWSFLASH_COUNT"

