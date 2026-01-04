#!/bin/bash

set -e

echo "🚀 Starting Friendlines Local Backend Setup..."

# Configuration
DOCKER_NETWORK="friendlines-net"
DYNAMODB_PORT=8000
LOCALSTACK_PORT=4566
AWS_REGION="us-east-1"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Creating Docker network...${NC}"
if ! docker network inspect $DOCKER_NETWORK >/dev/null 2>&1; then
  docker network create $DOCKER_NETWORK
  echo -e "${GREEN}✓ Network created${NC}"
else
  echo -e "${GREEN}✓ Network already exists${NC}"
fi

echo -e "${YELLOW}Step 2: Starting DynamoDB Local...${NC}"
if ! docker ps | grep -q dynamodb-local; then
  docker run -d \
    --name dynamodb-local \
    --network $DOCKER_NETWORK \
    -p $DYNAMODB_PORT:8000 \
    amazon/dynamodb-local:latest \
    -jar DynamoDBLocal.jar -sharedDb
  echo -e "${GREEN}✓ DynamoDB Local started${NC}"
else
  echo -e "${GREEN}✓ DynamoDB Local already running${NC}"
fi

echo -e "${YELLOW}Step 3: Starting LocalStack (S3)...${NC}"
if ! docker ps | grep -q localstack; then
  docker run -d \
    --name localstack \
    --network $DOCKER_NETWORK \
    -p $LOCALSTACK_PORT:4566 \
    -e SERVICES=s3 \
    -e DEBUG=1 \
    -e DATA_DIR=/tmp/localstack/data \
    localstack/localstack:latest
  echo -e "${GREEN}✓ LocalStack started${NC}"
else
  echo -e "${GREEN}✓ LocalStack already running${NC}"
fi

echo -e "${YELLOW}Step 4: Waiting for services to be ready...${NC}"
sleep 5

# Check DynamoDB
until docker exec dynamodb-local curl -s http://localhost:8000 >/dev/null 2>&1; do
  echo "Waiting for DynamoDB..."
  sleep 2
done
echo -e "${GREEN}✓ DynamoDB is ready${NC}"

# Check LocalStack
until curl -s http://localhost:$LOCALSTACK_PORT/_localstack/health | grep -q "s3"; do
  echo "Waiting for LocalStack S3..."
  sleep 2
done
echo -e "${GREEN}✓ LocalStack is ready${NC}"

echo -e "${YELLOW}Step 5: Creating DynamoDB tables...${NC}"
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws dynamodb create-table \
  --table-name friendlines-users \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:$DYNAMODB_PORT \
  --region $AWS_REGION \
  --no-cli-pager \
  >/dev/null 2>&1 || echo "Users table already exists"

AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws dynamodb create-table \
  --table-name friendlines-newsflashes \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=userId-timestamp-index,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:$DYNAMODB_PORT \
  --region $AWS_REGION \
  --no-cli-pager \
  >/dev/null 2>&1 || echo "Newsflashes table already exists"

AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws dynamodb create-table \
  --table-name friendlines-groups \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:$DYNAMODB_PORT \
  --region $AWS_REGION \
  --no-cli-pager \
  >/dev/null 2>&1 || echo "Groups table already exists"

AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws dynamodb create-table \
  --table-name friendlines-friendships \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=friendId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=friendId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:$DYNAMODB_PORT \
  --region $AWS_REGION \
  --no-cli-pager \
  >/dev/null 2>&1 || echo "Friendships table already exists"

AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws dynamodb create-table \
  --table-name friendlines-bookmarks \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=newsflashId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=newsflashId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:$DYNAMODB_PORT \
  --region $AWS_REGION \
  --no-cli-pager \
  >/dev/null 2>&1 || echo "Bookmarks table already exists"

AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws dynamodb create-table \
  --table-name friendlines-device-tokens \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=deviceId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=deviceId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:$DYNAMODB_PORT \
  --region $AWS_REGION \
  --no-cli-pager \
  >/dev/null 2>&1 || echo "Device tokens table already exists"

echo -e "${GREEN}✓ DynamoDB tables created${NC}"

echo -e "${YELLOW}Step 6: Creating S3 bucket...${NC}"
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws s3 mb s3://friendlines-media-local \
  --endpoint-url http://localhost:$LOCALSTACK_PORT \
  --region $AWS_REGION \
  --no-cli-pager \
  >/dev/null 2>&1 || echo "S3 bucket already exists"
echo -e "${GREEN}✓ S3 bucket created${NC}"

echo -e "${YELLOW}Step 7: Building SAM application...${NC}"
cd backend
sam build
echo -e "${GREEN}✓ SAM application built${NC}"

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📍 Services running at:"
echo "   - DynamoDB: http://localhost:$DYNAMODB_PORT"
echo "   - LocalStack S3: http://localhost:$LOCALSTACK_PORT"
echo ""
echo "🎯 To start the API, run:"
echo "   cd backend && sam local start-api --docker-network $DOCKER_NETWORK"
echo ""
echo "🛑 To stop services:"
echo "   docker stop dynamodb-local localstack"
echo "   docker rm dynamodb-local localstack"

