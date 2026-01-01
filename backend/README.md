# Friendlines Backend

Local serverless backend using AWS SAM.

## Prerequisites

- Docker Desktop
- AWS CLI
- AWS SAM CLI
- Node.js 20+

## Quick Start

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start local backend (one command):
```bash
cd ..
./scripts/setup-local-backend.sh
```

This will:
- Start DynamoDB Local
- Start LocalStack (S3)
- Create tables and buckets
- Build the SAM application

3. Start the API (in a new terminal):
```bash
cd backend
sam local start-api --docker-network friendlines-net
```

4. Test the API (in another terminal):
```bash
./scripts/test-api.sh
```

## API Endpoints

- `GET /users` - List all users
- `POST /users` - Create a user
- `GET /users/{id}` - Get user by ID
- `GET /newsflashes` - List all newsflashes
- `GET /newsflashes?userId={id}` - List newsflashes by user
- `POST /newsflashes` - Create a newsflash

## Cleanup

```bash
docker stop dynamodb-local localstack
docker rm dynamodb-local localstack
docker network rm friendlines-net
```
