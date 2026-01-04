# Push Notifications

Push notifications for Friendlines using Expo's push notification service and AWS Lambda.

## Architecture

```
Mobile App (Expo) → AWS Lambda → Expo Push API
     ↓                  ↓
  Get Token      Store in DynamoDB
                 Send via Expo API
```

## Requirements

- **Physical Device**: Push notifications don't work in simulators/emulators
- **Development Build**: Expo SDK 54+ requires dev builds (not Expo Go)
- **EAS Project**: Must be configured with `eas init`

## Setup

### 1. EAS Configuration

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Initialize (get projectId)
eas init
```

Update `app.json` with your project ID:
```json
"extra": {
  "eas": {
    "projectId": "YOUR_PROJECT_ID"
  }
}
```

### 2. Create Development Build

```bash
# Android
eas build --platform android --profile development

# iOS  
eas build --platform ios --profile development
```

### 3. Configure Push Credentials

Run `eas credentials` for:
- **iOS**: APNs key (requires Apple Developer account)
- **Android**: FCM server key (requires Firebase project)

## Notification Types

### Newsflash Posted
Sent to all friends when user creates a newsflash.

### Friend Request Sent
Sent to recipient when they receive a friend request.

### Friend Request Accepted
Sent to initiator when their request is accepted.

## API Endpoints

### Register Device Token
```
POST /devices/token
Authorization: Bearer <token>
Body: {
  "deviceId": "device-unique-id",
  "expoPushToken": "ExponentPushToken[xxx]",
  "platform": "ios" | "android"
}
```

### Remove Device Token
```
DELETE /devices/token
Authorization: Bearer <token>
Body: {
  "deviceId": "device-unique-id"
}
```

## Database Schema

### friendlines-device-tokens
| Field | Type | Description |
|-------|------|-------------|
| userId | string (PK) | User ID |
| deviceId | string (SK) | Unique device identifier |
| expoPushToken | string | Expo push token |
| platform | string | "ios", "android", or "web" |
| updatedAt | string | ISO timestamp |

## Files

### Frontend
- `src/services/notifications.ts` - Push notification service
- `src/context/AuthContext.tsx` - Token registration on login/logout

### Backend
- `backend/src/utils/push.ts` - Expo Push API utility
- `backend/src/handlers/devices.ts` - Device token management
- `backend/src/handlers/newsflashes.ts` - Sends notifications on create
- `backend/src/handlers/friendships.ts` - Sends notifications on friend actions

