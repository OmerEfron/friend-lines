#!/bin/bash

# Comprehensive API Test Script for Friendlines Backend
# Tests all endpoints including authentication, users, newsflashes, groups, friendships, and feeds

set -e

API_URL="${API_URL:-http://localhost:3000}"
TEST_EMAIL="testuser_$(date +%s)@example.com"
TEST_USERNAME="testuser$(date +%s)"
TEST_PASSWORD="testpass123"
TOKEN=""
USER_ID=""

echo "========================================="
echo "Friendlines API Integration Tests"
echo "========================================="
echo "API URL: $API_URL"
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="${5:-200}"
  
  echo -n "Testing $name... "
  
  local headers=(-H "Content-Type: application/json")
  if [ -n "$TOKEN" ]; then
    headers+=(-H "Authorization: Bearer $TOKEN")
  fi
  
  local cmd=(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" "${headers[@]}")
  if [ -n "$data" ]; then
    cmd+=(-d "$data")
  fi
  
  response=$("${cmd[@]}")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo
    echo "$body"
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
    echo "$body"
    echo
    exit 1
  fi
}

# Step 1: Register a new user
echo "========================================="
echo "1. Authentication Tests"
echo "========================================="
echo

REGISTER_DATA="{\"name\":\"Test User\",\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
REGISTER_RESPONSE=$(test_endpoint "Register User" POST "/auth/register" "$REGISTER_DATA" 201)
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

echo "Created user ID: $USER_ID"
echo "Token: ${TOKEN:0:20}..."
echo

# Step 2: Login
LOGIN_DATA="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
test_endpoint "Login" POST "/auth/login" "$LOGIN_DATA" 200

# Step 3: Get current user
test_endpoint "Get Current User" GET "/auth/me" "" 200

# Step 4: Users endpoints
echo "========================================="
echo "2. Users Tests"
echo "========================================="
echo

test_endpoint "List Users" GET "/users" "" 200
test_endpoint "Get Specific User" GET "/users/$USER_ID" "" 200

# Step 5: Create newsflash
echo "========================================="
echo "3. Newsflashes Tests"
echo "========================================="
echo

NEWSFLASH_DATA="{\"headline\":\"Test Newsflash\",\"subHeadline\":\"This is a test\",\"userId\":\"$USER_ID\"}"
NEWSFLASH_RESPONSE=$(test_endpoint "Create Newsflash" POST "/newsflashes" "$NEWSFLASH_DATA" 201)
NEWSFLASH_ID=$(echo "$NEWSFLASH_RESPONSE" | jq -r '.newsflash.id')

test_endpoint "List Newsflashes" GET "/newsflashes" "" 200
test_endpoint "Get Specific Newsflash" GET "/newsflashes/$NEWSFLASH_ID" "" 200

# Step 6: Create a second user for friendship testing
echo "========================================="
echo "4. Friendships Tests"
echo "========================================="
echo

FRIEND_EMAIL="friend_$(date +%s)@example.com"
FRIEND_USERNAME="friend$(date +%s)"
FRIEND_DATA="{\"name\":\"Friend User\",\"username\":\"$FRIEND_USERNAME\",\"email\":\"$FRIEND_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
FRIEND_RESPONSE=$(test_endpoint "Register Friend User" POST "/auth/register" "$FRIEND_DATA" 201)
FRIEND_ID=$(echo "$FRIEND_RESPONSE" | jq -r '.user.id')

# Add friendship
ADD_FRIEND_DATA="{\"friendId\":\"$FRIEND_ID\"}"
test_endpoint "Add Friendship" POST "/friendships" "$ADD_FRIEND_DATA" 201

test_endpoint "List Friendships" GET "/friendships" "" 200
test_endpoint "List Friends with Details" GET "/friends" "" 200

# Step 7: Groups tests
echo "========================================="
echo "5. Groups Tests"
echo "========================================="
echo

GROUP_DATA="{\"name\":\"Test Group\",\"userIds\":[\"$USER_ID\",\"$FRIEND_ID\"]}"
GROUP_RESPONSE=$(test_endpoint "Create Group" POST "/groups" "$GROUP_DATA" 201)
GROUP_ID=$(echo "$GROUP_RESPONSE" | jq -r '.group.id')

test_endpoint "List Groups" GET "/groups" "" 200
test_endpoint "Get Specific Group" GET "/groups/$GROUP_ID" "" 200

# Step 8: Feeds tests
echo "========================================="
echo "6. Feeds Tests"
echo "========================================="
echo

test_endpoint "Get Main Feed" GET "/feeds/main" "" 200
test_endpoint "Get Group Feed" GET "/feeds/group/$GROUP_ID" "" 200

# Step 9: Cleanup - Delete group
echo "========================================="
echo "7. Cleanup"
echo "========================================="
echo

test_endpoint "Delete Group" DELETE "/groups/$GROUP_ID" "" 200
test_endpoint "Remove Friendship" DELETE "/friendships/$FRIEND_ID" "" 200

echo
echo "========================================="
echo -e "${GREEN}All tests passed! ✓${NC}"
echo "========================================="

