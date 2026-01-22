# Local Development Guide

## Prerequisites

### Frontend
- Node.js >= 20.19.4
- npm or yarn
- Expo Go app (for physical device testing)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

### Backend
- Docker Desktop (running)
- AWS CLI v2
- AWS SAM CLI
- Node.js 20+

## Frontend Setup

### 1. Install Dependencies

```bash
# From project root
npm install
```

### 2. Start Development Server

```bash
# Interactive mode (choose platform)
npm start

# Direct platform launch
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### 3. API Configuration

The frontend auto-detects the platform and uses:
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://localhost:3000`

To override, set `API_URL` environment variable.

**Source**: `src/config/api.ts`

## Backend Setup

### Option A: One-Command Setup

```bash
# From project root
./scripts/setup-local-backend.sh
```

This script:
1. Creates Docker network `friendlines-net`
2. Starts DynamoDB Local on port 8000
3. Starts LocalStack (S3) on port 4566
4. Creates all DynamoDB tables
5. Creates S3 bucket
6. Builds SAM application

### Option B: Manual Setup

#### 1. Create Docker Network

```bash
docker network create friendlines-net
```

#### 2. Start DynamoDB Local

```bash
docker run -d \
  --name dynamodb-local \
  --network friendlines-net \
  -p 8000:8000 \
  amazon/dynamodb-local:latest \
  -jar DynamoDBLocal.jar -sharedDb
```

#### 3. Start LocalStack (S3)

```bash
docker run -d \
  --name localstack \
  --network friendlines-net \
  -p 4566:4566 \
  -e SERVICES=s3 \
  localstack/localstack:latest
```

#### 4. Create DynamoDB Tables

```bash
# Users table
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws dynamodb create-table \
  --table-name friendlines-users \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 \
  --region us-east-1 --no-cli-pager

# Repeat for other tables (see setup-local-backend.sh)
```

#### 5. Build SAM Application

```bash
cd backend
npm install
sam build
```

### Starting the API

```bash
# From project root
./scripts/start-api.sh

# Or manually
cd backend
sam local start-api --docker-network friendlines-net --port 3000 --env-vars env.json
```

API will be available at `http://localhost:3000`

### Seeding Test Data

```bash
# After API is running
node scripts/seed-database.js
```

## Testing

### API Integration Tests

```bash
# Basic tests
./scripts/test-api.sh

# Comprehensive tests (auth, friendships, groups)
./scripts/test-full-api.sh
```

### TypeScript Check

```bash
# Frontend
npx tsc --noEmit

# Backend
cd backend && npx tsc --noEmit
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| SAM Local API | 3000 | http://localhost:3000 |
| DynamoDB Local | 8000 | http://localhost:8000 |
| LocalStack (S3) | 4566 | http://localhost:4566 |
| Expo Dev Server | 8081 | http://localhost:8081 |

## Stopping Services

```bash
# Stop containers
docker stop dynamodb-local localstack

# Remove containers
docker rm dynamodb-local localstack

# Remove network (optional)
docker network rm friendlines-net
```

## Common Troubleshooting

### "Connection refused" from mobile app

1. Ensure SAM API is running on port 3000
2. For Android emulator, use `10.0.2.2:3000` (auto-configured)
3. For physical device, use your machine's local IP

### "Table does not exist" errors

1. Check DynamoDB is running: `docker ps | grep dynamodb`
2. Re-run table creation from `setup-local-backend.sh`
3. Verify tables: `aws dynamodb list-tables --endpoint-url http://localhost:8000`

### SAM build fails

1. Ensure Docker is running
2. Check `backend/package.json` dependencies are installed
3. Run `sam build --debug` for detailed errors

### "ECONNREFUSED" in Lambda

1. Lambdas run in Docker containers on `friendlines-net`
2. Use `dynamodb-local` hostname (not localhost) in Lambda code
3. Verify: `docker network inspect friendlines-net`

### Token/Auth issues

1. JWT_SECRET must match between env.json functions
2. Check AsyncStorage isn't corrupted (clear app data)
3. Verify token format: `Bearer <token>`

## Environment Files

| File | Purpose |
|------|---------|
| `backend/env.json` | Lambda environment variables |
| `backend/template.yaml` | SAM template with defaults |
| `src/config/api.ts` | Frontend API configuration |

**Note**: `env.json` contains local dev secrets only. Never commit production secrets.


