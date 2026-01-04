# Friendlines Backend

Serverless backend using AWS SAM with Lambda, DynamoDB, and S3.

## Prerequisites

- Docker Desktop
- AWS CLI
- AWS SAM CLI
- Node.js 20+

## Quick Start

```bash
# Install dependencies
npm install

# From project root, start local backend
cd ..
./scripts/setup-local-backend.sh
```

This will:
- Start DynamoDB Local on port 8000
- Start LocalStack (S3) on port 4566
- Create all DynamoDB tables and S3 bucket
- Build the SAM application

Then start the API:

```bash
./scripts/start-api.sh
```

API available at `http://localhost:3000`

## Development

```bash
# Build after code changes
sam build

# Start API with env vars
sam local start-api --docker-network friendlines-net --env-vars env.json

# Run tests
../scripts/test-full-api.sh
```

## API Endpoints

See [API Documentation](../docs/API_DOCUMENTATION.md) for complete reference.

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Resources
- `/users` - User management
- `/newsflashes` - Newsflash CRUD
- `/friendships` - Friendship management
- `/friend-requests` - Friend request flow
- `/groups` - Group management
- `/feeds` - Main and group feeds
- `/bookmarks` - Bookmark management
- `/devices` - Push notification tokens
- `/uploads` - S3 presigned URLs

## Deployment

See [AWS Deployment Guide](../docs/AWS_DEPLOYMENT.md) for production deployment.

## Cleanup

```bash
docker stop dynamodb-local localstack
docker rm dynamodb-local localstack
docker network rm friendlines-net
```
