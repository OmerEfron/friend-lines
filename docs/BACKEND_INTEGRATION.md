# Backend Integration Guide

This document explains how to integrate the React Native frontend with the local serverless backend.

## Architecture Overview

The app now supports both mock data (for development without backend) and real API integration.

### Components

1. **API Configuration** (`src/config/api.ts`)
   - Configures base URL and endpoints
   - Provides helper function for API calls

2. **API Service** (`src/services/api.ts`)
   - Implements typed API calls for Users and Newsflashes
   - Handles request/response transformation

3. **Data Context** (`src/context/DataContext.tsx`)
   - Enhanced with `useApi` prop to toggle between mock and API data
   - Automatically loads data from API on mount when enabled
   - Provides `loading` and `error` states

## Usage

### Enable Backend Integration

In `App.js`, set `USE_API` to `true`:

```javascript
const USE_API = true; // Enable backend integration
```

### Environment Variables

Create a `.env` file in the project root:

```env
API_URL=http://localhost:3000
IS_LOCAL=true
AWS_REGION=us-east-1
```

### Start the Backend

```bash
# Terminal 1: Setup and start services
./scripts/setup-local-backend.sh

# Terminal 2: Start the API
cd backend
sam local start-api --docker-network friendlines-net

# Terminal 3: Test the API (optional)
./scripts/test-api.sh
```

### Start the Frontend

```bash
npm start
```

## API Endpoints

- `GET /users` - List all users
- `POST /users` - Create a user
- `GET /users/{id}` - Get user by ID
- `GET /newsflashes` - List all newsflashes
- `GET /newsflashes?userId={id}` - Filter by user
- `POST /newsflashes` - Create a newsflash

## Data Flow

```
User Action → DataContext → API Service → Backend Lambda → DynamoDB
                ↓
            Update State
                ↓
          Re-render UI
```

## Error Handling

The `DataContext` provides:
- `loading`: Boolean indicating if data is being fetched
- `error`: String with error message if request fails
- `refreshData()`: Function to manually reload data

## Development Workflow

1. **Mock Mode** (default): `USE_API = false`
   - Uses local mock data
   - No backend required
   - Fast iteration

2. **API Mode**: `USE_API = true`
   - Connects to local backend
   - Tests real API integration
   - Validates data flow

## Troubleshooting

### API Connection Failed

1. Check backend is running: `curl http://localhost:3000/users`
2. Verify Docker containers: `docker ps`
3. Check logs: `docker logs dynamodb-local` or `docker logs localstack`

### CORS Issues

The backend template includes CORS configuration. If issues persist:
- Check `template.yaml` CORS settings
- Restart SAM local API

### Data Not Loading

1. Check browser/app console for errors
2. Verify `USE_API` is set to `true`
3. Check network requests in dev tools
4. Ensure backend tables have data

