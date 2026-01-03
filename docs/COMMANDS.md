# Canonical Commands

Quick reference for all development commands.

## Frontend (Mobile App)

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
# Interactive mode (choose platform)
npm start

# Direct platform launch
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web browser
```

### Type Checking
```bash
npm run typecheck
# or
npx tsc --noEmit
```

### Formatting
```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format
```

## Backend (Lambdas)

### Install Dependencies
```bash
cd backend && npm install
```

### Build
```bash
cd backend && sam build
# or from root
npm run backend:build
```

### Start Local API
```bash
# Full setup (first time)
./scripts/setup-local-backend.sh

# Start API only (after setup)
./scripts/start-api.sh
```

### Type Checking
```bash
cd backend && npx tsc --noEmit
```

## Testing

### Integration Tests
```bash
# Basic tests
./scripts/test-api.sh

# Full test suite
./scripts/test-full-api.sh
# or
npm run test:api
```

### Seed Database
```bash
node scripts/seed-database.js
```

## Docker Services

### Start Services
```bash
./scripts/setup-local-backend.sh
```

### Stop Services
```bash
docker stop dynamodb-local localstack
docker rm dynamodb-local localstack
```

### View Running Containers
```bash
docker ps
```

### Check DynamoDB Tables
```bash
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws dynamodb list-tables \
  --endpoint-url http://localhost:8000 \
  --region us-east-1 \
  --no-cli-pager
```

## Quick Reference

| Task | Command |
|------|---------|
| Start mobile app | `npm start` |
| Start backend | `./scripts/start-api.sh` |
| Build backend | `cd backend && sam build` |
| Run tests | `./scripts/test-full-api.sh` |
| Check types (FE) | `npx tsc --noEmit` |
| Check types (BE) | `cd backend && npx tsc --noEmit` |
| Format code | `npm run format` |
| Seed data | `node scripts/seed-database.js` |

## Environment Requirements

- Node.js >= 20.19.4
- Docker Desktop (for backend)
- AWS CLI v2
- AWS SAM CLI
- Expo Go app (for physical device)

