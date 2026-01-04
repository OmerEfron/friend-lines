# Friendlines

A minimal social network mobile app with a news aesthetic. Share newsflashes with friends in a clean, headline-focused interface.

## Features

- **Authentication**: Register/login with JWT tokens
- **Main Feed**: View newsflashes from your friends, sorted by time
- **Groups**: Create personal groups to organize friends and view group-specific feeds
- **Friend Requests**: Send, accept, and reject friend requests
- **Profile**: Edit your profile, upload avatar, view your newsflashes
- **Bookmarks**: Save newsflashes for later (cloud-synced)
- **Push Notifications**: Get notified about new newsflashes and friend requests
- **Media Uploads**: Attach images to newsflashes via S3

## Tech Stack

### Frontend
- **React Native (Expo)**: Cross-platform mobile framework
- **TypeScript**: Type-safe development
- **React Navigation**: Tab + Stack navigation
- **React Native Paper**: Material Design 3 components

### Backend
- **AWS Lambda**: Serverless compute
- **AWS API Gateway**: REST API
- **AWS DynamoDB**: NoSQL database
- **AWS S3**: Media storage
- **AWS SAM**: Infrastructure as Code

## Quick Start

### Prerequisites
- Node.js >= 20
- Docker Desktop
- AWS SAM CLI
- Expo Go app (for physical device testing)

### Backend Setup

```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Start local infrastructure (DynamoDB, S3, SAM)
./scripts/setup-local-backend.sh
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npm start
```

### Running the App

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go for physical device

## Documentation

| Document | Description |
|----------|-------------|
| [API Documentation](docs/API_DOCUMENTATION.md) | Complete API reference |
| [Architecture](docs/ARCHITECTURE.md) | System architecture overview |
| [Local Development](docs/LOCAL_DEV.md) | Local setup guide |
| [AWS Deployment](docs/AWS_DEPLOYMENT.md) | Production deployment |
| [CI/CD](docs/CI_CD.md) | GitHub Actions pipeline |
| [Commands](docs/COMMANDS.md) | Quick command reference |
| [Push Notifications](docs/PUSH_NOTIFICATIONS.md) | Push notification setup |
| [Firebase Setup](docs/FIREBASE_SETUP.md) | Android FCM configuration |

## Project Structure

```
friendlines/
├── src/                    # React Native frontend
│   ├── components/         # Reusable UI components
│   ├── config/             # API configuration
│   ├── context/            # React contexts (Auth, Data, etc.)
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   ├── services/           # API service functions
│   ├── theme/              # Material Design theme
│   └── types/              # TypeScript definitions
├── backend/                # AWS SAM backend
│   ├── src/handlers/       # Lambda handlers
│   ├── src/utils/          # Shared utilities
│   └── template.yaml       # SAM template
├── scripts/                # Development scripts
└── docs/                   # Documentation
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `./scripts/setup-local-backend.sh` | Setup local backend infrastructure |
| `./scripts/start-api.sh` | Start SAM local API |
| `./scripts/test-full-api.sh` | Run API integration tests |
| `node scripts/seed-database.js` | Seed test data |

## License

Private project - All rights reserved
